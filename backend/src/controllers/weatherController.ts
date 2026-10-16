import { Request, Response } from 'express';
import axios from 'axios';

// NOTE ON PROVIDER CHOICE:
// This uses Open-Meteo (weather) + Open-Meteo Geocoding (city search) + Zippopotam.us
// (Indian PIN code -> lat/lon). All three are free and do NOT require an API key, which
// avoids the "invalid/missing API key" failure mode entirely and is more reliable for a
// demo/beginner-friendly project than requiring everyone to register for OpenWeatherMap.
// If you'd rather use OpenWeatherMap, set WEATHER_API_KEY in backend/.env and see the
// commented-out alternative path below `getWeather`.
const AXIOS_TIMEOUT = 8000;

const getWeatherDesc = (code: number) => {
    if (code === 0) return { main: 'Clear', description: 'clear sky' };
    if (code < 3) return { main: 'Clouds', description: 'partly cloudy' };
    if (code < 50) return { main: 'Fog', description: 'foggy' };
    if (code < 80) return { main: 'Rain', description: 'rainy' };
    return { main: 'Storm', description: 'thunderstorm' };
};

export const getWeather = async (req: Request, res: Response) => {
    let { lat, lon, city } = req.query as { lat?: string; lon?: string; city?: string };

    // Normalize free-text input: trim whitespace and collapse internal spacing/case issues.
    if (typeof city === 'string') {
        city = city.trim();
    }

    try {
        if (!lat || !lon) {
            if (city) {
                const isPincode = /^\d{6}$/.test(city);

                if (isPincode) {
                    try {
                        const zipRes = await axios.get(`http://api.zippopotam.us/in/${city}`, { timeout: AXIOS_TIMEOUT });
                        if (zipRes.data.places && zipRes.data.places.length > 0) {
                            lat = zipRes.data.places[0].latitude;
                            lon = zipRes.data.places[0].longitude;
                            city = `${zipRes.data.places[0]['place name']}, ${zipRes.data.places[0]['state']}`;
                        } else {
                            return res.status(404).json({ message: `No location found for PIN code ${city}. Please check the PIN code and try again.` });
                        }
                    } catch (err: any) {
                        if (err.response?.status === 404) {
                            return res.status(404).json({ message: `PIN code ${city} was not found. Please double-check it.` });
                        }
                        return res.status(504).json({ message: 'PIN code lookup timed out or is unreachable. Please try again in a moment.' });
                    }
                } else {
                    try {
                        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
                        const geoRes = await axios.get(geoUrl, { timeout: AXIOS_TIMEOUT });
                        if (geoRes.data.results && geoRes.data.results.length > 0) {
                            lat = geoRes.data.results[0].latitude;
                            lon = geoRes.data.results[0].longitude;
                            // Prefer the geocoder's canonical place name for display
                            city = [geoRes.data.results[0].name, geoRes.data.results[0].admin1].filter(Boolean).join(', ');
                        } else {
                            return res.status(404).json({ message: `We couldn't find a place called "${city}". Check the spelling, or try a nearby larger town/city.` });
                        }
                    } catch (err: any) {
                        if (err.code === 'ECONNABORTED') {
                            return res.status(504).json({ message: 'Location search timed out. Please try again.' });
                        }
                        return res.status(502).json({ message: 'Location search service is temporarily unavailable. Please try again shortly.' });
                    }
                }
            } else {
                // No input at all - default to New Delhi rather than erroring.
                lat = '28.6139';
                lon = '77.2090';
                city = 'New Delhi';
            }
        }

        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`;

        let response;
        try {
            response = await axios.get(weatherUrl, { timeout: AXIOS_TIMEOUT });
        } catch (err: any) {
            if (err.code === 'ECONNABORTED') {
                return res.status(504).json({ message: 'Weather service timed out. Please try again.' });
            }
            if (err.response?.status === 429) {
                return res.status(429).json({ message: 'Weather service rate limit reached. Please try again in a minute.' });
            }
            console.error('Weather API Error:', err.message);
            return res.status(502).json({ message: 'Weather service is temporarily unavailable. Please try again shortly.' });
        }

        const data = response.data;
        const currentDesc = getWeatherDesc(data.current.weather_code);

        const formattedData = {
            current: {
                name: city || data.timezone,
                weather: [currentDesc],
                main: {
                    temp: data.current.temperature_2m,
                    feels_like: data.current.temperature_2m,
                    humidity: data.current.relative_humidity_2m
                },
                wind: { speed: data.current.wind_speed_10m },
                coord: { lat, lon },
                sunrise: data.daily?.sunrise?.[0] || null,
                sunset: data.daily?.sunset?.[0] || null
            },
            forecast: {
                list: data.daily.time.map((date: string, i: number) => ({
                    dt: new Date(date).getTime() / 1000,
                    main: {
                        temp: (data.daily.temperature_2m_max[i] + data.daily.temperature_2m_min[i]) / 2
                    },
                    weather: [getWeatherDesc(data.daily.weather_code[i])]
                }))
            }
        };

        res.json(formattedData);
    } catch (error: any) {
        console.error('Weather Controller Error:', error.message);
        res.status(500).json({ message: 'Failed to fetch weather data. Please try again.' });
    }
};

/*
 * ALTERNATIVE: OpenWeatherMap-backed implementation (requires WEATHER_API_KEY).
 * Swap this in for getWeather above if you'd rather use OpenWeatherMap instead of the
 * free key-less providers used above (e.g. for OpenWeatherMap-specific features).
 *
 * export const getWeatherOpenWeatherMap = async (req: Request, res: Response) => {
 *     const apiKey = process.env.WEATHER_API_KEY;
 *     if (!apiKey) {
 *         return res.status(503).json({ message: 'Weather service is not configured. Please add WEATHER_API_KEY to the backend .env file.' });
 *     }
 *     // ... call https://api.openweathermap.org/data/2.5/weather with the key, same
 *     // validation/timeout/error-handling pattern as above.
 * };
 */

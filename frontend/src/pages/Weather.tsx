import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Cloud, Droplets, Wind, Thermometer, Search, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { API_BASE } from '../config';

const Weather: React.FC = () => {
    const { t, i18n } = useTranslation();
    const locale = i18n.language.startsWith('ta') ? 'ta-IN' : 'en-IN';
    const [weather, setWeather] = useState<any>(null);
    const [city, setCity] = useState('New Delhi');
    const [inputCity, setInputCity] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchWeather = async () => {
        setWeather(null);
        setLoading(true);
        setError('');
        try {
            const token = JSON.parse(localStorage.getItem('userInfo') || '{}').token;
            const queryCity = city || 'New Delhi';
            const { data } = await axios.get(`${API_BASE}/api/weather?city=${queryCity}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWeather(data);
        } catch (error: any) {
            console.error(error);
            setError(error.response?.data?.message || t('weatherError'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWeather();
    }, [city]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputCity.trim()) {
            setCity(inputCity.trim());
        }
    };

    return (
        <Layout title={t('weather', 'Weather Forecast')} subtitle="Satellite telemetry & Open-Meteo precision forecasting">
            <div className="space-y-6">
                {/* Search Bar Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-3xl border border-emerald-500/15 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 p-5 px-6 shadow-md backdrop-blur-xl">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5 font-display">
                        🌦️ {t('weather', 'Weather Forecast')}
                    </h1>
                    <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-72">
                            <input
                                className="w-full px-4 py-2.5 pl-10 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm shadow-sm"
                                placeholder={t('searchCityPincode')}
                                value={inputCity}
                                onChange={(e) => setInputCity(e.target.value)}
                            />
                            <Search size={16} className="absolute left-3.5 top-3 text-gray-400" />
                        </div>
                        <button
                            type="submit"
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-emerald-600/20 text-sm transition-all hover:scale-105 active:scale-95"
                        >
                            {t('search')}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setInputCity(''); setCity('New Delhi'); }}
                            title="Reset location"
                            className="p-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            <RotateCcw size={16} />
                        </button>
                    </form>
                </div>

                {loading && (
                    <div className="flex flex-col justify-center items-center h-64 rounded-3xl border border-emerald-500/10 dark:border-white/5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-4 font-medium">Fetching satellite radar data...</span>
                    </div>
                )}

                {error && (
                    <div className="bg-rose-500/15 text-rose-700 dark:text-rose-300 p-4 rounded-2xl border border-rose-500/30 flex items-center justify-between shadow-sm">
                        <span className="text-sm font-semibold">{error}</span>
                        <button onClick={fetchWeather} className="text-xs underline hover:text-rose-800 dark:hover:text-rose-100 font-bold">
                            {t('tryAgain')}
                        </button>
                    </div>
                )}

                {!loading && !error && weather && weather.current && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        {/* Hero Weather Card */}
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700 p-8 sm:p-10 text-white shadow-2xl shadow-blue-500/20">
                            <div className="absolute top-0 right-0 p-6 opacity-15 pointer-events-none">
                                <Cloud size={240} />
                            </div>

                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div>
                                    <div className="inline-flex items-center gap-2 rounded-full bg-white/20 border border-white/30 px-3 py-1 text-xs font-semibold backdrop-blur-md mb-3">
                                        <span>Current Atmosphere</span>
                                    </div>
                                    <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-display">
                                        {weather.current.name}
                                    </h2>
                                    <p className="text-blue-100 text-lg capitalize flex items-center gap-2 mt-1.5 font-medium">
                                        {weather.current.weather[0].main === 'Clear' ? '☀️' :
                                            weather.current.weather[0].main === 'Not Found' ? '❓' : '☁️'}
                                        {t(`weatherDesc_${weather.current.weather[0].description}`, { defaultValue: weather.current.weather[0].description })}
                                    </p>

                                    <div className="mt-6 flex flex-wrap gap-3">
                                        <div className="flex items-center gap-2 bg-white/15 border border-white/20 px-4 py-2 rounded-xl backdrop-blur-md text-xs font-semibold">
                                            <Thermometer size={16} className="text-amber-300" />
                                            <span>{t('feelsLike')}: {Math.round(weather.current.main.feels_like)}°C</span>
                                        </div>
                                        <div className="flex items-center gap-2 bg-white/15 border border-white/20 px-4 py-2 rounded-xl backdrop-blur-md text-xs font-semibold">
                                            <Droplets size={16} className="text-cyan-300" />
                                            <span>{t('humidity')}: {weather.current.main.humidity}%</span>
                                        </div>
                                        <div className="flex items-center gap-2 bg-white/15 border border-white/20 px-4 py-2 rounded-xl backdrop-blur-md text-xs font-semibold">
                                            <Wind size={16} className="text-teal-300" />
                                            <span>{t('windSpeed')}: {weather.current.wind.speed} m/s</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-left md:text-right">
                                    <span className="text-6xl sm:text-8xl font-black tracking-tighter font-display">
                                        {Math.round(weather.current.main.temp)}°
                                    </span>
                                    <div className="text-blue-100/90 text-xs mt-1 font-mono">
                                        {t('latitude')}: {weather.current.coord.lat}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 5-Day Forecast Grid */}
                        <div className="rounded-3xl border border-emerald-500/15 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 p-6 shadow-md backdrop-blur-xl">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2 font-display">
                                <Cloud size={20} className="text-emerald-500" />
                                {t('fiveDayForecast')}
                            </h3>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                {weather.forecast.list
                                    .filter((item: any) => new Date(item.dt * 1000).toDateString() !== new Date().toDateString())
                                    .slice(0, 5)
                                    .map((item: any) => (
                                        <div
                                            key={item.dt}
                                            className="rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/70 dark:bg-slate-800/50 p-4 text-center transition-all hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-lg"
                                        >
                                            <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold mb-2">
                                                {new Date(item.dt * 1000).toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </p>
                                            <div className="my-3 text-cyan-500 dark:text-cyan-400 flex justify-center">
                                                <Cloud size={30} />
                                            </div>
                                            <p className="font-extrabold text-xl text-gray-900 dark:text-white font-display">
                                                {Math.round(item.main.temp)}°C
                                            </p>
                                            <p className="text-[11px] text-gray-500 dark:text-gray-400 capitalize mt-1 truncate">
                                                {t(`weatherDesc_${item.weather[0].description}`, { defaultValue: item.weather[0].description })}
                                            </p>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Weather;

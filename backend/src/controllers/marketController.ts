import { Request, Response } from 'express';

// NOTE ON DATA SOURCE:
// This endpoint currently generates realistic, randomized demo prices rather than calling a
// live mandi price feed. India's official mandi price data (Agmarknet / data.gov.in "Variety-wise
// Daily Market Prices Data of Commodity") requires a registered API key from data.gov.in, which
// isn't available in this environment. The response is explicitly flagged `isDemo: true` and the
// frontend must show this clearly rather than presenting these numbers as real live prices.
// To go live: register at https://data.gov.in/user/register, request an API key for the mandi
// price dataset, put it in MARKET_API_KEY (see backend/.env.example), and replace the generator
// below with a fetch to that API - keeping the same response shape so the frontend needs no changes.

// Helper to simulate live price fluctuation
const fluctuatePrice = (basePrice: number) => {
    const variation = basePrice * (Math.random() * 0.04 - 0.02); // +/- 2%
    return Math.floor(basePrice + variation);
};

export const getMarketPrices = async (req: Request, res: Response) => {
    const { commodity, state, district, market } = req.query;

    try {
        // Define Major Districts and Standard Commodities for dense data generation
        const districts = [
            { name: 'Chennai', market: 'Koyambedu' },
            { name: 'Coimbatore', market: 'TK Market' },
            { name: 'Madurai', market: 'Mattuthavani' },
            { name: 'Trichy', market: 'Gandhi Market' },
            { name: 'Salem', market: 'Leigh Bazaar' },
            { name: 'Thanjavur', market: 'Thanjavur Regulated Market' },
            { name: 'Erode', market: 'Nethaji Market' },
            { name: 'Tirunelveli', market: 'Nainar Kulam' },
            { name: 'Vellore', market: 'Netaaji Market' },
            { name: 'Dindigul', market: 'Dindigul Mundy' },
            { name: 'Dharmapuri', market: 'Palacode' },
            { name: 'Krishnagiri', market: 'Rayakottai' },
            { name: 'Theni', market: 'Cumbum' },
            { name: 'Kanyakumari', market: 'Vadasery' }
        ];

        const commodities = [
            { name: 'Rice (Ponni)', min: 4200, max: 4800, modal: 4500 },
            { name: 'Rice (Idly)', min: 3200, max: 3600, modal: 3400 },
            { name: 'Tomato', min: 1400, max: 2200, modal: 1800 },
            { name: 'Onion (Big)', min: 3000, max: 4000, modal: 3500 },
            { name: 'Onion (Small)', min: 4500, max: 6000, modal: 5000 },
            { name: 'Potato', min: 2000, max: 2800, modal: 2400 },
            { name: 'Brinjal', min: 1800, max: 2500, modal: 2200 },
            { name: 'Lady Finger', min: 2500, max: 3200, modal: 2800 },
            { name: 'Coconut', min: 2500, max: 3000, modal: 2700 },
            { name: 'Banana (Robusta)', min: 1200, max: 1800, modal: 1500 },
            { name: 'Banana (Poovan)', min: 1800, max: 2400, modal: 2100 },
            { name: 'Turmeric', min: 7800, max: 8800, modal: 8200 },
            { name: 'Cotton', min: 5800, max: 6500, modal: 6200 }
        ];

        // Generate Grid Data (All Crops for All Districts)
        let results: any[] = [];

        districts.forEach(d => {
            commodities.forEach(c => {
                // Add slight regional variation to make it look realistic
                const regionalFactor = 1 + (Math.random() * 0.1 - 0.05); // +/- 5% regional difference
                const localMin = Math.floor(c.min * regionalFactor);
                const localMax = Math.floor(c.max * regionalFactor);
                const localModal = Math.floor(c.modal * regionalFactor);

                const currentModal = fluctuatePrice(localModal);

                results.push({
                    _id: `${d.name}-${c.name}`.replace(/\s+/g, '-').toLowerCase() + Math.floor(Math.random() * 1000),
                    state: 'Tamil Nadu',
                    district: d.name,
                    market: d.market,
                    commodity: c.name,
                    minPrice: fluctuatePrice(localMin),
                    maxPrice: fluctuatePrice(localMax),
                    modalPrice: currentModal,
                    trend: currentModal > localModal ? 'up' : 'down',
                    date: new Date(),
                    isDemo: true
                });
            });
        });

        if (commodity) {
            results = results.filter(r => r.commodity.toLowerCase().includes((commodity as string).toLowerCase()));
        }
        if (district) {
            results = results.filter(r => r.district.toLowerCase().includes((district as string).toLowerCase()));
        }

        res.json({
            isDemo: true,
            note: 'Demo Market Data: simulated prices for demonstration purposes, not live mandi figures. See MARKET_API_KEY in backend/.env.example to connect a real data source.',
            results
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Seed functionality (Deprecated in favor of live-simulated getMarketPrices, but kept for compatibility)
export const seedMarketData = async (req: Request, res: Response) => {
    res.json({ message: 'Seeding not required with live simulation engine.' });
};

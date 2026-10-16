import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Search, TrendingUp, TrendingDown, Filter } from 'lucide-react';
import { API_BASE } from '../config';
import { useTranslation } from 'react-i18next';

const MarketPrices = () => {
    const { t, i18n } = useTranslation();
    const locale = i18n.language.startsWith('ta') ? 'ta-IN' : 'en-IN';
    const [prices, setPrices] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        district: '',
        commodity: '',
        market: ''
    });

    const districts = [
        "Chennai", "Coimbatore", "Madurai", "Trichy", "Salem",
        "Erode", "Tirunelveli", "Thanjavur", "Dindigul", "Vellore",
        "Dharmapuri", "Krishnagiri", "Theni", "Kanyakumari"
    ];
    const districtTranslations: Record<string, string> = Object.fromEntries(
        districts.map(district => [district, `district_${district}`])
    );

    const commodityTranslations: Record<string, string> = {
        'Rice (Ponni)': 'ricePonni',
        'Rice (Idly)': 'riceIdly',
        Tomato: 'tomato',
        'Onion (Big)': 'onionBig',
        'Onion (Small)': 'onionSmall',
        Potato: 'potato',
        Brinjal: 'brinjal',
        'Lady Finger': 'ladyFinger',
        Coconut: 'coconut',
        'Banana (Robusta)': 'bananaRobusta',
        'Banana (Poovan)': 'bananaPoovan',
        Turmeric: 'turmeric',
        Cotton: 'cotton'
    };
    const marketTranslations: Record<string, string> = {
        Koyambedu: 'market_Koyambedu',
        'TK Market': 'market_TKMarket',
        Mattuthavani: 'market_Mattuthavani',
        'Gandhi Market': 'market_GandhiMarket',
        'Leigh Bazaar': 'market_LeighBazaar',
        'Thanjavur Regulated Market': 'market_ThanjavurRegulatedMarket',
        'Nethaji Market': 'market_NethajiMarket',
        'Nainar Kulam': 'market_NainarKulam',
        'Netaaji Market': 'market_NetaajiMarket',
        'Dindigul Mundy': 'market_DindigulMundy',
        Palacode: 'market_Palacode',
        Rayakottai: 'market_Rayakottai',
        Cumbum: 'market_Cumbum',
        Vadasery: 'market_Vadasery'
    };

    const getCommodityQuery = (query: string) => {
        const normalizedQuery = query.trim().toLocaleLowerCase();
        if (!normalizedQuery) return query;

        const matches = Object.entries(commodityTranslations).filter(([, key]) =>
            t(key).toLocaleLowerCase().includes(normalizedQuery)
        );
        if (matches.length === 1) return matches[0][0];
        if (matches.length > 1) {
            const commonPrefix = matches
                .map(([commodity]) => commodity)
                .reduce((prefix, commodity) => {
                    let index = 0;
                    while (
                        index < prefix.length &&
                        index < commodity.length &&
                        prefix[index].toLocaleLowerCase() === commodity[index].toLocaleLowerCase()
                    ) {
                        index += 1;
                    }
                    return prefix.slice(0, index);
                });
            return commonPrefix.replace(/[\s(]+$/, '') || query;
        }
        return query;
    };

    const formatPrice = (price: number | string | undefined) => {
        if (price === undefined || price === null || price === '') return '—';
        const numericPrice = Number(price);
        return Number.isFinite(numericPrice)
            ? `₹${numericPrice.toLocaleString(locale)}`
            : `₹${price}`;
    };

    const fetchPrices = async () => {
        setLoading(true);
        try {
            const token = JSON.parse(localStorage.getItem('userInfo') || '{}').token;
            const params = new URLSearchParams();
            if (filters.district) params.append('district', filters.district);
            if (filters.commodity) params.append('commodity', getCommodityQuery(filters.commodity));
            if (filters.market) params.append('market', filters.market);

            const { data } = await axios.get(`${API_BASE}/api/market?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPrices(data.results || data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrices();
        const interval = setInterval(() => {
            const refresh = async () => {
                try {
                    const token = JSON.parse(localStorage.getItem('userInfo') || '{}').token;
                    const params = new URLSearchParams();
                    if (filters.district) params.append('district', filters.district);
                    if (filters.commodity) params.append('commodity', getCommodityQuery(filters.commodity));

                    const { data } = await axios.get(`${API_BASE}/api/market?${params.toString()}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setPrices(data.results || data);
                } catch (e) { console.error(e) }
            };
            refresh();
        }, 5000);

        return () => clearInterval(interval);
    }, [filters.district, filters.commodity]);

    return (
        <Layout title={t('market', 'Market Prices')} subtitle={t('marketPricesSubtitle')}>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 rounded-3xl border border-emerald-500/15 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 p-6 shadow-md backdrop-blur-xl">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2.5 font-display">
                            <TrendingUp className="text-emerald-500" /> {t('tnMarketIntelligence')}
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">{t('marketPricesSubtitle')}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="rounded-3xl border border-emerald-500/15 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 p-6 shadow-md backdrop-blur-xl">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2 relative">
                            <Search className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                            <input
                                placeholder={t('searchCommodity')}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm shadow-sm"
                                value={filters.commodity}
                                onChange={e => setFilters({ ...filters, commodity: e.target.value })}
                            />
                        </div>

                        <div className="relative">
                            <Filter className="absolute left-3.5 top-3.5 text-gray-400 pointer-events-none" size={18} />
                            <select
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm shadow-sm appearance-none cursor-pointer"
                                value={filters.district}
                                onChange={e => setFilters({ ...filters, district: e.target.value })}
                            >
                                <option value="">{t('allDistricts')}</option>
                                {districts.map(d => <option key={d} value={d}>{t(districtTranslations[d])}</option>)}
                            </select>
                        </div>

                        <button
                            onClick={fetchPrices}
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-600/25 transition-all text-sm hover:scale-105 active:scale-95"
                        >
                            {t('searchMarkets')}
                        </button>
                    </div>
                </div>

                {/* Market Prices Table */}
                <div className="rounded-3xl border border-emerald-500/15 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 shadow-md backdrop-blur-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-white/10 text-gray-400 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider bg-gray-50/70 dark:bg-slate-800/50">
                                    <th className="p-4">{t('commodity')}</th>
                                    <th className="p-4">{t('districtMarket')}</th>
                                    <th className="p-4">{t('minPrice')}</th>
                                    <th className="p-4">{t('maxPrice')}</th>
                                    <th className="p-4">{t('modalPrice')}</th>
                                    <th className="p-4">{t('trend')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-sm">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="text-center p-8 text-gray-400 dark:text-gray-500">{t('loadingMarketPrices')}</td>
                                    </tr>
                                ) : prices.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center p-8 text-gray-400 dark:text-gray-500">{t('noMarketPrices')}</td>
                                    </tr>
                                ) : (
                                    prices.map((item: any, index: number) => (
                                        <tr key={index} className="hover:bg-emerald-500/5 transition-colors">
                                            <td className="p-4 font-bold text-gray-900 dark:text-white">
                                                <div className="flex items-center gap-2">
                                                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                                    {commodityTranslations[item.commodity] ? t(commodityTranslations[item.commodity]) : item.commodity}
                                                </div>
                                                {item.updatedAt && (
                                                    <span className="block text-[11px] font-normal text-gray-400 dark:text-gray-500 ml-4">
                                                        {new Date(item.updatedAt).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-gray-600 dark:text-gray-300">
                                                <div className="font-semibold text-gray-800 dark:text-gray-200">{t(districtTranslations[item.district] || item.district)}</div>
                                                <div className="text-xs text-gray-400">{t(marketTranslations[item.market] || item.market)}</div>
                                            </td>
                                            <td className="p-4 text-gray-500 dark:text-gray-400 font-mono">{formatPrice(item.minPrice ?? item.min_price)}</td>
                                            <td className="p-4 text-gray-500 dark:text-gray-400 font-mono">{formatPrice(item.maxPrice ?? item.max_price)}</td>
                                            <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400 font-mono text-base">{formatPrice(item.modalPrice ?? item.modal_price)}</td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                                                    item.trend === 'Up'
                                                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                                        : item.trend === 'Down'
                                                        ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                                                        : 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30'
                                                }`}>
                                                    {item.trend === 'Up' ? <TrendingUp size={13} /> : item.trend === 'Down' ? <TrendingDown size={13} /> : null}
                                                    {item.trend === 'Up' ? t('up') : item.trend === 'Down' ? t('down') : t('stable')}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default MarketPrices;

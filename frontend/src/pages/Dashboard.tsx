import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
    Droplets,
    Thermometer,
    Wind,
    Activity,
    Clock,
    AlertTriangle,
    CloudRain,
    Gauge,
    Leaf,
    Sprout,
    TrendingUp,
    TrendingDown,
    IndianRupee,
    Calculator,
    ShieldCheck,
    Languages,
    ArrowRight
} from 'lucide-react';

import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';
import FarmCard from '../components/FarmCard';
import ReportModal from '../components/ReportModal';
import Layout from '../components/Layout';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config';


const randWalk = (value: number, min: number, max: number, step: number) => {
    const next = value + (Math.random() - 0.5) * step;
    return Math.max(min, Math.min(max, Number(next.toFixed(1))));
};

const DEMO_CROPS = ['Tomato', 'Paddy (Rice)', 'Sugarcane', 'Cotton'];
const DEMO_STAGES = ['Vegetative Growth', 'Flowering', 'Fruiting', 'Maturity'];
const DEMO_STAGE_KEYS: Record<string, string> = {
    'Vegetative Growth': 'vegetativeGrowth',
    Flowering: 'flowering',
    Fruiting: 'fruiting',
    Maturity: 'maturity'
};
const DEMO_CROP_KEYS: Record<string, string> = {
    Tomato: 'tomato',
    'Paddy (Rice)': 'paddyRice',
    Sugarcane: 'sugarcane',
    Cotton: 'cotton'
};
const DEMO_ACTIVITY_KEYS = [
    'activityIrrigation',
    'activitySoilSensor',
    'activityWeatherChecked',
    'activityCropHealth',
    'activityFertilizer',
    'activityMarketPrice'
];

const cropSaleData = [
    { crop: 'Rice', quantity: '420 qtl', sellPrice: 2140, harvestDate: '2026-10-20', status: 'Sold' },
    { crop: 'Tomato', quantity: '180 qtl', sellPrice: 1860, harvestDate: '2026-10-18', status: 'Sold' },
    { crop: 'Cotton', quantity: '260 qtl', sellPrice: 2980, harvestDate: '2026-10-25', status: 'Pending' },
    { crop: 'Groundnut', quantity: '150 qtl', sellPrice: 2450, harvestDate: '2026-10-15', status: 'Sold' },
    { crop: 'Sugarcane', quantity: '390 qtl', sellPrice: 3020, harvestDate: '2026-10-30', status: 'Scheduled' }
];
const CROP_KEYS: Record<string, string> = {
    Rice: 'rice',
    Tomato: 'tomato',
    Cotton: 'cotton',
    Groundnut: 'groundnut',
    Sugarcane: 'sugarcane'
};

const formatCurrency = (value: number, locale: string) => new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
}).format(value);

const Dashboard = () => {
    const { t, i18n } = useTranslation();
    const locale = i18n.language.startsWith('ta') ? 'ta-IN' : 'en-IN';
    const [farms, setFarms] = useState<any[]>([]);
    const [activeFarm, setActiveFarm] = useState<any>(null);
    const [isReportModalOpen, setReportModalOpen] = useState(false);
    const { user } = useAuth();
    const [sensorData, setSensorData] = useState<any[]>([]);
    const [liveMetrics, setLiveMetrics] = useState({ temp: 0, humidity: 0, moisture: 0, light: 0 });
    const [prevMetrics, setPrevMetrics] = useState({ temp: 0, humidity: 0, moisture: 0 });
    const [lastUpdated, setLastUpdated] = useState<string>("");
    const [thingSpeakError, setThingSpeakError] = useState<string | null>(null);
    const liveMetricsRef = useRef(liveMetrics);
    useEffect(() => { liveMetricsRef.current = liveMetrics; }, [liveMetrics]);

    const [demoCrop] = useState(() => DEMO_CROPS[Math.floor(Math.random() * DEMO_CROPS.length)]);
    const [demoStage] = useState(() => DEMO_STAGES[Math.floor(Math.random() * DEMO_STAGES.length)]);
    const [demoEnv, setDemoEnv] = useState({
        soilTemp: 26.5,
        rainfall: 4,
        windSpeed: 9,
        waterLevel: 72,
        marketPrice: 2450
    });
    const demoCropKey = DEMO_CROP_KEYS[demoCrop] || 'crop';
    const demoActivity = DEMO_ACTIVITY_KEYS.map((key, i) => ({
        text: t(key, { crop: t(demoCropKey) }),
        time: new Date(Date.now() - i * 1000 * 60 * (7 + i * 6)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));

    const isDemoMode = !activeFarm || !!thingSpeakError;

    const fetchFarms = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('userInfo') || '{}').token;
            try {
                const { data } = await axios.get(`${API_BASE}/api/farms`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setFarms(data);
                if (data.length > 0 && !activeFarm) {
                    setActiveFarm(data[0]);
                }
            } catch (err) {
                console.warn("Backend farms fetch failed", err);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchThingSpeakData = async () => {
        if (!activeFarm) return;

        const { channelId, readKey } = activeFarm;

        if (!channelId || !readKey) {
            setThingSpeakError("ThingSpeak API key or Channel ID missing for the active farm.");
            return;
        }

        setThingSpeakError(null);

        try {
            const feedsRes = await fetch(`https://api.thingspeak.com/channels/${channelId}/feeds.json?results=20&api_key=${readKey}`);

            if (!feedsRes.ok) {
                const errorData = await feedsRes.json();
                throw new Error(errorData.error || "Failed to fetch feeds from ThingSpeak");
            }

            const feedsData = await feedsRes.json();
            const parseValue = (val: any) => {
                if (val === null || val === undefined || val === '') return null;
                const num = Number(val);
                return isNaN(num) ? null : num;
            };

            const feeds = feedsData.feeds.map((feed: any) => ({
                time: new Date(feed.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                rawTime: feed.created_at,
                temp: parseValue(feed.field1),
                humidity: parseValue(feed.field2),
                moisture: parseValue(feed.field3),
                light: parseValue(feed.field4)
            }));

            setSensorData(feeds);

            if (feeds.length > 0) {
                const latest = feeds[feeds.length - 1];
                setPrevMetrics(liveMetricsRef.current);
                const nextMetrics = {
                    temp: latest.temp ?? 0,
                    humidity: latest.humidity ?? 0,
                    moisture: latest.moisture ?? 0,
                    light: latest.light ?? 0
                };
                liveMetricsRef.current = nextMetrics;
                setLiveMetrics(nextMetrics);
                setLastUpdated(new Date(latest.rawTime).toLocaleString());
            } else {
                setThingSpeakError("No data received from ThingSpeak channel.");
            }

        } catch (err: any) {
            console.error("ThingSpeak Error:", err);
            setThingSpeakError(err.message || "Failed to connect to ThingSpeak");
        }
    };

    useEffect(() => {
        fetchFarms();
    }, []);

    useEffect(() => {
        fetchThingSpeakData();
        const interval = setInterval(fetchThingSpeakData, 15000);
        return () => clearInterval(interval);
    }, [activeFarm]);

    useEffect(() => {
        if (!isDemoMode) return;
        if (liveMetrics.temp === 0 && liveMetrics.humidity === 0) {
            setLiveMetrics({ temp: 28.5, humidity: 72, moisture: 64, light: 820 });
            setLastUpdated(new Date().toLocaleString());
        }

        const interval = setInterval(() => {
            const current = liveMetricsRef.current;
            setPrevMetrics(current);
            const nextMetrics = {
                temp: randWalk(current.temp || 28, 18, 40, 0.8),
                humidity: randWalk(current.humidity || 70, 30, 95, 2),
                moisture: randWalk(current.moisture || 60, 20, 90, 2),
                light: randWalk(current.light || 800, 100, 1200, 40)
            };
            liveMetricsRef.current = nextMetrics;
            setLiveMetrics(nextMetrics);
            setDemoEnv(prev => ({
                soilTemp: randWalk(prev.soilTemp, 18, 34, 0.5),
                rainfall: Math.max(0, randWalk(prev.rainfall, 0, 40, 3)),
                windSpeed: randWalk(prev.windSpeed, 2, 25, 1.5),
                waterLevel: randWalk(prev.waterLevel, 30, 95, 1.5),
                marketPrice: randWalk(prev.marketPrice, 1800, 3200, 30)
            }));
            setSensorData(prevData => {
                const next = [...prevData, {
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    ...nextMetrics
                }];
                return next.slice(-20);
            });
            setLastUpdated(new Date().toLocaleString());
        }, 4000);

        return () => clearInterval(interval);
    }, [isDemoMode]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    const Trend = ({ current, previous }: { current: number; previous: number }) => {
        if (!previous || current === previous) return null;
        const up = current > previous;
        return up ? <TrendingUp size={14} className="text-green-500" /> : <TrendingDown size={14} className="text-red-500" />;
    };

    const cropHealth = demoEnv.soilTemp > 32 || demoEnv.waterLevel < 35 ? t('needsAttention') : t('healthy');

    return (
        <Layout title={t('dashboard')} subtitle={activeFarm ? activeFarm.name : t('demoLiveEnvironment')}>
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 sm:space-y-8">
                {/* Header Banner Section */}
                <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 dark:border-white/10 bg-gradient-to-r from-emerald-900/90 via-teal-950/80 to-slate-950/90 dark:from-slate-950/95 dark:via-emerald-950/50 dark:to-slate-950/95 p-6 sm:p-8 text-white shadow-2xl backdrop-blur-2xl">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 h-72 w-72 rounded-full bg-emerald-500/20 blur-[100px] pointer-events-none" />
                    <div className="absolute bottom-0 left-1/3 -mb-10 h-64 w-64 rounded-full bg-cyan-500/15 blur-[100px] pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 text-xs font-semibold text-emerald-300 mb-3 backdrop-blur-md">
                                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                {isDemoMode ? t('demoLiveEnvironment') : t('live')}
                            </div>
                            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-display">
                                {t('welcome')}, {user?.name.split(' ')[0]} 👋
                            </h1>
                            <p className="mt-1 text-sm text-emerald-100/80 max-w-xl">
                                {t('realTimeAnalytics')} {activeFarm ? `— ${activeFarm.name}` : ''}
                            </p>
                            {lastUpdated && (
                                <p className="text-xs text-emerald-300/70 font-medium mt-2 flex items-center gap-1.5">
                                    <Clock size={13} className="text-emerald-400" />
                                    <span>{t('lastUpdated')}: {lastUpdated}</span>
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                            <button
                                onClick={() => setReportModalOpen(true)}
                                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold px-5 py-2.5 shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95 text-sm"
                            >
                                <Activity size={17} />
                                <span>{t('getReport')}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* ROW 1-3: PRIORITY FARMER SERVICES DASHBOARD MENU ITEMS */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <h2 className="text-base font-extrabold text-gray-900 dark:text-white font-display">
                                AgriLink Farmer Services (முதன்மை சேவைகள்)
                            </h2>
                        </div>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                            Key Features
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* 1. LANGUAGE SELECTION CARD */}
                        <div className="rounded-2xl border border-emerald-500/20 bg-white/90 dark:bg-slate-900/90 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between backdrop-blur-xl">
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-500 flex items-center justify-center border border-amber-400/30">
                                        <Languages size={20} />
                                    </div>
                                    <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-400/15 px-2 py-0.5 rounded-full border border-amber-400/30">
                                        {i18n.language.toUpperCase()}
                                    </span>
                                </div>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                    1. {t('language')} (மொழி)
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Switch interface language anytime across all pages.
                                </p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/5">
                                <LanguageSwitcher variant="quick-toggle" />
                            </div>
                        </div>

                        {/* 2. CULTIVATION COST CALCULATOR CARD */}
                        <Link
                            to="/cultivation-cost"
                            className="group rounded-2xl border border-emerald-500/20 bg-white/90 dark:bg-slate-900/90 p-5 shadow-sm hover:shadow-lg hover:border-emerald-500/40 transition-all flex flex-col justify-between backdrop-blur-xl"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30 group-hover:scale-110 transition-transform">
                                        <Calculator size={20} />
                                    </div>
                                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                                        NEW
                                    </span>
                                </div>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                    2. {t('cultivationCost')}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Calculate total cost, cost per acre, revenue & net profit with save report.
                                </p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                <span>Calculate Now</span>
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>

                        {/* 3. SMALL-SCALE FARMER SUPPORT CARD */}
                        <Link
                            to="/small-farmers"
                            className="group rounded-2xl border border-amber-500/20 bg-white/90 dark:bg-slate-900/90 p-5 shadow-sm hover:shadow-lg hover:border-amber-500/40 transition-all flex flex-col justify-between backdrop-blur-xl"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/30 group-hover:scale-110 transition-transform">
                                        <Sprout size={20} />
                                    </div>
                                    <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30">
                                        FEATURE
                                    </span>
                                </div>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                    3. {t('smallScaleFarmers')}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Small batch listings, price comparison, nearby buyers & Tamil voice guide.
                                </p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400">
                                <span>Open Hub</span>
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>

                        {/* 4. CONTACT AGRICULTURE OFFICER CARD */}
                        <Link
                            to="/contact-officer"
                            className="group rounded-2xl border border-teal-500/20 bg-white/90 dark:bg-slate-900/90 p-5 shadow-sm hover:shadow-lg hover:border-teal-500/40 transition-all flex flex-col justify-between backdrop-blur-xl"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-500/30 group-hover:scale-110 transition-transform">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <span className="text-[10px] font-bold text-teal-800 dark:text-teal-300 bg-teal-500/15 px-2 py-0.5 rounded-full border border-teal-500/30">
                                        GOVT
                                    </span>
                                </div>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                                    4. {t('contactOfficer')}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Submit farm issues, track reference status & access verified helplines.
                                </p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-xs font-bold text-teal-600 dark:text-teal-400">
                                <span>Get Assistance</span>
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    </div>
                </div>

                {isDemoMode && (
                    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 p-4 px-5 backdrop-blur-md flex items-start gap-3.5 shadow-sm">
                        <AlertTriangle size={20} className="mt-0.5 text-amber-500 shrink-0" />
                        <div>
                            <p className="font-bold text-sm">{t('demoSensorData')}</p>
                            <p className="text-xs text-amber-800 dark:text-amber-300/90 mt-0.5">
                                {activeFarm ? t('simulatedFarmUnavailable', { name: activeFarm.name }) : t('noFarmConnected')}
                            </p>
                        </div>
                    </div>
                )}

                {/* 4 Live Sensor Metric Cards with Neon Accents */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {/* Temperature */}
                    <motion.div
                        variants={itemVariants}
                        className="group relative overflow-hidden rounded-2xl border border-rose-500/20 dark:border-rose-500/25 bg-white/80 dark:bg-slate-900/80 p-5 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-500/10"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                                {t('temperature')}
                            </span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/15 text-rose-500 border border-rose-500/30 group-hover:scale-110 transition-transform">
                                <Thermometer size={20} />
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white font-display">
                                {liveMetrics.temp ?? "--"}°C
                            </span>
                            <Trend current={liveMetrics.temp} previous={prevMetrics.temp} />
                        </div>
                        <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>Optimal: 22° - 32°C</span>
                            <span className="font-medium text-rose-500">Normal Range</span>
                        </div>
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-rose-500/15">
                            <div className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-500" style={{ width: `${Math.min(100, (liveMetrics.temp / 45) * 100)}%` }} />
                        </div>
                    </motion.div>

                    {/* Soil Moisture */}
                    <motion.div
                        variants={itemVariants}
                        className="group relative overflow-hidden rounded-2xl border border-cyan-500/20 dark:border-cyan-500/25 bg-white/80 dark:bg-slate-900/80 p-5 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/10"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                                {t('soilMoisture')}
                            </span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-500 border border-cyan-500/30 group-hover:scale-110 transition-transform">
                                <Droplets size={20} />
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white font-display">
                                {liveMetrics.moisture ?? "--"}%
                            </span>
                            <Trend current={liveMetrics.moisture} previous={prevMetrics.moisture} />
                        </div>
                        <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>Target: 60% - 80%</span>
                            <span className="font-medium text-cyan-500">Hydrated</span>
                        </div>
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-cyan-500/15">
                            <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" style={{ width: `${Math.min(100, liveMetrics.moisture)}%` }} />
                        </div>
                    </motion.div>

                    {/* Air Humidity */}
                    <motion.div
                        variants={itemVariants}
                        className="group relative overflow-hidden rounded-2xl border border-emerald-500/20 dark:border-emerald-500/25 bg-white/80 dark:bg-slate-900/80 p-5 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                {t('humidity')}
                            </span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 group-hover:scale-110 transition-transform">
                                <Wind size={20} />
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white font-display">
                                {liveMetrics.humidity ?? "--"}%
                            </span>
                            <Trend current={liveMetrics.humidity} previous={prevMetrics.humidity} />
                        </div>
                        <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>Vapor Pressure Deficit</span>
                            <span className="font-medium text-emerald-500">Good</span>
                        </div>
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-emerald-500/15">
                            <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${Math.min(100, liveMetrics.humidity)}%` }} />
                        </div>
                    </motion.div>

                    {/* Light Intensity */}
                    <motion.div
                        variants={itemVariants}
                        className="group relative overflow-hidden rounded-2xl border border-amber-500/20 dark:border-amber-500/25 bg-white/80 dark:bg-slate-900/80 p-5 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/10"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                                {t('lightIntensity')}
                            </span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/30 group-hover:scale-110 transition-transform">
                                <Activity size={20} />
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white font-display">
                                {liveMetrics.light ?? "--"}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">lux</span>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>Sun Radiation</span>
                            <span className="font-medium text-amber-500">Full Daylight</span>
                        </div>
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-amber-500/15">
                            <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400" style={{ width: `${Math.min(100, (liveMetrics.light / 1200) * 100)}%` }} />
                        </div>
                    </motion.div>
                </div>

                {/* Extended Farm / Crop Summary Grid */}
                <div className="rounded-3xl border border-emerald-500/15 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 p-6 shadow-md backdrop-blur-xl">
                    <div className="flex items-center justify-between gap-3 mb-5">
                        <div className="flex items-center gap-2.5">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white font-display">
                                {t('farmSummary')} & {t('cropSummary')}
                            </h3>
                            {isDemoMode && (
                                <span className="text-[11px] bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold px-2 py-0.5 rounded-full border border-amber-500/20">
                                    {t('demoData')}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                        <div className="rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/70 dark:bg-slate-800/50 p-4 transition-all hover:border-emerald-500/30">
                            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-xs font-semibold mb-1">
                                <Gauge size={14} className="text-emerald-500" /> {t('soilTemperature')}
                            </div>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{demoEnv.soilTemp}°C</p>
                        </div>
                        <div className="rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/70 dark:bg-slate-800/50 p-4 transition-all hover:border-emerald-500/30">
                            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-xs font-semibold mb-1">
                                <CloudRain size={14} className="text-cyan-500" /> {t('rainfall')}
                            </div>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{demoEnv.rainfall} mm</p>
                        </div>
                        <div className="rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/70 dark:bg-slate-800/50 p-4 transition-all hover:border-emerald-500/30">
                            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-xs font-semibold mb-1">
                                <Wind size={14} className="text-teal-500" /> {t('windSpeed')}
                            </div>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{demoEnv.windSpeed} km/h</p>
                        </div>
                        <div className="rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/70 dark:bg-slate-800/50 p-4 transition-all hover:border-emerald-500/30">
                            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-xs font-semibold mb-1">
                                <Droplets size={14} className="text-blue-500" /> {t('waterLevel')}
                            </div>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{demoEnv.waterLevel}%</p>
                        </div>
                        <div className="rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/70 dark:bg-slate-800/50 p-4 transition-all hover:border-emerald-500/30">
                            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-xs font-semibold mb-1">
                                <Leaf size={14} className="text-emerald-500" /> {t('cropHealth')}
                            </div>
                            <p className={`text-lg font-bold ${cropHealth === t('healthy') ? 'text-emerald-500' : 'text-amber-500'}`}>{cropHealth}</p>
                        </div>
                        <div className="rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/70 dark:bg-slate-800/50 p-4 transition-all hover:border-emerald-500/30">
                            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-xs font-semibold mb-1">
                                <IndianRupee size={14} className="text-amber-500" /> {t('cropPrice')}
                            </div>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">₹{Math.round(demoEnv.marketPrice)}/qtl</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-3.5">
                        <div className="rounded-2xl border border-emerald-500/10 dark:border-white/5 bg-emerald-500/5 dark:bg-slate-800/40 p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{t('crop')}</p>
                                <p className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                                    <Sprout size={16} className="text-emerald-500" /> {t(demoCropKey)}
                                </p>
                            </div>
                            <span className="text-2xl">🌱</span>
                        </div>
                        <div className="rounded-2xl border border-emerald-500/10 dark:border-white/5 bg-emerald-500/5 dark:bg-slate-800/40 p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{t('growthStage')}</p>
                                <p className="font-bold text-gray-900 dark:text-white mt-0.5">{t(DEMO_STAGE_KEYS[demoStage])}</p>
                            </div>
                            <span className="text-2xl">🌾</span>
                        </div>
                        <div className="rounded-2xl border border-emerald-500/10 dark:border-white/5 bg-emerald-500/5 dark:bg-slate-800/40 p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{t('irrigationStatus')}</p>
                                <p className="font-bold text-gray-900 dark:text-white mt-0.5">{demoEnv.waterLevel < 50 ? t('irrigationRecommended') : t('adequate')}</p>
                            </div>
                            <span className="text-2xl">💧</span>
                        </div>
                    </div>
                </div>

                {/* Real-time Environmental Telemetry Chart */}
                <motion.div variants={itemVariants} className="rounded-3xl border border-emerald-500/15 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 p-6 shadow-md backdrop-blur-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white font-display flex items-center gap-2">
                            <Activity size={20} className="text-emerald-500" />
                            {isDemoMode ? `${t('demoLiveEnvironment')} — ${t('environmentalTrends')}` : t('liveEnvironmentalData')}
                        </h3>
                        <div className="flex items-center gap-4 text-xs font-semibold text-gray-500 dark:text-gray-400 flex-wrap">
                            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-500" />{t('temperature')}</span>
                            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />{t('moisture')}</span>
                            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />{t('humidity')}</span>
                            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-400" />{t('light')}</span>
                        </div>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={sensorData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                                <YAxis stroke="#64748b" fontSize={11} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                        borderColor: 'rgba(255, 255, 255, 0.1)',
                                        borderRadius: '16px',
                                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                                        color: '#fff',
                                        fontSize: '12px'
                                    }}
                                />
                                <Line type="monotone" dataKey="temp" stroke="#f43f5e" strokeWidth={2.5} dot={false} name={t('temperature')} />
                                <Line type="monotone" dataKey="moisture" stroke="#06b6d4" strokeWidth={2.5} dot={false} name={t('moisture')} />
                                <Line type="monotone" dataKey="humidity" stroke="#10b981" strokeWidth={2.5} dot={false} name={t('humidity')} />
                                <Line type="monotone" dataKey="light" stroke="#f59e0b" strokeWidth={2.5} dot={false} name={t('light')} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Crop Sales & Harvesting Schedule Table */}
                <motion.div variants={itemVariants} className="rounded-3xl border border-emerald-500/15 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 p-6 shadow-md backdrop-blur-xl">
                    <div className="flex items-center justify-between gap-2 mb-5">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white font-display flex items-center gap-2">
                            <IndianRupee size={20} className="text-emerald-500" /> {t('allCropSalesHarvestDates')}
                        </h3>
                        <span className="text-xs bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold px-3 py-1 rounded-full border border-emerald-500/20">
                            {t('allCrops')}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-white/10 text-gray-400 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">
                                    <th className="p-3.5">{t('crop')}</th>
                                    <th className="p-3.5">{t('quantity')}</th>
                                    <th className="p-3.5">{t('sellPrice')}</th>
                                    <th className="p-3.5">{t('harvestingDate')}</th>
                                    <th className="p-3.5">{t('status')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-sm">
                                {cropSaleData.map((item) => (
                                    <tr key={item.crop} className="hover:bg-emerald-500/5 transition-colors">
                                        <td className="p-3.5 font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full bg-emerald-400" />
                                            {t(CROP_KEYS[item.crop] || item.crop)}
                                        </td>
                                        <td className="p-3.5 text-gray-600 dark:text-gray-300">{item.quantity}</td>
                                        <td className="p-3.5 text-gray-900 dark:text-white font-bold">{formatCurrency(item.sellPrice, locale)}</td>
                                        <td className="p-3.5 text-gray-600 dark:text-gray-300">{new Date(item.harvestDate).toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                        <td className="p-3.5">
                                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                                                item.status === 'Sold'
                                                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                                    : item.status === 'Pending'
                                                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                                    : 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30'
                                            }`}>
                                                {t(item.status.toLowerCase())}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Recent Activity */}
                <motion.div variants={itemVariants} className="rounded-3xl border border-emerald-500/15 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 p-6 shadow-md backdrop-blur-xl">
                    <div className="flex items-center gap-2 mb-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white font-display">{t('recentActivity')}</h3>
                        {isDemoMode && (
                            <span className="text-[11px] bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold px-2 py-0.5 rounded-full border border-amber-500/20">
                                {t('demoData')}
                            </span>
                        )}
                    </div>
                    <ul className="space-y-3">
                        {demoActivity.map((item, i) => (
                            <li key={i} className="flex items-center justify-between text-sm border-b border-gray-100 dark:border-white/5 pb-2.5 last:border-0 last:pb-0">
                                <span className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                    {item.text}
                                </span>
                                <span className="text-gray-400 text-xs shrink-0 ml-3 font-mono">{item.time}</span>
                            </li>
                        ))}
                    </ul>
                </motion.div>

                {/* Farm List */}
                <motion.div variants={itemVariants}>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white font-display mb-4">{t('myFarms')}</h3>
                    {farms.length === 0 ? (
                        <div className="text-center py-12 rounded-3xl border border-dashed border-gray-300 dark:border-white/10 bg-white/50 dark:bg-slate-900/40 p-8">
                            <p className="text-gray-500 dark:text-gray-400">{t('noFarms')}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {farms.map((farm: any) => (
                                <div
                                    key={farm._id}
                                    onClick={() => setActiveFarm(farm)}
                                    className={`cursor-pointer ring-2 transition-all rounded-2xl ${
                                        activeFarm?._id === farm._id ? 'ring-emerald-500 shadow-glow-emerald' : 'ring-transparent'
                                    }`}
                                >
                                    <FarmCard farm={farm} />
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>

                <ReportModal isOpen={isReportModalOpen} onClose={() => setReportModalOpen(false)} farmId={activeFarm?._id} />
            </motion.div>
        </Layout>
    );
};

export default Dashboard;

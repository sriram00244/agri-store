import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Droplets, Thermometer, Sun, Wind, AlertTriangle, Loader2 } from 'lucide-react';
import Layout from '../components/Layout';
import { useTranslation } from 'react-i18next';
import { API_BASE } from '../config';

const SensorBadge = ({ icon, value, unit, label, color }: any) => (
    <div className={`bg-${color}-50 p-4 rounded-xl flex items-center gap-4 border border-${color}-100 transition-all hover:shadow-md`}>
        <div className={`p-3 bg-white rounded-lg text-${color}-600 shadow-sm`}>{icon}</div>
        <div>
            <p className="text-sm text-gray-500 font-medium uppercase">{label}</p>
            <p className="text-2xl font-bold text-gray-800">{value ?? '--'} <span className="text-sm text-gray-400 font-normal">{unit}</span></p>
        </div>
    </div>
);

const FarmDetails = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const [farm, setFarm] = useState<any>(null);
    const [sensorData, setSensorData] = useState<any[]>([]);
    const [latest, setLatest] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 1. Fetch Farm Metadata (for Channel ID & Read Key)
    const fetchFarmMetadata = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('userInfo') || '{}').token;
            // First we need the farm details to get keys. verify if backend supports GET /api/farms/:id
            // If not, we iterate /api/farms list. But ideally /api/farms/:id should exist.
            // Let's assume we might need to find it from list if direct endpoint fails, but strict REST implies :id
            // However, based on route file, we only saw router.route('/').get(getFarms) and router.get('/:id/data', getFarmData).
            // We do NOT see router.get('/:id') for metadata in the provided route snippet (Step 86).
            // So we must fetch ALL farms and find the one matching ID.

            const { data } = await axios.get(`${API_BASE}/api/farms`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const foundFarm = data.find((f: any) => f._id === id);

            if (foundFarm) {
                setFarm(foundFarm);
                // Trigger ThingSpeak fetch immediately after finding farm
                fetchThingSpeakData(foundFarm);
            } else {
                setError(t('farmNotFound'));
            }
        } catch (err: any) {
            console.error(err);
            setError(t('failedLoadFarm'));
        } finally {
            setLoading(false);
        }
    };

    // 2. Fetch ThingSpeak Data (Direct Frontend Fetch)
    const fetchThingSpeakData = async (farmDetails: any) => {
        if (!farmDetails || !farmDetails.channelId || !farmDetails.readKey) return;

        try {
            const { channelId, readKey } = farmDetails;
            const res = await fetch(`https://api.thingspeak.com/channels/${channelId}/feeds.json?results=20&api_key=${readKey}`);

            if (!res.ok) throw new Error(t('failedThingSpeak'));

            const data = await res.json();

            const parseValue = (val: any) => {
                if (val === null || val === undefined || val === '') return null;
                const num = Number(val);
                return isNaN(num) ? null : num;
            };

            // Map Fields Correctly
            const feeds = data.feeds.map((feed: any) => ({
                created_at: feed.created_at,
                displayTime: new Date(feed.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                temp: parseValue(feed.field1),
                humidity: parseValue(feed.field2),
                soilMoisture: parseValue(feed.field3),
                lightIntensity: parseValue(feed.field4)
            }));

            setSensorData(feeds);

            if (feeds.length > 0) {
                setLatest(feeds[feeds.length - 1]);
            }

        } catch (err) {
            console.error("ThingSpeak polling error:", err);
            // Don't set main error state to avoid blocking UI on transient network fail
        }
    };

    useEffect(() => {
        fetchFarmMetadata();
    }, [id]);

    useEffect(() => {
        if (farm) {
            const interval = setInterval(() => fetchThingSpeakData(farm), 15000);
            return () => clearInterval(interval);
        }
    }, [farm]);

    if (loading) return (
        <Layout>
            <div className="flex flex-col items-center justify-center p-20 h-[60vh]">
                <Loader2 size={40} className="animate-spin text-green-600 mb-4" />
                <p className="text-gray-500">{t('loadingFarmAnalytics')}</p>
            </div>
        </Layout>
    );

    if (error) return (
        <Layout>
            <div className="flex flex-col items-center justify-center p-20 h-[60vh] text-center">
                <div className="bg-red-50 p-4 rounded-full mb-4"><AlertTriangle size={32} className="text-red-500" /></div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">{t('errorLoadingData')}</h2>
                <p className="text-gray-500">{error}</p>
            </div>
        </Layout>
    );

    return (
        <Layout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">{farm?.name}</h1>
                <p className="text-gray-500 flex items-center gap-2">
                    {farm?.location} • <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">{t('live')}</span>
                </p>
            </div>

            {/* Sensor Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <SensorBadge icon={<Droplets size={24} />} value={latest.soilMoisture} unit="%" label={t('soilMoisture')} color="blue" />
                <SensorBadge icon={<Thermometer size={24} />} value={latest.temp} unit="°C" label={t('temperature')} color="red" />
                <SensorBadge icon={<Wind size={24} />} value={latest.humidity} unit="%" label={t('humidity')} color="teal" />
                <SensorBadge icon={<Sun size={24} />} value={latest.lightIntensity} unit="lx" label={t('lightIntensity')} color="orange" />
            </div>

            {/* Graphs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* 1. Temp */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100">
                    <h3 className="text-lg font-bold mb-4 text-red-700 flex items-center gap-2">
                        <Thermometer size={20} /> {t('temperatureTrends')}
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={sensorData}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                <XAxis dataKey="displayTime" fontSize={11} stroke="#9ca3af" />
                                <YAxis domain={['auto', 'auto']} fontSize={11} stroke="#9ca3af" />
                                <Tooltip contentStyle={{ borderRadius: '8px' }} />
                                <Line type="monotone" dataKey="temp" stroke="#ef4444" strokeWidth={3} dot={false} name={`${t('temperature')} (°C)`} connectNulls={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Humidity */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100">
                    <h3 className="text-lg font-bold mb-4 text-blue-700 flex items-center gap-2">
                        <Wind size={20} /> {t('humidityTrends')}
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={sensorData}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                <XAxis dataKey="displayTime" fontSize={11} stroke="#9ca3af" />
                                <YAxis domain={[0, 100]} fontSize={11} stroke="#9ca3af" />
                                <Tooltip contentStyle={{ borderRadius: '8px' }} />
                                <Line type="monotone" dataKey="humidity" stroke="#3b82f6" strokeWidth={3} dot={false} name={`${t('humidity')} (%)`} connectNulls={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. Soil Moisture */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100">
                    <h3 className="text-lg font-bold mb-4 text-emerald-700 flex items-center gap-2">
                        <Droplets size={20} /> {t('soilMoistureTrends')}
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={sensorData}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                <XAxis dataKey="displayTime" fontSize={11} stroke="#9ca3af" />
                                <YAxis domain={[0, 100]} fontSize={11} stroke="#9ca3af" />
                                <Tooltip contentStyle={{ borderRadius: '8px' }} />
                                <Line type="monotone" dataKey="soilMoisture" stroke="#10b981" strokeWidth={3} dot={false} name={`${t('moisture')} (%)`} connectNulls={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 4. Light */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100">
                    <h3 className="text-lg font-bold mb-4 text-orange-700 flex items-center gap-2">
                        <Sun size={20} /> {t('lightIntensityTrends')}
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={sensorData}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                <XAxis dataKey="displayTime" fontSize={11} stroke="#9ca3af" />
                                <YAxis fontSize={11} stroke="#9ca3af" />
                                <Tooltip contentStyle={{ borderRadius: '8px' }} />
                                <Line type="monotone" dataKey="lightIntensity" stroke="#f97316" strokeWidth={3} dot={false} name={`${t('light')} (lx)`} connectNulls={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default FarmDetails;

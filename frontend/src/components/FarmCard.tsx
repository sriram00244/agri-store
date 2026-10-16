import React from 'react';
import { Droplets, Thermometer, Sun, Wind, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface SensorBadgeProps {
    icon: React.ReactNode;
    value: number | string;
    unit: string;
    label: string;
    badgeStyle: string;
    iconStyle: string;
}

const SensorBadge: React.FC<SensorBadgeProps> = ({ icon, value, unit, label, badgeStyle, iconStyle }) => (
    <div className={`p-3 rounded-2xl flex items-center gap-3 border transition-all ${badgeStyle}`}>
        <div className={`p-2 rounded-xl shadow-sm ${iconStyle}`}>{icon}</div>
        <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500 dark:text-gray-400">{label}</p>
            <p className="font-bold text-gray-900 dark:text-white text-sm">
                {value} <span className="text-xs text-gray-400 dark:text-gray-500 font-normal">{unit}</span>
            </p>
        </div>
    </div>
);

const FarmCard = ({ farm }: any) => {
    const { t } = useTranslation();

    const data = {
        moisture: 45,
        temp: 28,
        humidity: 65,
        light: 850
    };

    return (
        <div className="rounded-3xl p-6 shadow-md border border-emerald-500/15 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-emerald-500/30">
            <div className="flex justify-between items-start mb-5">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white font-display">{farm.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{farm.location}</p>
                </div>
                <div className="inline-flex items-center gap-1.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full text-xs font-bold">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {t('connected')}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
                <SensorBadge
                    icon={<Droplets size={16} />}
                    value={data.moisture}
                    unit="%"
                    label={t('moisture')}
                    badgeStyle="bg-cyan-500/10 border-cyan-500/20 text-cyan-600 dark:text-cyan-400"
                    iconStyle="bg-cyan-500/20 text-cyan-500"
                />
                <SensorBadge
                    icon={<Thermometer size={16} />}
                    value={data.temp}
                    unit="°C"
                    label={t('temp')}
                    badgeStyle="bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
                    iconStyle="bg-rose-500/20 text-rose-500"
                />
                <SensorBadge
                    icon={<Wind size={16} />}
                    value={data.humidity}
                    unit="%"
                    label={t('humidity')}
                    badgeStyle="bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                    iconStyle="bg-emerald-500/20 text-emerald-500"
                />
                <SensorBadge
                    icon={<Sun size={16} />}
                    value={data.light}
                    unit="lx"
                    label={t('light')}
                    badgeStyle="bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
                    iconStyle="bg-amber-500/20 text-amber-500"
                />
            </div>

            <Link
                to={`/farm/${farm._id}`}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-500/10 hover:bg-emerald-500 hover:text-slate-950 text-emerald-600 dark:text-emerald-400 dark:hover:text-slate-950 rounded-xl transition-all font-semibold text-xs border border-emerald-500/20"
            >
                {t('viewAnalytics')} <ArrowRight size={15} />
            </Link>
        </div>
    );
};

export default FarmCard;

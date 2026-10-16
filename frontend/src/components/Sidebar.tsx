import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    CloudSun,
    LineChart,
    MessageSquare,
    Microscope,
    Settings,
    Users,
    LogOut,
    Calculator,
    ShoppingBasket,
    Sprout,
    ShoppingBag,
    Package,
    Leaf,
    Wrench
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

interface NavSection {
    title: string;
    items: {
        path: string;
        icon: React.ReactNode;
        label: string;
        badge?: string;
    }[];
}

const Sidebar: React.FC = () => {
    const location = useLocation();
    const { logout } = useAuth();
    const { t } = useTranslation();

    const currentFullPath = location.pathname + location.search;

    const isItemActive = (path: string) => {
        if (path === currentFullPath) return true;
        if (path.includes('?') && currentFullPath.startsWith(path)) return true;
        if (!path.includes('?') && location.pathname === path && !location.search) return true;
        return false;
    };

    const navSections: NavSection[] = [
        {
            title: t('coreFarming'),
            items: [
                { path: '/dashboard', icon: <LayoutDashboard size={18} />, label: t('dashboard') },
                { path: '/crop-doctor', icon: <Microscope size={18} />, label: t('cropDoctor') },
                { path: '/weather', icon: <CloudSun size={18} />, label: t('weather') },
                { path: '/chat', icon: <MessageSquare size={18} />, label: t('aiAssistant') }
            ]
        },
        {
            title: t('agroStoresMarket'),
            items: [
                { 
                    path: '/store', 
                    icon: <ShoppingBag size={18} />, 
                    label: t('agroStore'),
                    badge: 'HOT'
                },
                { 
                    path: '/store?category=Seeds+%26+Fertilizers', 
                    icon: <Leaf size={18} />, 
                    label: t('seedsFertilizers') 
                },
                { 
                    path: '/store?category=Farm+Equipment', 
                    icon: <Wrench size={18} />, 
                    label: t('farmEquipment') 
                },
                { 
                    path: '/orders', 
                    icon: <Package size={18} />, 
                    label: t('myOrders') 
                },
                { 
                    path: '/farmer-crop-sales', 
                    icon: <ShoppingBasket size={18} />, 
                    label: t('farmerSales') 
                },
                { 
                    path: '/market', 
                    icon: <LineChart size={18} />, 
                    label: t('market') 
                }
            ]
        },
        {
            title: t('toolsCommunity'),
            items: [
                { path: '/profit-calculator', icon: <Calculator size={18} />, label: t('profitCalculator') },
                { path: '/community', icon: <Users size={18} />, label: t('community') },
                { path: '/settings', icon: <Settings size={18} />, label: t('settings') }
            ]
        }
    ];

    return (
        <aside className="w-64 h-screen flex-shrink-0 flex flex-col justify-between border-r border-emerald-900/30 dark:border-white/10 bg-emerald-950/95 dark:bg-slate-950/95 backdrop-blur-2xl text-white shadow-2xl select-none transition-all duration-300 z-40">
            {/* Brand Header */}
            <div className="p-4 md:p-5 border-b border-white/10 dark:border-white/5 flex items-center justify-between">
                <Link to="/dashboard" className="flex items-center gap-3 group">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-md shadow-emerald-500/30 group-hover:scale-105 transition-transform">
                        <Sprout size={22} className="animate-pulse-subtle" />
                    </div>
                    <div>
                        <h1 className="text-xl font-extrabold tracking-tight font-display text-white group-hover:text-emerald-300 transition-colors">
                            Agrostores
                        </h1>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400/90 block -mt-1">
                            Smart Farming
                        </span>
                    </div>
                </Link>
            </div>

            {/* Nav Menu */}
            <nav className="flex-1 px-3 py-3 overflow-y-auto custom-scrollbar space-y-4">
                {navSections.map((section, sIdx) => (
                    <div key={sIdx} className="space-y-1">
                        <div className="px-3 pt-1 pb-1 text-[10px] font-extrabold uppercase tracking-widest text-emerald-400/70 dark:text-emerald-400/60 flex items-center justify-between">
                            <span>{section.title}</span>
                        </div>

                        {section.items.map((item) => {
                            const active = isItemActive(item.path);
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 group text-xs font-medium ${
                                        active
                                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30 ring-1 ring-emerald-400/40 font-semibold'
                                            : 'text-slate-300 hover:text-white hover:bg-white/10 dark:hover:bg-slate-800/70'
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <span className={`transition-transform duration-200 group-hover:scale-110 shrink-0 ${
                                            active ? 'text-white' : 'text-emerald-400 dark:text-emerald-400'
                                        }`}>
                                            {item.icon}
                                        </span>
                                        <span className="truncate">{item.label}</span>
                                    </div>

                                    {item.badge && (
                                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-400 text-amber-950 shadow-xs shrink-0">
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                ))}

                {/* Regional Language Switcher in sidebar */}
                <div className="pt-2 px-1">
                    <LanguageSwitcher variant="sidebar" />
                </div>

                {/* Logout Button */}
                <div className="px-1 pt-1 pb-2">
                    <button
                        onClick={logout}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-300 hover:bg-red-500/15 hover:text-red-200 w-full transition-all group text-left text-xs font-semibold cursor-pointer"
                    >
                        <LogOut size={16} className="text-red-400 group-hover:scale-110 transition-transform" />
                        <span>{t('logout')}</span>
                    </button>
                </div>
            </nav>

            {/* Bottom Status */}
            <div className="p-3 border-t border-white/10 dark:border-white/5 text-[11px] text-slate-400 flex items-center justify-between px-4 bg-emerald-950/60 dark:bg-slate-950/60">
                <span className="flex items-center gap-1.5 text-emerald-400 text-xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                    System Active
                </span>
                <span className="text-[10px] text-slate-400 font-mono">v2.4 Pro</span>
            </div>
        </aside>
    );
};

export default Sidebar;

import React from 'react';
import { Sun, Moon, Bell, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';

interface TopNavProps {
    title?: string;
    subtitle?: string;
}

const TopNav: React.FC<TopNavProps> = ({ title, subtitle }) => {
    const { isDark, toggleTheme } = useTheme();
    const { user } = useAuth();

    return (
        <header className="sticky top-0 z-30 mb-6 flex items-center justify-between gap-4 rounded-2xl border border-white/20 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 p-3.5 px-6 shadow-sm backdrop-blur-xl transition-all duration-300">
            {/* Left: Dynamic Page Title / Status */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="hidden sm:inline-block text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-0.5 rounded-full">
                        IoT Synced
                    </span>
                </div>
                {title && (
                    <div className="hidden md:flex flex-col border-l border-gray-200 dark:border-gray-800 pl-3">
                        <h2 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{title}</h2>
                        {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">{subtitle}</p>}
                    </div>
                )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2.5 sm:gap-3">
                {/* Theme Switcher Button */}
                <button
                    type="button"
                    onClick={toggleTheme}
                    title={isDark ? 'Switch to Emerald Light Mode' : 'Switch to Cyber Dark Mode'}
                    className="relative flex items-center gap-2 rounded-xl border border-emerald-500/20 dark:border-white/10 bg-emerald-50/70 dark:bg-slate-800/80 px-3 py-2 text-xs font-semibold text-emerald-900 dark:text-emerald-300 shadow-sm transition-all hover:scale-105 hover:bg-emerald-100 dark:hover:bg-slate-700 focus:outline-none"
                >
                    {isDark ? (
                        <>
                            <Sun size={16} className="text-amber-400 animate-spin-slow" />
                            <span className="hidden md:inline font-medium">Light</span>
                        </>
                    ) : (
                        <>
                            <Moon size={16} className="text-emerald-700" />
                            <span className="hidden md:inline font-medium">Dark</span>
                        </>
                    )}
                </button>

                {/* Language Switcher */}
                <LanguageSwitcher variant="pill" />

                {/* Notification Bell */}
                <div className="relative">
                    <button
                        type="button"
                        aria-label="Notifications"
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-slate-800/80 text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-100 dark:hover:bg-slate-700"
                    >
                        <Bell size={17} />
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                    </button>
                </div>

                {/* User Avatar Chip */}
                {user && (
                    <div className="hidden lg:flex items-center gap-2.5 pl-2 border-l border-gray-200 dark:border-slate-800">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-xs font-bold text-white shadow-sm ring-2 ring-emerald-500/30">
                            {user.name ? user.name[0].toUpperCase() : 'U'}
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="text-xs font-bold text-gray-800 dark:text-gray-100 leading-tight">
                                {user.name}
                            </span>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium leading-tight flex items-center gap-1">
                                <Sparkles size={10} /> Smart Farmer
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default TopNav;

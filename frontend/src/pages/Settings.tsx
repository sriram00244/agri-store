import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Layout from '../components/Layout';
import { User, Bell, Shield, LogOut, Loader2, Check, Sun, Moon, Palette, Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '../components/LanguageSwitcher';

const Settings: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { user, logout, updateProfile } = useAuth();
    const { setTheme, isDark } = useTheme();

    const [name, setName] = useState(user?.name || '');
    const [location, setLocation] = useState(user?.location || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [emailAlerts, setEmailAlerts] = useState(user?.notifications?.email ?? true);
    const [smsAlerts, setSmsAlerts] = useState(user?.notifications?.sms ?? false);

    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setStatus(null);

        const result = await updateProfile({
            name,
            location,
            phone,
            notifications: { email: emailAlerts, sms: smsAlerts }
        });

        setSaving(false);
        setStatus(
            result.success
                ? { type: 'success', message: t('settingsSaved') }
                : { type: 'error', message: result.error || t('settingsSavedError') }
        );
    };

    return (
        <Layout title={t('settings')} subtitle="Manage appearance, regional language, and farm account settings">
            <div className="max-w-3xl space-y-8">
                {/* 1. Theme & Appearance Selector */}
                <div className="rounded-3xl border border-emerald-500/15 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 p-6 sm:p-8 shadow-md backdrop-blur-xl">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2.5 font-display">
                        <Palette size={22} className="text-emerald-500" />
                        Theme & Appearance
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                        Choose your interface color scheme and visual experience.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Cyber Dark Theme Card */}
                        <button
                            type="button"
                            onClick={() => setTheme('dark')}
                            className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                                isDark
                                    ? 'border-emerald-500 bg-slate-950 text-white shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/30'
                                    : 'border-gray-200 dark:border-white/10 bg-slate-900/60 text-slate-300 hover:border-emerald-400/50'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 rounded-xl bg-slate-800 text-emerald-400 border border-slate-700">
                                        <Moon size={18} />
                                    </div>
                                    <div>
                                        <span className="font-bold text-sm block">Cyber AgTech Dark</span>
                                        <span className="text-[11px] text-gray-400">OLED night telemetry</span>
                                    </div>
                                </div>
                                {isDark && (
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-slate-950">
                                        <Check size={14} className="stroke-[3]" />
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                                <span className="h-3 w-3 rounded-full bg-emerald-400" />
                                <span className="h-3 w-3 rounded-full bg-cyan-400" />
                                <span className="h-3 w-3 rounded-full bg-amber-400" />
                                <span className="text-[10px] text-gray-500 ml-auto">Neon Emerald Accent</span>
                            </div>
                        </button>

                        {/* Emerald Light Theme Card */}
                        <button
                            type="button"
                            onClick={() => setTheme('light')}
                            className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                                !isDark
                                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 shadow-lg shadow-emerald-600/10 ring-2 ring-emerald-500/30'
                                    : 'border-gray-200 dark:border-white/10 bg-white/60 text-gray-700 hover:border-emerald-400/50'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200">
                                        <Sun size={18} />
                                    </div>
                                    <div>
                                        <span className="font-bold text-sm block">Lush Emerald Light</span>
                                        <span className="text-[11px] text-gray-500">Daylight agricultural high contrast</span>
                                    </div>
                                </div>
                                {!isDark && (
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white">
                                        <Check size={14} className="stroke-[3]" />
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 pt-2 border-t border-emerald-100">
                                <span className="h-3 w-3 rounded-full bg-emerald-600" />
                                <span className="h-3 w-3 rounded-full bg-teal-500" />
                                <span className="h-3 w-3 rounded-full bg-amber-500" />
                                <span className="text-[10px] text-gray-400 ml-auto">Emerald Forest Palette</span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* 2. Regional Languages Quick Selection */}
                <div className="rounded-3xl border border-emerald-500/15 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 p-6 sm:p-8 shadow-md backdrop-blur-xl">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2.5 font-display">
                        <Languages size={22} className="text-emerald-500" />
                        {t('language')} (Regional Languages)
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                        Select your preferred Indian agricultural regional language.
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                        {SUPPORTED_LANGUAGES.map((lang) => {
                            const isSelected = i18n.language?.startsWith(lang.code);
                            return (
                                <button
                                    key={lang.code}
                                    type="button"
                                    onClick={() => i18n.changeLanguage(lang.code)}
                                    className={`p-3 rounded-2xl border text-center transition-all ${
                                        isSelected
                                            ? 'border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 font-bold ring-2 ring-emerald-500/30'
                                            : 'border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-slate-800/50 text-gray-700 dark:text-gray-300 hover:border-emerald-400/40'
                                    }`}
                                >
                                    <span className="text-sm font-semibold block">{lang.native}</span>
                                    <span className="text-[10px] text-gray-400 block mt-0.5">{lang.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 3. Profile Information */}
                <div className="rounded-3xl border border-emerald-500/15 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 p-6 sm:p-8 shadow-md backdrop-blur-xl">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2.5 font-display">
                        <User size={22} className="text-emerald-500" />
                        {t('profile')}
                    </h2>

                    <form onSubmit={handleSave} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                                    {t('fullName')}
                                </label>
                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                                    {t('emailAddress')}
                                </label>
                                <input
                                    defaultValue={user?.email}
                                    disabled
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-slate-800/50 text-gray-500 dark:text-gray-400 cursor-not-allowed text-sm"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                                    {t('location')}
                                </label>
                                <input
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder={t('cityCountry')}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                                    {t('phoneNumber')}
                                </label>
                                <input
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+91 98765 43210"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                />
                            </div>
                        </div>

                        {/* Notifications */}
                        <div className="pt-4 border-t border-gray-100 dark:border-white/5">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 font-display">
                                <Bell size={17} className="text-emerald-500" />
                                {t('notifications')}
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50/70 dark:bg-slate-800/40 border border-gray-100 dark:border-white/5">
                                    <div>
                                        <h4 className="font-semibold text-sm text-gray-900 dark:text-white">{t('emailAlerts')}</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('receiveEmailReports')}</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={emailAlerts}
                                        onChange={(e) => setEmailAlerts(e.target.checked)}
                                        className="h-5 w-5 accent-emerald-600 rounded cursor-pointer"
                                    />
                                </div>
                                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50/70 dark:bg-slate-800/40 border border-gray-100 dark:border-white/5">
                                    <div>
                                        <h4 className="font-semibold text-sm text-gray-900 dark:text-white">{t('smsAlerts')}</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('urgentSmsAlerts')}</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={smsAlerts}
                                        onChange={(e) => setSmsAlerts(e.target.checked)}
                                        className="h-5 w-5 accent-emerald-600 rounded cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pt-3">
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-7 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-600/25 disabled:opacity-60 flex items-center gap-2 text-sm transition-all hover:scale-105 active:scale-95"
                            >
                                {saving && <Loader2 size={16} className="animate-spin" />}
                                {t('save')}
                            </button>
                            {status && (
                                <span className={`text-xs font-semibold flex items-center gap-1.5 ${status.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {status.type === 'success' && <Check size={16} />}
                                    {status.message}
                                </span>
                            )}
                        </div>
                    </form>
                </div>

                {/* 4. Danger Zone / Account Actions */}
                <div className="rounded-3xl border border-red-500/20 bg-red-500/5 dark:bg-red-950/20 p-6 sm:p-8 backdrop-blur-xl">
                    <h2 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2 font-display">
                        <Shield size={20} />
                        {t('accountActions')}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                        Securely sign out of your current session on this device.
                    </p>
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold bg-white dark:bg-slate-800 px-5 py-2.5 rounded-xl border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all text-sm shadow-sm"
                    >
                        <LogOut size={16} /> {t('logout')}
                    </button>
                </div>
            </div>
        </Layout>
    );
};

export default Settings;

import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import AnimatedBackground from '../components/AnimatedBackground';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { Sprout, ArrowRight, Sun, Moon, KeyRound } from 'lucide-react';

const Login: React.FC = () => {
    const { t } = useTranslation();
    const { isDark, toggleTheme } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const message = location.state?.message;

    const submitHandler = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const result = await login(email, password);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error);
        }
    };

    const fillDemoCredentials = () => {
        setEmail('demo@agronix.demo');
        setPassword('Demo@1234');
    };

    return (
        <AnimatedBackground type="login">
            {/* Top Right Controls: Theme & Language */}
            <div className="absolute top-5 right-5 z-20 flex items-center gap-2.5">
                <button
                    type="button"
                    onClick={toggleTheme}
                    title="Toggle Theme"
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/30 bg-black/40 text-white backdrop-blur-md shadow-md transition-all hover:bg-black/60 hover:scale-105"
                >
                    {isDark ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-emerald-300" />}
                </button>
                <LanguageSwitcher variant="pill" />
            </div>

            {/* Login Card */}
            <div className="relative z-10 w-full max-w-md p-8 sm:p-10 rounded-3xl border border-white/20 dark:border-white/10 bg-white/90 dark:bg-slate-900/90 shadow-2xl backdrop-blur-2xl transition-all duration-300">
                <div className="text-center mb-7">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/30 mb-4 animate-float-slow">
                        <Sprout size={30} />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white font-display">
                        {t('welcomeBack')}
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {t('signInDescription')}
                    </p>
                </div>

                {message && (
                    <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 p-3.5 mb-5 rounded-2xl text-xs font-semibold">
                        {message}
                    </div>
                )}
                {error && (
                    <div className="bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 p-3.5 mb-5 rounded-2xl text-xs font-semibold">
                        {error}
                    </div>
                )}

                <form onSubmit={submitHandler} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">
                            {t('emailAddress')}
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white text-sm transition-all shadow-sm"
                            placeholder="farmer@agronix.com"
                            required
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1.5 ml-1">
                            <label className="block text-gray-700 dark:text-gray-300 text-xs font-bold uppercase tracking-wider">
                                {t('password')}
                            </label>
                            <span className="text-[11px] text-gray-400 font-medium">{t('passwordHint')}</span>
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white text-sm transition-all shadow-sm"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-sm flex items-center justify-center gap-2 mt-2"
                    >
                        <span>{t('signIn')}</span>
                        <ArrowRight size={17} />
                    </button>
                </form>

                {/* Quick Demo Login Pill */}
                <div className="mt-5 pt-4 border-t border-gray-200 dark:border-white/10 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={fillDemoCredentials}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                        <KeyRound size={13} />
                        Fill Demo Login
                    </button>
                    <span className="text-[11px] text-gray-400">Demo@1234</span>
                </div>

                <div className="mt-4 text-center">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                        {t('noAccount')}{' '}
                        <Link to="/signup" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                            {t('createAccount')}
                        </Link>
                    </p>
                </div>
            </div>
        </AnimatedBackground>
    );
};

export default Login;

import React, { useState, useRef, useEffect } from 'react';
import { Languages, Check, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface LanguageOption {
    code: string;
    label: string;
    native: string;
    badge?: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
    { code: 'en', label: 'English', native: 'English', badge: 'EN' },
    { code: 'ta', label: 'Tamil', native: 'தமிழ்', badge: 'TA' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'te', label: 'Telugu', native: 'తెలుగు' },
    { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'ml', label: 'Malayalam', native: 'മലയാളம்' },
    { code: 'mr', label: 'Marathi', native: 'मराठी' },
    { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
    { code: 'bn', label: 'Bengali', native: 'বাংলা' },
    { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
];

interface LanguageSwitcherProps {
    variant?: 'pill' | 'sidebar' | 'banner' | 'quick-toggle';
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ variant = 'pill' }) => {
    const { i18n, t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentLangCode = i18n.resolvedLanguage || i18n.language || 'en';
    const isTamil = currentLangCode.startsWith('ta');
    const isEnglish = currentLangCode.startsWith('en');

    const currentLang = SUPPORTED_LANGUAGES.find((lang) => currentLangCode.startsWith(lang.code)) || SUPPORTED_LANGUAGES[0];

    const changeLanguage = (code: string) => {
        i18n.changeLanguage(code);
        if (typeof window !== 'undefined') {
            localStorage.setItem('agronix_language', code);
            document.documentElement.lang = code;
        }
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);

    // Quick direct English <-> Tamil toggle button pair
    if (variant === 'quick-toggle') {
        return (
            <div className="inline-flex items-center rounded-xl bg-emerald-950/40 dark:bg-slate-900/80 p-1 border border-emerald-500/20 shadow-sm backdrop-blur-md">
                <button
                    type="button"
                    onClick={() => changeLanguage('en')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        isEnglish
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md font-extrabold'
                            : 'text-slate-200 hover:text-white hover:bg-white/10'
                    }`}
                >
                    English
                </button>
                <button
                    type="button"
                    onClick={() => changeLanguage('ta')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                        isTamil
                            ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 shadow-md font-extrabold'
                            : 'text-slate-200 hover:text-white hover:bg-white/10'
                    }`}
                >
                    தமிழ்
                </button>
            </div>
        );
    }

    if (variant === 'banner') {
        return (
            <div className="flex items-center gap-2 bg-emerald-900/60 dark:bg-slate-800/80 border border-emerald-400/30 rounded-2xl p-2 px-3 backdrop-blur-md">
                <div className="flex items-center gap-1.5 text-xs text-emerald-200 font-semibold mr-1">
                    <Languages size={15} className="text-amber-400" />
                    <span>{t('language')}:</span>
                </div>
                <button
                    type="button"
                    onClick={() => changeLanguage('en')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        isEnglish
                            ? 'bg-emerald-400 text-slate-950 shadow-sm'
                            : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                >
                    English
                </button>
                <button
                    type="button"
                    onClick={() => changeLanguage('ta')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        isTamil
                            ? 'bg-amber-400 text-slate-950 shadow-sm'
                            : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                >
                    தமிழ்
                </button>
            </div>
        );
    }

    if (variant === 'sidebar') {
        return (
            <div className="relative w-full" ref={dropdownRef}>
                <div className="flex items-center gap-1 mb-1.5 px-1">
                    <button
                        type="button"
                        onClick={() => changeLanguage('en')}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold text-center transition-all ${
                            isEnglish
                                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                                : 'bg-white/10 text-slate-200 hover:bg-white/20'
                        }`}
                    >
                        English
                    </button>
                    <button
                        type="button"
                        onClick={() => changeLanguage('ta')}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold text-center transition-all ${
                            isTamil
                                ? 'bg-amber-400 text-slate-950 shadow-sm'
                                : 'bg-white/10 text-slate-200 hover:bg-white/20'
                        }`}
                    >
                        தமிழ்
                    </button>
                </div>

                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center justify-between w-full px-3 py-2 rounded-xl text-emerald-100 hover:bg-emerald-800/50 dark:hover:bg-slate-800/60 border border-white/10 transition-all group text-left text-xs"
                    title={t('selectLanguage')}
                >
                    <div className="flex items-center gap-2">
                        <Languages size={16} className="text-emerald-400 group-hover:rotate-12 transition-transform" />
                        <span className="font-semibold text-xs">{currentLang.native}</span>
                        <span className="text-[10px] text-emerald-300/70">({currentLang.label})</span>
                    </div>
                    <ChevronDown
                        size={14}
                        className={`text-emerald-300 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    />
                </button>

                {isOpen && (
                    <div className="absolute bottom-full left-0 mb-2 w-full max-h-64 overflow-y-auto rounded-xl bg-emerald-950/95 dark:bg-slate-900/95 border border-emerald-500/30 shadow-2xl backdrop-blur-xl z-50 py-1.5 scrollbar-thin">
                        <div className="px-3 py-1 text-[10px] font-bold text-emerald-400 uppercase tracking-wider border-b border-white/10">
                            {t('selectLanguage')}
                        </div>
                        {SUPPORTED_LANGUAGES.map((lang) => {
                            const isSelected = currentLang.code === lang.code;
                            return (
                                <button
                                    key={lang.code}
                                    type="button"
                                    onClick={() => changeLanguage(lang.code)}
                                    className={`flex items-center justify-between w-full px-3 py-1.5 text-xs text-left transition-colors ${
                                        isSelected
                                            ? 'bg-emerald-600 text-white font-bold'
                                            : 'text-slate-200 hover:bg-emerald-800/40 hover:text-white'
                                    }`}
                                >
                                    <div>
                                        <span className="font-medium mr-1.5">{lang.native}</span>
                                        <span className="text-[10px] opacity-70">({lang.label})</span>
                                    </div>
                                    {isSelected && <Check size={14} className="text-white shrink-0" />}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    // Default 'pill' variant in TopNav
    return (
        <div className="relative inline-flex items-center gap-1.5" ref={dropdownRef}>
            {/* Quick 1-click toggle for English / Tamil */}
            <div className="inline-flex items-center rounded-xl bg-emerald-50/90 dark:bg-slate-800/90 border border-emerald-500/20 dark:border-white/10 p-0.5 shadow-xs">
                <button
                    type="button"
                    onClick={() => changeLanguage('en')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        isEnglish
                            ? 'bg-emerald-600 text-white shadow-xs font-extrabold'
                            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                    title="Switch to English"
                >
                    English
                </button>
                <button
                    type="button"
                    onClick={() => changeLanguage('ta')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        isTamil
                            ? 'bg-amber-500 text-amber-950 shadow-xs font-extrabold'
                            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                    title="தமிழுக்கு மாற்றுக"
                >
                    தமிழ்
                </button>
            </div>

            {/* Dropdown for other languages / mobile */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 rounded-xl border border-emerald-500/20 dark:border-white/10 bg-white/90 dark:bg-slate-800/90 px-3 py-1.5 text-xs font-semibold text-gray-800 dark:text-gray-200 shadow-xs hover:border-emerald-500/40 hover:bg-emerald-50/50 dark:hover:bg-slate-700 transition-all focus:outline-none"
                aria-haspopup="true"
                aria-expanded={isOpen}
                title={t('selectLanguage')}
            >
                <Languages size={15} className="text-emerald-600 dark:text-emerald-400" />
                <span className="font-bold">{currentLang.native}</span>
                <ChevronDown
                    size={13}
                    className={`text-gray-500 dark:text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 max-h-80 overflow-y-auto rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-2xl backdrop-blur-xl z-50 py-2 scrollbar-thin">
                    <div className="px-3.5 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-white/10 mb-1">
                        {t('selectLanguage')}
                    </div>
                    {SUPPORTED_LANGUAGES.map((lang) => {
                        const isSelected = currentLang.code === lang.code;
                        return (
                            <button
                                key={lang.code}
                                type="button"
                                onClick={() => changeLanguage(lang.code)}
                                className={`flex items-center justify-between w-full px-3.5 py-2 text-xs text-left transition-colors ${
                                    isSelected
                                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold">{lang.native}</span>
                                    <span className="text-[10px] text-gray-400">({lang.label})</span>
                                </div>
                                {isSelected && <Check size={14} className="text-emerald-600 dark:text-emerald-400" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default LanguageSwitcher;

import React, { useState, useRef, useEffect } from 'react';
import { Languages, Check, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface LanguageOption {
    code: string;
    label: string;
    native: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'te', label: 'Telugu', native: 'తెలుగు' },
    { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
    { code: 'mr', label: 'Marathi', native: 'मराठी' },
    { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
    { code: 'bn', label: 'Bengali', native: 'বাংলা' },
    { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
];

interface LanguageSwitcherProps {
    variant?: 'pill' | 'sidebar';
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ variant = 'pill' }) => {
    const { i18n, t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentLangCode = i18n.resolvedLanguage || i18n.language || 'en';
    const currentLang = SUPPORTED_LANGUAGES.find((lang) => currentLangCode.startsWith(lang.code)) || SUPPORTED_LANGUAGES[0];

    const changeLanguage = (code: string) => {
        i18n.changeLanguage(code);
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

    if (variant === 'sidebar') {
        return (
            <div className="relative w-full" ref={dropdownRef}>
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-lg text-green-100 hover:bg-green-700/60 transition-all group text-left"
                    title={t('language')}
                >
                    <div className="flex items-center gap-3">
                        <Languages size={20} className="text-green-300 group-hover:rotate-12 transition-transform" />
                        <div className="flex flex-col">
                            <span className="font-medium text-sm leading-tight">{currentLang.native}</span>
                            <span className="text-[11px] text-green-300/80 leading-tight">{currentLang.label}</span>
                        </div>
                    </div>
                    <ChevronDown
                        size={16}
                        className={`text-green-300 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    />
                </button>

                {isOpen && (
                    <div className="absolute bottom-full left-0 mb-2 w-60 max-h-72 overflow-y-auto rounded-xl bg-green-950/95 border border-green-600/40 shadow-2xl backdrop-blur-xl z-50 py-1.5 scrollbar-thin scrollbar-thumb-green-700">
                        <div className="px-3 py-1.5 text-xs font-semibold text-green-400 uppercase tracking-wider border-b border-green-800/60">
                            {t('language')} / Select Language
                        </div>
                        {SUPPORTED_LANGUAGES.map((lang) => {
                            const isSelected = currentLang.code === lang.code;
                            return (
                                <button
                                    key={lang.code}
                                    type="button"
                                    onClick={() => changeLanguage(lang.code)}
                                    className={`flex items-center justify-between w-full px-3.5 py-2 text-sm text-left transition-colors ${
                                        isSelected
                                            ? 'bg-green-600/50 text-white font-semibold'
                                            : 'text-green-100 hover:bg-green-800/60'
                                    }`}
                                >
                                    <div className="flex flex-col">
                                        <span className="font-medium">{lang.native}</span>
                                        <span className="text-xs text-green-300/70">{lang.label}</span>
                                    </div>
                                    {isSelected && <Check size={16} className="text-green-300" />}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2.5 rounded-xl border border-white/40 bg-black/40 px-3.5 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur-md transition-all hover:bg-black/60 hover:border-white/60 focus:outline-none focus:ring-2 focus:ring-green-400"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <Languages size={18} className="text-green-400" />
                <span className="font-medium">{currentLang.native}</span>
                <span className="text-xs text-white/70">({currentLang.code.toUpperCase()})</span>
                <ChevronDown
                    size={15}
                    className={`text-white/80 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 max-h-80 overflow-y-auto rounded-2xl border border-white/20 bg-gray-900/90 shadow-2xl backdrop-blur-xl z-50 py-2 scrollbar-thin scrollbar-thumb-gray-700 animate-in fade-in duration-150">
                    <div className="px-3.5 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-white/10 mb-1">
                        Select Language
                    </div>
                    {SUPPORTED_LANGUAGES.map((lang) => {
                        const isSelected = currentLang.code === lang.code;
                        return (
                            <button
                                key={lang.code}
                                type="button"
                                onClick={() => changeLanguage(lang.code)}
                                className={`flex items-center justify-between w-full px-4 py-2 text-sm text-left transition-colors ${
                                    isSelected
                                        ? 'bg-green-600 text-white font-bold'
                                        : 'text-gray-200 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                <div className="flex flex-col">
                                    <span className="font-semibold">{lang.native}</span>
                                    <span className={`text-xs ${isSelected ? 'text-green-100' : 'text-gray-400'}`}>
                                        {lang.label}
                                    </span>
                                </div>
                                {isSelected && <Check size={16} className="text-white" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default LanguageSwitcher;

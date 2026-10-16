import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Send, Bot, User, Trash2 } from 'lucide-react';
import { API_BASE } from '../config';
import { useTranslation } from 'react-i18next';

const ChatAssistant = () => {
    const { t, i18n } = useTranslation();
    const suggestedQuestions = [
        t('suggestedFertilizer'),
        t('suggestedIrrigation'),
        t('suggestedYellowLeaves'),
        t('suggestedSoilMoisture'),
        t('suggestedSeason'),
        t('suggestedSchemes')
    ];
    const initialMessage = { role: 'assistant', content: t('chatWelcome') };
    const [messages, setMessages] = useState<any[]>([initialMessage]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isDemo, setIsDemo] = useState(false);
    const messagesEndRef = useRef<any>(null);

    useEffect(() => {
        setMessages(current => current.length === 1 && current[0].role === 'assistant'
            ? [initialMessage]
            : current);
    }, [i18n.language]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async (text: string) => {
        if (!text.trim()) return;

        const userMessage = { role: 'user', content: text };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const token = JSON.parse(localStorage.getItem('userInfo') || '{}').token;
            const langCode = i18n.language?.slice(0, 2);
            const langNames: Record<string, string> = {
                ta: 'Tamil', hi: 'Hindi', te: 'Telugu', kn: 'Kannada', ml: 'Malayalam',
                mr: 'Marathi', gu: 'Gujarati', bn: 'Bengali', pa: 'Punjabi', en: 'English'
            };
            const { data } = await axios.post(`${API_BASE}/api/ai/chat`, {
                message: text,
                context: {},
                language: langNames[langCode] || 'English'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setIsDemo(!!data.isDemo);
            setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        } catch (error: any) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'assistant', content: error.response?.data?.message || t('chatError') }]);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (e: any) => {
        e.preventDefault();
        await sendMessage(input);
    };

    const handleClear = () => {
        setMessages([initialMessage]);
    };

    return (
        <Layout>
            <div className="flex flex-col h-[calc(100vh-130px)] glass-card dark:bg-slate-900/80 dark:border-slate-800/80 rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 dark:from-emerald-950 dark:via-slate-900 dark:to-teal-950 text-white p-4 flex items-center justify-between border-b border-white/10 dark:border-emerald-500/20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/15 dark:bg-emerald-500/20 backdrop-blur-md flex items-center justify-center border border-white/20 dark:border-emerald-500/30">
                            <Bot size={22} className="text-emerald-200" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-lg font-bold tracking-tight">{t('aiAssistantTitle')}</h1>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                                    {t('online') || 'Active'}
                                </span>
                            </div>
                            <p className="text-xs text-emerald-100/80 dark:text-gray-400">Agricultural intelligence & smart crop advisory</p>
                        </div>
                        {isDemo && (
                            <span className="text-xs bg-amber-400 text-amber-950 font-bold px-2 py-0.5 rounded-full ml-2 shadow-sm">{t('demoMode')}</span>
                        )}
                    </div>
                    <button 
                        onClick={handleClear} 
                        title={t('clearChatTitle')} 
                        className="text-white/70 hover:text-white hover:bg-white/10 dark:hover:bg-slate-800/60 p-2 rounded-xl transition-all"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-gray-50/50 dark:bg-slate-950/40">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex items-start gap-3 max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`p-2 rounded-xl shrink-0 ${
                                    msg.role === 'user' 
                                        ? 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20' 
                                        : 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-gray-200/60 dark:border-slate-700 shadow-sm'
                                }`}>
                                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                </div>
                                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                                    msg.role === 'user' 
                                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-none shadow-md shadow-emerald-600/20' 
                                        : 'bg-white/90 dark:bg-slate-800/90 text-gray-800 dark:text-gray-100 border border-gray-200/70 dark:border-slate-700/70 rounded-tl-none shadow-sm'
                                }`}>
                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-white/90 dark:bg-slate-800/90 text-gray-500 dark:text-gray-400 px-4 py-3 rounded-2xl rounded-tl-none text-xs font-semibold flex items-center gap-2 border border-gray-200/60 dark:border-slate-700 shadow-sm">
                                <Bot size={15} className="animate-spin text-emerald-500" /> {t('thinking')}
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {messages.length === 1 && (
                    <div className="px-4 py-2.5 bg-gray-50/80 dark:bg-slate-950/60 border-t border-gray-100 dark:border-slate-800/60 flex flex-wrap gap-2">
                        {suggestedQuestions.map((q) => (
                            <button
                                key={q}
                                onClick={() => sendMessage(q)}
                                disabled={loading}
                                className="text-xs bg-white dark:bg-slate-800/80 border border-emerald-500/20 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-all disabled:opacity-50 shadow-xs"
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                )}

                <div className="p-3 md:p-4 bg-white/90 dark:bg-slate-900/90 border-t border-gray-100 dark:border-slate-800 backdrop-blur-md">
                    <form onSubmit={handleSend} className="flex gap-2">
                        <input
                            className="flex-1 px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50/70 dark:bg-slate-800/70 text-gray-900 dark:text-white placeholder-gray-400 text-sm"
                            placeholder={t('typeMessage')}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 rounded-xl hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 transition-all flex items-center justify-center shadow-md shadow-emerald-600/20 cursor-pointer"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default ChatAssistant;

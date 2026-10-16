import { useState } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { API_BASE } from '../config';
import { useTranslation } from 'react-i18next';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    farmId?: string;
}

const ReportModal = ({ isOpen, onClose, farmId }: ReportModalProps) => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

    const handleSend = async () => {
        if (!email) {
            setStatus({ type: 'error', msg: t('validEmailRequired') });
            return;
        }

        setLoading(true);
        setStatus(null);

        try {
            const token = JSON.parse(localStorage.getItem('userInfo') || '{}').token;
            // Always send as 'email' method
            await axios.post(`${API_BASE}/api/report/send`,
                { method: 'email', email, farmId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setStatus({ type: 'success', msg: t('reportSent') });
            setTimeout(onClose, 2000);
        } catch (error: any) {
            setStatus({ type: 'error', msg: error.response?.data?.message || t('failedSendReport') });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed inset-0 m-auto w-full max-w-md h-fit bg-white rounded-2xl shadow-xl z-50 p-6 border border-gray-100"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <Send className="text-green-600" size={20} />
                                {t('getSensorReport')}
                            </h2>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-6">

                            <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-sm text-green-800">
                                <b>📧 {t('emailReportSystem')}</b>
                                <p className="mt-1 opacity-90">{t('emailReportDescription')}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t('emailAddress')}</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="user@example.com"
                                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                                />
                                <p className="text-xs text-gray-500 mt-1">{t('sensorReportEmailDescription')}</p>
                            </div>

                            {status && (
                                <div className={`p-3 rounded-lg text-sm font-medium ${status.type === 'success'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                    }`}>
                                    {status.msg}
                                </div>
                            )}

                            <button
                                onClick={handleSend}
                                disabled={loading || !email}
                                className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-green-200 hover:shadow-green-300 transition-all"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                                {t('sendViaEmail')}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ReportModal;

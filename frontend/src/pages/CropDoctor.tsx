import { useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Upload, Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { API_BASE } from '../config';

const CropDoctor = () => {
    const { t, i18n } = useTranslation();
    const [image, setImage] = useState<string | null>(null);
    const [diagnosis, setDiagnosis] = useState<any>(null);
    const [diagnoseError, setDiagnoseError] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const handleImageUpload = (e: any) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
            setDiagnoseError(t('uploadImageFormatError'));
            return;
        }
        if (file.size > 8 * 1024 * 1024) {
            setDiagnoseError(t('imageTooLarge'));
            return;
        }

        setDiagnoseError('');
        const reader = new FileReader();
        reader.onloadend = () => {
            setImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleDiagnose = async () => {
        if (!image) return;
        setLoading(true);
        setDiagnosis(null);
        setDiagnoseError('');
        try {
            const token = JSON.parse(localStorage.getItem('userInfo') || '{}').token;
            const langCode = i18n.language?.slice(0, 2);
            const langNames: Record<string, string> = {
                ta: 'Tamil', hi: 'Hindi', te: 'Telugu', kn: 'Kannada', ml: 'Malayalam',
                mr: 'Marathi', gu: 'Gujarati', bn: 'Bengali', pa: 'Punjabi', en: 'English'
            };
            const { data } = await axios.post(`${API_BASE}/api/crop-doctor/diagnose`,
                { image, language: langNames[langCode] || 'English' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setDiagnosis(data);
        } catch (error: any) {
            console.error(error);
            setDiagnoseError(error.response?.data?.message || error.message || t('diagnosisError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout title={t('cropDoctor')} subtitle="AI Computer Vision Plant Pathology & Botanical Health Analysis">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Upload Card */}
                    <div className="rounded-3xl border border-emerald-500/15 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 p-6 sm:p-8 shadow-md backdrop-blur-xl transition-all">
                        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white font-display flex items-center gap-2">
                            <Upload size={20} className="text-emerald-500" />
                            {t('uploadImageTitle')}
                        </h2>
                        <div className="border-2 border-dashed border-emerald-500/30 dark:border-white/15 rounded-2xl p-8 text-center bg-emerald-500/5 dark:bg-slate-800/40 hover:bg-emerald-500/10 dark:hover:bg-slate-800/70 transition-colors">
                            {image ? (
                                <div className="space-y-4">
                                    <img src={image} alt={t('crop')} className="max-h-60 mx-auto rounded-xl shadow-md object-cover" />
                                    <button
                                        onClick={() => setImage(null)}
                                        className="text-xs font-semibold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 py-1.5 px-3 rounded-lg border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 transition-colors"
                                    >
                                        {t('removeImage')}
                                    </button>
                                </div>
                            ) : (
                                <label className="cursor-pointer space-y-3 block">
                                    <div className="h-12 w-12 mx-auto rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                                        <Upload size={24} />
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                                        {t('clickUploadDragDrop')}<br />
                                        <span className="text-[11px] text-gray-400 dark:text-gray-500">{t('jpgPngSupported')}</span>
                                    </p>
                                    <input id="file-upload" type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                </label>
                            )}
                        </div>
                        <button
                            onClick={handleDiagnose}
                            disabled={!image || loading}
                            className="w-full mt-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-600/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {loading ? t('analyzing') : t('diagnoseDisease')}
                        </button>
                    </div>

                    {/* Results Card */}
                    <div className="rounded-3xl border border-emerald-500/15 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 p-6 sm:p-8 shadow-md backdrop-blur-xl transition-all">
                        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white font-display flex items-center gap-2">
                            <Activity size={20} className="text-emerald-500" />
                            {t('diagnosisResult')}
                        </h2>
                        {diagnoseError && (
                            <div className="bg-rose-500/15 text-rose-700 dark:text-rose-300 p-4 rounded-2xl border border-rose-500/30 mb-4 text-xs font-semibold">
                                {diagnoseError}
                            </div>
                        )}
                        {diagnosis ? (
                            <div className="space-y-4">
                                {diagnosis.confidence < 0.5 ? (
                                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 p-4 rounded-2xl text-xs font-medium">
                                        {diagnosis.diagnosis}
                                    </div>
                                ) : (
                                    <>
                                        <div className="bg-rose-500/10 dark:bg-rose-950/30 p-4 rounded-2xl border border-rose-500/20 flex justify-between items-start gap-3">
                                            <div>
                                                <h3 className="font-bold text-rose-600 dark:text-rose-400 text-sm">{diagnosis.crop}</h3>
                                                <p className="text-xl font-extrabold text-rose-900 dark:text-rose-100 font-display mt-0.5">{diagnosis.diagnosis}</p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <span className="text-[10px] text-gray-500 uppercase tracking-wider block">{t('confidenceLabel')}</span>
                                                <span className="font-bold text-gray-900 dark:text-white text-base">{Math.round((diagnosis.confidence || 0) * 100)}%</span>
                                                <span className={`block text-[11px] font-bold mt-1 px-2.5 py-0.5 rounded-full ${
                                                    diagnosis.severity === 'High'
                                                        ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                                                        : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                                }`}>
                                                    {t(diagnosis.severity?.toLowerCase() || 'moderate')}
                                                </span>
                                            </div>
                                        </div>

                                        {diagnosis.symptoms?.length > 0 && (
                                            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
                                                <h3 className="font-bold text-amber-800 dark:text-amber-300 text-xs mb-2 uppercase tracking-wider">{t('symptoms')}</h3>
                                                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 text-xs">
                                                    {diagnosis.symptoms.map((s: string, i: number) => <li key={i}>{s}</li>)}
                                                </ul>
                                            </div>
                                        )}

                                        {diagnosis.possibleCauses?.length > 0 && (
                                            <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-4">
                                                <h3 className="font-bold text-purple-800 dark:text-purple-300 text-xs mb-2 uppercase tracking-wider">{t('possibleCauses')}</h3>
                                                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 text-xs">
                                                    {diagnosis.possibleCauses.map((s: string, i: number) => <li key={i}>{s}</li>)}
                                                </ul>
                                            </div>
                                        )}

                                        {diagnosis.treatment?.length > 0 && (
                                            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                                                <h3 className="font-bold text-emerald-800 dark:text-emerald-300 text-xs mb-2 uppercase tracking-wider">{t('treatment')}</h3>
                                                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 text-xs">
                                                    {diagnosis.treatment.map((s: string, i: number) => <li key={i}>{s}</li>)}
                                                </ul>
                                            </div>
                                        )}

                                        {diagnosis.prevention?.length > 0 && (
                                            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
                                                <h3 className="font-bold text-cyan-800 dark:text-cyan-300 text-xs mb-2 uppercase tracking-wider">{t('prevention')}</h3>
                                                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 text-xs">
                                                    {diagnosis.prevention.map((s: string, i: number) => <li key={i}>{s}</li>)}
                                                </ul>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-center p-6 text-gray-400 dark:text-gray-500">
                                <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-500 mb-3">
                                    <Activity size={32} />
                                </div>
                                <p className="text-xs font-medium">Upload a leaf or plant photo and click Diagnose Disease to analyze pathology.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default CropDoctor;

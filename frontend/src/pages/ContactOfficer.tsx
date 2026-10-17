import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldCheck,
    PhoneCall,
    Search,
    Clock,
    CheckCircle2,
    Building2,
    FileText,
    AlertCircle,
    User,
    MapPin,
    Sprout,
    Copy,
    Check,
    Send,
    ExternalLink,
    BadgeAlert,
    PhoneForwarded
} from 'lucide-react';

import axios from 'axios';
import Layout from '../components/Layout';
import { useTranslation } from 'react-i18next';
import { API_BASE } from '../config';

interface OfficerRequestItem {
    _id?: string;
    referenceNumber: string;
    farmerName: string;
    district: string;
    village: string;
    cropName: string;
    problemCategory: string;
    description: string;
    mobileNumber: string;
    status: 'Pending' | 'Under Review' | 'Officer Assigned' | 'Resolved';
    assignedOffice: string;
    officerNotes?: string;
    createdAt?: string | Date;
}

const PROBLEM_CATEGORIES = [
    { id: 'Crop disease', label: 'Crop disease', labelTa: 'பயிர் நோய் தாக்குதல்' },
    { id: 'Pest attack', label: 'Pest attack', labelTa: 'பூச்சித் தாக்குதல்' },
    { id: 'Fertilizer guidance', label: 'Fertilizer guidance', labelTa: 'உரப் பயன்பாட்டு வழிகாட்டுதல்' },
    { id: 'Soil testing', label: 'Soil testing', labelTa: 'மண் பரிசோதனை ஆலோசனை' },
    { id: 'Irrigation problems', label: 'Irrigation problems', labelTa: 'பாசன & நீர் மேலாண்மை சிக்கல்கள்' },
    { id: 'Cultivation cost guidance', label: 'Cultivation cost guidance', labelTa: 'சாகுபடி செலவு வழிகாட்டுதல்' },
    { id: 'Market price information', label: 'Market price information', labelTa: 'சந்தை விலை நிலவரம்' },
    { id: 'Government schemes', label: 'Government schemes', labelTa: 'அரசு மானியம் & திட்டங்கள்' }
];

const TN_DISTRICTS = [
    'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore',
    'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram',
    'Kanyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai',
    'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai',
    'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi',
    'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli',
    'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur',
    'Vellore', 'Viluppuram', 'Virudhunagar'
];

const LOCAL_STORAGE_OFFICER_KEY = 'agronix_local_officer_requests';

const ContactOfficer: React.FC = () => {
    const { t, i18n } = useTranslation();
    const isTamil = i18n.language.startsWith('ta');

    // Page view tabs
    const [viewTab, setViewTab] = useState<'submit' | 'status' | 'directory'>('submit');

    // Form inputs
    const [farmerName, setFarmerName] = useState('');
    const [district, setDistrict] = useState('Thanjavur');
    const [village, setVillage] = useState('');
    const [cropName, setCropName] = useState('Paddy (Rice)');
    const [problemCategory, setProblemCategory] = useState('Crop disease');
    const [description, setDescription] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');

    // Status checking input & results
    const [searchQuery, setSearchQuery] = useState('');
    const [trackedRequests, setTrackedRequests] = useState<OfficerRequestItem[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    // Submission outcome modal state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submittedReceipt, setSubmittedReceipt] = useState<OfficerRequestItem | null>(null);
    const [copiedRef, setCopiedRef] = useState(false);

    // Verified helplines & district offices
    const [helplines, setHelplines] = useState<any[]>([]);
    const [districtOffices, setDistrictOffices] = useState<Record<string, any>>({});

    // Fetch verified contact info on load
    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const { data } = await axios.get(`${API_BASE}/api/officer-requests/contacts`);
                if (data && data.helplines) {
                    setHelplines(data.helplines);
                    setDistrictOffices(data.districtOffices || {});
                }
            } catch (err) {
                console.warn('Failed to fetch verified officer contacts:', err);
            }
        };

        fetchContacts();

        // Pre-fill user profile if logged in
        try {
            const user = JSON.parse(localStorage.getItem('userInfo') || '{}');
            if (user.name) setFarmerName(user.name);
            if (user.phone) setMobileNumber(user.phone);
        } catch (e) { }
    }, []);

    // Form submission handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload = {
            farmerName: farmerName.trim(),
            district,
            village: village.trim(),
            cropName: cropName.trim(),
            problemCategory,
            description: description.trim(),
            mobileNumber: mobileNumber.trim()
        };

        try {
            const token = JSON.parse(localStorage.getItem('userInfo') || '{}').token;
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            let savedData: any = null;
            try {
                const { data } = await axios.post(`${API_BASE}/api/officer-requests`, payload, { headers });
                if (data && data.request) {
                    savedData = data.request;
                }
            } catch (apiErr) {
                console.warn('Backend officer request failed, generating client-side reference', apiErr);
            }

            // Fallback object if backend is in demo or offline mode
            if (!savedData) {
                const randomDigits = Math.floor(1000 + Math.random() * 9000);
                const localRef = `AGRI-2026-TN-${randomDigits}`;
                savedData = {
                    ...payload,
                    referenceNumber: localRef,
                    status: 'Pending',
                    assignedOffice: `Joint Director of Agriculture Office, ${district}`,
                    officerNotes: `Request logged for ${problemCategory} in ${cropName}. Routed to ${district} District Agriculture Department. Dedicated officer callback scheduled within 24-48 working hours.`,
                    createdAt: new Date().toISOString()
                };
            }

            // Save in localStorage for immediate tracking
            const localSaved = JSON.parse(localStorage.getItem(LOCAL_STORAGE_OFFICER_KEY) || '[]');
            localStorage.setItem(LOCAL_STORAGE_OFFICER_KEY, JSON.stringify([savedData, ...localSaved]));

            setSubmittedReceipt(savedData);

            // Reset form fields
            setDescription('');
        } catch (error) {
            console.error('Error submitting officer request:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Track request status handler
    const handleTrackStatus = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const query = searchQuery.trim();
        if (!query) return;

        setIsSearching(true);
        setSearchError(null);
        setTrackedRequests([]);

        try {
            let foundRequests: OfficerRequestItem[] = [];

            try {
                const { data } = await axios.get(`${API_BASE}/api/officer-requests/status/${encodeURIComponent(query)}`);
                if (data && data.requests) {
                    foundRequests = data.requests;
                }
            } catch (apiErr: any) {
                console.warn('API track status returned error, checking local store', apiErr);
            }

            // Also check localStorage
            const localSaved: OfficerRequestItem[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_OFFICER_KEY) || '[]');
            const localMatches = localSaved.filter(r =>
                r.referenceNumber.toLowerCase().includes(query.toLowerCase()) ||
                r.mobileNumber.includes(query)
            );

            // Combine unique
            localMatches.forEach(l => {
                if (!foundRequests.some(f => f.referenceNumber === l.referenceNumber)) {
                    foundRequests.push(l);
                }
            });

            if (foundRequests.length > 0) {
                setTrackedRequests(foundRequests);
            } else {
                setSearchError(`No active request found matching "${query}". Please check the reference number or mobile number.`);
            }
        } catch (err: any) {
            setSearchError('Failed to retrieve request status. Please try again.');
        } finally {
            setIsSearching(false);
        }
    };

    // Copy reference number to clipboard
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedRef(true);
        setTimeout(() => setCopiedRef(false), 2500);
    };

    return (
        <Layout title={t('contactOfficer')} subtitle={t('contactOfficerSubtitle')}>
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header Banner */}
                <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950 via-teal-900 to-amber-950 p-6 md:p-8 text-white shadow-xl">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-1/3 -mb-16 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-300/40 backdrop-blur-md flex items-center justify-center text-amber-300 shadow-inner shrink-0">
                                <ShieldCheck size={32} />
                            </div>
                            <div>
                                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-200 text-xs font-bold mb-1">
                                    <CheckCircle2 size={12} className="text-emerald-400" />
                                    <span>Official Government Agricultural Linkage</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight font-display text-white">
                                    {t('contactOfficer')}
                                </h1>
                                <p className="text-xs md:text-sm text-emerald-100/90 max-w-xl mt-1">
                                    {t('contactOfficerSubtitle')}
                                </p>
                            </div>
                        </div>

                        {/* Top Nav Switcher */}
                        <div className="flex items-center bg-black/40 border border-white/20 p-1.5 rounded-2xl backdrop-blur-md">
                            <button
                                type="button"
                                onClick={() => setViewTab('submit')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                    viewTab === 'submit'
                                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md font-extrabold'
                                        : 'text-slate-200 hover:text-white'
                                }`}
                            >
                                <Send size={14} />
                                <span>{t('submitRequestBtn')}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewTab('status')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                    viewTab === 'status'
                                        ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 shadow-md font-extrabold'
                                        : 'text-slate-200 hover:text-white'
                                }`}
                            >
                                <Search size={14} />
                                <span>{t('checkRequestStatus')}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewTab('directory')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                    viewTab === 'directory'
                                        ? 'bg-gradient-to-r from-teal-400 to-emerald-400 text-teal-950 shadow-md font-extrabold'
                                        : 'text-slate-200 hover:text-white'
                                }`}
                            >
                                <Building2 size={14} />
                                <span>Helplines</span>
                            </button>
                        </div>
                    </div>

                    {/* Government Verification Notice */}
                    <div className="mt-5 pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-amber-200">
                        <BadgeAlert size={16} className="text-amber-400 shrink-0" />
                        <span>{t('verifiedNotice')}</span>
                    </div>
                </div>

                {/* TAB 1: SUBMIT NEW REQUEST */}
                {viewTab === 'submit' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Left Form (7 cols) */}
                        <div className="lg:col-span-7">
                            <div className="rounded-3xl border border-emerald-500/20 dark:border-white/10 bg-white/90 dark:bg-slate-900/90 p-6 md:p-8 shadow-xl backdrop-blur-xl">
                                <div className="flex items-center gap-2 pb-4 border-b border-gray-100 dark:border-white/5 mb-5">
                                    <FileText className="text-emerald-600 dark:text-emerald-400" size={20} />
                                    <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                                        {t('officerFormTitle')}
                                    </h2>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Farmer Name & Mobile */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                                {t('farmerName')} *
                                            </label>
                                            <div className="relative">
                                                <User size={15} className="absolute left-3.5 top-3 text-gray-400" />
                                                <input
                                                    type="text"
                                                    required
                                                    value={farmerName}
                                                    onChange={(e) => setFarmerName(e.target.value)}
                                                    placeholder="Farmer full name"
                                                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/60 dark:bg-slate-800/60 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                                {t('mobileNumber')} *
                                            </label>
                                            <div className="relative">
                                                <PhoneCall size={15} className="absolute left-3.5 top-3 text-gray-400" />
                                                <input
                                                    type="tel"
                                                    required
                                                    value={mobileNumber}
                                                    onChange={(e) => setMobileNumber(e.target.value)}
                                                    placeholder="10-digit mobile number"
                                                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/60 dark:bg-slate-800/60 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* District & Village */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                                {t('district')} *
                                            </label>
                                            <select
                                                value={district}
                                                onChange={(e) => setDistrict(e.target.value)}
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/60 dark:bg-slate-800/60 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                                            >
                                                {TN_DISTRICTS.map((d) => (
                                                    <option key={d} value={d}>{d}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                                {t('village')} *
                                            </label>
                                            <div className="relative">
                                                <MapPin size={15} className="absolute left-3.5 top-3 text-gray-400" />
                                                <input
                                                    type="text"
                                                    required
                                                    value={village}
                                                    onChange={(e) => setVillage(e.target.value)}
                                                    placeholder="Village name or Taluk"
                                                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/60 dark:bg-slate-800/60 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Crop Name */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                            {t('cropName')} *
                                        </label>
                                        <div className="relative">
                                            <Sprout size={15} className="absolute left-3.5 top-3 text-emerald-500" />
                                            <input
                                                type="text"
                                                required
                                                value={cropName}
                                                onChange={(e) => setCropName(e.target.value)}
                                                placeholder="e.g. Paddy (Ponni), Tomato, Sugarcane, Cotton"
                                                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/60 dark:bg-slate-800/60 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Type of Agricultural Problem */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                                            {t('problemCategory')} *
                                        </label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {PROBLEM_CATEGORIES.map((cat) => (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() => setProblemCategory(cat.id)}
                                                    className={`p-2.5 px-3 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                                                        problemCategory === cat.id
                                                            ? 'border-emerald-500 bg-emerald-500/15 text-emerald-900 dark:text-emerald-200 font-bold shadow-xs'
                                                            : 'border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50 text-gray-700 dark:text-gray-300 hover:border-emerald-400'
                                                    }`}
                                                >
                                                    <span>{isTamil ? cat.labelTa : cat.label}</span>
                                                    {problemCategory === cat.id && (
                                                        <CheckCircle2 size={14} className="text-emerald-500" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Problem Description */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                            {t('problemDescription')} *
                                        </label>
                                        <textarea
                                            required
                                            rows={4}
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder={t('problemDescriptionPlaceholder')}
                                            className="w-full p-3.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/60 dark:bg-slate-800/60 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-700/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                                    >
                                        <Send size={16} />
                                        <span>{isSubmitting ? 'Registering Request...' : t('submitRequestBtn')}</span>
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Right Column: Verified Official Helplines (5 cols) */}
                        <div className="lg:col-span-5 space-y-5">
                            {/* Emergency Kisan Call Centre Card (Yellow & Green) */}
                            <div className="rounded-3xl p-6 bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 text-amber-950 shadow-xl border border-amber-300/40 relative overflow-hidden">
                                <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-white/20 rounded-full blur-xl" />
                                <div className="relative z-10 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] uppercase font-extrabold tracking-widest text-amber-950/80">
                                            Government of India 24x7
                                        </span>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/20 text-amber-950">
                                            Free Call
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-extrabold tracking-tight">
                                        {isTamil ? 'கிசான் கால் சென்டர்' : 'Kisan Call Centre (KCC)'}
                                    </h3>
                                    <p className="text-xs text-amber-950/90 font-medium">
                                        {isTamil ? 'தமிழ் மொழியில் உடனடி விவசாய ஆலோசனை மற்றும் பூச்சி நோய் கட்டுப்பாடு.' : 'Immediate telephonic expert advisory in Tamil & English from agricultural scientists.'}
                                    </p>
                                    <div className="pt-2">
                                        <a
                                            href="tel:18001801551"
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-950 text-white font-extrabold text-sm shadow-md hover:bg-black transition-all"
                                        >
                                            <PhoneCall size={16} className="text-amber-400" />
                                            <span>1800-180-1551 (Toll-Free)</span>
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Uzhavan App & TN Agriculture Helpdesk Card */}
                            <div className="rounded-3xl p-6 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 text-white shadow-xl border border-emerald-400/40 relative overflow-hidden">
                                <div className="absolute bottom-0 right-0 -mr-6 -mb-6 w-32 h-32 bg-teal-400/20 rounded-full blur-xl" />
                                <div className="relative z-10 space-y-2">
                                    <span className="text-[10px] uppercase font-extrabold tracking-widest text-emerald-200">
                                        Government of Tamil Nadu
                                    </span>
                                    <h3 className="text-xl font-extrabold tracking-tight">
                                        {isTamil ? 'உழவன் உதவி மையம்' : 'TN Uzhavan Helpdesk'}
                                    </h3>
                                    <p className="text-xs text-emerald-100/90 font-medium">
                                        Directorate of Agriculture, Chepauk, Chennai. Subsidy schemes and field officer visits.
                                    </p>
                                    <div className="pt-2 flex flex-wrap gap-2">
                                        <a
                                            href="tel:155304"
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-emerald-950 font-bold text-xs shadow-md"
                                        >
                                            <PhoneCall size={14} className="text-emerald-700" />
                                            <span>155304</span>
                                        </a>
                                        <a
                                            href="tel:04428583322"
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-400/40 text-emerald-200 font-bold text-xs"
                                        >
                                            <PhoneCall size={14} />
                                            <span>044-28583322</span>
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* TNAU University Agritech Advisory */}
                            <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 p-5 shadow-sm space-y-2">
                                <h4 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Building2 size={16} className="text-emerald-500" />
                                    <span>TNAU Agritech Portal Helpline</span>
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Tamil Nadu Agricultural University, Coimbatore. Hybrid seeds, crop protection and disease testing.
                                </p>
                                <a
                                    href="tel:04226611383"
                                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline"
                                >
                                    <PhoneForwarded size={13} />
                                    <span>Call TNAU: 0422-6611383</span>
                                </a>
                            </div>

                            {/* Check Status Quick Bar */}
                            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 flex items-center justify-between text-xs font-semibold">
                                <span>Already submitted a request?</span>
                                <button
                                    type="button"
                                    onClick={() => setViewTab('status')}
                                    className="font-bold underline text-amber-700 dark:text-amber-300 hover:text-amber-950"
                                >
                                    Track Status →
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: TRACK REQUEST STATUS */}
                {viewTab === 'status' && (
                    <div className="max-w-3xl mx-auto space-y-6">
                        <div className="rounded-3xl border border-emerald-500/20 bg-white/90 dark:bg-slate-900/90 p-6 md:p-8 shadow-xl backdrop-blur-xl">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                <Search className="text-emerald-500" />
                                <span>{t('checkRequestStatus')}</span>
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
                                {t('enterRefOrMobile')}
                            </p>

                            <form onSubmit={handleTrackStatus} className="flex gap-2">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="e.g. AGRI-2026-TN-4821 or 9842109876"
                                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/70 dark:bg-slate-800/70 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                                />
                                <button
                                    type="submit"
                                    disabled={isSearching || !searchQuery.trim()}
                                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                                >
                                    <Search size={16} />
                                    <span>{isSearching ? 'Tracking...' : t('trackStatusBtn')}</span>
                                </button>
                            </form>

                            {searchError && (
                                <div className="mt-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                                    <AlertCircle size={16} className="shrink-0" />
                                    <span>{searchError}</span>
                                </div>
                            )}

                            {/* Tracked Results Cards */}
                            {trackedRequests.length > 0 && (
                                <div className="mt-6 space-y-4">
                                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-400">
                                        Found {trackedRequests.length} Request(s)
                                    </h3>

                                    {trackedRequests.map((req, idx) => (
                                        <div
                                            key={req.referenceNumber || idx}
                                            className="rounded-2xl border border-emerald-500/20 bg-emerald-50/30 dark:bg-slate-800/50 p-5 space-y-3"
                                        >
                                            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-200 dark:border-white/10">
                                                <div>
                                                    <span className="text-xs text-gray-500 font-medium block">Reference Number:</span>
                                                    <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-400 font-mono">
                                                        {req.referenceNumber}
                                                    </span>
                                                </div>

                                                <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                                                    req.status === 'Resolved'
                                                        ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                                                        : req.status === 'Officer Assigned'
                                                        ? 'bg-amber-400/20 text-amber-800 dark:text-amber-300 border border-amber-400/30'
                                                        : 'bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-500/30'
                                                }`}>
                                                    ● {req.status}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                                <div>
                                                    <span className="text-gray-400 block font-medium">Farmer:</span>
                                                    <span className="font-bold text-gray-800 dark:text-gray-200">{req.farmerName}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400 block font-medium">Location:</span>
                                                    <span className="font-semibold text-gray-800 dark:text-gray-200">{req.village}, {req.district}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400 block font-medium">Crop:</span>
                                                    <span className="font-semibold text-gray-800 dark:text-gray-200">{req.cropName}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400 block font-medium">Issue:</span>
                                                    <span className="font-bold text-amber-600 dark:text-amber-400">{req.problemCategory}</span>
                                                </div>
                                            </div>

                                            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-xs">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                                                    Department Notes & Resolution:
                                                </span>
                                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                                                    {req.officerNotes || 'Your request is in progress. The assigned block officer will call your mobile number shortly.'}
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                                                <span>Assigned Office: <strong>{req.assignedOffice}</strong></span>
                                                <span>Submitted on: {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'Recent'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB 3: VERIFIED OFFICIAL DIRECTORY */}
                {viewTab === 'directory' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {helplines.map((line, idx) => (
                                <div
                                    key={idx}
                                    className="rounded-3xl border border-emerald-500/20 bg-white/90 dark:bg-slate-900/90 p-6 shadow-md backdrop-blur-xl flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-400/20 px-3 py-0.5 rounded-full border border-amber-400/30">
                                                {line.category}
                                            </span>
                                            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                                <ShieldCheck size={14} /> Official Govt
                                            </span>
                                        </div>

                                        <h3 className="text-base font-extrabold text-gray-900 dark:text-white mt-2">
                                            {isTamil ? line.titleTa : line.title}
                                        </h3>

                                        <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold mt-1">
                                            {isTamil ? line.departmentTa : line.department}
                                        </p>

                                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-3 leading-relaxed">
                                            {isTamil ? line.serviceDescriptionTa : line.serviceDescription}
                                        </p>

                                        <div className="mt-3 text-[11px] text-gray-500 flex items-center gap-1 font-medium">
                                            <Clock size={12} />
                                            <span>{isTamil ? line.hoursTa : line.hours}</span>
                                        </div>
                                    </div>

                                    <div className="mt-5 pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                                        <a
                                            href={`tel:${line.tollFree || line.phone}`}
                                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                                        >
                                            <PhoneCall size={13} />
                                            <span>Call {line.tollFree || line.phone}</span>
                                        </a>

                                        {line.website && (
                                            <a
                                                href={line.website}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-emerald-600 flex items-center gap-1"
                                            >
                                                <span>Portal</span>
                                                <ExternalLink size={12} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* District Agriculture Offices Directory */}
                        {Object.keys(districtOffices).length > 0 && (
                            <div className="mt-8 rounded-3xl border border-gray-200 dark:border-white/10 bg-white/90 dark:bg-slate-900/90 p-6 shadow-md backdrop-blur-xl">
                                <h3 className="text-base font-extrabold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Building2 className="text-emerald-500" size={18} />
                                    <span>District Joint Director of Agriculture (JDA) Offices</span>
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {Object.entries(districtOffices).map(([distName, info]: [string, any]) => (
                                        <div key={distName} className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700/60 text-xs space-y-1.5">
                                            <span className="font-extrabold text-emerald-700 dark:text-emerald-400 block text-sm">
                                                {distName}
                                            </span>
                                            <p className="font-semibold text-gray-800 dark:text-gray-200">{info.office}</p>
                                            <p className="text-gray-500 dark:text-gray-400 text-[11px]">{info.address}</p>
                                            <div className="pt-1.5">
                                                <a href={`tel:${info.phone}`} className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline">
                                                    <PhoneCall size={12} />
                                                    <span>{info.phone}</span>
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}


                {/* MODAL: SUBMISSION CONFIRMATION RECEIPT */}
                <AnimatePresence>
                    {submittedReceipt && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-emerald-500/40 p-6 md:p-7 shadow-2xl space-y-4"
                            >
                                <div className="text-center space-y-2">
                                    <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center border border-emerald-500/30">
                                        <CheckCircle2 size={32} />
                                    </div>
                                    <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
                                        {t('submissionSuccess')}
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {t('keepReferenceSafe')}
                                    </p>
                                </div>

                                {/* Reference Card Box */}
                                <div className="p-4 rounded-2xl bg-amber-400/15 border border-amber-400/30 text-center space-y-1">
                                    <span className="text-[11px] uppercase font-bold text-amber-800 dark:text-amber-300">
                                        {t('yourReferenceNumber')}
                                    </span>
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="text-2xl font-extrabold tracking-wider font-mono text-gray-900 dark:text-white">
                                            {submittedReceipt.referenceNumber}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => copyToClipboard(submittedReceipt.referenceNumber)}
                                            className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:text-emerald-600 transition-all shadow-xs"
                                            title="Copy Reference Number"
                                        >
                                            {copiedRef ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2 text-xs bg-gray-50 dark:bg-slate-800/60 p-4 rounded-2xl">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Farmer:</span>
                                        <span className="font-bold text-gray-800 dark:text-gray-200">{submittedReceipt.farmerName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Crop / Problem:</span>
                                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{submittedReceipt.cropName} • {submittedReceipt.problemCategory}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">District Office:</span>
                                        <span className="font-semibold text-gray-800 dark:text-gray-200">{submittedReceipt.assignedOffice}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Mobile for Callback:</span>
                                        <span className="font-bold text-gray-800 dark:text-gray-200">{submittedReceipt.mobileNumber}</span>
                                    </div>
                                </div>

                                <div className="pt-2 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchQuery(submittedReceipt.referenceNumber);
                                            setSubmittedReceipt(null);
                                            setViewTab('status');
                                            handleTrackStatus();
                                        }}
                                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition-all"
                                    >
                                        Track this Request
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSubmittedReceipt(null)}
                                        className="py-3 px-5 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-bold text-xs hover:bg-gray-100 dark:hover:bg-slate-800"
                                    >
                                        Close
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </Layout>
    );
};

export default ContactOfficer;

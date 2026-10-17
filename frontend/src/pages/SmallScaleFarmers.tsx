import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sprout,
    ShoppingBasket,
    TrendingUp,
    Users,
    Landmark,
    PhoneCall,
    Volume2,
    VolumeX,
    PlusCircle,
    CheckCircle,
    CheckCircle2,
    ShieldCheck,
    Calculator,
    MapPin,
    Sparkles,
    ExternalLink,
    Filter
} from 'lucide-react';

import { Link } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import { useTranslation } from 'react-i18next';
import { API_BASE } from '../config';

interface SmallListing {
    _id?: string;
    farmerName: string;
    mobileNumber: string;
    district: string;
    village: string;
    landAreaAcres: number;
    cropName: string;
    variety?: string;
    quantity: number;
    unit: string;
    pricePerUnit: number;
    harvestDate?: string;
    description?: string;
    isOrganic: boolean;
    status?: string;
}

interface Buyer {
    id: string;
    name: string;
    nameTa: string;
    type: string;
    typeTa: string;
    location: string;
    locationTa: string;
    contact: string;
    minQuantity: string;
    acceptedCrops: string[];
    acceptedCropsTa: string[];
    buyingPriceStatus: string;
    paymentTerm: string;
    paymentTermTa: string;
    verified: boolean;
}

interface Scheme {
    id: string;
    title: string;
    titleTa: string;
    category: string;
    categoryTa: string;
    benefit: string;
    benefitTa: string;
    eligibility: string;
    eligibilityTa: string;
    documents: string[];
    documentsTa: string[];
    officialLink: string;
    helpline: string;
}

interface FarmerGroup {
    name: string;
    nameTa: string;
    location: string;
    locationTa: string;
    members: string;
    membersTa: string;
    services: string[];
    servicesTa: string[];
    contact: string;
}

interface PriceComparison {
    crop: string;
    cropTa: string;
    unit: string;
    mandiPrice: number;
    retailPrice: number;
    mspPrice: number;
    farmerDirectPrice: number;
    benefitText: string;
    benefitTextTa: string;
}

const TAMIL_NADU_DISTRICTS = [
    'Coimbatore', 'Thanjavur', 'Madurai', 'Salem', 'Tiruchirappalli',
    'Erode', 'Tirunelveli', 'Dindigul', 'Cuddalore', 'Vellore',
    'Dharmapuri', 'Krishnagiri', 'Theni', 'Tiruppur', 'Villupuram',
    'Kanchipuram', 'Nagapattinam', 'Pudukkottai', 'Ramanathapuram', 'Sivaganga'
];

const LOCAL_STORAGE_LISTINGS_KEY = 'agronix_local_small_listings';
const LOCAL_STORAGE_PROFILE_KEY = 'agronix_small_farmer_profile';

const SmallScaleFarmers: React.FC = () => {
    const { t, i18n } = useTranslation();
    const isTamil = i18n.language.startsWith('ta');

    // Section Nav Tabs
    const [activeSection, setActiveSection] = useState<'listings' | 'register' | 'prices' | 'buyers' | 'groups' | 'schemes'>('listings');

    // Data States
    const [listings, setListings] = useState<SmallListing[]>([]);
    const [buyers, setBuyers] = useState<Buyer[]>([]);
    const [schemes, setSchemes] = useState<Scheme[]>([]);
    const [groups, setGroups] = useState<FarmerGroup[]>([]);
    const [priceComparisons, setPriceComparisons] = useState<PriceComparison[]>([]);
    const [selectedDistrictFilter, setSelectedDistrictFilter] = useState<string>('All');

    // Audio narration state
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);

    // Registration Form State
    const [regName, setRegName] = useState('');
    const [regPhone, setRegPhone] = useState('');
    const [regDistrict, setRegDistrict] = useState('Coimbatore');
    const [regVillage, setRegVillage] = useState('');
    const [regLandSize, setRegLandSize] = useState('1.5');
    const [regCrops, setRegCrops] = useState('Tomato, Brinjal, Greens');
    const [regSuccess, setRegSuccess] = useState(false);
    const [savedProfile, setSavedProfile] = useState<any>(null);

    // New Listing Form State
    const [newCrop, setNewCrop] = useState('');
    const [newVariety, setNewVariety] = useState('');
    const [newQuantity, setNewQuantity] = useState<number | ''>(25);
    const [newUnit, setNewUnit] = useState('kg');
    const [newPrice, setNewPrice] = useState<number | ''>(30);
    const [newHarvestDate, setNewHarvestDate] = useState('Today (Fresh Harvest)');
    const [newDescription, setNewDescription] = useState('');
    const [newIsOrganic, setNewIsOrganic] = useState(false);
    const [listingSuccess, setListingSuccess] = useState(false);
    const [showListingModal, setShowListingModal] = useState(false);

    // Fetch listings, buyers, schemes, groups, and price comparisons
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Listings
                try {
                    const { data } = await axios.get(`${API_BASE}/api/small-farmers/listings`);
                    if (data && data.listings) setListings(data.listings);
                } catch (e) {
                    const local = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LISTINGS_KEY) || '[]');
                    if (local.length > 0) setListings(local);
                }

                // Buyers
                try {
                    const { data } = await axios.get(`${API_BASE}/api/small-farmers/buyers`);
                    if (data && data.buyers) setBuyers(data.buyers);
                } catch (e) {
                    console.warn(e);
                }

                // Schemes
                try {
                    const { data } = await axios.get(`${API_BASE}/api/small-farmers/schemes`);
                    if (data && data.schemes) setSchemes(data.schemes);
                } catch (e) {
                    console.warn(e);
                }

                // Groups
                try {
                    const { data } = await axios.get(`${API_BASE}/api/small-farmers/groups`);
                    if (data && data.groups) setGroups(data.groups);
                } catch (e) {
                    console.warn(e);
                }

                // Comparisons
                try {
                    const { data } = await axios.get(`${API_BASE}/api/small-farmers/comparisons`);
                    if (data && data.comparisons) setPriceComparisons(data.comparisons);
                } catch (e) {
                    console.warn(e);
                }

                // Profile
                const profile = localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY);
                if (profile) {
                    const parsed = JSON.parse(profile);
                    setSavedProfile(parsed);
                    setRegName(parsed.name || '');
                    setRegPhone(parsed.phone || '');
                    setRegDistrict(parsed.district || 'Coimbatore');
                    setRegVillage(parsed.village || '');
                }
            } catch (err) {
                console.error(err);
            }
        };

        fetchData();
    }, []);

    // Audio Narration using Web Speech API
    const handleToggleAudio = () => {
        if (!('speechSynthesis' in window)) {
            alert('Speech synthesis is not supported in this browser.');
            return;
        }

        if (isPlayingAudio) {
            window.speechSynthesis.cancel();
            setIsPlayingAudio(false);
            return;
        }

        const tamilText = `வணக்கம் விவசாய தோழரே! இது சிறு மற்றும் குறு விவசாயிகளுக்கான சிறப்பு சேவை மையம். உங்கள் நிலம் அரை ஏக்கராக இருந்தாலும், உங்களிடம் ஐந்து கிலோ அல்லது பத்து கிலோ விளைபொருள் இருந்தாலும் இடைத்தரகர் இன்றி நேரடியாக நியாய விலைக்கு விற்கலாம். அருகில் உள்ள அங்கீகரிக்கப்பட்ட கொள்முதல் நிலையங்கள், அரசு நலத்திட்டங்கள் மற்றும் குறைந்த செலவு சாகுபடி முறைகளை இங்கு எளிதாகப் பார்க்கலாம். உதவிக்கு மேலே உள்ள பொத்தான்களைப் பயன்படுத்துங்கள்.`;

        const englishText = `Welcome farmer friend! This is the Small-Scale Farmer Support Hub. Even if you have half an acre of land or a small harvest of 5 to 10 kilograms, you can list and sell your produce directly at fair prices with zero middlemen commission. Access nearby verified buyers, government subsidies, and cultivation planning easily.`;

        const textToSpeak = isTamil ? tamilText : englishText;
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = isTamil ? 'ta-IN' : 'en-US';
        utterance.rate = 0.9;

        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);

        setIsPlayingAudio(true);
        window.speechSynthesis.speak(utterance);
    };

    // Farmer Profile Registration
    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        const profile = {
            name: regName,
            phone: regPhone,
            district: regDistrict,
            village: regVillage,
            landSize: regLandSize,
            crops: regCrops,
            registeredAt: new Date().toLocaleDateString()
        };
        localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(profile));
        setSavedProfile(profile);
        setRegSuccess(true);
        setTimeout(() => setRegSuccess(false), 5000);
    };

    // Create Small Listing
    const handleCreateListing = async (e: React.FormEvent) => {
        e.preventDefault();
        const farmerName = regName || savedProfile?.name || 'Small Farmer';
        const phone = regPhone || savedProfile?.phone || '9876543210';
        const district = regDistrict || savedProfile?.district || 'Coimbatore';
        const village = regVillage || savedProfile?.village || 'Local Village';

        const payload: SmallListing = {
            farmerName,
            mobileNumber: phone,
            district,
            village,
            landAreaAcres: Number(regLandSize) || 1,
            cropName: newCrop || 'Fresh Crop',
            variety: newVariety || 'Country Native',
            quantity: Number(newQuantity) || 10,
            unit: newUnit,
            pricePerUnit: Number(newPrice) || 20,
            harvestDate: newHarvestDate,
            description: newDescription,
            isOrganic: newIsOrganic,
            status: 'Available'
        };

        try {
            try {
                await axios.post(`${API_BASE}/api/small-farmers/listings`, payload);
            } catch (err) {
                console.warn('Backend save failed, saved locally', err);
            }

            const updatedListings = [payload, ...listings];
            setListings(updatedListings);
            localStorage.setItem(LOCAL_STORAGE_LISTINGS_KEY, JSON.stringify(updatedListings));

            setListingSuccess(true);
            setShowListingModal(false);
            setNewCrop('');
            setNewVariety('');
            setNewQuantity(20);
            setNewPrice(30);
            setNewDescription('');

            setTimeout(() => setListingSuccess(false), 5000);
        } catch (error) {
            console.error('Failed to create listing', error);
        }
    };

    const filteredListings = selectedDistrictFilter === 'All'
        ? listings
        : listings.filter(l => l.district.toLowerCase() === selectedDistrictFilter.toLowerCase());

    return (
        <Layout title={t('smallScaleFarmers')} subtitle={t('smallScaleFarmersSubtitle')}>
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Hero Banner with Cream & Green Warm Palette */}
                <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950 via-teal-900 to-amber-950 p-6 md:p-8 text-white shadow-xl">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-1/4 -mb-16 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-200 text-xs font-bold backdrop-blur-md">
                                <Sparkles size={14} className="text-amber-300" />
                                <span>{t('smallScaleFarmers')} • Tamil Nadu Hub</span>
                            </div>
                            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-display text-white">
                                {isTamil ? 'சிறு, குறு விவசாயிகள் ஆதரவு மையம்' : 'Small-Scale Farmer Support Hub'}
                            </h1>
                            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl">
                                {t('smallBatchNotice')}
                            </p>
                        </div>

                        {/* Audio / Voice Guidance Button & Quick Actions */}
                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                onClick={handleToggleAudio}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                                    isPlayingAudio
                                        ? 'bg-rose-500 text-white animate-pulse'
                                        : 'bg-amber-400 hover:bg-amber-300 text-amber-950 shadow-amber-400/20'
                                }`}
                                title={isPlayingAudio ? t('stopAudio') : t('listenTamilAudio')}
                            >
                                {isPlayingAudio ? <VolumeX size={16} /> : <Volume2 size={16} />}
                                <span>{isPlayingAudio ? t('stopAudio') : t('listenTamilAudio')}</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowListingModal(true)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-extrabold shadow-md shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                            >
                                <PlusCircle size={16} />
                                <span>{t('listSmallBatchCrop')}</span>
                            </button>
                        </div>
                    </div>

                    {/* Verified Farmer Badge Status */}
                    {savedProfile && (
                        <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-amber-200 gap-2">
                            <div className="flex items-center gap-2">
                                <ShieldCheck size={16} className="text-emerald-400" />
                                <span>Registered Farmer: <strong>{savedProfile.name}</strong> ({savedProfile.district}, {savedProfile.landSize} Acres)</span>
                            </div>
                            <span className="text-[11px] bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
                                Verified Small Scale Member
                            </span>
                        </div>
                    )}
                </div>

                {/* Success Alert */}
                {(listingSuccess || regSuccess) && (
                    <div className="rounded-2xl bg-emerald-500/15 border border-emerald-500/30 p-4 px-5 text-emerald-900 dark:text-emerald-200 flex items-center gap-3 shadow-md backdrop-blur-md">
                        <CheckCircle2 size={22} className="text-emerald-500 shrink-0" />
                        <span className="text-sm font-bold">
                            {listingSuccess ? 'Your small crop batch has been listed successfully!' : 'Your small farmer profile has been saved successfully!'}
                        </span>
                    </div>
                )}

                {/* Sub-navigation Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {[
                        { id: 'listings', label: t('smallListingsTitle'), icon: <ShoppingBasket size={16} /> },
                        { id: 'prices', label: t('marketPriceComparison'), icon: <TrendingUp size={16} /> },
                        { id: 'buyers', label: t('buyerConnections'), icon: <Users size={16} /> },
                        { id: 'groups', label: t('farmerGroupsTitle'), icon: <Sprout size={16} /> },
                        { id: 'schemes', label: t('govSchemesTitle'), icon: <Landmark size={16} /> },
                        { id: 'register', label: t('smallFarmerRegistration'), icon: <ShieldCheck size={16} /> },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveSection(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                                activeSection === tab.id
                                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20'
                                    : 'bg-white/80 dark:bg-slate-900/80 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-slate-800 border border-gray-200/70 dark:border-white/10'
                            }`}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* SECTION 1: SMALL QUANTITY PRODUCT LISTINGS */}
                {activeSection === 'listings' && (
                    <div className="space-y-6">
                        {/* District Filter & CTA */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-gray-200 dark:border-white/10 p-4 px-5">
                            <div className="flex items-center gap-2">
                                <Filter size={16} className="text-emerald-600 dark:text-emerald-400" />
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Filter by District:</span>
                                <select
                                    value={selectedDistrictFilter}
                                    onChange={(e) => setSelectedDistrictFilter(e.target.value)}
                                    className="px-3 py-1.5 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-gray-900 dark:text-white"
                                >
                                    <option value="All">All Districts (அனைத்து மாவட்டங்கள்)</option>
                                    {TAMIL_NADU_DISTRICTS.map((d) => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowListingModal(true)}
                                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                            >
                                <PlusCircle size={15} />
                                <span>{t('listSmallBatchCrop')}</span>
                            </button>
                        </div>

                        {/* Listings Cards Grid */}
                        {filteredListings.length === 0 ? (
                            <div className="text-center py-16 rounded-3xl border border-dashed border-gray-300 dark:border-white/10 bg-white/40 dark:bg-slate-900/40 p-8">
                                <ShoppingBasket size={48} className="mx-auto text-emerald-500/40 mb-3" />
                                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto">
                                    {t('noSmallListings')}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {filteredListings.map((listing, idx) => (
                                    <motion.div
                                        key={listing._id || idx}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="rounded-3xl border border-emerald-500/15 dark:border-white/10 bg-white/90 dark:bg-slate-900/90 p-5 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-lg font-bold text-gray-900 dark:text-white">
                                                    {listing.cropName}
                                                </span>
                                                {listing.isOrganic && (
                                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                                                        🌿 Organic
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-baseline gap-1 text-emerald-700 dark:text-emerald-400 font-extrabold text-xl mb-3">
                                                <span>₹{listing.pricePerUnit}</span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">/ {listing.unit}</span>
                                            </div>

                                            <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300 mb-4 bg-gray-50 dark:bg-slate-800/60 p-3 rounded-2xl">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-400 font-medium">Available Qty:</span>
                                                    <span className="font-bold text-gray-900 dark:text-white">
                                                        {listing.quantity} {listing.unit}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-400 font-medium">Farmer:</span>
                                                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                                                        {listing.farmerName}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-400 font-medium">Location:</span>
                                                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                                        <MapPin size={12} />
                                                        {listing.village}, {listing.district}
                                                    </span>
                                                </div>
                                                {listing.harvestDate && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-400 font-medium">Harvest:</span>
                                                        <span className="text-gray-700 dark:text-gray-300">{listing.harvestDate}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {listing.description && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic line-clamp-2">
                                                    "{listing.description}"
                                                </p>
                                            )}
                                        </div>

                                        <a
                                            href={`tel:${listing.mobileNumber}`}
                                            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                                        >
                                            <PhoneCall size={14} />
                                            <span>Call Farmer ({listing.mobileNumber})</span>
                                        </a>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* SECTION 2: CURRENT MARKET PRICE COMPARISON */}
                {activeSection === 'prices' && (
                    <div className="space-y-6">
                        <div className="rounded-3xl border border-emerald-500/20 bg-white/80 dark:bg-slate-900/80 p-6 shadow-md backdrop-blur-xl">
                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-white/5">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <TrendingUp className="text-emerald-500" />
                                        <span>{t('marketPriceComparison')}</span>
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        Transparent comparison between Mandi wholesale, Retail market, Govt MSP and Direct farmer price.
                                    </p>
                                </div>
                                <span className="text-xs bg-amber-400/20 text-amber-800 dark:text-amber-300 font-bold px-3 py-1 rounded-full border border-amber-400/30">
                                    Real-time Analysis
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {priceComparisons.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:border-emerald-500/40 transition-all space-y-3"
                                    >
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-extrabold text-base text-gray-900 dark:text-white">
                                                {isTamil ? item.cropTa : item.crop}
                                            </h4>
                                            <span className="text-xs text-gray-400 font-semibold">per {item.unit}</span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40">
                                                <span className="text-[10px] text-rose-600 dark:text-rose-400 uppercase font-bold block">{t('mandiWholesale')}</span>
                                                <span className="text-sm font-extrabold text-rose-700 dark:text-rose-300">₹{item.mandiPrice}</span>
                                            </div>

                                            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40">
                                                <span className="text-[10px] text-amber-700 dark:text-amber-400 uppercase font-bold block">{t('retailMarket')}</span>
                                                <span className="text-sm font-extrabold text-amber-800 dark:text-amber-300">₹{item.retailPrice}</span>
                                            </div>

                                            <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-900/40">
                                                <span className="text-[10px] text-cyan-700 dark:text-cyan-400 uppercase font-bold block">{t('govMSP')}</span>
                                                <span className="text-sm font-extrabold text-cyan-800 dark:text-cyan-300">₹{item.mspPrice}</span>
                                            </div>

                                            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700">
                                                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 uppercase font-bold block">{t('farmerDirect')}</span>
                                                <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300">₹{item.farmerDirectPrice}</span>
                                            </div>
                                        </div>

                                        <div className="pt-2 border-t border-gray-100 dark:border-slate-800 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                                            <Sparkles size={13} className="text-amber-500 shrink-0" />
                                            <span>{isTamil ? item.benefitTextTa : item.benefitText}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Direct Link to Cultivation Cost Calculator */}
                        <div className="rounded-3xl p-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600 text-white flex flex-col md:flex-row justify-between items-center gap-4 shadow-xl">
                            <div>
                                <h3 className="text-lg font-bold">Want to know your exact cultivation cost and net profit?</h3>
                                <p className="text-xs text-emerald-100 mt-1">Use our dedicated Cultivation Cost Calculator for land sizes from 0.25 to 5 acres.</p>
                            </div>
                            <Link
                                to="/cultivation-cost"
                                className="px-5 py-3 rounded-2xl bg-white text-emerald-950 font-extrabold text-xs shadow-md hover:bg-emerald-50 transition-all flex items-center gap-2 shrink-0"
                            >
                                <Calculator size={16} />
                                <span>{t('cultivationCost')} →</span>
                            </Link>
                        </div>
                    </div>
                )}

                {/* SECTION 3: NEARBY VERIFIED BUYERS */}
                {activeSection === 'buyers' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {buyers.map((buyer) => (
                                <div
                                    key={buyer.id}
                                    className="rounded-3xl border border-emerald-500/20 bg-white/90 dark:bg-slate-900/90 p-6 shadow-md backdrop-blur-xl flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-500/20">
                                                {isTamil ? buyer.typeTa : buyer.type}
                                            </span>
                                            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                                <CheckCircle size={13} /> Verified
                                            </span>
                                        </div>

                                        <h3 className="text-base font-extrabold text-gray-900 dark:text-white mt-1">
                                            {isTamil ? buyer.nameTa : buyer.name}
                                        </h3>

                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                                            <MapPin size={13} className="text-amber-500" />
                                            <span>{isTamil ? buyer.locationTa : buyer.location}</span>
                                        </p>

                                        <div className="mt-4 space-y-2 text-xs bg-gray-50 dark:bg-slate-800/60 p-3.5 rounded-2xl">
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">{t('minQtyAccepted')}:</span>
                                                <span className="font-bold text-gray-800 dark:text-gray-200">{buyer.minQuantity}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">{t('paymentTerms')}:</span>
                                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{isTamil ? buyer.paymentTermTa : buyer.paymentTerm}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-400 block mb-1">{t('acceptedCrops')}:</span>
                                                <div className="flex flex-wrap gap-1">
                                                    {(isTamil ? buyer.acceptedCropsTa : buyer.acceptedCrops).map((crop, cIdx) => (
                                                        <span key={cIdx} className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 text-[10px] font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-600">
                                                            {crop}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-5 pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                                            {buyer.buyingPriceStatus}
                                        </span>
                                        <a
                                            href={`tel:${buyer.contact}`}
                                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                                        >
                                            <PhoneCall size={13} />
                                            <span>{t('callBuyer')} ({buyer.contact})</span>
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* SECTION 4: FARMER GROUPS & COOPERATIVES */}
                {activeSection === 'groups' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {groups.map((grp, idx) => (
                                <div
                                    key={idx}
                                    className="rounded-3xl border border-emerald-500/15 dark:border-white/10 bg-white/90 dark:bg-slate-900/90 p-6 shadow-md backdrop-blur-xl flex flex-col justify-between"
                                >
                                    <div>
                                        <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full border border-amber-300/40">
                                            {isTamil ? grp.membersTa : grp.members}
                                        </span>

                                        <h3 className="text-base font-extrabold text-gray-900 dark:text-white mt-3">
                                            {isTamil ? grp.nameTa : grp.name}
                                        </h3>

                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                                            <MapPin size={13} className="text-emerald-500" />
                                            <span>{isTamil ? grp.locationTa : grp.location}</span>
                                        </p>

                                        <div className="mt-4 space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
                                            <span className="font-bold text-gray-800 dark:text-gray-200 block mb-1">
                                                {t('keyServices')}:
                                            </span>
                                            {(isTamil ? grp.servicesTa : grp.services).map((srv, sIdx) => (
                                                <div key={sIdx} className="flex items-start gap-1.5">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                                    <span>{srv}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-5 pt-4 border-t border-gray-100 dark:border-white/5">
                                        <a
                                            href={`tel:${grp.contact}`}
                                            className="w-full py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 text-gray-900 dark:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
                                        >
                                            <PhoneCall size={14} className="text-emerald-500" />
                                            <span>Contact FPO ({grp.contact})</span>
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* SECTION 5: GOVERNMENT SCHEMES FOR SMALL FARMERS */}
                {activeSection === 'schemes' && (
                    <div className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {schemes.map((scheme) => (
                                <div
                                    key={scheme.id}
                                    className="rounded-3xl border border-emerald-500/20 bg-white/90 dark:bg-slate-900/90 p-6 shadow-md backdrop-blur-xl flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-900 dark:text-amber-300 border border-amber-400/30">
                                                {isTamil ? scheme.categoryTa : scheme.category}
                                            </span>
                                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                                                Govt Certified
                                            </span>
                                        </div>

                                        <h3 className="text-base font-extrabold text-gray-900 dark:text-white mt-1">
                                            {isTamil ? scheme.titleTa : scheme.title}
                                        </h3>

                                        <div className="mt-3 p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-500/20 text-xs text-emerald-950 dark:text-emerald-200 space-y-1">
                                            <span className="font-extrabold uppercase tracking-wider text-[10px] text-emerald-700 dark:text-emerald-400 block">
                                                {t('schemeBenefits')}
                                            </span>
                                            <p className="font-medium leading-relaxed">
                                                {isTamil ? scheme.benefitTa : scheme.benefit}
                                            </p>
                                        </div>

                                        <div className="mt-3 space-y-2 text-xs text-gray-600 dark:text-gray-300">
                                            <div>
                                                <span className="font-bold text-gray-800 dark:text-gray-200">{t('schemeEligibility')}:</span>
                                                <p className="text-gray-500 dark:text-gray-400 mt-0.5">{isTamil ? scheme.eligibilityTa : scheme.eligibility}</p>
                                            </div>
                                            <div>
                                                <span className="font-bold text-gray-800 dark:text-gray-200">{t('requiredDocuments')}:</span>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {(isTamil ? scheme.documentsTa : scheme.documents).map((doc, dIdx) => (
                                                        <span key={dIdx} className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-slate-800 text-[10px] font-semibold text-gray-700 dark:text-gray-300">
                                                            {doc}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-5 pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-xs">
                                        <a
                                            href={`tel:${scheme.helpline.split('/')[0].trim()}`}
                                            className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1"
                                        >
                                            <PhoneCall size={13} />
                                            <span>{scheme.helpline}</span>
                                        </a>

                                        <a
                                            href={scheme.officialLink}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition-all shadow-xs"
                                        >
                                            <span>{t('officialPortal')}</span>
                                            <ExternalLink size={12} />
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* SECTION 6: SIMPLE FARMER REGISTRATION */}
                {activeSection === 'register' && (
                    <div className="max-w-2xl mx-auto">
                        <div className="rounded-3xl border border-emerald-500/20 bg-white/90 dark:bg-slate-900/90 p-6 md:p-8 shadow-xl backdrop-blur-xl">
                            <div className="text-center mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-500 mx-auto flex items-center justify-center mb-2">
                                    <Sprout size={24} />
                                </div>
                                <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
                                    {t('smallFarmerRegistration')}
                                </h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Register in 1 minute to receive direct buyer inquiries and government subsidy notifications.
                                </p>
                            </div>

                            <form onSubmit={handleRegister} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                        {t('smallFarmerName')} *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={regName}
                                        onChange={(e) => setRegName(e.target.value)}
                                        placeholder="e.g. Murugesan K."
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/60 dark:bg-slate-800/60 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                            {t('smallFarmerPhone')} *
                                        </label>
                                        <input
                                            type="tel"
                                            required
                                            value={regPhone}
                                            onChange={(e) => setRegPhone(e.target.value)}
                                            placeholder="10-digit mobile number"
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/60 dark:bg-slate-800/60 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                            {t('smallFarmerDistrict')} *
                                        </label>
                                        <select
                                            value={regDistrict}
                                            onChange={(e) => setRegDistrict(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/60 dark:bg-slate-800/60 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                                        >
                                            {TAMIL_NADU_DISTRICTS.map((d) => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                            {t('smallFarmerVillage')} *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={regVillage}
                                            onChange={(e) => setRegVillage(e.target.value)}
                                            placeholder="Village name or Taluk"
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/60 dark:bg-slate-800/60 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                            {t('smallFarmerLandArea')} *
                                        </label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            required
                                            value={regLandSize}
                                            onChange={(e) => setRegLandSize(e.target.value)}
                                            placeholder="e.g. 1.5"
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/60 dark:bg-slate-800/60 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                        {t('smallFarmerPrimaryCrops')}
                                    </label>
                                    <input
                                        type="text"
                                        value={regCrops}
                                        onChange={(e) => setRegCrops(e.target.value)}
                                        placeholder="e.g. Paddy, Tomato, Coconut"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/60 dark:bg-slate-800/60 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
                                >
                                    Save Small Farmer Profile
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL: ADD SMALL QUANTITY PRODUCE LISTING */}
                <AnimatePresence>
                    {showListingModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-emerald-500/30 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
                            >
                                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
                                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                        <PlusCircle size={20} />
                                        <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                                            {t('listSmallBatchCrop')}
                                        </h3>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowListingModal(false)}
                                        className="text-gray-400 hover:text-gray-600 text-sm font-bold"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <form onSubmit={handleCreateListing} className="space-y-3.5">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                            Crop Name (பயிர் / காய் பெயர்) *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={newCrop}
                                            onChange={(e) => setNewCrop(e.target.value)}
                                            placeholder="e.g. Country Tomato, Green Brinjal, Small Onion"
                                            className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/60 dark:bg-slate-800 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                                {t('quantityForSale')} *
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                required
                                                value={newQuantity}
                                                onChange={(e) => setNewQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                                                placeholder="e.g. 15"
                                                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/60 dark:bg-slate-800 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                                Unit (அளவீடு) *
                                            </label>
                                            <select
                                                value={newUnit}
                                                onChange={(e) => setNewUnit(e.target.value)}
                                                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/60 dark:bg-slate-800 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                                            >
                                                <option value="kg">kg (கிலோ)</option>
                                                <option value="crate">crate / கூடை</option>
                                                <option value="bag">bag / மூட்டை</option>
                                                <option value="quintal">quintal / குவிண்டால்</option>
                                                <option value="bundle">bundle / கட்டு</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                            {t('askingPricePerUnit')} *
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3.5 top-2 text-gray-400 text-sm">₹</span>
                                            <input
                                                type="number"
                                                min="1"
                                                required
                                                value={newPrice}
                                                onChange={(e) => setNewPrice(e.target.value === '' ? '' : Number(e.target.value))}
                                                placeholder="e.g. 25"
                                                className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/60 dark:bg-slate-800 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                            {t('harvestDateReady')}
                                        </label>
                                        <input
                                            type="text"
                                            value={newHarvestDate}
                                            onChange={(e) => setNewHarvestDate(e.target.value)}
                                            placeholder="e.g. Fresh Plucked Today / Ready tomorrow"
                                            className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/60 dark:bg-slate-800 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                            Short Description / குறிப்பு
                                        </label>
                                        <textarea
                                            rows={2}
                                            value={newDescription}
                                            onChange={(e) => setNewDescription(e.target.value)}
                                            placeholder="e.g. Chemical-free home farm grown, tender quality, ready for pickup."
                                            className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/60 dark:bg-slate-800 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                                        />
                                    </div>

                                    <div className="flex items-center gap-2 pt-1">
                                        <input
                                            type="checkbox"
                                            id="organicCheck"
                                            checked={newIsOrganic}
                                            onChange={(e) => setNewIsOrganic(e.target.checked)}
                                            className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                                        />
                                        <label htmlFor="organicCheck" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                            {t('organicCertified')}
                                        </label>
                                    </div>

                                    <div className="pt-3 border-t border-gray-100 dark:border-white/10 flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowListingModal(false)}
                                            className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-bold text-xs"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md"
                                        >
                                            {t('listProduceBtn')}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </Layout>
    );
};

export default SmallScaleFarmers;

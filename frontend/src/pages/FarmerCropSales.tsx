import { ChangeEvent, FormEvent, useState } from 'react';
import { MapPin, Phone, User, Leaf, Plus, PackageCheck, Image as ImageIcon, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';
import { useTranslation } from 'react-i18next';

type FarmerCropSale = {
    id: number;
    farmerName: string;
    phone: string;
    address: string;
    cropName: string;
    quantity: string;
    productPhoto: string;
    harvestDate: string;
    status: 'Available' | 'Not Available';
};

const initialEntries: FarmerCropSale[] = [
    {
        id: 1,
        farmerName: 'Ramesh Kumar',
        phone: '+91 98765 43210',
        address: 'Guntur, Andhra Pradesh',
        cropName: 'Tomato',
        quantity: '180 qtl',
        productPhoto: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80',
        harvestDate: '2026-10-20',
        status: 'Available'
    },
    {
        id: 2,
        farmerName: 'Sowmya Reddy',
        phone: '+91 91234 56789',
        address: 'Nellore, Andhra Pradesh',
        cropName: 'Rice',
        quantity: '420 qtl',
        productPhoto: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=900&q=80',
        harvestDate: '2026-10-18',
        status: 'Not Available'
    }
];

const defaultForm = {
    farmerName: '',
    phone: '',
    address: '',
    cropName: '',
    quantity: '',
    productPhoto: '',
    harvestDate: '',
    status: 'Available' as 'Available' | 'Not Available'
};

const FarmerCropSales = () => {
    const { t, i18n } = useTranslation();
    const locale = i18n.language.startsWith('ta') ? 'ta-IN' : 'en-IN';
    const [entries, setEntries] = useState<FarmerCropSale[]>(initialEntries);
    const [form, setForm] = useState(defaultForm);

    const isAdmin = (() => {
        if (typeof window === 'undefined') return false;

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            return Boolean(
                userInfo?.isAdmin ||
                userInfo?.role === 'admin' ||
                userInfo?.role === 'Admin' ||
                userInfo?.email?.toLowerCase() === 'admin@gmail.com'
            );
        } catch {
            return false;
        }
    })();

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        const newEntry: FarmerCropSale = {
            id: Date.now(),
            farmerName: form.farmerName,
            phone: form.phone,
            address: form.address,
            cropName: form.cropName,
            quantity: form.quantity,
            productPhoto: form.productPhoto || 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80',
            harvestDate: form.harvestDate,
            status: form.status
        };

        setEntries((prev) => [newEntry, ...prev]);
        setForm(defaultForm);
    };

    const deleteEntry = (id: number) => {
        setEntries((prev) => prev.filter((entry) => entry.id !== id));
    };

    const toggleStatus = (id: number) => {
        setEntries((prev) => prev.map((entry) => (
            entry.id === id
                ? { ...entry, status: entry.status === 'Available' ? 'Not Available' : 'Available' }
                : entry
        )));
    };

    return (
        <Layout>
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-2">
                            <Leaf size={12} />
                            {t('farmerSales')}
                        </div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{t('farmerCropSales')}</h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Direct farmer-to-buyer crop listing & inventory marketplace</p>
                    </div>
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 self-start md:self-auto">
                        <PackageCheck size={16} />
                        {entries.length} {t('records')}
                    </div>
                </div>

                <div className="grid lg:grid-cols-[1.1fr_1.4fr] gap-6">
                    <form onSubmit={handleSubmit} className="glass-card dark:bg-slate-900/80 dark:border-slate-800/80 rounded-3xl shadow-xl p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                                <Plus size={20} />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('addFarmerCropSale')}</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">{t('farmerName')}</label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-3.5 text-gray-400" size={16} />
                                    <input name="farmerName" value={form.farmerName} onChange={handleChange} required className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50/70 dark:bg-slate-800/70 text-gray-900 dark:text-white text-sm" placeholder={t('enterFarmerName')} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">{t('phoneNumber')}</label>
                                <div className="relative">
                                    <Phone className="absolute left-3.5 top-3.5 text-gray-400" size={16} />
                                    <input name="phone" value={form.phone} onChange={handleChange} required className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50/70 dark:bg-slate-800/70 text-gray-900 dark:text-white text-sm" placeholder="+91 98765 43210" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">{t('address')}</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3.5 top-3.5 text-gray-400" size={16} />
                                    <textarea name="address" value={form.address} onChange={handleChange} required rows={2} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none bg-gray-50/70 dark:bg-slate-800/70 text-gray-900 dark:text-white text-sm" placeholder={t('villageDistrictState')} />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">{t('cropName')}</label>
                                    <div className="relative">
                                        <Leaf className="absolute left-3.5 top-3.5 text-gray-400" size={16} />
                                        <input name="cropName" value={form.cropName} onChange={handleChange} required className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50/70 dark:bg-slate-800/70 text-gray-900 dark:text-white text-sm" placeholder={t('cropExamples')} />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">{t('quantity')}</label>
                                    <input name="quantity" value={form.quantity} onChange={handleChange} required className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50/70 dark:bg-slate-800/70 text-gray-900 dark:text-white text-sm" placeholder="420 qtl" />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">{t('harvestDate')}</label>
                                    <input type="date" name="harvestDate" value={form.harvestDate} onChange={handleChange} required className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50/70 dark:bg-slate-800/70 text-gray-900 dark:text-white text-sm" />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">{t('availability')}</label>
                                    <select name="status" value={form.status} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50/70 dark:bg-slate-800/70 text-gray-900 dark:text-white text-sm">
                                        <option value="Available">{t('available')}</option>
                                        <option value="Not Available">{t('notAvailable')}</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">{t('productPhoto')}</label>
                                <div className="relative">
                                    <ImageIcon className="absolute left-3.5 top-3.5 text-gray-400" size={16} />
                                    <input type="file" accept="image/*" onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        const reader = new FileReader();
                                        reader.onload = () => {
                                            setForm((prev) => ({ ...prev, productPhoto: String(reader.result || '') }));
                                        };
                                        reader.readAsDataURL(file);
                                    }} className="w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-emerald-500/10 file:text-emerald-700 dark:file:text-emerald-300 file:font-semibold text-xs text-gray-500 bg-gray-50/70 dark:bg-slate-800/70" />
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-600/20 transition-all cursor-pointer text-sm">
                                {t('saveFarmerSale')}
                            </button>
                        </div>
                    </form>

                    <div className="space-y-4">
                        {entries.map((entry) => (
                            <div key={entry.id} className="glass-card dark:bg-slate-900/80 dark:border-slate-800/80 rounded-3xl shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col sm:flex-row">
                                <div className="relative sm:w-48 h-48 sm:h-auto overflow-hidden shrink-0">
                                    <img src={entry.productPhoto} alt={entry.cropName} className="w-full h-full object-cover" />
                                    <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                                        entry.status === 'Available' 
                                            ? 'bg-emerald-500 text-white' 
                                            : 'bg-rose-500 text-white'
                                    }`}>
                                        {t(entry.status === 'Available' ? 'available' : 'notAvailable')}
                                    </span>
                                </div>
                                <div className="p-5 flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{entry.farmerName}</h3>
                                                <span className="inline-block mt-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                                                    {entry.cropName}
                                                </span>
                                            </div>
                                            {isAdmin && (
                                                <button type="button" onClick={() => deleteEntry(entry.id)} className="text-gray-400 hover:text-rose-500 transition p-1.5 rounded-lg hover:bg-rose-500/10" aria-label={t('deleteSale')}>
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>

                                        <div className="mt-3.5 space-y-2 text-xs text-gray-600 dark:text-gray-300">
                                            <div className="flex items-center gap-2">
                                                <Phone size={14} className="text-emerald-500" />
                                                <span>{entry.phone}</span>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <MapPin size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                                                <span className="line-clamp-1">{entry.address}</span>
                                            </div>
                                            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-slate-800">
                                                <span className="text-gray-400 dark:text-gray-500">{t('quantity')}</span>
                                                <span className="font-bold text-gray-900 dark:text-white">{entry.quantity}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-400 dark:text-gray-500">{t('harvestDate')}</span>
                                                <span className="font-semibold text-gray-800 dark:text-gray-200">{new Date(entry.harvestDate).toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {isAdmin && (
                                        <button type="button" onClick={() => toggleStatus(entry.id)} className={`mt-4 w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                            entry.status === 'Available' 
                                                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20' 
                                                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                                        }`}>
                                            {t('markAs')} {t(entry.status === 'Available' ? 'notAvailable' : 'available')}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default FarmerCropSales;

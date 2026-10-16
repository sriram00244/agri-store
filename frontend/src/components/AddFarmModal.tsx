import { useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import { API_BASE } from '../config';
import { useTranslation } from 'react-i18next';

const AddFarmModal = ({ isOpen, onClose, onFarmAdded }: any) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        harvestDate: '2026-10-20',
        productImage: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            const token = userInfo.token;

            if (!token) {
                setError(t('authenticationError'));
                setLoading(false);
                return;
            }

            await axios.post(`${API_BASE}/api/farms`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onFarmAdded();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || t('failedAddFarm'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">{t('addNewFarm')}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('farmName')}</label>
                        <input
                            required
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
                            placeholder={t('myTomatoField')}
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('location')}</label>
                        <input
                            required
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
                            placeholder={t('cityState')}
                            value={formData.location}
                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('harvestDate')}</label>
                        <input
                            type="date"
                            required
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
                            value={formData.harvestDate}
                            onChange={e => setFormData({ ...formData, harvestDate: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('productImageUrl')}</label>
                        <input
                            type="url"
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
                            placeholder="https://example.com/product.jpg"
                            value={formData.productImage}
                            onChange={e => setFormData({ ...formData, productImage: e.target.value })}
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                            {loading ? t('verifying') : t('addFarmButton')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddFarmModal;

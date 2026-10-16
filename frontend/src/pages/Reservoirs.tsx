import Layout from '../components/Layout';
import { Droplet } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Reservoirs = () => {
    const { t } = useTranslation();
    // Mock Data
    const reservoirs = [
        { id: 1, name: 'Bhakra Dam', state: 'Himachal Pradesh', level: '1680 ft', capacity: '75%', status: 'Normal' },
        { id: 2, name: 'Tehri Dam', state: 'Uttarakhand', level: '830 m', capacity: '82%', status: 'High' },
        { id: 3, name: 'Hirakud Dam', state: 'Odisha', level: '620 ft', capacity: '60%', status: 'Normal' },
        { id: 4, name: 'Sardar Sarovar', state: 'Gujarat', level: '138 m', capacity: '95%', status: 'Critical' },
        { id: 5, name: 'Nagarjuna Sagar', state: 'Telangana', level: '580 ft', capacity: '45%', status: 'Low' },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Critical': return 'text-red-600 bg-red-50';
            case 'Low': return 'text-orange-600 bg-orange-50';
            case 'High': return 'text-blue-600 bg-blue-50';
            default: return 'text-green-600 bg-green-50';
        }
    };

    return (
        <Layout>
            <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-2">
                <Droplet className="text-blue-600" /> {t('reservoirStatus')}
            </h1>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 text-gray-500 text-sm">
                        <tr>
                            <th className="px-6 py-4 text-left">{t('damName')}</th>
                            <th className="px-6 py-4 text-left">{t('state')}</th>
                            <th className="px-6 py-4 text-left">{t('currentLevel')}</th>
                            <th className="px-6 py-4 text-left">{t('capacity')}</th>
                            <th className="px-6 py-4 text-left">{t('status')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {reservoirs.map((dam) => (
                            <tr key={dam.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-bold text-gray-800">{dam.name}</td>
                                <td className="px-6 py-4 text-gray-600">{dam.state}</td>
                                <td className="px-6 py-4 text-gray-800 font-mono">{dam.level}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 rounded-full" style={{ width: dam.capacity }}></div>
                                        </div>
                                        <span className="text-xs text-gray-500">{dam.capacity}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(dam.status)}`}>
                                        {t(dam.status.toLowerCase())}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
};

export default Reservoirs;

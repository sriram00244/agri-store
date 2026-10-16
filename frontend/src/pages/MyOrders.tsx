import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { Package, Truck, CheckCircle2, Clock, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Order } from './AgroStore';

const defaultOrders: Order[] = [
    {
        id: 'AGS-849201',
        date: '14 Oct 2026',
        items: [
            {
                product: {
                    id: 'ag-1',
                    name: 'Hybrid Paddy Seeds (CR Dhan 310 - High Protein)',
                    category: 'Seeds & Fertilizers',
                    price: 1450,
                    originalPrice: 1850,
                    rating: 4.8,
                    reviewsCount: 342,
                    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=700&q=80',
                    inStock: true,
                    brand: 'AgroSeed Gold',
                    unit: '25 kg Bag',
                    description: 'Certified bio-fortified paddy seeds'
                },
                quantity: 2
            },
            {
                product: {
                    id: 'ag-2',
                    name: 'Bio-NPK Liquid Organic Microbial Biofertilizer',
                    category: 'Seeds & Fertilizers',
                    price: 780,
                    originalPrice: 990,
                    rating: 4.7,
                    reviewsCount: 219,
                    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=700&q=80',
                    inStock: true,
                    brand: 'BioAgri Tech',
                    unit: '5 Litres',
                    description: 'Consortium of Azotobacter, PSB, and KMB'
                },
                quantity: 1
            }
        ],
        total: 3680,
        status: 'Out for Delivery',
        deliveryAddress: 'Farm Plot 12, Guntur Rural, Andhra Pradesh - 522001',
        paymentMethod: 'Cash on Delivery'
    },
    {
        id: 'AGS-712830',
        date: '02 Oct 2026',
        items: [
            {
                product: {
                    id: 'ag-3',
                    name: '16L Dual-Motor Battery Knapsack Sprayer',
                    category: 'Farm Equipment',
                    price: 2890,
                    originalPrice: 3800,
                    rating: 4.9,
                    reviewsCount: 512,
                    image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=700&q=80',
                    inStock: true,
                    brand: 'KisanForce',
                    unit: '1 Unit',
                    description: 'Dual motor heavy duty sprayer'
                },
                quantity: 1
            }
        ],
        total: 2890,
        status: 'Delivered',
        deliveryAddress: 'Farm Plot 12, Guntur Rural, Andhra Pradesh - 522001',
        paymentMethod: 'UPI'
    }
];

const MyOrders = () => {
    const { t } = useTranslation();
    const [orders, setOrders] = useState<Order[]>([]);

    useEffect(() => {
        try {
            const saved = localStorage.getItem('agrostores_orders');
            if (saved && JSON.parse(saved).length > 0) {
                setOrders(JSON.parse(saved));
            } else {
                setOrders(defaultOrders);
                localStorage.setItem('agrostores_orders', JSON.stringify(defaultOrders));
            }
        } catch {
            setOrders(defaultOrders);
        }
    }, []);

    const getStatusBadge = (status: Order['status']) => {
        switch (status) {
            case 'Delivered':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 size={14} />
                        Delivered
                    </span>
                );
            case 'Out for Delivery':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                        <Truck size={14} />
                        Out for Delivery
                    </span>
                );
            case 'Processing':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <Clock size={14} />
                        Processing
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                        <Package size={14} />
                        Order Placed
                    </span>
                );
        }
    };

    return (
        <Layout>
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <Link
                            to="/store"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline mb-2"
                        >
                            <ArrowLeft size={14} /> Back to Agro Store
                        </Link>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2.5">
                            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                <Package size={22} />
                            </span>
                            {t('myOrders')}
                        </h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Track and view past agricultural supplies & machinery purchases
                        </p>
                    </div>

                    <Link
                        to="/store"
                        className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
                    >
                        <ShoppingBag size={15} />
                        Continue Shopping
                    </Link>
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className="glass-card dark:bg-slate-900/80 dark:border-slate-800/80 rounded-3xl p-5 md:p-6 shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-slate-800"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
                                        <Package size={20} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-mono font-bold text-gray-900 dark:text-white">
                                                {order.id}
                                            </span>
                                            <span className="text-xs text-gray-400">•</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {order.date}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-gray-400 mt-0.5">Payment: {order.paymentMethod}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 self-start sm:self-auto">
                                    {getStatusBadge(order.status)}
                                    <span className="text-base font-extrabold text-gray-900 dark:text-white">
                                        ₹{order.total.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* Item Rows */}
                            <div className="py-4 space-y-3">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <img
                                            src={item.product.image}
                                            alt={item.product.name}
                                            className="w-14 h-14 rounded-xl object-cover shrink-0 border border-gray-100 dark:border-slate-800"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">
                                                {item.product.name}
                                            </h4>
                                            <p className="text-[11px] text-gray-400">
                                                Qty: {item.quantity} × ₹{item.product.price.toLocaleString()} • {item.product.unit}
                                            </p>
                                        </div>
                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                            ₹{(item.product.price * item.quantity).toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Destination */}
                            <div className="pt-3 border-t border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-500 dark:text-gray-400 gap-2">
                                <span className="line-clamp-1">
                                    <strong className="text-gray-700 dark:text-gray-300">Deliver To:</strong> {order.deliveryAddress}
                                </span>
                                <span className="font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                                    Live GPS Dispatch Active
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
};

export default MyOrders;

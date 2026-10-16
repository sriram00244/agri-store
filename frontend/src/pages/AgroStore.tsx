import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import {
    ShoppingBag,
    Search,
    Star,
    Truck,
    ShieldCheck,
    Check,
    Trash2,
    X,
    Package,
    ArrowRight,
    Leaf,
    Sparkles,
    Plus,
    Minus
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface Product {
    id: string;
    name: string;
    category: 'Seeds & Fertilizers' | 'Farm Equipment' | 'Crop Protection' | 'Smart Irrigation' | 'Organic Inputs';
    price: number;
    originalPrice: number;
    rating: number;
    reviewsCount: number;
    image: string;
    inStock: boolean;
    brand: string;
    badge?: string;
    unit: string;
    description: string;
}

export interface CartItem {
    product: Product;
    quantity: number;
}

export interface Order {
    id: string;
    date: string;
    items: CartItem[];
    total: number;
    status: 'Order Placed' | 'Processing' | 'Out for Delivery' | 'Delivered';
    deliveryAddress: string;
    paymentMethod: string;
}

const mockProducts: Product[] = [
    {
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
        badge: 'Best Seller',
        unit: '25 kg Bag',
        description: 'Certified bio-fortified paddy seeds with superior disease resistance and 10.3% grain protein.'
    },
    {
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
        badge: '100% Organic',
        unit: '5 Litres',
        description: 'Enriched consortium of Azotobacter, PSB, and KMB that fixes atmospheric nitrogen and mobilizes potash.'
    },
    {
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
        badge: 'Top Rated',
        unit: '1 Unit + 4 Nozzles',
        description: 'Heavy duty 12V 12Ah battery sprayer with dual motor, pressure regulator, and telescopic brass lance.'
    },
    {
        id: 'ag-4',
        name: 'Automatic IoT Smart Drip Irrigation Controller Kit',
        category: 'Smart Irrigation',
        price: 4950,
        originalPrice: 6500,
        rating: 4.8,
        reviewsCount: 180,
        image: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=700&q=80',
        inStock: true,
        brand: 'AquaSmart',
        badge: 'AgTech Subsidized',
        unit: 'Controller + 4 Solenoids',
        description: 'WiFi & GSM automated solar irrigation controller. Trigger schedules based on soil moisture and rain sensors.'
    },
    {
        id: 'ag-5',
        name: 'Cold-Pressed Pure Neem Oil 10,000 PPM Bio-Pesticide',
        category: 'Crop Protection',
        price: 640,
        originalPrice: 850,
        rating: 4.6,
        reviewsCount: 165,
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=700&q=80',
        inStock: true,
        brand: 'EcoGuard Bio',
        badge: 'Residue Free',
        unit: '1 Litre',
        description: 'Broad spectrum botanical repellent against aphids, whiteflies, thrips, and caterpillar larvae.'
    },
    {
        id: 'ag-6',
        name: '7HP 4-Stroke Heavy Duty Rotary Power Weeder / Tiller',
        category: 'Farm Equipment',
        price: 34999,
        originalPrice: 42500,
        rating: 4.9,
        reviewsCount: 88,
        image: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=700&q=80',
        inStock: true,
        brand: 'AgroPower India',
        badge: 'Subsidized 40%',
        unit: 'Complete Machine',
        description: 'Petrol-driven rotary cultivator for weeding between rows in sugarcane, cotton, vegetables, and horticulture.'
    },
    {
        id: 'ag-7',
        name: 'Chelated Micronutrient Fertilizer (Zinc, Boron, Iron, Mn)',
        category: 'Seeds & Fertilizers',
        price: 520,
        originalPrice: 680,
        rating: 4.7,
        reviewsCount: 142,
        image: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=700&q=80',
        inStock: true,
        brand: 'MicroGrow',
        badge: 'Fast Absorption',
        unit: '1 kg Foil Pack',
        description: '100% water-soluble EDTA chelated foliar spray that corrects chlorosis and strengthens blossom setting.'
    },
    {
        id: 'ag-8',
        name: 'Vermicompost Enriched with Trichoderma & Mycorrhiza',
        category: 'Organic Inputs',
        price: 890,
        originalPrice: 1150,
        rating: 4.8,
        reviewsCount: 290,
        image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=700&q=80',
        inStock: true,
        brand: 'EarthBloom Organics',
        badge: 'Certified Organic',
        unit: '50 kg Bag',
        description: 'Naturally fermented earthworm compost rich in beneficial soil flora, organic carbon, and humic acid.'
    },
    {
        id: 'ag-9',
        name: '16mm UV-Stabilized Inline Drip Lateral Pipes (400m)',
        category: 'Smart Irrigation',
        price: 2150,
        originalPrice: 2800,
        rating: 4.7,
        reviewsCount: 310,
        image: 'https://images.unsplash.com/photo-1527842891421-42eec6e703ea?auto=format&fit=crop&w=700&q=80',
        inStock: true,
        brand: 'KisanDrip',
        badge: 'IS-Certified',
        unit: '400m Roll',
        description: 'Class-2 virgin polymer drip pipe with 40cm emitter spacing and anti-clogging turbulent flow labyrinth.'
    }
];

const AgroStore = () => {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeCategoryParam = searchParams.get('category') || 'All';

    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState<string>(activeCategoryParam);
    const [sortBy, setSortBy] = useState<'featured' | 'priceLow' | 'priceHigh' | 'rating'>('featured');
    
    // Cart state persisted in localStorage
    const [cart, setCart] = useState<CartItem[]>(() => {
        try {
            const saved = localStorage.getItem('agrostores_cart');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const [isCartOpen, setIsCartOpen] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
    const [checkoutAddress, setCheckoutAddress] = useState('Farm No. 42, Guntur Rural, Andhra Pradesh - 522001');
    const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery (Pay after inspection)');

    // Sync active category when URL query param changes
    useMemo(() => {
        if (activeCategoryParam && activeCategoryParam !== activeCategory) {
            setActiveCategory(activeCategoryParam);
        }
    }, [activeCategoryParam]);

    const handleSelectCategory = (cat: string) => {
        setActiveCategory(cat);
        if (cat === 'All') {
            searchParams.delete('category');
            setSearchParams(searchParams);
        } else {
            setSearchParams({ category: cat });
        }
    };

    // Save cart to local storage
    const saveCart = (newCart: CartItem[]) => {
        setCart(newCart);
        localStorage.setItem('agrostores_cart', JSON.stringify(newCart));
    };

    const addToCart = (product: Product) => {
        const existing = cart.find(item => item.product.id === product.id);
        if (existing) {
            saveCart(cart.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            saveCart([...cart, { product, quantity: 1 }]);
        }
        setIsCartOpen(true);
    };

    const updateQuantity = (productId: string, delta: number) => {
        const updated = cart.map(item => {
            if (item.product.id === productId) {
                const newQ = item.quantity + delta;
                return newQ > 0 ? { ...item, quantity: newQ } : null;
            }
            return item;
        }).filter(Boolean) as CartItem[];
        saveCart(updated);
    };

    const removeFromCart = (productId: string) => {
        saveCart(cart.filter(item => item.product.id !== productId));
    };

    const cartTotal = useMemo(() => {
        return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    }, [cart]);

    const cartTotalSavings = useMemo(() => {
        return cart.reduce((sum, item) => sum + ((item.product.originalPrice - item.product.price) * item.quantity), 0);
    }, [cart]);

    const handlePlaceOrder = () => {
        if (cart.length === 0) return;
        const newOrderId = `AGS-${Math.floor(100000 + Math.random() * 900000)}`;
        const newOrder: Order = {
            id: newOrderId,
            date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            items: [...cart],
            total: cartTotal,
            status: 'Order Placed',
            deliveryAddress: checkoutAddress,
            paymentMethod
        };

        try {
            const existingOrders = JSON.parse(localStorage.getItem('agrostores_orders') || '[]');
            localStorage.setItem('agrostores_orders', JSON.stringify([newOrder, ...existingOrders]));
        } catch {
            localStorage.setItem('agrostores_orders', JSON.stringify([newOrder]));
        }

        saveCart([]);
        setOrderSuccess(newOrderId);
        setIsCartOpen(false);
    };

    // Filter & Sort
    const filteredProducts = useMemo(() => {
        return mockProducts.filter(product => {
            const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 product.description.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        }).sort((a, b) => {
            if (sortBy === 'priceLow') return a.price - b.price;
            if (sortBy === 'priceHigh') return b.price - a.price;
            if (sortBy === 'rating') return b.rating - a.rating;
            return 0;
        });
    }, [activeCategory, searchTerm, sortBy]);

    const categories = [
        'All',
        'Seeds & Fertilizers',
        'Farm Equipment',
        'Crop Protection',
        'Smart Irrigation',
        'Organic Inputs'
    ];

    return (
        <Layout>
            <div className="space-y-6 max-w-7xl mx-auto">
                {/* Hero Header */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-900 dark:from-emerald-950 dark:via-slate-900 dark:to-teal-950 p-6 md:p-8 text-white shadow-xl border border-white/15 dark:border-emerald-500/20">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-emerald-400/15 blur-3xl pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/15 backdrop-blur-md border border-white/25 mb-3 text-emerald-200">
                                <Sparkles size={14} />
                                Agrostores Official Store
                            </div>
                            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-display">
                                {t('agroStore')}
                            </h1>
                            <p className="mt-2 text-sm text-emerald-100/90 dark:text-gray-300 max-w-2xl leading-relaxed">
                                {t('storeSubtitle')}
                            </p>
                            
                            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-medium text-emerald-100">
                                <span className="flex items-center gap-1.5"><Truck size={15} /> Free Farm Delivery over ₹999</span>
                                <span className="flex items-center gap-1.5"><ShieldCheck size={15} /> 100% Genuine Agri Guarantee</span>
                                <span className="flex items-center gap-1.5"><Leaf size={15} /> Certified Lab Tested</span>
                            </div>
                        </div>

                        {/* Top Cart & Order Quick Access */}
                        <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
                            <Link
                                to="/orders"
                                className="px-4 py-2.5 rounded-xl border border-white/20 hover:border-white/40 bg-white/10 hover:bg-white/15 text-white text-xs font-bold backdrop-blur-md transition-all flex items-center gap-2"
                            >
                                <Package size={16} />
                                {t('myOrders')}
                            </Link>

                            <button
                                onClick={() => setIsCartOpen(true)}
                                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/30 transition-all flex items-center gap-2 relative cursor-pointer"
                            >
                                <ShoppingBag size={17} />
                                {t('cart')}
                                {cart.length > 0 && (
                                    <span className="h-5 w-5 rounded-full bg-rose-600 text-white text-[11px] font-bold flex items-center justify-center animate-bounce">
                                        {cart.reduce((total, i) => total + i.quantity, 0)}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Order Success Notification */}
                {orderSuccess && (
                    <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-4 animate-in slide-in-from-top-2">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
                                <Check size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-sm">{t('orderSuccess')}</p>
                                <p className="text-xs text-emerald-700/80 dark:text-emerald-400">Order ID: <span className="font-mono font-bold">{orderSuccess}</span>. Tracking details sent to registered mobile.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link to="/orders" className="text-xs font-bold underline hover:text-emerald-950 dark:hover:text-white">
                                {t('trackOrder')}
                            </Link>
                            <button onClick={() => setOrderSuccess(null)} className="p-1 hover:bg-emerald-500/20 rounded-lg">
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Filter and Search Bar */}
                <div className="glass-card dark:bg-slate-900/80 dark:border-slate-800/80 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Search */}
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3.5 top-3 text-gray-400" size={17} />
                        <input
                            type="text"
                            placeholder="Search seeds, sprayers, NPK..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/70 dark:bg-slate-800/70 text-gray-900 dark:text-white placeholder-gray-400 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>

                    {/* Category Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => handleSelectCategory(cat)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                                    activeCategory === cat
                                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20'
                                        : 'bg-gray-100/80 dark:bg-slate-800/80 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                                }`}
                            >
                                {cat === 'All' ? t('allProducts') : cat}
                            </button>
                        ))}
                    </div>

                    {/* Sort */}
                    <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Sort:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/70 dark:bg-slate-800/70 text-gray-800 dark:text-gray-200 text-xs outline-none"
                        >
                            <option value="featured">Featured</option>
                            <option value="priceLow">Price: Low to High</option>
                            <option value="priceHigh">Price: High to Low</option>
                            <option value="rating">Top Rated</option>
                        </select>
                    </div>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => {
                        const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
                        return (
                            <div
                                key={product.id}
                                className="glass-card dark:bg-slate-900/80 dark:border-slate-800/80 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group border border-gray-100 dark:border-slate-800/80"
                            >
                                {/* Image & Tags */}
                                <div className="relative h-52 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        loading="lazy"
                                    />
                                    {product.badge && (
                                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-white shadow-md">
                                            {product.badge}
                                        </span>
                                    )}
                                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-amber-950 shadow-md">
                                        {discount}% OFF
                                    </span>
                                </div>

                                {/* Product Info */}
                                <div className="p-5 flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                                            <span className="font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider text-[10px]">
                                                {product.brand}
                                            </span>
                                            <div className="flex items-center gap-1 text-amber-500 font-bold">
                                                <Star size={13} className="fill-current" />
                                                <span>{product.rating}</span>
                                                <span className="text-gray-400 text-[10px]">({product.reviewsCount})</span>
                                            </div>
                                        </div>

                                        <h3 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-2 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                            {product.name}
                                        </h3>

                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                            {product.description}
                                        </p>

                                        <div className="mt-3 flex items-center justify-between">
                                            <span className="text-[11px] font-medium text-gray-400 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                                {product.unit}
                                            </span>
                                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                                <Check size={13} /> {t('inStock')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Price & Action */}
                                    <div className="pt-4 mt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between gap-3">
                                        <div>
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="text-xl font-extrabold text-gray-900 dark:text-white">
                                                    ₹{product.price.toLocaleString()}
                                                </span>
                                                <span className="text-xs text-gray-400 line-through">
                                                    ₹{product.originalPrice.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => addToCart(product)}
                                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                                        >
                                            <ShoppingBag size={14} />
                                            {t('addToCart')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-16 glass-card dark:bg-slate-900/60 dark:border-slate-800 rounded-3xl p-8">
                        <ShoppingBag size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                        <h3 className="font-bold text-gray-800 dark:text-gray-200">No products found</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Try clearing your search filter or selecting another category.</p>
                        <button
                            onClick={() => { setSearchTerm(''); setActiveCategory('All'); }}
                            className="mt-4 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700"
                        >
                            Reset Filters
                        </button>
                    </div>
                )}
            </div>

            {/* Shopping Cart Drawer */}
            {isCartOpen && (
                <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
                    <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-gray-200 dark:border-slate-800">
                        {/* Cart Header */}
                        <div className="p-4 md:p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                    <ShoppingBag size={18} />
                                </div>
                                <div>
                                    <h2 className="font-bold text-gray-900 dark:text-white text-base">Agrostores Cart</h2>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{cart.length} item(s)</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsCartOpen(false)}
                                className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Cart Items List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
                                    <ShoppingBag size={52} className="opacity-30 mb-3 text-emerald-500" />
                                    <p className="text-sm font-semibold">{t('cartEmpty')}</p>
                                    <p className="text-xs text-gray-500 mt-1">Explore seeds, fertilizers and equipment from the catalog.</p>
                                </div>
                            ) : (
                                cart.map(item => (
                                    <div
                                        key={item.product.id}
                                        className="p-3.5 rounded-2xl border border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50 flex items-center gap-3"
                                    >
                                        <img
                                            src={item.product.image}
                                            alt={item.product.name}
                                            className="w-16 h-16 rounded-xl object-cover shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-xs text-gray-900 dark:text-white truncate">
                                                {item.product.name}
                                            </h4>
                                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                                ₹{item.product.price.toLocaleString()} × {item.quantity}
                                            </p>
                                            
                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex items-center gap-2 border border-gray-200 dark:border-slate-700 rounded-lg p-0.5 bg-white dark:bg-slate-800">
                                                    <button
                                                        onClick={() => updateQuantity(item.product.id, -1)}
                                                        className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded text-gray-600 dark:text-gray-300"
                                                    >
                                                        <Minus size={12} />
                                                    </button>
                                                    <span className="text-xs font-bold px-1.5">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.product.id, 1)}
                                                        className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded text-gray-600 dark:text-gray-300"
                                                    >
                                                        <Plus size={12} />
                                                    </button>
                                                </div>

                                                <span className="font-extrabold text-sm text-gray-900 dark:text-white">
                                                    ₹{(item.product.price * item.quantity).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.product.id)}
                                            className="p-1.5 text-gray-400 hover:text-rose-500 transition"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Cart Footer & Checkout */}
                        {cart.length > 0 && (
                            <div className="p-4 md:p-5 border-t border-gray-100 dark:border-slate-800 bg-gray-50/80 dark:bg-slate-950/80 space-y-4">
                                <div className="space-y-1.5 text-xs">
                                    <div className="flex justify-between text-gray-500 dark:text-gray-400">
                                        <span>Total Savings:</span>
                                        <span className="text-emerald-600 font-bold">₹{cartTotalSavings.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-500 dark:text-gray-400">
                                        <span>Delivery Fee:</span>
                                        <span className="text-emerald-600 font-bold">FREE</span>
                                    </div>
                                    <div className="flex justify-between text-base font-extrabold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-slate-800">
                                        <span>{t('totalAmount')}:</span>
                                        <span className="text-emerald-600 dark:text-emerald-400">₹{cartTotal.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2">
                                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        {t('deliveryAddress')}
                                    </label>
                                    <input
                                        type="text"
                                        value={checkoutAddress}
                                        onChange={(e) => setCheckoutAddress(e.target.value)}
                                        className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-gray-800 dark:text-white outline-none"
                                    />
                                </div>

                                <div className="space-y-2 pt-2">
                                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        Payment Method
                                    </label>
                                    <select
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-gray-800 dark:text-white outline-none"
                                    >
                                        <option value="Cash on Delivery (Pay after inspection)">Cash on Delivery (Pay after inspection)</option>
                                        <option value="UPI / Online Payment">UPI / Net Banking</option>
                                        <option value="Kisan Credit Card (KCC)">Kisan Credit Card (KCC)</option>
                                    </select>
                                </div>

                                <button
                                    onClick={handlePlaceOrder}
                                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <span>{t('placeOrder')}</span>
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default AgroStore;

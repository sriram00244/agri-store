import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, IndianRupee, TrendingUp, TrendingDown } from 'lucide-react';
import Layout from '../components/Layout';
import { useTranslation } from 'react-i18next';

const ProfitCalculator = () => {
    const { t } = useTranslation();

    // Inputs
    const [yieldAmount, setYieldAmount] = useState<number | ''>('');
    const [price, setPrice] = useState<number | ''>('');
    const [cost, setCost] = useState<number | ''>('');

    // Results
    const [revenue, setRevenue] = useState<number>(0);
    const [profit, setProfit] = useState<number>(0);
    const [margin, setMargin] = useState<number>(0);
    const [calculated, setCalculated] = useState(false);

    const calculate = (e: React.FormEvent) => {
        e.preventDefault();
        const y = Number(yieldAmount) || 0;
        const p = Number(price) || 0;
        const c = Number(cost) || 0;

        const totalRevenue = y * p;
        const netProfit = totalRevenue - c;
        const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

        setRevenue(totalRevenue);
        setProfit(netProfit);
        setMargin(profitMargin);
        setCalculated(true);
    };

    return (
        <Layout>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 dark:from-emerald-950 dark:via-slate-900 dark:to-teal-950 text-white p-6 md:p-8 rounded-3xl shadow-xl flex items-center gap-5 border border-white/10 dark:border-emerald-500/20">
                    <div className="w-14 h-14 rounded-2xl bg-white/15 dark:bg-emerald-500/20 backdrop-blur-md flex items-center justify-center border border-white/25 dark:border-emerald-500/30 shrink-0">
                        <Calculator size={30} className="text-emerald-200" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{t('profitCalculator')}</h1>
                        <p className="text-xs md:text-sm text-emerald-100/90 dark:text-gray-300 mt-1">{t('calculateReturns')}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Input Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-card dark:bg-slate-900/80 dark:border-slate-800/80 p-6 rounded-3xl shadow-lg"
                    >
                        <form onSubmit={calculate} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">{t('cropYieldQuintals')}</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={yieldAmount}
                                        onChange={e => setYieldAmount(Number(e.target.value))}
                                        className="w-full pl-4 pr-12 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50/60 dark:bg-slate-800/70 text-gray-900 dark:text-white placeholder-gray-400 text-sm font-medium"
                                        placeholder={t('exampleYield')}
                                        required
                                    />
                                    <span className="absolute right-4 top-3 text-gray-400 dark:text-gray-500 font-bold text-xs">QTL</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">{t('marketPricePerQuintal')}</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-3 text-gray-400 dark:text-gray-500 font-bold text-sm">₹</span>
                                    <input
                                        type="number"
                                        value={price}
                                        onChange={e => setPrice(Number(e.target.value))}
                                        className="w-full pl-9 pr-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50/60 dark:bg-slate-800/70 text-gray-900 dark:text-white placeholder-gray-400 text-sm font-medium"
                                        placeholder={t('examplePrice')}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">{t('totalCultivationCost')}</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-3 text-gray-400 dark:text-gray-500 font-bold text-sm">₹</span>
                                    <input
                                        type="number"
                                        value={cost}
                                        onChange={e => setCost(Number(e.target.value))}
                                        className="w-full pl-9 pr-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50/60 dark:bg-slate-800/70 text-gray-900 dark:text-white placeholder-gray-400 text-sm font-medium"
                                        placeholder={t('exampleCost')}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3.5 rounded-xl font-bold text-sm hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg shadow-emerald-600/20 cursor-pointer"
                            >
                                {t('calculateProfit')}
                            </button>
                        </form>
                    </motion.div>

                    {/* Results */}
                    <div className="space-y-4">
                        {calculated ? (
                            <>
                                <motion.div
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden border border-emerald-400/30"
                                >
                                    <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full -mr-16 -mt-16 blur-xl"></div>
                                    <div className="relative z-10">
                                        <p className="text-emerald-100 font-medium text-xs uppercase tracking-wider mb-1">{t('netProfitLoss')}</p>
                                        <div className="flex items-center gap-2">
                                            <IndianRupee size={30} />
                                            <h2 className="text-4xl md:text-5xl font-extrabold">{profit.toLocaleString()}</h2>
                                        </div>
                                        <div className="mt-5 flex items-center gap-2 bg-white/20 w-fit px-3.5 py-1.5 rounded-full backdrop-blur-md border border-white/20 text-xs">
                                            {profit >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                            <span className="font-bold">{Math.abs(margin).toFixed(1)}% {t('margin')}</span>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ y: 15, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="glass-card dark:bg-slate-900/80 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm flex justify-between items-center"
                                >
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase">{t('totalRevenue')}</p>
                                        <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">₹ {revenue.toLocaleString()}</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                                        <IndianRupee size={20} />
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ y: 15, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="glass-card dark:bg-slate-900/80 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm flex justify-between items-center"
                                >
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase">{t('totalCost')}</p>
                                        <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">₹ {Number(cost).toLocaleString()}</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
                                        <Calculator size={20} />
                                    </div>
                                </motion.div>
                            </>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 glass-card dark:bg-slate-900/60 dark:border-slate-800/80 rounded-3xl border-2 border-dashed border-gray-200 dark:border-slate-800 p-10 min-h-[300px]">
                                <Calculator size={52} className="mb-3 opacity-30 text-emerald-500" />
                                <p className="text-xs text-center max-w-xs">{t('enterDetailsCalculate')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ProfitCalculator;

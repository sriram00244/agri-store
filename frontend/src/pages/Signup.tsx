import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import { Sprout, User, Mail, Lock, Check, AlertCircle, ArrowRight, Sun, Moon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';

const Signup = () => {
    const { t } = useTranslation();
    const { isDark, toggleTheme } = useTheme();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [focusedField, setFocusedField] = useState<string | null>(null);

    // Password validation rules: min 8 chars, at least 1 letter, 1 number, 1 symbol
    const hasMinLength = password.length >= 8;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[^a-zA-Z0-9]/.test(password);
    const isPasswordValid = hasMinLength && hasLetter && hasNumber && hasSymbol;

    const submitHandler = async (e: any) => {
        e.preventDefault();
        if (!isPasswordValid) {
            setError(t('passwordRequirementsError'));
            return;
        }
        const result = await register(name, email, password);
        if (result.success) {
            navigate('/login', { state: { message: t('registrationSuccess') } });
        } else {
            setError(result.error);
        }
    };

    // Animation Variants
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 300, damping: 24 }
        }
    };

    const formSlideUp: Variants = {
        hidden: { y: 100, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 100, damping: 20, delay: 1.5 }
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-emerald-950 font-sans">
            <div className="absolute top-5 right-5 z-20 flex items-center gap-2.5">
                <button
                    type="button"
                    onClick={toggleTheme}
                    title="Toggle Theme"
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/30 bg-black/40 text-white backdrop-blur-md shadow-md transition-all hover:bg-black/60 hover:scale-105"
                >
                    {isDark ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-emerald-300" />}
                </button>
                <LanguageSwitcher variant="pill" />
            </div>
            {/* Background Layer - Organic Gradient & Parallax */}
            <motion.div
                className="absolute inset-0 z-0"
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 10, ease: "easeOut" }}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-emerald-900 to-teal-950" />
                <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

                {/* Sun Rays / Light Effect */}
                <motion.div
                    className="absolute -top-[20%] -right-[10%] w-[80vw] h-[80vw] bg-yellow-400/10 rounded-full blur-[120px]"
                    animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Floating Particles */}
                {[...Array(8)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute bg-white/20 rounded-full blur-[1px]"
                        style={{
                            width: Math.random() * 4 + 2,
                            height: Math.random() * 4 + 2,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -40, 0],
                            x: [0, Math.random() * 20 - 10, 0],
                            opacity: [0.2, 0.5, 0.2]
                        }}
                        transition={{
                            duration: Math.random() * 5 + 5,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: Math.random() * 2
                        }}
                    />
                ))}
            </motion.div>

            {/* Main Content Container */}
            <div className="relative z-10 w-full max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

                {/* Left Side - Welcome Animation */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-center md:text-left text-white space-y-6"
                >
                    <motion.div variants={itemVariants} className="inline-block">
                        <motion.div
                            className="w-16 h-16 bg-gradient-to-tr from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-green-900/50 backdrop-blur-sm mx-auto md:mx-0"
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            animate={{ y: [0, -10, 0] }}
                            transition={{ y: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
                        >
                            <Sprout size={32} className="text-white" />
                        </motion.div>
                    </motion.div>

                    <div className="space-y-2">
                        <motion.h2
                            variants={itemVariants}
                            className="text-lg font-medium text-green-300 tracking-wide uppercase"
                        >
                            {t('helloNewUser')} 👋
                        </motion.h2>

                        <div className="overflow-hidden">
                            <motion.h1
                                className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-green-200 leading-tight"
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                transition={{ duration: 0.8, ease: "circOut", delay: 0.5 }}
                            >
                                {t('welcomeTo')} <br />
                                <span className="text-emerald-400">Agrostores</span>
                            </motion.h1>
                        </div>

                        <motion.p
                            variants={itemVariants}
                            className="text-lg text-green-100/70 max-w-md font-light leading-relaxed"
                        >
                            {t('signupDescription')}
                        </motion.p>
                    </div>
                </motion.div>

                {/* Right Side - Registration Form Card */}
                <motion.div
                    variants={formSlideUp}
                    initial="hidden"
                    animate="visible"
                    className="w-full max-w-md mx-auto"
                >
                    <div className="backdrop-blur-xl bg-white/10 border border-white/20 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                        {/* Glass Reflections */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-50" />

                        <h3 className="text-2xl font-bold text-white mb-6 text-center">{t('createAccount')}</h3>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-red-500/20 border border-red-500/50 text-red-100 p-3 rounded-xl mb-6 flex items-center gap-2 text-sm backdrop-blur-md"
                            >
                                <AlertCircle size={16} />
                                {error}
                            </motion.div>
                        )}

                        <form onSubmit={submitHandler} className="space-y-5">
                            {/* Name Input */}
                            <motion.div
                                custom={0}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 1.8 }}
                                className="relative group"
                            >
                                <div className="relative flex items-center">
                                    <User className={`absolute left-4 transition-colors duration-300 pointer-events-none z-10 ${focusedField === 'name' ? 'text-green-400' : 'text-gray-400'}`} size={20} />
                                    <label className={`absolute transition-all duration-300 pointer-events-none ${focusedField === 'name' || name ? '-top-2.5 left-3 bg-emerald-950 px-2 text-green-400 text-xs font-semibold z-20 rounded' : 'top-1/2 -translate-y-1/2 left-12 text-sm text-gray-400 z-0'}`}>
                                        {t('fullName')}
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        onFocus={() => setFocusedField('name')}
                                        onBlur={() => setFocusedField(null)}
                                        className="w-full pl-12 pr-10 py-3.5 bg-black/30 border border-white/15 rounded-xl text-white placeholder-transparent focus:outline-none focus:border-green-500 focus:bg-black/40 transition-all duration-300 hover:border-white/30"
                                        placeholder={t('fullName')}
                                        required
                                    />
                                    {name && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-4 text-green-400 z-10 pointer-events-none"><Check size={18} /></motion.div>}
                                </div>
                            </motion.div>

                            {/* Email Input */}
                            <motion.div
                                custom={1}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 1.9 }}
                                className="relative group"
                            >
                                <div className="relative flex items-center">
                                    <Mail className={`absolute left-4 transition-colors duration-300 pointer-events-none z-10 ${focusedField === 'email' ? 'text-green-400' : 'text-gray-400'}`} size={20} />
                                    <label className={`absolute transition-all duration-300 pointer-events-none ${focusedField === 'email' || email ? '-top-2.5 left-3 bg-emerald-950 px-2 text-green-400 text-xs font-semibold z-20 rounded' : 'top-1/2 -translate-y-1/2 left-12 text-sm text-gray-400 z-0'}`}>
                                        {t('emailAddress')}
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onFocus={() => setFocusedField('email')}
                                        onBlur={() => setFocusedField(null)}
                                        className="w-full pl-12 pr-10 py-3.5 bg-black/30 border border-white/15 rounded-xl text-white placeholder-transparent focus:outline-none focus:border-green-500 focus:bg-black/40 transition-all duration-300 hover:border-white/30"
                                        placeholder={t('emailAddress')}
                                        required
                                    />
                                    {email.includes('@') && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-4 text-green-400 z-10 pointer-events-none"><Check size={18} /></motion.div>}
                                </div>
                            </motion.div>

                            {/* Password Input */}
                            <motion.div
                                custom={2}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 2.0 }}
                                className="relative group"
                            >
                                <div className="relative flex items-center">
                                    <Lock className={`absolute left-4 transition-colors duration-300 pointer-events-none z-10 ${focusedField === 'password' ? 'text-green-400' : 'text-gray-400'}`} size={20} />
                                    <label className={`absolute transition-all duration-300 pointer-events-none ${focusedField === 'password' || password ? '-top-2.5 left-3 bg-emerald-950 px-2 text-green-400 text-xs font-semibold z-20 rounded' : 'top-1/2 -translate-y-1/2 left-12 text-sm text-gray-400 z-0'}`}>
                                        {t('password')}
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onFocus={() => setFocusedField('password')}
                                        onBlur={() => setFocusedField(null)}
                                        className="w-full pl-12 pr-10 py-3.5 bg-black/30 border border-white/15 rounded-xl text-white placeholder-transparent focus:outline-none focus:border-green-500 focus:bg-black/40 transition-all duration-300 hover:border-white/30"
                                        placeholder={t('password')}
                                        required
                                    />
                                    {isPasswordValid && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-4 text-green-400 z-10 pointer-events-none"><Check size={18} /></motion.div>}
                                </div>

                                {/* Password Requirement Indicators */}
                                <div className="mt-2 p-3 bg-black/40 border border-white/10 rounded-xl space-y-1.5 text-xs backdrop-blur-sm">
                                    <p className="text-gray-300 font-semibold">{t('passwordRequirements')}</p>
                                    <div className="grid grid-cols-2 gap-1 text-[11px]">
                                        <div className={`flex items-center gap-1.5 transition-colors ${hasMinLength ? 'text-green-400 font-semibold' : 'text-gray-400'}`}>
                                            <span>{hasMinLength ? '✓' : '•'}</span> {t('minimumCharacters')}
                                        </div>
                                        <div className={`flex items-center gap-1.5 transition-colors ${hasLetter ? 'text-green-400 font-semibold' : 'text-gray-400'}`}>
                                            <span>{hasLetter ? '✓' : '•'}</span> {t('oneLetter')}
                                        </div>
                                        <div className={`flex items-center gap-1.5 transition-colors ${hasNumber ? 'text-green-400 font-semibold' : 'text-gray-400'}`}>
                                            <span>{hasNumber ? '✓' : '•'}</span> {t('oneNumber')}
                                        </div>
                                        <div className={`flex items-center gap-1.5 transition-colors ${hasSymbol ? 'text-green-400 font-semibold' : 'text-gray-400'}`}>
                                            <span>{hasSymbol ? '✓' : '•'}</span> {t('oneSymbol')}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Submit Button */}
                            <motion.button
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 2.2 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-green-900/40 hover:shadow-green-900/60 hover:from-green-400 hover:to-emerald-500 transition-all duration-300 flex items-center justify-center gap-2 group"
                            >
                                {t('startFarming')} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </motion.button>
                        </form>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 2.5 }}
                            className="mt-8 text-center"
                        >
                            <p className="text-gray-400 text-sm">
                                {t('alreadyRegistered')}{' '}
                                <Link to="/login" className="text-green-400 hover:text-green-300 font-medium transition-colors hover:underline decoration-2 underline-offset-4">
                                    {t('signIn')}
                                </Link>
                            </p>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Signup;

import React, { useEffect, useState } from 'react';

interface Props {
    children: React.ReactNode;
    type?: 'login' | 'dashboard';
}

const AnimatedBackground: React.FC<Props> = ({ children, type = 'login' }) => {
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const x = (e.clientX / window.innerWidth) * 15;
            const y = (e.clientY / window.innerHeight) * 15;
            setOffset({ x, y });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    if (type === 'login') {
        return (
            <div className="relative w-full h-screen overflow-hidden bg-slate-950">
                {/* Hero Background */}
                <div
                    className="absolute inset-0 z-0 animate-ken-burns opacity-60"
                    style={{
                        backgroundImage: `url('/images/farmer-hero.png')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />

                {/* Dark Vignette & Radiant Glows */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-900/80 z-0" />
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none" />

                {/* Floating Micro-particles */}
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    {[...Array(12)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute bg-emerald-400 rounded-full animate-float-slow"
                            style={{
                                width: Math.random() * 3 + 2 + 'px',
                                height: Math.random() * 3 + 2 + 'px',
                                top: Math.random() * 100 + '%',
                                left: Math.random() * 100 + '%',
                                animationDelay: Math.random() * 6 + 's',
                                opacity: Math.random() * 0.4 + 0.2
                            }}
                        />
                    ))}
                </div>

                {/* Content */}
                <div className="relative z-10 flex items-center justify-center h-full w-full p-4">
                    {children}
                </div>
            </div>
        );
    }

    // Dashboard & App pages background
    return (
        <div className="relative min-h-screen w-full bg-slate-50 dark:bg-[#070B13] text-slate-800 dark:text-slate-100 transition-colors duration-300">
            {/* Ambient Background Gradient Mesh */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                {/* Subtle Field Image */}
                <div
                    className="absolute inset-0 opacity-15 dark:opacity-10 transition-opacity"
                    style={{
                        backgroundImage: `url('/images/field-bg.png')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        transform: `translate(${offset.x * -0.05}px, ${offset.y * -0.05}px)`,
                    }}
                />

                {/* Cyber Glow Accents in Dark Mode */}
                <div className="hidden dark:block absolute -top-40 -left-40 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[140px]" />
                <div className="hidden dark:block absolute top-1/2 -right-40 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[140px]" />
                <div className="hidden dark:block absolute -bottom-40 left-1/3 w-[600px] h-[600px] bg-teal-600/10 rounded-full blur-[140px]" />

                {/* Radiant Soft Glows in Light Mode */}
                <div className="dark:hidden absolute -top-40 -left-40 w-[500px] h-[500px] bg-emerald-200/40 rounded-full blur-[120px]" />
                <div className="dark:hidden absolute top-1/2 -right-40 w-[500px] h-[500px] bg-amber-100/40 rounded-full blur-[120px]" />
            </div>

            {/* Application Content Layer */}
            <div className="relative z-10 w-full min-h-screen">
                {children}
            </div>
        </div>
    );
};

export default AnimatedBackground;

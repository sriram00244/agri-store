import React from 'react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import AnimatedBackground from './AnimatedBackground';

interface LayoutProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title, subtitle }) => {
    return (
        <AnimatedBackground type="dashboard">
            <div className="flex h-screen overflow-hidden bg-transparent relative z-10">
                <Sidebar />
                <main className="flex-1 h-screen overflow-y-auto p-4 sm:p-6 lg:p-8 scrollbar-thin scrollbar-thumb-emerald-500/20 dark:scrollbar-thumb-slate-700">
                    <TopNav title={title} subtitle={subtitle} />
                    <div className="transition-all duration-300">
                        {children}
                    </div>
                </main>
            </div>
        </AnimatedBackground>
    );
};

export default Layout;

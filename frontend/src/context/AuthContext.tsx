import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API_BASE } from '../config';

// Set bypass header for localtunnel so it never serves the HTML reminder page
axios.defaults.headers.common['bypass-tunnel-remainder'] = 'true';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            setUser(JSON.parse(userInfo));
        }
        setLoading(false);
    }, []);

    const guestLogin = () => {
        const demoUser = {
            _id: 'demo-farmer-id',
            name: 'Farmer Demo User',
            email: 'farmer@agrostores.com',
            role: 'farmer',
            token: 'demo-jwt-token-guest',
            location: 'Tamil Nadu, India'
        };
        setUser(demoUser);
        localStorage.setItem('userInfo', JSON.stringify(demoUser));
        return { success: true };
    };

    const login = async (email: string, password: string) => {
        try {
            const { data } = await axios.post(`${API_BASE}/api/auth/login`, { email, password });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            return { success: true };
        } catch (error: any) {
            // If offline, demo mode or backend is unreachable (e.g. on hosted Vercel link)
            if (email.includes('demo') || error.code === 'ERR_NETWORK' || !error.response) {
                const demoUser = {
                    _id: 'demo-farmer-id',
                    name: 'Farmer Demo User',
                    email: email || 'demo@agrostores.com',
                    role: 'farmer',
                    token: 'demo-jwt-token-guest',
                    location: 'Tamil Nadu, India'
                };
                setUser(demoUser);
                localStorage.setItem('userInfo', JSON.stringify(demoUser));
                return { success: true };
            }
            return { success: false, error: error.response?.data?.message || (error.code === 'ERR_NETWORK' ? 'Network error: Cannot reach backend server' : error.message) || 'Login failed' };
        }
    };

    const register = async (name: string, email: string, password: string) => {
        try {
            await axios.post(`${API_BASE}/api/auth/register`, { name, email, password });
            return { success: true };
        } catch (error: any) {
            // Allow registration offline for demo preview
            if (error.code === 'ERR_NETWORK' || !error.response) {
                const newUser = {
                    _id: 'user-' + Date.now(),
                    name: name || 'Agrostores User',
                    email: email,
                    role: 'farmer',
                    token: 'demo-jwt-token-guest',
                    location: 'India'
                };
                setUser(newUser);
                localStorage.setItem('userInfo', JSON.stringify(newUser));
                return { success: true };
            }
            return { success: false, error: error.response?.data?.message || (error.code === 'ERR_NETWORK' ? 'Network error: Cannot reach backend server' : error.message) || 'Registration failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
    };

    const updateProfile = async (updates: { name?: string; location?: string; phone?: string; notifications?: any }) => {
        try {
            const { data } = await axios.put(`${API_BASE}/api/auth/profile`, updates, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            const updatedUser = { ...user, ...data };
            setUser(updatedUser);
            localStorage.setItem('userInfo', JSON.stringify(updatedUser));
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.response?.data?.message || 'Failed to update profile' };
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, updateProfile, guestLogin }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

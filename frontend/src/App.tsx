import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { useTranslation } from 'react-i18next';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Protected Route Component
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
    const { user, loading } = useAuth();
    const { t } = useTranslation();
    if (loading) return <div>{t('loading')}</div>;
    if (!user) return <Navigate to="/login" />;
    return children;
};

import Dashboard from './pages/Dashboard';
import FarmDetails from './pages/FarmDetails';
import CropDoctor from './pages/CropDoctor';
import Weather from './pages/Weather';
import MarketPrices from './pages/MarketPrices';
import Community from './pages/Community';
import ChatAssistant from './pages/ChatAssistant';
import Settings from './pages/Settings';
import Reservoirs from './pages/Reservoirs';
import ProfitCalculator from './pages/ProfitCalculator';
import FarmerCropSales from './pages/FarmerCropSales';
import AgroStore from './pages/AgroStore';
import MyOrders from './pages/MyOrders';
import CultivationCostCalculator from './pages/CultivationCostCalculator';
import SmallScaleFarmers from './pages/SmallScaleFarmers';
import ContactOfficer from './pages/ContactOfficer';

function App() {
    return (
        <ThemeProvider>
            <Router>
                <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route
                        path="/dashboard"
                        element={
                            <PrivateRoute>
                                <Dashboard />
                            </PrivateRoute>
                        }
                    />
                    {/* Added new route for farm details */}
                    <Route
                        path="/farm/:id"
                        element={
                            <PrivateRoute>
                                <FarmDetails />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/crop-doctor"
                        element={
                            <PrivateRoute>
                                <CropDoctor />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/weather"
                        element={
                            <PrivateRoute>
                                <Weather />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/market"
                        element={
                            <PrivateRoute>
                                <MarketPrices />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/community"
                        element={
                            <PrivateRoute>
                                <Community />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/chat"
                        element={
                            <PrivateRoute>
                                <ChatAssistant />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/settings"
                        element={
                            <PrivateRoute>
                                <Settings />
                            </PrivateRoute>
                        }
                    />
                    {/* Assuming route for Reservoir status was meant to be accessible via sidebar, let's add it if sidebar links to it. Wait, sidebar has no link. I'll add one if needed, but for now just the route. 
                    Actually, looking at Sidebar.tsx, I didn't add Reservoir link. I'll add the route to be safe. */}
                    <Route
                        path="/reservoirs"
                        element={
                            <PrivateRoute>
                                <Reservoirs />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/profit-calculator"
                        element={
                            <PrivateRoute>
                                <ProfitCalculator />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/cultivation-cost"
                        element={
                            <PrivateRoute>
                                <CultivationCostCalculator />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/cultivation-calculator"
                        element={
                            <PrivateRoute>
                                <CultivationCostCalculator />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/small-farmers"
                        element={
                            <PrivateRoute>
                                <SmallScaleFarmers />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/small-scale-farmers"
                        element={
                            <PrivateRoute>
                                <SmallScaleFarmers />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/contact-officer"
                        element={
                            <PrivateRoute>
                                <ContactOfficer />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/contact-agriculture-officer"
                        element={
                            <PrivateRoute>
                                <ContactOfficer />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/farmer-crop-sales"
                        element={
                            <PrivateRoute>
                                <FarmerCropSales />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/store"
                        element={
                            <PrivateRoute>
                                <AgroStore />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/orders"
                        element={
                            <PrivateRoute>
                                <MyOrders />
                            </PrivateRoute>
                        }
                    />
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                </Routes>
                </AuthProvider>
            </Router>
        </ThemeProvider>
    );
}

export default App;

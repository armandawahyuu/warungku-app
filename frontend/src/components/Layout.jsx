import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import api from '../api/client';
import { useAuth } from '../hooks/useAuth';

const Layout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [session, setSession] = useState(null);
    const navigate = useNavigate();
    const { logout } = useAuth();

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const res = await api.get('/sessions/current');
                setSession(res.data);
            } catch (error) {
                console.error('Error fetching session:', error);
            }
        };

        fetchSession();
    }, []);

    const handleLogout = () => {
        if (session) {
            navigate(`/close/${session.id}`);
        } else {
            logout();
            navigate('/login');
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onLogout={handleLogout}
            />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <div className="md:hidden bg-white border-b border-gray-100 p-4 flex items-center gap-4 sticky top-0 z-30">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <Menu className="w-6 h-6 text-gray-600" />
                    </button>
                    <span className="font-bold text-lg text-gray-900">Warung H12</span>
                </div>

                {/* Main Content */}
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;

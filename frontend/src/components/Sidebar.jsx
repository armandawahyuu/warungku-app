import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    FileText,
    Tags,
    LogOut,
    X,
    Store,
    Users,
    Wallet,
    History
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Sidebar = ({ isOpen, onClose, onLogout }) => {
    const location = useLocation();
    const { user } = useAuth();

    const menuItems = [
        { path: '/', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
        { path: '/reports', label: 'Laporan', icon: <FileText className="w-5 h-5" /> },
        { path: '/settings/categories', label: 'Kategori', icon: <Tags className="w-5 h-5" /> },
        { path: '/settings/wallets', label: 'Dompet', icon: <Wallet className="w-5 h-5" /> },
    ];

    // Add User Management for admin only
    if (user?.role === 'ADMIN') {
        menuItems.push({
            path: '/settings/users',
            label: 'Kelola User',
            icon: <Users className="w-5 h-5" />
        });
        menuItems.push({ path: '/sessions/history', label: 'Riwayat Sesi', icon: <History className="w-5 h-5" /> });
    }

    const isActive = (path) => location.pathname === path;

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 h-full bg-white border-r border-gray-100 z-50 transition-transform duration-300 ease-in-out w-64
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0 md:static
            `}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 flex items-center justify-between border-b border-gray-50">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-600 p-2 rounded-lg">
                                <Store className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-lg text-gray-900">Warung H12</span>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-100 rounded-lg md:hidden"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {menuItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => window.innerWidth < 768 && onClose()}
                                className={`
                                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition
                                    ${isActive(item.path)
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                                `}
                            >
                                {item.icon}
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Footer / Logout */}
                    <div className="p-4 border-t border-gray-50">
                        <Link
                            to="/close-session"
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition"
                        >
                            <LogOut className="w-5 h-5" />
                            Tutup Warung
                        </Link>
                    </div>

                    {/* Copyright */}
                    <div className="p-4 text-center">
                        <p className="text-xs text-gray-400">© 2025 Armanda Wahyu</p>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;

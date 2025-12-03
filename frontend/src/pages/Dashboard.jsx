import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { Link } from 'react-router-dom';
import {
    PlusCircle,
    MinusCircle,
    ArrowRightLeft,
    Wallet,
    Store,
    CreditCard,
    Smartphone,
    LogOut
} from 'lucide-react';

import { useAuth } from '../hooks/useAuth';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [session, setSession] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [wallets, setWallets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isClosedView, setIsClosedView] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [sessionRes, walletsRes] = await Promise.all([
                    api.get('/sessions/current'),
                    api.get('/wallets')
                ]);

                if (sessionRes.data) {
                    setSession(sessionRes.data);
                    fetchTransactions(sessionRes.data.id);
                } else if (user?.role === 'ADMIN') {
                    // If Admin and no open session, fetch last closed session
                    const lastSessionRes = await api.get('/sessions/last-closed');
                    if (lastSessionRes.data) {
                        setSession(lastSessionRes.data);
                        setIsClosedView(true);
                        // Optional: fetch transactions for that last session if we want to show history
                        fetchTransactions(lastSessionRes.data.id);
                    }
                }

                setWallets(walletsRes.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const fetchTransactions = async (sessionId) => {
        try {
            const res = await api.get(`/transactions?session_id=${sessionId}`);
            setTransactions(res.data);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-screen bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    if (!session && !isClosedView) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Store className="w-10 h-10 text-blue-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Warung H12 Financial</h1>
                    <p className="text-gray-500 mb-8">Warung belum dibuka hari ini. Silahkan buka sesi baru untuk mulai mencatat.</p>
                    <Link
                        to="/open-session"
                        className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition w-full"
                    >
                        <Store className="w-5 h-5" />
                        Buka Warung Sekarang
                    </Link>

                    <button
                        onClick={logout}
                        className="mt-4 w-full flex items-center justify-center gap-2 text-red-600 font-medium hover:bg-red-50 px-8 py-3 rounded-xl transition"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </div>
        );
    }

    const calculateBalance = (walletId) => {
        if (!session || !session.SessionBalances) return 0;

        let total = 0;

        // Find opening balance for this wallet
        const balanceRecord = session.SessionBalances.find(b => b.wallet_id === walletId);

        // if (isClosedView) {
        //     // If closed view, show the final balance (closing or actual)
        //     if (balanceRecord) {
        //         const wallet = wallets.find(w => w.id === walletId);
        //         if (wallet?.type === 'DIGITAL') {
        //             return Number(balanceRecord.closing_balance || 0);
        //         } else {
        //             return Number(balanceRecord.actual_balance || 0);
        //         }
        //     }
        //     return 0;
        // }

        if (balanceRecord) {
            total += Number(balanceRecord.opening_balance || 0);
        }

        // Adjust based on transactions
        transactions.forEach(trx => {
            // Income / Transfer In
            if (trx.destination_wallet === walletId) {
                total += Number(trx.amount);
            }
            // Expense / Transfer Out
            if (trx.source_wallet === walletId) {
                total -= Number(trx.amount);
            }
        });

        return total;
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Store className="w-6 h-6 text-blue-600" />
                            Warung H12
                        </h1>
                        <p className="text-xs text-gray-500 mt-1">Sesi: {new Date(session.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 ${isClosedView
                                ? 'bg-red-100 text-red-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}>
                            <Store className="w-4 h-4" />
                            {isClosedView ? 'Warung Tutup' : 'Warung Buka'}
                        </div>
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-semibold text-gray-900 capitalize">{user?.username || 'User'}</p>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                                {user?.role || 'KASIR'}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-6 space-y-8">

                {/* Saldo Cards */}
                <section>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Saldo {isClosedView ? 'Terakhir (Tutup Warung)' : 'Saat Ini'}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {wallets.map((wallet, index) => {
                            let gradient = 'bg-gradient-to-br from-blue-500 to-blue-600';
                            let icon = <Wallet className="w-6 h-6 text-white opacity-80" />;

                            if (wallet.type === 'DIGITAL') {
                                icon = <Smartphone className="w-6 h-6 text-white opacity-80" />;
                                if (index % 3 === 0) gradient = 'bg-gradient-to-br from-purple-500 to-purple-600';
                                else if (index % 3 === 1) gradient = 'bg-gradient-to-br from-sky-500 to-sky-600';
                                else gradient = 'bg-gradient-to-br from-orange-500 to-orange-600';
                            } else {
                                if (index % 2 !== 0) gradient = 'bg-gradient-to-br from-emerald-500 to-emerald-600';
                            }

                            return (
                                <BalanceCard
                                    key={wallet.id}
                                    title={wallet.name}
                                    amount={calculateBalance(wallet.id)}
                                    icon={icon}
                                    gradient={gradient}
                                    subtitle={wallet.type === 'DIGITAL' ? 'Saldo Digital' : 'Uang Fisik'}
                                />
                            );
                        })}
                    </div>
                </section>

                {/* Quick Actions - Hide if closed, unless ADMIN */}
                {(!isClosedView || user?.role === 'ADMIN') && (
                    <section>
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            Aksi Cepat {isClosedView && <span className="text-sm font-normal text-red-500 ml-2">(Mode Admin)</span>}
                        </h2>
                        <div className="grid grid-cols-3 gap-4">
                            <ActionLink
                                to="/transaction/income"
                                icon={<PlusCircle className="w-8 h-8 text-emerald-600" />}
                                label="Pemasukan"
                                desc="Terima Uang"
                                color="hover:bg-emerald-50 border-emerald-100"
                            />
                            <ActionLink
                                to="/transaction/expense"
                                icon={<MinusCircle className="w-8 h-8 text-red-600" />}
                                label="Pengeluaran"
                                desc="Bayar Sesuatu"
                                color="hover:bg-red-50 border-red-100"
                            />
                            <ActionLink
                                to="/transaction/transfer"
                                icon={<ArrowRightLeft className="w-8 h-8 text-blue-600" />}
                                label="Transfer"
                                desc="Pindah Dana"
                                color="hover:bg-blue-50 border-blue-100"
                            />
                        </div>
                    </section>
                )}

                {/* Recent Transactions */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="font-semibold text-gray-800">Riwayat Transaksi Hari Ini</h2>
                        <Link to="/reports" className="text-sm text-blue-600 font-medium hover:underline">Lihat Laporan Bulanan</Link>
                    </div>

                    {transactions.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                            <div className="inline-block p-4 bg-gray-50 rounded-full mb-3">
                                <ArrowRightLeft className="w-6 h-6 text-gray-300" />
                            </div>
                            <p>Belum ada transaksi tercatat hari ini.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {transactions.map((trx) => {
                                // Helper to find wallet name
                                const getWalletName = (id) => {
                                    const w = wallets.find(w => w.id === id);
                                    return w ? w.name : 'Unknown';
                                };

                                return (
                                    <div key={trx.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${trx.type === 'INCOME' ? 'bg-emerald-100 text-emerald-600' :
                                                trx.type === 'EXPENSE' ? 'bg-red-100 text-red-600' :
                                                    'bg-blue-100 text-blue-600'
                                                }`}>
                                                {trx.type === 'INCOME' ? <PlusCircle className="w-5 h-5" /> :
                                                    trx.type === 'EXPENSE' ? <MinusCircle className="w-5 h-5" /> :
                                                        <ArrowRightLeft className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{trx.category}</p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(trx.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} • {trx.description || '-'}
                                                </p>
                                                {/* Show wallet info if relevant */}
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    {trx.type === 'INCOME' ? `Ke: ${getWalletName(trx.destination_wallet)}` :
                                                        trx.type === 'EXPENSE' ? `Dari: ${getWalletName(trx.source_wallet)}` :
                                                            `${getWalletName(trx.source_wallet)} ➔ ${getWalletName(trx.destination_wallet)}`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={`font-bold ${trx.type === 'INCOME' ? 'text-emerald-600' :
                                            trx.type === 'EXPENSE' ? 'text-red-600' :
                                                'text-blue-600'
                                            }`}>
                                            {trx.type === 'INCOME' ? '+' : trx.type === 'EXPENSE' ? '-' : ''} Rp {Number(trx.amount).toLocaleString('id-ID')}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

            </main>
        </div>
    );
};

const BalanceCard = ({ title, amount, icon, gradient, subtitle }) => (
    <div className={`${gradient} rounded-2xl p-6 text-white shadow-lg transform transition hover:scale-[1.02]`}>
        <div className="flex justify-between items-start mb-4">
            <div>
                <p className="text-blue-100 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-2xl font-bold">Rp {Number(amount).toLocaleString('id-ID')}</h3>
                {subtitle && <p className="text-xs text-blue-100 mt-1 opacity-80">{subtitle}</p>}
            </div>
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                {icon}
            </div>
        </div>
    </div>
);

const ActionLink = ({ to, icon, label, desc, color }) => (
    <Link
        to={to}
        className={`flex flex-col items-center justify-center p-6 bg-white border rounded-2xl shadow-sm transition-all duration-200 ${color} group`}
    >
        <div className="mb-3 transform group-hover:scale-110 transition-transform duration-200">
            {icon}
        </div>
        <span className="font-bold text-gray-800 mb-1">{label}</span>
        <span className="text-xs text-gray-500">{desc}</span>
    </Link>
);

export default Dashboard;

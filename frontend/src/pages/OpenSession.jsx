import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Store } from 'lucide-react';
import CurrencyInput from '../components/CurrencyInput';

const OpenSession = () => {
    const navigate = useNavigate();
    const [wallets, setWallets] = useState([]);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [walletsRes, lastSessionRes] = await Promise.all([
                    api.get('/wallets'),
                    api.get('/sessions/last-closed')
                ]);

                setWallets(walletsRes.data);

                const lastSession = lastSessionRes.data;
                const initialData = {};

                // Initialize form data
                walletsRes.data.forEach(w => {
                    initialData[w.id] = '';
                });

                // Pre-fill from last session if available
                if (lastSession && lastSession.SessionBalances) {
                    lastSession.SessionBalances.forEach(b => {
                        const wallet = walletsRes.data.find(w => w.id === b.wallet_id);
                        if (wallet) {
                            if (wallet.type === 'DIGITAL') {
                                initialData[wallet.id] = b.closing_balance;
                            } else {
                                initialData[wallet.id] = b.actual_balance;
                            }
                        }
                    });
                }

                setFormData(initialData);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleChange = (id, value) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const balances = Object.entries(formData).map(([walletId, balance]) => ({
                wallet_id: walletId,
                opening_balance: balance || 0
            }));

            await api.post('/sessions/open', { balances });
            navigate('/');
        } catch (error) {
            alert('Gagal membuka warung: ' + error.message);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    const physicalWallets = wallets.filter(w => w.type === 'PHYSICAL');
    const digitalWallets = wallets.filter(w => w.type === 'DIGITAL');

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/" className="p-2 hover:bg-gray-200 rounded-full transition">
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Buka Warung</h1>
                        <p className="text-gray-500">Input saldo awal hari ini</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm space-y-8">

                    {physicalWallets.length > 0 && (
                        <section>
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                                Saldo Fisik (Cash)
                            </h2>
                            <div className="space-y-4">
                                {physicalWallets.map(w => (
                                    <InputGroup
                                        key={w.id}
                                        label={w.name}
                                        value={formData[w.id]}
                                        onChange={(e) => handleChange(w.id, e.target.value)}
                                        placeholder="0"
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {physicalWallets.length > 0 && digitalWallets.length > 0 && (
                        <div className="border-t border-gray-100"></div>
                    )}

                    {digitalWallets.length > 0 && (
                        <section>
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                                Saldo Digital
                            </h2>
                            <div className="space-y-4">
                                {digitalWallets.map(w => (
                                    <InputGroup
                                        key={w.id}
                                        label={w.name}
                                        value={formData[w.id]}
                                        onChange={(e) => handleChange(w.id, e.target.value)}
                                        placeholder="0"
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg hover:shadow-blue-200 flex items-center justify-center gap-2 mt-8"
                    >
                        <Store className="w-5 h-5" />
                        Buka Warung Sekarang
                    </button>
                </form>
            </div>
        </div>
    );
};

const InputGroup = ({ label, value, onChange, placeholder }) => (
    <div>
        <label className="block text-sm font-medium text-gray-600 mb-1.5">{label}</label>
        <div className="relative">
            <span className="absolute left-4 top-3.5 text-gray-400 font-medium">Rp</span>
            <CurrencyInput
                value={value}
                onChange={onChange}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition font-medium"
                placeholder={placeholder}
                required
            />
        </div>
    </div>
);

export default OpenSession;

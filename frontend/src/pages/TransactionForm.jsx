import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { ArrowLeft, Save, ArrowRightLeft, PlusCircle, MinusCircle } from 'lucide-react';
import CurrencyInput from '../components/CurrencyInput';

const TransactionForm = () => {
    const { type } = useParams(); // income, expense, transfer
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [wallets, setWallets] = useState([]);

    const [formData, setFormData] = useState({
        amount: '',
        category: '',
        source_wallet: '',
        destination_wallet: '',
        description: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catsRes, walletsRes] = await Promise.all([
                    api.get('/categories'),
                    api.get('/wallets')
                ]);

                setCategories(catsRes.data);
                setWallets(walletsRes.data);

                // Set default wallets if available
                const defaultSource = walletsRes.data.find(w => w.name === 'LACI2')?.id || '';
                const defaultDest = walletsRes.data.find(w => w.name === 'LACI2')?.id || '';

                if (type === 'income') {
                    setFormData(prev => ({ ...prev, destination_wallet: defaultDest }));
                } else if (type === 'expense') {
                    setFormData(prev => ({ ...prev, source_wallet: defaultSource }));
                } else {
                    setFormData(prev => ({ ...prev, source_wallet: defaultSource, destination_wallet: '' }));
                }

            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [type]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                type: type === 'income' ? 'INCOME' : type === 'expense' ? 'EXPENSE' : 'TRANSFER',
                amount: formData.amount,
                description: formData.description,
            };

            if (type === 'income') {
                payload.category = formData.category;
                payload.destination_wallet = formData.destination_wallet;
            } else if (type === 'expense') {
                payload.category = formData.category;
                payload.source_wallet = formData.source_wallet;
            } else {
                payload.category = 'TRANSFER';
                payload.source_wallet = formData.source_wallet;
                payload.destination_wallet = formData.destination_wallet;
            }

            await api.post('/transactions', payload);
            navigate('/');
        } catch (error) {
            alert('Gagal menyimpan transaksi: ' + error.message);
        }
    };

    const getTitle = () => {
        switch (type) {
            case 'income': return 'Catat Pemasukan';
            case 'expense': return 'Catat Pengeluaran';
            case 'transfer': return 'Transfer Dana';
            default: return 'Transaksi';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'income': return <PlusCircle className="w-6 h-6 text-emerald-600" />;
            case 'expense': return <MinusCircle className="w-6 h-6 text-red-600" />;
            case 'transfer': return <ArrowRightLeft className="w-6 h-6 text-blue-600" />;
            default: return null;
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    const filteredCategories = categories.filter(c =>
        type === 'income' ? c.type === 'INCOME' : c.type === 'EXPENSE'
    );

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/" className="p-2 hover:bg-gray-200 rounded-full transition">
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{getTitle()}</h1>
                        <p className="text-gray-500">Isi detail transaksi di bawah ini</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm space-y-6">

                    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                        <div className={`p-3 rounded-xl ${type === 'income' ? 'bg-emerald-100' :
                                type === 'expense' ? 'bg-red-100' : 'bg-blue-100'
                            }`}>
                            {getIcon()}
                        </div>
                        <h2 className="text-lg font-bold text-gray-800">Detail {getTitle()}</h2>
                    </div>

                    {/* Amount Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Jumlah Uang</label>
                        <div className="relative">
                            <span className="absolute left-4 top-3.5 text-gray-400 font-medium">Rp</span>
                            <CurrencyInput
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition font-bold text-lg"
                                placeholder="0"
                                required
                            />
                        </div>
                    </div>

                    {/* Category Input (Hidden for Transfer) */}
                    {type !== 'transfer' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                required
                            >
                                <option value="">Pilih Kategori</option>
                                {filteredCategories.map(c => (
                                    <option key={c.id} value={c.name}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Source Wallet (Expense & Transfer) */}
                    {(type === 'expense' || type === 'transfer') && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Sumber Dana</label>
                            <select
                                value={formData.source_wallet}
                                onChange={(e) => setFormData({ ...formData, source_wallet: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                required
                            >
                                <option value="">Pilih Dompet Asal</option>
                                {wallets.map(w => (
                                    <option key={w.id} value={w.id}>{w.name} ({w.type === 'DIGITAL' ? 'Digital' : 'Fisik'})</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Destination Wallet (Income & Transfer) */}
                    {(type === 'income' || type === 'transfer') && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {type === 'transfer' ? 'Tujuan Transfer' : 'Masuk ke Dompet'}
                            </label>
                            <select
                                value={formData.destination_wallet}
                                onChange={(e) => setFormData({ ...formData, destination_wallet: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                required
                            >
                                <option value="">Pilih Dompet Tujuan</option>
                                {wallets.map(w => (
                                    <option key={w.id} value={w.id}>{w.name} ({w.type === 'DIGITAL' ? 'Digital' : 'Fisik'})</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Catatan (Opsional)</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Contoh: Beli Token Listrik"
                            rows="3"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg hover:shadow-blue-200 flex items-center justify-center gap-2 mt-8"
                    >
                        <Save className="w-5 h-5" />
                        Simpan Transaksi
                    </button>
                </form>
            </div>
        </div>
    );
};

export default TransactionForm;

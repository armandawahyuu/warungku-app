import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import CurrencyInput from '../components/CurrencyInput';

const TransactionForm = () => {
    const { type } = useParams(); // income, expense, transfer
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        category: '',
        amount: '',
        source_wallet: 'LACI1',
        destination_wallet: '',
        description: '',
    });

    const isTransfer = type === 'transfer';
    const title = isTransfer ? 'Transfer Uang' : type === 'income' ? 'Catat Pemasukan' : 'Catat Pengeluaran';

    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get(`/categories?type=${type === 'income' ? 'INCOME_SOURCE' : 'EXPENSE_CATEGORY'}`);
                setCategories(res.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        if (!isTransfer) {
            fetchCategories();
        }
    }, [type, isTransfer]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                type: isTransfer ? 'TRANSFER' : type === 'income' ? 'INCOME' : 'EXPENSE',
                category: formData.category,
                amount: formData.amount,
                description: formData.description,
                // For Income: source is null, destination is selected
                // For Expense: source is selected, destination is null
                // For Transfer: both are selected
                source_wallet: type === 'income' ? null : formData.source_wallet,
                destination_wallet: type === 'expense' ? null : formData.destination_wallet,
            };

            await api.post('/transactions', payload);
            navigate('/');
        } catch (error) {
            alert('Gagal mencatat transaksi: ' + error.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-lg mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <Link to="/" className="p-2 hover:bg-gray-200 rounded-full transition">
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                </div>

                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm space-y-6">

                    {!isTransfer && (
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-semibold text-gray-700">Kategori</label>
                                <Link to="/settings/categories" className="text-xs text-blue-600 hover:underline">
                                    + Kelola Kategori
                                </Link>
                            </div>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
                                required
                            >
                                <option value="">Pilih Kategori</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Jumlah (Rp)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-3.5 text-gray-500 font-medium">Rp</span>
                            <CurrencyInput
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-lg font-semibold"
                                placeholder="0"
                                required
                            />
                        </div>
                    </div>

                    {/* Logic for Wallet Selection */}
                    {/* If Income: Show Destination Wallet (Masuk ke Dompet) */}
                    {type === 'income' && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Masuk ke Dompet</label>
                            <select
                                name="destination_wallet"
                                value={formData.destination_wallet}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
                                required
                            >
                                <option value="">Pilih Dompet</option>
                                <option value="LACI1">Laci 1 (Brilink)</option>
                                <option value="LACI2">Laci 2 (Warung)</option>
                                <option value="BRILINK">Saldo Brilink</option>
                                <option value="DANA">Saldo Dana</option>
                                <option value="DIGIPOS">Saldo Digipos</option>
                                <option value="BRANKAS">Brankas</option>
                                <option value="BANK">Bank</option>
                            </select>
                        </div>
                    )}

                    {/* If Expense: Show Source Wallet (Sumber Dana) */}
                    {type === 'expense' && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Sumber Dana</label>
                            <select
                                name="source_wallet"
                                value={formData.source_wallet}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
                            >
                                <option value="LACI1">Laci 1 (Brilink)</option>
                                <option value="LACI2">Laci 2 (Warung)</option>
                                <option value="BRILINK">Saldo Brilink</option>
                                <option value="DANA">Saldo Dana</option>
                                <option value="DIGIPOS">Saldo Digipos</option>
                                <option value="BRANKAS">Brankas</option>
                                <option value="BANK">Bank</option>
                            </select>
                        </div>
                    )}

                    {/* If Transfer: Show Source and Destination */}
                    {isTransfer && (
                        <>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Sumber Dana</label>
                                <select
                                    name="source_wallet"
                                    value={formData.source_wallet}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
                                >
                                    <option value="LACI1">Laci 1 (Brilink)</option>
                                    <option value="LACI2">Laci 2 (Warung)</option>
                                    <option value="BRILINK">Saldo Brilink</option>
                                    <option value="DANA">Saldo Dana</option>
                                    <option value="DIGIPOS">Saldo Digipos</option>
                                    <option value="BRANKAS">Brankas</option>
                                    <option value="BANK">Bank</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Tujuan Transfer</label>
                                <select
                                    name="destination_wallet"
                                    value={formData.destination_wallet}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
                                    required
                                >
                                    <option value="">Pilih Tujuan</option>
                                    <option value="LACI1">Laci 1 (Brilink)</option>
                                    <option value="LACI2">Laci 2 (Warung)</option>
                                    <option value="BRILINK">Saldo Brilink</option>
                                    <option value="DANA">Saldo Dana</option>
                                    <option value="DIGIPOS">Saldo Digipos</option>
                                    <option value="BRANKAS">Brankas</option>
                                    <option value="BANK">Bank</option>
                                </select>
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Keterangan (Opsional)</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                            rows="3"
                            placeholder="Tambahkan catatan jika perlu..."
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        className={`w-full text-white py-4 rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${isTransfer
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : type === 'income'
                                ? 'bg-emerald-600 hover:bg-emerald-700'
                                : 'bg-red-600 hover:bg-red-700'
                            }`}
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

import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Plus, Trash2, Wallet, Smartphone, Archive } from 'lucide-react';
import { Link } from 'react-router-dom';

const WalletSettings = () => {
    const [wallets, setWallets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newWallet, setNewWallet] = useState({ name: '', type: 'DIGITAL' });

    useEffect(() => {
        fetchWallets();
    }, []);

    const fetchWallets = async () => {
        try {
            const res = await api.get('/wallets');
            setWallets(res.data);
        } catch (error) {
            console.error('Error fetching wallets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/wallets', newWallet);
            setNewWallet({ name: '', type: 'DIGITAL' });
            fetchWallets();
        } catch (error) {
            alert('Gagal menambah dompet: ' + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Yakin ingin menghapus dompet ini?')) {
            try {
                await api.delete(`/wallets/${id}`);
                fetchWallets();
            } catch (error) {
                alert('Gagal menghapus dompet: ' + error.message);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Kelola Dompet</h1>
                        <p className="text-gray-500">Tambah atau hapus dompet/laci</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Form */}
                    <div className="md:col-span-1">
                        <div className="bg-white p-6 rounded-2xl shadow-sm sticky top-8">
                            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-blue-600" />
                                Tambah Baru
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Dompet</label>
                                    <input
                                        type="text"
                                        value={newWallet.name}
                                        onChange={(e) => setNewWallet({ ...newWallet, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Contoh: Gopay"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                                    <select
                                        value={newWallet.type}
                                        onChange={(e) => setNewWallet({ ...newWallet, type: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="DIGITAL">Digital (E-Wallet/Bank)</option>
                                        <option value="PHYSICAL">Fisik (Laci/Brankas)</option>
                                    </select>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition"
                                >
                                    Simpan
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* List */}
                    <div className="md:col-span-2 space-y-4">
                        {loading ? (
                            <div className="text-center py-12">Loading...</div>
                        ) : wallets.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-dashed border-gray-200">
                                Belum ada dompet tersimpan
                            </div>
                        ) : (
                            wallets.map((wallet) => (
                                <div key={wallet.id} className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between group hover:shadow-md transition">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${wallet.type === 'DIGITAL' ? 'bg-purple-100 text-purple-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                            {wallet.type === 'DIGITAL' ? <Smartphone className="w-6 h-6" /> : <Archive className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{wallet.name}</h3>
                                            <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600 font-medium">
                                                {wallet.type === 'DIGITAL' ? 'Saldo Digital' : 'Uang Fisik'}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(wallet.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                        title="Hapus"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WalletSettings;

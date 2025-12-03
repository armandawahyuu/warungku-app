import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Tag } from 'lucide-react';

const CategorySettings = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newCategory, setNewCategory] = useState('');
    const [type, setType] = useState('EXPENSE'); // or INCOME

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newCategory.trim()) return;

        setLoading(true);
        try {
            await api.post('/categories', { type, name: newCategory });
            setNewCategory('');
            await fetchCategories();
        } catch (error) {
            alert('Gagal menambah kategori: ' + error.message);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Yakin ingin menghapus kategori ini?')) return;
        try {
            await api.delete(`/categories/${id}`);
            fetchCategories();
        } catch (error) {
            alert('Gagal menghapus kategori: ' + error.message);
        }
    };

    const filteredCategories = categories.filter(c => c.type === type);

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/" className="p-2 hover:bg-gray-200 rounded-full transition">
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Pengaturan Kategori</h1>
                        <p className="text-gray-500">Kelola kategori pemasukan dan pengeluaran</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    {/* Tabs */}
                    <div className="flex border-b border-gray-100">
                        <button
                            onClick={() => setType('EXPENSE')}
                            className={`flex-1 py-4 font-semibold text-sm transition ${type === 'EXPENSE' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            Pengeluaran
                        </button>
                        <button
                            onClick={() => setType('INCOME')}
                            className={`flex-1 py-4 font-semibold text-sm transition ${type === 'INCOME' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            Pemasukan
                        </button>
                    </div>

                    <div className="p-6">
                        {/* Add Form */}
                        <form onSubmit={handleAdd} className="flex gap-3 mb-8">
                            <input
                                type="text"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                                placeholder={`Tambah kategori ${type === 'EXPENSE' ? 'pengeluaran' : 'pemasukan'} baru...`}
                            />
                            <button
                                type="submit"
                                disabled={!newCategory.trim() || loading}
                                className={`
                                    px-6 rounded-xl font-bold transition flex items-center gap-2
                                    ${!newCategory.trim() || loading
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'}
                                `}
                            >
                                <Plus className="w-5 h-5" />
                                {loading ? 'Menyimpan...' : 'Tambah'}
                            </button>
                        </form>

                        {/* List */}
                        {loading ? (
                            <div className="text-center py-8 text-gray-400">Loading...</div>
                        ) : filteredCategories.length === 0 ? (
                            <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed border-gray-100">
                                <Tag className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p>Belum ada kategori.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filteredCategories.map((cat) => (
                                    <div key={cat.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl group hover:bg-white hover:shadow-sm transition border border-transparent hover:border-gray-100">
                                        <span className="font-medium text-gray-700">{cat.name}</span>
                                        <button
                                            onClick={() => handleDelete(cat.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100"
                                            title="Hapus"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategorySettings;

import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Users, Shield } from 'lucide-react';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newUser, setNewUser] = useState({ username: '', password: '', role: 'KASIR' });
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.role !== 'ADMIN') {
            navigate('/');
            return;
        }
        fetchUsers();
    }, [user, navigate]);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newUser.username || !newUser.password) return;

        try {
            await api.post('/auth/register', {
                username: newUser.username,
                password: newUser.password,
                role: newUser.role
            });
            setNewUser({ username: '', password: '', role: 'KASIR' });
            fetchUsers();
        } catch (error) {
            alert('Gagal menambah user: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDelete = async (id, username) => {
        if (!window.confirm(`Yakin ingin menghapus user "${username}"?`)) return;

        try {
            await api.delete(`/users/${id}`);
            fetchUsers();
        } catch (error) {
            alert('Gagal menghapus user: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/" className="p-2 hover:bg-gray-200 rounded-full transition">
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Kelola User</h1>
                        <p className="text-gray-500">Tambah dan hapus akun kasir</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Create User Form */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-blue-600" />
                            Tambah User Baru
                        </h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    value={newUser.username}
                                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    placeholder="Username"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    placeholder="Password"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Role
                                </label>
                                <select
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-white"
                                >
                                    <option value="KASIR">Kasir</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Tambah User
                            </button>
                        </form>
                    </div>

                    {/* Users List */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-gray-600" />
                            Daftar User
                        </h2>
                        {loading ? (
                            <div className="text-center py-8 text-gray-400">Loading...</div>
                        ) : users.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">Belum ada user.</div>
                        ) : (
                            <div className="space-y-2">
                                {users.map((usr) => (
                                    <div
                                        key={usr.id}
                                        className="flex justify-between items-center p-4 bg-gray-50 rounded-xl group hover:bg-white hover:shadow-sm transition border border-transparent hover:border-gray-100"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${usr.role === 'ADMIN' ? 'bg-purple-100' : 'bg-blue-100'
                                                }`}>
                                                {usr.role === 'ADMIN' ? (
                                                    <Shield className="w-4 h-4 text-purple-600" />
                                                ) : (
                                                    <Users className="w-4 h-4 text-blue-600" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{usr.username}</p>
                                                <p className="text-xs text-gray-500">{usr.role}</p>
                                            </div>
                                        </div>
                                        {usr.id !== user?.id && (
                                            <button
                                                onClick={() => handleDelete(usr.id, usr.username)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100"
                                                title="Hapus"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
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

export default UserManagement;

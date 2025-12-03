import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Link } from 'react-router-dom';
import { ArrowLeft, Edit2, Save, X, Calendar, CheckCircle } from 'lucide-react';

const SessionHistory = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ date: '', status: '' });
    const [dateFilter, setDateFilter] = useState({ startDate: '', endDate: '' });

    useEffect(() => {
        fetchSessions();
    }, [dateFilter]);

    const fetchSessions = async () => {
        try {
            const params = {};
            if (dateFilter.startDate) params.startDate = dateFilter.startDate;
            if (dateFilter.endDate) params.endDate = dateFilter.endDate;

            const res = await api.get('/sessions', { params });
            setSessions(res.data);
        } catch (error) {
            console.error('Error fetching sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (session) => {
        setEditingId(session.id);
        setEditForm({
            date: session.date,
            status: session.status
        });
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditForm({ date: '', status: '' });
    };

    const handleSave = async (id) => {
        try {
            await api.put(`/sessions/${id}`, editForm);
            setEditingId(null);
            fetchSessions();
        } catch (error) {
            alert('Gagal mengupdate sesi: ' + error.message);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/" className="p-2 hover:bg-gray-200 rounded-full transition">
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Riwayat Sesi</h1>
                        <p className="text-gray-500">Kelola dan perbaiki data sesi (Admin Only)</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Filters */}
                    <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-4 bg-gray-50/50">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-600">Dari:</span>
                            <input
                                type="date"
                                value={dateFilter.startDate}
                                onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
                                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-600">Sampai:</span>
                            <input
                                type="date"
                                value={dateFilter.endDate}
                                onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
                                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        {(dateFilter.startDate || dateFilter.endDate) && (
                            <button
                                onClick={() => setDateFilter({ startDate: '', endDate: '' })}
                                className="text-sm text-red-600 hover:text-red-700 font-medium"
                            >
                                Reset Filter
                            </button>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500 font-medium">
                                <tr>
                                    <th className="px-6 py-4">Tanggal</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Catatan</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {sessions.map((session) => (
                                    <tr key={session.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            {editingId === session.id ? (
                                                <input
                                                    type="date"
                                                    value={editForm.date}
                                                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                                                    className="px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            ) : (
                                                <div className="flex items-center gap-2 text-gray-900 font-medium">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    {new Date(session.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {editingId === session.id ? (
                                                <select
                                                    value={editForm.status}
                                                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                                    className="px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="OPEN">OPEN</option>
                                                    <option value="CLOSED">CLOSED</option>
                                                </select>
                                            ) : (
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${session.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {session.status}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 max-w-xs truncate">
                                            {session.notes || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {editingId === session.id ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleSave(session.id)}
                                                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                                                        title="Simpan"
                                                    >
                                                        <Save className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={handleCancel}
                                                        className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition"
                                                        title="Batal"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleEdit(session)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                    title="Edit Sesi"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SessionHistory;

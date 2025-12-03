import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Download, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const Reports = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    useEffect(() => {
        const fetchReport = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/reports/monthly?month=${month}&year=${year}`);
                setData(res.data);
            } catch (error) {
                console.error('Error fetching report:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [month, year]);

    const formatCurrency = (val) => 'Rp ' + Number(val).toLocaleString('id-ID');

    return (
        <div className="min-h-screen bg-gray-50 p-4 pb-20">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="p-2 hover:bg-gray-200 rounded-full transition">
                            <ArrowLeft className="w-6 h-6 text-gray-600" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Laporan Keuangan</h1>
                            <p className="text-gray-500">Analisa performa warungmu</p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                        <select
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            className="px-4 py-2 bg-gray-50 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {new Date(0, i).toLocaleString('id-ID', { month: 'long' })}
                                </option>
                            ))}
                        </select>
                        <select
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            className="px-4 py-2 bg-gray-50 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="2024">2024</option>
                            <option value="2025">2025</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : data ? (
                    <div className="space-y-6 animate-fade-in">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <SummaryCard
                                title="Total Pemasukan"
                                amount={data.summary.totalIncome}
                                icon={<TrendingUp className="w-6 h-6 text-emerald-600" />}
                                color="bg-emerald-50 text-emerald-600"
                            />
                            <SummaryCard
                                title="Total Pengeluaran"
                                amount={data.summary.totalExpense}
                                icon={<TrendingDown className="w-6 h-6 text-red-600" />}
                                color="bg-red-50 text-red-600"
                            />
                            <SummaryCard
                                title="Keuntungan Bersih"
                                amount={data.summary.netProfit}
                                icon={<DollarSign className="w-6 h-6 text-blue-600" />}
                                color="bg-blue-50 text-blue-600"
                            />
                        </div>

                        {/* Chart */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800 mb-6">Grafik Harian</h2>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.daily}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(val) => `${val / 1000}k`} />
                                        <Tooltip
                                            cursor={{ fill: '#f9fafb' }}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            formatter={(value) => formatCurrency(value)}
                                        />
                                        <Legend />
                                        <Bar dataKey="income" name="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="expense" name="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Transaction List */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h2 className="text-lg font-bold text-gray-800">Rincian Transaksi</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-500 font-medium">
                                        <tr>
                                            <th className="px-6 py-4">Tanggal</th>
                                            <th className="px-6 py-4">Kategori</th>
                                            <th className="px-6 py-4">Keterangan</th>
                                            <th className="px-6 py-4 text-right">Jumlah</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {data.transactions.map((trx) => (
                                            <tr key={trx.id} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4 text-gray-600">
                                                    {new Date(trx.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="px-6 py-4 font-medium text-gray-900">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${trx.type === 'INCOME' ? 'bg-emerald-100 text-emerald-800' :
                                                        trx.type === 'EXPENSE' ? 'bg-red-100 text-red-800' :
                                                            'bg-blue-100 text-blue-800'
                                                        }`}>
                                                        {trx.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500">{trx.description || '-'}</td>
                                                <td className={`px-6 py-4 text-right font-bold ${trx.type === 'INCOME' ? 'text-emerald-600' :
                                                    trx.type === 'EXPENSE' ? 'text-red-600' :
                                                        'text-blue-600'
                                                    }`}>
                                                    {trx.type === 'INCOME' ? '+' : trx.type === 'EXPENSE' ? '-' : ''} {formatCurrency(trx.amount)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

const SummaryCard = ({ title, amount, icon, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className={`p-3 rounded-xl ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900">Rp {Number(amount).toLocaleString('id-ID')}</h3>
        </div>
    </div>
);

export default Reports;

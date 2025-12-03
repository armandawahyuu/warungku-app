import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Calculator } from 'lucide-react';
import CurrencyInput from '../components/CurrencyInput';
import { useAuth } from '../hooks/useAuth';

const CloseSession = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [step, setStep] = useState(1);
    const [wallets, setWallets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentSessionId, setCurrentSessionId] = useState(id);

    const [formData, setFormData] = useState({});
    const [cashCount, setCashCount] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                let sessionId = id;

                // If no ID in params, fetch current session
                if (!sessionId) {
                    const sessionRes = await api.get('/sessions/current');
                    if (!sessionRes.data) {
                        alert('Tidak ada sesi aktif. Anda akan diarahkan ke Dashboard.');
                        navigate('/');
                        return;
                    }
                    sessionId = sessionRes.data.id;
                }

                setCurrentSessionId(sessionId);

                const res = await api.get('/wallets');
                setWallets(res.data);

                const initialData = {};
                const initialCashCount = {};

                res.data.forEach(w => {
                    if (w.type === 'DIGITAL') {
                        initialData[w.id] = ''; // Closing balance
                    } else {
                        initialData[w.id] = 0; // Actual cash total
                        initialCashCount[w.id] = { c100k: 0, c50k: 0, c20k: 0, c10k: 0 };
                    }
                });

                setFormData(initialData);
                setCashCount(initialCashCount);

                // Store sessionId for submission if it wasn't in params
                if (!id) {
                    // We can't easily update params, so we'll use a state or just rely on the variable if we were refactoring more.
                    // But wait, handleSubmit uses `id` from useParams. We need to fix that too.
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                navigate('/');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, navigate]);

    const calculateTotal = (counts) => {
        return (counts.c100k * 100000) + (counts.c50k * 50000) + (counts.c20k * 20000) + (counts.c10k * 10000);
    };

    const handleCashChange = (walletId, denom, value) => {
        const intValue = value === '' ? 0 : parseInt(value, 10);
        const newCounts = { ...cashCount, [walletId]: { ...cashCount[walletId], [denom]: intValue } };
        setCashCount(newCounts);

        const total = calculateTotal(newCounts[walletId]);
        setFormData(prev => ({ ...prev, [walletId]: total }));
    };

    const handleSubmit = async () => {
        if (!window.confirm('Apakah anda yakin data sudah benar? \n\nSetelah ini sesi akan ditutup dan anda akan logout otomatis. Pastikan semua uang fisik dan saldo digital sudah sesuai.')) {
            return;
        }

        try {
            const balances = wallets.map(w => {
                const data = { wallet_id: w.id };
                if (w.type === 'DIGITAL') {
                    data.closing_balance = formData[w.id] || 0;
                } else {
                    data.actual_balance = formData[w.id] || 0;
                }
                return data;
            });

            const cashCountsPayload = [];
            wallets.filter(w => w.type === 'PHYSICAL').forEach(w => {
                cashCountsPayload.push({
                    drawer: w.name,
                    count_100k: cashCount[w.id].c100k,
                    count_50k: cashCount[w.id].c50k,
                    count_20k: cashCount[w.id].c20k,
                    count_10k: cashCount[w.id].c10k,
                });
            });

            const payload = {
                balances,
                cash_counts: cashCountsPayload
            };

            await api.post(`/sessions/${currentSessionId}/close`, payload);
            logout();
        } catch (error) {
            alert('Gagal menutup warung: ' + error.message);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    const digitalWallets = wallets.filter(w => w.type === 'DIGITAL');
    const physicalWallets = wallets.filter(w => w.type === 'PHYSICAL');

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/" className="p-2 hover:bg-gray-200 rounded-full transition">
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Tutup Warung</h1>
                        <p className="text-gray-500">Rekonsiliasi akhir hari</p>
                    </div>
                </div>

                {/* Stepper */}
                <div className="flex items-center mb-8 px-4">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
                    <div className={`flex-1 h-1 mx-4 rounded ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
                </div>

                {step === 1 && (
                    <div className="bg-white p-8 rounded-2xl shadow-sm space-y-6 animate-fade-in">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Calculator className="w-6 h-6 text-purple-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Saldo Digital Akhir</h2>
                        </div>
                        <p className="text-gray-500 mb-6">Masukkan saldo akhir yang tertera di aplikasi masing-masing.</p>

                        <div className="space-y-4">
                            {digitalWallets.map(w => (
                                <InputGroup
                                    key={w.id}
                                    label={`Saldo Akhir ${w.name}`}
                                    value={formData[w.id]}
                                    onChange={(e) => setFormData({ ...formData, [w.id]: e.target.value })}
                                />
                            ))}
                        </div>

                        <button
                            onClick={() => setStep(2)}
                            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg hover:shadow-blue-200 mt-6"
                        >
                            Lanjut: Hitung Uang Fisik
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-white p-8 rounded-2xl shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-emerald-100 rounded-lg">
                                    <Calculator className="w-6 h-6 text-emerald-600" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-800">Hitung Uang Fisik</h2>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                {physicalWallets.map((w, index) => (
                                    <React.Fragment key={w.id}>
                                        <CashDrawerSection
                                            title={w.name}
                                            counts={cashCount[w.id]}
                                            onChange={(d, v) => handleCashChange(w.id, d, v)}
                                            total={formData[w.id]}
                                            color={index % 2 === 0 ? "blue" : "emerald"}
                                        />
                                        {index < physicalWallets.length - 1 && (
                                            <div className="hidden md:block w-px bg-gray-100"></div>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setStep(1)}
                                className="w-1/3 bg-white border border-gray-200 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-50 transition"
                            >
                                Kembali
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="w-2/3 bg-red-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition shadow-lg hover:shadow-red-200 flex items-center justify-center gap-2"
                            >
                                <CheckCircle className="w-5 h-5" />
                                Tutup Warung & Simpan
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const InputGroup = ({ label, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-gray-600 mb-1.5">{label}</label>
        <div className="relative">
            <span className="absolute left-4 top-3.5 text-gray-400 font-medium">Rp</span>
            <CurrencyInput value={value} onChange={onChange} className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition font-medium" placeholder="0" />
        </div>
    </div>
);

const CashDrawerSection = ({ title, counts, onChange, total, color }) => (
    <div>
        <div className="mb-4 p-4 bg-gray-50 rounded-xl">
            <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
            <span className={`text-2xl font-bold text-${color}-600`}>Rp {total.toLocaleString('id-ID')}</span>
        </div>
        <div className="space-y-3">
            <DenomInput label="100.000" value={counts.c100k} onChange={(e) => onChange('c100k', e.target.value)} />
            <DenomInput label="50.000" value={counts.c50k} onChange={(e) => onChange('c50k', e.target.value)} />
            <DenomInput label="20.000" value={counts.c20k} onChange={(e) => onChange('c20k', e.target.value)} />
            <DenomInput label="10.000" value={counts.c10k} onChange={(e) => onChange('c10k', e.target.value)} />
        </div>
    </div>
);

const DenomInput = ({ label, value, onChange }) => (
    <div className="flex items-center gap-3">
        <div className="w-20 text-sm font-medium text-gray-600 text-right">{label}</div>
        <div className="flex-1 relative">
            <CurrencyInput value={value} onChange={onChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-right focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0" />
            <span className="absolute right-8 top-2 text-xs text-gray-400 pointer-events-none">lbr</span>
        </div>
    </div>
);

export default CloseSession;

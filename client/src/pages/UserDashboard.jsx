import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${d.getFullYear()} ${hh}:${min}`;
};

const UserDashboard = () => {
    const { user } = useAuth();
    const [myReports, setMyReports] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchReports = useCallback(async () => {
        try {
            const res = await api.get('/breakdowns');
            setMyReports(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchReports(); }, [fetchReports]);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
                {/* Welcome card */}
                <div className="bg-gradient-to-r from-blue-800 to-blue-700 rounded-2xl p-6 mb-6 text-white shadow-lg">
                    <p className="text-blue-200 text-sm font-medium mb-1">Welcome back,</p>
                    <h1 className="text-2xl font-extrabold">{user?.driver_name || user?.username}</h1>
                    <p className="text-blue-200 text-sm mt-1">Sri Lanka Water Board – OIC Portal</p>
                </div>

                {/* Report Breakdown Button */}
                <Link
                    to="/user/report"
                    className="flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 active:scale-95 text-white rounded-2xl p-5 mb-6 shadow-lg transition-all duration-200 font-bold text-lg"
                >
                    <span className="text-2xl">🚨</span>
                    Report a Breakdown
                    <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>

                {/* My Recent Reports */}
                <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-3">My Breakdown Reports</h2>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        {loading ? (
                            <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
                        ) : myReports.length === 0 ? (
                            <div className="text-center py-12">
                                <span className="text-4xl block mb-2">📋</span>
                                <p className="text-gray-400">No breakdown reports yet.</p>
                                <p className="text-gray-300 text-sm">Use the button above to report a breakdown.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {myReports.map(b => (
                                    <div key={b.id} className="px-5 py-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-900">{b.vehicle_number} <span className="text-gray-400 font-normal text-sm">– {b.vehicle_type}</span></p>
                                                <p className="text-sm text-gray-600 mt-0.5">📍 {b.location}</p>
                                                {b.comment && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">💬 {b.comment}</p>}
                                                <p className="text-xs text-gray-400 mt-1">🕒 {formatDate(b.created_at)}</p>
                                            </div>
                                            <StatusBadge status={b.status} />
                                        </div>
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

export default UserDashboard;

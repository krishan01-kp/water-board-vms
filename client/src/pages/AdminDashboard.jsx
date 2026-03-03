import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import VehicleCard from '../components/VehicleCard';
import StatusBadge from '../components/StatusBadge';
import api from '../api/axios';

const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
};

const StatCard = ({ label, value, icon, color }) => (
    <div className={`bg-white rounded-2xl p-5 border-l-4 ${color} shadow-sm hover:shadow-md transition-shadow`}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">{label}</p>
                <p className="text-3xl font-extrabold text-gray-900 mt-1">{value}</p>
            </div>
            <span className="text-3xl">{icon}</span>
        </div>
    </div>
);

const AdminDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchData = useCallback(async () => {
        try {
            const res = await api.get('/dashboard/stats');
            setData(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleExport = async () => {
        try {
            const res = await api.get('/breakdowns/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = 'breakdown_reports.xlsx';
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert('Export failed: ' + (err.response?.data?.error || err.message));
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="flex items-center justify-center h-[calc(100vh-64px)]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        </div>
    );

    const { stats, recentBreakdowns, vehicles } = data || {};

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-gray-500 text-sm mt-0.5">Water Board Vehicle Management System</p>
                    </div>
                    <button
                        onClick={handleExport}
                        className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export All Breakdowns
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <StatCard label="Total Vehicles" value={stats?.totalVehicles ?? 0} icon="🚗" color="border-blue-500" />
                    <StatCard label="Active Breakdowns" value={stats?.activeBreakdowns ?? 0} icon="🔧" color="border-red-500" />
                    <StatCard label="Resolved Today" value={stats?.resolvedToday ?? 0} icon="✅" color="border-green-500" />
                    <StatCard label="Operational" value={stats?.operational ?? 0} icon="✅" color="border-emerald-500" />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Vehicle Grid */}
                    <div className="xl:col-span-1">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-bold text-gray-900">Fleet Status</h2>
                            <button onClick={() => navigate('/admin/vehicles')} className="text-blue-600 text-sm hover:underline">Manage →</button>
                        </div>
                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                            {vehicles?.length === 0 ? (
                                <p className="text-gray-400 text-sm text-center py-8">No vehicles added yet</p>
                            ) : (
                                vehicles?.map(v => <VehicleCard key={v.id} vehicle={v} />)
                            )}
                        </div>
                    </div>

                    {/* Recent Breakdowns */}
                    <div className="xl:col-span-2">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-bold text-gray-900">Recent Breakdowns</h2>
                            <button onClick={() => navigate('/admin/breakdowns')} className="text-blue-600 text-sm hover:underline">View All →</button>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="text-left px-4 py-3 text-gray-600 font-semibold">Vehicle</th>
                                            <th className="text-left px-4 py-3 text-gray-600 font-semibold hidden sm:table-cell">Location</th>
                                            <th className="text-left px-4 py-3 text-gray-600 font-semibold">Status</th>
                                            <th className="text-left px-4 py-3 text-gray-600 font-semibold hidden md:table-cell">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentBreakdowns?.length === 0 ? (
                                            <tr><td colSpan={4} className="text-center text-gray-400 py-8">No breakdown reports yet</td></tr>
                                        ) : (
                                            recentBreakdowns?.map((b) => (
                                                <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <p className="font-semibold text-gray-900">{b.vehicle_number}</p>
                                                        <p className="text-xs text-gray-400">{b.vehicle_type}</p>
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-600 hidden sm:table-cell max-w-[150px] truncate">{b.location}</td>
                                                    <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                                                    <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">{formatDate(b.created_at)}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

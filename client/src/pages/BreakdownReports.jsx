import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
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

const statusOrder = ['pending', 'in_progress', 'resolved'];

const BreakdownReports = () => {
    const [breakdowns, setBreakdowns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);
    const [message, setMessage] = useState({ text: '', type: '' });

    const fetchBreakdowns = useCallback(async () => {
        try {
            const res = await api.get('/breakdowns');
            setBreakdowns(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchBreakdowns(); }, [fetchBreakdowns]);

    const showMessage = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    const handleStatusUpdate = async (id, currentStatus) => {
        const currentIndex = statusOrder.indexOf(currentStatus);
        if (currentIndex === statusOrder.length - 1) return; // already resolved
        const nextStatus = statusOrder[currentIndex + 1];
        setUpdating(id);
        try {
            await api.put(`/breakdowns/${id}`, { status: nextStatus });
            showMessage(`Status updated to ${nextStatus.replace('_', ' ')}`);
            fetchBreakdowns();
        } catch (err) {
            showMessage(err.response?.data?.error || 'Update failed.', 'error');
        } finally {
            setUpdating(null);
        }
    };

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
            showMessage('Export failed.', 'error');
        }
    };

    const getNextStatusLabel = (status) => {
        const idx = statusOrder.indexOf(status);
        if (idx >= statusOrder.length - 1) return null;
        const next = statusOrder[idx + 1];
        return next === 'in_progress' ? 'Mark In Progress' : 'Mark Resolved';
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Breakdown Reports</h1>
                    <button
                        onClick={handleExport}
                        className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export to Excel
                    </button>
                </div>

                {message.text && (
                    <div className={`mb-4 p-3 rounded-xl text-sm font-medium ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                        {message.text}
                    </div>
                )}

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="text-left px-4 py-3 text-gray-600 font-semibold">Date</th>
                                        <th className="text-left px-4 py-3 text-gray-600 font-semibold">Vehicle</th>
                                        <th className="text-left px-4 py-3 text-gray-600 font-semibold hidden md:table-cell">Type</th>
                                        <th className="text-left px-4 py-3 text-gray-600 font-semibold hidden lg:table-cell">Location</th>
                                        <th className="text-left px-4 py-3 text-gray-600 font-semibold hidden xl:table-cell">Comment</th>
                                        <th className="text-left px-4 py-3 text-gray-600 font-semibold hidden sm:table-cell">Reported By</th>
                                        <th className="text-left px-4 py-3 text-gray-600 font-semibold">Status</th>
                                        <th className="text-left px-4 py-3 text-gray-600 font-semibold">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {breakdowns.length === 0 ? (
                                        <tr><td colSpan={8} className="text-center text-gray-400 py-12">No breakdown reports yet.</td></tr>
                                    ) : (
                                        breakdowns.map(b => (
                                            <tr key={b.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatDate(b.created_at)}</td>
                                                <td className="px-4 py-3 font-semibold text-gray-900">{b.vehicle_number}</td>
                                                <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{b.vehicle_type}</td>
                                                <td className="px-4 py-3 text-gray-500 max-w-[140px] truncate hidden lg:table-cell">{b.location}</td>
                                                <td className="px-4 py-3 text-gray-500 max-w-[160px] truncate hidden xl:table-cell">{b.comment || '-'}</td>
                                                <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{b.reported_by}</td>
                                                <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                                                <td className="px-4 py-3">
                                                    {getNextStatusLabel(b.status) && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(b.id, b.status)}
                                                            disabled={updating === b.id}
                                                            className={`text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${b.status === 'pending'
                                                                    ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                                                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                                                                } disabled:opacity-50`}
                                                        >
                                                            {updating === b.id ? '...' : getNextStatusLabel(b.status)}
                                                        </button>
                                                    )}
                                                    {b.status === 'resolved' && (
                                                        <span className="text-xs text-gray-400">✅ Resolved</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BreakdownReports;

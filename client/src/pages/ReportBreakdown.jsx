import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';

const VEHICLE_TYPES = ['Car', 'Truck', 'Van', 'Motorcycle', 'Heavy Machinery', 'Water Tanker'];

const ReportBreakdown = () => {
    const [vehicles, setVehicles] = useState([]);
    const [filteredVehicles, setFilteredVehicles] = useState([]);
    const [form, setForm] = useState({ vehicle_type: '', vehicle_id: '', vehicle_number: '', location: '', comment: '' });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const fetchVehicles = useCallback(async () => {
        try {
            const res = await api.get('/vehicles');
            setVehicles(res.data);
        } catch (err) {
            console.error(err);
        }
    }, []);

    useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

    useEffect(() => {
        if (form.vehicle_type) {
            const filtered = vehicles.filter(v => v.vehicle_type === form.vehicle_type);
            setFilteredVehicles(filtered);
            setForm(f => ({ ...f, vehicle_id: '', vehicle_number: '' }));
        } else {
            setFilteredVehicles(vehicles);
            setForm(f => ({ ...f, vehicle_id: '', vehicle_number: '' }));
        }
    }, [form.vehicle_type, vehicles]);

    const handleVehicleSelect = (e) => {
        const id = e.target.value;
        const v = vehicles.find(x => String(x.id) === id);
        setForm(f => ({ ...f, vehicle_id: id, vehicle_number: v ? v.vehicle_number : '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.vehicle_type || !form.vehicle_number || !form.location) {
            setError('All required fields must be filled.');
            return;
        }
        setError('');
        setSubmitting(true);
        try {
            await api.post('/breakdowns', {
                vehicle_id: form.vehicle_id || null,
                vehicle_number: form.vehicle_number,
                vehicle_type: form.vehicle_type,
                location: form.location,
                comment: form.comment,
            });
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to submit report. Try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="max-w-lg mx-auto px-4 py-16 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                        <span className="text-4xl">✅</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Submitted!</h2>
                    <p className="text-gray-500 mb-6">Your breakdown report has been sent to the admin. Help is on the way.</p>
                    <div className="flex gap-3 justify-center">
                        <button onClick={() => { setSuccess(false); setForm({ vehicle_type: '', vehicle_id: '', vehicle_number: '', location: '', comment: '' }); }} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm">
                            Report Another
                        </button>
                        <button onClick={() => navigate('/user/dashboard')} className="px-5 py-2.5 border border-gray-200 rounded-xl font-medium text-sm text-gray-600 hover:bg-gray-50">
                            Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-lg mx-auto px-4 sm:px-6 py-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">🚨 Report Breakdown</h1>
                    <p className="text-gray-500 text-sm mt-1">Fill in all required fields to report a vehicle breakdown.</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
                )}

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type <span className="text-red-500">*</span></label>
                            <select
                                value={form.vehicle_type}
                                onChange={e => setForm(f => ({ ...f, vehicle_type: e.target.value }))}
                                required
                                className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select vehicle type...</option>
                                {VEHICLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number <span className="text-red-500">*</span></label>
                            {filteredVehicles.length > 0 ? (
                                <select
                                    value={form.vehicle_id}
                                    onChange={handleVehicleSelect}
                                    required
                                    className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select vehicle...</option>
                                    {filteredVehicles.map(v => (
                                        <option key={v.id} value={v.id}>{v.vehicle_number} – {v.driver_name}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    value={form.vehicle_number}
                                    onChange={e => setForm(f => ({ ...f, vehicle_number: e.target.value }))}
                                    placeholder="Enter vehicle number (e.g. WB-1001)"
                                    required
                                    className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            )}
                            {form.vehicle_number && <p className="text-xs text-gray-400 mt-1">Selected: {form.vehicle_number}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Location <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={form.location}
                                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                                placeholder="Current breakdown location (be specific)"
                                required
                                className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Comment / Description</label>
                            <textarea
                                value={form.comment}
                                onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                                placeholder="Describe the issue (e.g. flat tire, engine failure, etc.)"
                                rows={3}
                                className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 active:scale-95 text-white font-bold py-4 px-4 rounded-xl transition-all text-base flex items-center justify-center gap-2 shadow-lg"
                        >
                            {submitting ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                    </svg>
                                    Submitting...
                                </>
                            ) : <>🚨 Submit Breakdown Report</>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ReportBreakdown;

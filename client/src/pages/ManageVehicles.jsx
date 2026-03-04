import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import api, { BASE_URL } from '../api/axios';

const VEHICLE_TYPES = ['Car', 'Truck', 'Van', 'Motorcycle', 'Heavy Machinery', 'Water Tanker'];

const ManageVehicles = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ vehicle_type: '', vehicle_number: '', driver_name: '', photo: null });
    const [editVehicle, setEditVehicle] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [previewUrl, setPreviewUrl] = useState(null);

    const fetchVehicles = useCallback(async () => {
        try {
            const res = await api.get('/vehicles');
            setVehicles(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

    const showMessage = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(f => ({ ...f, photo: file }));
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const fd = new FormData();
        fd.append('vehicle_type', formData.vehicle_type);
        fd.append('vehicle_number', formData.vehicle_number);
        fd.append('driver_name', formData.driver_name);
        if (formData.photo) fd.append('photo', formData.photo);

        try {
            if (editVehicle) {
                await api.put(`/vehicles/${editVehicle.id}`, fd);
                showMessage('Vehicle updated successfully!');
            } else {
                await api.post('/vehicles', fd);
                showMessage('Vehicle added successfully!');
            }
            setFormData({ vehicle_type: '', vehicle_number: '', driver_name: '', photo: null });
            setPreviewUrl(null);
            setEditVehicle(null);
            fetchVehicles();
        } catch (err) {
            showMessage(err.response?.data?.error || 'Operation failed.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (v) => {
        setEditVehicle(v);
        setFormData({ vehicle_type: v.vehicle_type, vehicle_number: v.vehicle_number, driver_name: v.driver_name, photo: null });
        setPreviewUrl(v.photo_path ? `${BASE_URL}${v.photo_path}` : null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this vehicle? This cannot be undone.')) return;
        try {
            await api.delete(`/vehicles/${id}`);
            showMessage('Vehicle deleted.');
            fetchVehicles();
        } catch (err) {
            showMessage(err.response?.data?.error || 'Delete failed.', 'error');
        }
    };

    const handleCancel = () => {
        setEditVehicle(null);
        setFormData({ vehicle_type: '', vehicle_number: '', driver_name: '', photo: null });
        setPreviewUrl(null);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Vehicles</h1>

                {message.text && (
                    <div className={`mb-4 p-3 rounded-xl text-sm font-medium ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Add/Edit Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <h2 className="font-bold text-gray-900 mb-4">{editVehicle ? '✏️ Edit Vehicle' : '➕ Add Vehicle'}</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                                    <select
                                        value={formData.vehicle_type}
                                        onChange={e => setFormData(f => ({ ...f, vehicle_type: e.target.value }))}
                                        required
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select type...</option>
                                        {VEHICLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
                                    <input
                                        type="text"
                                        value={formData.vehicle_number}
                                        onChange={e => setFormData(f => ({ ...f, vehicle_number: e.target.value }))}
                                        placeholder="e.g. WB-1001"
                                        required
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Driver Name</label>
                                    <input
                                        type="text"
                                        value={formData.driver_name}
                                        onChange={e => setFormData(f => ({ ...f, driver_name: e.target.value }))}
                                        placeholder="Driver full name"
                                        required
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Photo</label>
                                    {previewUrl && (
                                        <img src={previewUrl} alt="preview" className="w-20 h-20 rounded-xl object-cover mb-2 border border-gray-200" />
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoChange}
                                        className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-medium cursor-pointer"
                                    />
                                </div>
                                <div className="flex gap-2 pt-1">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
                                    >
                                        {submitting ? 'Saving...' : editVehicle ? 'Update Vehicle' : 'Add Vehicle'}
                                    </button>
                                    {editVehicle && (
                                        <button type="button" onClick={handleCancel} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Vehicle List */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100">
                                <h2 className="font-bold text-gray-900">All Vehicles ({vehicles.length})</h2>
                            </div>
                            {loading ? (
                                <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Photo</th>
                                                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Number</th>
                                                <th className="text-left px-4 py-3 text-gray-600 font-semibold hidden sm:table-cell">Type</th>
                                                <th className="text-left px-4 py-3 text-gray-600 font-semibold hidden md:table-cell">Driver</th>
                                                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Status</th>
                                                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {vehicles.length === 0 ? (
                                                <tr><td colSpan={6} className="text-center text-gray-400 py-12">No vehicles yet. Add one!</td></tr>
                                            ) : (
                                                vehicles.map(v => (
                                                    <tr key={v.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                                                        <td className="px-4 py-3">
                                                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-blue-100 flex items-center justify-center">
                                                                {v.photo_path ? (
                                                                    <img src={`${BASE_URL}${v.photo_path}`} alt={v.vehicle_number} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <span className="text-lg">🚗</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 font-semibold text-gray-900">{v.vehicle_number}</td>
                                                        <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{v.vehicle_type}</td>
                                                        <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{v.driver_name}</td>
                                                        <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex gap-2">
                                                                <button onClick={() => handleEdit(v)} className="text-blue-600 hover:text-blue-800 font-medium text-xs px-2 py-1 rounded hover:bg-blue-50">Edit</button>
                                                                <button onClick={() => handleDelete(v.id)} className="text-red-600 hover:text-red-800 font-medium text-xs px-2 py-1 rounded hover:bg-red-50">Delete</button>
                                                            </div>
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
            </div>
        </div>
    );
};

export default ManageVehicles;

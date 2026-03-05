import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';

const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ username: '', password: '', driver_name: '' });
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const fetchUsers = useCallback(async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const showMessage = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/users', form);
            setForm({ username: '', password: '', driver_name: '' });
            showMessage('User created successfully!');
            fetchUsers();
        } catch (err) {
            showMessage(err.response?.data?.error || 'Failed to create user.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this user?')) return;
        try {
            await api.delete(`/users/${id}`);
            showMessage('User deleted.');
            fetchUsers();
        } catch (err) {
            showMessage(err.response?.data?.error || 'Delete failed.', 'error');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Users</h1>

                {message.text && (
                    <div className={`mb-4 p-3 rounded-xl text-sm font-medium ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Create User Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <h2 className="font-bold text-gray-900 mb-4">➕ Create OIC Account</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                    <input
                                        type="text"
                                        value={form.username}
                                        onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                                        placeholder="Login username"
                                        required
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                    <input
                                        type="password"
                                        value={form.password}
                                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                        placeholder="Account password"
                                        required
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">OIC Name</label>
                                    <input
                                        type="text"
                                        value={form.driver_name}
                                        onChange={e => setForm(f => ({ ...f, driver_name: e.target.value }))}
                                        placeholder="Full name of OIC"
                                        required
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
                                >
                                    {submitting ? 'Creating...' : 'Create User'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Users List */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100">
                                <h2 className="font-bold text-gray-900">All Users ({users.length})</h2>
                            </div>
                            {loading ? (
                                <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Username</th>
                                                <th className="text-left px-4 py-3 text-gray-600 font-semibold">OIC Name</th>
                                                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Role</th>
                                                <th className="text-left px-4 py-3 text-gray-600 font-semibold hidden sm:table-cell">Joined</th>
                                                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.length === 0 ? (
                                                <tr><td colSpan={5} className="text-center text-gray-400 py-12">No users found.</td></tr>
                                            ) : (
                                                users.map(u => (
                                                    <tr key={u.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                                                        <td className="px-4 py-3">
                                                            <span className="font-semibold text-gray-900">@{u.username}</span>
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-600">{u.driver_name || '-'}</td>
                                                        <td className="px-4 py-3">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-blue-100 text-blue-800 border border-blue-200'}`}>
                                                                {u.role}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-500 text-xs hidden sm:table-cell">{formatDate(u.created_at)}</td>
                                                        <td className="px-4 py-3">
                                                            {u.role !== 'admin' ? (
                                                                <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:text-red-800 font-medium text-xs px-2 py-1 rounded hover:bg-red-50">Delete</button>
                                                            ) : (
                                                                <span className="text-gray-300 text-xs">Protected</span>
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
            </div>
        </div>
    );
};

export default ManageUsers;

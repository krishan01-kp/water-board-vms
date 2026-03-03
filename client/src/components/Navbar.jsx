import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const Navbar = () => {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const adminLinks = [
        { to: '/admin/dashboard', label: '📊 Dashboard' },
        { to: '/admin/vehicles', label: '🚗 Vehicles' },
        { to: '/admin/users', label: '👥 Users' },
        { to: '/admin/breakdowns', label: '🔧 Breakdowns' },
    ];

    const userLinks = [
        { to: '/user/dashboard', label: '🏠 Dashboard' },
        { to: '/user/report', label: '🚨 Report Breakdown' },
    ];

    const links = isAdmin ? adminLinks : userLinks;

    return (
        <nav className="bg-gradient-to-r from-blue-800 to-blue-900 shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 rounded-lg p-1.5">
                            <span className="text-xl">💧</span>
                        </div>
                        <div>
                            <span className="text-white font-bold text-sm leading-tight block">Water Board VMS</span>
                            <span className="text-blue-200 text-xs leading-tight block">Sri Lanka</span>
                        </div>
                    </div>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-1">
                        {links.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${location.pathname === link.to
                                        ? 'bg-white/20 text-white'
                                        : 'text-blue-100 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* User info + logout */}
                    <div className="hidden md:flex items-center gap-3">
                        <div className="text-right">
                            <span className="text-white text-sm font-medium block">{user?.driver_name || user?.username}</span>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isAdmin ? 'bg-amber-400 text-amber-900' : 'bg-blue-400 text-blue-900'}`}>
                                {isAdmin ? 'Admin' : 'Driver'}
                            </span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="bg-white/10 hover:bg-red-500 text-white text-sm px-3 py-1.5 rounded-lg font-medium transition-colors"
                        >
                            Logout
                        </button>
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden text-white p-2 rounded-lg hover:bg-white/10"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                        </svg>
                    </button>
                </div>

                {/* Mobile menu */}
                {mobileOpen && (
                    <div className="md:hidden pb-3 border-t border-white/20 mt-2 pt-2">
                        {links.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                onClick={() => setMobileOpen(false)}
                                className={`block px-3 py-2 rounded-lg text-sm font-medium mb-1 transition-colors ${location.pathname === link.to
                                        ? 'bg-white/20 text-white'
                                        : 'text-blue-100 hover:bg-white/10'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <div className="border-t border-white/20 mt-2 pt-2 flex items-center justify-between">
                            <span className="text-blue-200 text-sm">{user?.driver_name || user?.username}</span>
                            <button onClick={handleLogout} className="text-sm text-red-300 hover:text-red-100 font-medium">Logout</button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;

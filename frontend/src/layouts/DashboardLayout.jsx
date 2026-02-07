import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
    Users,
    BookOpen,
    GraduationCap,
    LayoutDashboard,
    LogOut,
    Menu,
    X,
    Bell,
    Search,
    Settings,
    ShieldCheck,
    UserCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../utils/cn';

const DashboardLayout = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['SUPER_ADMIN', 'RH', 'RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT'] },
        { name: 'Departments', icon: BookOpen, path: '/departments', roles: ['SUPER_ADMIN', 'RH'] },
        { name: 'Specialities', icon: ShieldCheck, path: '/specialities', roles: ['SUPER_ADMIN', 'RH', 'RESPONSABLE_DEPARTMENT'] },
        { name: 'Staff', icon: Users, path: '/staff', roles: ['SUPER_ADMIN', 'RH'] },
        { name: 'Students', icon: GraduationCap, path: '/students', roles: ['SUPER_ADMIN', 'RH', 'RESPONSABLE_DEPARTMENT', 'SECRETARY'] },
    ];

    const filteredNavItems = navItems.filter(item => item.roles.includes(user?.role_name));

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Sidebar */}
            <aside
                className={cn(
                    "bg-secondary-900 text-white transition-all duration-300 ease-in-out z-30 flex flex-col",
                    isSidebarOpen ? "w-64" : "w-20"
                )}
            >
                <div className="p-6 flex items-center justify-between border-b border-secondary-800 h-20">
                    {isSidebarOpen ? (
                        <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                            Smart UPF
                        </span>
                    ) : (
                        <div className="w-8 h-8 bg-primary-600 rounded-lg" />
                    )}
                    <button
                        onClick={() => setSidebarOpen(!isSidebarOpen)}
                        className="p-1 hover:bg-secondary-800 rounded-lg transition-colors"
                    >
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
                    {filteredNavItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "group flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200",
                                location.pathname === item.path
                                    ? "bg-primary-600 text-white shadow-lg shadow-primary-600/30"
                                    : "text-secondary-400 hover:bg-secondary-800 hover:text-white"
                            )}
                        >
                            <item.icon size={22} className={cn(
                                "flex-shrink-0 group-hover:scale-110 transition-transform",
                                location.pathname === item.path ? "text-white" : "text-secondary-400"
                            )} />
                            {isSidebarOpen && <span className="font-medium">{item.name}</span>}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-secondary-800">
                    <button
                        onClick={handleLogout}
                        className={cn(
                            "group w-full flex items-center gap-4 px-3 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-200",
                            !isSidebarOpen && "justify-center"
                        )}
                    >
                        <LogOut size={22} className="flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                        {isSidebarOpen && <span className="font-medium">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-20 flex-shrink-0">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative w-full max-w-md hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search everything..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-primary-500/20 transition-all text-sm outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-white" />
                        </button>

                        <div className="h-8 w-px bg-slate-200" />

                        <div className="flex items-center gap-4 pl-2">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-slate-900">{user?.email}</p>
                                <p className="text-xs font-semibold text-primary-600 uppercase tracking-wider">{user?.role_name?.replace('_', ' ')}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center text-primary-700">
                                <UserCircle size={28} />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;

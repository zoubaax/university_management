import React, { useState, useEffect } from 'react';
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
    UserCircle,
    Building2,
    FileText,
    BarChart3,
    Calendar,
    School,
    ChevronRight,
    ChevronLeft,
    FolderOpen
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../utils/cn';

const DashboardLayout = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Handle responsive sidebar
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (mobile) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Navigation configuration
    const navItems = [
        {
            category: 'Overview',
            items: [
                { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['SUPER_ADMIN', 'RH', 'RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT', 'PROFESSOR', 'STUDENT'] },
            ]
        },
        {
            category: 'Administration',
            items: [
                { name: 'System', icon: ShieldCheck, path: '/rh-management', roles: ['SUPER_ADMIN'] },
                { name: 'Human Resources', icon: Users, path: '/staff', roles: ['RH', 'SUPER_ADMIN'] },
                { name: 'Departments', icon: Building2, path: '/departments', roles: ['RH', 'SUPER_ADMIN'] },
                { name: 'Students', icon: GraduationCap, path: '/students', roles: ['RESPONSABLE_DEPARTMENT', 'SECRETARY', 'SUPER_ADMIN', 'DIRECTOR_DEPARTMENT'] },
                { name: 'Absences', icon: Calendar, path: '/absences', roles: ['RH', 'SUPER_ADMIN'] },
                { name: 'Student Absences', icon: Calendar, path: '/student-absences', roles: ['RESPONSABLE_DEPARTMENT', 'SUPER_ADMIN', 'DIRECTOR_DEPARTMENT', 'RH'] },
            ]
        },
        {
            category: 'Academic',
            items: [
                { name: 'Specialities', icon: BookOpen, path: '/specialities', roles: ['RESPONSABLE_DEPARTMENT', 'SUPER_ADMIN', 'DIRECTOR_DEPARTMENT'] },
                { name: 'Classes', icon: School, path: '/classes', roles: ['RESPONSABLE_DEPARTMENT', 'SUPER_ADMIN', 'DIRECTOR_DEPARTMENT'] },
                { name: 'Modules', icon: FileText, path: '/modules', roles: ['RESPONSABLE_DEPARTMENT', 'SUPER_ADMIN', 'DIRECTOR_DEPARTMENT'] },
                { name: 'Rooms', icon: Building2, path: '/rooms', roles: ['RESPONSABLE_DEPARTMENT', 'SUPER_ADMIN', 'DIRECTOR_DEPARTMENT'] },
                { name: 'Schedule', icon: Calendar, path: '/schedule', roles: ['PROFESSOR', 'STUDENT', 'RESPONSABLE_DEPARTMENT', 'SUPER_ADMIN', 'DIRECTOR_DEPARTMENT'] },
                { name: 'Course Materials', icon: FolderOpen, path: '/resources', roles: ['PROFESSOR', 'STUDENT'] },
                { name: 'Attendance Report', icon: BarChart3, path: '/attendance-report', roles: ['RESPONSABLE_DEPARTMENT', 'SUPER_ADMIN', 'DIRECTOR_DEPARTMENT'] },
                { name: 'Grades', icon: BarChart3, path: '/grades', roles: ['PROFESSOR', 'STUDENT', 'RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT', 'SUPER_ADMIN'] },
                { name: 'Certificates', icon: FileText, path: '/certificates', roles: ['STUDENT', 'RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT', 'SUPER_ADMIN'] },
            ]
        },
        {
            category: 'Personal',
            items: [
                { name: 'My Profile', icon: UserCircle, path: '/profile', roles: ['STUDENT', 'PROFESSOR', 'RH', 'SUPER_ADMIN', 'RESPONSABLE_DEPARTMENT'] },
                { name: 'Settings', icon: Settings, path: '/settings', roles: ['STUDENT', 'PROFESSOR', 'RH', 'SUPER_ADMIN'] },
            ]
        }
    ];

    // Filter navigation items based on user role
    const getFilteredNavItems = () => {
        return navItems
            .map(category => ({
                ...category,
                items: category.items.filter(item => item.roles.includes(user?.role_name))
            }))
            .filter(category => category.items.length > 0);
    };

    const filteredNavItems = getFilteredNavItems();
    const userInitial = user?.first_name?.[0] || user?.email?.[0] || 'U';
    const roleName = user?.role_name?.replace(/_/g, ' ') || 'User';

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Backdrop for mobile */}
            {isMobile && isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed lg:relative bg-white border-r border-gray-200 transition-all duration-300 ease-in-out z-50 flex flex-col",
                    isSidebarOpen ? "w-64 translate-x-0" : "w-20 -translate-x-full lg:translate-x-0",
                    "lg:translate-x-0" // Always visible on desktop
                )}
                style={{
                    height: '100vh',
                    boxShadow: isSidebarOpen ? '2px 0 8px rgba(0, 0, 0, 0.05)' : 'none'
                }}
            >
                {/* User Profile Summary */}
                <div className={cn("p-4 border-b border-gray-100", !isSidebarOpen && "px-0")}>
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "bg-gradient-to-br from-gray-800 to-gray-600 rounded-full flex items-center justify-center text-white font-semibold",
                            isSidebarOpen ? "w-10 h-10 text-sm" : "w-8 h-8 text-xs mx-auto"
                        )}>
                            {userInitial}
                        </div>
                        {isSidebarOpen && (
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {user?.first_name || user?.email?.split('@')[0]}
                                </p>
                                <p className="text-xs text-gray-500 truncate">{roleName}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
                    {filteredNavItems.map((category, categoryIndex) => (
                        <div key={category.category} className={cn("space-y-1", categoryIndex > 0 && "pt-4")}>
                            {isSidebarOpen && category.items.length > 0 && (
                                <div className="px-3 mb-2">
                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        {category.category}
                                    </span>
                                </div>
                            )}
                            {category.items.map((item) => {
                                const isActive = location.pathname === item.path ||
                                    location.pathname.startsWith(item.path + '/');
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={cn(
                                            "group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                                            isActive
                                                ? "bg-gray-900 text-white"
                                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                                            !isSidebarOpen && "justify-center px-2"
                                        )}
                                        title={!isSidebarOpen ? item.name : undefined}
                                    >
                                        <item.icon size={18} className={cn(
                                            "flex-shrink-0",
                                            isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"
                                        )} />
                                        {isSidebarOpen && (
                                            <>
                                                <span className="text-sm font-medium flex-1">{item.name}</span>
                                                {isActive && (
                                                    <ChevronRight size={14} className="text-white opacity-70" />
                                                )}
                                            </>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-100 space-y-2">
                    {isSidebarOpen && (
                        <div className="px-3">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Account
                            </span>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        className={cn(
                            "group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200",
                            !isSidebarOpen && "justify-center px-2"
                        )}
                        title={!isSidebarOpen ? "Logout" : undefined}
                    >
                        <LogOut size={18} className="flex-shrink-0" />
                        {isSidebarOpen && <span className="text-sm font-medium">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50">
                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-20 flex-shrink-0">
                    <div className="flex items-center gap-4 flex-1">
                        {/* Mobile menu button */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <Menu size={20} />
                        </button>

                        {/* Open Nav Button for Desktop (when sidebar is collapsed) */}
                        {!isSidebarOpen && !isMobile && (
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="hidden lg:flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ChevronRight size={16} />
                                <span className="text-sm font-medium">Open Menu</span>
                            </button>
                        )}

                        {/* Page title */}
                        <div className="hidden md:block">
                            <h1 className="text-lg font-semibold text-gray-900">
                                {filteredNavItems.flatMap(c => c.items).find(item =>
                                    location.pathname === item.path ||
                                    location.pathname.startsWith(item.path + '/')
                                )?.name || 'Dashboard'}
                            </h1>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {roleName} • {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>

                        {/* Search - Desktop */}
                        <div className="relative flex-1 max-w-xl ml-auto hidden lg:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search across the platform..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all text-sm outline-none"
                            />
                        </div>
                    </div>

                    {/* Header Actions */}
                    <div className="flex items-center gap-3">
                        {/* Mobile search button */}
                        <button className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                            <Search size={20} />
                        </button>

                        {/* Notifications */}
                        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                        </button>

                        {/* Divider */}
                        <div className="h-6 w-px bg-gray-200" />

                        {/* User Profile */}
                        <div className="flex items-center gap-3 pl-1">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-medium text-gray-900 truncate max-w-[160px]">
                                    {user?.first_name || user?.email?.split('@')[0]}
                                </p>
                                <p className="text-xs text-gray-500 truncate">{roleName}</p>
                            </div>
                            <div className="w-9 h-9 bg-gradient-to-br from-gray-800 to-gray-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                {userInitial}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
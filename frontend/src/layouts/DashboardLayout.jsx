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
    CreditCard,
    FileText,
    BarChart3,
    Calendar,
    School,
    ChevronRight,
    ChevronLeft,
    FolderOpen,
    Mail,
    CheckSquare,
    CheckCircle2,
    Rocket,
    Percent,
    History
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../utils/cn';
import NotificationBell from '../components/NotificationBell';
import ChatWidget from '../components/ui/ChatWidget';

const DashboardLayout = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
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

    // Fetch unread message count
    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                const messageService = (await import('../api/services/messageService')).default;
                const count = await messageService.getUnreadCount();
                setUnreadCount(count);
            } catch (err) {
                console.error('Failed to fetch unread count:', err);
            }
        };

        fetchUnreadCount();

        // Poll every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
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
                { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['SUPER_ADMIN', 'RH', 'RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT', 'PROFESSOR', 'STUDENT', 'FINANCIER'] },
            ]
        },
        {
            category: 'Administration',
            items: [
                { name: 'System', icon: ShieldCheck, path: '/rh-management', roles: [], permissions: ['manage_system'] },
                { name: 'Human Resources', icon: Users, path: '/staff', roles: ['RH', 'SUPER_ADMIN'], permissions: ['manage_staff'] },
                { name: 'Departments', icon: Building2, path: '/departments', roles: ['RH'], permissions: ['manage_departments'] },
                { name: 'Students', icon: GraduationCap, path: '/students', roles: ['RESPONSABLE_DEPARTMENT', 'SECRETARY', 'DIRECTOR_DEPARTMENT'], permissions: ['manage_students', 'view_students'] },
                { name: 'Roles', icon: ShieldCheck, path: '/roles', roles: ['SUPER_ADMIN'], permissions: ['manage_roles'] },
                { name: 'Absences', icon: Calendar, path: '/absences', roles: ['RH'], permissions: ['manage_absences', 'view_absences'] },
                { name: 'Student Absences', icon: Calendar, path: '/student-absences', roles: ['RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT', 'RH'], permissions: ['manage_student_absences', 'view_student_absences'] },
                { name: 'Finance', icon: CreditCard, path: '/finance', roles: ['FINANCIER', 'SUPER_ADMIN'], permissions: ['manage_finance'] },
                { name: 'Payroll', icon: BarChart3, path: '/payroll', roles: ['FINANCIER', 'SUPER_ADMIN'], permissions: ['manage_finance'] },
                { name: 'Program Pricing', icon: Percent, path: '/program-pricing', roles: ['FINANCIER', 'SUPER_ADMIN'], permissions: ['manage_finance'] },
            ]
        },
        {
            category: 'Academic',
            items: [
                { name: 'Specialities', icon: BookOpen, path: '/specialities', roles: ['RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT'], permissions: ['manage_specialities', 'view_specialities'] },
                { name: 'Classes', icon: School, path: '/classes', roles: ['RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT'], permissions: ['manage_classes', 'view_classes'] },
                { name: 'Modules', icon: FileText, path: '/modules', roles: ['RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT'], permissions: ['manage_modules', 'view_modules'] },
                { name: 'Rooms', icon: Building2, path: '/rooms', roles: ['RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT'], permissions: ['manage_rooms', 'view_rooms'] },
                { name: 'Schedule', icon: Calendar, path: '/schedule', roles: ['PROFESSOR', 'STUDENT', 'RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT'], permissions: ['view_schedules', 'manage_schedules'] },
                { name: 'Course Materials', icon: FolderOpen, path: '/resources', roles: ['PROFESSOR', 'STUDENT'], permissions: ['upload_resources', 'view_resources'] },
                { name: 'Attendance Report', icon: BarChart3, path: '/attendance-report', roles: ['RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT'], permissions: ['view_reports'] },
                { name: 'Grades', icon: BarChart3, path: '/grades', roles: ['PROFESSOR', 'STUDENT', 'RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT'], permissions: ['manage_grades', 'view_grades'] },
                { name: 'Certificates', icon: FileText, path: '/certificates', roles: ['STUDENT', 'RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT'], permissions: ['manage_certificates', 'request_certificate'] },
                { name: 'Study History', icon: History, path: '/study-history', roles: ['STUDENT'], permissions: ['view_resources'] },
            ]
        },
        {
            category: 'Personal',
            items: [
                { name: 'Tasks', icon: CheckSquare, path: '/tasks', roles: ['STUDENT', 'PROFESSOR', 'RH', 'SUPER_ADMIN', 'RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT', 'SECRETARY', 'FINANCIER'] },
                { name: 'Messages', icon: Mail, path: '/messages', roles: ['STUDENT', 'PROFESSOR', 'RH', 'SUPER_ADMIN', 'RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT', 'SECRETARY', 'FINANCIER'] },
                { name: 'My Profile', icon: UserCircle, path: '/profile', roles: ['STUDENT', 'PROFESSOR', 'RH', 'SUPER_ADMIN', 'RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT', 'SECRETARY', 'FINANCIER'] },
                { name: 'Settings', icon: Settings, path: '/settings', roles: ['STUDENT', 'PROFESSOR', 'RH', 'SUPER_ADMIN', 'RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT', 'SECRETARY', 'FINANCIER'] },
            ]
        }
    ];

    // Filter navigation items based on user role and permissions
    const getFilteredNavItems = () => {
        return navItems
            .map(category => ({
                ...category,
                items: category.items.filter(item => {
                    // 1. Super Admin sees explicit role-based items OR everything? 
                    // Let's stick to standard logic: access if role matches OR permission matches

                    const userRole = user?.role_name;
                    const userPermissions = user?.permissions || [];

                    // Explicitly remove "Students" from sidebar for Financier (as requested)
                    if (item.name === 'Students' && userRole === 'FINANCIER') return false;

                    // Always allow if role matches AND item has no permissions defined
                    // BUT if item HAS permissions defined, we should check them to allow dynamic removal
                    // EXCEPT if user is SUPER_ADMIN, they usually override?
                    // Let's enforce permissions if defined.

                    if (item.permissions && item.permissions.length > 0) {
                        // Check if user has AT LEAST ONE of the required permissions
                        const hasPermission = item.permissions.some(p => userPermissions.includes(p));
                        if (hasPermission) return true;

                        // If user doesn't have permission, check if they are SUPER_ADMIN (fallback)
                        if (userRole === 'SUPER_ADMIN') return true;

                        // Otherwise, strictly hide if permissions are defined but missing?
                        // This allows "removing" a permission to hide the link.
                        // However, legacy roles (Student/Professor) might not have permissions populated in DB yet!
                        // My populate script only updated Admin roles.
                        // So for Student/Professor, we must fallback to Role check.

                        const legacyRoles = ['STUDENT', 'PROFESSOR'];
                        if (legacyRoles.includes(userRole)) {
                            return item.roles.includes(userRole);
                        }

                        return false;
                    }

                    // Fallback for items with no permissions defined (Overview, Personal)
                    return item.roles.includes(userRole);
                })
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
                                                {item.name === 'Messages' && unreadCount > 0 && (
                                                    <span className="px-2 py-0.5 text-xs font-semibold bg-red-500 text-white rounded-full">
                                                        {unreadCount > 99 ? '99+' : unreadCount}
                                                    </span>
                                                )}
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
                        <NotificationBell />

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
            <ChatWidget />
        </div>
    );
};

export default DashboardLayout;
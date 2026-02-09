import React from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    GraduationCap,
    BookOpen,
    TrendingUp,
    Calendar,
    ArrowRight,
    ShieldCheck,
    UserCircle,
    Building2,
    Briefcase,
    Clock,
    BarChart3,
    Bell,
    CheckCircle,
    AlertCircle,
    FileText,
    Activity
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Badge from '../components/ui/Badge';

const StatCard = ({ title, value, icon: Icon, trend, subtitle, delay }) => {
    const getTrendColor = () => {
        if (trend?.includes('+')) return 'text-green-600 bg-green-50 border-green-100';
        if (trend?.includes('-')) return 'text-red-600 bg-red-50 border-red-100';
        return 'text-gray-600 bg-gray-50 border-gray-100';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay }}
            className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="p-2.5 bg-gray-50 rounded-lg">
                    <Icon className="w-5 h-5 text-gray-600" />
                </div>
                {trend && (
                    <Badge className={`text-xs ${getTrendColor()}`}>
                        {trend}
                    </Badge>
                )}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
            <p className="text-sm font-medium text-gray-700">{title}</p>
            {subtitle && (
                <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
        </motion.div>
    );
};

const ActivityItem = ({ title, description, time, status, index }) => {
    const getStatusColor = () => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-700 border-green-200';
            case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'failed': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all group"
        >
            <div className="flex-shrink-0">
                <div className={`p-2 rounded-lg ${getStatusColor()}`}>
                    {status === 'completed' && <CheckCircle className="w-4 h-4" />}
                    {status === 'pending' && <Clock className="w-4 h-4" />}
                    {status === 'failed' && <AlertCircle className="w-4 h-4" />}
                </div>
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">{title}</h4>
                <p className="text-sm text-gray-500 mt-0.5 truncate">{description}</p>
            </div>
            <div className="flex-shrink-0">
                <span className="text-xs text-gray-400 whitespace-nowrap">{time}</span>
            </div>
        </motion.div>
    );
};

const DashboardOverview = () => {
    const { user } = useAuth();

    const getRoleContent = () => {
        const baseContent = {
            SUPER_ADMIN: {
                title: 'System Administration',
                subtitle: 'Monitor and manage institutional systems',
                stats: [
                    { title: 'Active Administrators', value: '12', icon: ShieldCheck, trend: '+2' },
                    { title: 'System Uptime', value: '99.9%', icon: TrendingUp, subtitle: 'Last 30 days' },
                    { title: 'Active Sessions', value: '42', icon: Activity, trend: '+5' },
                    { title: 'Pending Audits', value: '8', icon: FileText, trend: '-3' }
                ],
                activity: 'System Activity',
                activities: [
                    { title: 'Security audit completed', description: 'System security scan', time: '10:30 AM', status: 'completed' },
                    { title: 'Database backup', description: 'Scheduled backup completed', time: '09:15 AM', status: 'completed' },
                    { title: 'User role updated', description: 'Professor → Department Head', time: 'Yesterday', status: 'completed' },
                    { title: 'System maintenance', description: 'Planned for tonight', time: 'Scheduled', status: 'pending' }
                ]
            },
            RH: {
                title: 'Human Resources',
                subtitle: 'Manage staff, departments, and payroll',
                stats: [
                    { title: 'Total Staff', value: '84', icon: Users, trend: '+5' },
                    { title: 'Departments', value: '12', icon: Building2 },
                    { title: 'Pending Requests', value: '8', icon: Briefcase, trend: '-2' },
                    { title: 'Payroll Processed', value: '98%', icon: TrendingUp, subtitle: 'This month' }
                ],
                activity: 'Recent Staff Activity',
                activities: [
                    { title: 'New staff registered', description: 'Dr. Sarah Johnson', time: 'Today, 11:30', status: 'completed' },
                    { title: 'Department transfer', description: 'CS → Engineering', time: 'Today, 10:15', status: 'pending' },
                    { title: 'Contract renewal', description: '3 staff members', time: 'Yesterday', status: 'completed' },
                    { title: 'Training session', description: 'All new hires', time: 'Tomorrow', status: 'pending' }
                ]
            },
            RESPONSABLE_DEPARTMENT: {
                title: 'Department Overview',
                subtitle: 'Monitor academic programs and faculty',
                stats: [
                    { title: 'Total Students', value: '420', icon: GraduationCap, trend: '+15' },
                    { title: 'Faculty Members', value: '15', icon: Users },
                    { title: 'Active Courses', value: '24', icon: BookOpen },
                    { title: 'Avg. GPA', value: '14.5', icon: TrendingUp, subtitle: 'This semester' }
                ],
                activity: 'Department Updates',
                activities: [
                    { title: 'New course approved', description: 'Advanced Algorithms', time: 'Today, 09:45', status: 'completed' },
                    { title: 'Faculty meeting', description: 'Monthly review', time: 'Tomorrow', status: 'pending' },
                    { title: 'Research grant', description: 'Submitted for review', time: 'Yesterday', status: 'pending' },
                    { title: 'Student petitions', description: '5 pending review', time: 'This week', status: 'pending' }
                ]
            },
            PROFESSOR: {
                title: 'Academic Portal',
                subtitle: 'Manage courses and student progress',
                stats: [
                    { title: 'My Students', value: '120', icon: GraduationCap },
                    { title: 'Active Courses', value: '3', icon: BookOpen },
                    { title: 'Assignments Due', value: '5', icon: FileText, trend: '-2' },
                    { title: 'Avg. Grade', value: 'B+', icon: TrendingUp, subtitle: 'Current term' }
                ],
                activity: 'Course Updates',
                activities: [
                    { title: 'Assignment graded', description: 'Data Structures', time: 'Today, 14:20', status: 'completed' },
                    { title: 'Office hours', description: 'Scheduled for Friday', time: 'Upcoming', status: 'pending' },
                    { title: 'Course material', description: 'Updated slides', time: 'Yesterday', status: 'completed' },
                    { title: 'Student consultation', description: '3 requests', time: 'Pending', status: 'pending' }
                ]
            },
            STUDENT: {
                title: 'Student Dashboard',
                subtitle: 'Track your academic progress',
                stats: [
                    { title: 'Current GPA', value: '3.8', icon: TrendingUp },
                    { title: 'Credits Earned', value: '120/180', icon: GraduationCap, subtitle: '66% complete' },
                    { title: 'Active Courses', value: '5', icon: BookOpen },
                    { title: 'Assignments Due', value: '3', icon: FileText, trend: '+1' }
                ],
                activity: 'Academic Activity',
                activities: [
                    { title: 'Assignment submitted', description: 'Calculus III', time: 'Today, 11:45', status: 'completed' },
                    { title: 'Grade updated', description: 'Physics B+ → A-', time: 'Today, 10:30', status: 'completed' },
                    { title: 'Exam scheduled', description: 'Next week', time: 'Upcoming', status: 'pending' },
                    { title: 'Library book', description: 'Due tomorrow', time: 'Reminder', status: 'pending' }
                ]
            }
        };

        return baseContent[user?.role_name] || baseContent.STUDENT;
    };

    const content = getRoleContent();
    const roleName = user?.role_name?.replace(/_/g, ' ') || 'User';
    const userName = user?.first_name || user?.email?.split('@')[0] || user?.email;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{content.title}</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Welcome back, <span className="font-medium text-gray-700">{userName}</span>. {content.subtitle}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-gray-600">
                        {roleName}
                    </Badge>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <Bell className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {content.stats.map((stat, index) => (
                    <StatCard
                        key={stat.title}
                        {...stat}
                        delay={index * 0.05}
                    />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">{content.activity}</h2>
                                <p className="text-sm text-gray-500 mt-1">Latest updates and notifications</p>
                            </div>
                            <button className="text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-1">
                                View all
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            {content.activities.map((activity, index) => (
                                <ActivityItem key={index} {...activity} index={index} />
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button className="bg-white/10 hover:bg-white/20 text-white p-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                                <BarChart3 className="w-4 h-4" />
                                Generate Report
                            </button>
                            <button className="bg-white/10 hover:bg-white/20 text-white p-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                                <FileText className="w-4 h-4" />
                                View Documents
                            </button>
                        </div>
                    </div>
                </div>

                {/* Calendar & Upcoming */}
                <div className="space-y-6">
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-gray-500" />
                            Upcoming Events
                        </h2>
                        <div className="space-y-4">
                            {[
                                { title: 'Faculty Meeting', date: 'Feb 15', time: '09:30 AM', location: 'Conference Room A' },
                                { title: 'System Maintenance', date: 'Feb 16', time: '10:00 PM', location: 'All Systems' },
                                { title: 'Student Orientation', date: 'Feb 18', time: '02:00 PM', location: 'Main Hall' },
                            ].map((event, index) => (
                                <div key={index} className="flex gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex flex-col items-center justify-center">
                                            <span className="text-xs font-medium text-gray-500">FEB</span>
                                            <span className="text-lg font-bold text-gray-900">{event.date.split(' ')[1]}</span>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900">{event.title}</h4>
                                        <p className="text-sm text-gray-500 mt-1">{event.time} • {event.location}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                            View Full Calendar
                        </button>
                    </div>

                    {/* System Status */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">All Systems</span>
                                <Badge className="bg-green-100 text-green-700 border-green-200">Operational</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Database</span>
                                <Badge className="bg-green-100 text-green-700 border-green-200">Normal</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">API Services</span>
                                <Badge className="bg-green-100 text-green-700 border-green-200">Stable</Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
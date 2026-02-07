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
    Briefcase
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const StatCard = ({ title, value, icon: Icon, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
        className="glass-card p-6 rounded-2xl flex items-center gap-6"
    >
        <div className={`p-4 rounded-xl ${color} bg-opacity-10 shadow-inner`}>
            <Icon className={`w-8 h-8 ${color.replace('bg-', 'text-')}`} />
        </div>
        <div>
            <p className="text-sm font-semibold text-slate-500">{title}</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
        </div>
    </motion.div>
);

const DashboardOverview = () => {
    const { user } = useAuth();

    // Role-specific stats and content mapping
    const getRoleContent = () => {
        switch (user?.role_name) {
            case 'SUPER_ADMIN':
                return {
                    title: 'System Administration',
                    stats: [
                        { title: 'Total RH Users', value: '12', icon: ShieldCheck, color: 'bg-primary-600' },
                        { title: 'System Uptime', value: '99.9%', icon: TrendingUp, color: 'bg-emerald-600' },
                        { title: 'Pending Logs', value: '42', icon: Briefcase, color: 'bg-orange-600' },
                        { title: 'Database Size', value: '1.2 GB', icon: BookOpen, color: 'bg-blue-600' }
                    ],
                    activity: 'Recent System Audits'
                };
            case 'RH':
                return {
                    title: 'Human Resources Dashboard',
                    stats: [
                        { title: 'Total Staff', value: '84', icon: Users, color: 'bg-purple-600' },
                        { title: 'Departments', value: '12', icon: Building2, color: 'bg-blue-600' },
                        { title: 'New Hires', value: '5', icon: UserCircle, color: 'bg-emerald-600' },
                        { title: 'Payroll Status', value: '98%', icon: TrendingUp, color: 'bg-primary-600' }
                    ],
                    activity: 'Recent Staff Registrations'
                };
            case 'RESPONSABLE_DEPARTMENT':
                return {
                    title: 'Department Overview',
                    stats: [
                        { title: 'Dept Students', value: '420', icon: GraduationCap, color: 'bg-blue-600' },
                        { title: 'Specialities', value: '4', icon: BookOpen, color: 'bg-orange-600' },
                        { title: 'Avg. Grade', value: '14.5', icon: TrendingUp, color: 'bg-emerald-600' },
                        { title: 'Faculty', value: '15', icon: Users, color: 'bg-purple-600' }
                    ],
                    activity: 'Departmental Requests'
                };
            case 'PROFESSOR':
                return {
                    title: 'Academic Portal',
                    stats: [
                        { title: 'My Students', value: '120', icon: GraduationCap, color: 'bg-blue-600' },
                        { title: 'Courses', value: '3', icon: BookOpen, color: 'bg-orange-600' },
                        { title: 'Pending Grades', value: '85', icon: TrendingUp, color: 'bg-primary-600' },
                        { title: 'Messages', value: '12', icon: UserCircle, color: 'bg-purple-600' }
                    ],
                    activity: 'Recent Student Submissions'
                };
            case 'STUDENT':
                return {
                    title: 'Student Dashboard',
                    stats: [
                        { title: 'GPA', value: '3.8', icon: TrendingUp, color: 'bg-emerald-600' },
                        { title: 'Credits', value: '120/180', icon: BookOpen, color: 'bg-blue-600' },
                        { title: 'Rank', value: '#12', icon: GraduationCap, color: 'bg-primary-600' },
                        { title: 'Attendance', value: '94%', icon: Calendar, color: 'bg-purple-600' }
                    ],
                    activity: 'Academic Progress'
                };
            default:
                return null;
        }
    };

    const content = getRoleContent();

    if (!content) return null;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">{content.title}</h1>
                    <p className="text-slate-500 mt-2 font-medium">
                        Welcome back, <span className="text-primary-600 font-bold">{user?.email}</span>. Here's your personalized overview.
                    </p>
                </div>
                <div className="px-4 py-2 bg-white rounded-2xl shadow-sm border border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Role: <span className="text-primary-600 ml-1">{user?.role_name?.replace('_', ' ')}</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {content.stats.map((stat, index) => (
                    <StatCard
                        key={stat.title}
                        title={stat.title}
                        value={stat.value}
                        icon={stat.icon}
                        color={stat.color}
                        delay={0.1 * (index + 1)}
                    />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2 glass-card rounded-3xl overflow-hidden p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-slate-900">{content.activity}</h2>
                        <button className="text-primary-600 text-sm font-black uppercase tracking-wider flex items-center gap-2 hover:gap-3 transition-all">
                            View Deep Report <ArrowRight size={16} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center gap-5 p-5 rounded-[1.25rem] bg-slate-50 border border-slate-100 hover:border-primary-100 hover:bg-white hover:shadow-xl hover:shadow-primary-600/5 transition-all cursor-pointer group">
                                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-lg font-black text-slate-400 group-hover:bg-primary-600 group-hover:text-white group-hover:border-primary-600 transition-all">
                                    {i}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-900">Process Transaction #{1024 + i}</h4>
                                    <p className="text-sm text-slate-500 font-medium">Automatic system verification triggered at 10:45 AM</p>
                                </div>
                                <div className="hidden sm:block text-right">
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Completed</span>
                                    <div className="mt-1 h-1.5 w-16 bg-emerald-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 w-full" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upcoming Events */}
                <div className="glass-card rounded-3xl p-8 border-primary-100 border-2">
                    <h2 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                        <Calendar className="text-primary-600" size={26} />
                        Calendar
                    </h2>
                    <div className="space-y-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex gap-5 group cursor-pointer">
                                <div className="flex flex-col items-center justify-center w-14 h-14 bg-primary-50 rounded-2xl flex-shrink-0 group-hover:bg-primary-600 group-hover:text-white transition-all">
                                    <span className="text-[10px] font-black uppercase tracking-tighter opacity-60">Feb</span>
                                    <span className="text-xl font-black leading-none">1{i}</span>
                                </div>
                                <div className="flex-1 border-b border-dashed border-slate-100 pb-5 group-last:border-none">
                                    <h4 className="font-bold text-slate-800 leading-tight">Institutional Briefing</h4>
                                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Main Hall • 09:30 AM</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-10 py-4 bg-slate-900 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-primary-600 shadow-xl shadow-slate-900/10 transition-all">
                        Full Schedule
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;

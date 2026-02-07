import React from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    GraduationCap,
    BookOpen,
    TrendingUp,
    Calendar,
    ArrowRight
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

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
    const { user } = useAuthStore();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>
                <p className="text-slate-500 mt-2">Welcome back, {user?.email}! Here's what's happening today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Students"
                    value="1,284"
                    icon={GraduationCap}
                    color="bg-blue-600"
                    delay={0.1}
                />
                <StatCard
                    title="Total Faculty"
                    value="84"
                    icon={Users}
                    color="bg-purple-600"
                    delay={0.2}
                />
                <StatCard
                    title="Departments"
                    value="12"
                    icon={BookOpen}
                    color="bg-orange-600"
                    delay={0.3}
                />
                <StatCard
                    title="Performance"
                    value="+12.5%"
                    icon={TrendingUp}
                    color="bg-emerald-600"
                    delay={0.4}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2 glass-card rounded-2xl overflow-hidden p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-slate-900">Recent Applications</h2>
                        <button className="text-primary-600 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                            View All <ArrowRight size={16} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-primary-100 transition-colors cursor-pointer group">
                                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-lg font-bold text-slate-600 group-hover:bg-primary-100 group-hover:text-primary-700 transition-colors">
                                    JD
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-900 uppercase">Jane Doe</h4>
                                    <p className="text-sm text-slate-500">Applied for Computer Science Speciality</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-bold text-slate-400">2 hours ago</span>
                                    <div className="mt-1 px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
                                        Processing
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upcoming Events */}
                <div className="glass-card rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Calendar className="text-primary-600" size={24} />
                        Upcoming Events
                    </h2>
                    <div className="space-y-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex gap-4">
                                <div className="flex flex-col items-center justify-center w-14 h-14 bg-primary-50 rounded-xl flex-shrink-0">
                                    <span className="text-xs font-bold text-primary-600 uppercase">Feb</span>
                                    <span className="text-lg font-black text-primary-700 leading-none">1{i}</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 leading-tight">Faculty Meeting Q1</h4>
                                    <p className="text-sm text-slate-500 mt-1">10:00 AM - Boardroom</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-8 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                        See School Calendar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;

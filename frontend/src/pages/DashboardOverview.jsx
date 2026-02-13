import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Users,
    GraduationCap,
    BookOpen,
    TrendingUp,
    Calendar,
    ArrowRight,
    ShieldCheck,
    Building2,
    Briefcase,
    Clock,
    BarChart3,
    Bell,
    CheckCircle,
    AlertCircle,
    FileText,
    Activity,
    CheckSquare
} from 'lucide-react';
import taskService from '../api/services/taskService';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import Badge from '../components/ui/Badge';
import studentService from '../api/services/studentService';
import moduleService from '../api/services/moduleService';
import scheduleService from '../api/services/scheduleService';
import studentAttendanceService from '../api/services/studentAttendanceService';
import gradeService from '../api/services/gradeService';
import dashboardService from '../api/services/dashboardService';

const COLORS = ['#1a1a1a', '#404040', '#737373', '#a3a3a3', '#d4d4d4'];

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
    const [loading, setLoading] = useState(false);

    // Stats states
    const [adminStats, setAdminStats] = useState({
        counts: { students_count: 0, staff_count: 0, departments_count: 0, roles_count: 0 },
        studentDistribution: [],
        roleDistribution: [],
        absenceTrends: []
    });

    const [profStats, setProfStats] = useState({
        studentsCount: 0,
        modulesCount: 0,
        upcomingClasses: []
    });

    const [studentStats, setStudentStats] = useState({
        gpa: '0.0',
        credits: '0/180',
        activeCourses: 0,
        absences: 0,
        upcomingClasses: []
    });

    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        if (user?.role_name === 'SUPER_ADMIN') fetchAdminStats();
        if (user?.role_name === 'PROFESSOR' && user?.employee_id) fetchProfessorStats();
        if (user?.role_name === 'STUDENT' && user?.student_id) fetchStudentStats();
        fetchTasks();
    }, [user]);

    const fetchTasks = async () => {
        try {
            const data = await taskService.getTasks({ status: 'TODO', limit: 3 });
            setTasks(data.slice(0, 3));
        } catch (err) {
            console.error('Failed to fetch tasks:', err);
        }
    };

    const fetchAdminStats = async () => {
        try {
            setLoading(true);
            const data = await dashboardService.getAdminStats();
            setAdminStats(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchProfessorStats = async () => {
        try {
            setLoading(true);
            const [allStudents, allModules, schedule] = await Promise.all([
                studentService.getAll(),
                moduleService.getAll(),
                scheduleService.getByProfessor(user.employee_id)
            ]);
            const myModules = (allModules || []).filter(m =>
                (m.assignments || []).some(a => a.professor_id === user.employee_id)
            );
            const myClassIds = myModules.flatMap(m => (m.assignments || []).filter(a => a.professor_id === user.employee_id).map(a => a.class_id));
            const uniqueClassIds = [...new Set(myClassIds)];
            const myStudentsCount = (allStudents || []).filter(s => uniqueClassIds.includes(s.class_id)).length;

            const upcoming = (schedule || []).slice(0, 3).map(s => ({
                title: s.module_name,
                date: s.day_of_week,
                time: s.slot_type === 'MORNING' ? '08:30' : '14:30',
                location: s.room || 'TBD'
            }));

            setProfStats({ studentsCount: myStudentsCount, modulesCount: myModules.length, upcomingClasses: upcoming });
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const fetchStudentStats = async () => {
        try {
            setLoading(true);
            const [grades, attendance, schedule] = await Promise.all([
                gradeService.getMyGrades(),
                studentAttendanceService.getStudentAttendance(user.student_id),
                scheduleService.getByClass(user.class_id)
            ]);
            const validGrades = (grades.data || []).filter(g => g.cc1 !== null);
            const avg = validGrades.length > 0 ? (validGrades.reduce((acc, g) => acc + ((g.cc1 + g.cc2) / 2) * 0.4 + g.exam * 0.6, 0) / validGrades.length).toFixed(2) : '0.0';

            setStudentStats({
                gpa: avg,
                credits: `${validGrades.length * 6}/180`,
                activeCourses: validGrades.length,
                absences: (attendance.data || []).filter(a => a.status === 'ABSENT').length,
                upcomingClasses: (schedule || []).slice(0, 3).map(s => ({ title: s.module_name, date: s.day_of_week, time: s.slot_type === 'MORNING' ? '08:30' : '14:30', location: s.room }))
            });
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const getRoleContent = () => {
        const base = {
            SUPER_ADMIN: {
                title: 'System Intelligence',
                subtitle: 'High-level institutional performance data',
                stats: [
                    { title: 'Total Students', value: adminStats.counts.students_count.toString(), icon: GraduationCap },
                    { title: 'Academic Staff', value: adminStats.counts.staff_count.toString(), icon: Users },
                    { title: 'Departments', value: adminStats.counts.departments_count.toString(), icon: Building2 },
                    { title: 'System Roles', value: adminStats.counts.roles_count.toString(), icon: ShieldCheck }
                ],
                activities: [
                    { title: 'Security Audit', description: 'System scan complete', time: '10:00 AM', status: 'completed' },
                    { title: 'Data Backup', description: 'Institutional cloud sync', time: '04:00 AM', status: 'completed' }
                ]
            },
            RH: {
                title: 'Staff Management',
                subtitle: 'Manage university employees and logistics',
                stats: [
                    { title: 'Total Staff', value: '84', icon: Users, trend: '+2' },
                    { title: 'Active Depts', value: '12', icon: Building2 },
                    { title: 'Pending File', value: '5', icon: FileText },
                    { title: 'Requests', value: '3', icon: Bell }
                ],
                activities: [
                    { title: 'New Hire', description: 'Dr. Sarah Smith joined', time: 'Today', status: 'completed' }
                ]
            },
            PROFESSOR: {
                title: 'Faculty Portal',
                subtitle: 'Academic management and course planning',
                stats: [
                    { title: 'My Students', value: profStats.studentsCount.toString(), icon: GraduationCap },
                    { title: 'Modules', value: profStats.modulesCount.toString(), icon: BookOpen },
                    { title: 'Weekly Hours', value: (profStats.modulesCount * 3.5).toString() + 'h', icon: Clock },
                    { title: 'Engagement', value: '94%', icon: TrendingUp }
                ],
                activities: [
                    { title: 'Marks Uploaded', description: 'Module: Advanced CS', time: 'Yesterday', status: 'completed' }
                ]
            },
            STUDENT: {
                title: 'My Progress',
                subtitle: 'Track your personal academic records',
                stats: [
                    { title: 'Current GPA', value: studentStats.gpa, icon: TrendingUp },
                    { title: 'Credits', value: studentStats.credits, icon: GraduationCap },
                    { title: 'Absences', value: studentStats.absences.toString(), icon: Clock },
                    { title: 'Courses', value: studentStats.activeCourses.toString(), icon: BookOpen }
                ],
                activities: [
                    { title: 'Grade Released', description: 'Web Development', time: 'Today', status: 'completed' }
                ]
            }
        };
        return base[user?.role_name] || base.STUDENT;
    };

    const content = getRoleContent();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{content.title}</h1>
                <p className="text-sm text-gray-500 mt-1">Welcome, {user?.first_name || 'User'}. {content.subtitle}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {content.stats.map((stat, i) => (
                    <StatCard key={i} {...stat} delay={i * 0.05} />
                ))}
            </div>

            {/* Charts for Super Admin */}
            {user?.role_name === 'SUPER_ADMIN' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-xl p-6 h-[400px] min-w-0">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-6">Student Distribution by Department</h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={adminStats.studentDistribution}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%" cy="50%"
                                        outerRadius={80}
                                        label
                                    >
                                        {adminStats.studentDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-6 h-[400px] min-w-0">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-6">Absence Trends (7 Days)</h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={adminStats.absenceTrends}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                    <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Bar dataKey="absent_count" name="Absences" fill="#1a1a1a" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">My Tasks</h3>
                            <Link to="/tasks" className="text-sm font-medium text-gray-400 hover:text-gray-900 flex items-center gap-1 transition-colors">
                                View all <ArrowRight size={14} />
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {tasks.length > 0 ? tasks.map((task, i) => (
                                <div key={i} className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-all group">
                                    <div className="p-2 bg-gray-50 rounded-lg text-gray-400 group-hover:bg-gray-900 group-hover:text-white transition-all">
                                        <CheckSquare size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{task.title}</p>
                                        <p className="text-xs text-gray-500 truncate">{task.category} • Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}</p>
                                    </div>
                                    <Badge variant="outline" className="text-[10px] h-5">{task.priority}</Badge>
                                </div>
                            )) : (
                                <p className="text-sm text-gray-500 text-center py-4">No pending tasks. You're all caught up!</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
                        <div className="space-y-3">
                            {content.activities.map((a, i) => (
                                <ActivityItem key={i} {...a} index={i} />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-gray-900 rounded-xl p-6 text-white flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Quick Access</h3>
                        <p className="text-sm text-gray-400 mb-6">Common system tools and generation utilities.</p>
                        <div className="space-y-3">
                            <button className="w-full bg-white/10 hover:bg-white/20 p-3 rounded-lg text-sm flex items-center gap-3 transition-colors">
                                <FileText size={16} /> Reports Generator
                            </button>
                            <button className="w-full bg-white/10 hover:bg-white/20 p-3 rounded-lg text-sm flex items-center gap-3 transition-colors">
                                <Activity size={16} /> System Health
                            </button>
                        </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-gray-500 font-medium">
                        <span>UPF Cloud Node 01</span>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-green-500 ring-4 ring-green-500/20" />
                            Stable
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
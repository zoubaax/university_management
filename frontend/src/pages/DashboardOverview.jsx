import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Users, GraduationCap, BookOpen, TrendingUp, Calendar,
    ArrowRight, ShieldCheck, Building2, Clock, Bell,
    CheckCircle, AlertCircle, FileText, Activity, CheckSquare,
    Zap, Award, BarChart2, PieChart as PieIcon, Loader2,
    MoreVertical, ChevronRight, Mail, MessageSquare, Briefcase,
    DollarSign, Percent, Target, Eye, EyeOff
} from 'lucide-react';
import taskService from '../api/services/taskService';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, AreaChart, Area, LineChart, Line
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import studentService from '../api/services/studentService';
import moduleService from '../api/services/moduleService';
import scheduleService from '../api/services/scheduleService';
import studentAttendanceService from '../api/services/studentAttendanceService';
import gradeService from '../api/services/gradeService';
import dashboardService from '../api/services/dashboardService';
import messageService from '../api/services/messageService';
import financeService from '../api/services/financeService';

const COLORS = ['#6366f1', '#3b82f6', '#0ea5e9', '#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b'];
const ATTENDANCE_COLORS = ['#10b981', '#ef4444', '#f59e0b'];

/* ─── Stat Card ─── */
const StatCard = ({ title, value, icon: Icon, trend, color = 'indigo', delay = 0 }) => {
    const colors = {
        indigo: 'bg-indigo-50 text-indigo-600',
        blue: 'bg-blue-50 text-blue-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        amber: 'bg-amber-50 text-amber-600',
        purple: 'bg-purple-50 text-purple-600',
        rose: 'bg-rose-50 text-rose-600',
    };
    const trendPositive = trend?.includes('+');

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all group"
        >
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${colors[color] || colors.indigo}`}>
                    <Icon size={20} />
                </div>
                {trend && (
                    <Badge className={`text-xs ${trendPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {trend}
                    </Badge>
                )}
            </div>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{title}</p>
        </motion.div>
    );
};

/* ─── Chart Card wrapper ─── */
const ChartCard = ({ title, subtitle, children, delay = 0, className = '' }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className={`bg-white border border-gray-200 rounded-xl p-5 ${className}`}
    >
        <div className="mb-4">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {children}
    </motion.div>
);

/* ─── Custom Tooltip ─── */
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-gray-200 shadow-lg rounded-lg px-3 py-2 text-sm">
            <p className="font-medium text-gray-600 mb-1">{label}</p>
            {payload.map((p, i) => (
                <p key={i} className="text-sm" style={{ color: p.color || p.fill }}>
                    {p.name}: <span className="font-semibold text-gray-900">{p.value}</span>
                </p>
            ))}
        </div>
    );
};

/* ─── Activity Item ─── */
const ActivityItem = ({ title, description, time, status, index }) => {
    const cfg = {
        completed: { cls: 'bg-green-50 text-green-600', icon: <CheckCircle size={14} /> },
        pending: { cls: 'bg-amber-50 text-amber-600', icon: <Clock size={14} /> },
        failed: { cls: 'bg-red-50 text-red-600', icon: <AlertCircle size={14} /> },
    };
    const { cls, icon } = cfg[status] || cfg.pending;
    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.06 }}
            className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
            <div className={`p-1.5 rounded-lg ${cls}`}>{icon}</div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
                <p className="text-xs text-gray-500 truncate">{description}</p>
            </div>
            <span className="text-xs text-gray-400 whitespace-nowrap">{time}</span>
        </motion.div>
    );
};

/* ═══════════════════ MAIN COMPONENT ═══════════════════ */
const DashboardOverview = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [activeWidget, setActiveWidget] = useState('all');

    const [adminStats, setAdminStats] = useState({
        counts: { students_count: 0, staff_count: 0, departments_count: 0, roles_count: 0 },
        studentDistribution: [],
        roleDistribution: [],
        absenceTrends: [],
        enrollmentTrends: [],
        financeSummary: []
    });

    const [profStats, setProfStats] = useState({
        studentsCount: 0,
        modulesCount: 0,
        upcomingClasses: [],
        schedulePerDay: [],
        classAssignments: []
    });

    const [studentStats, setStudentStats] = useState({
        gpa: '0.0',
        credits: '0/180',
        activeCourses: 0,
        absences: 0,
        presentCount: 0,
        upcomingClasses: [],
        gradesData: [],
        attendanceData: []
    });

    const [tasks, setTasks] = useState([]);
    const [messages, setMessages] = useState([]);
    const [showWelcome, setShowWelcome] = useState(true);

    const [financeStats, setFinanceStats] = useState({
        totals: { total_expected: 0, total_collected: 0, total_outstanding: 0, fully_paid_count: 0, with_debt_count: 0, total_students: 0 },
        monthlyRevenue: [],
        methodBreakdown: [],
        debtByDept: [],
        recentPayments: [],
        pendingVerifications: 0
    });

    useEffect(() => {
        if (user?.role_name === 'SUPER_ADMIN') fetchAdminStats();
        if (user?.role_name === 'PROFESSOR' && user?.employee_id) fetchProfessorStats();
        if (user?.role_name === 'STUDENT' && user?.student_id) fetchStudentStats();
        if (user?.role_name === 'FINANCIER') fetchFinanceStats();
        fetchTasks();
        fetchLatestMessages();
    }, [user]);

    const fetchTasks = async () => {
        try {
            const data = await taskService.getTasks({ status: 'TODO', limit: 4 });
            setTasks((data || []).slice(0, 4));
        } catch (err) { console.error('Failed to fetch tasks:', err); }
    };

    const fetchLatestMessages = async () => {
        try {
            const data = await messageService.getInbox();
            setMessages((data || []).slice(0, 4));
        } catch (err) { console.error('Failed to fetch messages:', err); }
    };

    const fetchAdminStats = async () => {
        try {
            setLoading(true);
            const data = await dashboardService.getAdminStats();
            setAdminStats({
                counts: data.counts || { students_count: 0, staff_count: 0, departments_count: 0, roles_count: 0 },
                studentDistribution: data.studentDistribution || [],
                roleDistribution: data.roleDistribution || [],
                absenceTrends: data.absenceTrends || [],
                enrollmentTrends: data.enrollmentTrends || [],
                financeSummary: data.financeSummary || []
            });
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const fetchFinanceStats = async () => {
        try {
            setLoading(true);
            const data = await financeService.getDashboardStats();
            setFinanceStats({
                totals: data.totals || {},
                monthlyRevenue: (data.monthlyRevenue || []).map(m => ({
                    month: m.month,
                    revenue: parseFloat(m.revenue) || 0,
                    payment_count: parseInt(m.payment_count) || 0
                })),
                methodBreakdown: (data.methodBreakdown || []).map(m => ({
                    name: m.name,
                    value: parseInt(m.count) || 0,
                    total: parseFloat(m.total) || 0
                })),
                debtByDept: (data.debtByDept || []).map(d => ({
                    department: d.department.length > 14 ? d.department.substring(0, 13) + '…' : d.department,
                    outstanding: parseFloat(d.outstanding) || 0,
                    collected: parseFloat(d.collected) || 0
                })),
                recentPayments: data.recentPayments || [],
                pendingVerifications: data.pendingVerifications || 0
            });
        } catch (err) { console.error('Finance stats error:', err); }
        finally { setLoading(false); }
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
            const myClassIds = myModules.flatMap(m =>
                (m.assignments || []).filter(a => a.professor_id === user.employee_id).map(a => a.class_id)
            );
            const uniqueClassIds = [...new Set(myClassIds)];
            const myStudentsCount = (allStudents || []).filter(s => uniqueClassIds.includes(s.class_id)).length;

            const upcoming = (schedule || []).slice(0, 3).map(s => ({
                title: s.module_name,
                date: s.day_of_week,
                time: s.slot_type === 'MORNING' ? '08:30' : '14:30',
                location: s.room || 'TBD'
            }));

            const schedulePerDay = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => {
                const fullDay = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][i];
                return { day, classes: (schedule || []).filter(s => s.day_of_week === fullDay).length };
            });

            const classAssignments = myModules.slice(0, 6).map(m => ({
                name: m.name.length > 16 ? m.name.substring(0, 14) + '…' : m.name,
                students: (allStudents || []).filter(s => m.assignments?.some(a => a.class_id === s.class_id)).length
            }));

            setProfStats({ studentsCount: myStudentsCount, modulesCount: myModules.length, upcomingClasses: upcoming, schedulePerDay, classAssignments });
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
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
            const toNum = v => parseFloat(v) || 0;
            const avg = validGrades.length > 0
                ? (validGrades.reduce((acc, g) => acc + ((toNum(g.cc1) + toNum(g.cc2)) / 2) * 0.4 + toNum(g.exam) * 0.6, 0) / validGrades.length).toFixed(2)
                : '0.0';

            const gradesData = validGrades.map(g => ({
                subject: (g.module_name || 'Module').substring(0, 12),
                CC: Number(((toNum(g.cc1) + toNum(g.cc2)) / 2).toFixed(1)),
                Exam: Number(toNum(g.exam).toFixed(1)),
                Final: Number((((toNum(g.cc1) + toNum(g.cc2)) / 2) * 0.4 + toNum(g.exam) * 0.6).toFixed(1))
            }));

            const presentCount = (attendance.data || []).filter(a => a.status === 'PRESENT').length;
            const absentCount = (attendance.data || []).filter(a => a.status === 'ABSENT').length;
            const lateCount = (attendance.data || []).filter(a => a.status === 'LATE').length;
            const attendanceData = [
                { name: 'Present', value: presentCount },
                { name: 'Absent', value: absentCount },
                { name: 'Late', value: lateCount }
            ].filter(d => d.value > 0);

            if (attendanceData.length === 0) attendanceData.push({ name: 'No Data', value: 1 });

            setStudentStats({
                gpa: avg,
                credits: `${validGrades.length * 6}/180`,
                activeCourses: validGrades.length,
                absences: absentCount,
                presentCount,
                upcomingClasses: (schedule || []).slice(0, 3).map(s => ({
                    title: s.module_name, date: s.day_of_week,
                    time: s.slot_type === 'MORNING' ? '08:30' : '14:30', location: s.room
                })),
                gradesData,
                attendanceData
            });
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    /* ── Role metadata ── */
    const roleMeta = {
        SUPER_ADMIN: {
            label: 'Super Admin',
            title: 'Institution Overview',
            subtitle: 'Real-time analytics across all departments',
            stats: [
                { title: 'Total Students', value: adminStats.counts.students_count?.toString() || '0', icon: GraduationCap, color: 'indigo' },
                { title: 'Academic Staff', value: adminStats.counts.staff_count?.toString() || '0', icon: Users, color: 'blue' },
                { title: 'Departments', value: adminStats.counts.departments_count?.toString() || '0', icon: Building2, color: 'emerald' },
                { title: 'System Roles', value: adminStats.counts.roles_count?.toString() || '0', icon: ShieldCheck, color: 'purple' }
            ],
            activities: [
                { title: 'Security Audit', description: 'System scan completed', time: '10:00 AM', status: 'completed' },
                { title: 'Data Backup', description: 'Cloud sync successful', time: '04:00 AM', status: 'completed' }
            ]
        },
        PROFESSOR: {
            label: 'Professor',
            title: 'Teaching Dashboard',
            subtitle: 'Your classes, students, and schedule',
            stats: [
                { title: 'My Students', value: profStats.studentsCount.toString(), icon: GraduationCap, color: 'indigo' },
                { title: 'My Modules', value: profStats.modulesCount.toString(), icon: BookOpen, color: 'blue' },
                { title: 'Weekly Hours', value: (profStats.modulesCount * 3.5).toFixed(0) + 'h', icon: Clock, color: 'emerald' },
                { title: 'Engagement Rate', value: '94%', icon: TrendingUp, color: 'purple' }
            ],
            activities: [
                { title: 'Grades Uploaded', description: 'Web Development', time: 'Yesterday', status: 'completed' }
            ]
        },
        STUDENT: {
            label: 'Student',
            title: 'My Academic Progress',
            subtitle: 'Track your grades, attendance, and schedule',
            stats: [
                { title: 'Overall GPA', value: studentStats.gpa, icon: Award, color: 'indigo' },
                { title: 'Credits Earned', value: studentStats.credits, icon: GraduationCap, color: 'blue' },
                { title: 'Present Days', value: studentStats.presentCount.toString(), icon: CheckCircle, color: 'emerald' },
                { title: 'Absences', value: studentStats.absences.toString(), icon: AlertCircle, color: 'rose' }
            ],
            activities: [
                { title: 'Grade Released', description: 'Database Systems', time: 'Today', status: 'completed' }
            ]
        },
        RH: {
            label: 'HR Manager',
            title: 'Human Resources',
            subtitle: 'Manage staff, departments, and requests',
            stats: [
                { title: 'Total Staff', value: '84', icon: Users, color: 'indigo', trend: '+2' },
                { title: 'Departments', value: '12', icon: Building2, color: 'blue' },
                { title: 'Pending Files', value: '5', icon: FileText, color: 'amber' },
                { title: 'Open Requests', value: '3', icon: Bell, color: 'rose' }
            ],
            activities: [
                { title: 'New Hire', description: 'Dr. Sarah Smith joined', time: 'Today', status: 'completed' }
            ]
        },
        FINANCIER: {
            label: 'Finance',
            title: 'Financial Overview',
            subtitle: 'Monitor revenue, payments, and outstanding balances',
            stats: [
                { title: 'Total Expected', value: `${(parseFloat(financeStats.totals.total_expected) || 0).toLocaleString()} DA`, icon: TrendingUp, color: 'indigo' },
                { title: 'Collected', value: `${(parseFloat(financeStats.totals.total_collected) || 0).toLocaleString()} DA`, icon: CheckCircle, color: 'emerald' },
                { title: 'Outstanding', value: `${(parseFloat(financeStats.totals.total_outstanding) || 0).toLocaleString()} DA`, icon: AlertCircle, color: 'rose' },
                { title: 'Pending Verification', value: financeStats.pendingVerifications.toString(), icon: Clock, color: 'amber' }
            ],
            activities: [
                { title: 'Payment Recorded', description: 'Student tuition fee', time: 'Today', status: 'completed' },
                { title: 'Check Pending', description: 'Awaiting verification', time: '2h ago', status: 'pending' }
            ]
        }
    };

    const meta = roleMeta[user?.role_name] || roleMeta.STUDENT;

    if (loading) {
        return (
            <div className="h-96 flex flex-col items-center justify-center bg-white rounded-xl border border-gray-200">
                <Loader2 className="w-8 h-8 text-gray-600 animate-spin mb-3" />
                <p className="text-sm text-gray-500">Loading your dashboard...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* Welcome Banner */}
            {showWelcome && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-gray-900 text-white rounded-xl p-5 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -ml-20 -mb-20" />
                    
                    <div className="flex items-start justify-between relative z-10">
                        <div>
                            <h2 className="text-xl font-semibold mb-1">
                                Welcome back, {user?.first_name || 'User'}!
                            </h2>
                            <p className="text-gray-300 text-sm">
                                {new Date().toLocaleDateString('en-US', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}
                            </p>
                        </div>
                        <button
                            onClick={() => setShowWelcome(false)}
                            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <EyeOff size={18} className="text-gray-400" />
                        </button>
                    </div>
                    
                    <div className="mt-4 flex items-center gap-3">
                        <Badge className="bg-white/10 text-white border-white/20">
                            {meta.label}
                        </Badge>
                        <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5 animate-pulse" />
                            Active
                        </Badge>
                    </div>
                </motion.div>
            )}

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{meta.title}</h1>
                    <p className="text-sm text-gray-500 mt-1">{meta.subtitle}</p>
                </div>
                <div className="flex gap-3">
                    <select
                        value={activeWidget}
                        onChange={(e) => setActiveWidget(e.target.value)}
                        className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                    >
                        <option value="all">All Widgets</option>
                        <option value="stats">Statistics</option>
                        <option value="charts">Charts</option>
                        <option value="tasks">Tasks</option>
                    </select>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {meta.stats.map((stat, i) => (
                    <StatCard key={i} {...stat} delay={i * 0.08} />
                ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Admin Charts */}
                {user?.role_name === 'SUPER_ADMIN' && (
                    <>
                        <ChartCard title="Enrollment Trends" subtitle="New students over time" delay={0.2}>
                            <div className="h-[280px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={adminStats.enrollmentTrends}>
                                        <defs>
                                            <linearGradient id="enrollGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                        <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                                        <YAxis stroke="#94a3b8" fontSize={12} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area 
                                            type="monotone" 
                                            dataKey="count" 
                                            stroke="#6366f1" 
                                            strokeWidth={2}
                                            fill="url(#enrollGradient)" 
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </ChartCard>

                        <ChartCard title="Absence Trends" subtitle="Daily attendance patterns" delay={0.3}>
                            <div className="h-[280px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={adminStats.absenceTrends}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                                        <YAxis stroke="#94a3b8" fontSize={12} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="present_count" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                                        <Bar dataKey="absent_count" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </ChartCard>
                    </>
                )}

                {/* Student Charts */}
                {user?.role_name === 'STUDENT' && (
                    <>
                        <ChartCard title="Academic Performance" subtitle="Grades by subject" delay={0.2}>
                            <div className="h-[280px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={studentStats.gradesData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                        <XAxis dataKey="subject" stroke="#94a3b8" fontSize={12} />
                                        <YAxis domain={[0, 20]} stroke="#94a3b8" fontSize={12} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="CC" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={12} />
                                        <Bar dataKey="Exam" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={12} />
                                        <Bar dataKey="Final" fill="#10b981" radius={[4, 4, 0, 0]} barSize={12} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </ChartCard>

                        <ChartCard title="Attendance Overview" subtitle="Your attendance record" delay={0.3}>
                            <div className="h-[280px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={studentStats.attendanceData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={4}
                                            dataKey="value"
                                        >
                                            {studentStats.attendanceData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={ATTENDANCE_COLORS[index % ATTENDANCE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </ChartCard>
                    </>
                )}

                {/* Professor Charts */}
                {user?.role_name === 'PROFESSOR' && (
                    <>
                        <ChartCard title="Weekly Schedule" subtitle="Classes per day" delay={0.2}>
                            <div className="h-[280px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={profStats.schedulePerDay}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                        <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                                        <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="classes" fill="#06b6d4" radius={[4, 4, 0, 0]} barSize={30} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </ChartCard>

                        <ChartCard title="Students per Module" subtitle="Class size distribution" delay={0.3}>
                            <div className="h-[280px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={profStats.classAssignments}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={4}
                                            dataKey="students"
                                            nameKey="name"
                                        >
                                            {profStats.classAssignments.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </ChartCard>
                    </>
                )}

                {/* Finance Charts */}
                {user?.role_name === 'FINANCIER' && (
                    <>
                        <ChartCard title="Monthly Revenue" subtitle="Verified payments" delay={0.2}>
                            <div className="h-[280px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={financeStats.monthlyRevenue}>
                                        <defs>
                                            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                        <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                                        <YAxis stroke="#94a3b8" fontSize={12} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area 
                                            type="monotone" 
                                            dataKey="revenue" 
                                            stroke="#10b981" 
                                            strokeWidth={2}
                                            fill="url(#revenueGradient)" 
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </ChartCard>

                        <ChartCard title="Payment Methods" subtitle="Transaction distribution" delay={0.3}>
                            <div className="h-[280px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={financeStats.methodBreakdown}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={4}
                                            dataKey="value"
                                            nameKey="name"
                                        >
                                            {financeStats.methodBreakdown.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </ChartCard>
                    </>
                )}
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Tasks */}
                <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-gray-100 rounded-lg">
                                <CheckSquare size={18} className="text-gray-700" />
                            </div>
                            <h3 className="font-semibold text-gray-900">Active Tasks</h3>
                        </div>
                        <Link to="/tasks" className="text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-1">
                            View All
                            <ChevronRight size={14} />
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {tasks.length > 0 ? tasks.map((task, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-white rounded-lg">
                                        <CheckSquare size={14} className="text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{task.title}</p>
                                        <p className="text-xs text-gray-500">{task.category}</p>
                                    </div>
                                </div>
                                <Badge className={`text-xs ${
                                    task.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                                    task.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                                    'bg-blue-100 text-blue-700'
                                }`}>
                                    {task.priority}
                                </Badge>
                            </div>
                        )) : (
                            <div className="text-center py-8 bg-gray-50 rounded-lg">
                                <CheckCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">No pending tasks</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Messages */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Mail size={18} className="text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900">Recent Messages</h3>
                        </div>
                        <Link to="/messages" className="text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-1">
                            View All
                            <ChevronRight size={14} />
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {messages.length > 0 ? messages.map((msg, i) => (
                            <div key={i} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <div className="flex justify-between items-start mb-1">
                                    <p className={`text-sm ${!msg.is_read ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                                        {msg.sender_name}
                                    </p>
                                    <span className="text-xs text-gray-400">
                                        {new Date(msg.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 truncate">{msg.subject}</p>
                            </div>
                        )) : (
                            <div className="text-center py-8 bg-gray-50 rounded-lg">
                                <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">No messages</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="lg:col-span-1 bg-white border border-gray-200 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-purple-50 rounded-lg">
                            <Activity size={18} className="text-purple-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900">Recent Activity</h3>
                    </div>
                    <div className="space-y-2">
                        {meta.activities.map((a, i) => (
                            <ActivityItem key={i} {...a} index={i} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-900 text-white rounded-xl p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Zap size={18} className="text-indigo-400" />
                    Quick Actions
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { label: 'Generate Report', icon: FileText },
                        { label: 'System Health', icon: Activity },
                        { label: 'Analytics', icon: BarChart2 },
                        { label: 'Help Center', icon: MessageSquare },
                    ].map(({ label, icon: Icon }) => (
                        <button
                            key={label}
                            className="flex items-center gap-2 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm"
                        >
                            <Icon size={16} className="text-gray-400" />
                            {label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
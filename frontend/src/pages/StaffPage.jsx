import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Users,
    Loader2,
    X,
    UserPlus,
    Mail,
    Lock,
    BadgeCheck,
    Briefcase,
    ShieldAlert
} from 'lucide-react';
import api from '../api/axios';
import { cn } from '../utils/cn';

const StaffPage = () => {
    const [staff, setStaff] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isSubmitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        type: 'PROFESSOR',
        department_id: '',
        email: '',
        password: '',
        role_id: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [staffRes, deptRes, roleRes] = await Promise.all([
                api.get('/employees'),
                api.get('/departments'),
                // We'll need a roles endpoint or just hardcode for now
                // Assuming roles are fetched or known
                api.get('/auth/me').then(() => api.get('/departments')) // Placeholder for roles fetch if exists
            ]);
            setStaff(staffRes.data.data);
            setDepartments(deptRes.data.data);
            // In a real app we'd fetch roles. For now, let's assume we can get them.
        } catch (err) {
            setError('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/employees', formData);
            setModalOpen(false);
            fetchData();
            resetForm();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create staff member');
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            first_name: '',
            last_name: '',
            type: 'PROFESSOR',
            department_id: '',
            email: '',
            password: '',
            role_id: ''
        });
        setError(null);
    };

    const NO_LOGIN_TYPES = ['CLEANER', 'SECURITY', 'MAINTENANCE'];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 leading-tight flex items-center gap-3">
                        Staff Management
                    </h1>
                    <p className="text-slate-500 mt-1">Manage professors, administrators, and maintenance staff.</p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setModalOpen(true);
                    }}
                    className="btn-primary flex items-center gap-2 self-start"
                >
                    <UserPlus size={20} />
                    Add Staff Member
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, email or type..."
                        className="input-field pl-10"
                    />
                </div>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Department</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Access</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {staff.map((member) => (
                                <tr key={member.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                                                {member.first_name[0]}{member.last_name[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{member.first_name} {member.last_name}</p>
                                                <p className="text-xs text-slate-500">{member.email || 'No email provided'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                            member.type === 'PROFESSOR' ? "bg-blue-50 text-blue-600 border-blue-100" :
                                                member.type === 'ADMINISTRATIVE' ? "bg-purple-50 text-purple-600 border-purple-100" :
                                                    "bg-amber-50 text-amber-600 border-amber-100"
                                        )}>
                                            {member.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-medium text-slate-600">
                                            {departments.find(d => d.id === member.department_id)?.name || 'N/A'}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        {member.user_id ? (
                                            <div className="flex items-center gap-1.5 text-emerald-600">
                                                <BadgeCheck size={16} />
                                                <span className="text-sm font-bold">Login Enabled</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-slate-400">
                                                <ShieldAlert size={16} />
                                                <span className="text-sm font-medium italic">No Login</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden"
                        >
                            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Hire New Staff</h2>
                                    <p className="text-slate-500 text-sm mt-1">Add a new professional to your institution.</p>
                                </div>
                                <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            {error && (
                                <div className="mx-8 mt-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 text-sm font-bold border border-red-100">
                                    <ShieldAlert size={20} />
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="p-8 space-y-8">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">First Name</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.first_name}
                                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                            className="input-field"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Last Name</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.last_name}
                                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                            className="input-field"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Employment Type</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="input-field"
                                        >
                                            <option value="PROFESSOR">Professor</option>
                                            <option value="ADMINISTRATIVE">Administrative</option>
                                            <option value="CLEANER">Cleaner</option>
                                            <option value="SECURITY">Security</option>
                                            <option value="MAINTENANCE">Maintenance</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Department</label>
                                        <select
                                            required
                                            value={formData.department_id}
                                            onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                                            className="input-field"
                                        >
                                            <option value="">Select Department</option>
                                            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {!NO_LOGIN_TYPES.includes(formData.type) && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="space-y-6 pt-6 border-t border-slate-100"
                                    >
                                        <div className="flex items-center gap-2 text-primary-600">
                                            <BadgeCheck size={20} />
                                            <h3 className="font-bold uppercase tracking-widest text-sm">Authentication Credentials</h3>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Work Email</label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                    <input
                                                        required
                                                        type="email"
                                                        placeholder="staff@upf.edu"
                                                        value={formData.email}
                                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                        className="input-field pl-10"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Initial Password</label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                    <input
                                                        required
                                                        type="password"
                                                        placeholder="••••••••"
                                                        value={formData.password}
                                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                        className="input-field pl-10"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                <div className="flex gap-4 pt-6">
                                    <button
                                        type="button"
                                        onClick={() => setModalOpen(false)}
                                        className="flex-1 px-4 py-3 border border-slate-200 text-slate-500 font-bold rounded-2xl hover:bg-slate-50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 btn-primary h-14 flex items-center justify-center gap-3 shadow-lg shadow-primary-600/20"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin" /> : <UserPlus size={20} />}
                                        {isSubmitting ? 'Processing...' : 'Register Employee'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StaffPage;

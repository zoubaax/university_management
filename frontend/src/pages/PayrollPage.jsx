import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3, Calendar, Search, Filter,
    CheckCircle, Clock, AlertCircle, RefreshCw,
    Download, Printer, DollarSign, Users, TrendingUp, HandCoins
} from 'lucide-react';
import payrollService from '../api/services/payrollService';
import { toast } from 'react-hot-toast';
import Badge from '../components/ui/Badge';

const PayrollPage = () => {
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [loading, setLoading] = useState(false);
    const [payrollData, setPayrollData] = useState([]);
    const [stats, setStats] = useState({ total_base: 0, total_deductions: 0, total_net: 0, employee_count: 0 });
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchPayroll();
    }, [month]);

    const fetchPayroll = async () => {
        try {
            setLoading(true);
            const response = await payrollService.getPayroll(month);
            setPayrollData(response.data || []);
            setStats(response.stats || { total_base: 0, total_deductions: 0, total_net: 0, employee_count: 0 });
        } catch (error) {
            console.error('Failed to fetch payroll:', error);
            // toast.error('Failed to load payroll data');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        try {
            setLoading(true);
            await payrollService.generatePayroll(month);
            toast.success(`Payroll for ${month} generated Successfully`);
            fetchPayroll();
        } catch (error) {
            toast.error('Could not generate payroll');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            setLoading(true);
            await payrollService.updateStatus(id, status);
            toast.success(`Payroll record ${status.toLowerCase()}`);
            fetchPayroll();
        } catch (error) {
            toast.error('Failed to update status');
        } finally {
            setLoading(false);
        }
    };

    const filteredData = payrollData.filter(item =>
        `${item.first_name} ${item.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header section with Stats */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Payroll Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage monthly salaries and automated absence deductions</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                        <input
                            type="month"
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-sm transition-all"
                        />
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition-all font-semibold text-sm shadow-sm active:scale-95 disabled:opacity-50"
                    >
                        <RefreshCw className={loading ? 'animate-spin' : ''} size={18} />
                        {payrollData.length > 0 ? 'Refresh' : 'Generate'}
                    </button>
                </div>
            </div>

            {/* Stats Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-3 text-emerald-600 bg-emerald-50 w-10 h-10 rounded-xl p-2.5">
                        <DollarSign size={20} />
                    </div>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Net Pay</p>
                    <p className="text-2xl font-black text-gray-900 mt-1">{stats.total_net?.toLocaleString()} DA</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-3 text-rose-600 bg-rose-50 w-10 h-10 rounded-xl p-2.5">
                        <TrendingUp size={20} />
                    </div>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Deductions</p>
                    <p className="text-2xl font-black text-gray-900 mt-1">{stats.total_deductions?.toLocaleString()} DA</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-3 text-indigo-600 bg-indigo-50 w-10 h-10 rounded-xl p-2.5">
                        <Users size={20} />
                    </div>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Employees</p>
                    <p className="text-2xl font-black text-gray-900 mt-1">{stats.employee_count}</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-3 text-amber-600 bg-amber-50 w-10 h-10 rounded-xl p-2.5">
                        <Clock size={20} />
                    </div>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Avg. Absences</p>
                    <p className="text-2xl font-black text-gray-900 mt-1">
                        {stats.employee_count > 0 ? (payrollData.reduce((acc, curr) => acc + parseInt(curr.total_absences), 0) / stats.employee_count).toFixed(1) : 0}
                    </p>
                </div>
            </div>

            {/* List Section */}
            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden min-h-[400px]">
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search employee..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-xl transition-all" title="Print Report">
                            <Printer size={20} />
                        </button>
                        <button className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-xl transition-all" title="Download CSV">
                            <Download size={20} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 font-bold">Employee</th>
                                <th className="px-6 py-4 font-bold">Base Salary</th>
                                <th className="px-6 py-4 font-bold">Absences</th>
                                <th className="px-6 py-4 font-bold">Deductions</th>
                                <th className="px-6 py-4 font-bold">Net Salary</th>
                                <th className="px-6 py-4 font-bold text-center">Status</th>
                                <th className="px-6 py-4 font-bold text-right pr-8">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredData.length > 0 ? filteredData.map((record, index) => (
                                <motion.tr
                                    key={record.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-bold text-gray-900">{record.first_name} {record.last_name}</p>
                                            <p className="text-xs text-gray-500">{record.employee_type.replace(/_/g, ' ')}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-500">
                                        {parseFloat(record.base_salary).toLocaleString()} DA
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5">
                                            <span className={`w-2 h-2 rounded-full ${parseInt(record.total_absences) > 0 ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                                            <span className="font-bold">{record.total_absences}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-rose-600 font-bold">
                                        -{parseFloat(record.total_deductions).toLocaleString()} DA
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-indigo-600 font-black">
                                            {parseFloat(record.net_salary).toLocaleString()} DA
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            <Badge
                                                variant={
                                                    record.status === 'PAID' ? 'success' :
                                                        record.status === 'APPROVED' ? 'indigo' :
                                                            'warning'
                                                }
                                            >
                                                {record.status}
                                            </Badge>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right pr-8">
                                        <div className="flex items-center justify-end gap-2">
                                            {record.status === 'DRAFT' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(record.id, 'APPROVED')}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="Approve"
                                                >
                                                    <CheckCircle size={18} />
                                                </button>
                                            )}
                                            {record.status === 'APPROVED' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(record.id, 'PAID')}
                                                    className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors shadow-sm"
                                                >
                                                    <HandCoins size={14} />
                                                    Mark as Paid
                                                </button>
                                            )}
                                            {record.status === 'PAID' && (
                                                <span className="text-emerald-500 font-bold text-xs flex items-center gap-1 justify-end">
                                                    <CheckCircle size={14} /> Paid
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </motion.tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500 italic">
                                        {loading ? 'Processing payroll data...' : `No payroll data found for ${month}. Genererate it to start.`}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PayrollPage;

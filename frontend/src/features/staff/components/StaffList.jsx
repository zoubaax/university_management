import React, { useState } from 'react';
import { Search, UserPlus, Users, Edit2, Trash2, Briefcase, BadgeCheck, ShieldAlert } from 'lucide-react';
import StaffForm from './StaffForm';
import { useStaff } from '../hooks/useStaff';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { cn } from '../../../utils/cn';
import { Loader2 } from 'lucide-react';

const StaffList = ({ pageTitle, pageDescription, filterRoleName }) => {
    const {
        staff,
        departments,
        roles,
        loading,
        createStaff,
        deleteStaff,
        getFilteredStaff
    } = useStaff(filterRoleName);

    const [isModalOpen, setModalOpen] = useState(false);
    const [filter, setFilter] = useState('');

    const filteredStaff = getFilteredStaff(filter);

    const handleCreate = async (data) => {
        const success = await createStaff(data);
        if (success) setModalOpen(false);
    };

    // Calculate initial values for form if we are in a specific context
    const getInitialValues = () => {
        const defaults = { type: 'PROFESSOR' };
        if (filterRoleName && roles.length > 0) {
            const targetRole = roles.find(r => r.name === filterRoleName);
            if (targetRole) {
                defaults.role_id = targetRole.id;
                defaults.role_name_display = targetRole.name; // Just for reference
            }
        }
        return defaults;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 leading-tight">{pageTitle}</h1>
                    <p className="text-slate-500 mt-1 font-medium">{pageDescription}</p>
                </div>
                <Button
                    onClick={() => setModalOpen(true)}
                    icon={UserPlus}
                >
                    Register Staff
                </Button>
            </div>

            {/* Filter Bar */}
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                <input
                    type="text"
                    placeholder="Filter by name, role, or department..."
                    className="input-field pl-12 h-14 bg-white border-slate-200 shadow-sm"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
            </div>

            {/* Table */}
            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
                </div>
            ) : (
                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Employee</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Function</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Department</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredStaff.map((member) => (
                                <tr key={member.id} className="hover:bg-slate-50/80 transition-all group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-black text-sm border-2 border-white shadow-sm group-hover:from-primary-600 group-hover:to-primary-700 group-hover:text-white transition-all">
                                                {member.first_name[0]}{member.last_name[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{member.first_name} {member.last_name}</p>
                                                <p className="text-xs text-slate-400 font-medium">{member.email || 'No institutional email'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <Badge
                                            variant={
                                                member.type === 'PROFESSOR' ? "primary" :
                                                    member.type === 'ADMINISTRATIVE' ? "purple" :
                                                        "default"
                                            }
                                        >
                                            {member.type}
                                        </Badge>
                                        {member.role_name && (
                                            <Badge variant="warning" className="ml-2">
                                                {member.role_name}
                                            </Badge>
                                        )}
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <Briefcase size={14} className="text-slate-300" />
                                            <p className="text-sm font-bold text-slate-600">
                                                {departments.find(d => d.id === member.department_id)?.name || 'General Services'}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        {member.user_id ? (
                                            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 w-fit px-3 py-1 rounded-full border border-emerald-100">
                                                <BadgeCheck size={14} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Active Access</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-slate-400 bg-slate-50 w-fit px-3 py-1 rounded-full border border-slate-100">
                                                <ShieldAlert size={14} />
                                                <span className="text-[10px] font-black uppercase tracking-widest italic">Offline</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <Button variant="ghost" className="p-2" icon={Edit2} />
                                            <Button
                                                variant="ghost"
                                                className="hover:text-red-600 hover:bg-red-50 p-2"
                                                icon={Trash2}
                                                onClick={() => deleteStaff(member.id)}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                title="Hire Professional"
                subtitle="Onboard a new member to the institution."
            >
                <StaffForm
                    onSubmit={handleCreate}
                    departments={departments}
                    roles={roles}
                    onCancel={() => setModalOpen(false)}
                    initialValues={getInitialValues()}
                />
            </Modal>
        </div>
    );
};

export default StaffList;

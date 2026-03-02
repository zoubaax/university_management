import React, { useState } from 'react';
import { Search, UserPlus, Users, Edit2, Trash2, Briefcase, BadgeCheck, ShieldAlert, Filter } from 'lucide-react';
import StaffForm from './StaffForm';
import { useStaff } from '../hooks/useStaff.jsx';
import Modal from '../../../components/ui/Modal';
import ConfirmModal from '../../../components/ui/ConfirmModal';
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
        updateStaff,
        deleteStaff,
        getFilteredStaff
    } = useStaff(filterRoleName);

    const [isModalOpen, setModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [memberToDelete, setMemberToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [filter, setFilter] = useState('');

    const filteredStaff = getFilteredStaff(filter);

    const handleFormSubmit = async (data) => {
        let success;
        if (editingMember) {
            success = await updateStaff(editingMember.id, data);
        } else {
            success = await createStaff(data);
        }

        if (success) {
            setModalOpen(false);
            setEditingMember(null);
        }
    };

    const handleOpenCreate = () => {
        setEditingMember(null);
        setModalOpen(true);
    };

    const handleOpenEdit = (member) => {
        setEditingMember(member);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setEditingMember(null);
    };

    const handleConfirmDelete = async () => {
        if (!memberToDelete) return;
        setIsDeleting(true);
        const success = await deleteStaff(memberToDelete.id, `${memberToDelete.first_name} ${memberToDelete.last_name}`);
        setIsDeleting(false);
        if (success) {
            setMemberToDelete(null);
        }
    };

    const getInitialValues = () => {
        if (editingMember) {
            return {
                first_name: editingMember.first_name,
                last_name: editingMember.last_name,
                type: editingMember.type,
                department_id: editingMember.department_id,
                email: editingMember.user_email || '',
                role_id: editingMember.role_id || '',
                base_salary: editingMember.base_salary || 0,
                deduction_per_absence: editingMember.deduction_per_absence || 0,
            };
        }

        const defaults = { type: 'PROFESSOR', base_salary: 0, deduction_per_absence: 0 };
        if (filterRoleName && roles.length > 0) {
            const targetRole = roles.find(r => r.name === filterRoleName);
            if (targetRole) {
                defaults.role_id = targetRole.id;
                defaults.role_name_display = targetRole.name;
            }
        }
        return defaults;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{pageTitle}</h1>
                    <p className="text-sm text-gray-500 mt-1">{pageDescription}</p>
                </div>
                <Button
                    onClick={handleOpenCreate}
                    icon={UserPlus}
                    className="bg-gray-900 hover:bg-gray-800 text-white"
                >
                    Add Staff
                </Button>
            </div>

            {/* Stats & Filter Bar */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                        <div>
                            <p className="text-sm text-gray-500">Total Staff</p>
                            <p className="text-2xl font-semibold text-gray-900">{staff.length}</p>
                        </div>
                        <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
                        <div>
                            <p className="text-sm text-gray-500">Active Access</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {staff.filter(m => m.user_id).length}
                            </p>
                        </div>
                    </div>

                    <div className="relative w-full sm:w-96">
                        <div className="relative flex items-center">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name, role, or department..."
                                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="h-96 flex flex-col items-center justify-center bg-white rounded-xl border border-gray-200">
                    <Loader2 className="w-8 h-8 text-gray-600 animate-spin mb-3" />
                    <p className="text-sm text-gray-500">Loading staff data...</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <Users size={14} />
                                            Employee
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredStaff.map((member) => (
                                    <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-shrink-0">
                                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-700 font-semibold text-sm">
                                                        {member.first_name[0]}{member.last_name[0]}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{member.first_name} {member.last_name}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{member.email || 'No institutional email'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-2">
                                                <Badge
                                                    className={cn(
                                                        "text-xs font-medium",
                                                        member.type === 'PROFESSOR' && "bg-blue-50 text-blue-700 border-blue-200",
                                                        member.type === 'ADMINISTRATIVE' && "bg-purple-50 text-purple-700 border-purple-200",
                                                        (!member.type || member.type === 'OTHER') && "bg-gray-50 text-gray-700 border-gray-200"
                                                    )}
                                                >
                                                    {member.type}
                                                </Badge>
                                                {member.role_name && (
                                                    <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-xs font-medium">
                                                        {member.role_name}
                                                    </Badge>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Briefcase size={14} className="text-gray-400" />
                                                <span className="text-sm text-gray-700">
                                                    {departments.find(d => d.id === member.department_id)?.name || 'General Services'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {member.user_id ? (
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 border border-green-100">
                                                    <BadgeCheck size={12} className="text-green-600" />
                                                    <span className="text-xs font-medium text-green-700">Active</span>
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 border border-gray-100">
                                                    <ShieldAlert size={12} className="text-gray-500" />
                                                    <span className="text-xs font-medium text-gray-600">Offline</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="Edit"
                                                    onClick={() => handleOpenEdit(member)}
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    onClick={() => setMemberToDelete(member)}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredStaff.length === 0 && (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                                <Users className="w-6 h-6 text-gray-400" />
                            </div>
                            <p className="text-gray-500 font-medium">No staff members found</p>
                            <p className="text-sm text-gray-400 mt-1">
                                {filter ? 'Try adjusting your search filter' : 'Add your first staff member to get started'}
                            </p>
                        </div>
                    )}
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingMember ? "Edit Staff Member" : "Add New Staff"}
                subtitle={editingMember ? "Update employment details" : "Register a new staff member to the institution"}
                size="lg"
            >
                <StaffForm
                    onSubmit={handleFormSubmit}
                    departments={departments}
                    roles={roles}
                    onCancel={handleCloseModal}
                    initialValues={getInitialValues()}
                    isEditing={!!editingMember}
                />
            </Modal>

            <ConfirmModal
                isOpen={!!memberToDelete}
                onClose={() => setMemberToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to remove ${memberToDelete?.first_name} ${memberToDelete?.last_name}? This will revoke all institutional access immediately.`}
                confirmText="Delete Member"
                variant="danger"
                isLoading={isDeleting}
            />
        </div>
    );
};

export default StaffList;
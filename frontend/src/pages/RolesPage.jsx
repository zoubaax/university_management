import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
    Shield,
    Plus,
    Search,
    Edit2,
    Trash2,
    MoreVertical,
    Loader2,
    Lock,
    Users
} from 'lucide-react';
import roleService from '../api/services/roleService';
import RoleForm from '../features/roles/components/RoleForm';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import ConfirmModal from '../components/ui/ConfirmModal';
import Badge from '../components/ui/Badge';
import { useAuth } from '../contexts/AuthContext';

const RolesPage = () => {
    const { user } = useAuth();
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [roleToDelete, setRoleToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [menuOpen, setMenuOpen] = useState(null);

    const fetchRoles = async () => {
        try {
            setLoading(true);
            const roles = await roleService.getRoles();
            setRoles(roles || []);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load roles');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const handleSubmit = async (formData) => {
        try {
            if (editingRole) {
                await roleService.updateRole(editingRole.id, formData);
                toast.success('Role updated successfully');
            } else {
                await roleService.createRole(formData);
                toast.success('Role created successfully');
            }
            setModalOpen(false);
            setEditingRole(null);
            fetchRoles();
        } catch (err) {
            console.error(err);
            toast.error('Operation failed');
        }
    };

    const handleDelete = async () => {
        if (!roleToDelete) return;
        setIsDeleting(true);
        try {
            await roleService.deleteRole(roleToDelete.id);
            toast.success('Role deleted successfully');
            fetchRoles();
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.error || 'Failed to delete role';
            toast.error(msg);
        } finally {
            setIsDeleting(false);
            setRoleToDelete(null);
        }
    };


    const filteredRoles = roles.filter(role =>
        role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (role.description && role.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Role Management</h1>
                    <p className="text-sm text-gray-500 mt-1 font-medium italic">Assign and oversee access levels across the university ecosystem.</p>
                </div>
                <Button
                    onClick={() => {
                        setEditingRole(null);
                        setModalOpen(true);
                    }}
                    icon={Plus}
                    className="bg-gray-900 hover:bg-gray-800 text-white shadow-lg shadow-slate-100 px-6 py-6 rounded-2xl"
                >
                    Create System Role
                </Button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="h-96 flex flex-col items-center justify-center bg-white rounded-xl border border-gray-200">
                    <Loader2 className="w-8 h-8 text-gray-600 animate-spin mb-3" />
                    <p className="text-sm text-gray-500">Loading roles...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredRoles.map((role, index) => (
                            <motion.div
                                key={role.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2, delay: index * 0.05 }}
                                className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="relative">
                                        <button
                                            onClick={() => setMenuOpen(menuOpen === role.id ? null : role.id)}
                                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                        >
                                            <MoreVertical size={16} />
                                        </button>

                                        {/* Dropdown */}
                                        {menuOpen === role.id && (
                                            <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                                <button
                                                    onClick={() => {
                                                        setEditingRole(role);
                                                        setModalOpen(true);
                                                        setMenuOpen(null);
                                                    }}
                                                    className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                >
                                                    <Edit2 size={14} /> Edit
                                                </button>
                                                {role.name !== 'SUPER_ADMIN' && role.name !== 'STUDENT' && role.name !== 'PROFESSOR' && (
                                                    <button
                                                        onClick={() => {
                                                            setRoleToDelete(role);
                                                            setMenuOpen(null);
                                                        }}
                                                        className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                    >
                                                        <Trash2 size={14} /> Delete
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 mb-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300 ${role.name === 'SUPER_ADMIN' ? 'bg-purple-50 text-purple-500' :
                                        role.name === 'PROFESSOR' ? 'bg-blue-50 text-blue-500' :
                                            role.name === 'STUDENT' ? 'bg-green-50 text-green-500' :
                                                'bg-slate-50 text-slate-500'
                                        }`}>
                                        <Shield size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-gray-900 text-lg leading-none">{role.name}</h3>
                                            {(role.name === 'SUPER_ADMIN' || role.name === 'STUDENT') && (
                                                <span className="text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 bg-gray-100 text-gray-400 rounded-full border border-gray-200">System</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1 font-semibold">
                                            {role.name === 'SUPER_ADMIN' ? 'Unrestricted System Access' :
                                                role.permissions ? `${(role.permissions.length || 0)} permissions activated` : 'Limited view access'}
                                        </p>
                                    </div>
                                </div>

                                <p className="text-sm text-gray-600 mb-4 h-10 line-clamp-2">
                                    {role.description || 'No description provided.'}
                                </p>

                                <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                                    <div className="flex items-center gap-1.5">
                                        <Users size={14} />
                                        <span>Active Users</span>
                                    </div>
                                    <span className="font-medium bg-gray-100 px-2 py-0.5 rounded-full">
                                        {role.user_count != null ? role.user_count : '-'}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditingRole(null);
                }}
                title={editingRole ? editingRole.name : 'Create New Role'}
                subtitle={editingRole ? (editingRole.description || "Modify permissions for this system role.") : "Define role name, description and permissions."}
                size="full"
            >
                <RoleForm
                    onSubmit={handleSubmit}
                    onCancel={() => {
                        setModalOpen(false);
                        setEditingRole(null);
                    }}
                    initialValues={editingRole}
                    isEditing={!!editingRole}
                />
            </Modal>

            {/* Confirm Delete */}
            <ConfirmModal
                isOpen={!!roleToDelete}
                onClose={() => setRoleToDelete(null)}
                onConfirm={handleDelete}
                title="Delete Role"
                message={`Are you sure you want to delete ${roleToDelete?.name}? This cannot be undone.`}
                confirmText="Delete Role"
                variant="danger"
                isLoading={isDeleting}
            />
        </div>
    );
};

export default RolesPage;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
    Plus,
    Search,
    Trash2,
    Edit2,
    Save,
    Building2,
    Users,
    MapPin,
    AlertCircle,
    Home,
    Clock,
    Filter,
    MoreVertical,
    CheckCircle,
    XCircle,
    Loader2
} from 'lucide-react';
import roomService from '../api/services/roomService';
import departmentService from '../api/services/departmentService';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/ui/ConfirmModal';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';
import { useAuth } from '../contexts/AuthContext';
import Badge from '../components/ui/Badge';

const RoomsPage = () => {
    const { user } = useAuth();
    const [rooms, setRooms] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [editingRoom, setEditingRoom] = useState(null);
    const [roomToDelete, setRoomToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [menuOpen, setMenuOpen] = useState(null);
    const [formData, setFormData] = useState({
        department_id: '',
        name: '',
        capacity: 30,
        type: 'CLASSROOM',
        floor: 'Floor 1',
        building: '',
        is_active: true
    });

    const isSuperAdmin = user?.role_name === 'SUPER_ADMIN';
    const isRH = user?.role_name === 'RH';

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);


            const [roomsData, deptsData] = await Promise.all([
                roomService.getAll(),
                isSuperAdmin || isRH ? departmentService.getAll() : Promise.resolve([])
            ]);
            setRooms(roomsData || []);

            // Populate departments:
            // - Super Admin/RH: All departments from API
            // - Others: Only their department (from User context or derived from rooms)
            if (isSuperAdmin || isRH) {
                setDepartments(deptsData || []);

            } else {
                // Determine user's department
                const userDeptId = user.department_id;
                let deptList = [];

                if (userDeptId) {
                    // Fetch the department directly to get its name
                    try {
                        const deptResponse = await departmentService.getAll();
                        const userDept = deptResponse.find(d => d.id === userDeptId);
                        if (userDept) {
                            deptList = [{ id: userDept.id, name: userDept.name }];
                        } else {
                            // Fallback: try to find in rooms
                            const foundDept = roomsData?.find(r => r.department_id === userDeptId);
                            const deptName = foundDept ? foundDept.department_name : 'My Department';
                            deptList = [{ id: userDeptId, name: deptName }];
                        }
                    } catch (err) {
                        console.error('Failed to fetch department:', err);
                        // Final fallback
                        const foundDept = roomsData?.find(r => r.department_id === userDeptId);
                        const deptName = foundDept ? foundDept.department_name : 'My Department';
                        deptList = [{ id: userDeptId, name: deptName }];
                    }
                }
                setDepartments(deptList);
            }
        } catch (err) {
            toast.error('Failed to load rooms data');
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingRoom) {
                await roomService.update(editingRoom.id, formData);
                toast.success('Room updated successfully');
            } else {
                await roomService.create(formData);
                toast.success('Room created successfully');
            }
            setIsModalOpen(false);
            setEditingRoom(null);
            fetchData();
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Operation failed. Please try again.';
            toast.error(errorMsg);
        }
    };

    const openModal = (room = null) => {
        if (room) {
            setEditingRoom(room);
            setFormData({
                department_id: room.department_id || '',
                name: room.name,
                capacity: room.capacity,
                type: room.type || 'CLASSROOM',
                floor: room.floor || 'Floor 1',
                building: room.building || '',
                is_active: room.is_active
            });
        } else {
            setEditingRoom(null);
            setFormData({
                department_id: (isSuperAdmin || isRH) && departments.length > 0 ? departments[0].id : (user.department_id || ''),
                name: '',
                capacity: 30,
                type: 'CLASSROOM',
                floor: 'Floor 1',
                building: '',
                is_active: true
            });
        }
        setIsModalOpen(true);
        setMenuOpen(null);
    };

    const handleDeleteClick = (room) => {
        setRoomToDelete(room);
        setMenuOpen(null);
    };

    const confirmDelete = async () => {
        if (!roomToDelete) return;
        setIsDeleting(true);
        try {
            await roomService.delete(roomToDelete.id);
            toast.success('Room deleted successfully');
            setRoomToDelete(null);
            fetchData();
        } catch (err) {
            toast.error('Failed to delete room. It may be scheduled for events.');
        } finally {
            setIsDeleting(false);
        }
    };

    // Generate Room Name
    useEffect(() => {
        if (!isModalOpen || editingRoom) return;

        const generateRoomName = () => {
            const deptId = formData.department_id;
            if (!deptId) return;

            const dept = departments.find(d => d.id === deptId);
            if (!dept || !dept.name) return '';

            // Get initials - skip common French articles and prepositions
            const skipWords = ['de', 'des', 'du', 'la', 'le', 'les', "l'", 'et', 'd'];
            const initials = dept.name
                .split(' ')
                .filter(word => {
                    const lowerWord = word.toLowerCase().replace(/[']/g, '');
                    return !skipWords.includes(lowerWord) && word.length > 0;
                })
                .map(word => word[0])
                .join('')
                .toUpperCase()
                .substring(0, 3); // Max 3 chars

            // Find next number
            // Filter rooms for this department
            const deptRooms = rooms.filter(r => r.department_id === deptId);

            // Extract numbers from existing names like "FSI 1", "FSI 2"
            // Regex to find numbers at the end
            let maxNum = 0;
            const regex = new RegExp(`^${initials}\\s*(\\d+)`, 'i');

            deptRooms.forEach(r => {
                const match = r.name.match(regex);
                if (match) {
                    const num = parseInt(match[1]);
                    if (num > maxNum) maxNum = num;
                }
            });

            const nextNum = maxNum + 1;
            return `${initials} ${nextNum}`;
        };

        const newName = generateRoomName();
        if (newName) {
            setFormData(prev => ({ ...prev, name: newName }));
        }

    }, [formData.department_id, isModalOpen, editingRoom, departments, rooms]);

    // Filter rooms
    const filteredRooms = rooms.filter(room => {
        const matchesSearch = !searchTerm ||
            room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            room.department_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (room.building && room.building.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesType = selectedType === 'all' || room.type === selectedType;
        const matchesDept = selectedDepartment === 'all' || room.department_id === selectedDepartment;

        return matchesSearch && matchesType && matchesDept;
    });

    const getRoomTypeColor = (type) => {
        switch (type?.toUpperCase()) {
            case 'CLASSROOM': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'LAB': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'AMPHITHEATER': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'MEETING_ROOM': return 'bg-green-100 text-green-700 border-green-200';
            case 'OFFICE': return 'bg-gray-100 text-gray-700 border-gray-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getRoomTypeLabel = (type) => {
        switch (type?.toUpperCase()) {
            case 'CLASSROOM': return 'Classroom';
            case 'LAB': return 'Laboratory';
            case 'AMPHITHEATER': return 'Amphitheater';
            case 'MEETING_ROOM': return 'Meeting Room';
            case 'OFFICE': return 'Office';
            default: return type || 'Classroom';
        }
    };

    const typeOptions = [
        { value: 'all', label: 'All Types' },
        { value: 'CLASSROOM', label: 'Classroom' },
        { value: 'LAB', label: 'Laboratory' },
        { value: 'AMPHITHEATER', label: 'Amphitheater' },
        { value: 'MEETING_ROOM', label: 'Meeting Room' },
        { value: 'OFFICE', label: 'Office' },
    ];

    const uniqueDepartments = [...new Set(rooms.map(r => r.department_name).filter(Boolean))];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Rooms & Spaces</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage physical spaces, classrooms, and laboratories</p>
                </div>
                <Button
                    onClick={() => openModal()}
                    icon={Plus}
                    className="bg-gray-900 hover:bg-gray-800 text-white"
                >
                    Add Room
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Rooms</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-1">{rooms.length}</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <Home className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Capacity</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-1">
                                {rooms.reduce((sum, room) => sum + (room.capacity || 0), 0)}
                            </p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                            <Users className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Classrooms</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-1">
                                {rooms.filter(r => r.type === 'CLASSROOM').length}
                            </p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                            <Building2 className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Active</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-1">
                                {rooms.filter(r => r.is_active).length}
                            </p>
                        </div>
                        <div className="p-3 bg-amber-50 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-amber-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search rooms by name, building, or department..."
                                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="text-sm border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                        >
                            {typeOptions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                        <select
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                            className="text-sm border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                        >
                            <option value="all">All Departments</option>
                            {departments.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Rooms Grid */}
            {loading ? (
                <div className="h-96 flex flex-col items-center justify-center bg-white rounded-xl border border-gray-200">
                    <Loader2 className="w-8 h-8 text-gray-600 animate-spin mb-3" />
                    <p className="text-sm text-gray-500">Loading rooms data...</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredRooms.map((room, index) => (
                                <motion.div
                                    key={room.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.2, delay: index * 0.05 }}
                                    className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow group"
                                >
                                    {/* Header with Actions */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-gray-900 rounded-lg">
                                                <Home className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{room.name}</h3>
                                                {room.building && (
                                                    <p className="text-xs text-gray-500 mt-0.5">{room.building}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Dropdown Menu */}
                                        <div className="relative">
                                            <button
                                                onClick={() => setMenuOpen(menuOpen === room.id ? null : room.id)}
                                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                <MoreVertical size={16} />
                                            </button>

                                            {menuOpen === room.id && (
                                                <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                                    <button
                                                        onClick={() => openModal(room)}
                                                        className="w-full px-4 py-2.5 text-sm text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                    >
                                                        <Edit2 size={14} />
                                                        Edit Room
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(room)}
                                                        className="w-full px-4 py-2.5 text-sm text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                    >
                                                        <Trash2 size={14} />
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Room Details */}
                                    <div className="space-y-3 mb-4">
                                        <div className="flex items-center gap-2">
                                            <Badge className={`text-xs ${getRoomTypeColor(room.type)}`}>
                                                {getRoomTypeLabel(room.type)}
                                            </Badge>
                                            <Badge className={room.is_active
                                                ? "bg-green-100 text-green-700 border-green-200 text-xs"
                                                : "bg-red-100 text-red-700 border-red-200 text-xs"
                                            }>
                                                {room.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>

                                        {room.department_name && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Building2 size={14} className="text-gray-400" />
                                                <span>{room.department_name}</span>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Users size={12} className="text-gray-500" />
                                                    <span className="text-xs font-medium text-gray-500">Capacity</span>
                                                </div>
                                                <p className="text-lg font-semibold text-gray-900">{room.capacity}</p>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <MapPin size={12} className="text-gray-500" />
                                                    <span className="text-xs font-medium text-gray-500">Floor</span>
                                                </div>
                                                <p className="text-lg font-semibold text-gray-900">{room.floor || '—'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="pt-4 border-t border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <div className="text-xs text-gray-500">
                                                Last updated: {new Date().toLocaleDateString()}
                                            </div>
                                            {!room.is_active && (
                                                <div className="flex items-center gap-1 text-xs text-amber-600">
                                                    <AlertCircle size={12} />
                                                    Under maintenance
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Empty State */}
                    {filteredRooms.length === 0 && (
                        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                <Home className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
                            <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                                {searchTerm || selectedType !== 'all' || selectedDepartment !== 'all'
                                    ? 'Try adjusting your search filters'
                                    : 'Get started by adding your first room'}
                            </p>
                            {!searchTerm && selectedType === 'all' && selectedDepartment === 'all' && (
                                <Button
                                    onClick={() => openModal()}
                                    icon={Plus}
                                    className="bg-gray-900 hover:bg-gray-800 text-white"
                                >
                                    Add First Room
                                </Button>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Room Form Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingRoom(null);
                }}
                title={editingRoom ? 'Edit Room' : 'Add New Room'}
                subtitle={editingRoom ? 'Update room details and configuration' : 'Add a new physical space to your institution'}
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Department Select moved to grid below */}

                    <Input
                        label="Room Name"
                        placeholder="Enter room name (e.g., Room 101, Lab A)"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        leftIcon={<Home className="w-4 h-4 text-gray-400" />}
                        required
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Department"
                            placeholder="Select department"
                            options={departments.map(d => ({
                                value: d.id,
                                label: d.name
                            }))}
                            value={formData.department_id}
                            onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                            leftIcon={<Building2 className="w-4 h-4 text-gray-400" />}
                        // disabled={!isSuperAdmin && !isRH} // Allow them to see/select their single option
                        />
                        <Select
                            label="Floor"
                            options={[
                                { value: 'Floor 1', label: '1st Floor' },
                                { value: 'Floor 2', label: '2nd Floor' },
                                { value: 'Floor 3', label: '3rd Floor' }
                            ]}
                            value={formData.floor}
                            onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                            leftIcon={<MapPin className="w-4 h-4 text-gray-400" />}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Room Type"
                            options={[
                                { value: 'CLASSROOM', label: 'Classroom' },
                                { value: 'LAB', label: 'Laboratory' },
                                { value: 'AMPHITHEATER', label: 'Amphitheater' },
                                { value: 'MEETING_ROOM', label: 'Meeting Room' },
                                { value: 'OFFICE', label: 'Office' }
                            ]}
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        />
                        <Input
                            label="Capacity"
                            type="number"
                            placeholder="Enter capacity"
                            value={formData.capacity}
                            onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                            leftIcon={<Users className="w-4 h-4 text-gray-400" />}
                            min="1"
                            required
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                        />
                        <label htmlFor="is_active" className="text-sm text-gray-700 cursor-pointer">
                            Room is active and available for scheduling
                        </label>
                    </div>

                    <div className="flex gap-3 pt-6 border-t border-gray-200">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setIsModalOpen(false);
                                setEditingRoom(null);
                            }}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            className="flex-1 bg-gray-900 hover:bg-gray-800"
                            icon={editingRoom ? Save : Plus}
                        >
                            {editingRoom ? 'Save Changes' : 'Create Room'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={!!roomToDelete}
                onClose={() => setRoomToDelete(null)}
                onConfirm={confirmDelete}
                title="Delete Room"
                message={`Are you sure you want to delete ${roomToDelete?.name}? This will permanently remove the room and all associated scheduling data. This action cannot be undone.`}
                confirmText="Delete Room"
                variant="danger"
                isLoading={isDeleting}
            />
        </div>
    );
};

export default RoomsPage;
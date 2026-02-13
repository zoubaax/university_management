import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, CheckCircle2, Clock, AlertCircle, Trash2, Filter,
    ChevronRight, Calendar, Tag, MoreVertical, Search, CheckSquare
} from 'lucide-react';
import taskService from '../api/services/taskService';
import { useAuth } from '../contexts/AuthContext';
import Badge from '../components/ui/Badge';
import { toast } from 'react-hot-toast';

const TaskCenterPage = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [stats, setStats] = useState({ todo_count: 0, in_progress_count: 0, completed_count: 0, high_priority_count: 0 });
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [filter, setFilter] = useState('ALL'); // ALL, TODO, IN_PROGRESS, COMPLETED
    const [search, setSearch] = useState('');

    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        priority: 'MEDIUM',
        category: 'PERSONAL',
        due_date: ''
    });

    useEffect(() => {
        fetchData();
    }, [filter]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const statuses = filter === 'ALL' ? {} : { status: filter };
            const [tasksData, statsData] = await Promise.all([
                taskService.getTasks(statuses),
                taskService.getStats()
            ]);
            setTasks(tasksData);
            setStats(statsData);
        } catch (err) {
            toast.error('Failed to load tasks');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await taskService.createTask(newTask);
            toast.success('Task created');
            setIsAdding(false);
            setNewTask({ title: '', description: '', priority: 'MEDIUM', category: 'PERSONAL', due_date: '' });
            fetchData();
        } catch (err) {
            toast.error('Failed to create task');
        }
    };

    const handleUpdateStatus = async (id, currentStatus) => {
        const nextStatusMap = {
            'TODO': 'IN_PROGRESS',
            'IN_PROGRESS': 'COMPLETED',
            'COMPLETED': 'TODO'
        };
        try {
            await taskService.updateTask(id, { status: nextStatusMap[currentStatus] });
            fetchData();
        } catch (err) {
            toast.error('Update failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this task?')) return;
        try {
            await taskService.deleteTask(id);
            toast.success('Deleted');
            fetchData();
        } catch (err) {
            toast.error('Delete failed');
        }
    };

    const filteredTasks = tasks.filter(t =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.description?.toLowerCase().includes(search.toLowerCase())
    );

    const getPriorityColor = (p) => {
        switch (p) {
            case 'HIGH': return 'bg-red-50 text-red-700 border-red-100';
            case 'MEDIUM': return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'LOW': return 'bg-blue-50 text-blue-700 border-blue-100';
            default: return 'bg-gray-50 text-gray-700 border-gray-100';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Productivity Hub</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your daily goals and institutional assignments.</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors shadow-sm text-sm font-medium"
                >
                    <Plus size={18} /> New Task
                </button>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 p-4 rounded-xl">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">In Progress</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.in_progress_count}</p>
                </div>
                <div className="bg-white border border-gray-200 p-4 rounded-xl">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">High Priority</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">{stats.high_priority_count}</p>
                </div>
                <div className="bg-white border border-gray-200 p-4 rounded-xl">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pending (Todo)</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.todo_count}</p>
                </div>
                <div className="bg-white border border-gray-200 p-4 rounded-xl">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Completed</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{stats.completed_count}</p>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-sm transition-all"
                    />
                </div>
                <div className="flex bg-white border border-gray-200 p-1 rounded-lg">
                    {['ALL', 'TODO', 'IN_PROGRESS', 'COMPLETED'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${filter === f ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {f.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Task List */}
            <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                    {filteredTasks.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-12 text-center"
                        >
                            <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm">No tasks found. Time to relax or create a new one!</p>
                        </motion.div>
                    ) : (
                        filteredTasks.map((task, idx) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                key={task.id}
                                className={`group bg-white border border-gray-200 hover:border-gray-300 rounded-xl p-4 flex items-center gap-4 transition-all hover:shadow-sm ${task.status === 'COMPLETED' ? 'opacity-75' : ''}`}
                            >
                                <button
                                    onClick={() => handleUpdateStatus(task.id, task.status)}
                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${task.status === 'COMPLETED'
                                            ? 'bg-green-500 border-green-500 text-white'
                                            : task.status === 'IN_PROGRESS'
                                                ? 'bg-amber-100 border-amber-300 text-amber-600 animate-pulse'
                                                : 'border-gray-300 group-hover:border-gray-900'
                                        }`}
                                >
                                    {task.status === 'COMPLETED' && <CheckCircle2 size={16} />}
                                    {task.status === 'IN_PROGRESS' && <Clock size={16} />}
                                </button>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <h3 className={`font-semibold text-gray-900 truncate ${task.status === 'COMPLETED' ? 'line-through text-gray-400' : ''}`}>
                                            {task.title}
                                        </h3>
                                        <Badge className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-tight border ${getPriorityColor(task.priority)}`}>
                                            {task.priority}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-gray-500 truncate">{task.description || 'No description'}</p>
                                </div>

                                <div className="flex items-center gap-6 pr-2">
                                    <div className="hidden md:flex flex-col items-end gap-1">
                                        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                                            <Tag size={12} /> {task.category}
                                        </div>
                                        {task.due_date && (
                                            <div className="flex items-center gap-1.5 text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-full ring-1 ring-amber-100">
                                                <Calendar size={12} /> {new Date(task.due_date).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleDelete(task.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Modal for Adding */}
            <AnimatePresence>
                {isAdding && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100"
                        >
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                                <h2 className="text-lg font-bold text-gray-900">Define New Task</h2>
                                <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-white rounded-full transition-colors">
                                    <Plus className="w-5 h-5 text-gray-400 rotate-45" />
                                </button>
                            </div>
                            <form onSubmit={handleCreate} className="p-6 space-y-4">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 tracking-wider">Title</label>
                                        <input
                                            autoFocus
                                            required
                                            value={newTask.title}
                                            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 outline-none transition-all placeholder:text-gray-400"
                                            placeholder="What needs to be done?"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 tracking-wider">Description</label>
                                        <textarea
                                            value={newTask.description}
                                            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 outline-none transition-all h-24 resize-none"
                                            placeholder="Add more details..."
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 tracking-wider">Priority</label>
                                            <select
                                                value={newTask.priority}
                                                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 outline-none"
                                            >
                                                <option value="LOW">Low</option>
                                                <option value="MEDIUM">Medium</option>
                                                <option value="HIGH">High</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 tracking-wider">Due Date</label>
                                            <input
                                                type="date"
                                                value={newTask.due_date}
                                                onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-6 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsAdding(false)}
                                        className="flex-1 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 text-sm font-semibold bg-gray-900 text-white rounded-xl shadow-lg shadow-gray-200 hover:bg-gray-800 transition-all hover:-translate-y-0.5"
                                    >
                                        Save Task
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

export default TaskCenterPage;

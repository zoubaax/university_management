import React, { useState, useEffect } from 'react';
import {
    History,
    BookOpen,
    Trophy,
    Calendar,
    BarChart3,
    ArrowRight,
    ChevronRight,
    Search,
    Brain,
    Loader2,
    RefreshCw,
    Clock,
    Target,
    Award,
    Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import aiStudyService from '../api/services/aiStudyService';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import AIQuizModal from '../components/ui/AIQuizModal';
import { cn } from '../utils/cn';

const StudyHistoryPage = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const response = await aiStudyService.getHistory();
            setHistory(response.data || []);
        } catch (err) {
            toast.error('Failed to load study history');
        } finally {
            setLoading(false);
        }
    };

    const handleReview = (quiz) => {
        setSelectedQuiz(quiz);
        setIsModalOpen(true);
    };

    const filteredHistory = history.filter(item => {
        const matchesSearch = item.resource_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.module_name.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFilter = selectedFilter === 'all' ||
            (selectedFilter === 'excellent' && (item.score / item.total_questions) >= 0.8) ||
            (selectedFilter === 'good' && (item.score / item.total_questions) >= 0.5 && (item.score / item.total_questions) < 0.8) ||
            (selectedFilter === 'needs-work' && (item.score / item.total_questions) < 0.5);

        return matchesSearch && matchesFilter;
    });

    const getScoreColor = (score, total) => {
        const percentage = (score / total) * 100;
        if (percentage >= 80) return "bg-green-100 text-green-700 border-green-200";
        if (percentage >= 50) return "bg-amber-100 text-amber-700 border-amber-200";
        return "bg-red-100 text-red-700 border-red-200";
    };

    const getScoreBadge = (score, total) => {
        const percentage = (score / total) * 100;
        if (percentage >= 80) return { label: 'Excellent', color: 'bg-green-100 text-green-700 border-green-200' };
        if (percentage >= 50) return { label: 'Good', color: 'bg-amber-100 text-amber-700 border-amber-200' };
        return { label: 'Needs Work', color: 'bg-red-100 text-red-700 border-red-200' };
    };

    const stats = {
        totalQuizzes: history.length,
        avgScore: history.length > 0
            ? Math.round(history.reduce((acc, curr) => acc + (curr.score / curr.total_questions), 0) / history.length * 100)
            : 0,
        bestScore: history.length > 0
            ? Math.max(...history.map(h => (h.score / h.total_questions) * 100))
            : 0,
        totalQuestions: history.reduce((acc, curr) => acc + curr.total_questions, 0)
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Study History</h1>
                    <p className="text-sm text-gray-500 mt-1">Track your academic progress and review past quizzes</p>
                </div>
                <Button
                    onClick={fetchHistory}
                    variant="outline"
                    icon={RefreshCw}
                    className={cn(loading && "opacity-50 cursor-not-allowed")}
                    disabled={loading}
                >
                    Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Quizzes Taken</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.totalQuizzes}</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <Brain className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Average Score</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.avgScore}%</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                            <Target className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Personal Best</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-1">{Math.round(stats.bestScore)}%</p>
                        </div>
                        <div className="p-3 bg-amber-50 rounded-lg">
                            <Trophy className="w-6 h-6 text-amber-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Questions Answered</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.totalQuestions}</p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                            <BookOpen className="w-6 h-6 text-purple-600" />
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
                                placeholder="Search by resource or module name..."
                                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            value={selectedFilter}
                            onChange={(e) => setSelectedFilter(e.target.value)}
                            className="text-sm border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                        >
                            <option value="all">All Results</option>
                            <option value="excellent">Excellent (80%+)</option>
                            <option value="good">Good (50-79%)</option>
                            <option value="needs-work">Needs Work (&lt;50%)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* History Table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                {loading ? (
                    <div className="h-96 flex flex-col items-center justify-center">
                        <Loader2 className="w-8 h-8 text-gray-600 animate-spin mb-3" />
                        <p className="text-sm text-gray-500">Loading your study history...</p>
                    </div>
                ) : filteredHistory.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Resource & Module</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Performance</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date Taken</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    <AnimatePresence>
                                        {filteredHistory.map((item, idx) => {
                                            const scoreBadge = getScoreBadge(item.score, item.total_questions);
                                            return (
                                                <motion.tr
                                                    key={item.id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ delay: idx * 0.03 }}
                                                    className="hover:bg-gray-50 transition-colors group"
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-900 transition-colors">
                                                                <BookOpen className="w-5 h-5 text-gray-600 group-hover:text-white" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-900 text-sm">{item.resource_title}</p>
                                                                <p className="text-xs text-gray-500 mt-0.5">{item.module_name}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <Badge className={`text-xs ${getScoreColor(item.score, item.total_questions)}`}>
                                                                {item.score}/{item.total_questions}
                                                            </Badge>
                                                            <div className="flex-1 max-w-[120px]">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                                        <div
                                                                            className={cn(
                                                                                "h-full rounded-full transition-all duration-500",
                                                                                (item.score / item.total_questions) >= 0.8 ? "bg-green-500" :
                                                                                    (item.score / item.total_questions) >= 0.5 ? "bg-amber-500" : "bg-red-500"
                                                                            )}
                                                                            style={{ width: `${(item.score / item.total_questions) * 100}%` }}
                                                                        />
                                                                    </div>
                                                                    <span className="text-xs font-medium text-gray-600 min-w-[40px]">
                                                                        {Math.round((item.score / item.total_questions) * 100)}%
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <Clock size={14} className="text-gray-400" />
                                                            <div>
                                                                <span className="text-sm text-gray-700 font-medium">
                                                                    {new Date(item.created_at).toLocaleDateString('en-US', {
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        year: 'numeric'
                                                                    })}
                                                                </span>
                                                                <span className="text-xs text-gray-400 ml-2">
                                                                    {new Date(item.created_at).toLocaleTimeString('en-US', {
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => handleReview(item)}
                                                            className="text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-1 transition-colors ml-auto"
                                                        >
                                                            Review
                                                            <ChevronRight size={14} />
                                                        </button>
                                                    </td>
                                                </motion.tr>
                                            );
                                        })}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>

                        {/* Summary Footer */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                            <div className="flex items-center justify-between text-sm">
                                <p className="text-gray-600">
                                    Showing <span className="font-semibold text-gray-900">{filteredHistory.length}</span> of{' '}
                                    <span className="font-semibold text-gray-900">{history.length}</span> quizzes
                                </p>
                                <Badge className="bg-gray-200 text-gray-700 border-gray-300">
                                    Last updated: {new Date().toLocaleDateString()}
                                </Badge>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="p-12 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                            <History className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No study history found</h3>
                        <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                            {searchQuery || selectedFilter !== 'all'
                                ? 'Try adjusting your search filters'
                                : 'Start taking AI-generated quizzes in your course resources to see your progress here!'}
                        </p>
                        {!searchQuery && selectedFilter === 'all' && (
                            <Button
                                onClick={() => window.location.href = '/courses'}
                                className="bg-gray-900 hover:bg-gray-800 text-white"
                            >
                                Browse Courses
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Quiz Review Modal */}
            {selectedQuiz && (
                <AIQuizModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    quizData={selectedQuiz.quiz_data}
                    resourceTitle={selectedQuiz.resource_title}
                    resourceId={selectedQuiz.resource_id}
                    initialAnswers={selectedQuiz.user_answers}
                    initialScore={selectedQuiz.score}
                    initialTime={selectedQuiz.time_spent}
                />
            )}
        </div>
    );
};

export default StudyHistoryPage;
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Brain,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    HelpCircle,
    Trophy,
    RefreshCw,
    ArrowLeft,
    Clock,
    Award,
    Target,
    BookOpen
} from 'lucide-react';
import Button from './Button';
import Modal from './Modal';
import Badge from './Badge';
import { cn } from '../../utils/cn';
import aiStudyService from '../../api/services/aiStudyService';
import { toast } from 'react-hot-toast';

const AIQuizModal = ({
    isOpen,
    onClose,
    quizData,
    resourceTitle,
    resourceId,
    initialAnswers = null,
    initialScore = 0,
    initialTime = '0 min'
}) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(initialAnswers ? initialScore : 0);
    const [showResults, setShowResults] = useState(!!initialAnswers);
    const [answers, setAnswers] = useState(initialAnswers || []);
    const [startTime] = useState(Date.now());
    const [timeSpent, setTimeSpent] = useState(initialTime);

    // Update state when initialAnswers changes (e.g. when opening a different review)
    React.useEffect(() => {
        if (isOpen && initialAnswers) {
            setAnswers(initialAnswers);
            setScore(initialScore);
            setShowResults(true);
            setTimeSpent(initialTime);
        } else if (isOpen && !initialAnswers) {
            handleReset();
        }
    }, [isOpen, initialAnswers, initialScore, initialTime]);

    if (!quizData) return null;

    const currentQuestion = quizData.questions[currentQuestionIndex];
    const totalQuestions = quizData.questions.length;

    const handleOptionSelect = (index) => {
        if (isSubmitted) return;
        setSelectedOption(index);
    };

    const handleNext = () => {
        if (selectedOption === null) return;

        if (!isSubmitted) {
            // Step 1: Submit Answer
            setIsSubmitted(true);
            const isCorrect = selectedOption === currentQuestion.correct_answer_index;
            if (isCorrect) setScore(score + 1);

            // Record answer for final results
            const newAnswers = [...answers, {
                questionIndex: currentQuestionIndex,
                selectedOption,
                isCorrect,
                explanation: currentQuestion.explanation
            }];
            setAnswers(newAnswers);
        } else {
            // Step 2: Move to next question
            if (currentQuestionIndex < totalQuestions - 1) {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
                setSelectedOption(null);
                setIsSubmitted(false);
            } else {
                // Calculate time spent
                const elapsed = Math.floor((Date.now() - startTime) / 60000);
                setTimeSpent(elapsed < 1 ? '<1 min' : `~${elapsed} min${elapsed > 1 ? 's' : ''}`);

                // SAVE RESULT TO HISTORY
                saveToHistory();
                setShowResults(true);
            }
        }
    };

    const saveToHistory = async () => {
        try {
            await aiStudyService.saveResult({
                resourceId,
                quizData,
                score,
                totalQuestions,
                answers,    // STORE ANSWERS FOR REVIEW
                timeSpent  // STORE TIME SPENT
            });
            console.log('Quiz history saved successfully');
        } catch (err) {
            console.error('Failed to save quiz history:', err);
        }
    };

    const handleReset = () => {
        setCurrentQuestionIndex(0);
        setSelectedOption(null);
        setIsSubmitted(false);
        setScore(0);
        setShowResults(false);
        setAnswers([]);
    };

    const getOptionStyles = (index) => {
        if (!isSubmitted) {
            return selectedOption === index
                ? "border-gray-900 bg-gray-50 ring-4 ring-gray-100"
                : "border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50";
        }

        const isCorrect = index === currentQuestion.correct_answer_index;
        const isSelected = selectedOption === index;

        if (isCorrect) return "border-green-500 bg-green-50 ring-4 ring-green-100";
        if (isSelected && !isCorrect) return "border-red-500 bg-red-50 ring-4 ring-red-100";
        if (isCorrect && isSelected) return "border-green-500 bg-green-50 ring-4 ring-green-100";

        return "border-gray-200 bg-gray-50 opacity-50";
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={showResults ? "Quiz Results" : "AI Study Quiz"}
            subtitle={showResults ? `Completed: ${resourceTitle}` : resourceTitle}
            size="lg"
        >
            <div className="min-h-[450px] flex flex-col">
                <AnimatePresence mode="wait">
                    {!showResults ? (
                        <motion.div
                            key="quiz"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex-1"
                        >
                            {/* Progress Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <BookOpen size={16} className="text-gray-700" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Question {currentQuestionIndex + 1} of {totalQuestions}</p>
                                        <p className="text-sm font-medium text-gray-900">{Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}% Complete</p>
                                    </div>
                                </div>
                                <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                                    <Brain size={12} className="mr-1" />
                                    AI Generated
                                </Badge>
                            </div>

                            {/* Progress Bar */}
                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mb-8">
                                <motion.div
                                    className="h-full bg-gray-900"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>

                            {/* Question */}
                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 mb-6">
                                <div className="flex gap-3">
                                    <div className="p-2 bg-white rounded-lg border border-gray-200 h-fit shadow-sm">
                                        <HelpCircle className="w-5 h-5 text-gray-700" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                                        {currentQuestion.question}
                                    </h3>
                                </div>
                            </div>

                            {/* Options */}
                            <div className="space-y-3 mb-6">
                                {currentQuestion.options.map((option, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleOptionSelect(index)}
                                        disabled={isSubmitted}
                                        className={cn(
                                            "w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left",
                                            getOptionStyles(index)
                                        )}
                                    >
                                        <div className={cn(
                                            "w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 font-medium text-xs transition-colors",
                                            isSubmitted && index === currentQuestion.correct_answer_index
                                                ? "bg-green-600 border-green-600 text-white"
                                                : isSubmitted && selectedOption === index && index !== currentQuestion.correct_answer_index
                                                    ? "bg-red-600 border-red-600 text-white"
                                                    : selectedOption === index && !isSubmitted
                                                        ? "bg-gray-900 border-gray-900 text-white"
                                                        : "border-gray-300 text-gray-500"
                                        )}>
                                            {isSubmitted && index === currentQuestion.correct_answer_index ? (
                                                <CheckCircle2 size={14} />
                                            ) : isSubmitted && selectedOption === index && index !== currentQuestion.correct_answer_index ? (
                                                <X size={14} />
                                            ) : (
                                                String.fromCharCode(65 + index)
                                            )}
                                        </div>
                                        <span className={cn(
                                            "text-sm font-medium",
                                            selectedOption === index && !isSubmitted ? "text-gray-900" : "text-gray-700"
                                        )}>
                                            {option}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {/* Feedback Explanation */}
                            <AnimatePresence>
                                {isSubmitted && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className={cn(
                                            "p-4 rounded-xl border mb-6",
                                            selectedOption === currentQuestion.correct_answer_index
                                                ? "bg-green-50 border-green-200"
                                                : "bg-red-50 border-red-200"
                                        )}
                                    >
                                        <div className="flex gap-3">
                                            <div className="shrink-0">
                                                {selectedOption === currentQuestion.correct_answer_index
                                                    ? <CheckCircle2 className="w-5 h-5 text-green-600" />
                                                    : <AlertCircle className="w-5 h-5 text-red-600" />
                                                }
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900 mb-1">
                                                    {selectedOption === currentQuestion.correct_answer_index ? "Correct!" : "Not quite right"}
                                                </p>
                                                <p className="text-sm text-gray-600 leading-relaxed">
                                                    {currentQuestion.explanation}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Navigation */}
                            <div className="flex justify-end pt-4 border-t border-gray-200">
                                <Button
                                    onClick={handleNext}
                                    disabled={selectedOption === null}
                                    className={cn(
                                        "transition-all min-w-[140px]",
                                        isSubmitted ? "bg-gray-900 hover:bg-gray-800 text-white" : "bg-gray-900 text-white"
                                    )}
                                    icon={isSubmitted ? ChevronRight : null}
                                    iconPosition="right"
                                >
                                    {isSubmitted
                                        ? (currentQuestionIndex === totalQuestions - 1 ? "Finish" : "Next")
                                        : "Submit Answer"
                                    }
                                </Button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex-1 flex flex-col py-6"
                        >
                            {/* Results Header */}
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-4 border border-amber-200">
                                    <Trophy className="w-8 h-8 text-amber-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-1">Quiz Completed!</h2>
                                <p className="text-sm text-gray-500">Here's how you performed</p>
                            </div>

                            {/* Score Cards */}
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle2 size={16} className="text-green-600" />
                                        <p className="text-xs font-medium text-green-700 uppercase tracking-wider">Score</p>
                                    </div>
                                    <p className="text-3xl font-bold text-green-700">
                                        {score}/{totalQuestions}
                                    </p>
                                    <p className="text-xs text-green-600 mt-1">
                                        {Math.round((score / totalQuestions) * 100)}% correct
                                    </p>
                                </div>
                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Clock size={16} className="text-blue-600" />
                                        <p className="text-xs font-medium text-blue-700 uppercase tracking-wider">Time</p>
                                    </div>
                                    <p className="text-3xl font-bold text-blue-700">{timeSpent}</p>
                                    <p className="text-xs text-blue-600 mt-1">Total duration</p>
                                </div>
                            </div>

                            {/* Performance Summary */}
                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 mb-8">
                                <div className="flex items-center gap-2 mb-4">
                                    <Target size={16} className="text-gray-600" />
                                    <h3 className="text-sm font-semibold text-gray-900">Performance Breakdown</h3>
                                </div>
                                <div className="space-y-3">
                                    {answers.map((answer, idx) => (
                                        <div key={idx} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    "w-5 h-5 rounded flex items-center justify-center",
                                                    answer.isCorrect ? "bg-green-100" : "bg-red-100"
                                                )}>
                                                    {answer.isCorrect ? (
                                                        <CheckCircle2 size={12} className="text-green-600" />
                                                    ) : (
                                                        <X size={12} className="text-red-600" />
                                                    )}
                                                </div>
                                                <span className="text-gray-600">Question {idx + 1}</span>
                                            </div>
                                            <Badge className={cn(
                                                "text-xs",
                                                answer.isCorrect
                                                    ? "bg-green-100 text-green-700 border-green-200"
                                                    : "bg-red-100 text-red-700 border-red-200"
                                            )}>
                                                {answer.isCorrect ? 'Correct' : 'Incorrect'}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <Button
                                    onClick={handleReset}
                                    variant="outline"
                                    className="flex-1"
                                    icon={RefreshCw}
                                >
                                    Try Again
                                </Button>
                                <Button
                                    onClick={onClose}
                                    className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
                                >
                                    Close
                                </Button>
                            </div>

                            {/* Achievement Badge */}
                            {score === totalQuestions && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-6 p-3 bg-amber-50 rounded-lg border border-amber-200 text-center"
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <Award size={16} className="text-amber-600" />
                                        <p className="text-sm font-medium text-amber-800">Perfect score! Excellent work!</p>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Modal>
    );
};

export default AIQuizModal;
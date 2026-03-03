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
    ArrowLeft
} from 'lucide-react';
import Button from './Button';
import Modal from './Modal';
import Badge from './Badge';
import { cn } from '../../utils/cn';

const AIQuizModal = ({ isOpen, onClose, quizData, resourceTitle }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [answers, setAnswers] = useState([]);

    if (!quizData) return null;

    const currentQuestion = quizData.questions[currentQuestionIndex];
    const totalQuestions = quizData.questions.length;

    const handleOptionSelect = (index) => {
        if (isSubmitted) return;
        setSelectedOption(index);
    };

    const handleNext = () => {
        if (selectedOption === null) return;

        // Record answer
        const isCorrect = selectedOption === currentQuestion.correct_answer_index;
        const newAnswers = [...answers, {
            questionIndex: currentQuestionIndex,
            selectedOption,
            isCorrect
        }];
        setAnswers(newAnswers);

        if (isCorrect) setScore(score + 1);

        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedOption(null);
        } else {
            setShowResults(true);
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

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={showResults ? "Quiz Results" : "Study Mode: AI Quiz"}
            subtitle={resourceTitle}
            size="2xl"
        >
            <div className="min-h-[400px] flex flex-col">
                <AnimatePresence mode="wait">
                    {!showResults ? (
                        <motion.div
                            key="quiz"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex-1"
                        >
                            {/* Progress */}
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Question {currentQuestionIndex + 1} of {totalQuestions}
                                    </span>
                                    <Badge className="bg-blue-50 text-blue-700 border-blue-100">
                                        {Math.round(((currentQuestionIndex) / totalQuestions) * 100)}% Complete
                                    </Badge>
                                </div>
                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-blue-600"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                                    />
                                </div>
                            </div>

                            {/* Question */}
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 mb-6">
                                <div className="flex gap-3">
                                    <div className="p-2 bg-white rounded-lg border border-gray-200 h-fit">
                                        <HelpCircle className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                                        {currentQuestion.question}
                                    </h3>
                                </div>
                            </div>

                            {/* Options */}
                            <div className="space-y-3">
                                {currentQuestion.options.map((option, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleOptionSelect(index)}
                                        className={cn(
                                            "w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left",
                                            selectedOption === index
                                                ? "border-blue-600 bg-blue-50/50 ring-4 ring-blue-50"
                                                : "border-gray-100 hover:border-gray-200 bg-white"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 font-bold text-xs",
                                            selectedOption === index
                                                ? "border-blue-600 bg-blue-600 text-white"
                                                : "border-gray-300 text-gray-400"
                                        )}>
                                            {String.fromCharCode(65 + index)}
                                        </div>
                                        <span className={cn(
                                            "text-sm font-medium",
                                            selectedOption === index ? "text-blue-900" : "text-gray-700"
                                        )}>
                                            {option}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                                <Button
                                    onClick={handleNext}
                                    disabled={selectedOption === null}
                                    className="bg-gray-900 text-white"
                                    icon={ChevronRight}
                                    iconPosition="right"
                                >
                                    {currentQuestionIndex === totalQuestions - 1 ? "Finish Quiz" : "Next Question"}
                                </Button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex-1 flex flex-col items-center justify-center text-center py-8"
                        >
                            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-amber-50/50">
                                <Trophy className="w-10 h-10 text-amber-500" />
                            </div>

                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Quiz Completed!</h2>
                            <p className="text-gray-500 mb-8 max-w-sm">
                                You scored <span className="text-gray-900 font-bold">{score}</span> out of <span className="text-gray-900 font-bold">{totalQuestions}</span>.
                                Perfecting your knowledge one step at a time!
                            </p>

                            <div className="w-full grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                                    <p className="text-xs text-green-600 font-medium uppercase tracking-wider mb-1">Success Rate</p>
                                    <p className="text-2xl font-bold text-green-700">{Math.round((score / totalQuestions) * 100)}%</p>
                                </div>
                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                    <p className="text-xs text-blue-600 font-medium uppercase tracking-wider mb-1">Time Spent</p>
                                    <p className="text-2xl font-bold text-blue-700">~2 mins</p>
                                </div>
                            </div>

                            <div className="flex gap-4 w-full">
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
                                    className="flex-1 bg-gray-900 text-white"
                                >
                                    Done
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Modal>
    );
};

export default AIQuizModal;

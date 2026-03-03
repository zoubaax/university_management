import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare,
    X,
    Send,
    Bot,
    User,
    Loader2,
    Sparkles,
    ChevronDown,
    Maximize2,
    Minimize2,
    MoreVertical,
    Trash2,
    CheckCircle,
    AlertCircle,
    Calendar,
    DollarSign,
    FileText
} from 'lucide-react';
import aiService from '../../api/services/aiService';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../utils/cn';
import Badge from '../ui/Badge';

const ChatWidget = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: `Hello ${user?.first_name || 'there'}! I'm your UPF Assistant. How can I help you today?`,
            sender: 'ai',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [typingSuggestion, setTypingSuggestion] = useState('');
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const getRoleSuggestions = () => {
        const role = user?.role_name;

        const common = [
            { text: "What is my schedule for today?", icon: Calendar, color: "text-blue-600" },
            { text: "Add a task for tomorrow", icon: CheckCircle, color: "text-indigo-600" }
        ];

        if (role === 'STUDENT') {
            return [
                ...common,
                { text: "How much money do I still have to pay?", icon: DollarSign, color: "text-green-600" },
                { text: "Can I get a certificate?", icon: FileText, color: "text-amber-600" },
                { text: "View my recent grades", icon: CheckCircle, color: "text-emerald-600" }
            ];
        }

        if (role === 'PROFESSOR') {
            return [
                ...common,
                { text: "Show my teaching schedule", icon: Calendar, color: "text-blue-600" },
                { text: "Manage course materials", icon: FileText, color: "text-purple-600" },
                { text: "How many students in my classes?", icon: User, color: "text-orange-600" }
            ];
        }

        if (role === 'RESPONSABLE_DEPARTMENT' || role === 'DIRECTOR_DEPARTMENT') {
            return [
                ...common,
                { text: "Status of my department", icon: Bot, color: "text-indigo-600" },
                { text: "Pending certificates to approve", icon: FileText, color: "text-amber-600" },
                { text: "How many students in the department?", icon: User, color: "text-blue-600" }
            ];
        }

        return common;
    };

    const suggestions = getRoleSuggestions();

    useEffect(() => {
        if (isOpen && !isMinimized) {
            scrollToBottom();
            inputRef.current?.focus();
        }
    }, [messages, isOpen, isMinimized]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = {
            id: Date.now(),
            text: input,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setTypingSuggestion('');
        setIsLoading(true);

        try {
            const data = await aiService.chat(input);
            const aiMsg = {
                id: Date.now() + 1,
                text: data.data,
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (err) {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: "I'm having trouble connecting right now. Please try again later.",
                sender: 'ai',
                isError: true,
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearChat = () => {
        setMessages([{
            id: 1,
            text: `Hello ${user?.first_name || 'there'}! I'm your UPF Assistant. How can I help you today?`,
            sender: 'ai',
            timestamp: new Date()
        }]);
        setShowOptions(false);
    };

    const handleSuggestionClick = (suggestion) => {
        setInput(suggestion);
        inputRef.current?.focus();
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            height: isMinimized ? '64px' : '560px',
                            width: '380px'
                        }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                            "bg-white rounded-xl border border-gray-200 shadow-xl flex flex-col overflow-hidden mb-4",
                            isMinimized && "overflow-hidden"
                        )}
                    >
                        {/* Header */}
                        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-900 rounded-lg">
                                    <Bot size={18} className="text-white" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-gray-900 text-sm">UPF Assistant</h3>
                                        <Badge className="text-[10px] bg-green-100 text-green-700 border-green-200">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1 animate-pulse" />
                                            Online
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-gray-500">AI-powered help</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="relative">
                                    <button
                                        onClick={() => setShowOptions(!showOptions)}
                                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <MoreVertical size={16} />
                                    </button>
                                    {showOptions && (
                                        <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                            <button
                                                onClick={handleClearChat}
                                                className="w-full px-3 py-2 text-xs text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                            >
                                                <Trash2 size={14} />
                                                Clear chat
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => setIsMinimized(!isMinimized)}
                                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                    title={isMinimized ? "Expand" : "Minimize"}
                                >
                                    {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {!isMinimized && (
                            <>
                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                                    <AnimatePresence>
                                        {messages.map((msg, index) => (
                                            <motion.div
                                                key={msg.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                className={cn(
                                                    "flex w-full",
                                                    msg.sender === 'user' ? "justify-end" : "justify-start"
                                                )}
                                            >
                                                <div className={cn(
                                                    "flex gap-2 max-w-[85%]",
                                                    msg.sender === 'user' && "flex-row-reverse"
                                                )}>
                                                    <div className={cn(
                                                        "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                                                        msg.sender === 'user'
                                                            ? "bg-gray-900 text-white"
                                                            : "bg-white border border-gray-200 text-gray-600"
                                                    )}>
                                                        {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                                                    </div>
                                                    <div>
                                                        <div className={cn(
                                                            "p-3 text-sm rounded-lg",
                                                            msg.sender === 'user'
                                                                ? "bg-gray-900 text-white"
                                                                : cn(
                                                                    "bg-white border border-gray-200 text-gray-700",
                                                                    msg.isError && "border-red-200 bg-red-50 text-red-700"
                                                                )
                                                        )}>
                                                            {msg.text}
                                                        </div>
                                                        <p className="text-[10px] text-gray-400 mt-1 px-1">
                                                            {formatTime(msg.timestamp)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>

                                    {isLoading && (
                                        <div className="flex justify-start">
                                            <div className="flex gap-2 max-w-[85%]">
                                                <div className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0">
                                                    <Bot size={14} className="text-gray-400" />
                                                </div>
                                                <div className="bg-white border border-gray-200 p-3 rounded-lg">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Suggestions */}
                                {messages.length < 3 && (
                                    <div className="px-4 py-3 bg-white border-t border-gray-100">
                                        <p className="text-xs font-medium text-gray-700 mb-2">Suggested questions:</p>
                                        <div className="space-y-1.5">
                                            {suggestions.slice(0, 5).map((suggestion, i) => {
                                                const Icon = suggestion.icon;
                                                return (
                                                    <button
                                                        key={i}
                                                        onClick={() => handleSuggestionClick(suggestion.text)}
                                                        className="w-full flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs text-gray-700 transition-colors text-left"
                                                    >
                                                        <Icon size={14} className={suggestion.color} />
                                                        <span className="flex-1">{suggestion.text}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {suggestions.length > 5 && (
                                            <button className="w-full text-center text-[10px] text-gray-400 mt-2 hover:text-gray-600">
                                                Show more suggestions
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Input */}
                                <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-200">
                                    <div className="relative">
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            placeholder="Type your message..."
                                            className="w-full pl-3 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                                            disabled={isLoading}
                                        />
                                        <button
                                            type="submit"
                                            disabled={!input.trim() || isLoading}
                                            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-200 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {isLoading ? (
                                                <Loader2 size={16} className="animate-spin" />
                                            ) : (
                                                <Send size={16} />
                                            )}
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-1 mt-2">
                                        <Sparkles size={12} className="text-amber-500" />
                                        <p className="text-[10px] text-gray-400">Powered by AI • Responses are generated</p>
                                    </div>
                                </form>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Chat Button */}
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                    setIsOpen(!isOpen);
                    setIsMinimized(false);
                }}
                className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center shadow-lg transition-all duration-200",
                    isOpen
                        ? "bg-white border border-gray-200 text-gray-900"
                        : "bg-gray-900 text-white hover:bg-gray-800"
                )}
            >
                {isOpen ? <X size={20} /> : <MessageSquare size={20} />}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-white" />
                )}
            </motion.button>
        </div>
    );
};

export default ChatWidget;
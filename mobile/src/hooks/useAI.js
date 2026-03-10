import { useState, useCallback } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

/**
 * Hook to manage AI Assistant features (Chat, RAG, and Study Tools)
 */
export const useAI = () => {
    const [messages, setMessages] = useState([
        {
            id: '1',
            role: 'assistant',
            content: "Hello! I am your Smart UPF Assistant. I can help you with your schedule, grades, cafeteria orders, or even create tasks for you. How can I help you today?",
            timestamp: new Date().toISOString()
        }
    ]);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    /**
     * Send a message to the general AI Assistant
     */
    const sendMessage = async (content) => {
        if (!content.trim()) return;

        // 1. Add user message locally
        const userMsg = {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMsg]);
        setLoading(true);

        try {
            // 2. Call backend
            const response = await api.post('/ai/chat', { message: content });

            // 3. Add AI response
            const aiMsg = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.data.data,
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, aiMsg]);
            return response.data; // Return full data including balance_updated
        } catch (error) {
            console.error('AI Chat Error:', error);
            const errMsg = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "I'm sorry, I'm having trouble connecting to my brain right now. Please try again in a moment.",
                error: true,
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, errMsg]);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Generate a Quiz from a specific course resource
     */
    const generateQuiz = async (resourceId) => {
        try {
            setLoading(true);
            const response = await api.post(`/ai-study/generate-quiz/${resourceId}`);
            return response.data; // { questions, title, etc }
        } catch (error) {
            console.error('Quiz Generation Error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Save quiz results (score, time, etc)
     */
    const saveQuizResult = async (resultData) => {
        try {
            const response = await api.post('/ai-study/save-result', resultData);
            return response.data;
        } catch (error) {
            console.error('Save Result Error:', error);
            throw error;
        }
    };

    return {
        messages,
        loading,
        sendMessage,
        generateQuiz,
        saveQuizResult,
        setMessages
    };
};

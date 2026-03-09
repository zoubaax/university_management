import { useState, useEffect } from 'react';
import api from '../api/api';

/**
 * Hook to manage clubs
 */
export const useClubs = () => {
    const [clubs, setClubs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchClubs = async () => {
        try {
            setLoading(true);
            const response = await api.get('/clubs');
            setClubs(response.data.data);
        } catch (error) {
            console.error('Failed to fetch clubs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClubs();
    }, []);

    const joinClub = async (clubId) => {
        return api.post(`/clubs/${clubId}/join`);
    };

    return { clubs, loading, joinClub, refresh: fetchClubs };
};

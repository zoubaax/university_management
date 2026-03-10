import { useState, useEffect, useCallback } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

/**
 * Hook to manage university clubs and their features
 */
export const useClubs = () => {
    const [clubs, setClubs] = useState([]);
    const [myClubs, setMyClubs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const fetchClubs = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/clubs');
            setClubs(response.data.data || []);

            // If user is a student, we might want to filter or mark clubs they are already in
            // For now, let's just get the full list.
        } catch (error) {
            console.error('Failed to fetch clubs:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user) {
            fetchClubs();
        }
    }, [user, fetchClubs]);

    const getClubDetails = async (clubId) => {
        try {
            const [clubRes, membersRes, eventsRes, galleryRes, broadcastsRes] = await Promise.all([
                api.get(`/clubs/${clubId}`),
                api.get(`/clubs/${clubId}/members`),
                api.get(`/clubs/${clubId}/events`),
                api.get(`/clubs/${clubId}/gallery`),
                api.get(`/clubs/${clubId}/broadcasts`)
            ]);

            return {
                club: clubRes.data.data,
                members: membersRes.data.data,
                events: eventsRes.data.data,
                gallery: galleryRes.data.data,
                broadcasts: broadcastsRes.data.data
            };
        } catch (error) {
            console.error(`Failed to fetch details for club ${clubId}:`, error);
            throw error;
        }
    };

    const joinClub = async (clubId) => {
        try {
            const response = await api.post(`/clubs/${clubId}/join`);
            await fetchClubs(); // Refresh to update member counts or status
            return response.data;
        } catch (error) {
            console.error(`Failed to join club ${clubId}:`, error);
            throw error;
        }
    };

    const rsvpToEvent = async (eventId) => {
        try {
            const response = await api.post(`/clubs/events/${eventId}/rsvp`);
            return response.data;
        } catch (error) {
            console.error(`Failed to RSVP to event ${eventId}:`, error);
            throw error;
        }
    };

    return {
        clubs,
        loading,
        joinClub,
        getClubDetails,
        rsvpToEvent,
        refresh: fetchClubs
    };
};

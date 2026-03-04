import api from '../axios';

class ClubService {
    // Get all clubs
    async getClubs() {
        const response = await api.get('/clubs');
        return response.data;
    }

    // Get a specific club by ID
    async getClub(id) {
        const response = await api.get(`/clubs/${id}`);
        return response.data;
    }

    // Get club profile for logged in Club President
    async getMyClub() {
        const response = await api.get('/clubs/me/profile');
        return response.data;
    }

    // Create a new club (Super Admin / Responsable)
    async createClub(clubData) {
        const response = await api.post('/clubs', clubData);
        return response.data;
    }

    // Update a club (Super Admin / Club President)
    async updateClub(id, clubData) {
        const response = await api.put(`/clubs/${id}`, clubData);
        return response.data;
    }

    // Delete a club
    async deleteClub(id) {
        const response = await api.delete(`/clubs/${id}`);
        return response.data;
    }

    // --- Members ---
    async getClubMembers(clubId) {
        const response = await api.get(`/clubs/${clubId}/members`);
        return response.data;
    }

    async updateMemberStatus(clubId, studentUserId, status) {
        const response = await api.patch(`/clubs/${clubId}/members/${studentUserId}`, { status });
        return response.data;
    }

    async updateMemberRole(clubId, studentUserId, role) {
        const response = await api.patch(`/clubs/${clubId}/members/${studentUserId}/role`, { role });
        return response.data;
    }

    async joinClub(clubId) {
        const response = await api.post(`/clubs/${clubId}/join`);
        return response.data;
    }

    async broadcastMessage(clubId, subject, body) {
        const response = await api.post(`/clubs/${clubId}/broadcast`, { subject, body });
        return response.data;
    }

    async getClubBroadcasts(clubId) {
        const response = await api.get(`/clubs/${clubId}/broadcasts`);
        return response.data;
    }

    // --- Events ---
    async getClubEvents(clubId) {
        const response = await api.get(`/clubs/${clubId}/events`);
        return response.data;
    }

    async createClubEvent(clubId, eventData) {
        const response = await api.post(`/clubs/${clubId}/events`, eventData);
        return response.data;
    }

    async updateClubEvent(clubId, eventId, eventData) {
        const response = await api.put(`/clubs/${clubId}/events/${eventId}`, eventData);
        return response.data;
    }

    async deleteClubEvent(clubId, eventId) {
        const response = await api.delete(`/clubs/${clubId}/events/${eventId}`);
        return response.data;
    }

    async rsvpToEvent(eventId) {
        const response = await api.post(`/clubs/events/${eventId}/rsvp`);
        return response.data;
    }
}

export default new ClubService();

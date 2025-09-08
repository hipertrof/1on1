// API Service for 1-on-1 Manager Frontend
// Handles all communication with the backend API

class ApiService {
    constructor() {
        // Use port 3001 for development, relative path for production
        this.baseUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:3001/api' 
            : '/api';
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || `HTTP ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API request failed: ${endpoint}`, error);
            throw error;
        }
    }

    // Users API
    async getAllUsers() {
        return await this.request('/users');
    }

    async getUserById(userId) {
        return await this.request(`/users/${userId}`);
    }

    async createUser(userData) {
        return await this.request('/users', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    // Meetings API
    async getAllMeetings() {
        return await this.request('/meetings');
    }

    async getMeetingsByTeamMember(teamMemberId) {
        return await this.request(`/meetings?teamMemberId=${teamMemberId}`);
    }

    async getMeetingById(meetingId) {
        return await this.request(`/meetings/${meetingId}`);
    }

    async createMeeting(meetingData) {
        return await this.request('/meetings', {
            method: 'POST',
            body: JSON.stringify(meetingData)
        });
    }

    async updateMeeting(meetingId, updates) {
        return await this.request(`/meetings/${meetingId}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
    }

    // Action Items API
    async getActionItemsByMeeting(meetingId) {
        return await this.request(`/meetings/${meetingId}/actions`);
    }

    async createActionItem(meetingId, actionData) {
        return await this.request(`/meetings/${meetingId}/actions`, {
            method: 'POST',
            body: JSON.stringify(actionData)
        });
    }

    async updateActionItem(actionId, updates) {
        return await this.request(`/actions/${actionId}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
    }

    async getActionItemsByUser(userId) {
        return await this.request(`/users/${userId}/actions`);
    }

    // Health check
    async getHealth() {
        return await this.request('/health');
    }
}

// Export singleton instance
const apiService = new ApiService();
window.apiService = apiService;
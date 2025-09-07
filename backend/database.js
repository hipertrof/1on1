const { kv } = require('@vercel/kv');
const { v4: uuidv4 } = require('uuid');

// Database service for 1-on-1 Manager
// Uses Vercel KV (Redis-like key-value store) for data persistence

class DatabaseService {
    constructor() {
        // Fallback to in-memory storage for local development
        this.fallbackStorage = new Map();
        this.useFallback = !process.env.KV_REST_API_URL;
    }

    async get(key) {
        if (this.useFallback) {
            return this.fallbackStorage.get(key) || null;
        }
        return await kv.get(key);
    }

    async set(key, value) {
        if (this.useFallback) {
            this.fallbackStorage.set(key, value);
            return 'OK';
        }
        return await kv.set(key, value);
    }

    async del(key) {
        if (this.useFallback) {
            return this.fallbackStorage.delete(key);
        }
        return await kv.del(key);
    }

    async keys(pattern) {
        if (this.useFallback) {
            return Array.from(this.fallbackStorage.keys()).filter(key => 
                key.includes(pattern.replace('*', ''))
            );
        }
        return await kv.keys(pattern);
    }

    // User Management
    async createUser(userData) {
        const userId = uuidv4();
        const user = {
            id: userId,
            name: userData.name,
            email: userData.email,
            position: userData.position,
            accessLevel: userData.accessLevel || 'direct-report',
            createdAt: new Date().toISOString(),
            isActive: true
        };
        
        await this.set(`user:${userId}`, user);
        await this.set(`user:email:${userData.email}`, userId);
        return user;
    }

    async getUserById(userId) {
        return await this.get(`user:${userId}`);
    }

    async getUserByEmail(email) {
        const userId = await this.get(`user:email:${email}`);
        if (!userId) return null;
        return await this.getUserById(userId);
    }

    async getAllUsers() {
        const userKeys = await this.keys('user:*');
        const users = [];
        
        for (const key of userKeys) {
            if (!key.includes('email:')) {
                const user = await this.get(key);
                if (user) users.push(user);
            }
        }
        
        return users;
    }

    // Meeting Management
    async createMeeting(meetingData) {
        const meetingId = uuidv4();
        const meeting = {
            id: meetingId,
            teamMemberId: meetingData.teamMemberId,
            managerId: meetingData.managerId,
            date: meetingData.date,
            status: 'scheduled',
            discussionPoints: meetingData.discussionPoints || [],
            standardQuestions: this.getDefaultStandardQuestions(),
            transcriptFileName: null,
            notes: '',
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString()
        };

        await this.set(`meeting:${meetingId}`, meeting);
        
        // Index by team member for easier retrieval
        const memberMeetings = await this.getMeetingsByTeamMember(meetingData.teamMemberId) || [];
        memberMeetings.push(meetingId);
        await this.set(`meetings:member:${meetingData.teamMemberId}`, memberMeetings);
        
        return meeting;
    }

    async getMeetingById(meetingId) {
        return await this.get(`meeting:${meetingId}`);
    }

    async updateMeeting(meetingId, updates) {
        const meeting = await this.getMeetingById(meetingId);
        if (!meeting) return null;

        const updatedMeeting = {
            ...meeting,
            ...updates,
            lastModified: new Date().toISOString()
        };

        await this.set(`meeting:${meetingId}`, updatedMeeting);
        return updatedMeeting;
    }

    async getMeetingsByTeamMember(teamMemberId) {
        const meetingIds = await this.get(`meetings:member:${teamMemberId}`) || [];
        const meetings = [];
        
        for (const meetingId of meetingIds) {
            const meeting = await this.getMeetingById(meetingId);
            if (meeting) meetings.push(meeting);
        }
        
        return meetings.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    async getAllMeetings() {
        const meetingKeys = await this.keys('meeting:*');
        const meetings = [];
        
        for (const key of meetingKeys) {
            const meeting = await this.get(key);
            if (meeting) meetings.push(meeting);
        }
        
        return meetings.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    // Action Items Management
    async createActionItem(actionItemData) {
        const actionId = uuidv4();
        const actionItem = {
            id: actionId,
            meetingId: actionItemData.meetingId,
            description: actionItemData.description,
            assignee: actionItemData.assignee,
            assigneeId: actionItemData.assigneeId,
            completed: false,
            createdAt: new Date().toISOString(),
            completedAt: null
        };

        await this.set(`action:${actionId}`, actionItem);
        
        // Index by meeting and assignee
        const meetingActions = await this.get(`actions:meeting:${actionItemData.meetingId}`) || [];
        meetingActions.push(actionId);
        await this.set(`actions:meeting:${actionItemData.meetingId}`, meetingActions);
        
        if (actionItemData.assigneeId) {
            const userActions = await this.get(`actions:user:${actionItemData.assigneeId}`) || [];
            userActions.push(actionId);
            await this.set(`actions:user:${actionItemData.assigneeId}`, userActions);
        }
        
        return actionItem;
    }

    async updateActionItem(actionId, updates) {
        const actionItem = await this.get(`action:${actionId}`);
        if (!actionItem) return null;

        const updatedAction = {
            ...actionItem,
            ...updates
        };

        if (updates.completed && !actionItem.completed) {
            updatedAction.completedAt = new Date().toISOString();
        } else if (!updates.completed && actionItem.completed) {
            updatedAction.completedAt = null;
        }

        await this.set(`action:${actionId}`, updatedAction);
        return updatedAction;
    }

    async getActionItemsByMeeting(meetingId) {
        const actionIds = await this.get(`actions:meeting:${meetingId}`) || [];
        const actions = [];
        
        for (const actionId of actionIds) {
            const action = await this.get(`action:${actionId}`);
            if (action) actions.push(action);
        }
        
        return actions;
    }

    async getActionItemsByUser(userId) {
        const actionIds = await this.get(`actions:user:${userId}`) || [];
        const actions = [];
        
        for (const actionId of actionIds) {
            const action = await this.get(`action:${actionId}`);
            if (action) actions.push(action);
        }
        
        return actions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Default standard questions
    getDefaultStandardQuestions() {
        return [
            {
                id: 'std_q1',
                text: 'What important meetings are happening this week?',
                completed: false,
                notes: ''
            },
            {
                id: 'std_q2',
                text: 'Is there anything that needs to be shared with the wider team?',
                completed: false,
                notes: ''
            },
            {
                id: 'std_q3',
                text: 'Where do you need my help/assistance?',
                completed: false,
                notes: ''
            }
        ];
    }

    // Initialize sample data for demo
    async initializeSampleData() {
        // Check if data already exists
        const existingUsers = await this.getAllUsers();
        if (existingUsers.length > 0) return;

        // Create manager user
        const manager = await this.createUser({
            name: 'Digital Products Director',
            email: 'director@company.com',
            position: 'Director',
            accessLevel: 'manager'
        });

        // Create sample team members
        const teamMembers = [
            { name: 'Emily Johnson', email: 'emily.johnson@company.com', position: 'Senior Product Manager' },
            { name: 'Michael Chen', email: 'michael.chen@company.com', position: 'Product Manager' },
            { name: 'Sarah Wilson', email: 'sarah.wilson@company.com', position: 'Senior Product Manager' },
            { name: 'David Rodriguez', email: 'david.rodriguez@company.com', position: 'Product Manager' },
            { name: 'Lisa Park', email: 'lisa.park@company.com', position: 'Senior Product Manager' },
            { name: 'James Thompson', email: 'james.thompson@company.com', position: 'Product Manager' },
            { name: 'Anna Martinez', email: 'anna.martinez@company.com', position: 'Product Manager' },
            { name: 'Robert Kim', email: 'robert.kim@company.com', position: 'Senior Product Manager' }
        ];

        const createdTeamMembers = [];
        for (const memberData of teamMembers) {
            const member = await this.createUser({
                ...memberData,
                accessLevel: 'direct-report'
            });
            createdTeamMembers.push(member);
        }

        // Create a sample meeting with Emily Johnson
        const emilyMeeting = await this.createMeeting({
            teamMemberId: createdTeamMembers[0].id,
            managerId: manager.id,
            date: new Date().toISOString()
        });

        console.log('Sample data initialized:', {
            manager: manager.name,
            teamMembers: createdTeamMembers.length,
            sampleMeeting: emilyMeeting.id
        });
    }
}

// Export singleton instance
const db = new DatabaseService();
module.exports = db;
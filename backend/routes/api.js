const express = require('express');
const db = require('../database');

const router = express.Router();

// Initialize sample data on first run
db.initializeSampleData().catch(console.error);

// Users API
router.get('/users', async (req, res) => {
    try {
        const users = await db.getAllUsers();
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

router.get('/users/:userId', async (req, res) => {
    try {
        const user = await db.getUserById(req.params.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

router.post('/users', async (req, res) => {
    try {
        const { name, email, position, accessLevel } = req.body;
        
        // Check if user already exists
        const existingUser = await db.getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }
        
        const user = await db.createUser({ name, email, position, accessLevel });
        res.status(201).json(user);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// Meetings API
router.get('/meetings', async (req, res) => {
    try {
        const { teamMemberId } = req.query;
        
        let meetings;
        if (teamMemberId) {
            meetings = await db.getMeetingsByTeamMember(teamMemberId);
        } else {
            meetings = await db.getAllMeetings();
        }
        
        res.json(meetings);
    } catch (error) {
        console.error('Error fetching meetings:', error);
        res.status(500).json({ error: 'Failed to fetch meetings' });
    }
});

router.get('/meetings/:meetingId', async (req, res) => {
    try {
        const meeting = await db.getMeetingById(req.params.meetingId);
        if (!meeting) {
            return res.status(404).json({ error: 'Meeting not found' });
        }
        res.json(meeting);
    } catch (error) {
        console.error('Error fetching meeting:', error);
        res.status(500).json({ error: 'Failed to fetch meeting' });
    }
});

router.post('/meetings', async (req, res) => {
    try {
        const { teamMemberId, managerId, date, discussionPoints } = req.body;
        
        const meeting = await db.createMeeting({
            teamMemberId,
            managerId,
            date: date || new Date().toISOString(),
            discussionPoints: discussionPoints || []
        });
        
        res.status(201).json(meeting);
    } catch (error) {
        console.error('Error creating meeting:', error);
        res.status(500).json({ error: 'Failed to create meeting' });
    }
});

router.put('/meetings/:meetingId', async (req, res) => {
    try {
        const updates = req.body;
        const meeting = await db.updateMeeting(req.params.meetingId, updates);
        
        if (!meeting) {
            return res.status(404).json({ error: 'Meeting not found' });
        }
        
        res.json(meeting);
    } catch (error) {
        console.error('Error updating meeting:', error);
        res.status(500).json({ error: 'Failed to update meeting' });
    }
});

// Action Items API
router.get('/meetings/:meetingId/actions', async (req, res) => {
    try {
        const actions = await db.getActionItemsByMeeting(req.params.meetingId);
        res.json(actions);
    } catch (error) {
        console.error('Error fetching action items:', error);
        res.status(500).json({ error: 'Failed to fetch action items' });
    }
});

router.post('/meetings/:meetingId/actions', async (req, res) => {
    try {
        const { description, assignee, assigneeId } = req.body;
        
        const actionItem = await db.createActionItem({
            meetingId: req.params.meetingId,
            description,
            assignee,
            assigneeId
        });
        
        res.status(201).json(actionItem);
    } catch (error) {
        console.error('Error creating action item:', error);
        res.status(500).json({ error: 'Failed to create action item' });
    }
});

router.put('/actions/:actionId', async (req, res) => {
    try {
        const updates = req.body;
        const actionItem = await db.updateActionItem(req.params.actionId, updates);
        
        if (!actionItem) {
            return res.status(404).json({ error: 'Action item not found' });
        }
        
        res.json(actionItem);
    } catch (error) {
        console.error('Error updating action item:', error);
        res.status(500).json({ error: 'Failed to update action item' });
    }
});

// User's action items
router.get('/users/:userId/actions', async (req, res) => {
    try {
        const actions = await db.getActionItemsByUser(req.params.userId);
        res.json(actions);
    } catch (error) {
        console.error('Error fetching user action items:', error);
        res.status(500).json({ error: 'Failed to fetch action items' });
    }
});

// Health check
router.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: '1-on-1 Manager API is running',
        database: db.useFallback ? 'fallback' : 'vercel-kv',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
// Main application JavaScript
class OneOnOneManager {
    constructor() {
        this.currentUser = null;
        this.teamMembers = [
            { id: 1, name: 'Sarah Chen', email: 'sarah.chen@company.com', position: 'Senior Product Manager', nextMeeting: '2025-09-08 14:00', status: 'active', accessLevel: 'direct-report', invitedAt: '2025-09-01', joinedAt: '2025-09-01' },
            { id: 2, name: 'Mike Rodriguez', email: 'mike.rodriguez@company.com', position: 'Product Manager', nextMeeting: '2025-09-08 15:30', status: 'active', accessLevel: 'direct-report', invitedAt: '2025-09-01', joinedAt: '2025-09-01' },
            { id: 3, name: 'Emily Johnson', email: 'emily.johnson@company.com', position: 'Product Manager', nextMeeting: '2025-09-09 10:00', status: 'active', accessLevel: 'direct-report', invitedAt: '2025-09-01', joinedAt: '2025-09-01' },
            { id: 4, name: 'David Kim', email: 'david.kim@company.com', position: 'Senior Product Manager', nextMeeting: '2025-09-09 14:00', status: 'active', accessLevel: 'direct-report', invitedAt: '2025-09-01', joinedAt: '2025-09-01' },
            { id: 5, name: 'Lisa Thompson', email: 'lisa.thompson@company.com', position: 'Product Manager', nextMeeting: '2025-09-10 11:00', status: 'active', accessLevel: 'direct-report', invitedAt: '2025-09-01', joinedAt: '2025-09-01' },
            { id: 6, name: 'James Wilson', email: 'james.wilson@company.com', position: 'Product Manager', nextMeeting: '2025-09-10 15:00', status: 'active', accessLevel: 'direct-report', invitedAt: '2025-09-01', joinedAt: '2025-09-01' },
            { id: 7, name: 'Maria Garcia', email: 'maria.garcia@company.com', position: 'Senior Product Manager', nextMeeting: '2025-09-11 13:00', status: 'active', accessLevel: 'direct-report', invitedAt: '2025-09-01', joinedAt: '2025-09-01' },
            { id: 8, name: 'Robert Brown', email: 'robert.brown@company.com', position: 'Product Manager', nextMeeting: '2025-09-11 16:00', status: 'active', accessLevel: 'direct-report', invitedAt: '2025-09-01', joinedAt: '2025-09-01' }
        ];
        this.pendingInvitations = [];
        this.meetings = [];
        this.tasks = [];
        this.accessSettings = {
            allowAgendaItems: true,
            autoEmailSummaries: true,
            readonlyDashboardAccess: true
        };
        
        // Initialize Phase 2 components
        this.meetingSession = null;
        this.roadmapManager = new RoadmapManager(this);
        this.integrationManager = new IntegrationManager(this);
        this.analyticsManager = new AnalyticsManager(this);
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadInitialData();
        this.showPage('dashboard');
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                this.showPage(page);
            });
        });

        // Modal controls
        const meetingModal = document.getElementById('meeting-modal');
        const inviteModal = document.getElementById('invite-modal');
        
        // Meeting modal
        const meetingCloseBtn = meetingModal.querySelector('.close');
        const cancelMeetingBtn = document.getElementById('cancel-meeting');
        
        meetingCloseBtn.addEventListener('click', () => this.hideModal('meeting-modal'));
        cancelMeetingBtn.addEventListener('click', () => this.hideModal('meeting-modal'));
        
        meetingModal.addEventListener('click', (e) => {
            if (e.target === meetingModal) {
                this.hideModal('meeting-modal');
            }
        });

        // Invite modal
        const inviteCloseBtn = inviteModal.querySelector('.close');
        const cancelInviteBtn = document.getElementById('cancel-invite');
        
        inviteCloseBtn.addEventListener('click', () => this.hideModal('invite-modal'));
        cancelInviteBtn.addEventListener('click', () => this.hideModal('invite-modal'));
        
        inviteModal.addEventListener('click', (e) => {
            if (e.target === inviteModal) {
                this.hideModal('invite-modal');
            }
        });

        // New meeting button
        document.getElementById('new-meeting-btn').addEventListener('click', () => {
            this.showNewMeetingModal();
        });

        // Schedule meeting button
        document.getElementById('schedule-meeting-btn').addEventListener('click', () => {
            this.showNewMeetingModal();
        });

        // Add discussion point button
        document.getElementById('add-discussion-point').addEventListener('click', () => {
            this.addDiscussionPoint();
        });

        // Meeting form submission
        document.getElementById('meeting-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveMeeting();
        });

        // Team management buttons
        document.getElementById('invite-member-btn').addEventListener('click', () => {
            this.showInviteModal();
        });

        // Invite form submission
        document.getElementById('invite-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendInvitation();
        });

        // Access settings
        document.getElementById('save-access-settings').addEventListener('click', () => {
            this.saveAccessSettings();
        });

        // Team filters
        document.getElementById('team-search').addEventListener('input', () => {
            this.filterTeamMembers();
        });

        document.getElementById('team-status-filter').addEventListener('change', () => {
            this.filterTeamMembers();
        });

        document.getElementById('team-position-filter').addEventListener('change', () => {
            this.filterTeamMembers();
        });

        document.getElementById('team-access-filter').addEventListener('change', () => {
            this.filterTeamMembers();
        });
    }

    showPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Remove active class from nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Show selected page
        document.getElementById(`${pageId}-page`).classList.add('active');
        
        // Add active class to corresponding nav link
        document.querySelector(`[data-page="${pageId}"]`).classList.add('active');

        // Load page-specific content
        this.loadPageContent(pageId);
    }

    loadPageContent(pageId) {
        switch(pageId) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'meetings':
                this.loadMeetings();
                break;
            case 'team':
                this.loadTeamManagement();
                break;
            case 'roadmap':
                this.loadRoadmap();
                break;
            case 'reports':
                this.loadReports();
                break;
            case 'meeting-session':
                // Meeting session is handled separately
                break;
        }
    }

    loadDashboard() {
        // Load upcoming meetings
        this.loadUpcomingMeetings();
        
        // Load my tasks
        this.loadMyTasks();
        
        // Load team overview
        this.loadTeamOverview();
    }

    loadUpcomingMeetings() {
        const container = document.getElementById('upcoming-meetings');
        
        if (this.meetings.length === 0) {
            container.innerHTML = `
                <div class="meeting-item">
                    <div class="meeting-info">
                        <h4>No upcoming meetings</h4>
                        <p>Click "New Meeting" to schedule your first 1-on-1</p>
                    </div>
                </div>
            `;
            return;
        }

        const upcomingMeetings = this.meetings
            .filter(meeting => new Date(meeting.date) > new Date())
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 5);

        container.innerHTML = upcomingMeetings.map(meeting => {
            const teamMember = this.teamMembers.find(tm => tm.id === meeting.teamMemberId);
            const meetingDate = new Date(meeting.date);
            
            return `
                <div class="meeting-item">
                    <div class="meeting-info">
                        <h4>${teamMember ? teamMember.name : 'Unknown'}</h4>
                        <p>${meetingDate.toLocaleDateString()} at ${meetingDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                    <div class="meeting-actions">
                        <button class="btn-primary" onclick="app.startMeeting(${meeting.id})">Start</button>
                        <button class="btn-secondary" onclick="app.editMeeting(${meeting.id})">Edit</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    loadMyTasks() {
        const container = document.getElementById('my-tasks');
        
        if (this.tasks.length === 0) {
            container.innerHTML = `
                <div class="task-item">
                    <label>No action items yet</label>
                </div>
            `;
            return;
        }

        const myTasks = this.tasks.filter(task => task.assigneeId === 'manager');
        
        container.innerHTML = myTasks.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''}">
                <input type="checkbox" ${task.completed ? 'checked' : ''} 
                       onchange="app.toggleTask(${task.id})">
                <label>${task.description}</label>
                <span class="task-due">${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : ''}</span>
            </div>
        `).join('');
    }

    loadTeamOverview() {
        const container = document.getElementById('team-overview');
        
        container.innerHTML = this.teamMembers.map(member => {
            const nextMeeting = new Date(member.nextMeeting);
            
            return `
                <div class="team-member-card" onclick="app.viewMemberHistory(${member.id})">
                    <h4>${member.name}</h4>
                    <p>${member.position}</p>
                    <div class="next-meeting">
                        Next: ${nextMeeting.toLocaleDateString()} ${nextMeeting.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                </div>
            `;
        }).join('');
    }

    loadMeetings() {
        // Populate team member filter
        const filter = document.getElementById('team-member-filter');
        filter.innerHTML = '<option value="">All Team Members</option>' +
            this.teamMembers.map(member => 
                `<option value="${member.id}">${member.name}</option>`
            ).join('');

        // Load meetings list
        this.loadMeetingsList();
    }

    loadMeetingsList() {
        const container = document.getElementById('meetings-list');
        
        if (this.meetings.length === 0) {
            container.innerHTML = `
                <div class="card">
                    <h3>No meetings scheduled</h3>
                    <p>Schedule your first 1-on-1 meeting to get started.</p>
                    <button class="btn-primary" onclick="app.showNewMeetingModal()">Schedule Meeting</button>
                </div>
            `;
            return;
        }

        const sortedMeetings = this.meetings.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        container.innerHTML = sortedMeetings.map(meeting => {
            const teamMember = this.teamMembers.find(tm => tm.id === meeting.teamMemberId);
            const meetingDate = new Date(meeting.date);
            const isPast = meetingDate < new Date();
            
            return `
                <div class="card">
                    <div class="meeting-header">
                        <h3>${teamMember ? teamMember.name : 'Unknown'}</h3>
                        <div class="meeting-meta">
                            <span class="meeting-date">${meetingDate.toLocaleDateString()} at ${meetingDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            <span class="meeting-status ${isPast ? 'completed' : 'upcoming'}">${isPast ? 'Completed' : 'Upcoming'}</span>
                        </div>
                    </div>
                    <div class="meeting-agenda">
                        ${meeting.discussionPoints ? meeting.discussionPoints.map(point => 
                            `<div class="agenda-item">
                                <input type="checkbox" ${point.completed ? 'checked' : ''} disabled>
                                <span>${point.text}</span>
                            </div>`
                        ).join('') : ''}
                    </div>
                    <div class="meeting-actions">
                        ${!isPast ? 
                            `<button class="btn-primary" onclick="app.startMeeting(${meeting.id})">Start Meeting</button>` :
                            `<button class="btn-secondary" onclick="app.viewMeetingNotes(${meeting.id})">View Notes</button>`
                        }
                        <button class="btn-secondary" onclick="app.editMeeting(${meeting.id})">Edit</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    loadRoadmap() {
        this.roadmapManager.setupEventListeners();
        this.roadmapManager.renderRoadmap();
    }

    loadReports() {
        // Load detailed analytics
        this.loadDetailedAnalytics();
        
        // Update integration status
        this.integrationManager.updateIntegrationUI();
        
        // Start auto-sync if connected
        this.integrationManager.startAutoSync();
    }

    loadDetailedAnalytics() {
        const analytics = this.analyticsManager.generateAnalytics();
        const metrics = this.analyticsManager.generateDashboardMetrics();
        
        // Update detailed meeting stats
        const meetingStatsContainer = document.getElementById('detailed-meeting-stats');
        if (meetingStatsContainer) {
            meetingStatsContainer.innerHTML = `
                <div class="stat-row">
                    <span>Total Meetings:</span>
                    <span>${metrics.totalMeetings}</span>
                </div>
                <div class="stat-row">
                    <span>This Week:</span>
                    <span>${metrics.meetingsThisWeek}</span>
                </div>
                <div class="stat-row">
                    <span>Completed:</span>
                    <span>${metrics.completedMeetings}</span>
                </div>
                <div class="stat-row">
                    <span>Average Duration:</span>
                    <span>${this.analyticsManager.calculateAverageDuration(this.meetings)} min</span>
                </div>
                <div class="stat-row">
                    <span>Meeting Frequency:</span>
                    <span>${analytics.meetingFrequency}/week</span>
                </div>
            `;
        }
        
        // Update action items overview
        const actionItemsContainer = document.getElementById('action-items-overview');
        if (actionItemsContainer) {
            actionItemsContainer.innerHTML = `
                <div class="stat-row">
                    <span>Total Action Items:</span>
                    <span>${analytics.actionItemAnalysis.total}</span>
                </div>
                <div class="stat-row">
                    <span>Completed:</span>
                    <span>${analytics.actionItemAnalysis.completed}</span>
                </div>
                <div class="stat-row">
                    <span>Overdue:</span>
                    <span>${analytics.actionItemAnalysis.overdue}</span>
                </div>
                <div class="stat-row">
                    <span>My Tasks:</span>
                    <span>${analytics.actionItemAnalysis.byAssignee.manager}</span>
                </div>
                <div class="stat-row">
                    <span>Team Tasks:</span>
                    <span>${analytics.actionItemAnalysis.byAssignee.directReport}</span>
                </div>
            `;
        }
        
        // Update team performance
        const teamPerformanceContainer = document.getElementById('team-performance-stats');
        if (teamPerformanceContainer) {
            const avgEngagement = analytics.teamPerformance.reduce((sum, member) => sum + member.engagementScore, 0) / analytics.teamPerformance.length;
            
            teamPerformanceContainer.innerHTML = `
                <div class="stat-row">
                    <span>Team Size:</span>
                    <span>${metrics.teamSize}</span>
                </div>
                <div class="stat-row">
                    <span>Active Members:</span>
                    <span>${metrics.activeTeamMembers}</span>
                </div>
                <div class="stat-row">
                    <span>Average Engagement:</span>
                    <span>${Math.round(avgEngagement)}%</span>
                </div>
                <div class="stat-row">
                    <span>Overall Completion Rate:</span>
                    <span>${metrics.completionRate}%</span>
                </div>
            `;
        }
    }

    showNewMeetingModal() {
        const modal = document.getElementById('meeting-modal');
        const form = document.getElementById('meeting-form');
        const teamMemberSelect = document.getElementById('team-member');
        
        // Reset form
        form.reset();
        
        // Populate team members
        teamMemberSelect.innerHTML = '<option value="">Select team member...</option>' +
            this.teamMembers.map(member => 
                `<option value="${member.id}">${member.name}</option>`
            ).join('');

        // Set default date to next Monday
        const nextMonday = this.getNextMonday();
        document.getElementById('meeting-date').value = nextMonday.toISOString().slice(0, 16);

        // Clear discussion points
        document.getElementById('discussion-points-container').innerHTML = '';

        modal.classList.add('active');
    }

    getNextMonday() {
        const today = new Date();
        const daysUntilMonday = (8 - today.getDay()) % 7 || 7;
        const nextMonday = new Date(today);
        nextMonday.setDate(today.getDate() + daysUntilMonday);
        nextMonday.setHours(10, 0, 0, 0); // Default to 10 AM
        return nextMonday;
    }

    hideModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }

    addDiscussionPoint() {
        const container = document.getElementById('discussion-points-container');
        const pointDiv = document.createElement('div');
        pointDiv.className = 'discussion-point';
        pointDiv.innerHTML = `
            <input type="text" placeholder="Enter discussion point..." required>
            <button type="button" onclick="this.parentElement.remove()">Remove</button>
        `;
        container.appendChild(pointDiv);
    }

    saveMeeting() {
        const form = document.getElementById('meeting-form');
        const formData = new FormData(form);
        
        const teamMemberId = parseInt(document.getElementById('team-member').value);
        const meetingDate = document.getElementById('meeting-date').value;
        
        // Get discussion points
        const discussionPoints = Array.from(document.querySelectorAll('.discussion-point input'))
            .map(input => ({ text: input.value, completed: false }))
            .filter(point => point.text.trim());

        const meeting = {
            id: Date.now(),
            teamMemberId,
            date: meetingDate,
            discussionPoints,
            standardQuestions: [
                { text: 'What important meetings are happening this week?', completed: false },
                { text: 'Is there anything that needs to be shared with the wider team?', completed: false },
                { text: 'Where do you need my help/assistance?', completed: false }
            ],
            notes: '',
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.meetings.push(meeting);
        this.hideModal('meeting-modal');
        this.showPage('dashboard'); // Refresh dashboard
        
        // Show success message
        this.showNotification('Meeting scheduled successfully!');
    }

    showNotification(message) {
        // Simple notification - can be enhanced later
        alert(message);
    }

    loadInitialData() {
        // Load any saved data from localStorage
        const savedMeetings = localStorage.getItem('meetings');
        const savedTasks = localStorage.getItem('tasks');
        const savedTeamMembers = localStorage.getItem('teamMembers');
        const savedPendingInvitations = localStorage.getItem('pendingInvitations');
        const savedAccessSettings = localStorage.getItem('accessSettings');
        
        if (savedMeetings) {
            this.meetings = JSON.parse(savedMeetings);
        }
        
        if (savedTasks) {
            this.tasks = JSON.parse(savedTasks);
        }

        if (savedTeamMembers) {
            this.teamMembers = JSON.parse(savedTeamMembers);
        }

        if (savedPendingInvitations) {
            this.pendingInvitations = JSON.parse(savedPendingInvitations);
        }

        if (savedAccessSettings) {
            this.accessSettings = JSON.parse(savedAccessSettings);
        }
    }

    saveData() {
        localStorage.setItem('meetings', JSON.stringify(this.meetings));
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
        localStorage.setItem('teamMembers', JSON.stringify(this.teamMembers));
        localStorage.setItem('pendingInvitations', JSON.stringify(this.pendingInvitations));
        localStorage.setItem('accessSettings', JSON.stringify(this.accessSettings));
    }

    // Meeting session functionality
    startMeeting(meetingId) {
        // Initialize meeting session
        this.meetingSession = new MeetingSession(this, meetingId);
        
        // Show meeting session page
        this.showPage('meeting-session');
    }

    editMeeting(meetingId) {
        console.log('Editing meeting:', meetingId);
        // TODO: Implement edit functionality
    }

    viewMemberHistory(memberId) {
        console.log('Viewing member history:', memberId);
        // TODO: Implement member history view
    }

    viewMeetingNotes(meetingId) {
        console.log('Viewing meeting notes:', meetingId);
        // TODO: Implement notes viewer
    }

    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveData();
            this.loadMyTasks();
        }
    }

    // Team Management Methods
    loadTeamManagement() {
        this.loadTeamMembersList();
        this.loadPendingInvitations();
        this.loadAccessSettings();
    }

    loadTeamMembersList() {
        const container = document.getElementById('team-members-list');
        
        if (this.teamMembers.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h4>No team members</h4>
                    <p>Invite your first team member to get started.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.getFilteredTeamMembers().map(member => `
            <div class="team-member-row" data-member-id="${member.id}">
                <div class="member-info">
                    <h4>${member.name}</h4>
                    <div class="member-details">
                        <div class="member-details-row">
                            <span><strong>Position:</strong> ${member.position}</span>
                            <span class="member-status ${member.status}">${member.status}</span>
                        </div>
                        <div class="member-details-row">
                            <span><strong>Email:</strong> ${member.email}</span>
                            <span><strong>Access:</strong> ${member.accessLevel.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                        </div>
                        <div class="member-details-row">
                            <span><strong>Joined:</strong> ${member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : 'N/A'}</span>
                            <span><strong>Last Meeting:</strong> ${this.getLastMeetingDate(member.id)}</span>
                        </div>
                    </div>
                </div>
                <div class="member-actions">
                    <button class="btn-secondary" onclick="app.viewMemberHistory(${member.id})">History</button>
                    <button class="btn-secondary" onclick="app.editMemberAccess(${member.id})">Edit Access</button>
                    <button class="btn-secondary" onclick="app.removeMember(${member.id})">Remove</button>
                </div>
            </div>
        `).join('');
    }

    loadPendingInvitations() {
        const container = document.getElementById('pending-invitations');
        
        if (this.pendingInvitations.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h4>No pending invitations</h4>
                    <p>All team members have accepted their invitations.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.pendingInvitations.map(invitation => `
            <div class="invitation-item">
                <div class="invitation-info">
                    <h4>${invitation.name}</h4>
                    <p>Invited: ${new Date(invitation.invitedAt).toLocaleDateString()} | ${invitation.email}</p>
                </div>
                <div class="invitation-actions">
                    <button class="btn-primary" onclick="app.resendInvitation(${invitation.id})">Resend</button>
                    <button class="btn-secondary" onclick="app.cancelInvitation(${invitation.id})">Cancel</button>
                </div>
            </div>
        `).join('');
    }

    loadAccessSettings() {
        document.getElementById('allow-agenda-items').checked = this.accessSettings.allowAgendaItems;
        document.getElementById('auto-email-summaries').checked = this.accessSettings.autoEmailSummaries;
        document.getElementById('readonly-dashboard-access').checked = this.accessSettings.readonlyDashboardAccess;
    }

    showInviteModal() {
        const modal = document.getElementById('invite-modal');
        const form = document.getElementById('invite-form');
        
        // Reset form
        form.reset();
        
        modal.classList.add('active');
    }

    sendInvitation() {
        const name = document.getElementById('member-name').value;
        const email = document.getElementById('member-email').value;
        const position = document.getElementById('member-position').value;
        const accessLevel = document.getElementById('access-level').value;
        const message = document.getElementById('invitation-message').value;

        const invitation = {
            id: Date.now(),
            name,
            email,
            position,
            accessLevel,
            message,
            invitedAt: new Date().toISOString(),
            status: 'pending'
        };

        this.pendingInvitations.push(invitation);
        this.saveData();
        this.hideModal('invite-modal');
        this.loadPendingInvitations();
        
        // Simulate sending email (in real app, this would call your email service)
        this.showNotification(`Invitation sent to ${email}!`);
    }

    saveAccessSettings() {
        this.accessSettings.allowAgendaItems = document.getElementById('allow-agenda-items').checked;
        this.accessSettings.autoEmailSummaries = document.getElementById('auto-email-summaries').checked;
        this.accessSettings.readonlyDashboardAccess = document.getElementById('readonly-dashboard-access').checked;
        
        this.saveData();
        this.showNotification('Access settings saved successfully!');
    }

    // Placeholder methods for team management actions
    editMemberAccess(memberId) {
        console.log('Editing member access:', memberId);
        // TODO: Implement access level editing
    }

    removeMember(memberId) {
        const member = this.teamMembers.find(m => m.id === memberId);
        if (member && confirm(`Are you sure you want to remove ${member.name} from your team?`)) {
            this.teamMembers = this.teamMembers.filter(m => m.id !== memberId);
            this.saveData();
            this.loadTeamMembersList();
            this.showNotification(`${member.name} has been removed from your team.`);
        }
    }

    resendInvitation(invitationId) {
        const invitation = this.pendingInvitations.find(i => i.id === invitationId);
        if (invitation) {
            // Update invited date
            invitation.invitedAt = new Date().toISOString();
            this.saveData();
            this.loadPendingInvitations();
            this.showNotification(`Invitation resent to ${invitation.email}!`);
        }
    }

    cancelInvitation(invitationId) {
        const invitation = this.pendingInvitations.find(i => i.id === invitationId);
        if (invitation && confirm(`Cancel invitation for ${invitation.name}?`)) {
            this.pendingInvitations = this.pendingInvitations.filter(i => i.id !== invitationId);
            this.saveData();
            this.loadPendingInvitations();
            this.showNotification(`Invitation for ${invitation.name} has been cancelled.`);
        }
    }

    // Team filtering functionality
    getFilteredTeamMembers() {
        const searchTerm = document.getElementById('team-search')?.value.toLowerCase() || '';
        const statusFilter = document.getElementById('team-status-filter')?.value || '';
        const positionFilter = document.getElementById('team-position-filter')?.value || '';
        const accessFilter = document.getElementById('team-access-filter')?.value || '';

        return this.teamMembers.filter(member => {
            const matchesSearch = !searchTerm || 
                member.name.toLowerCase().includes(searchTerm) ||
                member.position.toLowerCase().includes(searchTerm) ||
                member.email.toLowerCase().includes(searchTerm);
            
            const matchesStatus = !statusFilter || member.status === statusFilter;
            const matchesPosition = !positionFilter || member.position === positionFilter;
            const matchesAccess = !accessFilter || member.accessLevel === accessFilter;

            return matchesSearch && matchesStatus && matchesPosition && matchesAccess;
        });
    }

    filterTeamMembers() {
        this.loadTeamMembersList();
    }

    getLastMeetingDate(memberId) {
        const memberMeetings = this.meetings
            .filter(m => m.teamMemberId === memberId && m.completed)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (memberMeetings.length === 0) return 'Never';
        
        return new Date(memberMeetings[0].date).toLocaleDateString();
    }

    // Enhanced History functionality
    viewMemberHistory(memberId) {
        const member = this.teamMembers.find(m => m.id === memberId);
        if (!member) return;

        const memberMeetings = this.meetings.filter(m => m.teamMemberId === memberId);
        const memberTasks = this.tasks.filter(t => t.assigneeId === 'direct-report' && 
            this.meetings.find(m => m.id === t.meetingId && m.teamMemberId === memberId));

        const historyHTML = `
            <div id="member-history-modal" class="modal active">
                <div class="modal-content" style="max-width: 800px;">
                    <div class="modal-header">
                        <h3>History: ${member.name}</h3>
                        <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                    </div>
                    <div class="modal-body">
                        <div class="history-tabs">
                            <button class="tab-btn active" onclick="app.showHistoryTab(this, 'meetings')">Meetings (${memberMeetings.length})</button>
                            <button class="tab-btn" onclick="app.showHistoryTab(this, 'tasks')">Tasks (${memberTasks.length})</button>
                            <button class="tab-btn" onclick="app.showHistoryTab(this, 'analytics')">Analytics</button>
                        </div>
                        
                        <div id="meetings-tab" class="tab-content active">
                            <h4>Meeting History</h4>
                            ${memberMeetings.length === 0 ? '<p>No meetings yet.</p>' : 
                                memberMeetings.sort((a, b) => new Date(b.date) - new Date(a.date)).map(meeting => `
                                    <div class="history-item">
                                        <div class="history-header">
                                            <strong>${new Date(meeting.date).toLocaleDateString()}</strong>
                                            <span class="status ${meeting.completed ? 'completed' : 'scheduled'}">${meeting.completed ? 'Completed' : 'Scheduled'}</span>
                                        </div>
                                        <p><strong>Duration:</strong> ${meeting.duration ? Math.floor(meeting.duration / 60) : 'N/A'} minutes</p>
                                        <p><strong>Questions Completed:</strong> ${meeting.standardQuestions?.filter(q => q.completed).length || 0}/3</p>
                                        <p><strong>Discussion Points:</strong> ${meeting.discussionPoints?.length || 0}</p>
                                        ${meeting.notes ? `<p><strong>Notes:</strong> ${meeting.notes.substring(0, 100)}...</p>` : ''}
                                    </div>
                                `).join('')}
                        </div>
                        
                        <div id="tasks-tab" class="tab-content">
                            <h4>Task History</h4>
                            ${memberTasks.length === 0 ? '<p>No tasks assigned yet.</p>' :
                                memberTasks.map(task => `
                                    <div class="history-item">
                                        <div class="history-header">
                                            <strong>${task.description}</strong>
                                            <span class="status ${task.completed ? 'completed' : 'pending'}">${task.completed ? 'Completed' : 'Pending'}</span>
                                        </div>
                                        <p><strong>Created:</strong> ${task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'N/A'}</p>
                                        ${task.dueDate ? `<p><strong>Due:</strong> ${new Date(task.dueDate).toLocaleDateString()}</p>` : ''}
                                    </div>
                                `).join('')}
                        </div>
                        
                        <div id="analytics-tab" class="tab-content">
                            <h4>Performance Analytics</h4>
                            <div class="analytics-grid">
                                <div class="stat-card">
                                    <div class="stat-number">${memberMeetings.filter(m => m.completed).length}</div>
                                    <div class="stat-label">Completed Meetings</div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-number">${memberTasks.filter(t => t.completed).length}/${memberTasks.length}</div>
                                    <div class="stat-label">Tasks Completed</div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-number">${this.calculateEngagementScore(memberMeetings)}%</div>
                                    <div class="stat-label">Engagement Score</div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-number">${memberMeetings.length > 0 ? Math.round(memberMeetings.reduce((sum, m) => sum + (m.duration || 0), 0) / memberMeetings.length / 60) : 0} min</div>
                                    <div class="stat-label">Avg Meeting Duration</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', historyHTML);
    }

    showHistoryTab(button, tabName) {
        // Remove active from all tabs
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Add active to clicked tab
        button.classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    calculateEngagementScore(meetings) {
        if (meetings.length === 0) return 0;
        
        const totalQuestions = meetings.length * 3;
        const completedQuestions = meetings.reduce((sum, m) => 
            sum + (m.standardQuestions?.filter(q => q.completed).length || 0), 0);
        
        return Math.round((completedQuestions / totalQuestions) * 100);
    }

    // Enhanced Edit Access functionality
    editMemberAccess(memberId) {
        const member = this.teamMembers.find(m => m.id === memberId);
        if (!member) return;

        const editAccessHTML = `
            <div id="edit-access-modal" class="modal active">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Edit Access: ${member.name}</h3>
                        <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                    </div>
                    <div class="modal-body">
                        <form id="edit-access-form">
                            <div class="form-group">
                                <label>Access Level:</label>
                                <select id="edit-access-level">
                                    <option value="direct-report" ${member.accessLevel === 'direct-report' ? 'selected' : ''}>Direct Report (Read-only access to their meetings)</option>
                                    <option value="manager" ${member.accessLevel === 'manager' ? 'selected' : ''}>Manager (Full access)</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label>Status:</label>
                                <select id="edit-member-status">
                                    <option value="active" ${member.status === 'active' ? 'selected' : ''}>Active</option>
                                    <option value="inactive" ${member.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                                    <option value="pending" ${member.status === 'pending' ? 'selected' : ''}>Pending</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>Position:</label>
                                <input type="text" id="edit-member-position" value="${member.position}">
                            </div>

                            <div class="form-group">
                                <h4>Permissions</h4>
                                <div class="permissions-list">
                                    <label>
                                        <input type="checkbox" id="can-view-dashboard" ${member.permissions?.viewDashboard !== false ? 'checked' : ''}>
                                        View dashboard and meeting summaries
                                    </label>
                                    <label>
                                        <input type="checkbox" id="can-add-agenda" ${member.permissions?.addAgendaItems !== false ? 'checked' : ''}>
                                        Add agenda items before meetings
                                    </label>
                                    <label>
                                        <input type="checkbox" id="can-view-tasks" ${member.permissions?.viewTasks !== false ? 'checked' : ''}>
                                        View assigned action items
                                    </label>
                                    <label>
                                        <input type="checkbox" id="receive-summaries" ${member.permissions?.receiveSummaries !== false ? 'checked' : ''}>
                                        Receive meeting summary emails
                                    </label>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                        <button type="button" class="btn-primary" onclick="app.saveAccessChanges(${memberId})">Save Changes</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', editAccessHTML);
    }

    saveAccessChanges(memberId) {
        const member = this.teamMembers.find(m => m.id === memberId);
        if (!member) return;

        // Update member properties
        member.accessLevel = document.getElementById('edit-access-level').value;
        member.status = document.getElementById('edit-member-status').value;
        member.position = document.getElementById('edit-member-position').value;

        // Update permissions
        member.permissions = {
            viewDashboard: document.getElementById('can-view-dashboard').checked,
            addAgendaItems: document.getElementById('can-add-agenda').checked,
            viewTasks: document.getElementById('can-view-tasks').checked,
            receiveSummaries: document.getElementById('receive-summaries').checked
        };

        this.saveData();
        this.loadTeamMembersList();
        
        // Close modal
        document.getElementById('edit-access-modal').remove();
        
        this.showNotification(`Access settings updated for ${member.name}`);
    }

    // Integration Methods (delegated to IntegrationManager)
    connectTeams() {
        this.integrationManager.connectTeams();
    }

    connectOutlook() {
        this.integrationManager.connectOutlook();
    }

    // Export Methods (delegated to AnalyticsManager)
    exportData(format) {
        this.analyticsManager.exportData(format);
    }

    // Advanced Search
    performSearch(query, filters = {}) {
        return this.analyticsManager.performAdvancedSearch(query, filters);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new OneOnOneManager();
});
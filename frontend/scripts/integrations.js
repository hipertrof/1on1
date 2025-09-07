// Microsoft Teams and Outlook Integration
class IntegrationManager {
    constructor(app) {
        this.app = app;
        this.teamsConnected = false;
        this.outlookConnected = false;
        this.integrationStatus = {
            teams: { connected: false, lastSync: null, error: null },
            outlook: { connected: false, lastSync: null, error: null }
        };
        
        this.loadIntegrationStatus();
    }

    loadIntegrationStatus() {
        const saved = localStorage.getItem('integrationStatus');
        if (saved) {
            this.integrationStatus = JSON.parse(saved);
        }
    }

    saveIntegrationStatus() {
        localStorage.setItem('integrationStatus', JSON.stringify(this.integrationStatus));
    }

    // Microsoft Teams Integration
    async connectTeams() {
        try {
            this.app.showNotification('Connecting to Microsoft Teams...');
            
            // In a real implementation, this would use Microsoft Graph API
            // For demo purposes, we'll simulate the connection
            await this.simulateConnection('teams');
            
            this.integrationStatus.teams.connected = true;
            this.integrationStatus.teams.lastSync = new Date().toISOString();
            this.integrationStatus.teams.error = null;
            
            this.saveIntegrationStatus();
            this.updateIntegrationUI();
            
            this.app.showNotification('Successfully connected to Microsoft Teams!');
            
            // Enable Teams features
            this.enableTeamsFeatures();
            
        } catch (error) {
            this.integrationStatus.teams.error = error.message;
            this.saveIntegrationStatus();
            this.app.showNotification('Failed to connect to Teams: ' + error.message);
        }
    }

    async connectOutlook() {
        try {
            this.app.showNotification('Connecting to Outlook Calendar...');
            
            // Simulate Outlook connection
            await this.simulateConnection('outlook');
            
            this.integrationStatus.outlook.connected = true;
            this.integrationStatus.outlook.lastSync = new Date().toISOString();
            this.integrationStatus.outlook.error = null;
            
            this.saveIntegrationStatus();
            this.updateIntegrationUI();
            
            this.app.showNotification('Successfully connected to Outlook Calendar!');
            
            // Enable Outlook features
            this.enableOutlookFeatures();
            
        } catch (error) {
            this.integrationStatus.outlook.error = error.message;
            this.saveIntegrationStatus();
            this.app.showNotification('Failed to connect to Outlook: ' + error.message);
        }
    }

    simulateConnection(service) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate occasional connection failure
                if (Math.random() < 0.1) {
                    reject(new Error(`Connection timeout to ${service}`));
                } else {
                    resolve();
                }
            }, 2000);
        });
    }

    enableTeamsFeatures() {
        // Add Teams-specific functionality
        this.addTeamsMeetingButtons();
        this.enableTeamsNotifications();
    }

    enableOutlookFeatures() {
        // Add Outlook-specific functionality
        this.enableCalendarSync();
        this.addOutlookInviteFeatures();
    }

    addTeamsMeetingButtons() {
        // Add "Start Teams Meeting" buttons to scheduled meetings
        document.querySelectorAll('.meeting-actions').forEach(actions => {
            if (!actions.querySelector('.teams-meeting-btn')) {
                const teamsBtn = document.createElement('button');
                teamsBtn.className = 'btn-primary teams-meeting-btn';
                teamsBtn.textContent = 'Join Teams';
                teamsBtn.onclick = () => this.startTeamsMeeting();
                actions.appendChild(teamsBtn);
            }
        });
    }

    enableTeamsNotifications() {
        // Enable Teams notifications for meeting reminders
        console.log('Teams notifications enabled');
    }

    enableCalendarSync() {
        // Sync meetings with Outlook calendar
        this.syncMeetingsWithOutlook();
    }

    addOutlookInviteFeatures() {
        // Add Outlook invite functionality to meeting creation
        const meetingForm = document.getElementById('meeting-form');
        if (meetingForm && !document.getElementById('send-outlook-invite')) {
            const inviteCheckbox = document.createElement('div');
            inviteCheckbox.className = 'form-group';
            inviteCheckbox.innerHTML = `
                <label>
                    <input type="checkbox" id="send-outlook-invite" checked>
                    Send Outlook calendar invite
                </label>
            `;
            meetingForm.appendChild(inviteCheckbox);
        }
    }

    startTeamsMeeting() {
        if (this.integrationStatus.teams.connected) {
            // In real implementation, this would open Teams meeting
            const teamsUrl = `https://teams.microsoft.com/l/meetup-join/meeting-id-placeholder`;
            window.open(teamsUrl, '_blank');
            this.app.showNotification('Opening Teams meeting...');
        } else {
            this.app.showNotification('Teams integration not connected');
        }
    }

    async syncMeetingsWithOutlook() {
        if (!this.integrationStatus.outlook.connected) return;

        try {
            this.app.showNotification('Syncing with Outlook calendar...');
            
            // Simulate calendar sync
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // In real implementation, this would:
            // 1. Fetch events from Outlook calendar
            // 2. Create/update meetings in our app
            // 3. Send calendar invites for new meetings
            
            this.integrationStatus.outlook.lastSync = new Date().toISOString();
            this.saveIntegrationStatus();
            
            this.app.showNotification('Calendar sync completed');
            
        } catch (error) {
            this.app.showNotification('Calendar sync failed: ' + error.message);
        }
    }

    // Email Integration for Meeting Summaries
    async sendMeetingSummary(meetingId, recipientEmail) {
        try {
            const meeting = this.app.meetings.find(m => m.id === meetingId);
            const teamMember = this.app.teamMembers.find(tm => tm.id === meeting.teamMemberId);
            
            const summary = this.generateEmailSummary(meeting, teamMember);
            
            // In real implementation, this would use a service like SendGrid or Microsoft Graph
            await this.simulateEmailSend(recipientEmail, summary);
            
            this.app.showNotification(`Meeting summary sent to ${recipientEmail}`);
            
        } catch (error) {
            this.app.showNotification('Failed to send meeting summary: ' + error.message);
        }
    }

    generateEmailSummary(meeting, teamMember) {
        const completedQuestions = meeting.standardQuestions?.filter(q => q.completed).length || 0;
        const completedDiscussionPoints = meeting.discussionPoints?.filter(p => p.completed).length || 0;
        
        return {
            subject: `1-on-1 Meeting Summary - ${new Date(meeting.date).toLocaleDateString()}`,
            body: `
                <h2>1-on-1 Meeting Summary</h2>
                <p><strong>Date:</strong> ${new Date(meeting.date).toLocaleDateString()}</p>
                <p><strong>Participant:</strong> ${teamMember?.name}</p>
                <p><strong>Duration:</strong> ${meeting.duration ? Math.floor(meeting.duration / 60) : 'N/A'} minutes</p>
                
                <h3>Meeting Progress</h3>
                <ul>
                    <li>Standard questions completed: ${completedQuestions}/3</li>
                    <li>Discussion points completed: ${completedDiscussionPoints}/${meeting.discussionPoints?.length || 0}</li>
                </ul>
                
                <h3>Key Discussion Points</h3>
                ${meeting.discussionPoints?.map(point => `
                    <div style="margin-bottom: 10px;">
                        <strong>${point.completed ? '✅' : '⏳'} ${point.text}</strong>
                        ${point.notes ? `<p style="margin: 5px 0; color: #666;">${point.notes}</p>` : ''}
                    </div>
                `).join('') || '<p>No discussion points recorded.</p>'}
                
                <h3>Meeting Notes</h3>
                <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
                    ${meeting.notes || 'No additional notes recorded.'}
                </div>
                
                <h3>Action Items</h3>
                ${this.getActionItemsHTML(meetingId)}
                
                <p style="margin-top: 30px; color: #888; font-size: 12px;">
                    This summary was generated automatically by 1-on-1 Manager
                </p>
            `
        };
    }

    getActionItemsHTML(meetingId) {
        const actionItems = this.app.tasks.filter(t => t.meetingId === meetingId);
        
        if (actionItems.length === 0) {
            return '<p>No action items created during this meeting.</p>';
        }
        
        return `
            <ul>
                ${actionItems.map(item => `
                    <li>
                        <strong>${item.description}</strong>
                        <br>Assigned to: ${item.assigneeId === 'manager' ? 'Me' : 'You'}
                        ${item.dueDate ? `<br>Due: ${new Date(item.dueDate).toLocaleDateString()}` : ''}
                    </li>
                `).join('')}
            </ul>
        `;
    }

    simulateEmailSend(email, content) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Email sent to:', email, content);
                resolve();
            }, 1000);
        });
    }

    // Calendar Integration Helpers
    createOutlookEvent(meeting) {
        const teamMember = this.app.teamMembers.find(tm => tm.id === meeting.teamMemberId);
        
        return {
            subject: `1-on-1 with ${teamMember?.name}`,
            body: {
                contentType: 'HTML',
                content: this.generateMeetingAgenda(meeting)
            },
            start: {
                dateTime: meeting.date,
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            },
            end: {
                dateTime: new Date(new Date(meeting.date).getTime() + 60 * 60 * 1000).toISOString(), // 1 hour meeting
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            },
            attendees: [
                {
                    emailAddress: {
                        address: teamMember?.email,
                        name: teamMember?.name
                    }
                }
            ]
        };
    }

    generateMeetingAgenda(meeting) {
        return `
            <h3>1-on-1 Meeting Agenda</h3>
            
            <h4>Standard Questions:</h4>
            <ul>
                <li>What important meetings are happening this week?</li>
                <li>Is there anything that needs to be shared with the wider team?</li>
                <li>Where do you need my help/assistance?</li>
            </ul>
            
            <h4>Discussion Points:</h4>
            ${meeting.discussionPoints?.length ? `
                <ul>
                    ${meeting.discussionPoints.map(point => `<li>${point.text}</li>`).join('')}
                </ul>
            ` : '<p>No specific discussion points scheduled.</p>'}
            
            <p><em>This agenda was generated by 1-on-1 Manager</em></p>
        `;
    }

    updateIntegrationUI() {
        // Update status indicators in the UI
        const teamsIndicator = document.querySelector('.integration-status .status-indicator');
        const outlookIndicators = document.querySelectorAll('.integration-status .status-indicator');
        
        if (teamsIndicator) {
            teamsIndicator.className = `status-indicator ${this.integrationStatus.teams.connected ? 'status-connected' : 'status-disconnected'}`;
        }
        
        // Update buttons
        const teamsBtn = document.querySelector('button[onclick="app.connectTeams()"]');
        const outlookBtn = document.querySelector('button[onclick="app.connectOutlook()"]');
        
        if (teamsBtn) {
            teamsBtn.textContent = this.integrationStatus.teams.connected ? 'Disconnect' : 'Connect';
            teamsBtn.onclick = this.integrationStatus.teams.connected ? () => this.disconnectTeams() : () => this.connectTeams();
        }
        
        if (outlookBtn) {
            outlookBtn.textContent = this.integrationStatus.outlook.connected ? 'Disconnect' : 'Connect';
            outlookBtn.onclick = this.integrationStatus.outlook.connected ? () => this.disconnectOutlook() : () => this.connectOutlook();
        }
    }

    disconnectTeams() {
        this.integrationStatus.teams.connected = false;
        this.integrationStatus.teams.lastSync = null;
        this.saveIntegrationStatus();
        this.updateIntegrationUI();
        this.app.showNotification('Disconnected from Microsoft Teams');
    }

    disconnectOutlook() {
        this.integrationStatus.outlook.connected = false;
        this.integrationStatus.outlook.lastSync = null;
        this.saveIntegrationStatus();
        this.updateIntegrationUI();
        this.app.showNotification('Disconnected from Outlook Calendar');
    }

    // Auto-sync functionality
    startAutoSync() {
        if (this.integrationStatus.outlook.connected) {
            setInterval(() => {
                this.syncMeetingsWithOutlook();
            }, 30 * 60 * 1000); // Sync every 30 minutes
        }
    }

    getIntegrationStats() {
        return {
            teamsConnected: this.integrationStatus.teams.connected,
            outlookConnected: this.integrationStatus.outlook.connected,
            lastTeamsSync: this.integrationStatus.teams.lastSync,
            lastOutlookSync: this.integrationStatus.outlook.lastSync,
            teamsError: this.integrationStatus.teams.error,
            outlookError: this.integrationStatus.outlook.error
        };
    }
}
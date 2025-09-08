// Meeting Session Management
class MeetingSession {
    constructor(app, meetingId) {
        this.app = app;
        this.meetingId = meetingId;
        this.meeting = null;
        this.startTime = null;
        this.currentDuration = 0;
        this.durationInterval = null;
        this.actionItems = [];
        this.transcriptFile = null;
        
        this.init();
    }

    init() {
        this.meeting = this.app.meetings.find(m => m.id === this.meetingId);
        if (!this.meeting) {
            console.error('Meeting not found');
            return;
        }

        this.startTime = new Date();
        this.setupEventListeners();
        this.loadMeetingInterface();
        this.startDurationTimer();
    }

    setupEventListeners() {
        // Meeting controls
        document.getElementById('save-meeting-progress').addEventListener('click', async () => {
            await this.saveProgress();
        });

        document.getElementById('end-meeting-btn').addEventListener('click', async () => {
            await this.endMeeting();
        });

        // Add discussion point
        document.getElementById('add-meeting-point').addEventListener('click', async () => {
            await this.addDiscussionPoint();
        });

        // Add action item
        document.getElementById('add-action-item').addEventListener('click', async () => {
            await this.addActionItem();
        });

        // Removed meeting notes - no longer needed

        // Transcript upload
        document.getElementById('transcript-file').addEventListener('change', async (e) => {
            await this.handleTranscriptUpload(e);
        });
    }

    loadMeetingInterface() {
        // Set meeting title and info
        const teamMember = this.app.teamMembers.find(tm => tm.id === this.meeting.teamMemberId);
        document.getElementById('meeting-session-title').textContent = `1-on-1 with ${teamMember?.name || 'Team Member'}`;
        document.getElementById('meeting-date-time').textContent = new Date(this.meeting.date).toLocaleDateString();

        // Initialize discussion points with standard questions at the bottom
        this.initializeDiscussionPointsWithStandardQuestions();
        
        // Load discussion points
        this.loadDiscussionPoints();

        // Load action items
        this.loadActionItems();
    }

    initializeDiscussionPointsWithStandardQuestions() {
        // Initialize discussion points if they don't exist
        this.meeting.discussionPoints = this.meeting.discussionPoints || [];
        
        // Add standard questions at the end if they don't exist
        const standardQuestions = [
            'What important meetings are happening this week?',
            'Is there anything that needs to be shared with the wider team?',
            'Where do you need my help/assistance?'
        ];
        
        // Check if standard questions are already added
        const hasStandardQuestions = this.meeting.discussionPoints.some(point => 
            standardQuestions.includes(point.text)
        );
        
        if (!hasStandardQuestions) {
            standardQuestions.forEach(question => {
                this.meeting.discussionPoints.push({
                    id: `standard_${Date.now()}_${Math.random()}`,
                    text: question,
                    completed: false,
                    children: [],
                    isStandardQuestion: true
                });
            });
        }
    }

    loadDiscussionPoints() {
        const container = document.getElementById('discussion-points-list');
        this.meeting.discussionPoints = this.meeting.discussionPoints || [];

        if (this.meeting.discussionPoints.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No discussion points yet. Add some using the button above.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.renderDiscussionPoints(this.meeting.discussionPoints);
    }

    renderDiscussionPoints(points, level = 1) {
        let html = '';
        
        points.forEach((point, index) => {
            const pointId = point.id || `point_${Date.now()}_${index}`;
            
            // Render current point
            html += `
                <div class="discussion-item level-${level} ${point.completed ? 'completed' : ''}" data-id="${pointId}">
                    <div class="discussion-item-content">
                        <input type="checkbox" class="discussion-checkbox" ${point.completed ? 'checked' : ''} 
                               onchange="app.meetingSession.toggleDiscussionPoint('${pointId}')">
                        <textarea class="discussion-text" placeholder="Enter discussion point..." 
                                  onchange="app.meetingSession.updateDiscussionText('${pointId}', this.value)"
                                  oninput="this.style.height = 'auto'; this.style.height = this.scrollHeight + 'px'">${point.text || ''}</textarea>
                    </div>
                    ${level < 4 ? `
                    <div class="discussion-controls">
                        <button class="add-sub-item" onclick="app.meetingSession.addSubDiscussionPoint('${pointId}')">+ Sub</button>
                        ${point.isStandardQuestion ? '' : `<button class="delete-item" onclick="app.meetingSession.removeDiscussionPoint('${pointId}')">Delete</button>`}
                    </div>
                    ` : `
                    <div class="discussion-controls">
                        ${point.isStandardQuestion ? '' : `<button class="delete-item" onclick="app.meetingSession.removeDiscussionPoint('${pointId}')">Delete</button>`}
                    </div>
                    `}
                </div>
            `;
            
            // Render children inline (not in separate container)
            if (point.children && point.children.length > 0) {
                html += this.renderDiscussionPoints(point.children, level + 1);
            }
        });
        
        return html;
    }

    loadActionItems() {
        const container = document.getElementById('action-items-list');
        this.actionItems = this.actionItems || [];
        
        if (this.actionItems.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No action items yet. Add some using the button above.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.actionItems.map((item, index) => {
            const itemId = item.id || `action_${Date.now()}_${index}`;
            
            return `
                <div class="action-item-simple ${item.completed ? 'completed' : ''}" data-id="${itemId}">
                    <div class="action-item-content">
                        <input type="checkbox" class="action-checkbox" ${item.completed ? 'checked' : ''} 
                               onchange="app.meetingSession.toggleActionItem('${itemId}')">
                        <textarea class="action-text" placeholder="Enter action item..." 
                                  onchange="app.meetingSession.updateActionText('${itemId}', this.value)"
                                  oninput="this.style.height = 'auto'; this.style.height = this.scrollHeight + 'px'">${item.description || ''}</textarea>
                    </div>
                    <div class="action-assignee-simple">
                        <select onchange="app.meetingSession.updateActionAssignee('${itemId}', this.value)">
                            <option value="manager" ${item.assignee === 'manager' ? 'selected' : ''}>Me (Manager)</option>
                            <option value="direct-report" ${item.assignee === 'direct-report' ? 'selected' : ''}>Team Member</option>
                        </select>
                        <button class="delete-item" onclick="app.meetingSession.removeActionItem('${itemId}')">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    startDurationTimer() {
        this.durationInterval = setInterval(() => {
            this.currentDuration++;
            const minutes = Math.floor(this.currentDuration / 60);
            const seconds = this.currentDuration % 60;
            document.getElementById('meeting-duration').textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    async addDiscussionPoint() {
        this.meeting.discussionPoints = this.meeting.discussionPoints || [];
        const newPoint = {
            id: `point_${Date.now()}`,
            text: '',
            completed: false,
            children: [],
            addedDuringMeeting: true
        };
        this.meeting.discussionPoints.push(newPoint);
        this.loadDiscussionPoints();
        await this.saveProgress();
        
        // Focus on the new textarea
        setTimeout(() => {
            const newElement = document.querySelector(`[data-id="${newPoint.id}"] .discussion-text`);
            if (newElement) {
                newElement.focus();
            }
        }, 100);
    }

    async addSubDiscussionPoint(parentId) {
        const parent = this.findDiscussionPoint(this.meeting.discussionPoints, parentId);
        
        if (parent) {
            parent.children = parent.children || [];
            const newPoint = {
                id: `point_${Date.now()}_${Math.random()}`,
                text: '',
                completed: false,
                children: []
            };
            parent.children.push(newPoint);
            
            this.loadDiscussionPoints();
            await this.saveProgress();
            
            // Focus on the new textarea
            setTimeout(() => {
                const newElement = document.querySelector(`[data-id="${newPoint.id}"] .discussion-text`);
                if (newElement) {
                    newElement.focus();
                }
            }, 100);
        }
    }

    findDiscussionPoint(points, id) {
        for (let point of points) {
            if (point.id === id) {
                return point;
            }
            if (point.children && point.children.length > 0) {
                const found = this.findDiscussionPoint(point.children, id);
                if (found) return found;
            }
        }
        return null;
    }

    async toggleDiscussionPoint(pointId) {
        const point = this.findDiscussionPoint(this.meeting.discussionPoints, pointId);
        if (point) {
            point.completed = !point.completed;
            this.loadDiscussionPoints();
            await this.saveProgress();
        }
    }

    async updateDiscussionText(pointId, text) {
        const point = this.findDiscussionPoint(this.meeting.discussionPoints, pointId);
        if (point) {
            point.text = text;
            await this.saveProgress();
        }
    }

    async removeDiscussionPoint(pointId) {
        this.removeDiscussionPointFromArray(this.meeting.discussionPoints, pointId);
        this.loadDiscussionPoints();
        await this.saveProgress();
    }

    removeDiscussionPointFromArray(points, id) {
        for (let i = 0; i < points.length; i++) {
            if (points[i].id === id) {
                points.splice(i, 1);
                return true;
            }
            if (points[i].children && this.removeDiscussionPointFromArray(points[i].children, id)) {
                return true;
            }
        }
        return false;
    }

    async addActionItem() {
        this.actionItems = this.actionItems || [];
        const newAction = {
            id: `action_${Date.now()}`,
            description: '',
            assignee: 'manager',
            completed: false,
            createdAt: new Date().toISOString()
        };
        this.actionItems.push(newAction);
        this.loadActionItems();
        await this.saveProgress();
        
        // Focus on the new textarea
        setTimeout(() => {
            const newElement = document.querySelector(`[data-id="${newAction.id}"] .action-text`);
            if (newElement) {
                newElement.focus();
            }
        }, 100);
    }

    async toggleActionItem(actionId) {
        const action = this.actionItems.find(item => item.id === actionId);
        if (action) {
            action.completed = !action.completed;
            this.loadActionItems();
            await this.saveProgress();
        }
    }

    async updateActionText(actionId, text) {
        const action = this.actionItems.find(item => item.id === actionId);
        if (action) {
            action.description = text;
            await this.saveProgress();
        }
    }

    async updateActionAssignee(actionId, assignee) {
        const action = this.actionItems.find(item => item.id === actionId);
        if (action) {
            action.assignee = assignee;
            await this.saveProgress();
        }
    }

    async removeActionItem(actionId) {
        const index = this.actionItems.findIndex(item => item.id === actionId);
        if (index !== -1) {
            this.actionItems.splice(index, 1);
            this.loadActionItems();
            await this.saveProgress();
        }
    }

    // Old index-based methods removed - now using ID-based methods

    async handleTranscriptUpload(event) {
        const file = event.target.files[0];
        if (file) {
            this.transcriptFile = file;
            const filenameDisplay = document.getElementById('transcript-filename');
            const transcriptPreview = document.getElementById('transcript-content');
            
            filenameDisplay.textContent = file.name;
            
            // In a real app, you would process the transcript here
            // For demo purposes, we'll show a preview
            const reader = new FileReader();
            reader.onload = (e) => {
                transcriptPreview.innerHTML = `
                    <strong>Transcript: ${file.name}</strong><br>
                    <em>File size: ${(file.size / 1024).toFixed(1)} KB</em><br>
                    <em>This would show transcript content in a real implementation</em>
                `;
                transcriptPreview.classList.add('active');
            };
            reader.readAsText(file);
            
            this.meeting.transcriptFileName = file.name;
            await this.saveProgress();
        }
    }

    async saveProgress() {
        try {
            // No longer using meeting notes - they were removed
            this.meeting.lastModified = new Date().toISOString();
            
            // Update meeting in database via API
            await apiService.updateMeeting(this.meetingId, {
                discussionPoints: this.meeting.discussionPoints,
                lastModified: this.meeting.lastModified
            });
            
            // Save action items to database
            for (const item of this.actionItems) {
                if (item.description.trim()) {
                    const actionData = {
                        description: item.description,
                        assignee: item.assignee,
                        completed: item.completed
                    };
                    
                    if (item.id.startsWith('action_')) {
                        // New action item - create in database
                        const savedAction = await apiService.createActionItem(this.meetingId, actionData);
                        // Update local copy with database ID
                        item.id = savedAction.id;
                        this.app.tasks.push({
                            ...savedAction,
                            meetingId: this.meetingId,
                            assigneeId: item.assignee
                        });
                    } else {
                        // Existing action item - update in database
                        await apiService.updateActionItem(item.id, actionData);
                        // Update in main app tasks array
                        const taskIndex = this.app.tasks.findIndex(t => t.id === item.id);
                        if (taskIndex !== -1) {
                            Object.assign(this.app.tasks[taskIndex], actionData);
                        }
                    }
                }
            }

            // Also save to localStorage as backup
            this.app.saveToLocalStorage();
            
            // Show saved indicator
            this.app.showNotification('Progress saved');
            
        } catch (error) {
            console.error('Failed to save meeting progress:', error);
            // Fallback to localStorage only
            this.app.saveToLocalStorage();
            this.app.showNotification('Progress saved (offline)', 'warning');
        }
    }

    async endMeeting() {
        if (confirm('End this meeting? All progress will be saved and a summary will be generated.')) {
            try {
                // Clear duration timer
                if (this.durationInterval) {
                    clearInterval(this.durationInterval);
                }

                // Mark meeting as completed
                this.meeting.completed = true;
                this.meeting.endTime = new Date().toISOString();
                this.meeting.duration = this.currentDuration;
                
                // Final save to database
                await apiService.updateMeeting(this.meetingId, {
                    completed: true,
                    endTime: this.meeting.endTime,
                    duration: this.meeting.duration,
                    discussionPoints: this.meeting.discussionPoints
                });
                
                // Final save
                await this.saveProgress();

                // Generate meeting summary
                this.generateMeetingSummary();

                // Return to meetings page
                this.app.showPage('meetings');
                
            } catch (error) {
                console.error('Failed to end meeting:', error);
                this.app.showNotification('Failed to save meeting. Please try again.', 'error');
            }
        }
    }

    generateMeetingSummary() {
        const teamMember = this.app.teamMembers.find(tm => tm.id === this.meeting.teamMemberId);
        
        const summary = {
            meetingId: this.meetingId,
            teamMember: teamMember?.name || 'Team Member',
            date: new Date(this.meeting.date).toLocaleDateString(),
            duration: Math.floor(this.currentDuration / 60),
            completedQuestions: this.meeting.standardQuestions?.filter(q => q.completed).length || 0,
            completedDiscussionPoints: this.countCompletedDiscussionPoints(this.meeting.discussionPoints || []),
            totalActionItems: this.actionItems.length,
            hasTranscript: !!this.meeting.transcriptFileName
        };

        // In Phase 2, this would trigger email sending
        console.log('Meeting Summary Generated:', summary);
        this.app.showNotification('Meeting completed! Summary would be emailed to team member.');
    }

    countCompletedDiscussionPoints(points) {
        let count = 0;
        for (let point of points) {
            if (point.completed) count++;
            if (point.children) {
                count += this.countCompletedDiscussionPoints(point.children);
            }
        }
        return count;
    }
}
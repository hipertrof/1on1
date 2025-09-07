// Advanced Roadmap Management
class RoadmapManager {
    constructor(app) {
        this.app = app;
        this.roadmapItems = [];
        this.currentView = 'gantt';
        this.filters = {
            search: '',
            priority: '',
            status: '',
            assignee: ''
        };
        
        this.initializeData();
    }

    initializeData() {
        // Load saved roadmap data or initialize with sample data
        const savedRoadmap = localStorage.getItem('roadmapItems');
        if (savedRoadmap) {
            this.roadmapItems = JSON.parse(savedRoadmap);
        } else {
            this.roadmapItems = [
                {
                    id: 1,
                    type: 'theme',
                    title: 'Customer Experience Enhancement',
                    description: 'Improve overall customer satisfaction and retention',
                    status: 'in-progress',
                    priority: 'high',
                    assignee: 1,
                    startDate: '2025-09-01',
                    endDate: '2026-02-28',
                    progress: 25,
                    children: [2, 3]
                },
                {
                    id: 2,
                    type: 'epic',
                    parentId: 1,
                    title: 'Mobile App Redesign',
                    description: 'Complete redesign of mobile application UI/UX',
                    status: 'planning',
                    priority: 'high',
                    assignee: 2,
                    startDate: '2025-09-15',
                    endDate: '2025-12-15',
                    progress: 10,
                    children: [4, 5]
                },
                {
                    id: 3,
                    type: 'epic',
                    parentId: 1,
                    title: 'Customer Support Portal',
                    description: 'Self-service portal for customer support',
                    status: 'planning',
                    priority: 'medium',
                    assignee: 3,
                    startDate: '2025-10-01',
                    endDate: '2026-01-31',
                    progress: 5,
                    children: [6, 7]
                },
                {
                    id: 4,
                    type: 'story',
                    parentId: 2,
                    title: 'User Authentication Flow',
                    description: 'Implement secure login and registration',
                    status: 'in-progress',
                    priority: 'high',
                    assignee: 4,
                    startDate: '2025-09-15',
                    endDate: '2025-10-15',
                    progress: 60
                },
                {
                    id: 5,
                    type: 'story',
                    parentId: 2,
                    title: 'Dashboard Redesign',
                    description: 'New dashboard layout and widgets',
                    status: 'planning',
                    priority: 'medium',
                    assignee: 5,
                    startDate: '2025-10-15',
                    endDate: '2025-11-30',
                    progress: 0
                },
                {
                    id: 6,
                    type: 'story',
                    parentId: 3,
                    title: 'Knowledge Base',
                    description: 'Searchable knowledge base for customers',
                    status: 'planning',
                    priority: 'medium',
                    assignee: 6,
                    startDate: '2025-10-01',
                    endDate: '2025-11-15',
                    progress: 15
                },
                {
                    id: 7,
                    type: 'story',
                    parentId: 3,
                    title: 'Ticket Submission System',
                    description: 'Allow customers to submit support tickets',
                    status: 'planning',
                    priority: 'low',
                    assignee: 7,
                    startDate: '2025-11-15',
                    endDate: '2026-01-31',
                    progress: 0
                }
            ];
            this.saveData();
        }
    }

    setupEventListeners() {
        // View selector
        document.getElementById('roadmap-view-select').addEventListener('change', (e) => {
            this.currentView = e.target.value;
            this.renderRoadmap();
        });

        // Add buttons
        document.getElementById('add-theme-btn').addEventListener('click', () => {
            this.showAddItemModal('theme');
        });

        document.getElementById('add-epic-btn').addEventListener('click', () => {
            this.showAddItemModal('epic');
        });

        // Search and filters
        document.getElementById('roadmap-search').addEventListener('input', (e) => {
            this.filters.search = e.target.value;
            this.renderRoadmap();
        });

        document.getElementById('priority-filter').addEventListener('change', (e) => {
            this.filters.priority = e.target.value;
            this.renderRoadmap();
        });

        document.getElementById('status-filter').addEventListener('change', (e) => {
            this.filters.status = e.target.value;
            this.renderRoadmap();
        });

        document.getElementById('assignee-filter').addEventListener('change', (e) => {
            this.filters.assignee = e.target.value;
            this.renderRoadmap();
        });
    }

    renderRoadmap() {
        this.populateFilters();
        
        switch (this.currentView) {
            case 'gantt':
                this.renderGanttView();
                break;
            case 'list':
                this.renderListView();
                break;
            case 'board':
                this.renderBoardView();
                break;
        }
    }

    populateFilters() {
        // Populate assignee filter with team members
        const assigneeFilter = document.getElementById('assignee-filter');
        assigneeFilter.innerHTML = '<option value="">All Assignees</option>' +
            this.app.teamMembers.map(member => 
                `<option value="${member.id}">${member.name}</option>`
            ).join('');
    }

    renderGanttView() {
        const container = document.getElementById('roadmap-items-container');
        const filteredItems = this.getFilteredItems();
        
        container.innerHTML = this.buildHierarchicalView(filteredItems);
    }

    renderListView() {
        const container = document.getElementById('roadmap-items-container');
        const filteredItems = this.getFilteredItems();
        
        container.innerHTML = `
            <div class="list-view">
                ${filteredItems.map(item => this.createListItemHTML(item)).join('')}
            </div>
        `;
    }

    renderBoardView() {
        const container = document.getElementById('roadmap-items-container');
        const filteredItems = this.getFilteredItems();
        
        const statuses = ['planning', 'in-progress', 'completed'];
        container.innerHTML = `
            <div class="board-view">
                ${statuses.map(status => `
                    <div class="board-column">
                        <h4>${status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}</h4>
                        <div class="board-items">
                            ${filteredItems
                                .filter(item => item.status === status)
                                .map(item => this.createBoardItemHTML(item))
                                .join('')
                            }
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    getFilteredItems() {
        return this.roadmapItems.filter(item => {
            if (this.filters.search && !item.title.toLowerCase().includes(this.filters.search.toLowerCase())) {
                return false;
            }
            if (this.filters.priority && item.priority !== this.filters.priority) {
                return false;
            }
            if (this.filters.status && item.status !== this.filters.status) {
                return false;
            }
            if (this.filters.assignee && item.assignee != this.filters.assignee) {
                return false;
            }
            return true;
        });
    }

    buildHierarchicalView(items) {
        const themes = items.filter(item => item.type === 'theme');
        
        return themes.map(theme => {
            const epics = items.filter(item => item.type === 'epic' && item.parentId === theme.id);
            
            return `
                <div class="roadmap-item theme" data-id="${theme.id}">
                    ${this.createItemContent(theme)}
                </div>
                ${epics.map(epic => {
                    const stories = items.filter(item => item.type === 'story' && item.parentId === epic.id);
                    return `
                        <div class="roadmap-item epic" data-id="${epic.id}">
                            ${this.createItemContent(epic)}
                        </div>
                        ${stories.map(story => `
                            <div class="roadmap-item story" data-id="${story.id}">
                                ${this.createItemContent(story)}
                            </div>
                        `).join('')}
                    `;
                }).join('')}
            `;
        }).join('');
    }

    createItemContent(item) {
        const assignee = this.app.teamMembers.find(tm => tm.id === item.assignee);
        const startDate = new Date(item.startDate);
        const endDate = new Date(item.endDate);
        
        return `
            <div class="roadmap-content">
                <div class="roadmap-title">${item.title}</div>
                <div class="roadmap-meta">
                    <span class="priority priority-${item.priority}">${item.priority.toUpperCase()}</span>
                    <span class="assignee">${assignee?.name || 'Unassigned'}</span>
                    <span class="dates">${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}</span>
                </div>
                <div class="roadmap-timeline">
                    <div class="roadmap-progress" style="width: ${item.progress}%"></div>
                </div>
            </div>
            <div class="roadmap-actions">
                <span class="progress-text">${item.progress}%</span>
                <button class="btn-secondary" onclick="app.roadmapManager.editItem(${item.id})">Edit</button>
                <button class="btn-secondary" onclick="app.roadmapManager.linkToMeeting(${item.id})">Link to Meeting</button>
            </div>
        `;
    }

    createListItemHTML(item) {
        const assignee = this.app.teamMembers.find(tm => tm.id === item.assignee);
        
        return `
            <div class="list-item ${item.type}">
                <div class="item-header">
                    <h4>${item.title}</h4>
                    <div class="item-badges">
                        <span class="badge priority-${item.priority}">${item.priority}</span>
                        <span class="badge status-${item.status}">${item.status}</span>
                    </div>
                </div>
                <p class="item-description">${item.description}</p>
                <div class="item-meta">
                    <span>Assigned to: ${assignee?.name || 'Unassigned'}</span>
                    <span>Due: ${new Date(item.endDate).toLocaleDateString()}</span>
                    <span>Progress: ${item.progress}%</span>
                </div>
            </div>
        `;
    }

    createBoardItemHTML(item) {
        const assignee = this.app.teamMembers.find(tm => tm.id === item.assignee);
        
        return `
            <div class="board-item ${item.type}">
                <h5>${item.title}</h5>
                <p>${item.description}</p>
                <div class="board-item-meta">
                    <span class="assignee">${assignee?.name || 'Unassigned'}</span>
                    <span class="progress">${item.progress}%</span>
                </div>
            </div>
        `;
    }

    showAddItemModal(type) {
        const title = type.charAt(0).toUpperCase() + type.slice(1);
        const parentOptions = type === 'epic' ? this.roadmapItems.filter(item => item.type === 'theme') :
                             type === 'story' ? this.roadmapItems.filter(item => item.type === 'epic') : [];
        
        const modalHTML = `
            <div id="roadmap-item-modal" class="modal active">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Add New ${title}</h3>
                        <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                    </div>
                    <div class="modal-body">
                        <form id="roadmap-item-form">
                            <div class="form-group">
                                <label>Title:</label>
                                <input type="text" id="item-title" required>
                            </div>
                            <div class="form-group">
                                <label>Description:</label>
                                <textarea id="item-description" rows="3"></textarea>
                            </div>
                            ${parentOptions.length > 0 ? `
                                <div class="form-group">
                                    <label>Parent ${type === 'epic' ? 'Theme' : 'Epic'}:</label>
                                    <select id="item-parent" required>
                                        <option value="">Select parent...</option>
                                        ${parentOptions.map(p => `<option value="${p.id}">${p.title}</option>`).join('')}
                                    </select>
                                </div>
                            ` : ''}
                            <div class="form-group">
                                <label>Priority:</label>
                                <select id="item-priority">
                                    <option value="low">Low</option>
                                    <option value="medium" selected>Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Assignee:</label>
                                <select id="item-assignee">
                                    <option value="">Unassigned</option>
                                    ${this.app.teamMembers.map(tm => `<option value="${tm.id}">${tm.name}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Start Date:</label>
                                <input type="date" id="item-start-date" required>
                            </div>
                            <div class="form-group">
                                <label>End Date:</label>
                                <input type="date" id="item-end-date" required>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                        <button type="submit" form="roadmap-item-form" class="btn-primary" onclick="app.roadmapManager.saveNewItem('${type}')">Save</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    saveNewItem(type) {
        const newItem = {
            id: Math.max(...this.roadmapItems.map(item => item.id)) + 1,
            type: type,
            title: document.getElementById('item-title').value,
            description: document.getElementById('item-description').value,
            priority: document.getElementById('item-priority').value,
            assignee: parseInt(document.getElementById('item-assignee').value) || null,
            startDate: document.getElementById('item-start-date').value,
            endDate: document.getElementById('item-end-date').value,
            status: 'planning',
            progress: 0,
            createdAt: new Date().toISOString()
        };

        const parentSelect = document.getElementById('item-parent');
        if (parentSelect) {
            newItem.parentId = parseInt(parentSelect.value);
        }

        this.roadmapItems.push(newItem);
        this.saveData();
        this.renderRoadmap();
        
        // Remove modal
        document.getElementById('roadmap-item-modal').remove();
        
        this.app.showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} added successfully!`);
    }

    editItem(itemId) {
        const item = this.roadmapItems.find(i => i.id === itemId);
        if (!item) return;

        // For now, just show a simple prompt to update progress
        const newProgress = prompt(`Update progress for "${item.title}" (0-100):`, item.progress);
        if (newProgress !== null && !isNaN(newProgress) && newProgress >= 0 && newProgress <= 100) {
            item.progress = parseInt(newProgress);
            
            // Update status based on progress
            if (item.progress === 0) {
                item.status = 'planning';
            } else if (item.progress === 100) {
                item.status = 'completed';
            } else {
                item.status = 'in-progress';
            }
            
            this.saveData();
            this.renderRoadmap();
            this.app.showNotification('Progress updated!');
        }
    }

    linkToMeeting(itemId) {
        const item = this.roadmapItems.find(i => i.id === itemId);
        if (!item) return;

        // Create a discussion point for the next available meeting
        const upcomingMeetings = this.app.meetings.filter(m => new Date(m.date) > new Date() && !m.completed);
        
        if (upcomingMeetings.length === 0) {
            this.app.showNotification('No upcoming meetings found. Schedule a meeting first.');
            return;
        }

        // Add to the next meeting
        const nextMeeting = upcomingMeetings.sort((a, b) => new Date(a.date) - new Date(b.date))[0];
        nextMeeting.discussionPoints = nextMeeting.discussionPoints || [];
        nextMeeting.discussionPoints.push({
            text: `Roadmap Update: ${item.title}`,
            notes: `Current progress: ${item.progress}%. Status: ${item.status}.`,
            completed: false,
            linkedRoadmapId: itemId
        });

        this.app.saveData();
        this.app.showNotification(`Linked to upcoming meeting with ${this.app.teamMembers.find(tm => tm.id === nextMeeting.teamMemberId)?.name}`);
    }

    saveData() {
        localStorage.setItem('roadmapItems', JSON.stringify(this.roadmapItems));
    }

    generateRoadmapReport() {
        const totalItems = this.roadmapItems.length;
        const completedItems = this.roadmapItems.filter(item => item.status === 'completed').length;
        const inProgressItems = this.roadmapItems.filter(item => item.status === 'in-progress').length;
        const averageProgress = this.roadmapItems.reduce((sum, item) => sum + item.progress, 0) / totalItems;

        return {
            totalItems,
            completedItems,
            inProgressItems,
            completionRate: Math.round((completedItems / totalItems) * 100),
            averageProgress: Math.round(averageProgress),
            themes: this.roadmapItems.filter(item => item.type === 'theme').length,
            epics: this.roadmapItems.filter(item => item.type === 'epic').length,
            stories: this.roadmapItems.filter(item => item.type === 'story').length
        };
    }
}
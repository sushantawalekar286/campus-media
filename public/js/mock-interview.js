// Mock Interview JavaScript
let currentUser = null;

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
        currentUser = JSON.parse(userData);
        initializeMockInterview();
    } else {
        // Show authentication warning
        document.getElementById('authCheck').style.display = 'block';
        document.getElementById('mainContent').style.display = 'none';
    }
});

function initializeMockInterview() {
    // Show main content
    document.getElementById('authCheck').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';
    
    // Setup event listeners
    setupRoleSelection();
    setupFormSubmission();
    setupTabEvents();
    setupGoogleCalendar();
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('preferredDate').min = today;
}

// Setup role selection
function setupRoleSelection() {
    const roleOptions = document.querySelectorAll('.role-option');
    
    roleOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove selected class from all options
            roleOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Add selected class to clicked option
            this.classList.add('selected');
            
            // Set the hidden input value
            const role = this.getAttribute('data-role');
            document.getElementById('selectedRole').value = role;
        });
    });
}

// Setup form submission
function setupFormSubmission() {
    const form = document.getElementById('interviewRequestForm');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const requestData = {
            role: formData.get('role'),
            interviewType: formData.get('interviewType'),
            preferredDate: formData.get('preferredDate') + 'T' + formData.get('preferredTime'),
            duration: parseInt(formData.get('duration')),
            notes: formData.get('notes')
        };
        
        // Validation
        if (!requestData.role) {
            showAlert('Please select a role', 'warning');
            return;
        }
        
        if (!requestData.interviewType) {
            showAlert('Please select an interview type', 'warning');
            return;
        }
        
        if (!requestData.preferredDate || !formData.get('preferredTime')) {
            showAlert('Please select date and time', 'warning');
            return;
        }
        
        // Submit request
        await submitInterviewRequest(requestData);
    });
}

// Setup Google Calendar integration
function setupGoogleCalendar() {
    checkGoogleCalendarStatus();
    
    // Setup connect button
    const connectBtn = document.getElementById('connectGoogleBtn');
    if (connectBtn) {
        connectBtn.addEventListener('click', () => {
            window.location.href = '/auth/google';
        });
    }
}

// Check Google Calendar connection status
async function checkGoogleCalendarStatus() {
    try {
        const response = await fetch('/api/google-calendar/status');
        if (response.ok) {
            const status = await response.json();
            updateCalendarStatus(status.connected, status.message);
        } else {
            updateCalendarStatus(false, 'Failed to check connection');
        }
    } catch (error) {
        updateCalendarStatus(false, 'Connection check failed');
    }
}

// Update calendar status UI
function updateCalendarStatus(isConnected, message) {
    const statusElement = document.getElementById('calendarStatus');
    const connectBtn = document.getElementById('connectGoogleBtn');
    const connectedBadge = document.getElementById('connectedBadge');
    
    if (statusElement) {
        statusElement.textContent = message;
    }
    
    if (isConnected) {
        if (connectBtn) connectBtn.style.display = 'none';
        if (connectedBadge) connectedBadge.style.display = 'inline-block';
    } else {
        if (connectBtn) connectBtn.style.display = 'inline-block';
        if (connectedBadge) connectedBadge.style.display = 'none';
    }
}

// Setup tab events
function setupTabEvents() {
    const tabLinks = document.querySelectorAll('[data-bs-toggle="tab"]');
    
    tabLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const target = this.getAttribute('data-bs-target');
            
            // Load content based on tab
            if (target === '#my-requests') {
                loadMyRequests();
            } else if (target === '#available') {
                loadAvailableInterviews();
            } else if (target === '#history') {
                loadInterviewHistory();
            }
        });
    });
}

// Submit interview request
async function submitInterviewRequest(requestData) {
    try {
        const response = await fetch('/api/interview-requests', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(requestData)
        });
        
        if (response.ok) {
            const result = await response.json();
            showAlert('Interview request submitted successfully!', 'success');
            
            // Reset form
            document.getElementById('interviewRequestForm').reset();
            document.querySelectorAll('.role-option').forEach(opt => opt.classList.remove('selected'));
            document.getElementById('selectedRole').value = '';
            
            // Switch to my requests tab
            const myRequestsTab = document.getElementById('my-requests-tab');
            const tab = new bootstrap.Tab(myRequestsTab);
            tab.show();
            
        } else {
            const error = await response.json();
            showAlert(error.error || 'Failed to submit request', 'error');
        }
    } catch (error) {
        showAlert('Network error', 'error');
    }
}

// Load my requests
async function loadMyRequests() {
    try {
        const response = await fetch('/api/interview-requests/my-requests', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (response.ok) {
            const requests = await response.json();
            displayMyRequests(requests);
        } else {
            showAlert('Failed to load requests', 'error');
        }
    } catch (error) {
        showAlert('Network error', 'error');
    }
}

// Display my requests
function displayMyRequests(requests) {
    const container = document.getElementById('myRequestsContainer');
    
    if (requests.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="text-center py-5">
                    <i class="fas fa-calendar-plus fa-3x text-muted mb-3"></i>
                    <h5>No interview requests yet</h5>
                    <p class="text-muted">Start by requesting your first mock interview!</p>
                </div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = requests.map(request => `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card interview-card h-100">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h6 class="mb-0">${request.role}</h6>
                    <span class="badge bg-${getStatusColor(request.status)} status-badge">
                        ${request.status}
                    </span>
                </div>
                <div class="card-body">
                    <p class="card-text">
                        <strong>Type:</strong> ${request.interviewType}<br>
                        <strong>Duration:</strong> ${request.duration} minutes<br>
                        <strong>Date:</strong> ${new Date(request.preferredDate).toLocaleDateString()}<br>
                        <strong>Time:</strong> ${new Date(request.preferredDate).toLocaleTimeString()}
                    </p>
                    ${request.notes ? `<p class="card-text"><small class="text-muted">${request.notes}</small></p>` : ''}
                </div>
                <div class="card-footer">
                    <button class="btn btn-sm btn-outline-primary" onclick="viewInterviewDetails('${request._id}')">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                    ${request.status === 'Accepted' && request.googleMeetLink ? `
                        <a href="${request.googleMeetLink}" target="_blank" class="btn btn-sm btn-success">
                            <i class="fas fa-video"></i> Join
                        </a>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// Load available interviews
async function loadAvailableInterviews() {
    try {
        const response = await fetch('/api/interview-requests/available', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (response.ok) {
            const requests = await response.json();
            displayAvailableInterviews(requests);
        } else {
            showAlert('Failed to load available interviews', 'error');
        }
    } catch (error) {
        showAlert('Network error', 'error');
    }
}

// Display available interviews
function displayAvailableInterviews(requests) {
    const container = document.getElementById('availableInterviewsContainer');
    
    if (requests.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="text-center py-5">
                    <i class="fas fa-handshake fa-3x text-muted mb-3"></i>
                    <h5>No available interviews</h5>
                    <p class="text-muted">Check back later for interview opportunities!</p>
                </div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = requests.map(request => `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card interview-card h-100">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h6 class="mb-0">${request.role}</h6>
                    <span class="badge bg-warning status-badge">Available</span>
                </div>
                <div class="card-body">
                    <p class="card-text">
                        <strong>Type:</strong> ${request.interviewType}<br>
                        <strong>Duration:</strong> ${request.duration} minutes<br>
                        <strong>Date:</strong> ${new Date(request.preferredDate).toLocaleDateString()}<br>
                        <strong>Time:</strong> ${new Date(request.preferredDate).toLocaleTimeString()}<br>
                        <strong>Requester:</strong> ${request.requester.fullName}
                    </p>
                    ${request.notes ? `<p class="card-text"><small class="text-muted">${request.notes}</small></p>` : ''}
                </div>
                <div class="card-footer">
                    <button class="btn btn-sm btn-primary" onclick="acceptInterview('${request._id}')">
                        <i class="fas fa-check"></i> Accept
                    </button>
                    <button class="btn btn-sm btn-outline-primary" onclick="viewInterviewDetails('${request._id}')">
                        <i class="fas fa-eye"></i> Details
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Load interview history
async function loadInterviewHistory() {
    try {
        const response = await fetch('/api/interview-requests/history', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (response.ok) {
            const requests = await response.json();
            displayInterviewHistory(requests);
        } else {
            showAlert('Failed to load history', 'error');
        }
    } catch (error) {
        showAlert('Network error', 'error');
    }
}

// Display interview history
function displayInterviewHistory(requests) {
    const container = document.getElementById('interviewHistoryContainer');
    
    if (requests.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="text-center py-5">
                    <i class="fas fa-history fa-3x text-muted mb-3"></i>
                    <h5>No interview history</h5>
                    <p class="text-muted">Complete your first interview to see history here!</p>
                </div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = requests.map(request => `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card interview-card h-100">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h6 class="mb-0">${request.role}</h6>
                    <span class="badge bg-${getStatusColor(request.status)} status-badge">
                        ${request.status}
                    </span>
                </div>
                <div class="card-body">
                    <p class="card-text">
                        <strong>Type:</strong> ${request.interviewType}<br>
                        <strong>Duration:</strong> ${request.duration} minutes<br>
                        <strong>Date:</strong> ${new Date(request.preferredDate).toLocaleDateString()}<br>
                        <strong>Time:</strong> ${new Date(request.preferredDate).toLocaleTimeString()}
                    </p>
                    ${request.feedback ? `<p class="card-text"><strong>Feedback:</strong> ${request.feedback}</p>` : ''}
                    ${request.rating ? `<p class="card-text"><strong>Rating:</strong> ${'⭐'.repeat(request.rating)}</p>` : ''}
                </div>
                <div class="card-footer">
                    <button class="btn btn-sm btn-outline-primary" onclick="viewInterviewDetails('${request._id}')">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// View interview details
async function viewInterviewDetails(requestId) {
    try {
        const response = await fetch(`/api/interview-requests/${requestId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (response.ok) {
            const request = await response.json();
            showInterviewDetailsModal(request);
        } else {
            showAlert('Failed to load interview details', 'error');
        }
    } catch (error) {
        showAlert('Network error', 'error');
    }
}

// Show interview details modal
function showInterviewDetailsModal(request) {
    const modal = new bootstrap.Modal(document.getElementById('interviewDetailsModal'));
    const content = document.getElementById('interviewDetailsContent');
    const acceptBtn = document.getElementById('acceptInterviewBtn');
    const joinBtn = document.getElementById('joinInterviewBtn');
    
    content.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <h6>Interview Details</h6>
                <p><strong>Role:</strong> ${request.role}</p>
                <p><strong>Type:</strong> ${request.interviewType}</p>
                <p><strong>Duration:</strong> ${request.duration} minutes</p>
                <p><strong>Date:</strong> ${new Date(request.preferredDate).toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${new Date(request.preferredDate).toLocaleTimeString()}</p>
                <p><strong>Status:</strong> <span class="badge bg-${getStatusColor(request.status)}">${request.status}</span></p>
            </div>
            <div class="col-md-6">
                <h6>Participants</h6>
                <p><strong>Requester:</strong> ${request.requester.fullName}</p>
                ${request.interviewer ? `<p><strong>Interviewer:</strong> ${request.interviewer.fullName}</p>` : '<p><em>No interviewer assigned yet</em></p>'}
                ${request.googleMeetLink ? `<p><strong>Meet Link:</strong> <a href="${request.googleMeetLink}" target="_blank">Join Meeting</a></p>` : ''}
            </div>
        </div>
        ${request.notes ? `<div class="mt-3"><h6>Notes</h6><p>${request.notes}</p></div>` : ''}
        ${request.feedback ? `<div class="mt-3"><h6>Feedback</h6><p>${request.feedback}</p></div>` : ''}
    `;
    
    // Show/hide buttons based on status and user role
    acceptBtn.style.display = 'none';
    joinBtn.style.display = 'none';
    
    if (request.status === 'Pending' && !request.interviewer) {
        acceptBtn.style.display = 'inline-block';
        acceptBtn.onclick = () => acceptInterview(request._id);
    }
    
    if (request.status === 'Accepted' && request.googleMeetLink) {
        joinBtn.style.display = 'inline-block';
        joinBtn.onclick = () => window.open(request.googleMeetLink, '_blank');
    }
    
    modal.show();
}

// Accept interview
async function acceptInterview(requestId) {
    if (!confirm('Are you sure you want to accept this interview request?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/interview-requests/${requestId}/accept`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (response.ok) {
            const result = await response.json();
            showAlert('Interview accepted successfully!', 'success');
            
            // Close modal and refresh
            bootstrap.Modal.getInstance(document.getElementById('interviewDetailsModal')).hide();
            loadAvailableInterviews();
            loadMyRequests();
        } else {
            const error = await response.json();
            showAlert(error.error || 'Failed to accept interview', 'error');
        }
    } catch (error) {
        showAlert('Network error', 'error');
    }
}

// Utility functions
function getStatusColor(status) {
    switch (status) {
        case 'Pending': return 'warning';
        case 'Accepted': return 'success';
        case 'Rejected': return 'danger';
        case 'Completed': return 'info';
        case 'Cancelled': return 'secondary';
        default: return 'primary';
    }
}

function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; max-width: 400px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// Profile Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!isAuthenticated()) {
        window.location.href = '/login';
        return;
    }

    // Load profile data
    loadProfileData();
    
    // Setup event listeners
    setupProfileEvents();
});

// Load profile data
async function loadProfileData() {
    try {
        const response = await fetch('/api/profile', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            updateProfileUI(data);
            loadLikedQuestions();
            loadStudyMaterials();
            loadActivity();
            
            // Hide loading state and show content
            document.getElementById('loadingState').style.display = 'none';
            document.getElementById('profileContent').style.display = 'block';
        } else {
            showAlert('Failed to load profile data', 'error');
        }
    } catch (error) {
        console.error('Profile load error:', error);
        showAlert('Network error', 'error');
    }
}

// Update profile UI
function updateProfileUI(userData) {
    // Update user info
    document.getElementById('userName').textContent = userData.fullName;
    document.getElementById('userId').textContent = `@${userData.userId}`;
    document.getElementById('userEmail').textContent = userData.email;
    document.getElementById('userCollege').textContent = userData.college;
    document.getElementById('userBranch').textContent = userData.branch;
    document.getElementById('userYear').textContent = userData.yearOfStudy;
    document.getElementById('userCreatedAt').textContent = new Date(userData.createdAt).toLocaleDateString();
    
    // Update stats
    document.getElementById('likedQuestionsCount').textContent = userData.likedQuestions.length;
    document.getElementById('studyMaterialsCount').textContent = userData.studyMaterials.length;
    
    // Update days active
    const daysActive = Math.floor((new Date() - new Date(userData.createdAt)) / (1000 * 60 * 60 * 24));
    document.getElementById('daysActive').textContent = daysActive;
}

// Load liked questions
async function loadLikedQuestions() {
    try {
        const response = await fetch('/api/profile/liked-questions', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (response.ok) {
            const questions = await response.json();
            displayLikedQuestions(questions);
        }
    } catch (error) {
        console.error('Error loading liked questions:', error);
    }
}

// Display liked questions
function displayLikedQuestions(questions) {
    const container = document.getElementById('likedQuestionsContainer');
    if (!container) return;
    
    if (questions.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="empty-state">
                    <i class="fas fa-heart"></i>
                    <h5>No liked questions yet</h5>
                    <p>Start exploring interview questions and like the ones you find helpful!</p>
                    <a href="/interview-questions" class="btn btn-primary">Explore Questions</a>
                </div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="row" id="likedQuestionsList">
            ${questions.map(question => `
                <div class="col-md-6 mb-3">
                    <div class="card question-card h-100">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <div class="d-flex align-items-center">
                                <div class="company-logo me-2">
                                    <div class="default-logo">
                                        ${question.company.split(' ')[0].charAt(0).toUpperCase()}
                                    </div>
                                </div>
                                <div>
                                    <strong>${question.company}</strong>
                                    <div class="text-muted small">${question.role}</div>
                                </div>
                            </div>
                            <div class="frequency-badge">
                                <span class="badge bg-${getFrequencyColor(question.frequency)}">
                                    ${question.frequency}
                                </span>
                            </div>
                        </div>
                        <div class="card-body">
                            <p class="card-text">${question.question.substring(0, 100)}${question.question.length > 100 ? '...' : ''}</p>
                            <div class="d-flex justify-content-between align-items-center">
                                <small class="text-muted">
                                    <i class="fas fa-eye"></i> ${question.views} views
                                </small>
                                <small class="text-muted">
                                    <i class="fas fa-heart"></i> ${question.likes} likes
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Load study materials
async function loadStudyMaterials() {
    try {
        const response = await fetch('/api/profile/study-materials', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (response.ok) {
            const materials = await response.json();
            displayStudyMaterials(materials);
        }
    } catch (error) {
        console.error('Error loading study materials:', error);
    }
}

// Display study materials
function displayStudyMaterials(materials) {
    const container = document.getElementById('studyMaterialsContainer');
    if (!container) return;
    
    if (materials.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="empty-state">
                    <i class="fas fa-book-open"></i>
                    <h5>No study materials yet</h5>
                    <p>Start adding study materials to keep them organized!</p>
                    <button class="btn btn-primary" onclick="addStudyMaterial()">Add First Material</button>
                </div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="row" id="studyMaterialsList">
            ${materials.map(material => `
                <div class="col-md-6 mb-3">
                    <div class="card h-100">
                        <div class="card-body">
                            <h6 class="card-title">${material.title}</h6>
                            <p class="card-text text-muted">${material.description}</p>
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="badge bg-primary">${material.category || 'General'}</span>
                                <small class="text-muted">${new Date(material.addedAt).toLocaleDateString()}</small>
                            </div>
                        </div>
                        <div class="card-footer">
                            <a href="${material.link}" target="_blank" class="btn btn-sm btn-outline-primary">
                                <i class="fas fa-external-link-alt"></i> Open
                            </a>
                            <button class="btn btn-sm btn-outline-danger" onclick="removeStudyMaterial('${material._id}')">
                                <i class="fas fa-trash"></i> Remove
                            </button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Load activity
function loadActivity() {
    const container = document.getElementById('activityTimeline');
    if (!container) return;
    
    const userData = getUserData();
    if (!userData) return;
    
    container.innerHTML = `
        <div class="activity-item">
            <div class="activity-icon">
                <i class="fas fa-user-plus"></i>
            </div>
            <div class="activity-content">
                <h6>Account Created</h6>
                <p>Joined Campus Media</p>
                <small>${new Date(userData.createdAt).toLocaleDateString()}</small>
            </div>
        </div>
        <div class="activity-item">
            <div class="activity-icon">
                <i class="fas fa-sign-in-alt"></i>
            </div>
            <div class="activity-content">
                <h6>Last Login</h6>
                <p>Signed in to your account</p>
                <small>${new Date(userData.lastLogin || userData.createdAt).toLocaleDateString()}</small>
            </div>
        </div>
    `;
}

// Add study material
function addStudyMaterial() {
    const modal = new bootstrap.Modal(document.getElementById('addMaterialModal'));
    modal.show();
}

// Save study material
async function saveStudyMaterial() {
    const form = document.getElementById('addMaterialForm');
    const formData = new FormData(form);
    
    const materialData = {
        title: formData.get('title'),
        description: formData.get('description'),
        link: formData.get('link'),
        category: formData.get('category')
    };
    
    try {
        const response = await fetch('/api/profile/study-materials', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(materialData)
        });
        
        if (response.ok) {
            showAlert('Study material added successfully!', 'success');
            bootstrap.Modal.getInstance(document.getElementById('addMaterialModal')).hide();
            form.reset();
            loadStudyMaterials();
        } else {
            const data = await response.json();
            showAlert(data.error || 'Failed to add material', 'error');
        }
    } catch (error) {
        showAlert('Network error', 'error');
    }
}

// Remove study material
async function removeStudyMaterial(materialId) {
    if (!confirm('Are you sure you want to remove this study material?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/profile/study-materials/${materialId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (response.ok) {
            showAlert('Study material removed successfully!', 'success');
            loadStudyMaterials();
        } else {
            showAlert('Failed to remove material', 'error');
        }
    } catch (error) {
        showAlert('Network error', 'error');
    }
}

// Edit profile
function editProfile() {
    // This would open an edit profile modal or redirect to edit page
    showAlert('Edit profile functionality coming soon!', 'info');
}

// Setup profile events
function setupProfileEvents() {
    // Tab switching
    const tabLinks = document.querySelectorAll('[data-bs-toggle="tab"]');
    tabLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const target = this.getAttribute('data-bs-target');
            if (target === '#liked') {
                loadLikedQuestions();
            } else if (target === '#materials') {
                loadStudyMaterials();
            }
        });
    });
}

// Utility functions
function getFrequencyColor(frequency) {
    switch (frequency) {
        case 'Frequently Asked': return 'success';
        case 'Sometimes': return 'warning';
        case 'Rare': return 'secondary';
        default: return 'primary';
    }
}

function showAlert(message, type = 'info') {
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; max-width: 400px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// Check authentication status
function isAuthenticated() {
    return !!localStorage.getItem('authToken');
}

// Get user data
function getUserData() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
}

// Interview Questions JavaScript
let allQuestions = [];
let filteredQuestions = [];

document.addEventListener('DOMContentLoaded', function() {
    loadQuestions();
    setupEventListeners();
});

function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterQuestions, 300));
    }

    // Filters
    const frequencyFilter = document.getElementById('frequencyFilter');
    if (frequencyFilter) {
        frequencyFilter.addEventListener('change', filterQuestions);
    }

    const sortBy = document.getElementById('sortBy');
    if (sortBy) {
        sortBy.addEventListener('change', filterQuestions);
    }
}

async function loadQuestions() {
    try {
        const response = await fetch('/api/questions');
        if (response.ok) {
            allQuestions = await response.json();
            filteredQuestions = [...allQuestions];
            displayQuestions();
        } else {
            showAlert('Failed to load questions', 'error');
        }
    } catch (error) {
        showAlert('Network error', 'error');
    }
}

function filterQuestions() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const frequencyFilter = document.getElementById('frequencyFilter').value;
    const sortBy = document.getElementById('sortBy').value;

    // Filter by search term
    filteredQuestions = allQuestions.filter(question => {
        const matchesSearch = question.question.toLowerCase().includes(searchTerm) ||
                            question.company.toLowerCase().includes(searchTerm) ||
                            question.role.toLowerCase().includes(searchTerm);
        
        const matchesFrequency = !frequencyFilter || question.frequency === frequencyFilter;
        
        return matchesSearch && matchesFrequency;
    });

    // Sort questions
    sortQuestions(sortBy);
    
    displayQuestions();
}

function sortQuestions(sortBy) {
    switch (sortBy) {
        case 'recent':
            filteredQuestions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
        case 'views':
            filteredQuestions.sort((a, b) => b.views - a.views);
            break;
        case 'likes':
            filteredQuestions.sort((a, b) => b.likes - a.likes);
            break;
        case 'frequency':
            const frequencyOrder = { 'Frequently Asked': 3, 'Sometimes': 2, 'Rare': 1 };
            filteredQuestions.sort((a, b) => frequencyOrder[b.frequency] - frequencyOrder[a.frequency]);
            break;
    }
}

function displayQuestions() {
    const container = document.getElementById('questionsContainer');
    if (!container) return;

    if (filteredQuestions.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <h5>No questions found</h5>
                <p class="text-muted">Try adjusting your search or filters</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filteredQuestions.map(question => `
        <div class="col-md-6 mb-4">
            <div class="card h-100 shadow-sm question-card" data-id="${question._id}">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center">
                        <div class="company-logo me-2">
                            <div class="default-logo">
                                ${question.company.split(' ')[0].charAt(0).toUpperCase()}
                            </div>
                        </div>
                        <div>
                            <h6 class="mb-0">${question.company}</h6>
                            <small class="text-muted">${question.role}</small>
                        </div>
                    </div>
                    <div class="frequency-badge">
                        <span class="badge bg-${getFrequencyColor(question.frequency)}">
                            ${getFrequencyStars(question.frequency)}
                        </span>
                    </div>
                </div>
                <div class="card-body">
                    <p class="card-text question-preview">${question.question.substring(0, 150)}${question.question.length > 150 ? '...' : ''}</p>
                    <div class="question-details" style="display: none;">
                        <p class="card-text">${question.question}</p>
                        <div class="row">
                            <div class="col-6">
                                <small class="text-muted">Round: ${question.round}</small>
                            </div>
                            <div class="col-6">
                                <small class="text-muted">Difficulty: ${question.difficulty}</small>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card-footer">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="d-flex align-items-center">
                            <button class="btn btn-sm btn-outline-primary me-2" onclick="likeQuestion('${question._id}')">
                                <i class="fas fa-thumbs-up"></i> <span class="likes-count">${question.likes}</span>
                            </button>
                            <span class="text-muted me-3">
                                <i class="fas fa-eye"></i> <span class="views-count">${question.views}</span>
                            </span>
                        </div>
                        <div class="text-end">
                            <small class="text-muted">By ${question.postedBy}</small><br>
                            <small class="text-muted">${new Date(question.createdAt).toLocaleDateString()}</small>
                        </div>
                    </div>
                    <button class="btn btn-sm btn-link mt-2 expand-btn" onclick="toggleQuestionDetails(this)">
                        Show Details
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function toggleQuestionDetails(button) {
    const card = button.closest('.card');
    const details = card.querySelector('.question-details');
    const preview = card.querySelector('.question-preview');
    
    if (details.style.display === 'none') {
        details.style.display = 'block';
        preview.style.display = 'none';
        button.textContent = 'Hide Details';
    } else {
        details.style.display = 'none';
        preview.style.display = 'block';
        button.textContent = 'Show Details';
    }
}

async function likeQuestion(questionId) {
    // Check if user is authenticated
    const token = localStorage.getItem('authToken');
    if (!token) {
        showAlert('Please login to like questions', 'warning');
        return;
    }

    try {
        const response = await fetch(`/api/questions/${questionId}/like`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const updatedQuestion = await response.json();
            
            // Update the question in our arrays
            const questionIndex = allQuestions.findIndex(q => q._id === questionId);
            if (questionIndex !== -1) {
                allQuestions[questionIndex] = updatedQuestion;
            }
            
            const filteredIndex = filteredQuestions.findIndex(q => q._id === questionId);
            if (filteredIndex !== -1) {
                filteredQuestions[filteredIndex] = updatedQuestion;
            }
            
            // Update the display
            displayQuestions();
            showAlert('Question liked successfully!', 'success');
        } else {
            showAlert('Failed to like question', 'error');
        }
    } catch (error) {
        showAlert('Network error', 'error');
    }
}

async function submitQuestion() {
    const form = document.getElementById('addQuestionForm');
    const formData = new FormData(form);
    
    const questionData = {
        company: formData.get('company'),
        role: formData.get('role'),
        question: formData.get('question'),
        round: formData.get('round'),
        difficulty: formData.get('difficulty'),
        frequency: formData.get('frequency'),
        postedBy: formData.get('postedBy')
    };

    // Show loading state
    const submitBtn = document.querySelector('#addQuestionModal .btn-primary');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline-block';
    submitBtn.disabled = true;

    try {
        const response = await fetch('/api/questions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(questionData)
        });

        if (response.ok) {
            const newQuestion = await response.json();
            allQuestions.unshift(newQuestion);
            filteredQuestions = [...allQuestions];
            displayQuestions();
            
            // Close modal and reset form
            bootstrap.Modal.getInstance(document.getElementById('addQuestionModal')).hide();
            form.reset();
            
            showAlert('Question added successfully!', 'success');
        } else {
            const data = await response.json();
            showAlert(data.error || 'Failed to add question', 'error');
        }
    } catch (error) {
        showAlert('Network error', 'error');
    } finally {
        // Reset button state
        btnText.style.display = 'inline-block';
        btnLoading.style.display = 'none';
        submitBtn.disabled = false;
    }
}

function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('frequencyFilter').value = '';
    document.getElementById('sortBy').value = 'recent';
    filterQuestions();
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

function getFrequencyStars(frequency) {
    switch (frequency) {
        case 'Frequently Asked': return '⭐⭐⭐';
        case 'Sometimes': return '⭐⭐';
        case 'Rare': return '⭐';
        default: return '⭐';
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

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}


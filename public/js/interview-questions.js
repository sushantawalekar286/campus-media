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

// ...existing code...

async function submitQuestion() {
    const form = document.getElementById('questionForm');
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Adding...';

    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            showAlert('Please login first', 'error');
            return;
        }

        const formData = new FormData(form);
        const questionData = {
            company: formData.get('company'),
            role: formData.get('role'),
            question: formData.get('question'),
            frequency: formData.get('frequency')
        };

        // Validate required fields
        if (!questionData.company || !questionData.role || !questionData.question) {
            showAlert('Please fill all required fields', 'error');
            return;
        }

        const response = await fetch('/api/questions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(questionData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to add question');
        }

        // Success
        showAlert('Question added successfully!', 'success');
        form.reset();
        await loadQuestions(); // Reload the questions list
        
        // Close modal if using Bootstrap modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addQuestionModal'));
        if (modal) {
            modal.hide();
        }

    } catch (error) {
        console.error('Error:', error);
        showAlert(error.message || 'Error adding question', 'error');
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
}

// Add this helper function if not already present
function showAlert(message, type = 'info') {
    const alertContainer = document.createElement('div');
    alertContainer.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    alertContainer.role = 'alert';
    alertContainer.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertContainer);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
        alertContainer.remove();
    }, 5000);
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

    // Use questions-flex container
    container.className = 'questions-flex';
    
    container.innerHTML = filteredQuestions.map(question => `
        <div class="question-card">
            <div class="card h-100 shadow-sm">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <h6 class="company-name">${question.company}</h6>
                            <small class="text-muted">${question.role}</small>
                        </div>
                        <div class="frequency-badge">
                            ${getFrequencyStars(question.frequency)}
                        </div>
                    </div>
                    <p class="card-text">${question.question}</p>
                    <div class="d-flex justify-content-between align-items-center mt-3">
                        <button class="btn btn-sm btn-outline-primary" onclick="toggleQuestionDetails(this)">
                            Show Details
                        </button>
                        <div class="d-flex align-items-center">
                            <button class="btn btn-sm btn-link like-button" onclick="likeQuestion('${question._id}')">
                                <i class="far fa-thumbs-up"></i>
                                <span>${question.likes || 0}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
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


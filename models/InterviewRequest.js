const mongoose = require('mongoose');

const interviewRequestSchema = new mongoose.Schema({
    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    interviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    role: {
        type: String,
        required: true,
        enum: ['SDE', 'Analyst', 'Data Scientist', 'Product Manager', 'DevOps Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'QA Engineer', 'UI/UX Designer', 'Other']
    },
    interviewType: {
        type: String,
        required: true,
        enum: ['Technical', 'HR', 'Aptitude', 'Mixed']
    },
    preferredDate: {
        type: Date,
        required: true
    },
    duration: {
        type: Number,
        required: true,
        enum: [15, 30, 45]
    },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'Accepted', 'Rejected', 'Completed', 'Cancelled'],
        default: 'Pending'
    },
    googleMeetLink: {
        type: String,
        default: null
    },
    googleCalendarEventId: {
        type: String,
        default: null
    },
    notes: {
        type: String,
        default: ''
    },
    feedback: {
        type: String,
        default: ''
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
interviewRequestSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('InterviewRequest', interviewRequestSchema);

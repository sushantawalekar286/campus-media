const mongoose = require('mongoose');

const studyMaterialSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Technical', 'Aptitude', 'HR', 'General', 'Programming', 'Data Structures', 'Algorithms', 'System Design', 'Database', 'Networking']
    },
    link: {
        type: String,
        required: true
    },
    fileType: {
        type: String,
        enum: ['PDF', 'Video', 'Link', 'Document', 'Presentation']
    },
    difficulty: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced']
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    likes: {
        type: Number,
        default: 0
    },
    views: {
        type: Number,
        default: 0
    },
    tags: [String],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('StudyMaterial', studyMaterialSchema);

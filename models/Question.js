const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    company: { 
        type: String, 
        required: true,
        trim: true
    },
    role: { type: String, required: true },
    question: { type: String, required: true },
    round: { type: String, required: true, enum: ['Technical', 'HR', 'Aptitude'] },
    difficulty: { type: String, required: true, enum: ['Easy', 'Medium', 'Hard'] },
    frequency: { type: String, required: true, enum: ['Rare', 'Sometimes', 'Frequently Asked'] },
    frequencyCount: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    postedBy: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Question', questionSchema);

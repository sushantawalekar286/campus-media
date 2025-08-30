const mongoose = require('mongoose');
const InterviewRequest = require('./models/InterviewRequest');
const User = require('./models/User');

// Sample interview requests data
const sampleInterviewRequests = [
    {
        role: 'SDE',
        interviewType: 'Technical',
        preferredDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        duration: 30,
        notes: 'Focus on data structures and algorithms, especially tree and graph problems.',
        status: 'Pending'
    },
    {
        role: 'Analyst',
        interviewType: 'HR',
        preferredDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        duration: 45,
        notes: 'Would like to practice behavioral questions and case studies.',
        status: 'Pending'
    },
    {
        role: 'Data Scientist',
        interviewType: 'Mixed',
        preferredDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        duration: 45,
        notes: 'Focus on machine learning concepts, statistics, and system design.',
        status: 'Pending'
    },
    {
        role: 'Product Manager',
        interviewType: 'HR',
        preferredDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
        duration: 30,
        notes: 'Practice product strategy questions and user experience scenarios.',
        status: 'Pending'
    },
    {
        role: 'Frontend Developer',
        interviewType: 'Technical',
        preferredDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        duration: 30,
        notes: 'Focus on JavaScript, React, and frontend system design.',
        status: 'Pending'
    }
];

async function addSampleInterviewData() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/campus');
        console.log('Connected to MongoDB');

        // Get a sample user to use as requester
        const sampleUser = await User.findOne();
        if (!sampleUser) {
            console.log('No users found. Please create a user first.');
            process.exit(1);
        }

        // Clear existing interview requests
        await InterviewRequest.deleteMany({});
        console.log('Cleared existing interview requests');

        // Add sample data with the sample user as requester
        const requests = await InterviewRequest.insertMany(
            sampleInterviewRequests.map(request => ({
                ...request,
                requester: sampleUser._id
            }))
        );
        
        console.log(`Added ${requests.length} sample interview requests`);
        console.log('Sample interview data added successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error adding sample interview data:', error);
        process.exit(1);
    }
}

addSampleInterviewData();

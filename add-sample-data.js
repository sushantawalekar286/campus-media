const mongoose = require('mongoose');
const StudyMaterial = require('./models/StudyMaterial');

// Sample study materials data
const sampleMaterials = [
    {
        title: "Data Structures and Algorithms",
        description: "Comprehensive guide to DSA concepts with examples and practice problems",
        category: "Data Structures",
        link: "https://www.geeksforgeeks.org/data-structures/",
        fileType: "Link",
        difficulty: "Intermediate",
        tags: ["algorithms", "data-structures", "programming"],
        likes: 15,
        views: 120,
        postedBy: new mongoose.Types.ObjectId() // Create a dummy ObjectId
    },
    {
        title: "System Design Interview Guide",
        description: "Complete guide to system design interviews with real-world examples",
        category: "Technical",
        link: "https://github.com/donnemartin/system-design-primer",
        fileType: "Link",
        difficulty: "Advanced",
        tags: ["system-design", "architecture", "scalability"],
        likes: 23,
        views: 89,
        postedBy: new mongoose.Types.ObjectId()
    },
    {
        title: "Aptitude Test Preparation",
        description: "Practice questions and tips for aptitude tests in placement interviews",
        category: "Aptitude",
        link: "https://www.indiabix.com/aptitude/questions-and-answers/",
        fileType: "Link",
        difficulty: "Beginner",
        tags: ["aptitude", "reasoning", "placement"],
        likes: 8,
        views: 156,
        postedBy: new mongoose.Types.ObjectId()
    },
    {
        title: "HR Interview Questions",
        description: "Common HR interview questions and best practices for answering them",
        category: "HR",
        link: "https://www.indeed.com/career-advice/interviewing/hr-interview-questions",
        fileType: "Link",
        difficulty: "Beginner",
        tags: ["hr", "interview", "soft-skills"],
        likes: 12,
        views: 203,
        postedBy: new mongoose.Types.ObjectId()
    },
    {
        title: "JavaScript Programming Guide",
        description: "Modern JavaScript concepts and ES6+ features for web development",
        category: "Programming",
        link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
        fileType: "Link",
        difficulty: "Intermediate",
        tags: ["javascript", "programming", "web-development"],
        likes: 19,
        views: 167,
        postedBy: new mongoose.Types.ObjectId()
    },
    {
        title: "Database Design Principles",
        description: "Learn database design, normalization, and SQL optimization techniques",
        category: "Technical",
        link: "https://www.w3schools.com/sql/",
        fileType: "Link",
        difficulty: "Intermediate",
        tags: ["database", "sql", "design"],
        likes: 14,
        views: 134,
        postedBy: new mongoose.Types.ObjectId()
    },
    {
        title: "Machine Learning Basics",
        description: "Introduction to machine learning concepts and algorithms",
        category: "Technical",
        link: "https://www.coursera.org/learn/machine-learning",
        fileType: "Link",
        difficulty: "Advanced",
        tags: ["machine-learning", "ai", "algorithms"],
        likes: 27,
        views: 98,
        postedBy: new mongoose.Types.ObjectId()
    },
    {
        title: "Behavioral Interview Questions",
        description: "STAR method and behavioral interview question examples",
        category: "HR",
        link: "https://www.themuse.com/advice/behavioral-interview-questions-answers-examples",
        fileType: "Link",
        difficulty: "Beginner",
        tags: ["behavioral", "interview", "star-method"],
        likes: 16,
        views: 145,
        postedBy: new mongoose.Types.ObjectId()
    }
];

async function addSampleData() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/campus');
        console.log('Connected to MongoDB');

        // Clear existing data
        await StudyMaterial.deleteMany({});
        console.log('Cleared existing study materials');

        // Add sample data
        const materials = await StudyMaterial.insertMany(sampleMaterials);
        console.log(`Added ${materials.length} sample study materials`);

        console.log('Sample data added successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error adding sample data:', error);
        process.exit(1);
    }
}

addSampleData();

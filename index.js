require('dotenv').config();
const express = require('express');
const app = express();
const port = 3000;
const mongoose = require('mongoose');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Create HTTP server and Socket.IO instance
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// MongoDB connection
main()
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error(err));

async function main() {
    await mongoose.connect('mongodb://localhost:27017/campus')
}

// Import models
const Question = require('./models/Question');
const ChatMessage = require('./models/ChatMessage');
const User = require('./models/User');
const StudyMaterial = require('./models/StudyMaterial');
const InterviewRequest = require('./models/InterviewRequest');

// Import Google Calendar service
const googleCalendarService = require('./services/googleCalendar');

// Authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
}

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.get('/profile', async (req, res) => {
    res.render('profile');
});

app.get('/interview-questions', async (req, res) => {
    try {
        const questions = await Question.find().sort({ createdAt: -1 });
        res.render('interview-questions', { questions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/chat', async (req, res) => {
    try {
        const messages = await ChatMessage.find().sort({ createdAt: -1 }).limit(50);
        res.render('chat', { messages });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/study-materials', async (req, res) => {
    try {
        const materials = await StudyMaterial.find().sort({ createdAt: -1 });
        res.render('study-materials', { materials });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/mock-interview', (req, res) => {
    res.render('mock-interview');
});

// Google OAuth routes for Calendar integration
app.get('/auth/google', (req, res) => {
    const authUrl = googleCalendarService.getAuthUrl();
    res.redirect(authUrl);
});

app.get('/auth/google/callback', async (req, res) => {
    try {
        const { code } = req.query;
        if (!code) {
            return res.status(400).json({ error: 'Authorization code required' });
        }
        
        const tokens = await googleCalendarService.getTokensFromCode(code);
        
        // Store tokens in session or database (for demo, we'll store in memory)
        // In production, store these securely in database
        global.googleTokens = tokens;
        
        res.json({ 
            message: 'Google Calendar connected successfully!',
            tokens: tokens 
        });
    } catch (error) {
        console.error('Google OAuth error:', error);
        res.status(500).json({ error: 'Failed to authenticate with Google' });
    }
});

// Route to check Google Calendar connection status
app.get('/api/google-calendar/status', (req, res) => {
    const isConnected = !!global.googleTokens;
    res.json({ 
        connected: isConnected,
        message: isConnected ? 'Google Calendar connected' : 'Google Calendar not connected'
    });
});

// Authentication API Routes
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { userId, fullName, email, password, college, branch, yearOfStudy } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { userId }] });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email or user ID already exists' });
        }

        // Create new user
        const user = new User({
            userId,
            fullName,
            email,
            password,
            college,
            branch,
            yearOfStudy
        });

        await user.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Remove password from response
        const userResponse = {
            _id: user._id,
            userId: user.userId,
            fullName: user.fullName,
            email: user.email,
            college: user.college,
            branch: user.branch,
            yearOfStudy: user.yearOfStudy,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin
        };

        res.json({ token, user: userResponse });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Profile API Routes
app.get('/api/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('likedQuestions');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userResponse = {
            _id: user._id,
            userId: user.userId,
            fullName: user.fullName,
            email: user.email,
            college: user.college,
            branch: user.branch,
            yearOfStudy: user.yearOfStudy,
            likedQuestions: user.likedQuestions,
            studyMaterials: user.studyMaterials,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin
        };

        res.json(userResponse);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/profile/liked-questions', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('likedQuestions');
        res.json(user.likedQuestions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/profile/study-materials', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json(user.studyMaterials);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/profile/study-materials', authenticateToken, async (req, res) => {
    try {
        const { title, description, link, category } = req.body;
        const user = await User.findById(req.user.id);

        user.studyMaterials.push({
            title,
            description,
            link,
            category,
            addedAt: new Date()
        });

        await user.save();
        res.status(201).json({ message: 'Study material added successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.delete('/api/profile/study-materials/:materialId', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.studyMaterials = user.studyMaterials.filter(
            material => material._id.toString() !== req.params.materialId
        );
        await user.save();
        res.json({ message: 'Study material removed successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API Routes for Questions
app.post('/api/questions', async (req, res) => {
    try {
        const question = new Question(req.body);
        await question.save();
        res.status(201).json(question);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/questions', async (req, res) => {
    try {
        const { company, role, difficulty, frequency, sortBy } = req.query;
        let query = {};
        
        if (company) query.company = company;
        if (role) query.role = role;
        if (difficulty) query.difficulty = difficulty;
        if (frequency) query.frequency = frequency;
        
        let sortOption = { createdAt: -1 };
        if (sortBy === 'views') sortOption = { views: -1 };
        if (sortBy === 'likes') sortOption = { likes: -1 };
        if (sortBy === 'frequency') sortOption = { frequency: -1 };
        
        const questions = await Question.find(query).sort(sortOption);
        res.json(questions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/questions/:id/like', authenticateToken, async (req, res) => {
    try {
        const question = await Question.findByIdAndUpdate(
            req.params.id,
            { $inc: { likes: 1 } },
            { new: true }
        );

        // Add to user's liked questions if not already there
        const user = await User.findById(req.user.id);
        if (!user.likedQuestions.includes(req.params.id)) {
            user.likedQuestions.push(req.params.id);
            await user.save();
        }

        res.json(question);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/questions/:id/view', async (req, res) => {
    try {
        const question = await Question.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 1 } },
            { new: true }
        );
        res.json(question);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API Routes for Chat
app.post('/api/chat', async (req, res) => {
    try {
        const message = new ChatMessage(req.body);
        await message.save();
        
        // Emit to all connected clients
        io.emit('newMessage', message);
        
        res.status(201).json(message);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// API Routes for Study Materials
app.get('/api/study-materials', async (req, res) => {
    try {
        const materials = await StudyMaterial.find().sort({ createdAt: -1 });
        res.json(materials);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/study-materials', authenticateToken, async (req, res) => {
    try {
        const material = new StudyMaterial({
            ...req.body,
            postedBy: req.user.id
        });
        await material.save();
        res.status(201).json(material);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// API Routes for Interview Requests
app.post('/api/interview-requests', authenticateToken, async (req, res) => {
    try {
        const { role, interviewType, preferredDate, duration, notes } = req.body;
        
        const interviewRequest = new InterviewRequest({
            requester: req.user.id,
            role,
            interviewType,
            preferredDate,
            duration,
            notes
        });
        
        await interviewRequest.save();
        res.status(201).json(interviewRequest);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/interview-requests/my-requests', authenticateToken, async (req, res) => {
    try {
        const requests = await InterviewRequest.find({ requester: req.user.id })
            .populate('requester', 'fullName email')
            .populate('interviewer', 'fullName email')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/interview-requests/available', authenticateToken, async (req, res) => {
    try {
        const requests = await InterviewRequest.find({ 
            status: 'Pending',
            requester: { $ne: req.user.id }
        })
        .populate('requester', 'fullName email')
        .populate('interviewer', 'fullName email')
        .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/interview-requests/history', authenticateToken, async (req, res) => {
    try {
        const requests = await InterviewRequest.find({
            $or: [
                { requester: req.user.id },
                { interviewer: req.user.id }
            ],
            status: { $in: ['Completed', 'Cancelled'] }
        })
        .populate('requester', 'fullName email')
        .populate('interviewer', 'fullName email')
        .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/interview-requests/:id', authenticateToken, async (req, res) => {
    try {
        const request = await InterviewRequest.findById(req.params.id)
            .populate('requester', 'fullName email')
            .populate('interviewer', 'fullName email');
        
        if (!request) {
            return res.status(404).json({ error: 'Interview request not found' });
        }
        
        res.json(request);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/interview-requests/:id/accept', authenticateToken, async (req, res) => {
    try {
        const interviewRequest = await InterviewRequest.findById(req.params.id);
        
        if (!interviewRequest) {
            return res.status(404).json({ error: 'Interview request not found' });
        }
        
        if (interviewRequest.status !== 'Pending') {
            return res.status(400).json({ error: 'Interview request is not available for acceptance' });
        }
        
        if (interviewRequest.requester.toString() === req.user.id) {
            return res.status(400).json({ error: 'You cannot accept your own interview request' });
        }
        
        // Get user details for calendar event
        const requester = await User.findById(interviewRequest.requester);
        const interviewer = await User.findById(req.user.id);
        
        if (!requester || !interviewer) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        try {
            // Create Google Calendar event with Meet link
            const calendarData = {
                role: interviewRequest.role,
                interviewType: interviewRequest.interviewType,
                preferredDate: interviewRequest.preferredDate,
                duration: interviewRequest.duration,
                notes: interviewRequest.notes,
                requesterEmail: requester.email,
                interviewerEmail: interviewer.email
            };
            
            const calendarResult = await googleCalendarService.createInterviewEvent(calendarData);
            
            // Update the interview request with calendar details
            interviewRequest.interviewer = req.user.id;
            interviewRequest.status = 'Accepted';
            interviewRequest.googleMeetLink = calendarResult.meetLink;
            interviewRequest.googleCalendarEventId = calendarResult.eventId;
            
            await interviewRequest.save();
            
            res.json(interviewRequest);
            
        } catch (calendarError) {
            console.error('Google Calendar error:', calendarError);
            
            // Fallback: use generated Meet link if Google Calendar fails
            interviewRequest.interviewer = req.user.id;
            interviewRequest.status = 'Accepted';
            interviewRequest.googleMeetLink = generateMeetLink();
            
            await interviewRequest.save();
            
            res.json(interviewRequest);
        }
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/interview-requests/:id/complete', authenticateToken, async (req, res) => {
    try {
        const { feedback, rating } = req.body;
        const interviewRequest = await InterviewRequest.findById(req.params.id);
        
        if (!interviewRequest) {
            return res.status(404).json({ error: 'Interview request not found' });
        }
        
        if (interviewRequest.status !== 'Accepted') {
            return res.status(400).json({ error: 'Interview request is not in accepted state' });
        }
        
        // Only interviewer can complete the interview
        if (interviewRequest.interviewer.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Only interviewer can complete the interview' });
        }
        
        interviewRequest.status = 'Completed';
        interviewRequest.feedback = feedback;
        interviewRequest.rating = rating;
        
        await interviewRequest.save();
        
        res.json(interviewRequest);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/interview-requests/:id/cancel', authenticateToken, async (req, res) => {
    try {
        const interviewRequest = await InterviewRequest.findById(req.params.id);
        
        if (!interviewRequest) {
            return res.status(404).json({ error: 'Interview request not found' });
        }
        
        // Only requester can cancel the interview
        if (interviewRequest.requester.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Only requester can cancel the interview' });
        }
        
        if (interviewRequest.status !== 'Pending' && interviewRequest.status !== 'Accepted') {
            return res.status(400).json({ error: 'Interview request cannot be cancelled' });
        }
        
        interviewRequest.status = 'Cancelled';
        await interviewRequest.save();
        
        res.json(interviewRequest);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Helper function to generate Meet link
function generateMeetLink() {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    return `https://meet.google.com/${randomId}-${timestamp.toString(36)}`;
}

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});






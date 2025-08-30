# Campus Media - Interview Questions & Chat Platform

A comprehensive platform for students to share interview experiences, ask questions, and engage in real-time discussions.

## 🚀 Features

### 📝 Interview Questions Page
- **Add New Questions**: Submit interview questions with detailed information
  - Company Name (Google, Microsoft, Amazon, IBM, TCS, etc.)
  - Role/Position
  - Question/Experience (text area)
  - Round (Technical/HR/Aptitude)
  - Difficulty (Easy/Medium/Hard)
  - Frequency (Rare/Sometimes/Frequently Asked)
  - Posted By + Date

- **View Questions**: Card-based display with:
  - Company logos and names
  - Question preview with expandable details
  - Frequency indicators (⭐⭐⭐ for Frequently Asked)
  - Like 👍 and View 👀 counters
  - Posted by information and timestamps

- **Advanced Filtering & Sorting**:
  - Search by question text, company, or role
  - Filter by Company, Role, Difficulty, and Frequency
  - Sort by Most Recent, Most Viewed, Most Liked, or Most Frequent

### 💬 General Chat Room
- **Real-time Messaging**: Live chat with Socket.IO
- **Public Discussion**: Everyone (juniors & seniors) can participate
- **User-friendly Interface**: Clean design with avatars and timestamps
- **Guidelines**: Built-in chat guidelines for respectful discussions
- **Persistent Usernames**: Username saved in localStorage

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Frontend**: EJS templates, Bootstrap 5, Font Awesome
- **Real-time**: Socket.IO
- **Styling**: Custom CSS with modern gradients and animations

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd campus
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up MongoDB**
   - Make sure MongoDB is installed and running on your system
   - The application will connect to `mongodb://localhost:27017/campus`

4. **Start the application**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Access the application**
   - Open your browser and go to `http://localhost:3000`
   - Navigate to Interview Questions or Chat sections

## 📁 Project Structure

```
campus/
├── index.js                 # Main server file
├── package.json            # Dependencies and scripts
├── models/
│   ├── Question.js         # Interview question model
│   └── ChatMessage.js      # Chat message model
├── views/
│   ├── index.ejs           # Home page
│   ├── interview-questions.ejs  # Interview questions page
│   ├── chat.ejs            # Chat room page
│   └── partials/
│       └── header.ejs      # Navigation header
├── public/
│   ├── css/
│   │   └── style.css       # Custom styles
│   └── js/
│       ├── interview-questions.js  # Interview questions functionality
│       └── chat.js         # Chat functionality
└── README.md               # This file
```

## 🎨 Design Features

- **Modern UI**: Clean, responsive design with Bootstrap 5
- **Company Branding**: Custom logos for major tech companies
- **Interactive Elements**: Hover effects, smooth animations
- **Mobile Responsive**: Works perfectly on all device sizes
- **Color-coded Frequency**: Visual indicators for question frequency
- **Real-time Updates**: Live chat and dynamic content updates

## 🔧 API Endpoints

### Questions
- `GET /api/questions` - Get all questions with optional filters
- `POST /api/questions` - Add a new question
- `PUT /api/questions/:id/like` - Like a question
- `PUT /api/questions/:id/view` - Increment view count

### Chat
- `POST /api/chat` - Send a chat message
- `GET /chat` - Chat room page
- `GET /interview-questions` - Interview questions page

## 🚀 Usage

### Adding Interview Questions
1. Navigate to the Interview Questions page
2. Click "Add New Question" button
3. Fill in all required fields
4. Submit the form

### Using the Chat
1. Go to the Chat page
2. Enter your username
3. Start typing messages
4. Messages appear in real-time for all users

### Filtering Questions
1. Use the search bar to find specific questions
2. Apply filters using the dropdown menus
3. Sort results by different criteria
4. Clear filters to reset the view

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the ISC License.

## 🆘 Support

For support or questions, please open an issue in the repository.

---

**Built with ❤️ for the campus community**

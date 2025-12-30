# AI Productivity Manager - Complete MERN Stack App

A comprehensive AI-powered smart task and productivity management application built with the MERN stack (MongoDB, Express.js, React, Node.js) integrated with OpenAI API.

## 🌟 Features

### Core Task Management
- ✅ User authentication with JWT
- ✅ Create, read, update, delete tasks
- ✅ Task categorization and prioritization
- ✅ Subtasks and checklist support
- ✅ Multiple task statuses (todo, in-progress, completed, postponed)

### 🤖 AI-Powered Features
- **Energy-Based Task Suggestions**: Get personalized task recommendations based on your current energy level
- **Mood-Based Task Matching**: AI matches tasks to your emotional state
- **Task Difficulty Prediction**: Automatic task difficulty assessment using AI
- **Smart Fatigue Detection**: Identifies when users are overtaxed and suggests task breakdown
- **AI-Generated Daily Summaries**: Intelligent end-of-day productivity insights
- **Workload Prediction**: AI predicts tomorrow's workload and suggests adjustments
- **Task Grouping**: AI automatically groups related tasks for better organization
- **Break Suggestions**: Smart recommendations for breaks based on work duration

### 📊 Analytics & Insights
- Daily and weekly productivity statistics
- Visual charts and analytics
- Mood and energy tracking
- Productivity scoring
- Streak tracking with badges
- Progress visualization

### 🎯 Motivation System
- Daily completion streaks
- Achievement badges (Week Warrior, Month Master, Century Club)
- AI-generated encouragement messages
- Progress bars and visual feedback

### 🎨 User Interface
- Modern, clean dashboard design
- Light/Dark mode support
- Responsive design (mobile, tablet, desktop)
- Smooth micro-animations with Framer Motion
- Intuitive navigation and task management

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **Zustand** - State management
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **OpenAI API** - AI integration
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin support

## 📦 Project Structure

```
ai-productivity-app/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Task.js
│   │   ├── MoodEnergyLog.js
│   │   ├── ProductivityStats.js
│   │   └── Streak.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── taskController.js
│   │   ├── insightController.js
│   │   └── streakController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── taskRoutes.js
│   │   ├── insightRoutes.js
│   │   └── streakRoutes.js
│   ├── services/
│   │   └── aiService.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── config/
│   │   └── database.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Layout.jsx
    │   │   ├── Sidebar.jsx
    │   │   └── Navbar.jsx
    │   ├── pages/
    │   │   ├── Landing.jsx
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── TaskManager.jsx
    │   │   ├── AIInsights.jsx
    │   │   └── Profile.jsx
    │   ├── store/
    │   │   └── store.js
    │   ├── utils/
    │   │   ├── api.js
    │   │   └── helpers.js
    │   ├── styles/
    │   │   └── globals.css
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── package.json
    └── .gitignore
```

## 🚀 Getting Started

### Prerequisites
- Node.js 14+ and npm/yarn
- MongoDB account (Atlas or local)
- OpenAI API key

### Backend Setup

1. **Clone and navigate to backend:**
   ```bash
   cd ai-productivity-app/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables:**
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-productivity
   JWT_SECRET=your_super_secret_jwt_key_here
   OPENAI_API_KEY=sk-your_openai_api_key_here
   NODE_ENV=development
   ```

5. **Start the server:**
   ```bash
   npm run dev
   ```

Server runs on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend:**
   ```bash
   cd ai-productivity-app/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

App runs on `http://localhost:3000`

## 📚 API Documentation

### Authentication
```
POST   /api/auth/signup              - Register new user
POST   /api/auth/login               - Login user
GET    /api/auth/profile             - Get user profile (protected)
PUT    /api/auth/profile             - Update profile (protected)
POST   /api/auth/logout              - Logout (protected)
```

### Tasks
```
POST   /api/tasks                    - Create task (protected)
GET    /api/tasks                    - Get all tasks (protected)
GET    /api/tasks/:id                - Get single task (protected)
PUT    /api/tasks/:id                - Update task (protected)
DELETE /api/tasks/:id                - Delete task (protected)
POST   /api/tasks/:id/subtasks       - Add subtask (protected)
PUT    /api/tasks/:id/subtasks/:subId - Toggle subtask (protected)
```

### Insights & AI
```
POST   /api/insights/mood-energy          - Log mood and energy (protected)
POST   /api/insights/energy-suggestions   - Get energy-based suggestions (protected)
POST   /api/insights/mood-tasks           - Get mood-matched tasks (protected)
GET    /api/insights/fatigue-analysis     - Analyze fatigue (protected)
POST   /api/insights/break-suggestions    - Get break suggestions (protected)
GET    /api/insights/mood-history         - Get mood history (protected)
```

### Statistics & Streaks
```
GET    /api/stats/streak             - Get streak info (protected)
PUT    /api/stats/streak             - Update streak (protected)
GET    /api/stats/daily-stats        - Get daily stats (protected)
GET    /api/stats/weekly-stats       - Get weekly stats (protected)
GET    /api/stats/daily-summary      - Generate AI summary (protected)
GET    /api/stats/workload-prediction - Predict workload (protected)
GET    /api/stats/group-tasks        - Group similar tasks (protected)
```

## 🔐 Security Features
- JWT-based authentication
- Password hashing with bcryptjs
- Protected routes with middleware
- Environment variable configuration
- CORS enabled for frontend

## 🧠 AI Integration Details

All AI features use OpenAI API with structured prompts:
- Task difficulty prediction
- Energy-based prioritization
- Mood matching
- Fatigue detection
- Daily summarization
- Workload prediction
- Task grouping
- Break suggestions

## 📈 Database Schema

### User
- name, email, password
- avatar, timezone, language
- theme, daily goal
- timestamps

### Task
- title, description
- category, priority, difficulty
- status, dates
- subtasks, AI predictions
- energy/mood requirements

### MoodEnergyLog
- mood, energy level, stress
- motivation, focus levels
- daily tracking

### ProductivityStats
- daily/weekly metrics
- completion rates
- AI summaries
- recommendations

### Streak
- current/longest streaks
- total completions
- badges unlocked
- check-in history

## 🎨 Design Highlights
- Gradient backgrounds
- Card-based UI components
- Smooth transitions and animations
- Loading states
- Error handling
- Responsive grid layouts
- Dark mode support
- Accessibility features

## 🚨 Error Handling
- Try-catch blocks in all API calls
- User-friendly error messages
- Validation on frontend and backend
- Safe API error parsing
- Fallback UI states

## 🔄 Future Enhancements
- Real-time notifications
- Mobile app version
- Advanced analytics
- Team collaboration features
- Task templates
- Integration with calendar apps
- Email reminders
- Advanced AI customization

## 📝 License
This project is open source and available under the MIT License.

## 👨‍💻 Development Notes

### Key Components Used
- **Framer Motion**: Smooth animations and transitions
- **Zustand**: Lightweight state management
- **Axios**: Interceptor for token handling
- **Recharts**: Data visualization
- **Tailwind CSS**: Utility-first styling

### Best Practices Implemented
- Modular component structure
- Separation of concerns (MVC pattern)
- Reusable utility functions
- Clean API layer abstraction
- Error boundaries
- Loading states
- Protected routes

### Testing Recommendations
1. Test all authentication flows
2. Test AI API integration
3. Test task CRUD operations
4. Test state management
5. Test responsive design
6. Test error scenarios

## 🎯 Project Evaluation Criteria Met
✅ MERN stack implementation  
✅ AI API integration (OpenAI)  
✅ Clean, modern UI/UX  
✅ Real-world productivity logic  
✅ Well-structured, maintainable code  
✅ Comprehensive feature set  
✅ Professional documentation  

---

Built with ❤️ as a final-year MERN + AI integration project

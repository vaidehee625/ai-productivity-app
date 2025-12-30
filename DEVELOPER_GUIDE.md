# 🎓 AI PRODUCTIVITY MANAGER - DEVELOPER'S QUICK REFERENCE

## ⚡ 5-Minute Quick Start

### Windows Users
```batch
cd ai-productivity-app
setup.bat
```

### macOS/Linux Users
```bash
cd ai-productivity-app
chmod +x setup.sh
./setup.sh
```

### Manual Setup (All Platforms)
```bash
# Terminal 1 - Backend
cd ai-productivity-app/backend
npm install
cp .env.example .env
# Edit .env with your keys
npm run dev
# Backend runs on http://localhost:5000

# Terminal 2 - Frontend
cd ai-productivity-app/frontend
npm install
npm run dev
# Frontend runs on http://localhost:3000
```

---

## 🔑 Required Configuration

### 1. MongoDB Atlas Setup
1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Create database user
4. Get connection string
5. Add to `backend/.env`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-productivity?retryWrites=true&w=majority
```

### 2. OpenAI API Setup
1. Sign up at https://platform.openai.com
2. Create API key
3. Add to `backend/.env`:
```
OPENAI_API_KEY=sk-your_key_here
```

### 3. JWT Secret
Generate and add to `backend/.env`:
```
JWT_SECRET=your_super_secret_key_here_change_in_production
```

---

## 📋 Backend File Structure

```
backend/
├── server.js                 # Main Express app
├── package.json             # Dependencies
├── .env.example             # Config template
│
├── models/
│   ├── User.js             # User schema with auth
│   ├── Task.js             # Task schema
│   ├── MoodEnergyLog.js    # Mood tracking
│   ├── ProductivityStats.js # Statistics
│   └── Streak.js           # Streaks & badges
│
├── controllers/
│   ├── authController.js   # Signup/Login
│   ├── taskController.js   # Task CRUD
│   ├── insightController.js # AI insights
│   └── streakController.js # Stats
│
├── routes/
│   ├── authRoutes.js       # /api/auth
│   ├── taskRoutes.js       # /api/tasks
│   ├── insightRoutes.js    # /api/insights
│   └── streakRoutes.js     # /api/stats
│
├── services/
│   └── aiService.js        # OpenAI integration
│
├── middleware/
│   └── authMiddleware.js   # JWT & errors
│
└── config/
    └── database.js         # MongoDB connection
```

### Running Backend
```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm start

# Server runs on http://localhost:5000
# Health check: GET http://localhost:5000/api/health
```

---

## 🎨 Frontend File Structure

```
frontend/src/
│
├── App.jsx                 # Main app routing
├── main.jsx               # React entry point
│
├── pages/
│   ├── Landing.jsx        # Marketing page
│   ├── Login.jsx          # Login form
│   ├── Signup.jsx         # Signup form
│   ├── Dashboard.jsx      # Main dashboard
│   ├── TaskManager.jsx    # Task management
│   ├── AIInsights.jsx     # AI features
│   └── Profile.jsx        # User profile
│
├── components/
│   ├── Layout.jsx         # Layout wrapper
│   ├── Sidebar.jsx        # Navigation
│   └── Navbar.jsx         # Top bar
│
├── store/
│   └── store.js          # State management (Zustand)
│
├── utils/
│   ├── api.js            # Axios client
│   └── helpers.js        # Utility functions
│
└── styles/
    └── globals.css       # Global styles
```

### Running Frontend
```bash
# Development mode
npm run dev
# Opens at http://localhost:3000 automatically

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🔗 API Quick Reference

### Authentication
```javascript
// Sign up
POST /api/auth/signup
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}

// Login
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}

// Get profile
GET /api/auth/profile
Headers: { Authorization: "Bearer TOKEN" }

// Update profile
PUT /api/auth/profile
Headers: { Authorization: "Bearer TOKEN" }
{
  "name": "New Name",
  "timezone": "EST",
  "theme": "dark",
  "dailyGoal": 5
}
```

### Tasks
```javascript
// Create task
POST /api/tasks
{
  "title": "Complete project",
  "description": "Finish MERN app",
  "priority": "high",
  "category": "work",
  "estimatedTime": 120
}

// Get all tasks
GET /api/tasks?status=todo&priority=high

// Update task
PUT /api/tasks/:id
{
  "status": "completed",
  "actualTime": 100
}

// Delete task
DELETE /api/tasks/:id

// Add subtask
POST /api/tasks/:id/subtasks
{
  "title": "Subtask title"
}

// Toggle subtask
PUT /api/tasks/:id/subtasks/:subtaskId
```

### AI Insights
```javascript
// Log mood & energy
POST /api/insights/mood-energy
{
  "mood": "happy",
  "energyLevel": "high",
  "stressLevel": 3,
  "motivationLevel": 8,
  "focusLevel": 9
}

// Get energy-based suggestions
POST /api/insights/energy-suggestions
{
  "energyLevel": "medium"
}

// Get mood-based tasks
POST /api/insights/mood-tasks
{
  "mood": "stressed"
}

// Check fatigue
GET /api/insights/fatigue-analysis

// Get break suggestions
POST /api/insights/break-suggestions
{
  "continuousWorkMinutes": 120
}

// Get mood history
GET /api/insights/mood-history?days=7
```

### Statistics
```javascript
// Get streak
GET /api/stats/streak

// Update streak (after completing task)
PUT /api/stats/streak

// Get today's stats
GET /api/stats/daily-stats

// Get week's stats
GET /api/stats/weekly-stats

// Generate AI summary
GET /api/stats/daily-summary

// Predict workload
GET /api/stats/workload-prediction

// Group similar tasks
GET /api/stats/group-tasks
```

---

## 🧪 Testing with cURL

### Test Backend is Running
```bash
curl http://localhost:5000/api/health
```

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test with Token
```bash
# Save token from login response as $TOKEN
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🎯 Development Workflow

### Adding a New Feature (Example: New AI Insight)

1. **Create Backend Route**
   - Add endpoint in `routes/insightRoutes.js`
   ```javascript
   router.post('/new-insight', protectRoute, getNewInsight);
   ```

2. **Create Controller Function**
   - Add function in `controllers/insightController.js`
   ```javascript
   export const getNewInsight = async (req, res) => {
     // Logic here
   };
   ```

3. **Add AI Service Method**
   - Add function in `services/aiService.js`
   ```javascript
   async generateNewInsight(data) {
     // AI prompt here
   }
   ```

4. **Create Frontend Component**
   - Add page or component in `pages/` or `components/`
   ```javascript
   function NewInsight() {
     // Component logic
   }
   ```

5. **Add State Management**
   - Update `store.js` if needed
   ```javascript
   setNewInsights: (insights) => set({ insights })
   ```

6. **Connect to API**
   - Use axios in component
   ```javascript
   const response = await API.post('/insights/new-insight', data);
   ```

---

## 🐛 Troubleshooting

### Backend Issues

**"Cannot find module"**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**"Port 5000 already in use"**
```bash
# Mac/Linux: Find process
lsof -i :5000

# Kill process
kill -9 <PID>

# Or use different port
PORT=5001 npm run dev
```

**"MongoDB connection failed"**
- Check MongoDB URI in .env
- Verify IP whitelist in MongoDB Atlas
- Ensure database exists

**"OpenAI API error"**
- Check API key validity
- Verify billing is enabled
- Check rate limits
- Ensure gpt-3.5-turbo model access

### Frontend Issues

**"localhost:3000 not loading"**
- Check if frontend is running
- Clear browser cache
- Try hard refresh (Ctrl+Shift+R)

**"API calls failing"**
- Ensure backend is running on port 5000
- Check CORS settings
- Verify API URL in `utils/api.js`

**"Styles not applying"**
```bash
# Rebuild Tailwind
npm run build

# Clear cache
rm -rf .next node_modules/.cache
```

---

## 📊 Database Commands

### MongoDB Atlas

**View Database:**
1. Go to mongodb.com/cloud/atlas
2. Click "Browse Collections"
3. Select your database and collection

**Query Data:**
```javascript
// In MongoDB Atlas console
db.users.find()
db.tasks.find({ status: "completed" })
db.streaks.find().limit(5)
```

**Backup:**
```bash
mongodump --uri "mongodb+srv://user:pass@cluster.mongodb.net/db"
```

**Restore:**
```bash
mongorestore --uri "mongodb+srv://user:pass@cluster.mongodb.net/db" ./dump
```

---

## 🚀 Deployment Checklist

Before deploying:

- [ ] All environment variables configured
- [ ] MongoDB credentials set
- [ ] OpenAI API key set
- [ ] JWT secret changed
- [ ] CORS configured for domain
- [ ] Error logging enabled
- [ ] Database backups configured
- [ ] SSL/HTTPS enabled
- [ ] Rate limiting considered
- [ ] All tests passing

**Deploy Backend:**
```bash
# To Heroku
heroku login
heroku create your-app-name
git push heroku main

# To Railway
railway init
railway link
railway up

# To Render
# Use GitHub integration directly
```

**Deploy Frontend:**
```bash
# To Vercel
npm install -g vercel
vercel

# To Netlify
npm install -g netlify-cli
netlify deploy

# To GitHub Pages
npm run build
# Upload dist folder to GitHub Pages
```

---

## 📚 Learning Resources

- [React Docs](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [MongoDB University](https://university.mongodb.com)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion)

---

## 💡 Tips & Best Practices

### Frontend
- Use React DevTools for debugging
- Check Network tab for API calls
- Use Zustand DevTools for state debugging
- Clear localStorage if stuck
- Use console.log for debugging

### Backend
- Check request/response in Postman
- Use MongoDB Compass for database
- Monitor server logs
- Test APIs with cURL first
- Use try-catch for all async

### General
- Keep .env secure
- Never commit .env
- Use meaningful variable names
- Comment complex logic
- Test before pushing
- Use git branches

---

## 📞 Getting Help

1. **Check Documentation**
   - README.md - Features & overview
   - DEPLOYMENT_GUIDE.md - Setup issues
   - AI_PROMPTS.md - AI examples
   - FILE_INVENTORY.md - File locations

2. **Debug Systematically**
   - Check error messages
   - Review logs
   - Test with Postman/cURL
   - Check browser console
   - Verify configuration

3. **Common Issues**
   - Clear cache & reinstall
   - Restart servers
   - Check port availability
   - Verify API keys
   - Review error logs

---

## 🎉 You're All Set!

Your complete AI Productivity Manager is ready to:
- ✅ Manage tasks intelligently
- ✅ Track mood & energy
- ✅ Get AI recommendations
- ✅ Monitor streaks & progress
- ✅ Generate insights
- ✅ Improve productivity

**Happy coding! 🚀**

---

**Last Updated:** December 21, 2025  
**Version:** 1.0.0  
**Status:** Production Ready

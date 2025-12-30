# AI Productivity Backend

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (copy from `.env.example`):
```bash
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
OPENAI_API_KEY=your_openai_api_key
NODE_ENV=development
```

3. Start development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/logout` - Logout

### Tasks
- `POST /api/tasks` - Create a new task
- `GET /api/tasks` - Get all user tasks
- `GET /api/tasks/:id` - Get specific task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/subtasks` - Add subtask
- `PUT /api/tasks/:id/subtasks/:subtaskId` - Toggle subtask

### Insights
- `POST /api/insights/mood-energy` - Log mood and energy
- `POST /api/insights/energy-suggestions` - Get energy-based task suggestions
- `POST /api/insights/mood-tasks` - Get mood-based task recommendations
- `GET /api/insights/fatigue-analysis` - Analyze task fatigue
- `POST /api/insights/break-suggestions` - Get break recommendations
- `GET /api/insights/mood-history` - Get mood history

### Stats & Streaks
- `GET /api/stats/streak` - Get streak information
- `PUT /api/stats/streak` - Update streak
- `GET /api/stats/daily-stats` - Get daily statistics
- `GET /api/stats/weekly-stats` - Get weekly statistics
- `GET /api/stats/daily-summary` - Generate AI daily summary
- `GET /api/stats/workload-prediction` - Predict next day workload
- `GET /api/stats/group-tasks` - Group tasks by similarity

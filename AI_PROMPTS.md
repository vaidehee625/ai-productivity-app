# AI Service - Prompt Examples

This document shows the actual AI prompts used in the application.

## 1. Task Difficulty Prediction

**Purpose:** Determine if a task is easy, medium, or hard
**Model:** GPT-3.5-turbo
**Response Format:** JSON

```javascript
const prompt = `
  Based on the following task, predict its difficulty level (easy, medium, or hard).
  
  Task Title: ${taskTitle}
  Task Description: ${taskDescription}
  
  Respond in JSON format: { "difficulty": "easy|medium|hard", "reasoning": "brief explanation" }
`;
```

**Example Response:**
```json
{
  "difficulty": "medium",
  "reasoning": "Requires coordination with multiple teams but follows standard procedures"
}
```

## 2. Energy-Based Task Suggestions

**Purpose:** Recommend tasks based on user's current energy level
**Model:** GPT-3.5-turbo

```javascript
const prompt = `
  You are a productivity coach. Given the following tasks and the user's current energy level, 
  suggest which tasks they should prioritize.
  
  Current Energy Level: ${energyLevel}
  
  Available Tasks:
  ${taskList}
  
  Provide recommendations considering:
  - High energy: Complex, important tasks
  - Medium energy: Balanced mix
  - Low energy: Simple, quick wins
  
  Respond in JSON format: { "prioritizedTasks": ["task1", "task2", ...], "reasoning": "brief explanation" }
`;
```

**Example Response:**
```json
{
  "prioritizedTasks": ["Quick email check", "Review documents", "Team meeting"],
  "reasoning": "Start with low-effort tasks to build momentum, then tackle medium tasks"
}
```

## 3. Mood-Based Task Matching

**Purpose:** Match tasks to user's emotional state
**Model:** GPT-3.5-turbo

```javascript
const prompt = `
  You are a productivity coach. Given the user's current mood and available tasks, 
  suggest the best tasks to work on.
  
  Current Mood: ${mood}
  (Happy: Motivated and positive | Neutral: Balanced | Stressed: Overwhelmed)
  
  Available Tasks:
  ${taskList}
  
  Suggest tasks that would be suitable for the user's current emotional state.
  
  Respond in JSON format: { "recommendedTasks": ["task1", "task2", ...], "moodTips": "brief motivation tips" }
`;
```

**Example Response:**
```json
{
  "recommendedTasks": ["Organize workspace", "Light documentation", "Team catch-up"],
  "moodTips": "You're feeling stressed. Focus on achievable tasks that bring quick wins and boost confidence"
}
```

## 4. Task Fatigue Detection

**Purpose:** Identify if user is overwhelmed
**Model:** GPT-3.5-turbo

```javascript
const prompt = `
  A user has postponed ${postponedTasks} out of ${totalTasks} tasks (${postponementRate.toFixed(2)}% postponement rate).
  
  Based on this pattern, is the user experiencing task fatigue? Provide advice.
  
  Respond in JSON format: { "hasFatigue": boolean, "severity": "low|medium|high", "advice": "personalized suggestion" }
`;
```

**Example Response:**
```json
{
  "hasFatigue": true,
  "severity": "medium",
  "advice": "Break large tasks into smaller, manageable subtasks. Consider reducing daily goal by 20%"
}
```

## 5. Daily Productivity Summary

**Purpose:** Generate end-of-day AI summary
**Model:** GPT-3.5-turbo

```javascript
const prompt = `
  Generate an encouraging and insightful end-of-day productivity summary based on these stats:
  - Tasks Completed: ${stats.tasksCompleted}
  - Tasks Created: ${stats.tasksCreated}
  - Tasks Postponed: ${stats.tasksPostponed}
  - Total Time Spent: ${stats.totalTimeSpent} minutes
  - Productivity Score: ${stats.productivityScore}/100
  - Top Category: ${stats.topCategory}
  
  Provide a concise, motivating summary with actionable recommendations for tomorrow.
  
  Respond in JSON format: { "summary": "2-3 sentence summary", "recommendations": ["rec1", "rec2", "rec3"] }
`;
```

**Example Response:**
```json
{
  "summary": "Great work today! You completed 6 tasks and maintained focus for 4 hours. Your productivity score of 75% shows excellent progress.",
  "recommendations": [
    "Continue with work-focused tasks tomorrow while energy is high",
    "Add a 15-minute break every 90 minutes to maintain focus",
    "Start with easier tasks to build momentum"
  ]
}
```

## 6. Workload Prediction

**Purpose:** Predict next day's workload
**Model:** GPT-3.5-turbo

```javascript
const prompt = `
  Based on the user's current tasks and historical productivity data, predict the workload for tomorrow.
  
  Current Tasks Pending: ${tasks.length}
  Average Daily Tasks: ${historicalData.avgDailyTasks}
  Trend: ${historicalData.trend}
  
  Provide a workload prediction and suggest if the user should add or reduce tasks.
  
  Respond in JSON format: { "workloadLevel": "low|medium|high|very-high", "estimatedTasks": number, "suggestion": "advice" }
`;
```

**Example Response:**
```json
{
  "workloadLevel": "high",
  "estimatedTasks": 8,
  "suggestion": "Consider deferring 2-3 non-urgent tasks to maintain work-life balance"
}
```

## 7. Task Grouping

**Purpose:** Group similar tasks
**Model:** GPT-3.5-turbo

```javascript
const prompt = `
  Group the following tasks by similarity or related themes:
  
  ${taskList}
  
  Create logical groupings that help with task organization and batch processing.
  
  Respond in JSON format: { "groups": [{ "groupName": "string", "tasks": ["task1", "task2", ...] }] }
`;
```

**Example Response:**
```json
{
  "groups": [
    {
      "groupName": "Communication",
      "tasks": ["Send email", "Follow up with client", "Team meeting"]
    },
    {
      "groupName": "Development",
      "tasks": ["Fix bug", "Refactor code", "Write tests"]
    }
  ]
}
```

## 8. Break Suggestions

**Purpose:** Recommend break timing
**Model:** GPT-3.5-turbo

```javascript
const prompt = `
  A user has been working continuously for ${continuousWorkMinutes} minutes.
  Based on productivity science and focus cycles, suggest appropriate break timing.
  
  Consider the Pomodoro technique and deeper work sessions.
  
  Respond in JSON format: { "shouldTakeBreak": boolean, "breakDuration": number, "suggestion": "activity" }
`;
```

**Example Response:**
```json
{
  "shouldTakeBreak": true,
  "breakDuration": 20,
  "suggestion": "Take a walk, get fresh air, and hydrate. This will reset your focus for the next deep work session"
}
```

## 9. Encouragement Message

**Purpose:** Generate personalized motivation
**Model:** GPT-3.5-turbo (higher temperature for creativity)

```javascript
const prompt = `
  Generate a personalized, short encouragement message for a user with:
  - Current Streak: ${streakCount} days
  - Current Mood: ${moodData.mood}
  - Motivation Level: ${moodData.motivationLevel}/10
  
  Make it uplifting and specific to their progress.
  
  Respond in JSON format: { "message": "personalized encouragement" }
`;
```

**Example Response:**
```json
{
  "message": "🔥 You're on fire! 7 days straight - that's incredible dedication. Your momentum is building, keep it up!"
}
```

## Best Practices for AI Integration

### 1. Prompt Engineering
- Be specific and clear
- Provide context
- Request JSON format for parsing
- Include examples when helpful

### 2. Error Handling
```javascript
try {
  const response = await openai.chat.completions.create({...});
  return JSON.parse(response.choices[0].message.content);
} catch (error) {
  console.error('AI Error:', error);
  return defaultResponse; // Safe fallback
}
```

### 3. Rate Limiting
- Cache responses when possible
- Implement exponential backoff
- Set timeout limits
- Monitor API usage

### 4. Cost Optimization
- Use gpt-3.5-turbo (cheaper than gpt-4)
- Batch requests when possible
- Cache common prompts
- Monitor token usage

## Temperature Settings

Different temperatures for different tasks:
```javascript
// Creative tasks (encouragement, summaries)
temperature: 0.8

// Analytical tasks (difficulty, grouping)
temperature: 0.7

// Precise tasks (fatigue detection)
temperature: 0.5
```

## Testing AI Responses

Example test prompt:
```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Your prompt here"}],
    "temperature": 0.7
  }'
```

---

**Note:** All prompts are designed to return structured JSON for easy parsing in the application.

import { OpenAI } from 'openai';

// Lazy-load OpenAI client to ensure env vars are loaded first
let openai;
const getOpenAI = () => {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
};

export const aiService = {
  // Deterministic task difficulty classifier
  async getTaskDifficulty(taskText) {
    try {
      const prompt = `Classify the difficulty of the following task. Respond with ONLY one word: Easy, Medium, or Hard. Task: "${taskText}"`;

      const response = await getOpenAI().chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
      });

      const raw = response.choices?.[0]?.message?.content?.trim() || '';
      const normalized = raw.replace(/[^a-zA-Z]/g, '').toLowerCase();
      const mapped = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
      return mapped[normalized] || 'Medium';
    } catch (error) {
      console.error('Error classifying task difficulty:', error);
      return 'Medium';
    }
  },

  // Energy-based task ordering (returns array of IDs)
  async getEnergyTaskOrder(energyLevel, tasks) {
    const prompt = `You are a productivity assistant.

User energy level: ${energyLevel}

Here are the user's pending tasks:
${JSON.stringify(tasks, null, 2)}

Rules:
- High energy → allow harder and longer tasks
- Medium energy → prefer medium tasks
- Low energy → prefer easy and short tasks

Return ONLY a JSON array of task IDs in recommended order.
Example:
["2", "1", "3"]`;

    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
    });

    const content = response.choices?.[0]?.message?.content?.trim() || '[]';
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed.map((id) => String(id));
      }
      return [];
    } catch (err) {
      console.error('Failed to parse energy task order:', err, 'raw:', content);
      return [];
    }
  },

  // Mood-based task ordering (returns array of IDs)
  async getMoodTaskOrder(mood, tasks) {
    const prompt = `You are a productivity assistant.

User mood: ${mood}

Here are the user's pending tasks:
${JSON.stringify(tasks, null, 2)}

Guidelines:
- If mood is Stressed → suggest lighter, low-pressure tasks
- If mood is Neutral → balanced tasks
- If mood is Happy → challenging or creative tasks are allowed

Return ONLY a JSON array of task IDs in recommended order.
Example:
["1", "2"]`;

    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
    });

    const content = response.choices?.[0]?.message?.content?.trim() || '[]';
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed.map((id) => String(id));
      return [];
    } catch (err) {
      console.error('Failed to parse mood task order:', err, 'raw:', content);
      return [];
    }
  },

  // Predict task difficulty
  async predictTaskDifficulty(taskTitle, taskDescription) {
    try {
      const prompt = `
        Based on the following task, predict its difficulty level (easy, medium, or hard).
        
        Task Title: ${taskTitle}
        Task Description: ${taskDescription}
        
        Respond in JSON format: { "difficulty": "easy|medium|hard", "reasoning": "brief explanation" }
      `;

      const response = await getOpenAI().chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('Error predicting difficulty:', error);
      return { difficulty: 'medium', reasoning: 'Unable to predict, defaulting to medium' };
    }
  },

  // Energy-based task suggestions
  async getEnergyBasedSuggestions(tasks, energyLevel) {
    try {
      const taskList = tasks.map(t => `- ${t.title} (Priority: ${t.priority})`).join('\n');
      
      const prompt = `
        You are a productivity coach. Given the following tasks and the user's current energy level, suggest which tasks they should prioritize.
        
        Current Energy Level: ${energyLevel}
        
        Available Tasks:
        ${taskList}
        
        Provide recommendations considering:
        - High energy: Complex, important tasks
        - Medium energy: Balanced mix
        - Low energy: Simple, quick wins
        
        Respond in JSON format: { "prioritizedTasks": ["task1", "task2", ...], "reasoning": "brief explanation" }
      `;

      const response = await getOpenAI().chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('Error getting energy-based suggestions:', error);
      return { prioritizedTasks: [], reasoning: 'Unable to get suggestions' };
    }
  },

  // Mood-based task matching
  async getMoodBasedTasks(tasks, mood) {
    try {
      const taskList = tasks.map(t => `- ${t.title} (Category: ${t.category})`).join('\n');
      
      const prompt = `
        You are a productivity coach. Given the user's current mood and available tasks, suggest the best tasks to work on.
        
        Current Mood: ${mood}
        (Happy: Motivated and positive | Neutral: Balanced | Stressed: Overwhelmed)
        
        Available Tasks:
        ${taskList}
        
        Suggest tasks that would be suitable for the user's current emotional state.
        
        Respond in JSON format: { "recommendedTasks": ["task1", "task2", ...], "moodTips": "brief motivation tips" }
      `;

      const response = await getOpenAI().chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('Error getting mood-based tasks:', error);
      return { recommendedTasks: [], moodTips: 'Take a break and refresh' };
    }
  },

  // Detect task fatigue
  async detectTaskFatigue(postponedTasks, totalTasks) {
    try {
      const postponementRate = (postponedTasks / totalTasks) * 100;
      
      const prompt = `
        A user has postponed ${postponedTasks} out of ${totalTasks} tasks (${postponementRate.toFixed(2)}% postponement rate).
        
        Based on this pattern, is the user experiencing task fatigue? Provide advice.
        
        Respond in JSON format: { "hasFatigue": boolean, "severity": "low|medium|high", "advice": "personalized suggestion for task breakdown or rest" }
      `;

      const response = await getOpenAI().chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('Error detecting fatigue:', error);
      return { hasFatigue: false, severity: 'low', advice: 'Keep working on your goals!' };
    }
  },

  // Generate daily summary
  async generateDailySummary(stats) {
    try {
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

      const response = await getOpenAI().chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('Error generating summary:', error);
      return {
        summary: 'Great work today! Keep pushing forward.',
        recommendations: ['Rest well', 'Plan tomorrow', 'Stay hydrated'],
      };
    }
  },

  // Predict next day workload
  async predictNextDayWorkload(tasks, historicalData) {
    try {
      const prompt = `
        Based on the user's current tasks and historical productivity data, predict the workload for tomorrow.
        
        Current Tasks Pending: ${tasks.length}
        Average Daily Tasks: ${historicalData.avgDailyTasks}
        Trend: ${historicalData.trend}
        
        Provide a workload prediction and suggest if the user should add or reduce tasks.
        
        Respond in JSON format: { "workloadLevel": "low|medium|high|very-high", "estimatedTasks": number, "suggestion": "advice" }
      `;

      const response = await getOpenAI().chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('Error predicting workload:', error);
      return {
        workloadLevel: 'medium',
        estimatedTasks: 5,
        suggestion: 'Maintain a balanced workload',
      };
    }
  },

  // Group tasks by similarity
  async groupTasksBySimilarity(tasks) {
    try {
      const taskList = tasks.map(t => `- ${t.title}: ${t.description}`).join('\n');
      
      const prompt = `
        Group the following tasks by similarity or related themes:
        
        ${taskList}
        
        Create logical groupings that help with task organization and batch processing.
        
        Respond in JSON format: { "groups": [{ "groupName": "string", "tasks": ["task1", "task2", ...] }] }
      `;

      const response = await getOpenAI().chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('Error grouping tasks:', error);
      return { groups: [] };
    }
  },

  // Suggest breaks based on work duration
  async suggestBreaks(continuousWorkMinutes) {
    try {
      const prompt = `
        A user has been working continuously for ${continuousWorkMinutes} minutes.
        Based on productivity science and focus cycles, suggest appropriate break timing and activities.
        
        Consider the Pomodoro technique and deeper work sessions.
        
        Respond in JSON format: { "shouldTakeBreak": boolean, "breakDuration": number, "suggestion": "specific break activity" }
      `;

      const response = await getOpenAI().chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('Error suggesting breaks:', error);
      return {
        shouldTakeBreak: continuousWorkMinutes > 90,
        breakDuration: 15,
        suggestion: 'Take a walk and get some water',
      };
    }
  },

  // Generate encouragement message
  async generateEncouragement(streakCount, moodData) {
    try {
      const prompt = `
        Generate a personalized, short encouragement message for a user with:
        - Current Streak: ${streakCount} days
        - Current Mood: ${moodData.mood}
        - Motivation Level: ${moodData.motivationLevel}/10
        
        Make it uplifting and specific to their progress.
        
        Respond in JSON format: { "message": "personalized encouragement" }
      `;

      const response = await getOpenAI().chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('Error generating encouragement:', error);
      return { message: "You're doing great! Keep up the amazing work!" };
    }
  },

  // Friendly break suggestion after long continuous work
  async getBreakSuggestion(continuousMinutes) {
    const prompt = `You are a productivity coach.

The user has been working continuously for ${continuousMinutes} minutes.
Suggest a short, healthy break.
Keep it friendly and practical.
Return exactly one suggestion in one sentence.`;

    try {
      const response = await getOpenAI().chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
      });

      const suggestion = response.choices?.[0]?.message?.content?.trim();
      return suggestion || null;
    } catch (error) {
      console.error('Error generating break suggestion:', error);
      return null;
    }
  },

  // End-of-day conversational summary (ChatGPT-style)
  async generateEndOfDaySummary(data) {
    const {
      completedCount,
      completedTaskTitles,
      pendingCount,
      energyLevel,
      mood,
      focusedMinutes,
      fatigueTaskTitles,
      postponedCount,
      peakHour,
      tomorrowTaskCount,
    } = data;

    const systemPrompt = `You are an intelligent productivity assistant.

Analyze the user's daily productivity data and generate a friendly, human-like end-of-day report.

Write in a natural, conversational tone similar to ChatGPT.
Do NOT mention raw JSON or database terms.
Do NOT sound robotic.`;

    const userPrompt = `Here is the user's productivity data for today:

Tasks completed:
- Count: ${completedCount}
- Examples: ${completedTaskTitles && completedTaskTitles.length ? completedTaskTitles.join(', ') : 'None'}

Tasks pending:
- Count: ${pendingCount}

Energy level today:
- ${energyLevel || 'Not logged'}

Mood today:
- ${mood || 'Not logged'}

Total focused work time:
- ${focusedMinutes} minutes

Fatigue-prone tasks:
- ${fatigueTaskTitles && fatigueTaskTitles.length ? fatigueTaskTitles.join(', ') : 'None'}

Postponed tasks count:
- ${postponedCount}

Peak productivity time:
- ${typeof peakHour === 'number' ? `${peakHour}:00` : 'Not observed'}

Tomorrow's pending workload:
- ${tomorrowTaskCount} tasks

Now generate an end-of-day productivity summary with the following structure:

1. A warm opening sentence
2. A short paragraph analyzing task completion
3. A paragraph about focus, energy, and mood
4. A gentle observation about fatigue or postponement (if any)
5. A practical suggestion for tomorrow
6. A short motivational closing line

Keep it concise but insightful.
Avoid bullet points.
Avoid emojis.`;

    try {
      const response = await getOpenAI().chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.65,
      });

      const content = response.choices?.[0]?.message?.content?.trim();
      return content || null;
    } catch (error) {
      console.error('Error generating end-of-day summary:', error);
      return null;
    }
  },

  // Task grouping by similarity (returns mapping of groupName -> [ids])
  async getGroupedTasks(tasks) {
    const prompt = `You are a task organization assistant.

Group the following tasks into meaningful categories based on similarity.

Tasks:
${JSON.stringify(tasks, null, 2)}

Rules:
- Create clear, human-readable category names
- Each task must appear in exactly one category
- Do not invent tasks
- Do not omit tasks

Return ONLY valid JSON in this format:
{
  "Study": ["1", "2"],
  "Communication": ["3"],
  "Personal": ["4"]
}`;

    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
    });

    const content = response.choices?.[0]?.message?.content?.trim() || '{}';
    try {
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed;
      }
      return {};
    } catch (err) {
      console.error('Failed to parse grouped tasks:', err, 'raw:', content);
      return {};
    }
  },

  // Generate subtask suggestions (5-7 actionable steps)
  async generateSubtaskSuggestions(title, description) {
    const prompt = `You are a helpful productivity assistant.\n\nBreak the following task into 5–7 small, actionable subtasks.\nKeep each subtask concise and specific.\nDo NOT include numbering or extra commentary.\nReturn ONLY valid JSON: { "subtasks": ["..."] }\n\nTask title: ${title}\nTask description: ${description || ''}`;

    try {
      const response = await getOpenAI().chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
      });
      const content = response.choices?.[0]?.message?.content?.trim() || '{"subtasks": []}';
      const parsed = JSON.parse(content);
      const items = Array.isArray(parsed.subtasks) ? parsed.subtasks.filter((s) => typeof s === 'string' && s.trim()) : [];
      return items.slice(0, 7);
    } catch (error) {
      console.error('Error generating subtask suggestions:', error);
      return [];
    }
  },

  // Predict tomorrow's workload as Light/Medium/Heavy using structured summary
  async getTomorrowWorkloadPrediction(summary) {
    const { totalTasks, easyTasks, mediumTasks, hardTasks, estimatedTotalMinutes } = summary;

    const prompt = `You are a productivity assistant.

Based on the following data, predict tomorrow’s workload.

Data:
- Total tasks: ${totalTasks}
- Easy tasks: ${easyTasks}
- Medium tasks: ${mediumTasks}
- Hard tasks: ${hardTasks}
- Estimated total work time: ${estimatedTotalMinutes} minutes

Rules:
- Light: few tasks, mostly easy, low total time
- Medium: balanced tasks and time
- Heavy: many tasks, multiple hard tasks, high total time

Return ONLY one word:
Light, Medium, or Heavy`;

    try {
      const response = await getOpenAI().chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
      });

      const raw = response.choices?.[0]?.message?.content?.trim() || '';
      const normalized = raw.replace(/[^a-zA-Z]/g, '').toLowerCase();
      if (normalized === 'light') return 'Light';
      if (normalized === 'heavy') return 'Heavy';
      if (normalized === 'medium') return 'Medium';
      return null;
    } catch (error) {
      console.error('Error predicting workload:', error);
      return null;
    }
  },

  // Generate daily productivity article based on user context
  async generateProductivityArticle(context) {
    const { energyLevel, mood, hasFatigue } = context;

    const systemPrompt = `You are a productivity and wellness coach.

Generate a personalized, original productivity article based on the user's current state.

Requirements:
- 200-300 words
- Conversational and engaging tone
- Practical and actionable
- DO NOT reference external articles or studies
- Include 2-3 key takeaways at the end
- Focus on one specific productivity concept or technique`;

    const userPrompt = `User's current state:
- Energy level: ${energyLevel || 'Not logged'}
- Mood: ${mood || 'Not logged'}
- Showing signs of fatigue: ${hasFatigue ? 'Yes' : 'No'}

Generate a productivity article with:
1. A compelling title
2. 200-300 words of practical advice tailored to their state
3. 2-3 key takeaways

Format your response as JSON:
{
  "title": "Article title",
  "content": "Full article text (200-300 words)",
  "takeaways": ["takeaway 1", "takeaway 2", "takeaway 3"]
}`;

    try {
      const response = await getOpenAI().chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
      });

      const content = response.choices?.[0]?.message?.content?.trim();
      if (!content) return null;

      const parsed = JSON.parse(content);
      return parsed;
    } catch (error) {
      console.error('Error generating productivity article:', error);
      return null;
    }
  },
};

export default aiService;

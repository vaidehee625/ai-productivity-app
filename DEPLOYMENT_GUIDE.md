# AI Productivity Manager - Setup & Deployment Guide

## Quick Start

### Step 1: Backend Setup (5 minutes)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your credentials
# MONGODB_URI = your MongoDB connection string
# OPENAI_API_KEY = your OpenAI API key

# Start server
npm run dev
```

**Backend runs at:** http://localhost:5000

### Step 2: Frontend Setup (5 minutes)

```bash
# In new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Frontend runs at:** http://localhost:3000

## Configuration Guide

### MongoDB Setup
1. Create account at [mongodb.com](https://www.mongodb.com)
2. Create a cluster
3. Get connection string
4. Add to `.env`: `MONGODB_URI=mongodb+srv://...`

### OpenAI Setup
1. Visit [openai.com/api](https://openai.com/api)
2. Create API key
3. Add to `.env`: `OPENAI_API_KEY=sk-...`

### JWT Secret
Generate a strong secret:
```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { [byte](Get-Random -Maximum 256) }))
```

## Deployment Checklist

### Before Production
- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT secret
- [ ] Configure MongoDB with proper auth
- [ ] Set up CORS for your domain
- [ ] Enable HTTPS
- [ ] Hide all API keys in `.env`
- [ ] Test all authentication flows
- [ ] Test AI API integration
- [ ] Optimize frontend bundle

### Hosting Options

**Backend:**
- Heroku
- Railway
- Render
- AWS EC2
- DigitalOcean

**Frontend:**
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

## Troubleshooting

### MongoDB Connection Issues
```bash
# Check connection string format
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# Verify IP whitelist in MongoDB Atlas
```

### OpenAI API Errors
```bash
# Check API key is valid
# Check rate limits
# Verify billing enabled
```

### CORS Errors
```javascript
// Update backend CORS config
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3000' // or your domain
}));
```

### Port Already in Use
```bash
# Mac/Linux: Find and kill process
lsof -i :5000
kill -9 <PID>

# Windows: Use different port
PORT=5001 npm run dev
```

## API Testing

### Using cURL

**Signup:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Create Task:**
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete project",
    "description": "Finish MERN app",
    "priority": "high",
    "category": "work",
    "estimatedTime": 120
  }'
```

## Performance Optimization

### Frontend
```bash
# Build for production
npm run build

# Analyze bundle
npm install --save-dev rollup-plugin-visualizer
```

### Backend
- Use MongoDB indexes
- Implement caching
- Use pagination
- Compress responses

## Security Best Practices

1. **Environment Variables**: Never commit `.env`
2. **API Keys**: Rotate regularly
3. **Passwords**: Hash with bcryptjs (done)
4. **JWT**: Use strong secret
5. **HTTPS**: Always use in production
6. **Validation**: Validate all inputs
7. **Rate Limiting**: Consider implementing
8. **CORS**: Whitelist trusted domains

## Monitoring

### What to Monitor
- API response times
- Error rates
- Database performance
- OpenAI API quota usage
- Server uptime

### Tools
- New Relic
- Datadog
- LogRocket
- Sentry
- CloudWatch

## Database Maintenance

### Backup MongoDB
```bash
mongodump --uri "mongodb+srv://..." --out ./backup

mongostore --uri "mongodb+srv://..." --dir ./backup
```

### Monitor Collections
```javascript
// Use MongoDB Compass
// Check index performance
// Review slow queries
```

## Scaling Considerations

As the app grows:
1. Implement Redis for caching
2. Use message queues (Bull, RabbitMQ)
3. Implement pagination for large datasets
4. Add CDN for static assets
5. Use load balancer
6. Consider microservices

## CI/CD Pipeline Example (GitHub Actions)

```yaml
name: Deploy

on: [push]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm install
      - run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: heroku/deploy-github-action@v1
```

## Support & Resources

- [Express.js Docs](https://expressjs.com)
- [MongoDB Docs](https://docs.mongodb.com)
- [React Docs](https://react.dev)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com)

---

**Questions?** Refer to the main [README.md](./README.md)

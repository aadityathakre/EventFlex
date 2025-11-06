# EventFlex - Production Deployment Guide

## 🎯 Overview

This guide will help you deploy EventFlex (both backend and frontend) to production.

## 📋 Prerequisites

- Node.js 18+ installed
- MongoDB database (MongoDB Atlas or self-hosted)
- Cloudinary account (for file uploads)
- Domain name (optional but recommended)
- SSL certificate (for HTTPS)

## 🗂️ Project Structure

```
EventFlex/
├── src/                    # Backend source code
├── frontend/               # Frontend React application
├── package.json           # Backend dependencies
└── .env                   # Backend environment variables
```

## 🔧 Backend Setup

### 1. Environment Variables

Create a `.env` file in the root directory:

```env
# Server
PORT=8000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net
CORS_ORIGIN=https://your-frontend-domain.com

# JWT
ACCESS_TOKEN_SECRET=your-super-secret-access-token-key-min-32-chars
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key-min-32-chars
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Aadhaar (Optional)
AADHAAR_SANDBOX_TOKEN=your-token
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Test Backend

```bash
npm run dev
```

Backend should run on `http://localhost:8000`

## 🎨 Frontend Setup

### 1. Navigate to Frontend Directory

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create `.env` file in `frontend/` directory:

```env
VITE_API_BASE_URL=https://your-api-domain.com/api/v1
VITE_APP_NAME=EventFlex
VITE_ENVIRONMENT=production
```

### 4. Test Frontend

```bash
npm run dev
```

Frontend should run on `http://localhost:3000`

## 🚀 Production Deployment Options

### Option 1: Separate Deployment (Recommended)

#### Backend Deployment (Railway, Render, Heroku, etc.)

1. **Railway.app**:
   - Connect your GitHub repository
   - Add environment variables
   - Deploy automatically

2. **Render.com**:
   - Create new Web Service
   - Connect repository
   - Set build command: `npm install`
   - Set start command: `node src/index.js`
   - Add environment variables

3. **Heroku**:
   ```bash
   heroku create eventflex-api
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=your-mongodb-uri
   # ... add all env vars
   git push heroku main
   ```

#### Frontend Deployment (Vercel, Netlify, etc.)

1. **Vercel**:
   ```bash
   cd frontend
   npm install -g vercel
   vercel
   ```
   - Follow prompts
   - Add environment variables in Vercel dashboard

2. **Netlify**:
   ```bash
   cd frontend
   npm run build
   netlify deploy --prod --dir=dist
   ```
   - Add environment variables in Netlify dashboard

3. **GitHub Pages**:
   - Build: `npm run build`
   - Deploy `dist` folder to GitHub Pages

### Option 2: Combined Deployment (Backend serves Frontend)

#### Update Backend to Serve Frontend

1. Install `path` module (if not already installed)

2. Update `src/app.js`:

```javascript
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ... existing code ...

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// API routes (must come before catch-all)
// ... existing routes ...

// Catch all handler (must be last)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});
```

3. Build frontend:
```bash
cd frontend
npm run build
```

4. Deploy backend (now includes frontend)

### Option 3: Docker Deployment

#### Backend Dockerfile

Create `Dockerfile` in root:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Build frontend and copy to backend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci && npm run build

WORKDIR /app

EXPOSE 8000

CMD ["node", "src/index.js"]
```

#### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
      - CORS_ORIGIN=${CORS_ORIGIN}
      # ... add all env vars
    volumes:
      - ./uploads:/app/uploads
    restart: unless-stopped
```

Build and run:
```bash
docker-compose up -d
```

## 🔒 Security Checklist

- [ ] Use strong JWT secrets (32+ characters)
- [ ] Enable HTTPS (SSL certificate)
- [ ] Set secure CORS origins
- [ ] Use environment variables (never commit secrets)
- [ ] Enable MongoDB authentication
- [ ] Set up rate limiting
- [ ] Regular security updates
- [ ] Enable MongoDB connection encryption
- [ ] Use secure cookies (httpOnly, secure, sameSite)

## 📊 Monitoring & Logging

### 1. Error Tracking

Add Sentry or similar:
```javascript
import * as Sentry from "@sentry/node";
Sentry.init({ dsn: "your-sentry-dsn" });
```

### 2. Logging

Use Winston or Pino:
```bash
npm install winston
```

### 3. Health Checks

Add health check endpoint:
```javascript
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});
```

## 🧪 Testing Before Production

### 1. Test Authentication
- Register new user
- Login
- Token refresh
- Logout

### 2. Test Role-Based Access
- Gig worker routes
- Organizer routes
- Host routes
- Admin routes

### 3. Test API Endpoints
- Create event
- Check-in to event
- Wallet operations
- File uploads

### 4. Test Frontend
- All pages load correctly
- Navigation works
- Forms submit correctly
- Error handling works

## 📈 Performance Optimization

### Backend
- Enable compression: `app.use(compression())`
- Use MongoDB indexes
- Implement caching (Redis)
- Optimize database queries

### Frontend
- Code splitting (already configured)
- Lazy loading routes
- Image optimization
- Minimize bundle size

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      # Add deployment steps

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd frontend && npm install
      - run: cd frontend && npm run build
      # Add deployment steps
```

## 🌐 Domain & SSL

### 1. Domain Configuration
- Point domain to your server IP
- Configure DNS records (A, CNAME)

### 2. SSL Certificate
- Use Let's Encrypt (free)
- Or use Cloudflare (free SSL)
- Configure nginx/load balancer

### 3. Update CORS
- Update `CORS_ORIGIN` in backend `.env`
- Update `VITE_API_BASE_URL` in frontend `.env`

## 📝 Post-Deployment Checklist

- [ ] Backend API is accessible
- [ ] Frontend loads correctly
- [ ] Authentication works
- [ ] File uploads work
- [ ] Database connections stable
- [ ] Error logging enabled
- [ ] Monitoring set up
- [ ] SSL certificate active
- [ ] CORS configured correctly
- [ ] Environment variables set
- [ ] Database backups configured

## 🆘 Troubleshooting

### Backend Issues
- Check MongoDB connection
- Verify environment variables
- Check CORS configuration
- Review server logs

### Frontend Issues
- Verify API URL in `.env`
- Check browser console for errors
- Verify CORS allows frontend origin
- Check network tab for API calls

## 📞 Support

For issues or questions:
1. Check logs
2. Review error messages
3. Verify configuration
4. Test in development first

---

**Ready for Production! 🚀**


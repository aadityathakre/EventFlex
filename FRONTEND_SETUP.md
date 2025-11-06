# EventFlex Frontend - Setup & Production Guide

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the `frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_APP_NAME=EventFlex
VITE_ENVIRONMENT=development
```

For production, update the API URL:
```env
VITE_API_BASE_URL=https://your-api-domain.com/api/v1
VITE_APP_NAME=EventFlex
VITE_ENVIRONMENT=production
```

### 3. Development Server

```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Layout.jsx      # Main layout with navbar
│   │   └── ProtectedRoute.jsx  # Route protection
│   ├── pages/              # Page components
│   │   ├── auth/           # Login/Register
│   │   ├── gig/            # Gig worker pages
│   │   ├── organizer/      # Organizer pages
│   │   ├── host/           # Host pages
│   │   └── admin/          # Admin pages
│   ├── services/           # API service functions
│   │   ├── authService.js
│   │   └── apiServices.js
│   ├── store/              # State management (Zustand)
│   │   └── authStore.js
│   ├── utils/              # Utility functions
│   │   └── api.js          # Axios instance
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── index.html
├── package.json
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS config
└── postcss.config.js       # PostCSS config
```

## 🎨 Styling

The project uses **Tailwind CSS** for styling. Key design tokens:

- **Primary Color**: Blue (primary-500: #0ea5e9)
- **Secondary Color**: Gray scale
- **Components**: Pre-styled buttons, inputs, cards, badges

### Custom Components

- `.btn` - Base button styles
- `.btn-primary` - Primary action button
- `.btn-secondary` - Secondary button
- `.btn-outline` - Outlined button
- `.input` - Form input
- `.card` - Card container
- `.badge` - Status badges

## 🔐 Authentication Flow

1. User logs in → JWT token stored in localStorage
2. Token automatically included in API requests
3. Token refresh handled automatically
4. Protected routes check authentication and role

## 🛣️ Routing

- **Public Routes**: `/`, `/login`, `/register`
- **Gig Worker**: `/dashboard/gig/*`
- **Organizer**: `/dashboard/organizer/*`
- **Host**: `/dashboard/host/*`
- **Admin**: `/dashboard/admin/*`

## 🔌 API Integration

All API calls go through the centralized `apiClient` in `src/utils/api.js`:

- Automatic token injection
- Token refresh on 401
- Error handling with toast notifications
- Request/response interceptors

## 📦 Production Deployment

### Option 1: Static Hosting (Vercel, Netlify, etc.)

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to your hosting service

3. Set environment variables in your hosting platform

### Option 2: Serve with Backend

Update `src/app.js` in backend to serve frontend:

```javascript
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});
```

### Option 3: Docker

Create `frontend/Dockerfile`:

```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🔧 Backend CORS Configuration

Ensure your backend allows requests from the frontend:

```javascript
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);
```

For production:
```env
CORS_ORIGIN=https://your-frontend-domain.com
```

## 📝 Adding New Features

### 1. Create a new page:
```jsx
// src/pages/gig/NewPage.jsx
import Layout from '../../components/Layout';

const NewPage = () => {
  return (
    <Layout>
      <h1>New Page</h1>
    </Layout>
  );
};

export default NewPage;
```

### 2. Add route in `App.jsx`:
```jsx
<Route
  path="/dashboard/gig/new-page"
  element={
    <ProtectedRoute allowedRoles={['gig']}>
      <NewPage />
    </ProtectedRoute>
  }
/>
```

### 3. Add API service:
```javascript
// src/services/apiServices.js
export const gigService = {
  // ... existing methods
  newMethod: () => apiClient.get('/gigs/new-endpoint'),
};
```

## 🎯 Customizing Template

To match your image template:

1. **Update Colors**: Edit `tailwind.config.js`
2. **Modify Layout**: Edit `src/components/Layout.jsx`
3. **Custom Components**: Create reusable components in `src/components/`
4. **Styling**: Use Tailwind classes or extend `index.css`

## 🐛 Troubleshooting

### Token refresh issues
- Check CORS configuration in backend
- Verify cookie settings
- Check browser console for errors

### API connection issues
- Verify `VITE_API_BASE_URL` in `.env`
- Check backend is running
- Verify CORS settings

### Build errors
- Clear `node_modules` and reinstall
- Check Node.js version (should be 18+)
- Verify all dependencies are installed

## 📚 Key Libraries

- **React 18** - UI framework
- **React Router** - Routing
- **Zustand** - State management
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **React Hot Toast** - Notifications
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## 🚢 Next Steps

1. **Customize Design**: Match your template image
2. **Add Features**: Implement missing pages/features
3. **Testing**: Add unit and integration tests
4. **Optimization**: Code splitting, lazy loading
5. **Analytics**: Add tracking (Google Analytics, etc.)
6. **SEO**: Add meta tags, Open Graph
7. **PWA**: Convert to Progressive Web App

## 📞 Support

For issues or questions, refer to the backend API documentation in `BACKEND_SUMMARY.md`.


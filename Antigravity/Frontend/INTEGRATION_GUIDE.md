# API Hub Frontend - Complete Integration Guide

## Project Overview

This is a production-ready Next.js 16 frontend application for the Tylersoft-Eclectics API Hub. It provides a complete User Portal and Admin Dashboard with authentication, API management, and user management features.

**Live Development Server**: `http://localhost:3000`

## Folder Structure & Responsibilities

### `/app` - Next.js App Router Pages
```
app/
├── layout.tsx              # Root layout with AuthProvider wrapper
├── page.tsx               # Root route - redirects to /login or /dashboard
├── login/
│   └── page.tsx          # User login page
├── dashboard/
│   └── page.tsx          # User Portal - API docs and endpoint testing
└── admin/
    └── page.tsx          # Admin Dashboard - stats, APIs, users management
```

### `/components` - Reusable React Components
```
components/
├── Sidebar.tsx            # Navigation sidebar with logout
├── Header.tsx            # Top bar with search, notifications, user profile
├── StatsCard.tsx         # Reusable statistics card component
└── ui/                   # shadcn/ui pre-built components
```

### `/lib` - Core Services & Utilities
```
lib/
├── auth/
│   └── AuthContext.tsx   # Authentication state, login/logout, user data
└── services/
    └── apiClient.ts      # HTTP client with token management
```

## Key Files Explained

### `lib/auth/AuthContext.tsx`
Manages all authentication state and logic:
- `login(email, password)` - Authenticates user and stores token
- `logout()` - Clears token and user data
- `useAuth()` - Hook to access auth state in components
- Automatically redirects on token expiration

### `lib/services/apiClient.ts`
HTTP client that communicates with Spring Boot backend:
- `get(endpoint)` - GET request
- `post(endpoint, data)` - POST request
- `put(endpoint, data)` - PUT request
- `delete(endpoint)` - DELETE request
- Automatically includes Bearer token in all requests
- Handles 401 errors by clearing auth

### `middleware.ts`
Route protection middleware:
- Redirects unauthenticated users to `/login`
- Redirects non-admin users away from `/admin`
- Validates user role before allowing access

## Component Communication Flow

```
User Action (Login Form)
    ↓
useAuth() hook (get login function)
    ↓
AuthContext.login()
    ↓
apiClient.post('/auth/login', credentials)
    ↓
Spring Boot Backend
    ↓
Response with token & user data
    ↓
Store token in localStorage
    ↓
Update Auth Context state
    ↓
Redirect to /dashboard
    ↓
Sidebar & Header render with user info
```

## API Integration Checklist

### Before You Start
- [ ] Spring Boot backend is running on `http://localhost:8080`
- [ ] `.env.local` has `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api`
- [ ] Backend has CORS enabled for `http://localhost:3000`

### Backend Endpoints to Implement

**Authentication**
- [ ] `POST /api/auth/login` - Returns `{ token, user }`
- [ ] `POST /api/auth/logout` - Clears session

**Users (Admin)**
- [ ] `GET /api/users` - Returns array of users
- [ ] `POST /api/users` - Creates new user
- [ ] `PUT /api/users/{id}` - Updates user
- [ ] `DELETE /api/users/{id}` - Deletes user

**APIs**
- [ ] `GET /api/apis` - Returns array of APIs
- [ ] `POST /api/apis` - Creates new API
- [ ] `PUT /api/apis/{id}` - Updates API
- [ ] `DELETE /api/apis/{id}` - Deletes API

**Stats (Admin)**
- [ ] `GET /api/stats` - Returns dashboard statistics

### Expected Response Format

```typescript
// Login Response
{
  "token": "jwt_token_here",
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "role": "ADMIN" // or "USER", "VIEWER", "DEVELOPER"
  }
}

// Users List
[
  {
    "id": "user-1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Developer",
    "status": "Active",
    "joinedAt": "May 20, 2025"
  }
]

// APIs List
[
  {
    "id": "api-1",
    "name": "User Management API",
    "version": "v2.1",
    "category": "Users",
    "status": "Published",
    "updatedAt": "May 20, 2025"
  }
]

// Stats
{
  "totalAPIs": 56,
  "totalUsers": 128,
  "activeUsers": 98,
  "apiRequests": 24500,
  "successRate": 99.2
}
```

## How to Add New Features

### Adding a New Page
1. Create folder: `app/newpage/`
2. Create `page.tsx` with React component
3. Use `'use client'` at top for interactive features
4. Import and use `Sidebar` and `Header` for consistency
5. Use `useAuth()` to check permissions

### Adding a New API Endpoint
1. In `lib/services/apiClient.ts`, add method:
   ```typescript
   async getNewData() {
     return this.request('/endpoint');
   }
   ```
2. In your component:
   ```typescript
   const response = await apiClient.getNewData();
   ```

### Adding Protected Routes
Routes are automatically protected by `middleware.ts`. Modify it to add new routes:
```typescript
// Only admins can access
if (pathname.startsWith('/special-admin')) {
  if (user?.role !== 'ADMIN') {
    return NextResponse.redirect('/dashboard');
  }
}
```

## Debugging

### Enable Debug Mode
In `.env.local`:
```env
NEXT_PUBLIC_DEBUG=true
```
This will log API requests and responses to console.

### Check Authentication
Open browser console and run:
```javascript
localStorage.getItem('auth_token')
localStorage.getItem('user')
```

### View Server Logs
Dev server shows all Next.js and API errors. Check terminal output.

### Common Issues

**"Cannot GET /dashboard"**
- User is not authenticated
- Try logging in at `/login`

**"401 Unauthorized"**
- Token has expired or is invalid
- Clear localStorage and login again
- Check that `/auth/login` returns token correctly

**"Cannot connect to backend"**
- Backend not running on port 8080
- CORS not enabled on backend
- Check `NEXT_PUBLIC_API_BASE_URL` in `.env.local`

**"Pages not updating"**
- Clear Next.js cache: `rm -rf .next`
- Restart dev server

## Testing the Frontend

### Test Login Flow
1. Go to `http://localhost:3000`
2. Should redirect to `/login`
3. Enter email and password
4. Should redirect to `/dashboard`
5. Check localStorage for `auth_token`

### Test API Integration
1. Login successfully
2. Go to `/dashboard` - should see API documentation
3. Go to `/admin` - should see stats and tables (if ADMIN role)
4. Click logout - should redirect to `/login`

### Test Error Handling
1. Stop backend server
2. Try to login - should show error
3. Restart backend
4. Login should work again

## Deployment Checklist

### Before Production
- [ ] Update `NEXT_PUBLIC_API_BASE_URL` to production backend
- [ ] Set `NEXT_PUBLIC_DEBUG=false`
- [ ] Test all features in staging environment
- [ ] Ensure backend API responses match expected format
- [ ] Update CORS on backend to allow production domain

### Build for Production
```bash
pnpm build
pnpm start
```

### Deploy to Vercel
```bash
vercel deploy --prod
```

## Color Theme

The app uses a dark theme with:
- **Primary**: Purple (`from-purple-500 to-purple-600`)
- **Secondary**: Blue (`from-blue-500 to-blue-600`)
- **Success**: Green (`text-green-400`)
- **Warning**: Yellow (`text-yellow-400`)
- **Error**: Red (`text-red-400`)
- **Background**: Dark slate (`from-slate-950 via-slate-900 to-slate-950`)

Customize in `app/globals.css`

## Performance Tips

1. **Use lazy loading** for components
2. **Minimize API calls** by caching data
3. **Use images responsively** with Next.js Image
4. **Monitor bundle size** with `next/bundle-analyzer`
5. **Optimize database queries** on backend

## Support & Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com
- **shadcn/ui**: https://ui.shadcn.com
- **TypeScript**: https://www.typescriptlang.org

---

**Created**: May 1, 2026
**Framework**: Next.js 16.2.4
**Tech Stack**: React 19, TypeScript, Tailwind CSS, shadcn/ui

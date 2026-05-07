# API Hub - Frontend

A modern React-based frontend for the Tylersoft-Eclectics API Hub, built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui components. This application provides both User Portal and Admin Dashboard interfaces for API management and documentation.

## Features

### User Portal
- **API Documentation**: Browse and read API documentation with detailed endpoint information
- **Authentication Display**: View authentication requirements for APIs
- **API Testing**: Test endpoints with a built-in API explorer
- **User Profile**: Manage user information and preferences

### Admin Dashboard
- **Statistics Overview**: Real-time metrics including Total APIs, Users, Active Users, API Requests, and Success Rate
- **API Management**: View, create, and manage APIs with versioning and status tracking
- **User Management**: Manage users, roles, and permissions
- **Quick Actions**: Shortcut buttons for common administrative tasks
- **System Logs**: Access system logs and activities

## Tech Stack

- **Framework**: Next.js 16.2.4 with App Router
- **UI Library**: React 19 with shadcn/ui components
- **Styling**: Tailwind CSS v4 with custom theme
- **Icons**: Lucide React
- **State Management**: React Context API
- **Type Safety**: TypeScript
- **HTTP Client**: Fetch API (no external dependencies)

## Project Structure

```
├── app/                          # Next.js App Router pages
│   ├── layout.tsx               # Root layout with auth provider
│   ├── page.tsx                 # Root redirect page
│   ├── login/
│   │   └── page.tsx             # Login page
│   ├── dashboard/
│   │   └── page.tsx             # User dashboard
│   └── admin/
│       └── page.tsx             # Admin dashboard
├── components/                   # Reusable React components
│   ├── Sidebar.tsx              # Navigation sidebar
│   ├── Header.tsx               # Top header with search & notifications
│   ├── StatsCard.tsx            # Statistics card component
│   └── ui/                       # shadcn/ui components
├── lib/                          # Utility functions and services
│   ├── auth/
│   │   └── AuthContext.tsx      # Authentication context & hooks
│   └── services/
│       └── apiClient.ts         # API client for backend communication
├── middleware.ts                 # Next.js request middleware
├── app/globals.css              # Global styles with dark theme
├── .env.local                   # Local environment configuration
├── .env.example                 # Environment variable template
├── package.json                 # Dependencies and scripts
└── README.md                    # This file
```

## Installation & Setup

### Prerequisites
- Node.js 18+ (recommended: 20 LTS)
- pnpm (recommended) or npm/yarn

### 1. Install Dependencies

```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install

# Or using yarn
yarn install
```

### 2. Configure Environment Variables

Copy the environment template and configure for your backend:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your backend API URL:

```env
# Backend API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api

# Debug Mode
NEXT_PUBLIC_DEBUG=false
```

### 3. Start Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## Backend Integration Guide

### API Client Configuration

The API client is located in `lib/services/apiClient.ts` and handles all HTTP communication with the Spring Boot backend.

#### API Base URL

Set your Spring Boot backend URL in `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

#### Authentication

The application uses **Bearer Token authentication**. Tokens are stored in `localStorage` with the key `auth_token`.

```typescript
// Example: Login request
const response = await apiClient.post('/auth/login', {
  email: 'user@example.com',
  password: 'password'
});

// Response should contain:
{
  token: 'your_bearer_token',
  user: {
    id: 'user_id',
    email: 'user@example.com',
    role: 'USER' | 'ADMIN'
  }
}
```

#### Request Format

All requests automatically include the Bearer token in the Authorization header:

```
Authorization: Bearer {token}
```

### Required Backend Endpoints

#### Authentication

- **POST** `/auth/login` - User login
  - Request: `{ email: string, password: string }`
  - Response: `{ token: string, user: User }`

- **POST** `/auth/logout` - User logout
  - Response: `{ success: boolean }`

#### Users

- **GET** `/users` - Get all users (Admin only)
  - Response: `User[]`

- **GET** `/users/{id}` - Get specific user
  - Response: `User`

- **POST** `/users` - Create new user (Admin only)
  - Request: `{ email: string, password: string, role: string }`
  - Response: `User`

- **PUT** `/users/{id}` - Update user (Admin only)
  - Request: `{ email?: string, role?: string }`
  - Response: `User`

- **DELETE** `/users/{id}` - Delete user (Admin only)
  - Response: `{ success: boolean }`

#### APIs

- **GET** `/apis` - Get all APIs
  - Response: `API[]`

- **GET** `/apis/{id}` - Get specific API
  - Response: `API`

- **POST** `/apis` - Create new API (Admin only)
  - Request: `{ name: string, version: string, description: string }`
  - Response: `API`

- **PUT** `/apis/{id}` - Update API (Admin only)
  - Request: `{ name?: string, status?: string }`
  - Response: `API`

- **DELETE** `/apis/{id}` - Delete API (Admin only)
  - Response: `{ success: boolean }`

#### Dashboard Stats

- **GET** `/stats` - Get dashboard statistics (Admin only)
  - Response: `{ totalAPIs: number, totalUsers: number, activeUsers: number, apiRequests: number, successRate: number }`

### Type Definitions

Create these types in your backend response:

```typescript
interface User {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'VIEWER' | 'DEVELOPER';
  status: 'Active' | 'Inactive';
  joinedAt: string;
  apiAccess?: number;
}

interface API {
  id: string;
  name: string;
  version: string;
  category: string;
  status: 'Published' | 'Draft';
  description?: string;
  updatedAt: string;
  authentication?: string;
  rateLimit?: string;
  endpoints?: Endpoint[];
}

interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
}
```

### Error Handling

The API client automatically handles:

1. **401 Unauthorized**: Clears token and redirects to login
2. **403 Forbidden**: Shows permission error
3. **404 Not Found**: Shows not found error
4. **500 Server Error**: Shows server error

Errors are logged to console when `NEXT_PUBLIC_DEBUG=true`

### Using the API Client in Components

```typescript
import { apiClient } from '@/lib/services/apiClient';

// In your component:
const response = await apiClient.get('/users');
const data = await apiClient.post('/apis', { name: 'New API', version: 'v1.0' });
const updated = await apiClient.put(`/users/${userId}`, { role: 'ADMIN' });
await apiClient.delete(`/apis/${apiId}`);
```

## Authentication Context

The `AuthContext` provides authentication state and methods:

```typescript
import { useAuth } from '@/lib/auth/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout, loading } = useAuth();

  return (
    <>
      {isAuthenticated && <p>Welcome, {user?.email}!</p>}
      <button onClick={() => logout()}>Logout</button>
    </>
  );
}
```

## Routing

### Public Routes
- `/login` - Login page (accessible when not authenticated)
- `/` - Redirects to `/login` or `/dashboard` based on auth state

### Protected Routes
- `/dashboard` - User portal (requires authentication)
- `/admin` - Admin dashboard (requires ADMIN role)

Route protection is handled by middleware in `middleware.ts`

## Environment Variables

### Required
- `NEXT_PUBLIC_API_BASE_URL` - Your Spring Boot backend API URL

### Optional
- `NEXT_PUBLIC_DEBUG` - Enable debug logging (default: false)

## Building for Production

```bash
pnpm build
pnpm start
```

## Deployment

### Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Set NEXT_PUBLIC_API_BASE_URL to your production backend URL
```

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t api-hub-frontend .
docker run -p 3000:3000 -e NEXT_PUBLIC_API_BASE_URL=http://backend:8080/api api-hub-frontend
```

## Styling & Customization

### Dark Theme
The application uses a custom dark theme defined in `app/globals.css`. Primary colors are purple and blue with slate neutrals.

### Tailwind CSS
All components use Tailwind CSS v4 for styling. Customize by editing:
- `app/globals.css` - Global styles and color variables
- Component files - Individual component styles

### Color Palette
- **Primary**: Purple (`#7c3aed` - `#9333ea`)
- **Secondary**: Blue (`#3b82f6` - `#2563eb`)
- **Neutral**: Slate (`#0f172a` - `#e2e8f0`)
- **Accent**: Green, Red, Orange, Pink for status indicators

## Performance Optimization

- **Image Optimization**: Use Next.js `Image` component for images
- **Code Splitting**: Automatic with Next.js App Router
- **Caching**: Configure HTTP caching headers in backend
- **Lazy Loading**: Routes are lazy-loaded by default

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: All modern versions

## Troubleshooting

### "Cannot connect to backend"
- Ensure Spring Boot backend is running on the configured port
- Check `NEXT_PUBLIC_API_BASE_URL` environment variable
- Verify CORS is enabled on the backend

### "401 Unauthorized"
- Token may have expired
- Login again and ensure token is stored in localStorage
- Check that backend endpoint returns token in response

### "Type errors"
- Run `pnpm tsc` to check TypeScript
- Ensure all API response types match the backend

### "Build fails"
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `pnpm install`
- Run `pnpm build` again

## Development Guidelines

### Adding New Pages
1. Create folder in `app/` with `page.tsx`
2. Add route to sidebar navigation if needed
3. Use `useAuth()` hook for authentication checks

### Creating Components
1. Place reusable components in `components/`
2. Use TypeScript interfaces for props
3. Keep components focused and single-responsibility
4. Use shadcn/ui components when possible

### API Integration
1. Add new endpoints to `lib/services/apiClient.ts`
2. Create hooks for data fetching if needed
3. Handle errors gracefully
4. Log important operations in debug mode

## License

MIT License - Built with v0

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review backend API documentation
3. Check browser console for errors
4. Enable `NEXT_PUBLIC_DEBUG=true` for detailed logging


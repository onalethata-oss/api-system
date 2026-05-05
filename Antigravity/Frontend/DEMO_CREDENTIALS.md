# Demo Credentials & Authentication Flow

## Demo Accounts

Two pre-configured demo accounts are available for testing the application:

### Admin Account
- **Email**: `admin@tylersoft.com`
- **Password**: `AdminPass123!`
- **Role**: `ADMIN`
- **Redirects to**: Admin Dashboard (`/admin`)
- **Access**: Full system access, user management, API management, statistics

### User Account
- **Email**: `user@tylersoft.com`
- **Password**: `UserPass123!`
- **Role**: `USER`
- **Redirects to**: User Dashboard (`/dashboard`)
- **Access**: API documentation, endpoint viewing, limited features

## Quick Login

On the login page, you'll see two convenient quick-login cards:

1. **Admin Account Card** (Blue)
   - Shows admin credentials
   - One-click login button
   - Automatically redirects to `/admin`

2. **User Account Card** (Orange)
   - Shows user credentials
   - One-click login button
   - Automatically redirects to `/dashboard`

## Authentication Flow

### Demo Credentials (Built-in)

When you enter demo credentials:

```
Email: admin@tylersoft.com
Password: AdminPass123!
```

The system:
1. Checks `apiClient.login()` in `lib/services/apiClient.ts`
2. Validates against `DEMO_CREDENTIALS` object
3. Generates a mock token (format: `demo_token_${timestamp}`)
4. Stores token and user info in localStorage
5. Redirects based on user role:
   - ADMIN → `/admin`
   - USER → `/dashboard`

### Backend Credentials (Production)

If credentials don't match demo accounts, the system attempts authentication with your Spring Boot backend:

```typescript
POST /api/auth/login
{
  "email": "your-email@example.com",
  "password": "your-password"
}
```

Response should include:
```json
{
  "id": "user-id",
  "email": "user@example.com",
  "name": "User Name",
  "role": "ADMIN|USER",
  "token": "jwt-token"
}
```

## How Role-Based Redirect Works

After successful login in `app/login/page.tsx`:

```typescript
const userData = JSON.parse(localStorage.getItem('user'));

if (userData.role === 'ADMIN') {
  router.push('/admin');      // Admin Dashboard
} else {
  router.push('/dashboard');  // User Dashboard
}
```

## Testing the Application

### Test Admin Features
1. Click "Login as Admin" button
2. Redirected to Admin Dashboard
3. Access:
   - Dashboard statistics
   - API management table
   - User management table
   - Quick actions panel

### Test User Features
1. Click "Login as User" button
2. Redirected to User Dashboard
3. Access:
   - API documentation
   - Endpoint details
   - Authentication info
   - API testing interface

## Protected Routes

Routes are protected by role:

| Route | Required Role | Component |
|-------|---------------|-----------|
| `/login` | None (public) | Login Page |
| `/dashboard` | USER or ADMIN | User Dashboard |
| `/admin` | ADMIN only | Admin Dashboard |
| `/` | Any (authenticated) | Redirects to dashboard/admin |

## Logout

Both dashboards have a logout button in the sidebar that:
1. Clears authentication token
2. Clears user data from localStorage
3. Redirects to login page

## For Production

When connecting to a real Spring Boot backend:

1. Remove demo credentials from `apiClient.ts`
2. Update `.env.local` with real backend URL
3. Ensure backend implements required login endpoint
4. Backend should return user with `role` field
5. System will automatically handle role-based redirects

## Demo Credentials Code

Located in `lib/services/apiClient.ts`:

```typescript
const DEMO_CREDENTIALS = {
  'admin@tylersoft.com': { password: 'AdminPass123!', role: 'ADMIN' },
  'user@tylersoft.com': { password: 'UserPass123!', role: 'USER' },
};
```

To modify or add more demo accounts, edit this object before authentication attempts.

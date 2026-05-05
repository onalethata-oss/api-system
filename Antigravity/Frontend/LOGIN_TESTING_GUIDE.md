# Login Testing Guide

## Quick Start

The Tylersoft-Eclectics API Hub frontend now features a complete authentication system with two demo accounts that automatically redirect to their respective dashboards.

## Login Page Location

Navigate to: `http://localhost:3000/login`

## Visual Layout

The login page is divided into 3 sections:

```
┌─────────────────────────────────────────────┐
│                                             │
│  1. MAIN LOGIN FORM (Top)                   │
│     - Email input                           │
│     - Password input                        │
│     - Sign In button                        │
│     - Tylersoft branding (icon + logo)      │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  2. DEMO QUICK LOGIN CARDS (Middle)         │
│     ┌──────────────┐   ┌──────────────┐    │
│     │ ADMIN CARD   │   │  USER CARD   │    │
│     │ (Blue)       │   │ (Orange)     │    │
│     │ 1-Click      │   │ 1-Click      │    │
│     │ Login        │   │ Login        │    │
│     └──────────────┘   └──────────────┘    │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  3. FOOTER INFO (Bottom)                    │
│     - Tip about quick login buttons         │
│                                             │
└─────────────────────────────────────────────┘
```

## Demo Credentials

### Option 1: Quick Login (Easiest)

Click one of the two quick login cards to instantly authenticate:

**Admin Account Card** (Blue with Shield Icon)
- Preset credentials for admin access
- Click button to instantly login as admin
- Redirects to: `http://localhost:3000/admin`

**User Account Card** (Orange with User Icon)
- Preset credentials for user access
- Click button to instantly login as user
- Redirects to: `http://localhost:3000/dashboard`

### Option 2: Manual Login

Or manually enter credentials in the form:

**Admin Login**:
```
Email:    admin@tylersoft.com
Password: AdminPass123!
```

**User Login**:
```
Email:    user@tylersoft.com
Password: UserPass123!
```

## What Happens After Login

### Admin Login Flow

1. Click "Login as Admin" or enter admin credentials
2. System validates credentials against demo credentials
3. Admin user object created with role: `ADMIN`
4. Token generated and stored in localStorage
5. System detects role = `ADMIN`
6. **Automatically redirects to**: `/admin` (Admin Dashboard)

### User Login Flow

1. Click "Login as User" or enter user credentials
2. System validates credentials against demo credentials
3. User object created with role: `USER`
4. Token generated and stored in localStorage
5. System detects role = `USER`
6. **Automatically redirects to**: `/dashboard` (User Dashboard)

## What to Test

### Admin Dashboard (`/admin`)
After logging in as admin, you'll see:

- **Statistics Cards** (5 cards showing):
  - Total APIs: 56
  - Total Users: 128
  - Active Users: 98
  - API Requests: 24.5K
  - Success Rate: 99.2%

- **Recent APIs Table**:
  - List of API versions and statuses
  - Published/Draft status indicators
  - Updated dates

- **User Management Table**:
  - User list with email, role, status
  - Edit and delete action buttons
  - Active/Inactive status

- **Quick Actions Panel**:
  - Add New API
  - Add New User
  - API Access Management
  - View Logs

### User Dashboard (`/dashboard`)
After logging in as user, you'll see:

- **API Documentation Section**:
  - API name and version
  - Authentication details
  - Rate limit information
  - Endpoint count

- **Endpoints List**:
  - GET endpoints (green badges)
  - POST endpoints (blue badges)
  - PUT endpoints (yellow badges)
  - DELETE endpoints (red badges)
  - Try It buttons for testing

- **Authentication Info**:
  - Bearer token authentication details
  - How to include tokens in requests

## Testing Features

### Test 1: Admin Access
```
1. Navigate to http://localhost:3000/login
2. Click "Login as Admin" button
3. Verify redirect to /admin
4. Confirm you see admin dashboard
5. Click Logout in sidebar
```

### Test 2: User Access
```
1. Navigate to http://localhost:3000/login
2. Click "Login as User" button
3. Verify redirect to /dashboard
4. Confirm you see user dashboard
5. Click Logout in sidebar
```

### Test 3: Role-Based Access Control
```
1. Login as Admin
2. Note the URL: /admin
3. Logout
4. Login as User
5. Note the URL: /dashboard (not /admin)
6. Try accessing /admin directly
7. Verify you're redirected (when RLS is implemented)
```

### Test 4: Session Persistence
```
1. Login as either role
2. Refresh the page (F5)
3. Verify you stay logged in
4. Check browser localStorage for 'authToken' and 'user'
```

### Test 5: Logout Functionality
```
1. Login to either dashboard
2. Click the Logout button in sidebar
3. Verify redirect to /login
4. Check localStorage is cleared
5. Try accessing /admin or /dashboard
6. Should redirect to /login
```

## Customizing Demo Credentials

To add or modify demo credentials, edit:

**File**: `lib/services/apiClient.ts`

**Section**: Lines 15-20

```typescript
const DEMO_CREDENTIALS = {
  'admin@tylersoft.com': { password: 'AdminPass123!', role: 'ADMIN' },
  'user@tylersoft.com': { password: 'UserPass123!', role: 'USER' },
  // Add more accounts here
};
```

Example of adding a viewer account:
```typescript
const DEMO_CREDENTIALS = {
  'admin@tylersoft.com': { password: 'AdminPass123!', role: 'ADMIN' },
  'user@tylersoft.com': { password: 'UserPass123!', role: 'USER' },
  'viewer@tylersoft.com': { password: 'ViewerPass123!', role: 'VIEWER' },
};
```

## Troubleshooting

### Issue: Login not redirecting to correct dashboard

**Solution**:
1. Check browser console for errors (F12)
2. Verify localStorage has 'user' object with 'role' field
3. Ensure role is exactly 'ADMIN' or 'USER' (case-sensitive)

### Issue: Demo credentials not working

**Solution**:
1. Verify exact email and password match (case-sensitive)
2. Check DEMO_CREDENTIALS object in apiClient.ts
3. Clear browser cache and localStorage
4. Refresh page and try again

### Issue: Staying logged in after refresh doesn't work

**Solution**:
1. Check localStorage for 'authToken' and 'user'
2. Both must be present for persistence
3. AuthContext checks both on mount in useEffect

### Issue: Quick login buttons not appearing

**Solution**:
1. Verify you're on `/login` page
2. Check browser is not zoomed out too much
3. Check CSS is loading (inspect element)
4. Verify components are imported correctly

## Browser Developer Tools

### Check Authentication State

Press F12 to open Developer Tools:

1. Go to **Application** tab
2. Click **Local Storage**
3. Find your domain
4. Look for:
   - `authToken` - JWT token or demo token
   - `user` - User object JSON

Example user object:
```json
{
  "id": "demo_admin@tylersoft.com",
  "email": "admin@tylersoft.com",
  "name": "Admin",
  "role": "ADMIN"
}
```

## Production Notes

When switching to production backend:

1. Remove demo credentials from `apiClient.ts`
2. Update `.env.local` with real backend URL
3. Backend must return user with `role` field
4. Role-based redirect will continue working automatically
5. All demo accounts will stop working

## Additional Resources

- `DEMO_CREDENTIALS.md` - Detailed credential documentation
- `README.md` - Complete setup and backend integration
- `INTEGRATION_GUIDE.md` - Backend API specifications

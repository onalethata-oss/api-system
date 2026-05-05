# How to View the Dashboards

## Development Server
Your application is running at: **http://localhost:3000**

## Step 1: Go to Login Page
Navigate to: **http://localhost:3000/login**

## Step 2: Login as Admin
Enter these credentials in the login form:

**Email:** `admin@tylersoft.com`
**Password:** `AdminPass123!`

Click **"Sign In"** button.

You will be automatically redirected to the **Admin Dashboard** at `/admin`

---

## Admin Dashboard Features
- **Statistics Cards** (5 cards showing):
  - Total APIs: 56
  - Total Users: 128
  - Active Users: 98
  - API Requests: 24.5K
  - Success Rate: 99.2%

- **Recent APIs Table**:
  - Shows API name, version, category, status, and last update
  - Edit and delete actions for each API

- **User Management Table**:
  - Shows all users with email, role, status, and join date
  - Edit and delete buttons for user management

- **Quick Actions Panel**:
  - Add New API
  - Add New User
  - API Access Management
  - View System Logs

---

## Step 3: Login as User (Optional)
To see the User Dashboard, logout or go back to login page:

**Email:** `user@tylersoft.com`
**Password:** `UserPass123!`

Click **"Sign In"** button.

You will be redirected to the **User Dashboard** at `/dashboard`

---

## User Dashboard Features
- **API Documentation Portal**:
  - API name and version
  - Authentication method
  - Rate limits
  - Number of endpoints

- **Endpoints List**:
  - Color-coded HTTP methods (GET, POST, PUT, DELETE)
  - Endpoint paths and descriptions
  - Try It button to test endpoints

- **Authentication Info**:
  - Bearer token authentication details
  - Authorization header format

---

## Sidebar Navigation (Both Dashboards)
- Tylersoft logo and branding
- Dashboard link (active page highlighted with blue-to-orange gradient)
- Admin Panel link (only visible for admin users)
- User profile section with email and role
- Logout button

---

## Header Features (Both Dashboards)
- Search bar to search APIs and users
- Notification bell with indicator
- User avatar showing first letter of email
- User email and role display

---

## Color Scheme
- **Primary Blue:** #1F3BA0
- **Primary Orange:** #FF6B35
- **Background:** Dark slate (#0F1117)
- **Cards:** Slate (#1a1f2e)
- **Active Elements:** Blue-to-orange gradient

---

## Notes
- Both dashboards use role-based routing
- Admin credentials redirect to `/admin`
- User credentials redirect to `/dashboard`
- Logout button is in the sidebar
- All data shown is sample/mock data for demonstration

---

## Troubleshooting

If login fails:
1. Check that dev server is running (`pnpm dev`)
2. Verify email and password exactly as shown above
3. Clear browser cache and try again
4. Check browser console for error messages

If dashboard doesn't load:
1. Verify you're logged in (check localStorage for auth token)
2. Try refreshing the page
3. Check that Sidebar and Header components are loaded
4. View browser console for any React errors

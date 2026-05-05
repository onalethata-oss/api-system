# File Guide - API Hub Frontend

## 📋 Quick Reference

### Configuration Files
| File | Purpose |
|------|---------|
| `.env.local` | Local environment variables (Backend URL, Debug mode) |
| `.env.example` | Template for environment variables |
| `package.json` | Dependencies, scripts, project metadata |
| `tsconfig.json` | TypeScript configuration |
| `next.config.mjs` | Next.js configuration |

### Core Application Files
| File | Purpose |
|------|---------|
| `middleware.ts` | Route protection, authentication checks |
| `app/layout.tsx` | Root layout wrapper with AuthProvider |
| `app/page.tsx` | Root route (/) - redirects to login or dashboard |
| `app/globals.css` | Global styles, dark theme, CSS variables |

### Pages
| File | Purpose |
|------|---------|
| `app/login/page.tsx` | Login form, authentication (480 lines) |
| `app/dashboard/page.tsx` | User Portal - API docs, endpoints, auth info (202 lines) |
| `app/admin/page.tsx` | Admin Dashboard - stats, tables, quick actions (288 lines) |

### Components
| File | Purpose |
|------|---------|
| `components/Sidebar.tsx` | Navigation sidebar with user profile & logout (85 lines) |
| `components/Header.tsx` | Top header with search, notifications, user profile (47 lines) |
| `components/StatsCard.tsx` | Reusable statistics card component (53 lines) |
| `components/ui/*` | shadcn/ui pre-built components |

### Services & Context
| File | Purpose |
|------|---------|
| `lib/auth/AuthContext.tsx` | Authentication state, login/logout, user data (103 lines) |
| `lib/services/apiClient.ts` | HTTP client with token management (170 lines) |

### Documentation
| File | Purpose |
|------|---------|
| `README.md` | Main documentation - setup, features, troubleshooting |
| `INTEGRATION_GUIDE.md` | Detailed backend integration instructions |
| `API_REFERENCE.md` | Complete API endpoint specifications |
| `PROJECT_SUMMARY.md` | High-level project overview |
| `FILE_GUIDE.md` | This file - reference for all files |

---

## 📁 Detailed File Descriptions

### `app/login/page.tsx`
**Purpose**: User authentication page

**Key Components**:
- Login form with email/password fields
- Form validation
- API integration with `/auth/login`
- Error handling and display
- Loading state
- Redirect to dashboard on success
- Link to signup (if enabled)

**Used by**: Unauthenticated users

**Dependencies**: `useAuth()`, `apiClient`

---

### `app/dashboard/page.tsx`
**Purpose**: User Portal - API documentation and testing

**Key Sections**:
1. **API Documentation Header** - Title and description
2. **API Info Card** - Authentication, rate limits, endpoint count
3. **Endpoints List** - GET, POST, PUT, DELETE endpoints
4. **Try It Button** - For testing endpoints
5. **Authentication Section** - Bearer token info

**Used by**: Authenticated users (any role)

**Data Displayed**:
- API name, version, description
- Authentication method
- Rate limits
- Endpoint list with methods
- Authentication details

---

### `app/admin/page.tsx`
**Purpose**: Admin Dashboard - statistics, management, monitoring

**Key Sections**:
1. **Statistics Cards** - 5 metric cards (Total APIs, Users, etc.)
2. **Recent APIs Table** - API name, version, status, updated date
3. **User Management Table** - User info, email, role, status, actions
4. **Quick Actions Panel** - Shortcuts for common admin tasks

**Used by**: Admin users only (role === "ADMIN")

**Data Displayed**:
- Real-time statistics with trends
- API management table
- User management table with edit/delete
- Quick action shortcuts

---

### `components/Sidebar.tsx`
**Purpose**: Navigation and user info sidebar

**Features**:
- Logo and brand name
- Navigation links (Dashboard, Admin)
- User email and role display
- Logout button
- Role-based menu visibility
- Responsive design

**Props**: None (uses `useAuth()` hook)

**Used on**: Dashboard and Admin pages

---

### `components/Header.tsx`
**Purpose**: Top navigation bar

**Features**:
- Search bar for APIs/users
- Notification bell with badge
- User profile avatar with initials
- Display current user info
- Responsive layout

**Props**: None (uses `useAuth()` hook)

**Used on**: Dashboard and Admin pages

---

### `components/StatsCard.tsx`
**Purpose**: Reusable statistics display card

**Props**:
```typescript
{
  title: string;           // "Total APIs"
  value: string | number;  // 56
  icon: React.ReactNode;   // <Package />
  trend?: {
    value: number;         // 12
    isPositive: boolean;   // true
  };
  bgColor?: string;        // "from-purple-500/20"
  accentColor?: string;    // "from-purple-500 to-blue-500"
}
```

**Used on**: Admin dashboard

---

### `lib/auth/AuthContext.tsx`
**Purpose**: Central authentication state management

**Exports**:
- `AuthProvider` - Component wrapper
- `useAuth()` - Hook for consuming auth state

**State**:
```typescript
{
  user: User | null;              // Current user
  isAuthenticated: boolean;       // true if logged in
  loading: boolean;               // Loading state
  error: string | null;           // Error message
}
```

**Methods**:
- `login(email, password)` - Authenticate user
- `logout()` - Clear authentication
- `setUser(user)` - Update user data

**Storage**: localStorage (key: `auth_token`, `user`)

---

### `lib/services/apiClient.ts`
**Purpose**: HTTP client for backend communication

**Methods**:
- `get(endpoint)` - GET request
- `post(endpoint, data)` - POST request
- `put(endpoint, data)` - PUT request
- `delete(endpoint)` - DELETE request

**Features**:
- Automatic Bearer token injection
- 401 error handling (auto logout)
- JSON serialization/deserialization
- Error logging (if debug enabled)
- Base URL from environment

**Configuration**:
```
Base URL: process.env.NEXT_PUBLIC_API_BASE_URL
Token Header: Authorization: Bearer {token}
```

---

### `middleware.ts`
**Purpose**: Route protection and access control

**Protection Rules**:
1. Redirects `/` based on auth state
2. Protects `/dashboard` and `/admin` with auth check
3. Checks admin role for `/admin`
4. Stores user in request headers

**Behavior**:
- Unauthenticated → Redirect to `/login`
- Non-admin on `/admin` → Redirect to `/dashboard`
- Authenticated → Allow access

---

### `app/globals.css`
**Purpose**: Global styles and dark theme

**Includes**:
- Tailwind CSS imports
- CSS color variables
- Dark theme configuration
- Global element styles
- Typography settings
- Animation classes

**Color Variables** (if customizing):
- `--background` / `--foreground`
- `--primary` / `--secondary`
- `--accent` / `--muted`
- `--chart-1` through `--chart-5`

---

### `app/layout.tsx`
**Purpose**: Root layout component

**Responsibilities**:
- Sets up HTML structure
- Applies root styles and classes
- Wraps app with AuthProvider
- Includes Vercel Analytics
- Sets metadata (title, description)
- Configures fonts

**Children**: All pages render as children

---

## 🔄 Data Flow Diagrams

### Authentication Flow
```
User → Login Form → AuthContext.login()
     → apiClient.post('/auth/login', creds)
     → Backend validates
     → Returns { token, user }
     → Store in localStorage
     → Update context state
     → Redirect to /dashboard
```

### Page Load Flow
```
Browser → middleware.ts
        → Check authentication
        → Redirect if needed
        → Load page component
        → Sidebar + Header render
        → Fetch data (if needed)
        → Display content
```

### API Request Flow
```
Component → apiClient.get('/endpoint')
         → Add Bearer token header
         → Send to backend
         → Get response
         → Parse JSON
         → Return data
         → If 401 → logout → redirect to /login
```

---

## 📊 File Statistics

| Category | Files | Total Lines |
|----------|-------|------------|
| Pages | 3 | ~890 |
| Components | 3 | ~185 |
| Services | 2 | ~273 |
| Configuration | 6 | ~150 |
| **Total** | **14** | **~1,498** |

---

## 🔗 File Dependencies

```
app/layout.tsx
    ├── lib/auth/AuthContext.tsx
    └── app/globals.css

app/login/page.tsx
    ├── lib/auth/AuthContext.tsx
    ├── lib/services/apiClient.ts
    └── components/ui/*

app/dashboard/page.tsx
    ├── components/Sidebar.tsx
    ├── components/Header.tsx
    ├── lib/auth/AuthContext.tsx
    └── components/ui/*

app/admin/page.tsx
    ├── components/Sidebar.tsx
    ├── components/Header.tsx
    ├── components/StatsCard.tsx
    ├── lib/auth/AuthContext.tsx
    └── components/ui/*

components/Sidebar.tsx
    ├── lib/auth/AuthContext.tsx
    └── lucide-react icons

components/Header.tsx
    ├── lib/auth/AuthContext.tsx
    └── lucide-react icons

lib/auth/AuthContext.tsx
    └── lib/services/apiClient.ts

middleware.ts
    ├── next/navigation
    └── (No file dependencies)
```

---

## 🚀 Adding New Files

### New Page
1. Create `app/newpage/page.tsx`
2. Import Sidebar, Header if needed
3. Use `useAuth()` for access control
4. Place in public or protected route

### New Component
1. Create `components/NewComponent.tsx`
2. Export as named export
3. Use in pages or other components
4. Keep single responsibility

### New API Endpoint
1. Add method to `lib/services/apiClient.ts`
2. Use in component with `apiClient.method()`
3. Handle errors appropriately
4. Update types as needed

---

**Last Updated**: May 1, 2026
**Framework**: Next.js 16.2.4
**Total Project Size**: ~100KB (minified)

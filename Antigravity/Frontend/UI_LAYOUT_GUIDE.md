# UI Layout Guide - Visual Reference

## Color Scheme

**Primary Colors**:
- Purple: `#7c3aed` - `#9333ea` (Primary actions, highlights)
- Blue: `#3b82f6` - `#2563eb` (Secondary, stats)

**Neutrals**:
- Background: `#0f172a` (Very dark slate)
- Card: `#1e293b` (Dark slate)
- Text: `#f1f5f9` (Light slate)
- Muted: `#64748b` (Gray)

**Status**:
- Success: `#22c55e` (Green - Active, Published)
- Warning: `#eab308` (Yellow - Draft, Pending)
- Error: `#ef4444` (Red - Inactive, Failed)
- Info: `#06b6d4` (Cyan - Information)

**Gradients**:
- Primary: `from-purple-500 to-purple-600`
- Secondary: `from-blue-500 to-blue-600`
- Dark BG: `from-slate-950 via-slate-900 to-slate-950`

---

## User Portal Layout (`/dashboard`)

```
┌─────────────────────────────────────────────────────────────────┐
│                     SIDEBAR (264px)      │      HEADER                  │
├────────────────────────┼──────────────────────────────────────────┤
│                        │                                          │
│  🔗 API Hub            │  [Search Box] [Bell] [Avatar] User Name  │
│  Eclectics             │                                          │
│                        ├──────────────────────────────────────────┤
│  NAVIGATION            │                                          │
│  ▪ Dashboard ✓         │  API Documentation                       │
│  ▪ Admin (if ADMIN)    │  Complete API for managing users...      │
│                        │                                          │
│  [User Info]           │  ┌────────────────────────────────────┐ │
│  user@email.com        │  │ API DOCUMENTATION    User Management│ │
│  Admin/User            │  │ API v1.0                         │ │
│                        │  │                                    │ │
│  [Logout Button]       │  │  ┌──────────┬──────────┬────────┐ │ │
│                        │  │  │Auth      │Rate      │Endpoints│ │ │
│                        │  │  │Bearer    │100 req/m │5        │ │ │
│                        │  │  └──────────┴──────────┴────────┘ │ │
│                        │  └────────────────────────────────────┘ │
│                        │                                          │
│                        │  ENDPOINTS                             │
│                        │  ─────────────────────────────────────  │
│                        │  [GET] /users        ▶                  │
│                        │        Retrieve list of users            │
│                        │                                          │
│                        │  [GET] /users/{id}   ▶ Try It           │
│                        │        Retrieve specific user            │
│                        │                                          │
│                        │  [POST] /users       ▶                  │
│                        │         Create new user                  │
│                        │                                          │
│                        │  [PUT] /users/{id}   ▶                  │
│                        │        Update user                       │
│                        │                                          │
│                        │  [DELETE] /users/{id} ▶                 │
│                        │           Delete user                    │
│                        │                                          │
│                        │  AUTHENTICATION                          │
│                        │  ───────────────────────────────────────│
│                        │  🔒 This API uses Bearer Token auth     │
│                        │                                          │
│                        │  Authorization: Bearer your_token_here   │
│                        │                                          │
└────────────────────────┴──────────────────────────────────────────┘

Max Width: 1920px
Sidebar: Fixed 256px
Content: Flexible
Header: Fixed 64px
```

---

## Admin Dashboard Layout (`/admin`)

```
┌─────────────────────────────────────────────────────────────────┐
│                     SIDEBAR (264px)      │      HEADER                  │
├────────────────────────┼──────────────────────────────────────────┤
│                        │                                          │
│  🔗 API Hub            │  Dashboard | [Search] [Bell] [Avatar]   │
│  Eclectics             │  Welcome back, Admin!                    │
│                        │  Here's what's happening...              │
│  MAIN                  ├──────────────────────────────────────────┤
│  ▪ Dashboard ✓         │                                          │
│                        │  STATISTICS CARDS (5 columns)            │
│  API MANAGEMENT        │  ┌──────────┬──────────┬──────────┐     │
│  ▪ APIs                │  │Total API │Total Usr │Active Usr│     │
│                        │  │   56     │   128    │   98     │     │
│  USER MANAGEMENT       │  │  ↑12%    │  ↑8%     │  ↑15%    │     │
│                        │  └──────────┴──────────┴──────────┘     │
│  [User Info]           │  ┌──────────┬──────────┐                │
│  user@admin.com        │  │API Req   │Success   │                │
│  Admin                 │  │ 24.5K    │ 99.2%    │                │
│                        │  │  ↑18%    │  ↑2.1%   │                │
│  [Logout Button]       │  └──────────┴──────────┘                │
│                        │                                          │
│                        │  RECENT APIS TABLE                       │
│                        │  ─────────────────────────────────────  │
│                        │  API Name │Ver│Category│Status│Updated  │
│                        │  ─────────────────────────────────────  │
│                        │  User Mgmt│v2.1│Users │✓Pub │May 20    │
│                        │  Payment │v1.4│Pay  │✓Pub │May 19    │
│                        │  Order   │v2.0│Order│✓Pub │May 18    │
│                        │  Inventory│v1.3│Inv │⊕Draft│May 17    │
│                        │  Notifi  │v1.0│Sys │✓Pub │May 16    │
│                        │                                          │
│                        │  USER MANAGEMENT TABLE                   │
│                        │  ─────────────────────────────────────  │
│                        │  User │Email │Role│Status│Joined│Actions│
│                        │  ─────────────────────────────────────  │
│                        │  JD   │j@e.c │Dev│Active│May 20│✎ 🗑   │
│                        │  JS   │j@e.c │Dev│Active│May 18│✎ 🗑   │
│                        │  RB   │r@e.c │Vwr│Active│May 15│✎ 🗑   │
│                        │  EJ   │e@e.c │Dev│Inact│May 10│✎ 🗑   │
│                        │  ML   │m@e.c │Vwr│Active│May 8 │✎ 🗑   │
│                        │                                          │
│                        │                    │ QUICK ACTIONS       │
│                        │                    │ ───────────────────  │
│                        │                    │ ⊕ Add New API      │
│                        │                    │   Create & config   │
│                        │                    │                    │
│                        │                    │ ⊕ Add New User     │
│                        │                    │   Set permissions   │
│                        │                    │                    │
│                        │                    │ 🔗 API Access      │
│                        │                    │   Manage perms      │
│                        │                    │                    │
│                        │                    │ 👁 View Logs       │
│                        │                    │   Check activity    │
│                        │                    │                    │
└────────────────────────┴──────────────────────────────────────────┘

Max Width: 1920px
Sidebar: Fixed 256px
Content: Flexible
Header: Fixed 64px
Main Grid: 3 columns (2/3 for tables, 1/3 for quick actions)
```

---

## Login Page Layout (`/login`)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│                                                                  │
│         ┌────────────────────────────────────────┐              │
│         │                                        │              │
│         │   🔗 API Hub                           │              │
│         │   Eclectics                            │              │
│         │                                        │              │
│         │   Login to Your Account                │              │
│         │                                        │              │
│         │   ┌──────────────────────────────────┐ │              │
│         │   │ Email Address                    │ │              │
│         │   │ user@example.com                 │ │              │
│         │   └──────────────────────────────────┘ │              │
│         │                                        │              │
│         │   ┌──────────────────────────────────┐ │              │
│         │   │ Password                         │ │              │
│         │   │ ••••••••                         │ │              │
│         │   └──────────────────────────────────┘ │              │
│         │                                        │              │
│         │   [    Sign In    ]                    │              │
│         │                                        │              │
│         │   Don't have an account? Sign up →     │              │
│         │                                        │              │
│         └────────────────────────────────────────┘              │
│                                                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

Width: 100% (Full screen)
Form Card: 400px centered
Background: Dark gradient
```

---

## Component Breakdown

### Sidebar Component
```
┌─────────────────────────┐
│ 🔗 API Hub              │  ← Logo + Brand
├─────────────────────────┤
│ NAVIGATION              │
│ • Dashboard      [✓]    │  ← Active highlighted
│ • Admin          [only if ADMIN role]
├─────────────────────────┤
│ [User Info Box]         │
│ user@email.com          │
│ Admin/Developer         │
├─────────────────────────┤
│ [Logout Button]         │  ← Red/danger styled
│ Position: Sticky Bottom │
└─────────────────────────┘

Width: 256px
Height: 100vh
Position: Fixed
```

### Header Component
```
┌──────────────────────────────────────────────────────┐
│ [Search Box]    [Bell] [Avatar] User Name ▼          │
│                                                      │
│ Left: Search (flex-1)                               │
│ Right: Notifications, User Profile (flex)           │
└──────────────────────────────────────────────────────┘

Height: 64px
Width: 100% (minus sidebar)
Position: Fixed at top
```

### Stats Card Component
```
┌────────────────────────┐
│ 🎯 [Icon]              │  ← Colored icon with gradient
│                        │
│ Total APIs             │  ← Label
│ 56                     │  ← Large value
│ ↑ 12% this month       │  ← Trend with arrow
└────────────────────────┘

Width: Dynamic (flex)
Height: 160px
Responsive: 5 columns → 2 columns → 1 column
```

---

## Typography

**Heading Sizes**:
- H1: 32px bold (Page titles)
- H2: 24px bold (Section titles)
- H3: 18px bold (Card titles)
- H4: 16px semibold (Subtitles)

**Text Sizes**:
- Body: 14px regular
- Small: 12px regular
- Tiny: 10px regular

**Font Family**: Geist (Sans-serif)

**Line Heights**:
- Headings: 1.2
- Body: 1.5
- Dense: 1.4

---

## Spacing

**Standard Spacing**:
- xs: 4px (small gaps, borders)
- sm: 8px (component padding)
- md: 16px (section padding)
- lg: 24px (page padding)
- xl: 32px (section gaps)

**Grid Gaps**:
- Stats cards: 16px
- Table rows: 0px (borders only)
- Form fields: 16px

---

## Responsive Breakpoints

**Mobile** (< 640px):
- Sidebar: Hidden (drawer mode)
- 1 column layout
- Full-width forms

**Tablet** (640px - 1024px):
- Sidebar: Collapsed
- 2 column layout
- Optimized tables

**Desktop** (1024px+):
- Full sidebar
- 3+ column layouts
- All features visible

---

## Interactive States

**Buttons**:
- Default: Solid color
- Hover: Darker shade
- Active: Border highlight
- Disabled: Reduced opacity

**Links**:
- Default: Purple text
- Hover: Brighter purple
- Active: Underline

**Inputs**:
- Empty: Border color
- Focused: Purple border
- Error: Red border + message
- Disabled: Gray + no interaction

**Tables**:
- Row hover: Subtle background
- Sorting: Arrow indicator
- Selected: Highlight

---

## Accessibility

**Color Contrast**:
- All text meets WCAG AA standards
- Status colors supplemented with text
- Icons paired with labels

**Focus States**:
- All interactive elements have visible focus
- Keyboard navigation supported
- Tab order logical

**Semantic HTML**:
- Proper heading hierarchy
- ARIA labels where needed
- Form labels associated

---

**Design System**: Custom dark theme with purple/blue accents
**Framework**: Tailwind CSS v4 + shadcn/ui
**Typography**: Geist font family
**Icons**: Lucide React (24px standard)
**Animation**: Smooth transitions (200ms)

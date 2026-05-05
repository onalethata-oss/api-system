# Dashboard Layouts & Visual Guide

## Overview

The Tylersoft-Eclectics API Hub features two main dashboards tailored for different user roles, both using the official company colors (blue #1F3BA0 and orange #FF6B35).

---

## USER DASHBOARD

**Route**: `/dashboard`  
**Access**: All authenticated users  
**Role**: USER, DEVELOPER, VIEWER

### Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                          HEADER                                  │
│  Search [____________]        🔔  👤 username                   │
├──────────┬──────────────────────────────────────────────────────┤
│          │                                                       │
│ SIDEBAR  │                  MAIN CONTENT                        │
│          │                                                       │
│ Dashboard│  ┌─────────────────────────────────────────────────┐ │
│ (Active) │  │ API Documentation                               │ │
│          │  │ Complete API for managing users, roles, perms   │ │
│ Admin ✓* │  └─────────────────────────────────────────────────┘ │
│          │                                                       │
│ Logout   │  ┌──────────────────────────────────────────────────┐ │
│          │  │ API DOCUMENTATION                 [v1.0]         │ │
│          │  │ User Management API                              │ │
│          │  ├──────────────────────────────────────────────────┤ │
│          │  │ Authentication    │ Rate Limit      │ Endpoints │ │
│          │  │ Bearer Token      │ 100 req/min    │     5     │ │
│          │  └──────────────────────────────────────────────────┘ │
│          │                                                       │
│          │  ENDPOINTS                                    [View all]
│          │  ┌──────────────────────────────────────────────────┐ │
│          │  │ [GET]  /users          List all users    [Try it] │ │
│          │  ├──────────────────────────────────────────────────┤ │
│          │  │ [GET]  /users/{id}     Get specific user  [Try it] │ │
│          │  ├──────────────────────────────────────────────────┤ │
│          │  │ [POST] /users          Create new user   [Try it] │ │
│          │  ├──────────────────────────────────────────────────┤ │
│          │  │ [PUT]  /users/{id}     Update user       [Try it] │ │
│          │  ├──────────────────────────────────────────────────┤ │
│          │  │ [DELETE] /users/{id}   Delete user       [Try it] │ │
│          │  └──────────────────────────────────────────────────┘ │
│          │                                                       │
│          │  ┌──────────────────────────────────────────────────┐ │
│          │  │ 🔐 Authentication                                 │ │
│          │  │ This API uses Bearer Token authentication.        │ │
│          │  │ Include your API token in Authorization header:  │ │
│          │  │                                                  │ │
│          │  │ Authorization: Bearer your_api_token_here       │ │
│          │  └──────────────────────────────────────────────────┘ │
│          │                                                       │
└──────────┴──────────────────────────────────────────────────────┘
```

### Visual Details

**Sidebar**
- Width: 256px (w-64)
- Background: Gradient from slate-900 to slate-950
- Border: Blue (#1F3BA0) with 20% opacity
- Logo: Tylersoft icon (36x36) with text "Tylersoft / API Hub"
- Active Item: Blue-to-Orange gradient with shadow
- User Section: Shows email and role with orange logout button

**Header**
- Height: 64px (h-16)
- Background: Semi-transparent slate with backdrop blur
- Search Input: Slate background with blue focus state
- Notifications: Orange indicator dot
- Avatar: Blue-to-Orange gradient circular badge

**Main Content**
- Background: Dark with subtle gradient
- Content Margin: 256px from left (ml-64), 64px from top (mt-16)
- Padding: 32px (p-8)

**API Info Card**
- Background: Subtle gradient with 20% blue/orange opacity
- Border: Blue with 20% opacity
- Cards Inside: Three info boxes with icons
  - Authentication icon: Purple/Blue gradient
  - Rate Limit icon: Blue
  - Endpoints icon: Green

**Endpoints List**
- Method Badges:
  - GET: Green (#10B981)
  - POST: Blue (#3B82F6)
  - PUT: Yellow (#F59E0B)
  - DELETE: Red (#EF4444)
- Hover Effect: Background lightens, "Try it" button appears
- Text: White for endpoints, gray for descriptions

---

## ADMIN DASHBOARD

**Route**: `/admin`  
**Access**: ADMIN role only  
**Purpose**: System management and monitoring

### Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                          HEADER                                  │
│  Search [____________]        🔔  👤 admin                      │
├──────────┬──────────────────────────────────────────────────────┤
│          │                                                       │
│ SIDEBAR  │                  MAIN CONTENT                        │
│          │                                                       │
│ Dashboard│  ┌─────────────────────────────────────────────────┐ │
│ (Active) │  │ Dashboard                                       │ │
│          │  │ Welcome back, Admin! Here's what's happening    │ │
│ Admin ✓  │  └─────────────────────────────────────────────────┘ │
│          │                                                       │
│ Logout   │  STATISTICS CARDS (5 across)                        │
│          │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│          │  │ 56       │ │ 128      │ │ 98       │ │ 24.5K  │ │
│          │  │ Total    │ │ Total    │ │ Active   │ │ API    │ │
│          │  │ APIs     │ │ Users    │ │ Users    │ │ Requests
│          │  │ ↑12%     │ │ ↑8%      │ │ ↑15%     │ │ ↑18%   │ │
│          │  └──────────┘ └──────────┘ └──────────┘ └────────┘ │
│          │  ┌──────────┐                                        │
│          │  │ 99.2%    │                                        │
│          │  │ Success  │                                        │
│          │  │ Rate     │                                        │
│          │  │ ↑2.1%    │                                        │
│          │  └──────────┘                                        │
│          │                                                       │
│          │  ┌─────────────────────┐  ┌──────────────────────┐  │
│          │  │  RECENT APIs  [View]│  │ QUICK ACTIONS        │  │
│          │  ├─────────────────────┤  ├──────────────────────┤  │
│          │  │ API Name  │Ver│Sts  │  │ ➕ Add New API      │  │
│          │  ├─────────────────────┤  │    Create & configure│  │
│          │  │ User Mgmt │v2.1│Pub │  ├──────────────────────┤  │
│          │  │ Payment   │v1.4│Pub │  │ 👥 Add New User     │  │
│          │  │ Orders    │v2.0│Pub │  │    Create & set perms
│          │  │ Inventory │v1.3│Drft│  ├──────────────────────┤  │
│          │  │ Notif     │v1.0│Pub │  │ 🔗 API Access       │  │
│          │  └─────────────────────┘  │    Manage permissions│  │
│          │                            ├──────────────────────┤  │
│          │  ┌─────────────────────────┤ 📋 View Logs        │  │
│          │  │ USER MANAGEMENT  [View] │    Check logs       │  │
│          │  ├─────────────────────────┤──────────────────────┤  │
│          │  │ User │Email│Role│Status│                      │  │
│          │  ├─────────────────────────┤                      │  │
│          │  │ JD   │john │Dev │Active│✎ 🗑                 │  │
│          │  │ JS   │jane │Dev │Active│✎ 🗑                 │  │
│          │  │ RB   │rob  │View│Active│✎ 🗑                 │  │
│          │  │ EJ   │emily│Dev │Inact │✎ 🗑                 │  │
│          │  │ ML   │mike │View│Active│✎ 🗑                 │  │
│          │  └─────────────────────────┘                      │  │
│          │                                                    │  │
└──────────┴────────────────────────────────────────────────────┘
```

### Visual Details

**Statistics Cards (5 Total)**
Each card has:
- Background: Gradient from color/20 to color/20 (semi-transparent)
- Icon: 24px colored icon matching the stat type
- Value: Large bold number
- Label: Smaller gray text
- Trend: Green text with up arrow

Card Types:
1. **Total APIs** - Purple/Blue gradient background, Package icon
2. **Total Users** - Blue gradient background, Users icon
3. **Active Users** - Green gradient background, CheckCircle icon
4. **API Requests** - Orange gradient background, Zap icon
5. **Success Rate** - Pink gradient background, TrendingUp icon

**Recent APIs Table**
- Columns: API Name | Version | Category | Status | Updated At | Actions
- Status Badge: Green for "Published", Yellow for "Draft"
- Icon: Package icon before API name
- Hover: Row background lightens, actions appear

**User Management Table**
- Columns: User | Email | Role | API Access | Status | Joined At | Actions
- User Avatar: Circular badge with initials, blue-to-orange gradient
- Status Badge: Green for "Active", Red for "Inactive"
- Actions: Edit (pencil) and Delete (trash) buttons
- Hover: Row background lightens

**Quick Actions Panel**
- Background: Slate with blue border
- 4 Action Cards:
  1. ➕ Add New API (Purple background)
  2. 👥 Add New User (Green background)
  3. 🔗 API Access (Orange background)
  4. 📋 View Logs (Pink background)
- Hover: Opacity reduces, text color changes

---

## Color Scheme Applied

### In User Dashboard
- **Primary**: Blue (#1F3BA0) - API info card border, info icons
- **Success**: Green (#10B981) - GET method badge, active indicators
- **Warning**: Yellow (#F59E0B) - PUT method badge
- **Info**: Blue (#3B82F6) - POST method badge
- **Danger**: Red (#EF4444) - DELETE method badge
- **Accent**: Orange (#FF6B35) - Hover effects, gradient combinations

### In Admin Dashboard
- **Primary**: Blue (#1F3BA0) - Active navigation, table headers
- **Secondary**: Orange (#FF6B35) - Gradients, quick action icons
- **Success**: Green (#10B981) - Active status, "Published" badge
- **Warning**: Yellow (#F59E0B) - "Draft" status, trend indicators
- **Info**: Blue (#3B82F6) - Statistics cards, icons
- **Accent**: Various colors for different stat types

---

## Responsive Behavior

### Mobile (< 768px)
- Sidebar: Collapsed to collapsed icon view (w-20)
- Header: Search bar hidden, only icons visible
- Statistics: Stack vertically (1 column)
- Tables: Horizontal scroll enabled

### Tablet (768px - 1024px)
- Sidebar: Remains full width (w-64)
- Statistics: 2-3 columns grid
- Tables: Slightly smaller padding

### Desktop (> 1024px)
- Full layout as shown
- Statistics: 5 columns grid
- Optimal spacing and readability

---

## Interactive Elements

### Buttons
- **Primary Button**: Blue-to-Orange gradient, white text
- **Secondary Button**: Gray text on transparent, hover darkens background
- **Logout Button**: Orange hover state

### Links
- Color: Blue (#1F3BA0)
- Hover: Orange (#FF6B35)
- Underline: None by default, appears on hover (optional)

### Input Fields
- Background: Slate-800 with 50% opacity
- Border: Blue with 20% opacity
- Focus: Border becomes solid blue, background lightens
- Text: White

### Status Indicators
- Active: Green (#10B981)
- Inactive: Gray (#9CA3AF)
- Pending: Yellow (#F59E0B)
- Error: Red (#EF4444)

---

## Typography

- **Heading 1** (h1): 30px, bold, white
- **Heading 2** (h2): 24px, bold, white
- **Heading 3** (h3): 20px, bold, white
- **Body**: 14px, normal, light gray (#E6E6E6)
- **Muted**: 12px, normal, darker gray (#9CA3AF)
- **Mono** (code): 12px, monospace, green (#10B981)

---

## Animation & Transitions

- **Hover Effects**: 200ms smooth transition
- **Button Click**: Slight scale (98% to 100%)
- **Badge Glow**: Subtle shadow on hover
- **Background Blur**: 4px backdrop blur on overlays

---

## Accessibility

- **Contrast Ratio**: WCAG AA (4.5:1) for all text
- **Color Blind Safe**: Gradients use blue and orange (distinct)
- **Focus States**: All interactive elements have visible focus ring
- **Semantic HTML**: Proper heading hierarchy and ARIA labels

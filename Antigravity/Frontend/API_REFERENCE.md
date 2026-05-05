# Backend API Reference

## Overview

This document describes the API endpoints expected by the frontend. Your Spring Boot backend should implement these endpoints to work seamlessly with the frontend application.

## Base URL

```
http://localhost:8080/api
```

## Authentication

All endpoints (except `/auth/login`) require a Bearer token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Endpoints

### Authentication

#### POST /auth/login

Login endpoint that returns user data and JWT token.

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "admin@example.com",
  "name": "Admin User",
  "role": "ADMIN",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (401):**
```json
{
  "message": "Invalid email or password"
}
```

---

### Users Management

#### GET /users

Get paginated list of all users. **Requires ADMIN role**.

**Query Parameters:**
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Results per page

**Success Response (200):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "john@example.com",
      "name": "John Doe",
      "role": "DEVELOPER",
      "status": "ACTIVE",
      "joinedAt": "2025-05-20",
      "apiAccess": 12
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10
}
```

---

#### GET /users/{id}

Get a specific user by ID.

**Success Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john@example.com",
  "name": "John Doe",
  "role": "DEVELOPER",
  "status": "ACTIVE",
  "joinedAt": "2025-05-20",
  "apiAccess": 12
}
```

---

#### POST /users

Create a new user. **Requires ADMIN role**.

**Request:**
```json
{
  "email": "newuser@example.com",
  "name": "New User",
  "password": "securePassword123",
  "role": "DEVELOPER"
}
```

**Success Response (201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "email": "newuser@example.com",
  "name": "New User",
  "role": "DEVELOPER",
  "status": "ACTIVE",
  "joinedAt": "2025-05-21",
  "apiAccess": 0
}
```

---

#### PUT /users/{id}

Update user information. **Requires ADMIN role or user updating their own profile**.

**Request (partial update):**
```json
{
  "name": "Updated Name",
  "role": "ADMIN"
}
```

**Success Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john@example.com",
  "name": "Updated Name",
  "role": "ADMIN",
  "status": "ACTIVE",
  "joinedAt": "2025-05-20",
  "apiAccess": 12
}
```

---

#### DELETE /users/{id}

Delete a user. **Requires ADMIN role**.

**Success Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

### APIs Management

#### GET /apis

Get paginated list of all APIs.

**Query Parameters:**
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Results per page

**Success Response (200):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "name": "User Management API",
      "version": "v2.1",
      "baseUrl": "https://api.yourdomain.com/v1",
      "category": "Users",
      "status": "PUBLISHED",
      "description": "Complete API for managing users, roles and permissions.",
      "endpoints": 5,
      "updatedAt": "2025-05-20"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 10
}
```

---

#### GET /apis/{id}

Get a specific API by ID.

**Success Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "name": "User Management API",
  "version": "v2.1",
  "baseUrl": "https://api.yourdomain.com/v1",
  "category": "Users",
  "status": "PUBLISHED",
  "description": "Complete API for managing users, roles and permissions.",
  "authentication": "Bearer Token",
  "rateLimit": "100 requests/min",
  "endpoints": [
    {
      "method": "GET",
      "path": "/users",
      "description": "Retrieve a list of all users"
    },
    {
      "method": "GET",
      "path": "/users/{id}",
      "description": "Retrieve a specific user by ID"
    },
    {
      "method": "POST",
      "path": "/users",
      "description": "Create a new user"
    },
    {
      "method": "PUT",
      "path": "/users/{id}",
      "description": "Update an existing user"
    },
    {
      "method": "DELETE",
      "path": "/users/{id}",
      "description": "Delete a user by ID"
    }
  ],
  "updatedAt": "2025-05-20"
}
```

---

#### POST /apis

Create a new API. **Requires ADMIN role**.

**Request:**
```json
{
  "name": "New API",
  "version": "v1.0",
  "description": "API description",
  "category": "Category",
  "baseUrl": "https://api.yourdomain.com/v1",
  "authentication": "Bearer Token",
  "rateLimit": "100 requests/min"
}
```

**Success Response (201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440003",
  "name": "New API",
  "version": "v1.0",
  "description": "API description",
  "category": "Category",
  "status": "DRAFT",
  "updatedAt": "2025-05-21"
}
```

---

#### PUT /apis/{id}

Update API information. **Requires ADMIN role**.

**Request (partial update):**
```json
{
  "version": "v1.1",
  "status": "PUBLISHED"
}
```

**Success Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440003",
  "name": "New API",
  "version": "v1.1",
  "description": "API description",
  "category": "Category",
  "status": "PUBLISHED",
  "updatedAt": "2025-05-21"
}
```

---

#### DELETE /apis/{id}

Delete an API. **Requires ADMIN role**.

**Success Response (200):**
```json
{
  "success": true,
  "message": "API deleted successfully"
}
```

---

### Dashboard

#### GET /dashboard/stats

Get dashboard statistics. **Requires authentication**.

**Success Response (200):**
```json
{
  "totalAPIs": 56,
  "totalUsers": 128,
  "activeUsers": 98,
  "requests": 24500,
  "successRate": 99.2,
  "monthlyTrends": {
    "apiGrowth": 12,
    "userGrowth": 8,
    "activeUserGrowth": 15,
    "requestGrowth": 18,
    "successRateChange": 2.1
  }
}
```

---

### Logs

#### GET /logs

Get API logs. **Requires ADMIN role**.

**Query Parameters:**
- `apiId` (optional): Filter by API ID
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 20): Results per page

**Success Response (200):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440004",
      "apiId": "550e8400-e29b-41d4-a716-446655440002",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "endpoint": "/users",
      "method": "GET",
      "statusCode": 200,
      "responseTime": 145,
      "createdAt": "2025-05-21T10:30:00Z"
    }
  ],
  "total": 1000,
  "page": 1,
  "limit": 20
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Invalid request parameters",
  "errors": ["field1 is required", "field2 must be a valid email"]
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthorized - please login"
}
```

### 403 Forbidden
```json
{
  "message": "You don't have permission to perform this action"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error",
  "error": "Error details (only in development)"
}
```

---

## Rate Limiting

Consider implementing rate limiting on your backend:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1621708200
```

---

## Common Response Headers

All responses should include:

```
Content-Type: application/json
Access-Control-Allow-Origin: http://localhost:5173 (or your frontend URL)
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## Implementation Notes

1. **Pagination**: Always return paginated results with `total`, `page`, and `limit` fields
2. **Timestamps**: Use ISO 8601 format (e.g., "2025-05-21T10:30:00Z")
3. **UUIDs**: Use UUID format for all IDs
4. **Error Handling**: Return appropriate HTTP status codes
5. **JWT Tokens**: Use HS256 or RS256 algorithm for JWT signing
6. **Password Security**: Hash passwords using bcrypt (min 10 rounds)
7. **CORS**: Enable CORS for your frontend URL
8. **Validation**: Validate all incoming data on the backend

---

## Example Spring Boot Implementation

See the main README.md for example Spring Boot controller code.

// ── Auth ─────────────────────────────────────────────────────
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  role: 'ADMIN' | 'USER'
  name: string
  email: string
}

// ── User ─────────────────────────────────────────────────────
export type Role = 'ADMIN' | 'USER'

export interface User {
  id: number
  name: string
  email: string
  role: Role
  active: boolean
  failedAttempts: number
  lockedUntil: string | null
  createdAt: string
}

// ── API Resource ──────────────────────────────────────────────
export interface ApiResource {
  id: number
  name: string
  endpointUrl: string
  description: string
  documentation: string
  createdAt: string
}

// ── Assignment ────────────────────────────────────────────────
export interface UserApiAssignment {
  id: number
  userId: number
  apiId: number
  assignedAt: string
}

// ── Audit ─────────────────────────────────────────────────────
export interface AuditLog {
  id: number
  actorEmail: string
  action: string
  entity: string
  entityId: number
  detail: string
  ipAddress: string
  performedAt: string
}

// ── API Wrapper ───────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean
  message: string | null
  data: T
  timestamp: string
}

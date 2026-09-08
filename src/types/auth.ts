export interface User {
  id: string
  fullName: string
  email: string
}

export interface LoginRequest {
  email: string
  password: string
  rememberMe: boolean
}

export interface RegisterRequest {
  fullName: string
  email: string
  password: string
}

export interface ResetPasswordRequest {
  email: string
  tempPassword: string
  newPassword: string
}

export interface ForgotPasswordRequest {
  email: string
}

/** All three auth endpoints (login/register/me) resolve to the current user. */
export type AuthResponse = User

/** Shape of an error response body as sent by the backend. */
export interface ApiErrorBody {
  message: string
  errors?: Record<string, string>
}

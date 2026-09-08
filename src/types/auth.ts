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

export type AuthResponse = User

export interface ApiErrorBody {
  message: string
  errors?: Record<string, string>
}

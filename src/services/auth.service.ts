import { apiClient } from '@/lib/api-client'
import type {
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  MessageResponse,
  RegisterRequest,
  ResetPasswordRequest,
} from '@/types/auth'

export function register(payload: RegisterRequest) {
  return apiClient.post<AuthResponse>('/auth/register', payload)
}

export function login(payload: LoginRequest) {
  return apiClient.post<AuthResponse>('/auth/login', payload, { skipAuthRefresh: true })
}

export function refresh() {
  return apiClient.post<AuthResponse>('/auth/refresh', undefined, { skipAuthRefresh: true })
}

export function resetPassword(payload: ResetPasswordRequest) {
  return apiClient.post<MessageResponse>('/auth/change-password', payload, {
    skipAuthRefresh: true,
  })
}

export function forgotPassword(payload: ForgotPasswordRequest) {
  return apiClient.post<MessageResponse>('/auth/forgot-password', payload)
}

export function logout() {
  return apiClient.post<void>('/auth/logout')
}

export function getCurrentUser() {
  return apiClient.get<AuthResponse>('/auth/me')
}

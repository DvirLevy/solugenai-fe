import { apiClient } from '@/lib/api-client'
import type { AuthResponse, LoginRequest, RegisterRequest } from '@/types/auth'

export function register(payload: RegisterRequest) {
  return apiClient.post<AuthResponse>('/auth/register', payload)
}

export function login(payload: LoginRequest) {
  return apiClient.post<AuthResponse>('/auth/login', payload)
}

export function logout() {
  return apiClient.post<void>('/auth/logout')
}

export function getCurrentUser() {
  return apiClient.get<AuthResponse>('/auth/me')
}

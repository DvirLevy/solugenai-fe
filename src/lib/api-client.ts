import type { ApiErrorBody } from '@/types/auth'

const API_URL = import.meta.env.VITE_API_URL

/**
 * Thrown by every apiClient call. `status` is 0 for network failures
 * (no HTTP response at all). `message` is always safe to show a user —
 * backend internals never surface here.
 */
export class ApiError extends Error {
  status: number
  fieldErrors?: Record<string, string>

  constructor(status: number, message: string, fieldErrors?: Record<string, string>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let response: Response

  try {
    response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? 'GET',
      credentials: 'include',
      headers:
        options.body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    })
  } catch {
    throw new ApiError(
      0,
      'Unable to reach the server. Check your connection and try again.',
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  const text = await response.text()
  let data: unknown = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = null
    }
  }

  if (!response.ok) {
    const body = (data ?? {}) as Partial<ApiErrorBody>
    const message =
      response.status >= 500
        ? 'Something went wrong on our end. Please try again later.'
        : (body.message ?? 'The request could not be completed.')
    throw new ApiError(response.status, message, body.errors)
  }

  return data as T
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
}

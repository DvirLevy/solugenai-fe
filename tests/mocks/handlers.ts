import { http, HttpResponse } from 'msw'

const BASE = 'http://localhost:4000/api'

export const mockUser = {
  id: 'user-1',
  fullName: 'Jane Doe',
  email: 'jane.doe@example.com',
  mustChangePassword: false,
}

/**
 * Default happy-path + "signed out" handlers. Individual tests override
 * specific endpoints via `server.use(...)` for error scenarios.
 *
 * `/auth/refresh` defaults to a 401 (no valid refresh token either) so the
 * default "signed out" `/auth/me` case resolves the same way it did before
 * apiClient started retrying 401s through a refresh — tests that want a
 * successful refresh override this handler explicitly.
 */
export const handlers = [
  http.get(`${BASE}/auth/me`, () => {
    return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }),
  http.post(`${BASE}/auth/refresh`, () => {
    return HttpResponse.json({ message: 'Unauthorized.' }, { status: 401 })
  }),
  http.post(`${BASE}/auth/login`, () => {
    return HttpResponse.json(mockUser, { status: 200 })
  }),
  http.post(`${BASE}/auth/register`, () => {
    return HttpResponse.json(mockUser, { status: 201 })
  }),
  http.post(`${BASE}/auth/logout`, () => {
    return new HttpResponse(null, { status: 204 })
  }),
  http.post(`${BASE}/auth/change-password`, () => {
    return HttpResponse.json({ message: 'Your password has been changed. Please sign in.' })
  }),
  http.post(`${BASE}/auth/forgot-password`, () => {
    return HttpResponse.json({
      message: 'If that account exists, a temporary password has been emailed to it.',
    })
  }),
]

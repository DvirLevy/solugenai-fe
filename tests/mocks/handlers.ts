import { http, HttpResponse } from 'msw'

const BASE = 'http://localhost:4000/api'

export const mockUser = {
  id: 'user-1',
  fullName: 'Jane Doe',
  email: 'jane.doe@example.com',
}

/**
 * Default happy-path + "signed out" handlers. Individual tests override
 * specific endpoints via `server.use(...)` for error scenarios.
 */
export const handlers = [
  http.get(`${BASE}/auth/me`, () => {
    return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
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
]

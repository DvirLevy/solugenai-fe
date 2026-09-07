import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { apiClient, ApiError } from '@/lib/api-client'
import { server } from '../mocks/server'

const BASE = 'http://localhost:4000/api'

describe('apiClient error normalization', () => {
  it('surfaces a 401 as an ApiError with status 401', async () => {
    server.use(
      http.get(`${BASE}/probe`, () =>
        HttpResponse.json({ message: 'Unauthorized' }, { status: 401 }),
      ),
    )

    await expect(apiClient.get('/probe')).rejects.toMatchObject({
      status: 401,
    })
  })

  it('carries field errors from a 400 response without altering the message', async () => {
    server.use(
      http.post(`${BASE}/probe`, () =>
        HttpResponse.json(
          { message: 'Validation failed', errors: { email: 'Email already in use.' } },
          { status: 400 },
        ),
      ),
    )

    try {
      await apiClient.post('/probe')
      expect.unreachable('expected apiClient.post to throw')
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError)
      const apiError = error as ApiError
      expect(apiError.status).toBe(400)
      expect(apiError.message).toBe('Validation failed')
      expect(apiError.fieldErrors).toEqual({ email: 'Email already in use.' })
    }
  })

  it('maps a 500 to a generic message and never leaks backend detail', async () => {
    server.use(
      http.get(`${BASE}/probe`, () =>
        HttpResponse.json(
          { message: 'TypeError: cannot read property x of undefined at db.ts:42' },
          { status: 500 },
        ),
      ),
    )

    try {
      await apiClient.get('/probe')
      expect.unreachable('expected apiClient.get to throw')
    } catch (error) {
      const apiError = error as ApiError
      expect(apiError.status).toBe(500)
      expect(apiError.message).not.toMatch(/TypeError|db\.ts/)
      expect(apiError.message).toBe('Something went wrong on our end. Please try again later.')
    }
  })

  it('maps a network failure to status 0 with a friendly message', async () => {
    server.use(http.get(`${BASE}/probe`, () => HttpResponse.error()))

    try {
      await apiClient.get('/probe')
      expect.unreachable('expected apiClient.get to throw')
    } catch (error) {
      const apiError = error as ApiError
      expect(apiError.status).toBe(0)
      expect(apiError.message).toMatch(/connection/i)
    }
  })
})

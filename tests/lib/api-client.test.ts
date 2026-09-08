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

describe('apiClient auth-refresh retry', () => {
  it('retries once after a successful refresh on a 401', async () => {
    let probeCalls = 0
    server.use(
      http.get(`${BASE}/probe`, () => {
        probeCalls += 1
        return probeCalls === 1
          ? HttpResponse.json({ message: 'Unauthorized.' }, { status: 401 })
          : HttpResponse.json({ ok: true })
      }),
      http.post(`${BASE}/auth/refresh`, () => HttpResponse.json({ id: 'user-1' })),
    )

    await expect(apiClient.get('/probe')).resolves.toEqual({ ok: true })
    expect(probeCalls).toBe(2)
  })

  it('surfaces the original 401 when the refresh itself fails', async () => {
    server.use(
      http.get(`${BASE}/probe`, () =>
        HttpResponse.json({ message: 'Unauthorized.' }, { status: 401 }),
      ),
      http.post(`${BASE}/auth/refresh`, () =>
        HttpResponse.json({ message: 'Unauthorized.' }, { status: 401 }),
      ),
    )

    await expect(apiClient.get('/probe')).rejects.toMatchObject({ status: 401 })
  })

  it('does not attempt a refresh when skipAuthRefresh is set', async () => {
    let refreshCalls = 0
    server.use(
      http.get(`${BASE}/probe`, () =>
        HttpResponse.json({ message: 'Unauthorized.' }, { status: 401 }),
      ),
      http.post(`${BASE}/auth/refresh`, () => {
        refreshCalls += 1
        return HttpResponse.json({ id: 'user-1' })
      }),
    )

    await expect(apiClient.get('/probe', { skipAuthRefresh: true })).rejects.toMatchObject({
      status: 401,
    })
    expect(refreshCalls).toBe(0)
  })

  it('coalesces concurrent 401s into a single refresh call', async () => {
    let refreshCalls = 0
    let aCalls = 0
    let bCalls = 0
    server.use(
      http.get(`${BASE}/probe-a`, () => {
        aCalls += 1
        return aCalls === 1
          ? HttpResponse.json({ message: 'Unauthorized.' }, { status: 401 })
          : HttpResponse.json({ ok: 'a' })
      }),
      http.get(`${BASE}/probe-b`, () => {
        bCalls += 1
        return bCalls === 1
          ? HttpResponse.json({ message: 'Unauthorized.' }, { status: 401 })
          : HttpResponse.json({ ok: 'b' })
      }),
      http.post(`${BASE}/auth/refresh`, () => {
        refreshCalls += 1
        return HttpResponse.json({ id: 'user-1' })
      }),
    )

    const [a, b] = await Promise.all([apiClient.get('/probe-a'), apiClient.get('/probe-b')])

    expect(a).toEqual({ ok: 'a' })
    expect(b).toEqual({ ok: 'b' })
    expect(refreshCalls).toBe(1)
  })
})

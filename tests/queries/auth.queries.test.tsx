import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { QueryClientProvider } from '@tanstack/react-query'
import { authKeys, useCurrentUser, useLogin, useLogout } from '@/queries/auth.queries'
import { createTestQueryClient } from '../utils'
import { mockUser } from '../mocks/handlers'
import { server } from '../mocks/server'

const BASE = 'http://localhost:4000/api'

function wrapperFor(queryClient: ReturnType<typeof createTestQueryClient>) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('useCurrentUser', () => {
  it('resolves to null on a 401 instead of erroring', async () => {
    const queryClient = createTestQueryClient()
    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: wrapperFor(queryClient),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBeNull()
    expect(result.current.isError).toBe(false)
  })

  it('resolves to the user on success', async () => {
    server.use(http.get(`${BASE}/auth/me`, () => HttpResponse.json(mockUser)))

    const queryClient = createTestQueryClient()
    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: wrapperFor(queryClient),
    })

    await waitFor(() => expect(result.current.data).toEqual(mockUser))
  })
})

describe('useLogin', () => {
  it('invalidates the current-user query, causing an active observer to refetch', async () => {
    const queryClient = createTestQueryClient()
    queryClient.setQueryData(authKeys.currentUser, null)
    server.use(http.get(`${BASE}/auth/me`, () => HttpResponse.json(mockUser)))

    // Mirrors real usage: the Dashboard route keeps useCurrentUser mounted,
    // so the invalidation from a successful login has something to refetch.
    const { result } = renderHook(
      () => ({ login: useLogin(), currentUser: useCurrentUser() }),
      { wrapper: wrapperFor(queryClient) },
    )

    result.current.login.mutate({
      email: 'jane@example.com',
      password: 'x',
      rememberMe: false,
    })

    await waitFor(() => expect(result.current.login.isSuccess).toBe(true))
    await waitFor(() => expect(result.current.currentUser.data).toEqual(mockUser))
  })
})

describe('useLogout', () => {
  it('clears the current-user cache on success', async () => {
    const queryClient = createTestQueryClient()
    queryClient.setQueryData(authKeys.currentUser, mockUser)

    const { result } = renderHook(() => useLogout(), { wrapper: wrapperFor(queryClient) })

    result.current.mutate()

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(queryClient.getQueryData(authKeys.currentUser)).toBeNull()
  })
})

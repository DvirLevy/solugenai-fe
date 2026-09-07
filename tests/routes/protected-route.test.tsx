import { http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { mockUser } from '../mocks/handlers'
import { server } from '../mocks/server'
import { renderWithProviders, screen, waitFor } from '../utils'

const BASE = 'http://localhost:4000/api'

function Tree() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<div>Protected Content</div>} />
      </Route>
      <Route path="/login" element={<div>Login Page</div>} />
    </Routes>
  )
}

describe('ProtectedRoute', () => {
  it('shows a loading state, then redirects an unauthenticated visitor without ever rendering protected content', async () => {
    renderWithProviders(<Tree />, { route: '/dashboard' })

    expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()

    await waitFor(() => expect(screen.getByText('Login Page')).toBeInTheDocument())
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('renders the protected content for an authenticated visitor', async () => {
    server.use(http.get(`${BASE}/auth/me`, () => HttpResponse.json(mockUser)))

    renderWithProviders(<Tree />, { route: '/dashboard' })

    await waitFor(() => expect(screen.getByText('Protected Content')).toBeInTheDocument())
  })
})

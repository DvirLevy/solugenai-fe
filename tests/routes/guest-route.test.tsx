import { http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { GuestRoute } from '@/routes/GuestRoute'
import { mockUser } from '../mocks/handlers'
import { server } from '../mocks/server'
import { renderWithProviders, screen, waitFor } from '../utils'

const BASE = 'http://localhost:4000/api'

function Tree() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<div>Login Page</div>} />
      </Route>
      <Route path="/dashboard" element={<div>Dashboard Page</div>} />
    </Routes>
  )
}

describe('GuestRoute', () => {
  it('renders the guest page for an unauthenticated visitor', async () => {
    renderWithProviders(<Tree />, { route: '/login' })

    await waitFor(() => expect(screen.getByText('Login Page')).toBeInTheDocument())
  })

  it('bounces an authenticated visitor to /dashboard', async () => {
    server.use(http.get(`${BASE}/auth/me`, () => HttpResponse.json(mockUser)))

    renderWithProviders(<Tree />, { route: '/login' })

    await waitFor(() => expect(screen.getByText('Dashboard Page')).toBeInTheDocument())
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument()
  })
})

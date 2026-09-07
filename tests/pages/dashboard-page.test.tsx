import { http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { DashboardPage } from '@/pages/DashboardPage'
import { mockUser } from '../mocks/handlers'
import { server } from '../mocks/server'
import { renderWithProviders, screen, userEvent, waitFor } from '../utils'

const BASE = 'http://localhost:4000/api'

function Tree() {
  return (
    <Routes>
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/login" element={<div>Login Page</div>} />
    </Routes>
  )
}

describe('DashboardPage', () => {
  it("renders the user's full name and email", async () => {
    server.use(http.get(`${BASE}/auth/me`, () => HttpResponse.json(mockUser)))
    renderWithProviders(<Tree />, { route: '/dashboard' })

    expect(
      await screen.findByRole('heading', { name: /welcome back, jane/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(mockUser.fullName)).toBeInTheDocument()
    expect(screen.getAllByText(mockUser.email)).toHaveLength(2)
  })

  it('clears the session and returns to /login on logout', async () => {
    server.use(http.get(`${BASE}/auth/me`, () => HttpResponse.json(mockUser)))
    const user = userEvent.setup()
    renderWithProviders(<Tree />, { route: '/dashboard' })

    await screen.findByRole('heading', { name: /welcome back, jane/i })
    await user.click(screen.getByRole('button', { name: 'Log out' }))

    await waitFor(() => expect(screen.getByText('Login Page')).toBeInTheDocument())
  })
})

import { http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { RegisterPage } from '@/pages/RegisterPage'
import { GuestRoute } from '@/routes/GuestRoute'
import { mockUser } from '../mocks/handlers'
import { server } from '../mocks/server'
import { renderWithProviders, screen, userEvent, waitFor } from '../utils'

const BASE = 'http://localhost:4000/api'

/**
 * Mirrors AppRoutes: /register sits behind GuestRoute in production, and
 * RegisterPage's post-submit refetch relies on that ancestor's mounted
 * useCurrentUser() observer already owning the query.
 */
function Tree() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      <Route path="/login" element={<div>Login Page</div>} />
      <Route path="/dashboard" element={<div>Dashboard Page</div>} />
    </Routes>
  )
}

async function fillForm(
  user: ReturnType<typeof userEvent.setup>,
  overrides: Partial<Record<'fullName' | 'email' | 'password' | 'confirmPassword', string>> = {},
) {
  const values = {
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    password: 'Password1!',
    confirmPassword: 'Password1!',
    ...overrides,
  }
  await user.type(await screen.findByLabelText('Full name'), values.fullName)
  await user.type(screen.getByLabelText('Email'), values.email)
  await user.type(screen.getByLabelText('Password'), values.password)
  await user.type(screen.getByLabelText('Confirm password'), values.confirmPassword)
}

describe('RegisterPage', () => {
  it('blocks submission when passwords do not match', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Tree />, { route: '/register' })

    await fillForm(user, { confirmPassword: 'Different1!' })
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument()
  })

  it('maps a duplicate-email backend error onto the email field', async () => {
    server.use(
      http.post(`${BASE}/auth/register`, () =>
        HttpResponse.json(
          { message: 'Validation failed', errors: { email: 'Email already in use.' } },
          { status: 400 },
        ),
      ),
    )
    const user = userEvent.setup()
    renderWithProviders(<Tree />, { route: '/register' })

    await fillForm(user)
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(await screen.findByText('Email already in use.')).toBeInTheDocument()
  })

  it('navigates to the dashboard when registration auto-authenticates', async () => {
    // Unauthenticated until registration actually succeeds, so the form
    // renders first and the dashboard redirect only follows the real
    // post-submit refetch — not a GuestRoute bounce on initial mount.
    let registered = false
    server.use(
      http.post(`${BASE}/auth/register`, () => {
        registered = true
        return HttpResponse.json(mockUser, { status: 201 })
      }),
      http.get(`${BASE}/auth/me`, () =>
        registered
          ? HttpResponse.json(mockUser)
          : HttpResponse.json({ message: 'Unauthorized' }, { status: 401 }),
      ),
    )
    const user = userEvent.setup()
    renderWithProviders(<Tree />, { route: '/register' })

    await fillForm(user)
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    await waitFor(() => expect(screen.getByText('Dashboard Page')).toBeInTheDocument())
  })

  it('navigates to login when registration does not authenticate', async () => {
    // Default /auth/me handler returns 401 — no override needed.
    const user = userEvent.setup()
    renderWithProviders(<Tree />, { route: '/register' })

    await fillForm(user, { email: 'someone.else@example.com' })
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    await waitFor(() => expect(screen.getByText('Login Page')).toBeInTheDocument())
  })
})

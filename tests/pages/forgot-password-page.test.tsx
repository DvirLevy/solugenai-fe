import { http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { GuestRoute } from '@/routes/GuestRoute'
import { server } from '../mocks/server'
import { renderWithProviders, screen, userEvent, waitFor } from '../utils'

const BASE = 'http://localhost:4000/api'

/** Mirrors AppRoutes: /forgot-password sits behind GuestRoute in production. */
function Tree() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>
      <Route path="/login" element={<div>Login Page</div>} />
    </Routes>
  )
}

describe('ForgotPasswordPage', () => {
  it('rejects an invalid email', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Tree />, { route: '/forgot-password' })

    await user.type(await screen.findByLabelText('Email'), 'not-an-email')
    await user.click(screen.getByRole('button', { name: 'Send temporary password' }))

    expect(
      await screen.findByText('Please enter a valid email address.'),
    ).toBeInTheDocument()
  })

  it('shows a generic confirmation after a successful submission', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Tree />, { route: '/forgot-password' })

    await user.type(await screen.findByLabelText('Email'), 'jane@example.com')
    await user.click(screen.getByRole('button', { name: 'Send temporary password' }))

    expect(await screen.findByText('Check your email')).toBeInTheDocument()
    expect(screen.queryByLabelText('Email')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to sign in' })).toBeInTheDocument()
  })

  it('shows the same confirmation even when the backend reports the email is unknown', async () => {
    // Guards against email enumeration: an "unknown email" response must
    // read identically to success in the UI.
    server.use(
      http.post(`${BASE}/auth/forgot-password`, () => {
        return new HttpResponse(null, { status: 204 })
      }),
    )
    const user = userEvent.setup()
    renderWithProviders(<Tree />, { route: '/forgot-password' })

    await user.type(await screen.findByLabelText('Email'), 'unknown@example.com')
    await user.click(screen.getByRole('button', { name: 'Send temporary password' }))

    expect(await screen.findByText('Check your email')).toBeInTheDocument()
  })

  it('shows a form error when the request fails outright', async () => {
    server.use(
      http.post(`${BASE}/auth/forgot-password`, () =>
        HttpResponse.json({ message: 'Too many requests.' }, { status: 429 }),
      ),
    )
    const user = userEvent.setup()
    renderWithProviders(<Tree />, { route: '/forgot-password' })

    await user.type(await screen.findByLabelText('Email'), 'jane@example.com')
    await user.click(screen.getByRole('button', { name: 'Send temporary password' }))

    expect(await screen.findByText('Too many requests.')).toBeInTheDocument()
  })

  it('navigates to login via the "Sign in" link', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Tree />, { route: '/forgot-password' })

    await user.click(await screen.findByRole('link', { name: 'Sign in' }))

    await waitFor(() => expect(screen.getByText('Login Page')).toBeInTheDocument())
  })
})

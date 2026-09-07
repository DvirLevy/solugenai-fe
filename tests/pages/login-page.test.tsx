import { delay, http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { LoginPage } from '@/pages/LoginPage'
import { mockUser } from '../mocks/handlers'
import { server } from '../mocks/server'
import { renderWithProviders, screen, userEvent, waitFor } from '../utils'

const BASE = 'http://localhost:4000/api'

function Tree() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<div>Dashboard Page</div>} />
    </Routes>
  )
}

describe('LoginPage', () => {
  it('shows validation errors on empty submit', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Tree />, { route: '/login' })

    await waitFor(() => screen.getByRole('button', { name: 'Sign In' }))
    await user.click(screen.getByRole('button', { name: 'Sign In' }))

    expect(await screen.findByText('Email is required.')).toBeInTheDocument()
    expect(screen.getByText('Password is required.')).toBeInTheDocument()
  })

  it('renders a friendly alert on invalid credentials and re-enables the button', async () => {
    server.use(
      http.post(`${BASE}/auth/login`, () =>
        HttpResponse.json({ message: 'Invalid email or password.' }, { status: 401 }),
      ),
    )
    const user = userEvent.setup()
    renderWithProviders(<Tree />, { route: '/login' })

    await user.type(await screen.findByLabelText('Email'), 'jane@example.com')
    await user.type(screen.getByLabelText('Password'), 'wrongpass')
    await user.click(screen.getByRole('button', { name: 'Sign In' }))

    expect(await screen.findByText('Invalid email or password.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeEnabled()
  })

  it('disables submission while the request is pending', async () => {
    server.use(
      http.post(`${BASE}/auth/login`, async () => {
        await delay(50)
        return HttpResponse.json(mockUser)
      }),
    )
    const user = userEvent.setup()
    renderWithProviders(<Tree />, { route: '/login' })

    await user.type(await screen.findByLabelText('Email'), 'jane@example.com')
    await user.type(screen.getByLabelText('Password'), 'Password1!')
    const submit = screen.getByRole('button', { name: 'Sign In' })
    await user.click(submit)

    expect(submit).toBeDisabled()
    await waitFor(() => expect(screen.getByText('Dashboard Page')).toBeInTheDocument())
  })

  it('navigates to the dashboard on success', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Tree />, { route: '/login' })

    await user.type(await screen.findByLabelText('Email'), 'jane@example.com')
    await user.type(screen.getByLabelText('Password'), 'Password1!')
    await user.click(screen.getByRole('button', { name: 'Sign In' }))

    await waitFor(() => expect(screen.getByText('Dashboard Page')).toBeInTheDocument())
  })
})

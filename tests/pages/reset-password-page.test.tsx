import { http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ResetPasswordPage } from '@/pages/ResetPasswordPage'
import { GuestRoute } from '@/routes/GuestRoute'
import { server } from '../mocks/server'
import { renderWithProviders, screen, userEvent, waitFor } from '../utils'

const BASE = 'http://localhost:4000/api'

/** Mirrors AppRoutes: /reset-password sits behind GuestRoute in production. */
function Tree() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>
      <Route path="/login" element={<div>Login Page</div>} />
    </Routes>
  )
}

async function fillForm(
  user: ReturnType<typeof userEvent.setup>,
  overrides: Partial<
    Record<'tempPassword' | 'newPassword' | 'confirmNewPassword', string>
  > = {},
) {
  const values = {
    tempPassword: 'Temp1234!',
    newPassword: 'NewPassword1!',
    confirmNewPassword: 'NewPassword1!',
    ...overrides,
  }
  await user.type(
    await screen.findByLabelText('Temporary password'),
    values.tempPassword,
  )
  await user.type(screen.getByLabelText('New password'), values.newPassword)
  await user.type(
    screen.getByLabelText('Confirm new password'),
    values.confirmNewPassword,
  )
}

describe('ResetPasswordPage', () => {
  it('shows an invalid-link message and no form when the email is missing from the URL', async () => {
    renderWithProviders(<Tree />, { route: '/reset-password' })

    expect(
      await screen.findByText(/this link is invalid or has expired/i),
    ).toBeInTheDocument()
    expect(screen.queryByLabelText('Temporary password')).not.toBeInTheDocument()
  })

  it('blocks submission when the new password and confirmation do not match', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Tree />, {
      route: '/reset-password?email=jane%40example.com',
    })

    await fillForm(user, { confirmNewPassword: 'Different1!' })
    await user.click(screen.getByRole('button', { name: 'Set new password' }))

    expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument()
  })

  it('blocks submission when the new password matches the temporary password', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Tree />, {
      route: '/reset-password?email=jane%40example.com',
    })

    await fillForm(user, {
      tempPassword: 'SamePass1!',
      newPassword: 'SamePass1!',
      confirmNewPassword: 'SamePass1!',
    })
    await user.click(screen.getByRole('button', { name: 'Set new password' }))

    expect(
      await screen.findByText('New password must be different from the temporary password.'),
    ).toBeInTheDocument()
  })

  it('maps an invalid-temporary-password backend error onto the tempPassword field', async () => {
    server.use(
      http.post(`${BASE}/auth/reset-password`, () =>
        HttpResponse.json(
          {
            message: 'Validation failed',
            errors: { tempPassword: 'That temporary password is incorrect or has expired.' },
          },
          { status: 400 },
        ),
      ),
    )
    const user = userEvent.setup()
    renderWithProviders(<Tree />, {
      route: '/reset-password?email=jane%40example.com',
    })

    await fillForm(user)
    await user.click(screen.getByRole('button', { name: 'Set new password' }))

    expect(
      await screen.findByText('That temporary password is incorrect or has expired.'),
    ).toBeInTheDocument()
  })

  it('navigates to login after a successful reset', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Tree />, {
      route: '/reset-password?email=jane%40example.com',
    })

    await fillForm(user)
    await user.click(screen.getByRole('button', { name: 'Set new password' }))

    await waitFor(() => expect(screen.getByText('Login Page')).toBeInTheDocument())
  })
})

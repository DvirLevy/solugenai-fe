import { describe, expect, it } from 'vitest'
import { PasswordField } from '@/components/common/password-field'
import { render, screen, userEvent } from '../utils'

describe('PasswordField', () => {
  it('defaults to a masked input with a Show toggle', () => {
    render(<PasswordField id="password" label="Password" />)

    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password')
    expect(screen.getByRole('button', { name: /show password/i })).toBeInTheDocument()
  })

  it('reveals the password on toggle and can be toggled back, via keyboard', async () => {
    const user = userEvent.setup()
    render(<PasswordField id="password" label="Password" />)

    const toggle = screen.getByRole('button', { name: /show password/i })
    await user.tab()
    await user.tab()
    expect(toggle).toHaveFocus()

    await user.keyboard('{Enter}')
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'text')
    expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /hide password/i }))
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password')
  })
})

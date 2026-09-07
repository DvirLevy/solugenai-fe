import { describe, expect, it } from 'vitest'
import { FormField } from '@/components/common/form-field'
import { render, screen } from '../utils'

describe('FormField', () => {
  it('binds the label to the control via htmlFor/id', () => {
    render(<FormField id="email" label="Email" placeholder="Enter email" />)

    const input = screen.getByLabelText('Email')
    expect(input).toHaveAttribute('id', 'email')
  })

  it('exposes an error via aria-invalid and aria-describedby', () => {
    render(
      <FormField id="email" label="Email" error="Please enter a valid email address." />,
    )

    const input = screen.getByLabelText('Email')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('aria-describedby', 'email-error')
    expect(screen.getByText('Please enter a valid email address.')).toHaveAttribute(
      'id',
      'email-error',
    )
  })

  it('shows helper text and describedby when there is no error', () => {
    render(<FormField id="name" label="Full name" helperText="As it appears on your ID" />)

    const input = screen.getByLabelText('Full name')
    expect(input).toHaveAttribute('aria-invalid', 'false')
    expect(input).toHaveAttribute('aria-describedby', 'name-helper')
    expect(screen.getByText('As it appears on your ID')).toBeInTheDocument()
  })
})

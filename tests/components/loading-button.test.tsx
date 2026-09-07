import { describe, expect, it } from 'vitest'
import { LoadingButton } from '@/components/common/loading-button'
import { render, screen } from '../utils'

describe('LoadingButton', () => {
  it('is enabled and shows no spinner by default', () => {
    render(<LoadingButton>Sign In</LoadingButton>)

    const button = screen.getByRole('button', { name: 'Sign In' })
    expect(button).toBeEnabled()
    expect(button.querySelector('svg')).not.toBeInTheDocument()
  })

  it('disables the button and shows a spinner while loading', () => {
    render(<LoadingButton isLoading>Sign In</LoadingButton>)

    const button = screen.getByRole('button', { name: 'Sign In' })
    expect(button).toBeDisabled()
    expect(button.querySelector('svg')).toBeInTheDocument()
  })

  it('stays disabled when explicitly disabled, independent of isLoading', () => {
    render(<LoadingButton disabled>Sign In</LoadingButton>)

    expect(screen.getByRole('button', { name: 'Sign In' })).toBeDisabled()
  })
})

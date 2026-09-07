import { describe, expect, it } from 'vitest'
import { UserBadge } from '@/components/common/user-badge'
import { render, screen } from '../utils'

describe('UserBadge', () => {
  it('derives initials from a two-word full name', () => {
    render(<UserBadge fullName="Jane Doe" email="jane.doe@example.com" />)

    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('falls back to the first two letters for a single-word name', () => {
    render(<UserBadge fullName="Cher" email="cher@example.com" />)

    expect(screen.getByText('CH')).toBeInTheDocument()
  })

  it('degrades to no initials when the name is missing', () => {
    render(<UserBadge fullName={undefined} email="anon@example.com" />)

    expect(screen.queryByText(/[A-Z]{2}/)).not.toBeInTheDocument()
  })

  it('always renders the email', () => {
    render(<UserBadge fullName="Jane Doe" email="jane.doe@example.com" />)

    expect(screen.getByText('jane.doe@example.com')).toBeInTheDocument()
  })
})

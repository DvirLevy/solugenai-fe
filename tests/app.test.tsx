import { describe, expect, it } from 'vitest'
import App from '@/App'
import { renderWithProviders, screen } from './utils'

describe('app shell', () => {
  it('mounts through the shared providers', () => {
    renderWithProviders(<App />)

    expect(
      screen.getByRole('heading', { name: /design tokens/i }),
    ).toBeInTheDocument()
  })
})

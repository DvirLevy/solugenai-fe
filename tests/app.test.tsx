import { describe, expect, it } from 'vitest'
import App from '@/App'
import { renderWithProviders, screen } from './utils'

describe('app shell', () => {
  it('mounts through the shared providers', () => {
    renderWithProviders(<App />)

    expect(
      screen.getAllByRole('heading', { name: /welcome back/i, level: 1 }),
    ).not.toHaveLength(0)
  })
})

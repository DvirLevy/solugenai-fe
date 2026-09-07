import { describe, expect, it } from 'vitest'
import App from '@/App'
import { renderWithProviders, screen, waitFor } from './utils'

describe('app shell', () => {
  it('mounts through the shared providers and routes an unauthenticated visitor to Login', async () => {
    renderWithProviders(<App />, { route: '/' })

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: /welcome back/i, level: 1 }),
      ).toBeInTheDocument(),
    )
  })
})

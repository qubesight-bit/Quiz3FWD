import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Inventario - Constructora Del Valle S.A.',
    short_name: 'Inventario DV',
    description: 'Sistema de control de inventario para Constructora Del Valle S.A.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f0f4f8',
    theme_color: '#1e5db3',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
  }
}

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'ERW Bakim Kontrol Merkezi',
        short_name: 'ERW Bakim',
        description: 'ERW Bakim Kontrol Merkezi uygulamasi',
        lang: 'tr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#1d4ed8',
        background_color: '#f8fafc',
        icons: [
          {
            src: '/pwa-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,html,svg,png,ico,json}'],
        navigateFallbackDenylist: [/^\/api\//],
        skipWaiting: true
      }
    })
  ],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:4001',
        changeOrigin: true
      }
    }
  }
});

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
                name: 'CMMS Bakim Yonetim Sistemi',
                short_name: 'CMMS',
                description: 'Bakim ekipleri icin is girisi ve takip uygulamasi',
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
                globPatterns: ['**/*.{js,css,html,svg,png,ico,json}'],
                navigateFallbackDenylist: [/^\/api\//]
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

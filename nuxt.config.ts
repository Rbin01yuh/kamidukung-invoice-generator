import tailwindcss from '@tailwindcss/vite';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  app: {
    head: {
      title: 'KAMIDUKUNG Invoice — Premium SaaS Invoice Generator',
      meta: [
        { name: 'description', content: 'Kirim invoice profesional lebih cepat & otomatis. Buat, kustomisasi logo/warna, ekspor ke PDF & Word, dan kirim instan ke klien.' },
        // Open Graph / Facebook
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'KAMIDUKUNG Invoice — Premium SaaS Invoice Generator' },
        { property: 'og:description', content: 'Kirim invoice profesional lebih cepat & otomatis. Buat, kustomisasi logo/warna, ekspor ke PDF & Word, dan kirim instan ke klien.' },
        { property: 'og:image', content: '/images/logo.svg' },
        // Twitter
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'KAMIDUKUNG Invoice — Premium SaaS Invoice Generator' },
        { name: 'twitter:description', content: 'Kirim invoice profesional lebih cepat & otomatis. Buat, kustomisasi logo/warna, ekspor ke PDF & Word, dan kirim instan ke klien.' },
        { name: 'twitter:image', content: '/images/logo.svg' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/images/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap' }
      ]
    }
  },
  runtimeConfig: {
    public: {
      appUrl: process.env.NUXT_PUBLIC_APP_URL || ''
    }
  }
})

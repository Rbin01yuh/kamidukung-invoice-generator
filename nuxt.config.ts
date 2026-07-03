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
      title: 'Kaduin — Premium SaaS Invoice Generator',
      meta: [
        { name: 'description', content: 'Kirim invoice profesional lebih cepat & otomatis. Buat, kustomisasi logo/warna, ekspor ke PDF & Word, dan kirim instan ke klien.' },
        // Open Graph / Facebook
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'Kaduin — Premium SaaS Invoice Generator' },
        { property: 'og:description', content: 'Kirim invoice profesional lebih cepat & otomatis. Buat, kustomisasi logo/warna, ekspor ke PDF & Word, dan kirim instan ke klien.' },
        { property: 'og:image', content: '/images/kaduin.png' },
        // Twitter
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Kaduin — Premium SaaS Invoice Generator' },
        { name: 'twitter:description', content: 'Kirim invoice profesional lebih cepat & otomatis. Buat, kustomisasi logo/warna, ekspor ke PDF & Word, dan kirim instan ke klien.' },
        { name: 'twitter:image', content: '/images/kaduin.png' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/images/kaduin.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Lora:ital,wght@0,400..700;1,400..700&family=Montserrat:ital,wght@0,100..900;1,100..900&family=Courier+Prime:ital,wght@0,400;0,700;1,400;1,700&display=swap' }
      ]
    }
  },
  runtimeConfig: {
    public: {
      appUrl: process.env.NUXT_PUBLIC_APP_URL || ''
    }
  }
})

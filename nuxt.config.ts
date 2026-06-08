// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxthub/core', '@nuxtjs/tailwindcss', 'shadcn-nuxt', '@nuxt/eslint'],
  css: ['~/assets/css/tailwind.css'],
  runtimeConfig: {
    public: {
      api: ''
    }
  },
  shadcn: {
    prefix: '',
    componentDir: '~/components/ui'
  },
  hub: {
    db: 'postgresql'
  }
})

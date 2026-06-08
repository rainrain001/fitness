// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', 'shadcn-nuxt', '@nuxt/eslint'],
  runtimeConfig: {
    public: {
      api: ''
    }
  },
  shadcn: {
    prefix: '',
    componentDir: '~/components/ui'
  }
})

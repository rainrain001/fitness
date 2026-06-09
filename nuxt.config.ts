// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxthub/core', '@nuxtjs/tailwindcss', 'shadcn-nuxt', '@nuxt/eslint'],
  css: ['~/assets/css/tailwind.css'],
  runtimeConfig: {
    // Server-only Supabase S3 storage credentials. Sourced from .env; note the
    // existing keys use the "SUPABASE" spelling, so they're mapped explicitly here.
    supabaseS3: {
      endpoint: process.env.SUPABASE_S3_ENDPOINT ?? '',
      region: process.env.SUPABASE_S3_REGION ?? '',
      accessKeyId: process.env.SUPABASE_S3_ACCESS_ID ?? '',
      secretAccessKey: process.env.SUPABASE_S3_SECRET_KEY ?? '',
      foodPath: process.env.SUPABASE_S3_FOOD_PATH ?? ''
    },
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

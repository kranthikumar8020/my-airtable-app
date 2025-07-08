export default defineNuxtConfig({
  modules: ['@pinia/nuxt'],
  runtimeConfig: {
    AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY,
    AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID,
  },
  css: [
    '/Users/macbook/my-airtable-app/assets/scss/primevue-theme.scss',
    'primeicons/primeicons.css',
    'primeflex/primeflex.css',
  ]
})

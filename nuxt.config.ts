import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: [
    '@pinia/nuxt',
    ['@nuxtjs/google-fonts', {
      families: {
        Poppins: [400, 500, 600, 700]
      },
      display: 'swap'
    }]
  ],
  runtimeConfig: {
    AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY,
    AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID,
  },
  css: [
    '@/assets/css/main.css'
  ],
  build: {
    transpile: ['primevue']
  }
})

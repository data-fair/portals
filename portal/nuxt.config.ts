// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devServer: {
    port: 5657
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', 'nuxt-security'],
  runtimeConfig: {
    privateDirectoryUrl: 'http://simple-directory:8080',
    mongoUrl: 'mongodb://localhost:27017/data-fair-portals',
    draftUrlPattern: ''
  }
})

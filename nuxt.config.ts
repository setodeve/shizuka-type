// https://nuxt.com/docs/api/configuration/nuxt-config
const isDev = process.env.NODE_ENV !== 'production'
const baseURL =
  process.env.NUXT_APP_BASE_URL || (isDev ? '/' : '/shizuka-type/')

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  typescript: {
    strict: true,
  },
  // CSSファイルの設定
  css: ['~/assets/css/main.css'],
  // GitHub Pages用の設定
  app: {
    baseURL,
    head: {
      title: 'Shizuka Type - タイピング音量チェッカー',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
  },
  // 静的サイト生成用の設定
  nitro: {
    baseURL,
    prerender: {
      routes: ['/'],
    },
  },
  // 静的サイト生成時のCSS最適化設定
  experimental: {
    payloadExtraction: false,
  },
  ssr: true,
})

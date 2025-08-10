// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  typescript: {
    strict: true,
  },
  // CSSファイルの設定
  css: ['~/assets/css/main.css'],
  // 静的サイト生成用の設定
  nitro: {
    prerender: {
      routes: ['/'],
    },
  },
})

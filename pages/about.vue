<script setup lang="ts">
definePageMeta({
  title: 'Shizuka Type - について',
  description: 'Shizuka Typeプロジェクトについて'
})

const title = ref('Shizuka Type')
const description = ref('モダンなWebアプリケーション開発のためのプロジェクト')
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
    <!-- ヘッダー -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div class="flex items-center">
            <NuxtLink to="/" class="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
              {{ title }}
            </NuxtLink>
          </div>
          <nav class="hidden md:flex space-x-8">
            <NuxtLink to="/" class="text-gray-500 hover:text-gray-900 transition-colors">ホーム</NuxtLink>
            <NuxtLink to="/about" class="text-blue-600 font-semibold">について</NuxtLink>
          </nav>
        </div>
      </div>
    </header>

    <!-- メインコンテンツ -->
    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">プロジェクトについて</h1>
        <p class="text-xl text-gray-600">{{ description }}</p>
      </div>

      <div class="bg-white rounded-lg shadow-md p-8 mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">技術スタック</h2>
        <div class="grid md:grid-cols-2 gap-8">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">フロントエンド</h3>
            <ul class="space-y-2 text-gray-600">
              <li>• Nuxt 3 - Vue.jsベースのフルスタックフレームワーク</li>
              <li>• TypeScript - 型安全なJavaScript</li>
              <li>• Tailwind CSS - ユーティリティファーストCSS</li>
              <li>• Biome - 高速なリンター・フォーマッター</li>
            </ul>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">開発ツール</h3>
            <ul class="space-y-2 text-gray-600">
              <li>• pnpm - 高速なパッケージマネージャー</li>
              <li>• Vite - 高速なビルドツール</li>
              <li>• Vue DevTools - デバッグツール</li>
              <li>• Hot Module Replacement</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-md p-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">プロジェクトの目的</h2>
        <div class="prose max-w-none">
          <p class="text-gray-600 mb-4">
            このプロジェクトは、モダンなWebアプリケーション開発のためのベストプラクティスを実践することを目的としています。
          </p>
          <p class="text-gray-600 mb-4">
            最新の技術スタックを使用することで、高速で保守性の高いアプリケーションを構築できます。
          </p>
          <p class="text-gray-600">
            開発効率を向上させるためのツールとフレームワークを組み合わせて、最高の開発体験を提供します。
          </p>
        </div>
      </div>
    </main>

    <!-- フッター -->
    <footer class="bg-gray-800 text-white py-8 mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <p class="text-gray-300">
            © 2024 {{ title }}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* カスタムスタイルがあればここに追加 */
</style> 
<script setup lang="ts">
// Nuxt 3の自動インポート機能により、refとdefinePageMetaは自動的に利用可能
// ページのメタデータを設定
definePageMeta({
  title: 'Shizuka Type - ホーム',
  description:
    'Nuxt 3 + TypeScript + Tailwind CSS + Biome を使用したモダンなWebアプリケーション',
})

// リアクティブなデータ
const title = ref('Shizuka Type')
const subtitle = ref('モダンなWebアプリケーション')
const features = ref([
  {
    title: 'Nuxt 3',
    description: 'Vue.jsベースのフルスタックフレームワーク',
    icon: '🚀',
  },
  {
    title: 'TypeScript',
    description: '型安全なJavaScript開発',
    icon: '🛡️',
  },
  {
    title: 'Tailwind CSS',
    description: 'ユーティリティファーストCSSフレームワーク',
    icon: '🎨',
  },
  {
    title: 'Biome',
    description: '高速なJavaScript/TypeScriptリンター・フォーマッター',
    icon: '⚡',
  },
])
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- ヘッダー -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-gray-900">{{ title }}</h1>
          </div>
          <nav class="hidden md:flex space-x-8">
            <a href="#" class="text-gray-500 hover:text-gray-900 transition-colors">ホーム</a>
            <a href="#" class="text-gray-500 hover:text-gray-900 transition-colors">機能</a>
            <a href="#" class="text-gray-500 hover:text-gray-900 transition-colors">について</a>
          </nav>
        </div>
      </div>
    </header>

    <!-- メインコンテンツ -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- ヒーローセクション -->
      <div class="text-center mb-16">
        <h2 class="text-5xl font-bold text-gray-900 mb-4">
          {{ title }}
        </h2>
        <p class="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          {{ subtitle }}
        </p>
        <div class="flex justify-center space-x-4">
          <button class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
            始める
          </button>
          <button class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors">
            詳細を見る
          </button>
        </div>
      </div>

      <!-- 機能セクション -->
      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        <div
          v-for="feature in features"
          :key="feature.title"
          class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <div class="text-4xl mb-4">{{ feature.icon }}</div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">
            {{ feature.title }}
          </h3>
          <p class="text-gray-600">
            {{ feature.description }}
          </p>
        </div>
      </div>

      <!-- コード例セクション -->
      <div class="bg-white rounded-lg shadow-md p-8">
        <h3 class="text-2xl font-bold text-gray-900 mb-6">技術スタック</h3>
        <div class="grid md:grid-cols-2 gap-8">
          <div>
            <h4 class="text-lg font-semibold text-gray-900 mb-4">フロントエンド</h4>
            <ul class="space-y-2 text-gray-600">
              <li>• Nuxt 3 - Vue.jsベースのフルスタックフレームワーク</li>
              <li>• TypeScript - 型安全なJavaScript</li>
              <li>• Tailwind CSS - ユーティリティファーストCSS</li>
              <li>• Biome - 高速なリンター・フォーマッター</li>
            </ul>
          </div>
          <div>
            <h4 class="text-lg font-semibold text-gray-900 mb-4">開発ツール</h4>
            <ul class="space-y-2 text-gray-600">
              <li>• pnpm - 高速なパッケージマネージャー</li>
              <li>• Vite - 高速なビルドツール</li>
              <li>• Vue DevTools - デバッグツール</li>
              <li>• Hot Module Replacement</li>
            </ul>
          </div>
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
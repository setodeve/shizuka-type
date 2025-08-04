<script setup lang="ts">
// ヘッダーの props や状態管理
interface Props {
  showNavigation?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showNavigation: true,
})
</script>

<template>
  <header class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- アプリタイトル -->
        <div class="flex items-center">
          <NuxtLink to="/" class="flex items-center space-x-3">
            <!-- アイコン（音波のようなシンプルなSVG） -->
            <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
            </div>
            <div>
              <h1 class="text-xl font-bold text-gray-900">Shizuka Type</h1>
              <p class="text-xs text-gray-500">タイピング音量チェッカー</p>
            </div>
          </NuxtLink>
        </div>

        <!-- ナビゲーション -->
        <nav v-if="props.showNavigation" class="hidden sm:flex items-center space-x-6">
          <NuxtLink 
            to="/" 
            class="text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            測定開始
          </NuxtLink>
          <button 
            type="button"
            class="text-gray-600 hover:text-gray-900 transition-colors font-medium"
            @click="$emit('show-privacy')"
          >
            プライバシー
          </button>
          <button 
            type="button"
            class="text-gray-600 hover:text-gray-900 transition-colors font-medium"
            @click="$emit('show-guide')"
          >
            使い方
          </button>
        </nav>

        <!-- モバイル用メニューボタン（将来的に使用） -->
        <div class="sm:hidden">
          <button 
            type="button" 
            class="text-gray-600 hover:text-gray-900"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* ヘッダー専用のスタイルがあれば追加 */
</style>
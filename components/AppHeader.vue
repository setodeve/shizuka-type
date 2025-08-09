<script setup lang="ts">
import { Bars3Icon, SpeakerWaveIcon } from '@heroicons/vue/24/outline'

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
            <div class="flex flex-col">
              <h1 class="text-xl font-bold text-gray-900">Shizuka Type</h1>
              <p class="text-xs text-gray-500">タイピング音量チェッカー</p>
            </div>
          </NuxtLink>
        </div>

        <!-- ナビゲーション -->
        <nav v-if="props.showNavigation" class="hidden sm:flex items-center space-x-6">
          <NuxtLink 
            to="/" 
            class="text-gray-600 hover:text-gray-900 transition-colors text-sm font-semibold"
          >
            測定開始
          </NuxtLink>
          <button 
            type="button"
            class="text-gray-600 hover:text-gray-900 transition-colors text-sm font-semibold"
            @click="$emit('show-privacy')"
          >
            プライバシー
          </button>
          <button 
            type="button"
            class="text-gray-600 hover:text-gray-900 transition-colors text-sm font-semibold"
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
            <Bars3Icon class="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* ヘッダー専用のスタイルがあれば追加 */
</style>
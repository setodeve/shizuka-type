<script setup lang="ts">
// フッターの設定やイベント
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="bg-gray-50 border-t border-gray-200">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <!-- アプリケーション情報 -->
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Shizuka Type
          </h3>
          <p class="text-sm text-gray-600">
            タイピング音量を客観的に測定し、周囲への配慮をサポートするWebアプリケーションです。
          </p>
          <p class="text-xs text-gray-500">
            すべての音声処理はローカルで実行され、サーバーに送信されることはありません。
          </p>
        </div>

        <!-- プライバシー・利用規約 -->
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            プライバシー
          </h3>
          <ul class="space-y-2 text-sm text-gray-600">
            <li>
              <button 
                type="button"
                class="hover:text-gray-900 transition-colors"
                @click="$emit('show-privacy')"
              >
                プライバシーポリシー
              </button>
            </li>
            <li>
              <button 
                type="button"
                class="hover:text-gray-900 transition-colors"
                @click="$emit('show-terms')"
              >
                利用規約・免責事項
              </button>
            </li>
            <li>
              <button 
                type="button"
                class="hover:text-gray-900 transition-colors"
                @click="$emit('show-guide')"
              >
                使い方ガイド
              </button>
            </li>
          </ul>
        </div>

        <!-- 技術情報・サポート -->
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            サポート
          </h3>
          <ul class="space-y-2 text-sm text-gray-600">
            <li>推奨ブラウザ: Google Chrome</li>
            <li>対応デバイス: デスクトップのみ</li>
            <li>
              <span class="inline-flex items-center space-x-1">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="hover:text-gray-900 transition-colors"
                >
                  GitHub
                </a>
              </span>
            </li>
          </ul>
        </div>
      </div>

      <!-- コピーライト -->
      <div class="mt-8 pt-6 border-t border-gray-200">
        <div class="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <p class="text-xs text-gray-500">
            © {{ currentYear }} Shizuka Type. ローカル音声処理によるプライバシー重視設計。
          </p>
          <div class="flex items-center space-x-4 text-xs text-gray-500">
            <span>Nuxt 3</span>
            <span>•</span>
            <span>Web Audio API</span>
            <span>•</span>
            <span>TypeScript</span>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* フッター専用のスタイルがあれば追加 */
</style>
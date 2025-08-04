<script setup lang="ts">
import { CodeBracketIcon } from '@heroicons/vue/24/outline'

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
                <CodeBracketIcon class="w-4 h-4" />
                <a 
                  href="https://github.com/setodeve/shizuka-type" 
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
        <div class="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0">
          <p class="text-xs text-gray-500">
            © {{ currentYear }} Shizuka Type.
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* フッター専用のスタイルがあれば追加 */
</style>
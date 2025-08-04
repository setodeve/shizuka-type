<script setup lang="ts">
import { ref } from 'vue'

// モーダル表示状態管理
const showPrivacyModal = ref(false)
const showTermsModal = ref(false)
const showGuideModal = ref(false)

// イベントハンドラー
const handleShowPrivacy = () => {
  showPrivacyModal.value = true
}

const handleShowTerms = () => {
  showTermsModal.value = true
}

const handleShowGuide = () => {
  showGuideModal.value = true
}

const closeAllModals = () => {
  showPrivacyModal.value = false
  showTermsModal.value = false
  showGuideModal.value = false
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col">
    <!-- ヘッダー -->
    <AppHeader 
      @show-privacy="handleShowPrivacy"
      @show-guide="handleShowGuide"
    />
    
    <!-- モバイル警告 -->
    <MobileWarning />
    
    <!-- メインコンテンツ -->
    <main class="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>
    
    <!-- フッター -->
    <AppFooter 
      @show-privacy="handleShowPrivacy"
      @show-terms="handleShowTerms"
      @show-guide="handleShowGuide"
    />

    <!-- モーダル群 -->
    <!-- プライバシーポリシーモーダル -->
    <Teleport to="body">
      <div 
        v-if="showPrivacyModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        @click.self="closeAllModals"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-2xl max-h-[80vh] overflow-y-auto p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold text-gray-900">プライバシーポリシー</h2>
            <button 
              type="button"
              class="text-gray-400 hover:text-gray-600"
              @click="closeAllModals"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          <div class="space-y-4 text-sm text-gray-600">
            <div>
              <h3 class="font-semibold text-gray-900 mb-2">データ収集について</h3>
              <p>Shizuka Type は、ユーザーのプライバシーを最重要視しています。</p>
            </div>
            
            <div>
              <h3 class="font-semibold text-gray-900 mb-2">音声データの取り扱い</h3>
              <ul class="space-y-1 list-disc list-inside">
                <li>すべての音声処理はブラウザ内でローカルに実行されます</li>
                <li>音声データがサーバーに送信されることは一切ありません</li>
                <li>測定終了後、音声データは即座に破棄されます</li>
                <li>測定結果のみが一時的にブラウザメモリに保持されます</li>
              </ul>
            </div>
            
            <div>
              <h3 class="font-semibold text-gray-900 mb-2">クッキーの使用</h3>
              <p>本アプリケーションでは、必要最小限の技術的クッキーのみを使用します。</p>
            </div>
            
            <div>
              <h3 class="font-semibold text-gray-900 mb-2">第三者との情報共有</h3>
              <p>ユーザーの個人情報や測定データを第三者と共有することはありません。</p>
            </div>
          </div>
          
          <div class="mt-6 flex justify-end">
            <button 
              type="button"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              @click="closeAllModals"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 利用規約・免責事項モーダル -->
    <Teleport to="body">
      <div 
        v-if="showTermsModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        @click.self="closeAllModals"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-2xl max-h-[80vh] overflow-y-auto p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold text-gray-900">利用規約・免責事項</h2>
            <button 
              type="button"
              class="text-gray-400 hover:text-gray-600"
              @click="closeAllModals"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          <div class="space-y-4 text-sm text-gray-600">
            <div>
              <h3 class="font-semibold text-gray-900 mb-2">免責事項</h3>
              <ul class="space-y-1 list-disc list-inside">
                <li>測定結果は参考値であり、絶対的な騒音レベルを保証するものではありません</li>
                <li>デバイスの性能や環境条件により測定精度が変動する場合があります</li>
                <li>本アプリの使用による損害について、開発者は責任を負いません</li>
              </ul>
            </div>
            
            <div>
              <h3 class="font-semibold text-gray-900 mb-2">推奨使用環境</h3>
              <ul class="space-y-1 list-disc list-inside">
                <li>Google Chrome（最新版）</li>
                <li>マイクアクセス権限が必要です</li>
                <li>静かな環境での測定を推奨します</li>
              </ul>
            </div>
            
            <div>
              <h3 class="font-semibold text-gray-900 mb-2">利用上の注意</h3>
              <ul class="space-y-1 list-disc list-inside">
                <li>測定中は通常通りのタイピングを行ってください</li>
                <li>他の音（会話、音楽など）は測定精度に影響します</li>
                <li>マイクとキーボードの距離は50cm程度を推奨します</li>
              </ul>
            </div>
          </div>
          
          <div class="mt-6 flex justify-end">
            <button 
              type="button"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              @click="closeAllModals"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 使い方ガイドモーダル -->
    <Teleport to="body">
      <div 
        v-if="showGuideModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        @click.self="closeAllModals"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-2xl max-h-[80vh] overflow-y-auto p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold text-gray-900">使い方ガイド</h2>
            <button 
              type="button"
              class="text-gray-400 hover:text-gray-600"
              @click="closeAllModals"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          <div class="space-y-4 text-sm text-gray-600">
            <div>
              <h3 class="font-semibold text-gray-900 mb-2">測定の流れ</h3>
              <ol class="space-y-2 list-decimal list-inside">
                <li>マイクアクセス権限を許可</li>
                <li>環境音測定（5秒間）で基準値を設定</li>
                <li>タイピング測定（30秒間）で実際の音量を測定</li>
                <li>結果表示：「静か」「普通」「うるさい」の3段階評価</li>
              </ol>
            </div>
            
            <div>
              <h3 class="font-semibold text-gray-900 mb-2">事前準備チェックリスト</h3>
              <ul class="space-y-1">
                <li class="flex items-center space-x-2">
                  <input type="checkbox" class="rounded" disabled>
                  <span>周囲が静か（40dB未満推奨）</span>
                </li>
                <li class="flex items-center space-x-2">
                  <input type="checkbox" class="rounded" disabled>
                  <span>マイクとキーボードの距離が50cm程度</span>
                </li>
                <li class="flex items-center space-x-2">
                  <input type="checkbox" class="rounded" disabled>
                  <span>マイク音量が50%程度に設定</span>
                </li>
                <li class="flex items-center space-x-2">
                  <input type="checkbox" class="rounded" disabled>
                  <span>測定中は会話などを控える</span>
                </li>
                <li class="flex items-center space-x-2">
                  <input type="checkbox" class="rounded" disabled>
                  <span>普段通りのタイピングを心がける</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 class="font-semibold text-gray-900 mb-2">判定基準</h3>
              <div class="space-y-2">
                <div class="flex items-center space-x-3">
                  <div class="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span><strong>静か（0-5回）:</strong> 図書館レベルの静かさ</span>
                </div>
                <div class="flex items-center space-x-3">
                  <div class="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <span><strong>普通（6-15回）:</strong> 一般的なオフィスレベル</span>
                </div>
                <div class="flex items-center space-x-3">
                  <div class="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span><strong>うるさい（16回以上）:</strong> 道路・工事現場レベル</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="mt-6 flex justify-end">
            <button 
              type="button"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              @click="closeAllModals"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* デフォルトレイアウト専用のスタイルがあれば追加 */
</style>
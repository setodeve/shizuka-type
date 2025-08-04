<script setup lang="ts">
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { onMounted, ref } from 'vue'

// モバイルデバイス検出
const isMobile = ref(false)
const showWarning = ref(false)

const checkMobileDevice = () => {
  // ユーザーエージェントによるモバイル検出
  const userAgent = navigator.userAgent.toLowerCase()
  const mobileKeywords = [
    'mobile',
    'android',
    'iphone',
    'ipad',
    'ipod',
    'blackberry',
    'windows phone',
  ]
  const isMobileUA = mobileKeywords.some((keyword) =>
    userAgent.includes(keyword),
  )

  // 画面サイズによる検出（768px未満をモバイルとみなす）
  const isMobileScreen = window.innerWidth < 768

  // タッチデバイス検出
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0

  return isMobileUA || (isMobileScreen && isTouchDevice)
}

onMounted(() => {
  isMobile.value = checkMobileDevice()
  showWarning.value = isMobile.value

  // リサイズイベントで再チェック
  const handleResize = () => {
    const wasMobile = isMobile.value
    isMobile.value = checkMobileDevice()

    // デスクトップ→モバイルになった場合のみ警告を表示
    if (!wasMobile && isMobile.value) {
      showWarning.value = true
    }
  }

  window.addEventListener('resize', handleResize)

  // クリーンアップ
  return () => {
    window.removeEventListener('resize', handleResize)
  }
})

const closeWarning = () => {
  showWarning.value = false
}
</script>

<template>
  <!-- モバイル警告モーダル -->
  <Teleport to="body">
    <div 
      v-if="showWarning" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click.self="closeWarning"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <!-- 閉じるボタン -->
        <button 
          type="button"
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          @click="closeWarning"
        >
          <XMarkIcon class="w-6 h-6" />
        </button>

        <!-- 警告アイコン -->
        <div class="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full">
          <ExclamationTriangleIcon class="w-8 h-8 text-orange-600" />
        </div>

        <!-- メッセージ -->
        <div class="text-center space-y-4">
          <h2 class="text-xl font-bold text-gray-900">
            モバイルデバイスは対応していません
          </h2>
          
          <div class="space-y-3 text-sm text-gray-600">
            <p>
              申し訳ございませんが、Shizuka Type はモバイルデバイス（スマートフォン・タブレット）での利用には対応しておりません。
            </p>
            
            <div class="bg-blue-50 p-3 rounded-lg text-left">
              <h3 class="font-semibold text-blue-900 mb-2">推奨環境:</h3>
              <ul class="space-y-1 text-blue-800">
                <li>• デスクトップPC または ノートPC</li>
                <li>• Google Chrome ブラウザ</li>
                <li>• 物理キーボード</li>
                <li>• マイクアクセス権限</li>
              </ul>
            </div>
            
            <p class="text-xs text-gray-500">
              タイピング音量の正確な測定には、物理キーボードと高精度なマイク入力が必要です。
            </p>
          </div>

          <!-- アクションボタン -->
          <div class="flex flex-col space-y-3 pt-4">
            <button 
              type="button"
              class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              @click="closeWarning"
            >
              理解しました
            </button>
            
            <p class="text-xs text-gray-500">
              デスクトップデバイスでのアクセスをお待ちしています
            </p>
          </div>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- 小さなバナー表示（モーダルを閉じた後） -->
  <div 
    v-if="isMobile && !showWarning" 
    class="bg-orange-100 border-l-4 border-orange-500 p-3 mb-4"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center">
        <ExclamationTriangleIcon class="w-5 h-5 text-orange-500 mr-2" />
        <span class="text-sm text-orange-800">
          モバイルデバイスは非対応です
        </span>
      </div>
      <button 
        type="button"
        class="text-orange-600 hover:text-orange-800 text-sm underline"
        @click="showWarning = true"
      >
        詳細
      </button>
    </div>
  </div>
</template>

<style scoped>
/* モバイル警告専用のスタイルがあれば追加 */
</style>
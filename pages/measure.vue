<script setup lang="ts">
import { useMeasurement } from '~/composables/useMeasurement'

definePageMeta({
  layout: 'default',
})

const {
  measurementState,
  measurementResult,
  audioState,
  phaseMessage,
  isActive,
  startMeasurement,
  cancelMeasurement,
  resetMeasurement,
} = useMeasurement()

// 測定開始ハンドラー
const handleStartMeasurement = async () => {
  const success = await startMeasurement()
  if (!success) {
    console.error('測定開始に失敗しました')
  }
}

// 測定完了時の結果画面への遷移
watch(
  () => measurementState.phase,
  (newPhase) => {
    if (newPhase === 'completed' && measurementResult) {
      // 結果画面に遷移（結果データをクエリパラメータやストアで渡す）
      setTimeout(() => {
        navigateTo('/result')
      }, 2000) // 2秒後に自動遷移
    }
  },
)

// ページ離脱時のクリーンアップ
onUnmounted(() => {
  if (isActive.value) {
    cancelMeasurement()
  }
})
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-8">
    <!-- ページタイトル -->
    <div class="text-center space-y-4">
      <h1 class="text-3xl font-bold text-gray-900">タイピング音量測定</h1>
      <p class="text-gray-600">
        まずマイクアクセスを許可し、静かな環境で測定を開始してください
      </p>
    </div>

    <!-- エラー表示 -->
    <div v-if="audioState.error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex items-start space-x-3">
        <svg class="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L1 21h22L12 2zm0 3.9L19.5 19h-15L12 5.9zm-1 8.1v2h2v-2h-2zm0-6v4h2V8h-2z"/>
        </svg>
        <div>
          <h3 class="font-semibold text-red-900">エラーが発生しました</h3>
          <p class="text-sm text-red-800 mt-1">{{ audioState.error }}</p>
        </div>
      </div>
    </div>

    <!-- 測定状態表示 -->
    <div class="bg-white rounded-lg shadow-sm border p-6">
      <!-- フェーズインジケーター -->
      <div class="mb-6">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-gray-900">測定状況</span>
          <span class="text-sm text-gray-500">
            {{ measurementState.phase === 'baseline' ? '環境音測定中' : 
               measurementState.phase === 'typing' ? 'タイピング測定中' : 
               measurementState.phase === 'completed' ? '完了' : '待機中' }}
          </span>
        </div>
        
        <!-- プログレスバー -->
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div 
            class="h-2 rounded-full transition-all duration-300"
            :class="{
              'bg-blue-600': measurementState.phase === 'baseline',
              'bg-green-600': measurementState.phase === 'typing',
              'bg-gray-400': !isActive
            }"
            :style="{ width: `${measurementState.progress}%` }"
          ></div>
        </div>
      </div>

      <!-- メッセージとタイマー -->
      <div class="text-center space-y-4">
        <p class="text-lg text-gray-900">{{ phaseMessage }}</p>
        
        <!-- カウントダウンタイマー -->
        <div v-if="isActive" class="space-y-2">
          <div class="text-4xl font-bold text-blue-600">
            {{ measurementState.timeRemaining }}
          </div>
          <p class="text-sm text-gray-500">秒</p>
        </div>

        <!-- リアルタイム音量レベル -->
        <div v-if="audioState.isAnalyzing" class="space-y-3">
          <div class="text-sm text-gray-600">現在の音量レベル</div>
          <div class="relative">
            <!-- 音量バー -->
            <div class="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
              <div 
                class="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 transition-all duration-100"
                :style="{ width: `${Math.max(0, Math.min(100, (audioState.currentLevel + 60) * 100 / 60))}%` }"
              ></div>
            </div>
            <!-- 音量値表示 -->
            <div class="text-xs text-gray-500 mt-1">
              {{ Math.round(audioState.currentLevel) }} dB
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- コントロールボタン -->
    <div class="flex justify-center space-x-4">
      <!-- 測定開始ボタン -->
      <button
        v-if="measurementState.phase === 'idle'"
        type="button"
        class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="audioState.isSupported"
        @click="handleStartMeasurement"
      >
        🎤 測定開始
      </button>

      <!-- 測定中止ボタン -->
      <button
        v-if="isActive"
        type="button"
        class="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
        @click="cancelMeasurement"
      >
        測定中止
      </button>

      <!-- リセットボタン -->
      <button
        v-if="measurementState.phase === 'completed' || measurementState.phase === 'error'"
        type="button"
        class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
        @click="resetMeasurement"
      >
        再測定
      </button>

      <!-- ホームに戻るボタン -->
      <NuxtLink
        to="/"
        class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-8 rounded-lg transition-colors"
      >
        ホームに戻る
      </NuxtLink>
    </div>

    <!-- 測定の流れ説明 -->
    <div v-if="measurementState.phase === 'idle'" class="bg-blue-50 rounded-lg p-6">
      <h3 class="font-semibold text-blue-900 mb-3">測定の流れ</h3>
      <ol class="space-y-2 text-sm text-blue-800">
        <li class="flex items-start space-x-2">
          <span class="font-semibold">1.</span>
          <span>「測定開始」をクリックしてマイクアクセスを許可</span>
        </li>
        <li class="flex items-start space-x-2">
          <span class="font-semibold">2.</span>
          <span>5秒間静かにして環境音を測定</span>
        </li>
        <li class="flex items-start space-x-2">
          <span class="font-semibold">3.</span>
          <span>30秒間普段通りにタイピング</span>
        </li>
        <li class="flex items-start space-x-2">
          <span class="font-semibold">4.</span>
          <span>結果を確認（自動で結果画面に移動）</span>
        </li>
      </ol>
    </div>

    <!-- ブラウザ非対応メッセージ -->
    <div v-if="!audioState.isSupported" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div class="flex items-start space-x-3">
        <svg class="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L1 21h22L12 2zm0 3.9L19.5 19h-15L12 5.9zm-1 8.1v2h2v-2h-2zm0-6v4h2V8h-2z"/>
        </svg>
        <div>
          <h3 class="font-semibold text-yellow-900">ブラウザが対応していません</h3>
          <p class="text-sm text-yellow-800 mt-1">
            このブラウザはWeb Audio APIに対応していません。Google Chrome の最新版をご利用ください。
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 測定画面専用のスタイル */
</style>
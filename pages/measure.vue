<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue'
import { useEnvironmentDetection } from '~/composables/useEnvironmentDetection'
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
  currentSampleText,
  typedText,
  isTypingActive,
  sampleCharacters,
  currentCharacterIndex,
  currentRomajiPosition,
  hasInputError,
} = useMeasurement()

// 環境検出コンポーザブル
const {
  environmentState,
  getRecommendationText,
  getImprovementAdvice,
  isAvailable: isEnvironmentDetectionAvailable,
  isSuitableForMeasurement,
  startEnvironmentDetection,
  resetDetection,
} = useEnvironmentDetection()

// 設定ガイドモーダルの表示状態
const showSetupGuide = ref(false)

// 設定ガイドを表示
const openSetupGuide = () => {
  showSetupGuide.value = true
}

// 設定ガイドを閉じる
const closeSetupGuide = () => {
  showSetupGuide.value = false
}

// 環境検出開始
const handleStartEnvironmentDetection = async () => {
  const success = await startEnvironmentDetection()
  if (!success) {
    console.error('環境検出に失敗しました')
  }
}

// 環境検出リセット
const handleResetEnvironmentDetection = () => {
  resetDetection()
}

// 測定開始ハンドラー
const handleStartMeasurement = async () => {
  const success = await startMeasurement()
  if (!success) {
    console.error('測定開始に失敗しました')
  }
}

// 設定ガイドから測定開始
const handleStartFromGuide = async () => {
  await handleStartMeasurement()
}

// 測定完了時の結果画面への遷移
watch(
  () => measurementState.phase,
  (newPhase) => {
    if (newPhase === 'completed' && measurementResult) {
      // 結果データをsessionStorageに保存
      if (process.client) {
        sessionStorage.setItem(
          'measurementResult',
          JSON.stringify(measurementResult.value),
        )
      }

      // 結果画面に遷移（即座に遷移）
      setTimeout(() => {
        navigateTo('/result')
      }, 100) // 0.1秒後に遷移（大幅短縮）
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
    <ErrorHandler
      v-if="audioState.error"
      :error="audioState.error"
      type="error"
      @retry="handleStartMeasurement"
      @dismiss="() => {}"
      @help="() => {}"
    />

    <!-- 環境検出エラー表示 -->
    <ErrorHandler
      v-if="environmentState.error"
      :error="environmentState.error"
      type="error"
      @retry="handleStartEnvironmentDetection"
      @dismiss="handleResetEnvironmentDetection"
      @help="() => {}"
    />

    <!-- 環境検出結果表示 -->
    <div 
      v-if="isEnvironmentDetectionAvailable && measurementState.phase === 'idle'"
      class="bg-white rounded-lg shadow-sm border p-6"
    >
      <h3 class="text-lg font-semibold text-gray-900 mb-4">🔈 環境音チェック</h3>
      
      <!-- 環境検出中 -->
      <div v-if="environmentState.isDetecting" class="space-y-4">
        <div class="text-center">
          <div class="text-blue-600 mb-2">
            <svg class="w-8 h-8 animate-spin mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <p class="text-gray-700">環境音を分析しています...</p>
          <p class="text-sm text-gray-500 mt-1">5秒間静かにお待ちください</p>
        </div>
        
        <!-- プログレスバー -->
        <div class="w-full bg-gray-200 rounded-full h-3">
          <div 
            class="h-3 bg-blue-600 rounded-full transition-all duration-300"
            :style="{ width: `${environmentState.progress}%` }"
          ></div>
        </div>
        <div class="text-center text-sm text-gray-500">
          {{ environmentState.progress }}% 完了
        </div>
      </div>

      <!-- 環境検出結果 -->
      <div v-else-if="environmentState.hasDetected && environmentState.status" class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <span class="text-lg">{{ getRecommendationText }}</span>
            <div class="text-sm text-gray-600">
              平均音量: {{ Math.round(environmentState.status.averageLevel) }} dB
            </div>
          </div>
          <button
            type="button"
            class="text-blue-600 hover:text-blue-800 text-sm underline transition-colors"
            @click="handleResetEnvironmentDetection"
          >
            再検出
          </button>
        </div>

        <div 
          class="p-4 rounded-lg border"
          :class="{
            'bg-green-50 border-green-200': environmentState.status.recommendation === 'excellent',
            'bg-blue-50 border-blue-200': environmentState.status.recommendation === 'good',
            'bg-yellow-50 border-yellow-200': environmentState.status.recommendation === 'caution',
            'bg-red-50 border-red-200': environmentState.status.recommendation === 'poor'
          }"
        >
          <p 
            class="font-medium mb-2"
            :class="{
              'text-green-800': environmentState.status.recommendation === 'excellent',
              'text-blue-800': environmentState.status.recommendation === 'good',
              'text-yellow-800': environmentState.status.recommendation === 'caution',
              'text-red-800': environmentState.status.recommendation === 'poor'
            }"
          >
            {{ environmentState.status.message }}
          </p>
          
          <!-- 改善アドバイス -->
          <div v-if="getImprovementAdvice.length > 0" class="mt-3">
            <p 
              class="text-sm font-medium mb-2"
              :class="{
                'text-green-700': environmentState.status.recommendation === 'excellent',
                'text-blue-700': environmentState.status.recommendation === 'good',
                'text-yellow-700': environmentState.status.recommendation === 'caution',
                'text-red-700': environmentState.status.recommendation === 'poor'
              }"
            >
              {{ environmentState.status.recommendation === 'excellent' || environmentState.status.recommendation === 'good' ? '✅ 推奨事項:' : '💡 改善アドバイス:' }}
            </p>
            <ul 
              class="text-sm space-y-1"
              :class="{
                'text-green-600': environmentState.status.recommendation === 'excellent',
                'text-blue-600': environmentState.status.recommendation === 'good',
                'text-yellow-600': environmentState.status.recommendation === 'caution',
                'text-red-600': environmentState.status.recommendation === 'poor'
              }"
            >
              <li v-for="advice in getImprovementAdvice" :key="advice" class="flex items-start space-x-1">
                <span>•</span>
                <span>{{ advice }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 環境検出開始ボタン -->
      <div v-else class="text-center space-y-3">
        <p class="text-gray-600">
          正確な測定のため、まず環境の静音性をチェックします
        </p>
        <button
          type="button"
          class="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          @click="handleStartEnvironmentDetection"
        >
          チェック開始
        </button>
        <p class="text-xs text-gray-500">
          5秒間の環境音測定を行います
        </p>
      </div>
    </div>

    <!-- 測定状態表示 -->
    <div class="bg-white rounded-lg shadow-sm border p-6">
      <!-- フェーズインジケーター -->
      <div class="mb-6">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-gray-900">測定状況</span>
          <span class="text-sm text-gray-500">
            {{ 
                measurementState.phase === 'baseline' ? '環境音測定中' : 
                measurementState.phase === 'typing' ? 'タイピング測定中' : 
                measurementState.phase === 'processing' ? '結果分析中' :
                measurementState.phase === 'completed' ? '完了' : '待機中' 
            }}
          </span>
        </div>
        
        <!-- プログレスバー -->
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div 
            class="h-2 rounded-full transition-all duration-300"
            :class="{
              'bg-blue-600': measurementState.phase === 'baseline',
              'bg-green-600': measurementState.phase === 'typing',
              'bg-purple-600': measurementState.phase === 'processing',
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
        <div v-if="isActive && measurementState.phase !== 'processing'" class="space-y-2">
          <div class="text-4xl font-bold text-blue-600">
            {{ measurementState.timeRemaining }}
          </div>
          <p class="text-sm text-gray-500">秒</p>
        </div>

        <!-- 処理中ローディング表示 -->
        <div v-if="measurementState.phase === 'processing'" class="space-y-4">
          <div class="flex items-center justify-center">
            <div class="animate-ping h-10 w-10 border-2 bg-purple-600 rounded-full"></div>
          </div>
          <div class="text-center space-y-2">
            <p class="text-lg font-semibold text-purple-600">分析中</p>
            <div class="w-full bg-gray-200 rounded-full h-2 max-w-xs mx-auto">
              <div 
                class="h-2 bg-purple-600 rounded-full transition-all duration-1000 ease-out"
                :style="{ width: `${measurementState.progress}%` }"
              ></div>
            </div>
            <p class="text-sm text-gray-500">{{ measurementState.progress }}% 完了</p>
          </div>
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

    <!-- タイピング用サンプルテキスト表示 -->
    <TypingTextDisplay
      :sample-characters="sampleCharacters as any"
      :typed-text="typedText"
      :current-character-index="currentCharacterIndex"
      :current-romaji-position="currentRomajiPosition"
      :has-input-error="hasInputError"
      :is-visible="measurementState.phase === 'typing'"
    />

    <!-- コントロールボタン -->
    <div class="flex flex-col items-center space-y-4">
      <!-- メインボタン群 -->
      <div class="flex justify-center space-x-4">
        <!-- 測定開始ボタン -->
        <button
          v-if="measurementState.phase === 'idle'"
          type="button"
          class="font-bold py-3 px-8 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :class="{
            'bg-blue-600 hover:bg-blue-700 text-white': !environmentState.hasDetected || isSuitableForMeasurement,
            'bg-yellow-600 hover:bg-yellow-700 text-white': environmentState.hasDetected && !isSuitableForMeasurement && environmentState.status?.recommendation === 'caution',
            'bg-red-600 hover:bg-red-700 text-white': environmentState.hasDetected && !isSuitableForMeasurement && environmentState.status?.recommendation === 'poor'
          }"
          :disabled="!audioState.isSupported"
          @click="handleStartMeasurement"
          :title="environmentState.hasDetected && !isSuitableForMeasurement ? '環境が騒がしいですが、測定を開始できます' : ''"
        >
          <span v-if="!environmentState.hasDetected">🎤 測定開始</span>
          <span v-else-if="isSuitableForMeasurement">✅ 測定開始</span>
          <span v-else-if="environmentState.status?.recommendation === 'caution'">⚠️ 注意して測定開始</span>
          <span v-else>⚠️ 慎重に測定開始</span>
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

      <!-- 設定ガイドボタン -->
      <div v-if="measurementState.phase === 'idle'" class="text-center">
        <button
          type="button"
          class="text-blue-600 hover:text-blue-800 text-sm underline transition-colors"
          @click="openSetupGuide"
        >
          📋 詳細な設定ガイドを確認する
        </button>
      </div>
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
          <span>3秒間静かにして環境音を測定</span>
        </li>
        <li class="flex items-start space-x-2">
          <span class="font-semibold">3.</span>
          <span>15秒間サンプル文章を参考にタイピング</span>
        </li>
        <li class="flex items-start space-x-2">
          <span class="font-semibold">4.</span>
          <span>結果を確認（自動で結果画面に移動）</span>
        </li>
      </ol>
    </div>

    <!-- ブラウザ非対応メッセージ -->
    <ErrorHandler
      v-if="!audioState.isSupported"
      error="ブラウザがWeb Audio APIに対応していません"
      type="warning"
      @retry="() => {}"
      @dismiss="() => {}"
      @help="() => {}"
    />

    <!-- 設定ガイドモーダル -->
    <SetupGuideModal
      :is-open="showSetupGuide"
      :environment-status="environmentState.status"
      :has-environment-detection="isEnvironmentDetectionAvailable"
      :is-detecting="environmentState.isDetecting"
      :detection-progress="environmentState.progress"
      @close="closeSetupGuide"
      @start-measurement="handleStartFromGuide"
      @start-environment-detection="handleStartEnvironmentDetection"
    />
  </div>
</template>

<style scoped>
/* 測定画面専用のスタイル */
</style>
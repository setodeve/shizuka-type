<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface Props {
  isOpen: boolean
  environmentStatus?: {
    isQuiet: boolean
    averageLevel: number
    recommendation: 'excellent' | 'good' | 'caution' | 'poor'
    message: string
  } | null
  hasEnvironmentDetection?: boolean
  isDetecting?: boolean
  detectionProgress?: number
}

interface Emits {
  (e: 'close'): void
  (e: 'start-measurement'): void
  (e: 'start-environment-detection'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// チェックリスト項目の状態管理
const checklistItems = ref([
  {
    id: 'environment',
    text: '周囲が静か（40dB未満推奨）',
    checked: false,
    automated: true,
  },
  {
    id: 'distance',
    text: 'マイクとキーボードの距離が50cm程度',
    checked: false,
    automated: false,
  },
  {
    id: 'volume',
    text: 'マイク音量が50%程度に設定',
    checked: false,
    automated: false,
  },
  { id: 'quiet', text: '測定中は会話しない', checked: false, automated: false },
  {
    id: 'typing',
    text: '普段通りのタイピングを心がける',
    checked: false,
    automated: false,
  },
])

// 環境検出結果に基づく自動チェック
watch(
  () => props.environmentStatus,
  (status) => {
    const envItem = checklistItems.value.find(
      (item) => item.id === 'environment',
    )
    if (envItem && status) {
      envItem.checked = status.isQuiet
    }
  },
  { immediate: true },
)

// 全項目がチェックされているかどうか
const allChecked = computed(() => {
  return checklistItems.value.every((item) => item.checked)
})

// OSの判定
const detectedOS = computed(() => {
  const userAgent = navigator.userAgent.toLowerCase()
  if (userAgent.includes('mac')) return 'mac'
  if (userAgent.includes('win')) return 'windows'
  if (userAgent.includes('linux')) return 'linux'
  return 'unknown'
})

// OSごとのマイク設定手順
const microphoneSettings = computed(() => {
  switch (detectedOS.value) {
    case 'mac':
      return {
        title: 'macOS でのマイク設定',
        steps: [
          'システム設定 → プライバシーとセキュリティ → マイク',
          'Chromeのマイクアクセスを許可',
          'システム設定 → サウンド → 入力',
          '入力音量を50%程度に調整',
        ],
      }
    case 'windows':
      return {
        title: 'Windows でのマイク設定',
        steps: [
          '設定 → プライバシー → マイク',
          'デスクトップアプリがマイクにアクセスできるようにする',
          '設定 → システム → サウンド → 入力',
          'マイクレベルを50%程度に調整',
        ],
      }
    default:
      return {
        title: 'マイク設定の確認',
        steps: [
          'ブラウザでマイクアクセスを許可',
          'OSの音声設定でマイク音量を調整',
          'マイク音量は50%程度を推奨',
        ],
      }
  }
})

// チェックリスト項目の切り替え
const toggleCheck = (id: string) => {
  const item = checklistItems.value.find((item) => item.id === id)
  if (item) {
    item.checked = !item.checked
  }
}

// 測定開始
const handleStartMeasurement = () => {
  if (allChecked.value) {
    emit('start-measurement')
    emit('close')
  }
}
</script>

<template>
  <Teleport to="body">
    <div 
      v-if="isOpen"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click.self="$emit('close')"
    >
      <div class="bg-white rounded-lg shadow-2xl max-w-4xl max-h-[90vh] overflow-y-auto w-full">
        <!-- ヘッダー -->
        <div class="bg-blue-600 text-white p-6 rounded-t-lg">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-2xl font-bold">📋 測定前設定ガイド</h2>
              <p class="text-blue-100 mt-1">正確な測定のための事前準備を確認してください</p>
            </div>
            <button 
              type="button"
              class="text-blue-200 hover:text-white transition-colors"
              @click="$emit('close')"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="p-6 space-y-8">
          <!-- 環境検出セクション -->
          <section v-if="props.hasEnvironmentDetection">
            <h3 class="text-xl font-semibold text-gray-900 mb-4">🌍 0. 自動環境検出</h3>
            
            <!-- 環境検出結果がない場合または検出中 -->
            <div v-if="!props.environmentStatus || props.isDetecting" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <!-- 検出中 -->
              <div v-if="props.isDetecting" class="space-y-3">
                <div class="flex items-center space-x-3">
                  <svg class="w-6 h-6 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span class="font-medium text-blue-800">環境検出中...</span>
                </div>
                <p class="text-sm text-blue-700">
                  5秒間静かにお待ちください
                </p>
                <div class="w-full bg-blue-200 rounded-full h-3">
                  <div 
                    class="h-3 bg-blue-600 rounded-full transition-all duration-300"
                    :style="{ width: `${props.detectionProgress || 0}%` }"
                  ></div>
                </div>
                <div class="text-sm text-blue-600 text-center">
                  {{ props.detectionProgress || 0 }}% 完了
                </div>
              </div>
              
              <!-- 未検出 -->
              <div v-else>
                <div class="flex items-center space-x-3 mb-3">
                  <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L1 21h22L12 2zm0 3.9L19.5 19h-15L12 5.9zm-1 8.1v2h2v-2h-2zm0-6v4h2V8h-2z"/>
                  </svg>
                  <span class="font-medium text-blue-800">環境検出を実行してください</span>
                </div>
                <p class="text-sm text-blue-700 mb-4">
                  正確な測定のため、まず環境の静音性を自動でチェックします。
                </p>
                <button
                  type="button"
                  class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  @click="emit('start-environment-detection')"
                >
                  🌍 環境検出開始
                </button>
              </div>
            </div>

            <!-- 環境検出結果がある場合 -->
            <div v-else class="space-y-3">
              <div 
                class="p-4 rounded-lg border"
                :class="{
                  'bg-green-50 border-green-200': props.environmentStatus.recommendation === 'excellent',
                  'bg-blue-50 border-blue-200': props.environmentStatus.recommendation === 'good',
                  'bg-yellow-50 border-yellow-200': props.environmentStatus.recommendation === 'caution',
                  'bg-red-50 border-red-200': props.environmentStatus.recommendation === 'poor'
                }"
              >
                <div class="flex items-center justify-between mb-2">
                  <span 
                    class="font-medium"
                    :class="{
                      'text-green-800': props.environmentStatus.recommendation === 'excellent',
                      'text-blue-800': props.environmentStatus.recommendation === 'good',
                      'text-yellow-800': props.environmentStatus.recommendation === 'caution',
                      'text-red-800': props.environmentStatus.recommendation === 'poor'
                    }"
                  >
                    {{ 
                      props.environmentStatus.recommendation === 'excellent' ? '🟢 最適な環境' :
                      props.environmentStatus.recommendation === 'good' ? '🟡 良好な環境' :
                      props.environmentStatus.recommendation === 'caution' ? '🟠 注意が必要' : '🔴 測定困難'
                    }}
                  </span>
                  <span class="text-sm text-gray-600">
                    {{ Math.round(props.environmentStatus.averageLevel) }} dB
                  </span>
                </div>
                
                <p 
                  class="text-sm"
                  :class="{
                    'text-green-700': props.environmentStatus.recommendation === 'excellent',
                    'text-blue-700': props.environmentStatus.recommendation === 'good',
                    'text-yellow-700': props.environmentStatus.recommendation === 'caution',
                    'text-red-700': props.environmentStatus.recommendation === 'poor'
                  }"
                >
                  {{ props.environmentStatus.message }}
                </p>

                <!-- 改善アドバイス（騒がしい環境の場合） -->
                <div v-if="!props.environmentStatus.isQuiet" class="mt-3 p-3 bg-white bg-opacity-50 rounded border border-opacity-30 border-gray-400">
                  <p class="text-sm font-medium text-gray-700 mb-2">💡 改善方法:</p>
                  <ul class="text-xs text-gray-600 space-y-1">
                    <li v-if="props.environmentStatus.recommendation === 'caution'">
                      • 窓を閉めて外音を遮断してください
                    </li>
                    <li v-if="props.environmentStatus.recommendation === 'caution'">
                      • エアコンやファンの音量を下げてください
                    </li>
                    <li v-if="props.environmentStatus.recommendation === 'poor'">
                      • より静かな部屋に移動してください
                    </li>
                    <li v-if="props.environmentStatus.recommendation === 'poor'">
                      • 周囲の機器の電源を切ってください
                    </li>
                  </ul>
                </div>
              </div>

              <button
                type="button"
                class="text-blue-600 hover:text-blue-800 text-sm underline transition-colors"
                @click="emit('start-environment-detection')"
              >
                🔄 再検出する
              </button>
            </div>
          </section>

          <!-- マイク距離設定 -->
          <section>
            <h3 class="text-xl font-semibold text-gray-900 mb-4">📏 1. マイク距離の設定</h3>
            <div class="grid md:grid-cols-2 gap-6">
              <div class="space-y-3">
                <p class="text-gray-700">
                  マイクとキーボードの距離は <strong>約50cm</strong> に設定してください。
                </p>
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div class="flex items-center space-x-2 mb-2">
                    <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13 9h-2v2H9v2h2v2h2v-2h2v-2h-2V9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                    </svg>
                    <span class="font-medium text-blue-800">参考: A4用紙縦置きサイズ</span>
                  </div>
                  <p class="text-sm text-blue-700">
                    A4用紙を縦置きした長さ（約30cm）より少し離れた距離が目安です
                  </p>
                </div>
              </div>
              
              <div class="bg-gray-50 rounded-lg p-4 text-center">
                <div class="text-6xl mb-2">📱💻</div>
                <p class="text-sm text-gray-600">
                  マイクとキーボードの<br>適切な配置イメージ
                </p>
              </div>
            </div>
          </section>

          <!-- マイク音量設定 -->
          <section>
            <h3 class="text-xl font-semibold text-gray-900 mb-4">🔊 2. マイク音量の設定</h3>
            <div class="space-y-4">
              <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 class="font-semibold text-yellow-800 mb-2">{{ microphoneSettings.title }}</h4>
                <ol class="list-decimal list-inside space-y-1 text-sm text-yellow-700">
                  <li v-for="(step, index) in microphoneSettings.steps" :key="index">
                    {{ step }}
                  </li>
                </ol>
              </div>

              <!-- テスト音確認 -->
              <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 class="font-semibold text-green-800 mb-2">🎵 マイクテスト</h4>
                <p class="text-sm text-green-700 mb-3">
                  手を叩いたり、軽くタイピングして、音量レベルが適切かテストしてください
                </p>
                <div class="flex items-center space-x-2 text-xs text-green-600">
                  <span>推奨レベル:</span>
                  <div class="flex-1 bg-green-200 rounded-full h-2 relative">
                    <div class="absolute left-1/2 w-1 h-4 bg-green-600 rounded transform -translate-x-1/2 -translate-y-1"></div>
                  </div>
                  <span>50%</span>
                </div>
              </div>
            </div>
          </section>

          <!-- 環境準備チェックリスト -->
          <section>
            <h3 class="text-xl font-semibold text-gray-900 mb-4">✅ 3. 環境準備チェックリスト</h3>
            <div class="space-y-3">
              <div
                v-for="item in checklistItems"
                :key="item.id"
                class="flex items-center space-x-3 p-3 rounded-lg border transition-colors"
                :class="{
                  'bg-green-50 border-green-200': item.checked,
                  'bg-gray-50 border-gray-200': !item.checked
                }"
              >
                <button
                  type="button"
                  class="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors"
                  :class="{
                    'bg-green-500 border-green-500 text-white': item.checked,
                    'border-gray-300 hover:border-gray-400': !item.checked
                  }"
                  @click="toggleCheck(item.id)"
                >
                  <svg v-if="item.checked" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </button>
                
                <span 
                  class="flex-1 transition-colors"
                  :class="{
                    'text-green-800 font-medium': item.checked,
                    'text-gray-700': !item.checked
                  }"
                >
                  {{ item.text }}
                  <span v-if="item.automated && item.id === 'environment' && props.environmentStatus" class="ml-2 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                    自動検出済み
                  </span>
                </span>
              </div>
            </div>

            <!-- 進捗表示 -->
            <div class="mt-4">
              <div class="flex justify-between items-center mb-2">
                <span class="text-sm font-medium text-gray-700">準備状況</span>
                <span class="text-sm text-gray-500">
                  {{ checklistItems.filter(item => item.checked).length }} / {{ checklistItems.length }}
                </span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${(checklistItems.filter(item => item.checked).length / checklistItems.length) * 100}%` }"
                ></div>
              </div>
            </div>
          </section>

          <!-- 重要な注意事項 -->
          <section>
            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
              <div class="flex items-start space-x-3">
                <svg class="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L1 21h22L12 2zm0 3.9L19.5 19h-15L12 5.9zm-1 8.1v2h2v-2h-2zm0-6v4h2V8h-2z"/>
                </svg>
                <div>
                  <h4 class="font-semibold text-red-800 mb-2">⚠️ 重要な注意事項</h4>
                  <ul class="text-sm text-red-700 space-y-1">
                    <li>• 測定中は他の音（音楽、会話、クリック音など）を避けてください</li>
                    <li>• 普段と同じ強さでタイピングしてください（わざと強く・弱く叩かない）</li>
                    <li>• 測定は一度きりなので、準備が整ってから開始してください</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- フッター -->
        <div class="bg-gray-50 px-6 py-4 rounded-b-lg">
          <div class="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
            <p class="text-sm text-gray-600">
              すべての項目を確認してから測定を開始してください
            </p>
            
            <div class="flex space-x-3">
              <button
                type="button"
                class="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                @click="$emit('close')"
              >
                後で確認する
              </button>
              
              <button
                type="button"
                class="px-6 py-2 bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                :class="{
                  'hover:bg-blue-700': allChecked,
                  'cursor-not-allowed opacity-50': !allChecked
                }"
                :disabled="!allChecked"
                @click="handleStartMeasurement"
              >
                <span v-if="allChecked">🎤 測定を開始する</span>
                <span v-else>チェックリストを完了してください</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* 設定ガイドモーダル専用のスタイル */
</style>
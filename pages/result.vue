<script setup lang="ts">
import type { MeasurementResult } from '~/composables/useMeasurement'

definePageMeta({
  layout: 'default',
})

// 結果データを取得
const result = ref<MeasurementResult | null>(null)

// sessionStorageから測定結果を取得
onMounted(() => {
  if (process.client) {
    const storedResult = sessionStorage.getItem('measurementResult')
    if (storedResult) {
      try {
        const parsedResult = JSON.parse(storedResult)
        // DateオブジェクトをJSONから復元
        parsedResult.measurementDate = new Date(parsedResult.measurementDate)
        result.value = parsedResult
      } catch (error) {
        console.error('Failed to parse measurement result:', error)
        // 測定データがない場合は測定ページにリダイレクト
        navigateTo('/measure')
      }
    } else {
      // 測定データがない場合は測定ページにリダイレクト
      navigateTo('/measure')
    }
  }
})

// 判定結果に基づく表示データ
const judgmentData = computed(() => {
  if (!result.value) return null

  switch (result.value.judgment) {
    case 'quiet':
      return {
        title: '静か',
        subtitle: '図書館レベルの静かさ',
        description:
          'あなたのタイピングは非常に静かです。周囲への配慮が十分にできています。',
        color: 'green',
        icon: '🤫',
        image: '/images/library.jpg', // 実際の画像パスに置き換え
        score: result.value.typingEvents,
        maxScore: 5,
        tips: [
          '現在の環境でのタイピングは問題ありません',
          '静音キーボードを使用している可能性があります',
          'この調子で配慮を続けてください',
        ],
      }
    case 'normal':
      return {
        title: '普通',
        subtitle: '一般的なオフィスレベル',
        description:
          'あなたのタイピングは一般的なレベルです。多くのオフィス環境で問題ない音量です。',
        color: 'yellow',
        icon: '💼',
        image: '/images/office.jpg',
        score: result.value.typingEvents,
        maxScore: 15,
        tips: [
          'オフィスや自宅での作業には適している音量です',
          'カフェや図書館では少し注意が必要かもしれません',
          'より静かにしたい場合は、タイピングの力を抑えてみてください',
        ],
      }
    case 'loud':
      return {
        title: 'うるさい',
        subtitle: '道路・工事現場レベル',
        description:
          'あなたのタイピングはやや大きな音量です。周囲への配慮をお勧めします。',
        color: 'red',
        icon: '🚧',
        image: '/images/construction.jpg',
        score: result.value.typingEvents,
        maxScore: Infinity,
        tips: [
          'タイピングの力を弱めることをお勧めします',
          '静音キーボードの使用を検討してください',
          'カフェや図書館での使用は控えめにしてください',
          'キーボードの下にマットを敷くと効果的です',
        ],
      }
  }
})

// 再測定ボタン
const handleRemeasure = () => {
  navigateTo('/measure')
}

// SNSシェア（将来実装用）
const handleShare = () => {
  // SNSシェア機能の実装
  console.log('シェア機能は将来実装予定')
}
</script>

<template>
  <!-- ローディング表示 -->
  <div v-if="!result" class="max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
    <div class="text-center space-y-4">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="text-gray-600">測定結果を読み込み中...</p>
    </div>
  </div>

  <!-- 結果表示 -->
  <div v-else-if="result && judgmentData" class="max-w-4xl mx-auto space-y-8">
    <!-- 結果ヘッダー -->
    <div class="text-center space-y-4">
      <h1 class="text-3xl font-bold text-gray-900">測定結果</h1>
      <p class="text-gray-600">
        {{ result.measurementDate.toLocaleDateString('ja-JP') }} 
        {{ result.measurementDate.toLocaleTimeString('ja-JP') }} の測定結果
      </p>
    </div>

    <!-- メイン結果表示 -->
    <div class="bg-white rounded-lg shadow-lg overflow-hidden">
      <!-- 結果画像・アイコンエリア -->
      <div 
        class="h-48 flex items-center justify-center text-white relative"
        :class="{
          'bg-green-500': judgmentData.color === 'green',
          'bg-yellow-500': judgmentData.color === 'yellow',
          'bg-red-500': judgmentData.color === 'red'
        }"
      >
        <div class="text-center space-y-4">
          <div class="text-6xl">{{ judgmentData.icon }}</div>
          <div>
            <h2 class="text-3xl font-bold">{{ judgmentData.title }}</h2>
            <p class="text-xl opacity-90">{{ judgmentData.subtitle }}</p>
          </div>
        </div>
      </div>

      <!-- 結果詳細 -->
      <div class="p-8 space-y-6">
        <!-- 判定説明 -->
        <div class="text-center">
          <p class="text-lg text-gray-700">{{ judgmentData.description }}</p>
        </div>

        <!-- 測定データ -->
        <div class="grid md:grid-cols-3 gap-6">
          <div class="bg-gray-50 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-gray-900">{{ result.typingEvents }}</div>
            <div class="text-sm text-gray-600">タイピング音検出回数</div>
          </div>
          
          <div class="bg-gray-50 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-gray-900">{{ Math.round(result.baselineLevel) }}dB</div>
            <div class="text-sm text-gray-600">環境音レベル</div>
          </div>
          
          <div class="bg-gray-50 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-gray-900">{{ Math.round(result.maxTypingLevel) }}dB</div>
            <div class="text-sm text-gray-600">最大音量</div>
          </div>
        </div>

        <!-- スコア表示 -->
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-sm font-medium text-gray-900">音量スコア</span>
            <span class="text-sm text-gray-500">
              {{ result.typingEvents }} / {{ judgmentData.maxScore === Infinity ? '∞' : judgmentData.maxScore }}
            </span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-3">
            <div 
              class="h-3 rounded-full transition-all duration-300"
              :class="{
                'bg-green-500': judgmentData.color === 'green',
                'bg-yellow-500': judgmentData.color === 'yellow',
                'bg-red-500': judgmentData.color === 'red'
              }"
              :style="{ 
                width: judgmentData.maxScore === Infinity 
                  ? '100%' 
                  : `${Math.min(100, (result.typingEvents / judgmentData.maxScore) * 100)}%` 
              }"
            ></div>
          </div>
        </div>

        <!-- 音量推移グラフ -->
        <div v-if="result.audioData.length > 0">
          <AudioChart 
            :data="result.audioData"
            :baseline-level="result.baselineLevel"
            :typing-threshold="result.baselineLevel + 15"
            title="30秒間の音量推移"
            :height="300"
          />
        </div>

        <!-- 改善提案 -->
        <div class="bg-blue-50 rounded-lg p-6">
          <h3 class="font-semibold text-blue-900 mb-3">💡 アドバイス</h3>
          <ul class="space-y-2">
            <li 
              v-for="(tip, index) in judgmentData.tips" 
              :key="index"
              class="flex items-start space-x-2 text-sm text-blue-800"
            >
              <span class="text-blue-600 mt-0.5">•</span>
              <span>{{ tip }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 判定基準の説明 -->
    <div class="bg-white rounded-lg shadow-sm p-6">
      <h3 class="font-semibold text-gray-900 mb-4">判定基準について</h3>
      <div class="space-y-3">
        <div class="flex items-center space-x-4">
          <div class="w-4 h-4 bg-green-500 rounded-full"></div>
          <div class="flex-1">
            <span class="font-medium text-gray-900">静か（0-5回）:</span>
            <span class="text-gray-600 ml-2">図書館やカフェでも安心</span>
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <div class="w-4 h-4 bg-yellow-500 rounded-full"></div>
          <div class="flex-1">
            <span class="font-medium text-gray-900">普通（6-15回）:</span>
            <span class="text-gray-600 ml-2">オフィス環境では問題なし</span>
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <div class="w-4 h-4 bg-red-500 rounded-full"></div>
          <div class="flex-1">
            <span class="font-medium text-gray-900">うるさい（16回以上）:</span>
            <span class="text-gray-600 ml-2">周囲への配慮が必要</span>
          </div>
        </div>
      </div>
      <p class="text-xs text-gray-500 mt-4">
        ※ 基準値（環境音）から15dB以上の音をタイピング音として検出しています
      </p>
    </div>

    <!-- アクションボタン -->
    <div class="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
      <button
        type="button"
        class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
        @click="handleRemeasure"
      >
        🔄 再測定する
      </button>
      
      <button
        type="button"
        class="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
        @click="handleShare"
      >
        📤 結果をシェア
      </button>
      
      <NuxtLink
        to="/"
        class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-8 rounded-lg transition-colors text-center"
      >
        🏠 ホームに戻る
      </NuxtLink>
    </div>

    <!-- 免責事項 -->
    <div class="bg-gray-50 rounded-lg p-4">
      <p class="text-xs text-gray-600 text-center">
        ※ この測定結果は参考値です。デバイスの性能や環境条件により結果が変動する場合があります。
        実際の騒音レベルを保証するものではありません。
      </p>
    </div>
  </div>
</template>

<style scoped>
/* 結果画面専用のスタイル */
</style>
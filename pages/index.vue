<script setup lang="ts">
import {
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  MicrophoneIcon,
  ShieldCheckIcon,
} from '@heroicons/vue/24/outline'

// ホームページのスクリプト
definePageMeta({
  layout: 'default',
})
</script>

<template>
  <div class="space-y-8">
    <!-- ヒーローセクション -->
    <div class="text-center space-y-6">
      <div class="space-y-4">
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900">
          あなたのタイピングは
          <span class="text-blue-600">うるさい？</span>
        </h1>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          Web Audio API を使用して、タイピング音量を客観的に測定します。<br>
          周囲への配慮をサポートする音量チェッカーです。
        </p>
      </div>

      <!-- メイン測定ボタン -->
      <div class="space-y-4">
        <NuxtLink
          to="/measure"
          class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          🎤 測定を開始する
        </NuxtLink>
        
        <div class="flex items-center justify-center space-x-6 text-sm text-gray-500">
          <div class="flex items-center space-x-2">
            <MicrophoneIcon class="w-4 h-4" />
            <span>マイク使用</span>
          </div>
          <div class="flex items-center space-x-2">
            <ShieldCheckIcon class="w-4 h-4" />
            <span>ローカル処理</span>
          </div>
          <div class="flex items-center space-x-2">
            <ClockIcon class="w-4 h-4" />
            <span>30秒測定</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 機能説明セクション -->
    <div class="grid md:grid-cols-3 gap-8 mt-16">
      <div class="text-center space-y-4">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircleIcon class="w-8 h-8 text-green-600" />
        </div>
        <h3 class="text-xl font-semibold text-gray-900">簡単測定</h3>
        <p class="text-gray-600">
          マイクアクセスを許可して「測定開始」をクリックするだけ。<br>
          5秒の環境音測定後、30秒間タイピングしてください。
        </p>
      </div>

      <div class="text-center space-y-4">
        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
          <ShieldCheckIcon class="w-8 h-8 text-blue-600" />
        </div>
        <h3 class="text-xl font-semibold text-gray-900">プライバシー重視</h3>
        <p class="text-gray-600">
          音声データはすべてブラウザ内で処理され、<br>
          サーバーに送信されることはありません。
        </p>
      </div>

      <div class="text-center space-y-4">
        <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
          <ChartBarIcon class="w-8 h-8 text-purple-600" />
        </div>
        <h3 class="text-xl font-semibold text-gray-900">視覚的結果</h3>
        <p class="text-gray-600">
          3段階評価（静か・普通・うるさい）と<br>
          音量推移グラフで結果を分かりやすく表示。
        </p>
      </div>
    </div>

    <!-- 測定の流れセクション -->
    <div class="bg-white rounded-lg shadow-sm p-8 mt-16">
      <h2 class="text-2xl font-bold text-gray-900 text-center mb-8">測定の流れ</h2>
      
      <div class="grid md:grid-cols-4 gap-6">
        <div class="text-center space-y-3">
          <div class="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto font-bold text-lg">
            1
          </div>
          <h3 class="font-semibold text-gray-900">マイク許可</h3>
          <p class="text-sm text-gray-600">ブラウザのマイクアクセス権限を許可してください</p>
        </div>
        
        <div class="text-center space-y-3">
          <div class="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto font-bold text-lg">
            2
          </div>
          <h3 class="font-semibold text-gray-900">環境音測定</h3>
          <p class="text-sm text-gray-600">5秒間静かにして、周囲の環境音を測定します</p>
        </div>
        
        <div class="text-center space-y-3">
          <div class="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto font-bold text-lg">
            3
          </div>
          <h3 class="font-semibold text-gray-900">タイピング測定</h3>
          <p class="text-sm text-gray-600">30秒間、普段通りにタイピングしてください</p>
        </div>
        
        <div class="text-center space-y-3">
          <div class="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto font-bold text-lg">
            4
          </div>
          <h3 class="font-semibold text-gray-900">結果表示</h3>
          <p class="text-sm text-gray-600">3段階評価とグラフで結果を確認できます</p>
        </div>
      </div>
    </div>

    <!-- 注意事項 -->
    <div class="bg-amber-50 border border-amber-200 rounded-lg p-6">
      <div class="flex items-start space-x-3">
        <ExclamationTriangleIcon class="w-6 h-6 text-amber-600 mt-0.5 flex-shrink-0" />
        <div class="space-y-2">
          <h3 class="font-semibold text-amber-900">測定前の準備</h3>
          <ul class="text-sm text-amber-800 space-y-1">
            <li>• 周囲が静かな環境で測定してください（40dB未満推奨）</li>
            <li>• マイクとキーボードの距離は50cm程度に設定してください</li>
            <li>• 測定中は会話や他の音を避けてください</li>
            <li>• デスクトップPC・ノートPCでの使用を推奨します</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ホームページ専用のスタイルがあれば追加 */
</style>
<script setup lang="ts">
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
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
            </svg>
            <span>マイク使用</span>
          </div>
          <div class="flex items-center space-x-2">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
            </svg>
            <span>ローカル処理</span>
          </div>
          <div class="flex items-center space-x-2">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zM12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
            </svg>
            <span>30秒測定</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 機能説明セクション -->
    <div class="grid md:grid-cols-3 gap-8 mt-16">
      <div class="text-center space-y-4">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg class="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-gray-900">簡単測定</h3>
        <p class="text-gray-600">
          マイクアクセスを許可して「測定開始」をクリックするだけ。<br>
          5秒の環境音測定後、30秒間タイピングしてください。
        </p>
      </div>

      <div class="text-center space-y-4">
        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
          <svg class="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 19c-4.286 1.35-4.286-2.55-6-3M15 21V9a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 006 9v12"/>
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-gray-900">プライバシー重視</h3>
        <p class="text-gray-600">
          音声データはすべてブラウザ内で処理され、<br>
          サーバーに送信されることはありません。
        </p>
      </div>

      <div class="text-center space-y-4">
        <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
          <svg class="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
          </svg>
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
        <svg class="w-6 h-6 text-amber-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L1 21h22L12 2zm0 3.9L19.5 19h-15L12 5.9zm-1 8.1v2h2v-2h-2zm0-6v4h2V8h-2z"/>
        </svg>
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
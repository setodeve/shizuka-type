<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  error: string | null
  type?: 'error' | 'warning' | 'info'
  showActions?: boolean
}

interface Emits {
  (e: 'retry'): void
  (e: 'dismiss'): void
  (e: 'help'): void
}

const props = withDefaults(defineProps<Props>(), {
  type: 'error',
  showActions: true,
})

defineEmits<Emits>()

// エラータイプに基づくスタイル
const errorStyles = computed(() => {
  switch (props.type) {
    case 'warning':
      return {
        container: 'bg-yellow-50 border-yellow-200',
        icon: 'text-yellow-600',
        title: 'text-yellow-900',
        message: 'text-yellow-800',
        button: 'bg-yellow-600 hover:bg-yellow-700',
      }
    case 'info':
      return {
        container: 'bg-blue-50 border-blue-200',
        icon: 'text-blue-600',
        title: 'text-blue-900',
        message: 'text-blue-800',
        button: 'bg-blue-600 hover:bg-blue-700',
      }
    default: // error
      return {
        container: 'bg-red-50 border-red-200',
        icon: 'text-red-600',
        title: 'text-red-900',
        message: 'text-red-800',
        button: 'bg-red-600 hover:bg-red-700',
      }
  }
})

// エラーの種類を判定
const errorInfo = computed(() => {
  if (!props.error) return null

  const error = props.error.toLowerCase()

  if (error.includes('notallowederror') || error.includes('permission')) {
    return {
      title: 'マイクアクセス権限エラー',
      category: 'permission',
      solutions: [
        'ブラウザのアドレスバー左側のマイクアイコンをクリックして許可',
        'ブラウザの設定でマイクアクセスを許可',
        'ページを再読み込みして再度許可',
      ],
      helpLink: 'https://support.google.com/chrome/answer/2693767',
    }
  }

  if (error.includes('notfounderror') || error.includes('not found')) {
    return {
      title: 'マイクデバイスエラー',
      category: 'device',
      solutions: [
        'マイクが正しく接続されているか確認',
        '他のアプリケーションがマイクを使用していないか確認',
        'デバイスマネージャーでマイクドライバーを確認',
        'USBマイクの場合は別のポートに接続してみる',
      ],
      helpLink: 'https://support.google.com/chrome/answer/2693767',
    }
  }

  if (error.includes('notsupportederror') || error.includes('not supported')) {
    return {
      title: 'ブラウザ非対応エラー',
      category: 'browser',
      solutions: [
        'Google Chrome の最新版を使用',
        'HTTPSでアクセス（Chromeではマイクアクセスに必要）',
        'ブラウザを最新版にアップデート',
        '他のブラウザ（Firefox、Edge）を試す',
      ],
      helpLink: 'https://caniuse.com/stream',
    }
  }

  if (error.includes('network') || error.includes('connection')) {
    return {
      title: 'ネットワークエラー',
      category: 'network',
      solutions: [
        'インターネット接続を確認',
        'ページを再読み込み',
        'しばらく時間をおいて再試行',
      ],
      helpLink: null,
    }
  }

  // 一般的なエラー
  return {
    title: 'エラーが発生しました',
    category: 'general',
    solutions: [
      'ページを再読み込みして再試行',
      'ブラウザを再起動',
      'しばらく時間をおいて再試行',
    ],
    helpLink: null,
  }
})

// アイコンコンポーネント
const getIconPath = (category: string) => {
  switch (category) {
    case 'permission':
      return 'M12 15c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v7c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 15 6.7 12H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7zM12 5c.55 0 1 .45 1 1v7c0 .55-.45 1-1 1s-1-.45-1-1V6c0-.55.45-1 1-1z'
    case 'device':
      return 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z'
    case 'browser':
      return 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'
    case 'network':
      return 'M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.07 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z'
    default:
      return 'M12 2L1 21h22L12 2zm0 3.9L19.5 19h-15L12 5.9zm-1 8.1v2h2v-2h-2zm0-6v4h2V8h-2z'
  }
}
</script>

<template>
  <div 
    v-if="error && errorInfo"
    class="border rounded-lg p-4 space-y-4"
    :class="errorStyles.container"
  >
    <!-- エラーヘッダー -->
    <div class="flex items-start space-x-3">
      <svg 
        class="w-6 h-6 mt-0.5 flex-shrink-0" 
        :class="errorStyles.icon"
        fill="currentColor" 
        viewBox="0 0 24 24"
      >
        <path :d="getIconPath(errorInfo.category)" />
      </svg>
      
      <div class="flex-1 min-w-0">
        <h3 class="font-semibold" :class="errorStyles.title">
          {{ errorInfo.title }}
        </h3>
        <p class="text-sm mt-1" :class="errorStyles.message">
          {{ error }}
        </p>
      </div>

      <!-- 閉じるボタン -->
      <button
        v-if="showActions"
        type="button"
        class="text-gray-400 hover:text-gray-600 transition-colors"
        @click="$emit('dismiss')"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <!-- 解決方法 -->
    <div class="space-y-3">
      <h4 class="font-medium text-sm" :class="errorStyles.title">
        解決方法:
      </h4>
      <ol class="list-decimal list-inside space-y-1 text-sm" :class="errorStyles.message">
        <li v-for="(solution, index) in errorInfo.solutions" :key="index">
          {{ solution }}
        </li>
      </ol>
    </div>

    <!-- アクションボタン -->
    <div v-if="showActions" class="flex flex-wrap gap-3 pt-2">
      <button
        type="button"
        class="px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors"
        :class="errorStyles.button"
        @click="$emit('retry')"
      >
        再試行
      </button>

      <button
        v-if="errorInfo.helpLink"
        type="button"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
        @click="$emit('help')"
      >
        詳細ヘルプ
      </button>

      <NuxtLink
        to="/"
        class="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 underline transition-colors"
      >
        ホームに戻る
      </NuxtLink>
    </div>

    <!-- デバッグ情報は本番では非表示 -->
  </div>
</template>

<style scoped>
/* エラーハンドラー専用のスタイル */
</style>
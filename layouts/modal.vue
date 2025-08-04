<script setup lang="ts">
// モーダル専用レイアウト
// 設定ガイドや大きなモーダルコンテンツ用
</script>

<template>
  <div class="min-h-screen bg-black bg-opacity-50 flex items-center justify-center p-4">
    <!-- モーダルコンテナ -->
    <div class="bg-white rounded-lg shadow-2xl max-w-4xl max-h-[90vh] overflow-y-auto w-full">
      <!-- モーダルコンテンツ -->
      <slot />
    </div>
  </div>
</template>

<style scoped>
/* モーダルレイアウト専用のスタイル */
.modal-backdrop {
  backdrop-filter: blur(4px);
}
</style>
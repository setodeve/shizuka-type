<script setup lang="ts">
import type { CharacterWithRomaji } from '~/utils/romajiConverter'

// プロパティの型定義
interface Props {
  sampleCharacters: CharacterWithRomaji[]
  typedText: string
  currentCharacterIndex: number
  currentRomajiPosition: number
  hasInputError: boolean
  isVisible: boolean
}

const props = defineProps<Props>()

// 入力進捗を表示するロジック
const getCharacterStatus = (
  index: number,
): 'correct' | 'incorrect' | 'current' | 'untyped' => {
  if (index < props.currentCharacterIndex) {
    return 'correct'
  } else if (index === props.currentCharacterIndex) {
    return 'current'
  } else {
    return 'untyped'
  }
}

// ローマ字の入力状況を取得
const getCurrentRomajiInput = (): string => {
  if (props.currentCharacterIndex >= props.sampleCharacters.length) {
    return ''
  }

  const currentChar = props.sampleCharacters[props.currentCharacterIndex]
  if (!currentChar) return ''
  const expectedRomaji = currentChar.primaryRomaji.toLowerCase()

  // 現在の文字の開始位置を計算
  let startPos = 0
  for (let i = 0; i < props.currentCharacterIndex; i++) {
    const char = props.sampleCharacters[i]
    if (char) {
      startPos += char.primaryRomaji.length
    }
  }

  // 現在の文字の入力状況
  const currentInput = props.typedText.slice(startPos).toLowerCase()
  const matchLength = Math.min(currentInput.length, expectedRomaji.length)

  return currentInput.slice(0, matchLength)
}

// 進捗率の計算
const progressPercent = computed(() => {
  if (props.sampleCharacters.length === 0) return 0
  return Math.min(
    100,
    (props.currentCharacterIndex / props.sampleCharacters.length) * 100,
  )
})
</script>

<template>
  <div v-if="props.isVisible" class="bg-gray-50 rounded-lg border p-6 space-y-4">
    <!-- タイトルと進捗 -->
    <div class="text-center space-y-2">
      <h3 class="font-semibold text-gray-900 mb-2">サンプル文章</h3>
      <p class="text-sm text-gray-600">
        以下の文章を参考にタイピングしてください
      </p>
      
      <!-- 進捗表示 -->
      <div class="max-w-md mx-auto">
        <div class="flex justify-between text-xs text-gray-500 mb-1">
          <span>進捗</span>
          <span>{{ Math.round(progressPercent) }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div 
            class="bg-blue-500 h-2 rounded-full transition-all duration-200"
            :style="{ width: `${progressPercent}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- サンプルテキスト表示（ひらがな・カタカナ + ローマ字の2段表示） -->
    <div class="bg-white rounded-md border p-4 shadow-sm">
      <!-- ひらがな・カタカナ行 -->
      <div class="text-lg leading-relaxed font-mono whitespace-pre-wrap mb-2">
        <span 
          v-for="(character, index) in props.sampleCharacters" 
          :key="`hiragana-${index}`"
          :class="{
            'bg-green-200 text-green-800': getCharacterStatus(index) === 'correct',
            'bg-blue-200 text-blue-800': getCharacterStatus(index) === 'current',
            'text-gray-600': getCharacterStatus(index) === 'untyped'
          }"
          class="transition-colors duration-200 inline-block"
        >{{ character.hiragana }}</span>
      </div>
      
      <!-- ローマ字行 -->
      <div class="text-sm leading-relaxed font-mono text-gray-500 whitespace-pre-wrap">
        <span 
          v-for="(character, index) in props.sampleCharacters" 
          :key="`romaji-${index}`"
          :class="{
            'bg-green-100 text-green-700': getCharacterStatus(index) === 'correct',
            'bg-blue-100 text-blue-700': getCharacterStatus(index) === 'current',
            'text-gray-400': getCharacterStatus(index) === 'untyped'
          }"
          class="transition-colors duration-200 inline-block mr-1"
          :style="{ minWidth: `${Math.max(character.hiragana.length * 1.2, character.primaryRomaji.length * 0.8)}em` }"
        >{{ character.primaryRomaji }}</span>
        
        <!-- 現在入力中のカーソル -->
        <span 
          v-if="props.currentCharacterIndex < props.sampleCharacters.length"
          class="animate-pulse bg-blue-500 text-transparent inline-block w-0.5 h-4 ml-0.5"
        >|</span>
      </div>
    </div>

    <!-- 現在の入力内容表示 -->
    <div class="bg-blue-50 rounded-md border border-blue-200 p-3">
      <div class="text-sm text-blue-700 mb-1">ローマ字入力:</div>
      <div class="text-base font-mono text-blue-900 min-h-6">
        {{ props.typedText || '（ローマ字で入力してください）' }}
      </div>
      
      <!-- 現在入力すべきローマ字のヒント -->
      <div v-if="props.currentCharacterIndex < props.sampleCharacters.length" class="text-xs mt-2"
           :class="props.hasInputError ? 'text-red-600' : 'text-blue-600'">
        次の文字: <span class="font-semibold">{{ props.sampleCharacters[props.currentCharacterIndex]?.hiragana }}</span>
        → <span class="font-semibold" 
                :class="props.hasInputError ? 'bg-red-100 px-1 rounded animate-pulse' : ''">
             {{ props.sampleCharacters[props.currentCharacterIndex]?.primaryRomaji }}
           </span>
        <span v-if="(props.sampleCharacters[props.currentCharacterIndex]?.romaji?.length ?? 0) > 1" class="text-gray-500 ml-2">
          (他の入力方法: {{ props.sampleCharacters[props.currentCharacterIndex]?.romaji.slice(1).join(', ') }})
        </span>
      </div>
      
      <!-- エラーメッセージ -->
      <div v-if="props.hasInputError" class="text-xs text-red-600 mt-1 animate-pulse">
        ❌ 正しい文字を入力してください
      </div>
    </div>

    <!-- 注意事項 -->
    <div class="text-xs text-gray-500 text-center">
      ※ この文章は参考用です。完全に同じでなくても構いません
    </div>
  </div>
</template>

<style scoped>
/* タイピング表示専用スタイル */
.font-mono {
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
}
</style>
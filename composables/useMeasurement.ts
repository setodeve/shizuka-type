import { computed, reactive, readonly, ref } from 'vue'
import {
  type CharacterWithRomaji,
  convertTextToCharactersWithRomaji,
} from '~/utils/romajiConverter'
import { type AudioAnalysisResult, useAudioAnalyzer } from './useAudioAnalyzer'

export interface MeasurementResult {
  baselineLevel: number // 環境音レベル（基準値）
  typingEvents: number // タイピング音検出回数
  maxTypingLevel: number // 最大音量
  averageTypingLevel: number // 平均音量
  audioData: AudioAnalysisResult[] // 全音量データ
  judgment: 'quiet' | 'normal' | 'loud' // 判定結果
  measurementDate: Date
}

export type MeasurementPhase =
  | 'idle'
  | 'preparing'
  | 'baseline'
  | 'typing'
  | 'processing'
  | 'completed'
  | 'error'

export interface MeasurementState {
  phase: MeasurementPhase
  timeRemaining: number
  progress: number
  message: string
}

export const useMeasurement = () => {
  const audioAnalyzer = useAudioAnalyzer()

  const measurementState = reactive<MeasurementState>({
    phase: 'idle',
    timeRemaining: 0,
    progress: 0,
    message: '',
  })

  const measurementResult = ref<MeasurementResult | null>(null)

  // サンプルテキストの配列
  const SAMPLE_TEXTS = [
    'ひびのぎょうむにおいて、こうりつてきなコミュニケーションはひじょうにじゅうようです。メールやかいぎでのじょうほうきょうゆうをつうじて、チームぜんたいのせいさんせいこうじょうをはかることができます。',
    'プロジェクトかんりでは、タスクのゆうせんじゅんいをめいかくにし、リソースのさいてきはいぶんをおこなうことがせいこうのかぎとなります。ていきてきなしんちょくかくにんとかだいのそうきはっけんがじゅうようです。',
    'こきゃくまんぞくどのこうじょうのためには、けいぞくてきなサービスかいぜんときゅうそくなたいおうがかかせません。フィードバックをせっきょくてきにしゅうしゅうし、かいぜんにいかすことがたいせつです。',
    'データぶんせきにより、しじょうどうこうやしょうひしゃこうどうのけいこうをはあくすることで、せんりゃくてきないしけっていをおこなうことができます。せいかくなデータのしゅうしゅうとかいせきがきばんとなります。',
    'チームワークのこうじょうには、メンバーかんのしんらいかんけいこうちくととうめいせいのあるコミュニケーションがふかけつです。ていきてきなめんだんとじょうほうきょうゆうをこころがけましょう。',
  ]

  // 現在のサンプルテキスト
  const currentSampleText = ref<string>('')

  // タイピング入力の状態
  const typedText = ref<string>('')
  const isTypingActive = ref<boolean>(false)

  // ローマ字変換されたサンプルテキスト
  const sampleCharacters = ref<CharacterWithRomaji[]>([])

  // 現在の入力位置（ローマ字ベース）
  const currentRomajiPosition = ref<number>(0)
  const currentCharacterIndex = ref<number>(0)

  // 間違った入力時のエラー状態
  const hasInputError = ref<boolean>(false)
  let errorTimeout: NodeJS.Timeout | null = null

  // サンプルテキストをランダムに選択
  const selectSampleText = (): string => {
    const randomIndex = Math.floor(Math.random() * SAMPLE_TEXTS.length)
    return SAMPLE_TEXTS[randomIndex] ?? SAMPLE_TEXTS[0] ?? ''
  }
  // 現在の入力位置で期待される文字をチェックする関数
  const checkCurrentInput = (
    currentInput: string,
    newChar: string,
  ): boolean => {
    if (currentCharacterIndex.value >= sampleCharacters.value.length) {
      return false // もう入力すべき文字がない
    }

    const currentChar = sampleCharacters.value[currentCharacterIndex.value]
    if (!currentChar) return false // 配列の範囲外チェック
    const romajiPatterns = currentChar.romaji

    // 現在の文字の開始位置を計算
    let startPos = 0
    for (let i = 0; i < currentCharacterIndex.value; i++) {
      // 完了済みの文字のローマ字長を計算（実際に入力されたパターンの長さを使用）
      const completedChar = sampleCharacters.value[i]
      if (!completedChar) continue // undefined チェック
      // 最短のパターンを使用して計算（実装簡略化のため）
      startPos += Math.min(...completedChar.romaji.map((p) => p.length))
    }

    // 現在の文字内での入力位置
    const currentCharInput = currentInput.slice(startPos).toLowerCase()
    const newText = currentCharInput + newChar.toLowerCase()

    // いずれかのパターンの開始部分にマッチするかチェック
    return romajiPatterns.some((pattern) =>
      pattern.toLowerCase().startsWith(newText),
    )
  }

  // ローマ字入力の進捗チェック（複数パターン対応）
  const checkRomajiProgress = (inputText: string): void => {
    let romajiPos = 0
    let charIndex = 0

    for (let i = 0; i < sampleCharacters.value.length; i++) {
      const char = sampleCharacters.value[i]
      if (!char) continue // undefined チェック
      const romajiPatterns = char.romaji

      // 複数パターンの中からマッチするものを探す
      let matched = false
      let matchedLength = 0

      for (const pattern of romajiPatterns) {
        const requiredRomaji = pattern.toLowerCase()

        // 現在の文字のローマ字が完全に入力されているかチェック
        if (romajiPos + requiredRomaji.length <= inputText.length) {
          const inputPart = inputText
            .slice(romajiPos, romajiPos + requiredRomaji.length)
            .toLowerCase()

          if (inputPart === requiredRomaji) {
            // 正しく入力された
            matchedLength = requiredRomaji.length
            matched = true
            break
          }
        } else {
          // 部分的な入力をチェック（入力途中の場合）
          const partialInput = inputText.slice(romajiPos).toLowerCase()
          if (
            requiredRomaji.startsWith(partialInput) &&
            partialInput.length > 0
          ) {
            // 部分的にマッチしているが、まだ完了していない
            matched = false // 完全ではないのでfalseのまま
            break
          }
        }
      }

      if (matched) {
        romajiPos += matchedLength
        charIndex = i + 1
      } else {
        // どのパターンにもマッチしなかった、または部分的な入力
        break
      }
    }

    currentRomajiPosition.value = romajiPos
    currentCharacterIndex.value = charIndex
  }

  // キーボード入力処理
  const handleKeyInput = (event: KeyboardEvent) => {
    if (!isTypingActive.value) return

    // バックスペース処理
    if (event.key === 'Backspace') {
      if (typedText.value.length > 0) {
        typedText.value = typedText.value.slice(0, -1)
        checkRomajiProgress(typedText.value)
      }
      return
    }

    // 通常文字の入力（印字可能文字のみ）
    if (
      event.key.length === 1 &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    ) {
      // 入力検証：期待される文字かどうかをチェック
      if (checkCurrentInput(typedText.value, event.key)) {
        const newText = typedText.value + event.key
        typedText.value = newText
        checkRomajiProgress(newText)
      } else {
        // 間違った入力の場合は無視（typedTextに追加しない）
        // 視覚フィードバックを表示
        hasInputError.value = true

        // 既存のタイムアウトをクリア
        if (errorTimeout) {
          clearTimeout(errorTimeout)
        }

        // 0.5秒後にエラー状態をリセット
        errorTimeout = setTimeout(() => {
          hasInputError.value = false
          errorTimeout = null
        }, 500)
      }
    }
  }

  // タイピング入力の開始
  const startTypingInput = () => {
    typedText.value = ''
    isTypingActive.value = true
    currentRomajiPosition.value = 0
    currentCharacterIndex.value = 0

    // キーボードイベントリスナーを追加
    if (process.client) {
      document.addEventListener('keydown', handleKeyInput)
    }
  }

  // タイピング入力の終了
  const stopTypingInput = () => {
    isTypingActive.value = false
    hasInputError.value = false

    // エラータイムアウトをクリア
    if (errorTimeout) {
      clearTimeout(errorTimeout)
      errorTimeout = null
    }

    // キーボードイベントリスナーを削除
    if (process.client) {
      document.removeEventListener('keydown', handleKeyInput)
    }
  }

  // 測定設定
  const BASELINE_DURATION = 3000 // 環境音測定時間（3秒） // 環境音測定時間（5秒）
  const TYPING_DURATION = 15000 // タイピング測定時間（15秒） // タイピング測定時間（30秒）
  const TYPING_THRESHOLD_OFFSET = 20 // 基準値からのオフセット（dB）

  // 判定基準
  const JUDGMENT_THRESHOLDS = {
    quiet: { min: 0, max: 5 },
    normal: { min: 6, max: 12 },
    loud: { min: 13, max: Infinity },
  }

  // 現在の測定フェーズの説明文
  const phaseMessage = computed(() => {
    switch (measurementState.phase) {
      case 'idle':
        return '測定を開始する準備ができています'
      case 'preparing':
        return 'マイクアクセスを準備しています...'
      case 'baseline':
        return '環境音を測定しています。静かにお待ちください'
      case 'typing':
        return 'サンプル文章を参考にタイピングしてください'
      case 'processing':
        return '測定結果を分析中です。しばらくお待ちください...'
      case 'completed':
        return '測定が完了しました'
      case 'error':
        return '測定中にエラーが発生しました'
      default:
        return ''
    }
  })

  // 測定が実行中かどうか
  const isActive = computed(() => {
    return ['preparing', 'baseline', 'typing', 'processing'].includes(
      measurementState.phase,
    )
  })

  // タイマー管理
  let timer: NodeJS.Timeout | null = null

  const startTimer = (duration: number, onComplete: () => void) => {
    const startTime = Date.now()
    const totalDuration = duration

    timer = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, totalDuration - elapsed)

      measurementState.timeRemaining = Math.ceil(remaining / 1000)
      measurementState.progress = Math.min(100, (elapsed / totalDuration) * 100)

      if (remaining <= 0) {
        if (timer) {
          clearInterval(timer)
          timer = null
        }
        onComplete()
      }
    }, 100)
  }

  const stopTimer = () => {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  // 音量判定ロジック
  const detectTypingEvents = (
    audioData: AudioAnalysisResult[],
    baselineLevel: number,
  ): number => {
    const threshold = baselineLevel + TYPING_THRESHOLD_OFFSET
    let eventCount = 0
    let lastEventTime = 0
    const minEventInterval = 250 // 最小イベント間隔（ms）

    for (const data of audioData) {
      if (data.averageLevel >= threshold) {
        // 前回のイベントから十分時間が経過している場合のみカウント
        if (data.timestamp - lastEventTime >= minEventInterval) {
          eventCount++
          lastEventTime = data.timestamp
        }
      }
    }

    return eventCount
  }

  // 判定結果を計算
  const calculateJudgment = (
    typingEvents: number,
  ): 'quiet' | 'normal' | 'loud' => {
    if (typingEvents <= JUDGMENT_THRESHOLDS.quiet.max) {
      return 'quiet'
    } else if (typingEvents <= JUDGMENT_THRESHOLDS.normal.max) {
      return 'normal'
    } else {
      return 'loud'
    }
  }

  // 測定開始
  const startMeasurement = async (): Promise<boolean> => {
    try {
      measurementState.phase = 'preparing'
      measurementState.message = 'マイクアクセスを準備しています...'

      // ブラウザサポートチェック
      if (!audioAnalyzer.checkBrowserSupport()) {
        throw new Error(
          audioAnalyzer.audioState.error || 'ブラウザがサポートされていません',
        )
      }

      // マイクアクセス権限取得
      const hasPermission = await audioAnalyzer.requestMicrophonePermission()
      if (!hasPermission) {
        throw new Error(
          audioAnalyzer.audioState.error || 'マイクアクセス権限が必要です',
        )
      }

      // Audio Context初期化
      const isInitialized = await audioAnalyzer.initializeAudioContext()
      if (!isInitialized) {
        throw new Error(
          audioAnalyzer.audioState.error ||
            'オーディオシステムの初期化に失敗しました',
        )
      }

      // 環境音測定フェーズ開始
      startBaselineMeasurement()
      return true
    } catch (error: unknown) {
      console.error('Measurement start error:', error)
      measurementState.phase = 'error'
      measurementState.message =
        error instanceof Error ? error.message : '測定開始エラーが発生しました'
      return false
    }
  }

  // 環境音測定
  const startBaselineMeasurement = () => {
    measurementState.phase = 'baseline'
    measurementState.message = phaseMessage.value

    // データ蓄積開始とリアルタイム分析開始
    audioAnalyzer.startDataAccumulation()
    audioAnalyzer.startAnalysis()

    startTimer(BASELINE_DURATION, async () => {
      // 蓄積された環境音データを取得
      const baselineData = audioAnalyzer.getAccumulatedData()
      const baselineLevel =
        baselineData.length > 0
          ? baselineData.reduce((sum, data) => sum + data.averageLevel, 0) /
            baselineData.length
          : -40 // デフォルト値

      // タイピング測定用にデータ蓄積をリセット
      audioAnalyzer.startDataAccumulation()

      // タイピング測定フェーズ開始
      startTypingMeasurement(baselineLevel)
    })
  }

  // タイピング測定
  const startTypingMeasurement = (baselineLevel: number) => {
    measurementState.phase = 'typing'
    measurementState.message = phaseMessage.value

    // サンプルテキストを選択
    currentSampleText.value = selectSampleText()

    // ローマ字変換データを準備
    sampleCharacters.value = convertTextToCharactersWithRomaji(
      currentSampleText.value,
    )

    // タイピング入力開始
    startTypingInput()

    startTimer(TYPING_DURATION, async () => {
      // 処理中状態に変更（短時間）
      measurementState.phase = 'processing'
      measurementState.progress = 50

      // 蓄積されたタイピングデータを取得（即座に利用可能）
      const typingData = audioAnalyzer.getAccumulatedData()

      // 分析停止
      audioAnalyzer.stopAnalysis()

      // タイピング入力停止
      stopTypingInput()

      measurementState.progress = 75

      // 結果計算（高速）
      const typingEvents = detectTypingEvents(typingData, baselineLevel)
      const maxLevel = Math.max(...typingData.map((d) => d.averageLevel))
      const avgLevel =
        typingData.reduce((sum, d) => sum + d.averageLevel, 0) /
        typingData.length
      const judgment = calculateJudgment(typingEvents)

      measurementState.progress = 90

      // 結果保存
      measurementResult.value = {
        baselineLevel,
        typingEvents,
        maxTypingLevel: maxLevel,
        averageTypingLevel: avgLevel,
        audioData: typingData,
        judgment,
        measurementDate: new Date(),
      }

      measurementState.progress = 100

      // 短時間待機後に完了状態へ
      setTimeout(() => {
        measurementState.phase = 'completed'
        measurementState.message = phaseMessage.value
      }, 200)
    })
  }

  // 測定中止
  const cancelMeasurement = () => {
    stopTimer()
    audioAnalyzer.stopAnalysis()
    stopTypingInput()
    measurementState.phase = 'idle'
    measurementState.timeRemaining = 0
    measurementState.progress = 0
    measurementState.message = ''
  }

  // リセット
  const resetMeasurement = () => {
    cancelMeasurement()
    measurementResult.value = null
    audioAnalyzer.cleanup()
    typedText.value = ''
    currentSampleText.value = ''
    sampleCharacters.value = []
    currentRomajiPosition.value = 0
    currentCharacterIndex.value = 0
  }

  return {
    measurementState: readonly(measurementState),
    measurementResult: readonly(measurementResult),
    audioState: audioAnalyzer.audioState,
    phaseMessage,
    isActive,
    startMeasurement,
    cancelMeasurement,
    resetMeasurement,
    currentSampleText: readonly(currentSampleText),
    typedText: readonly(typedText),
    isTypingActive: readonly(isTypingActive),
    sampleCharacters: readonly(sampleCharacters),
    currentCharacterIndex: readonly(currentCharacterIndex),
    currentRomajiPosition: readonly(currentRomajiPosition),
    hasInputError: readonly(hasInputError),
    JUDGMENT_THRESHOLDS,
  }
}

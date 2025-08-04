import { computed, reactive, readonly, ref } from 'vue'
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

  // 測定設定
  const BASELINE_DURATION = 5000 // 環境音測定時間（5秒）
  const TYPING_DURATION = 30000 // タイピング測定時間（30秒）
  const TYPING_THRESHOLD_OFFSET = 15 // 基準値からのオフセット（dB）

  // 判定基準
  const JUDGMENT_THRESHOLDS = {
    quiet: { min: 0, max: 5 },
    normal: { min: 6, max: 15 },
    loud: { min: 16, max: Infinity },
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
        return '普段通りにタイピングしてください'
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
    return ['preparing', 'baseline', 'typing'].includes(measurementState.phase)
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
    const minEventInterval = 200 // 最小イベント間隔（ms）

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

    // リアルタイム分析開始
    audioAnalyzer.startAnalysis()

    startTimer(BASELINE_DURATION, async () => {
      // 環境音データ収集
      const baselineData = await audioAnalyzer.collectAudioData(100) // 最新100msのデータ
      const baselineLevel =
        baselineData.length > 0
          ? baselineData.reduce((sum, data) => sum + data.averageLevel, 0) /
            baselineData.length
          : -40 // デフォルト値

      // タイピング測定フェーズ開始
      startTypingMeasurement(baselineLevel)
    })
  }

  // タイピング測定
  const startTypingMeasurement = (baselineLevel: number) => {
    measurementState.phase = 'typing'
    measurementState.message = phaseMessage.value

    startTimer(TYPING_DURATION, async () => {
      // タイピング音データ収集
      const typingData = await audioAnalyzer.collectAudioData(TYPING_DURATION)

      // 分析停止
      audioAnalyzer.stopAnalysis()

      // 結果計算
      const typingEvents = detectTypingEvents(typingData, baselineLevel)
      const maxLevel = Math.max(...typingData.map((d) => d.averageLevel))
      const avgLevel =
        typingData.reduce((sum, d) => sum + d.averageLevel, 0) /
        typingData.length
      const judgment = calculateJudgment(typingEvents)

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

      measurementState.phase = 'completed'
      measurementState.message = phaseMessage.value
    })
  }

  // 測定中止
  const cancelMeasurement = () => {
    stopTimer()
    audioAnalyzer.stopAnalysis()
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
    JUDGMENT_THRESHOLDS,
  }
}

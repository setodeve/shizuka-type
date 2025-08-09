import { computed, reactive, readonly, ref } from 'vue'
import { useAudioAnalyzer } from './useAudioAnalyzer'

export interface EnvironmentStatus {
  isQuiet: boolean
  averageLevel: number
  recommendation: 'excellent' | 'good' | 'caution' | 'poor'
  message: string
}

export interface EnvironmentState {
  isDetecting: boolean
  hasDetected: boolean
  isSupported: boolean
  error: string | null
  status: EnvironmentStatus | null
  progress: number
}

export const useEnvironmentDetection = () => {
  const audioAnalyzer = useAudioAnalyzer()

  const environmentState = reactive<EnvironmentState>({
    isDetecting: false,
    hasDetected: false,
    isSupported: false,
    error: null,
    status: null,
    progress: 0,
  })

  // 環境判定の閾値設定
  const ENVIRONMENT_THRESHOLDS = {
    excellent: -50, // 非常に静か (-50dB以下)
    good: -40, // 静か (-50dB ~ -40dB)
    caution: -30, // 注意が必要 (-40dB ~ -30dB)
    poor: -30, // 測定困難 (-30dB以上)
  }

  const DETECTION_DURATION = 5000 // 5秒間の環境音検出

  // 環境状態の評価
  const evaluateEnvironment = (averageLevel: number): EnvironmentStatus => {
    let recommendation: EnvironmentStatus['recommendation']
    let message: string
    let isQuiet: boolean

    if (averageLevel <= ENVIRONMENT_THRESHOLDS.excellent) {
      recommendation = 'excellent'
      message = '非常に静かな環境です。測定に最適です。'
      isQuiet = true
    } else if (averageLevel <= ENVIRONMENT_THRESHOLDS.good) {
      recommendation = 'good'
      message = '静かな環境です。測定に適しています。'
      isQuiet = true
    } else if (averageLevel <= ENVIRONMENT_THRESHOLDS.caution) {
      recommendation = 'caution'
      message = 'やや騒音があります。可能であれば静かな場所で測定してください。'
      isQuiet = false
    } else {
      recommendation = 'poor'
      message = '騒音が多い環境です。測定結果が不正確になる可能性があります。'
      isQuiet = false
    }

    return {
      isQuiet,
      averageLevel,
      recommendation,
      message,
    }
  }

  // 推奨レベルの説明文
  const getRecommendationText = computed(() => {
    if (!environmentState.status) return ''

    switch (environmentState.status.recommendation) {
      case 'excellent':
        return '🟢 最適な環境'
      case 'good':
        return '🟡 良好な環境'
      case 'caution':
        return '🟠 注意が必要'
      case 'poor':
        return '🔴 測定困難'
      default:
        return ''
    }
  })

  // 環境改善のアドバイス
  const getImprovementAdvice = computed(() => {
    if (!environmentState.status) return []

    switch (environmentState.status.recommendation) {
      case 'excellent':
        return ['そのまま測定を開始できます']
      case 'good':
        return ['測定を開始できます']
      case 'caution':
        return [
          '窓を閉めて外音を遮断してください',
          'エアコンやファンの音量を下げてください',
          '他の人の会話を避けてください',
        ]
      case 'poor':
        return [
          '静かな部屋に移動してください',
          '周囲の機器の電源を切ってください',
          '時間を変えて再度お試しください',
          'ドアや窓を閉めて遮音してください',
        ]
      default:
        return []
    }
  })

  // 自動環境検出の開始
  const startEnvironmentDetection = async (): Promise<boolean> => {
    try {
      environmentState.isDetecting = true
      environmentState.hasDetected = false
      environmentState.error = null
      environmentState.progress = 0

      // ブラウザサポートチェック
      if (!audioAnalyzer.checkBrowserSupport()) {
        throw new Error('ブラウザがWeb Audio APIに対応していません')
      }
      environmentState.isSupported = true

      // マイクアクセス権限取得
      const hasPermission = await audioAnalyzer.requestMicrophonePermission()
      if (!hasPermission) {
        throw new Error('マイクアクセス権限が必要です')
      }

      // Audio Context初期化
      const isInitialized = await audioAnalyzer.initializeAudioContext()
      if (!isInitialized) {
        throw new Error('オーディオシステムの初期化に失敗しました')
      }

      environmentState.progress = 20

      // 環境音検出開始
      audioAnalyzer.startDataAccumulation()
      audioAnalyzer.startAnalysis()

      environmentState.progress = 40

      // 指定時間の環境音データを収集
      const environmentData =
        await audioAnalyzer.collectAudioData(DETECTION_DURATION)

      environmentState.progress = 80

      // 分析停止
      audioAnalyzer.stopAnalysis()

      // 平均レベルを計算
      const averageLevel =
        environmentData.length > 0
          ? environmentData.reduce((sum, data) => sum + data.averageLevel, 0) /
            environmentData.length
          : -60 // デフォルト値

      // 環境評価
      environmentState.status = evaluateEnvironment(averageLevel)
      environmentState.hasDetected = true
      environmentState.progress = 100

      return true
    } catch (error: unknown) {
      console.error('Environment detection error:', error)
      environmentState.error =
        error instanceof Error ? error.message : '環境検出エラーが発生しました'
      return false
    } finally {
      environmentState.isDetecting = false
    }
  }

  // 検出のリセット
  const resetDetection = () => {
    environmentState.isDetecting = false
    environmentState.hasDetected = false
    environmentState.error = null
    environmentState.status = null
    environmentState.progress = 0
    audioAnalyzer.cleanup()
  }

  // 環境検出が利用可能かどうか
  const isAvailable = computed(() => {
    return audioAnalyzer.audioState.isSupported
  })

  // 現在の環境が測定に適しているかどうか
  const isSuitableForMeasurement = computed(() => {
    return environmentState.status?.isQuiet ?? false
  })

  return {
    environmentState: readonly(environmentState),
    getRecommendationText,
    getImprovementAdvice,
    isAvailable,
    isSuitableForMeasurement,
    audioState: audioAnalyzer.audioState,
    startEnvironmentDetection,
    resetDetection,
    ENVIRONMENT_THRESHOLDS,
  }
}

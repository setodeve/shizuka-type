import type { Mock } from 'vitest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useEnvironmentDetection } from '~/composables/useEnvironmentDetection'

// useAudioAnalyzerのモック
vi.mock('~/composables/useAudioAnalyzer', () => ({
  useAudioAnalyzer: vi.fn(),
}))

describe('useEnvironmentDetection', () => {
  let environmentDetection: ReturnType<typeof useEnvironmentDetection>
  let mockAudioAnalyzer: {
    checkBrowserSupport: Mock
    requestMicrophonePermission: Mock
    initializeAudioContext: Mock
    startAnalysis: Mock
    stopAnalysis: Mock
    cleanup: Mock
    startDataAccumulation: Mock
    getAccumulatedData: Mock
    collectAudioData: Mock
    audioState: {
      isSupported: boolean
      hasPermission: boolean
      isInitialized: boolean
      isAnalyzing: boolean
      currentLevel: number
      error: string | null
    }
    analysisResults: { value: unknown[] }
    accumulatedData: { value: unknown[] }
  }

  beforeEach(async () => {
    vi.clearAllMocks()

    // useAudioAnalyzerのモックインスタンスを作成
    const { useAudioAnalyzer } = await import('~/composables/useAudioAnalyzer')
    mockAudioAnalyzer = {
      checkBrowserSupport: vi.fn(),
      requestMicrophonePermission: vi.fn(),
      initializeAudioContext: vi.fn(),
      startAnalysis: vi.fn(),
      stopAnalysis: vi.fn(),
      cleanup: vi.fn(),
      startDataAccumulation: vi.fn(),
      getAccumulatedData: vi.fn(() => []),
      collectAudioData: vi.fn(() => Promise.resolve([])),
      audioState: {
        isSupported: false,
        hasPermission: false,
        isInitialized: false,
        isAnalyzing: false,
        currentLevel: 0,
        error: null,
      },
      analysisResults: { value: [] },
      accumulatedData: { value: [] },
    }
    vi.mocked(useAudioAnalyzer).mockReturnValue(mockAudioAnalyzer)

    environmentDetection = useEnvironmentDetection()
  })

  describe('初期状態', () => {
    it('初期状態が正しく設定される', () => {
      expect(environmentDetection.environmentState.isDetecting).toBe(false)
      expect(environmentDetection.environmentState.hasDetected).toBe(false)
      expect(environmentDetection.environmentState.isSupported).toBe(false)
      expect(environmentDetection.environmentState.error).toBeNull()
      expect(environmentDetection.environmentState.status).toBeNull()
      expect(environmentDetection.environmentState.progress).toBe(0)
    })

    it('isAvailableが正しく計算される', () => {
      // 初期状態では false（mockAudioAnalyzer.audioState.isSupported = false）
      expect(environmentDetection.isAvailable.value).toBe(false)

      // checkBrowserSupportを実行してisSupported状態を更新
      mockAudioAnalyzer.checkBrowserSupport.mockReturnValue(true)
      mockAudioAnalyzer.audioState.isSupported = true

      // 新しいコンポーザブルインスタンスで確認
      const supportedEnvDetection = useEnvironmentDetection()
      expect(supportedEnvDetection.isAvailable.value).toBe(true)
    })

    it('isSuitableForMeasurementが正しく計算される', async () => {
      // 初期状態では false（status が null）
      expect(environmentDetection.isSuitableForMeasurement.value).toBe(false)

      // 環境検出を実行して status を設定する正常なフローをテスト
      mockAudioAnalyzer.checkBrowserSupport.mockReturnValue(true)
      mockAudioAnalyzer.requestMicrophonePermission.mockResolvedValue(true)
      mockAudioAnalyzer.initializeAudioContext.mockResolvedValue(true)
      mockAudioAnalyzer.collectAudioData.mockResolvedValue([
        { averageLevel: -45, maxLevel: -30, timestamp: Date.now() },
      ])
      mockAudioAnalyzer.audioState.isSupported = true
      mockAudioAnalyzer.audioState.hasPermission = true
      mockAudioAnalyzer.audioState.isInitialized = true

      await environmentDetection.startEnvironmentDetection()

      // 環境検出後は status.isQuiet に基づいて判定される
      expect(environmentDetection.isSuitableForMeasurement.value).toBe(true)
    })
  })

  describe('startEnvironmentDetection', () => {
    it('環境検出を正常に開始する', async () => {
      // モックの設定
      mockAudioAnalyzer.checkBrowserSupport.mockReturnValue(true)
      mockAudioAnalyzer.requestMicrophonePermission.mockResolvedValue(true)
      mockAudioAnalyzer.initializeAudioContext.mockResolvedValue(true)
      mockAudioAnalyzer.audioState.isSupported = true
      mockAudioAnalyzer.audioState.hasPermission = true
      mockAudioAnalyzer.audioState.isInitialized = true

      const result = await environmentDetection.startEnvironmentDetection()

      expect(result).toBe(true)
      expect(environmentDetection.environmentState.isDetecting).toBe(false)
      expect(environmentDetection.environmentState.hasDetected).toBe(true)
      expect(environmentDetection.environmentState.status).toBeDefined()
    })

    it('ブラウザサポートエラーの場合、エラーを返す', async () => {
      mockAudioAnalyzer.checkBrowserSupport.mockReturnValue(false)
      mockAudioAnalyzer.audioState.isSupported = false

      const result = await environmentDetection.startEnvironmentDetection()

      expect(result).toBe(false)
      expect(environmentDetection.environmentState.error).toBe(
        'ブラウザがWeb Audio APIに対応していません',
      )
    })

    it('マイク権限エラーの場合、エラーを返す', async () => {
      mockAudioAnalyzer.checkBrowserSupport.mockReturnValue(true)
      mockAudioAnalyzer.requestMicrophonePermission.mockResolvedValue(false)
      mockAudioAnalyzer.audioState.isSupported = true
      mockAudioAnalyzer.audioState.hasPermission = false

      const result = await environmentDetection.startEnvironmentDetection()

      expect(result).toBe(false)
      expect(environmentDetection.environmentState.error).toBe(
        'マイクアクセス権限が必要です',
      )
    })

    it('Audio Context初期化エラーの場合、エラーを返す', async () => {
      mockAudioAnalyzer.checkBrowserSupport.mockReturnValue(true)
      mockAudioAnalyzer.requestMicrophonePermission.mockResolvedValue(true)
      mockAudioAnalyzer.initializeAudioContext.mockResolvedValue(false)
      mockAudioAnalyzer.audioState.isSupported = true
      mockAudioAnalyzer.audioState.hasPermission = true
      mockAudioAnalyzer.audioState.isInitialized = false

      const result = await environmentDetection.startEnvironmentDetection()

      expect(result).toBe(false)
      expect(environmentDetection.environmentState.error).toBe(
        'オーディオシステムの初期化に失敗しました',
      )
    })
  })

  describe('環境評価', () => {
    it('非常に静かな環境を正しく評価する', async () => {
      // 非常に静かな環境データを設定
      mockAudioAnalyzer.checkBrowserSupport.mockReturnValue(true)
      mockAudioAnalyzer.requestMicrophonePermission.mockResolvedValue(true)
      mockAudioAnalyzer.initializeAudioContext.mockResolvedValue(true)
      mockAudioAnalyzer.collectAudioData.mockResolvedValue([
        { averageLevel: -55, maxLevel: -40, timestamp: Date.now() },
      ])
      mockAudioAnalyzer.audioState.isSupported = true
      mockAudioAnalyzer.audioState.hasPermission = true
      mockAudioAnalyzer.audioState.isInitialized = true

      await environmentDetection.startEnvironmentDetection()

      const status = environmentDetection.environmentState.status
      expect(status?.recommendation).toBe('excellent')
      expect(status?.isQuiet).toBe(true)
      expect(status?.message).toContain('非常に静かな環境です')
    })

    it('静かな環境を正しく評価する', async () => {
      // 静かな環境データを設定
      mockAudioAnalyzer.checkBrowserSupport.mockReturnValue(true)
      mockAudioAnalyzer.requestMicrophonePermission.mockResolvedValue(true)
      mockAudioAnalyzer.initializeAudioContext.mockResolvedValue(true)
      mockAudioAnalyzer.collectAudioData.mockResolvedValue([
        { averageLevel: -45, maxLevel: -30, timestamp: Date.now() },
      ])
      mockAudioAnalyzer.audioState.isSupported = true
      mockAudioAnalyzer.audioState.hasPermission = true
      mockAudioAnalyzer.audioState.isInitialized = true

      await environmentDetection.startEnvironmentDetection()

      const status = environmentDetection.environmentState.status
      expect(status?.recommendation).toBe('good')
      expect(status?.isQuiet).toBe(true)
      expect(status?.message).toContain('静かな環境です')
    })

    it('注意が必要な環境を正しく評価する', async () => {
      // やや騒音がある環境データを設定
      mockAudioAnalyzer.checkBrowserSupport.mockReturnValue(true)
      mockAudioAnalyzer.requestMicrophonePermission.mockResolvedValue(true)
      mockAudioAnalyzer.initializeAudioContext.mockResolvedValue(true)
      mockAudioAnalyzer.collectAudioData.mockResolvedValue([
        { averageLevel: -35, maxLevel: -20, timestamp: Date.now() },
      ])
      mockAudioAnalyzer.audioState.isSupported = true
      mockAudioAnalyzer.audioState.hasPermission = true
      mockAudioAnalyzer.audioState.isInitialized = true

      await environmentDetection.startEnvironmentDetection()

      const status = environmentDetection.environmentState.status
      expect(status?.recommendation).toBe('caution')
      expect(status?.isQuiet).toBe(false)
      expect(status?.message).toContain('やや騒音があります')
    })

    it('測定困難な環境を正しく評価する', async () => {
      // 騒音が多い環境データを設定
      mockAudioAnalyzer.checkBrowserSupport.mockReturnValue(true)
      mockAudioAnalyzer.requestMicrophonePermission.mockResolvedValue(true)
      mockAudioAnalyzer.initializeAudioContext.mockResolvedValue(true)
      mockAudioAnalyzer.collectAudioData.mockResolvedValue([
        { averageLevel: -25, maxLevel: -10, timestamp: Date.now() },
      ])
      mockAudioAnalyzer.audioState.isSupported = true
      mockAudioAnalyzer.audioState.hasPermission = true
      mockAudioAnalyzer.audioState.isInitialized = true

      await environmentDetection.startEnvironmentDetection()

      const status = environmentDetection.environmentState.status
      expect(status?.recommendation).toBe('poor')
      expect(status?.isQuiet).toBe(false)
      expect(status?.message).toContain('騒音が多い環境です')
    })
  })

  describe('getRecommendationText', () => {
    it('推奨レベルの説明文を正しく返す', async () => {
      // excellent環境を設定
      mockAudioAnalyzer.checkBrowserSupport.mockReturnValue(true)
      mockAudioAnalyzer.requestMicrophonePermission.mockResolvedValue(true)
      mockAudioAnalyzer.initializeAudioContext.mockResolvedValue(true)
      mockAudioAnalyzer.collectAudioData.mockResolvedValue([
        { averageLevel: -55, maxLevel: -40, timestamp: Date.now() },
      ])
      mockAudioAnalyzer.audioState.isSupported = true
      mockAudioAnalyzer.audioState.hasPermission = true
      mockAudioAnalyzer.audioState.isInitialized = true

      await environmentDetection.startEnvironmentDetection()

      expect(environmentDetection.getRecommendationText.value).toBe(
        '🟢 最適な環境',
      )
    })
  })

  describe('getImprovementAdvice', () => {
    it('環境改善のアドバイスを正しく返す', async () => {
      // excellent環境を設定
      mockAudioAnalyzer.checkBrowserSupport.mockReturnValue(true)
      mockAudioAnalyzer.requestMicrophonePermission.mockResolvedValue(true)
      mockAudioAnalyzer.initializeAudioContext.mockResolvedValue(true)
      mockAudioAnalyzer.collectAudioData.mockResolvedValue([
        { averageLevel: -55, maxLevel: -40, timestamp: Date.now() },
      ])
      mockAudioAnalyzer.audioState.isSupported = true
      mockAudioAnalyzer.audioState.hasPermission = true
      mockAudioAnalyzer.audioState.isInitialized = true

      await environmentDetection.startEnvironmentDetection()

      const advice = environmentDetection.getImprovementAdvice.value
      expect(Array.isArray(advice)).toBe(true)
      expect(advice).toContain('そのまま測定を開始できます')
    })

    it('推奨レベルに応じて適切なアドバイスを返す', async () => {
      // poor環境を設定
      mockAudioAnalyzer.checkBrowserSupport.mockReturnValue(true)
      mockAudioAnalyzer.requestMicrophonePermission.mockResolvedValue(true)
      mockAudioAnalyzer.initializeAudioContext.mockResolvedValue(true)
      mockAudioAnalyzer.collectAudioData.mockResolvedValue([
        { averageLevel: -25, maxLevel: -10, timestamp: Date.now() },
      ])
      mockAudioAnalyzer.audioState.isSupported = true
      mockAudioAnalyzer.audioState.hasPermission = true
      mockAudioAnalyzer.audioState.isInitialized = true

      await environmentDetection.startEnvironmentDetection()

      const advice = environmentDetection.getImprovementAdvice.value
      expect(advice).toContain('静かな部屋に移動してください')
    })
  })

  describe('resetDetection', () => {
    it('検出状態を正しくリセットする', () => {
      // 状態を設定
      // @ts-expect-error - accessing private state for testing
      environmentDetection.environmentState.hasDetected = true
      // @ts-expect-error - accessing private state for testing
      environmentDetection.environmentState.status = {
        isQuiet: true,
        averageLevel: -45,
        recommendation: 'good',
        message: '静かな環境です',
      }

      environmentDetection.resetDetection()

      expect(environmentDetection.environmentState.hasDetected).toBe(false)
      expect(environmentDetection.environmentState.status).toBeNull()
      expect(environmentDetection.environmentState.error).toBeNull()
    })
  })

  describe('ENVIRONMENT_THRESHOLDS', () => {
    it('環境判定の閾値が正しく設定されている', () => {
      expect(environmentDetection.ENVIRONMENT_THRESHOLDS.excellent).toBe(-50)
      expect(environmentDetection.ENVIRONMENT_THRESHOLDS.good).toBe(-40)
      expect(environmentDetection.ENVIRONMENT_THRESHOLDS.caution).toBe(-30)
      expect(environmentDetection.ENVIRONMENT_THRESHOLDS.poor).toBe(-30)
    })
  })
})

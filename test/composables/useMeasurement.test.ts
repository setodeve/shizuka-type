import type { Mock } from 'vitest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useMeasurement } from '~/composables/useMeasurement'

// useAudioAnalyzerのモック
vi.mock('~/composables/useAudioAnalyzer', () => ({
  useAudioAnalyzer: vi.fn(),
}))

describe('useMeasurement', () => {
  let measurement: ReturnType<typeof useMeasurement>
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

    measurement = useMeasurement()
  })

  describe('初期状態', () => {
    it('初期状態が正しく設定される', () => {
      expect(measurement.measurementState.phase).toBe('idle')
      expect(measurement.measurementState.timeRemaining).toBe(0)
      expect(measurement.measurementState.progress).toBe(0)
      expect(measurement.measurementState.message).toBe('')
      expect(measurement.measurementResult.value).toBeNull()
    })

    it('isActiveが正しく計算される', async () => {
      // 初期状態では false（phase が 'idle'）
      expect(measurement.isActive.value).toBe(false)

      // 実際に測定を開始してisActiveが正しく動作することを確認
      mockAudioAnalyzer.checkBrowserSupport.mockReturnValue(true)
      mockAudioAnalyzer.requestMicrophonePermission.mockResolvedValue(true)
      mockAudioAnalyzer.initializeAudioContext.mockResolvedValue(true)
      mockAudioAnalyzer.audioState.isSupported = true
      mockAudioAnalyzer.audioState.hasPermission = true
      mockAudioAnalyzer.audioState.isInitialized = true

      await measurement.startMeasurement()

      // 測定が開始されている状態ではtrueになる
      expect(measurement.isActive.value).toBe(true)
      expect(['preparing', 'baseline', 'typing', 'processing']).toContain(
        measurement.measurementState.phase,
      )
    })

    it('phaseMessageが正しく計算される', async () => {
      // 初期状態（idle）のメッセージ
      expect(measurement.phaseMessage.value).toBe(
        '測定を開始する準備ができています',
      )

      // 測定を開始してフェーズの変化とメッセージを確認
      mockAudioAnalyzer.checkBrowserSupport.mockReturnValue(true)
      mockAudioAnalyzer.requestMicrophonePermission.mockResolvedValue(true)
      mockAudioAnalyzer.initializeAudioContext.mockResolvedValue(true)
      mockAudioAnalyzer.audioState.isSupported = true
      mockAudioAnalyzer.audioState.hasPermission = true
      mockAudioAnalyzer.audioState.isInitialized = true

      await measurement.startMeasurement()

      // baseline フェーズのメッセージを確認（測定開始後）
      expect(measurement.measurementState.phase).toBe('baseline')
      expect(measurement.phaseMessage.value).toBe(
        '環境音を測定しています。静かにお待ちください',
      )
    })
  })

  describe('startMeasurement', () => {
    it('測定を正常に開始する', async () => {
      // モックの設定
      mockAudioAnalyzer.checkBrowserSupport.mockReturnValue(true)
      mockAudioAnalyzer.requestMicrophonePermission.mockResolvedValue(true)
      mockAudioAnalyzer.initializeAudioContext.mockResolvedValue(true)
      mockAudioAnalyzer.audioState.isSupported = true
      mockAudioAnalyzer.audioState.hasPermission = true
      mockAudioAnalyzer.audioState.isInitialized = true

      const result = await measurement.startMeasurement()

      expect(result).toBe(true)
      expect(measurement.measurementState.phase).toBe('baseline')
    })

    it('ブラウザサポートエラーの場合、エラー状態になる', async () => {
      mockAudioAnalyzer.checkBrowserSupport.mockReturnValue(false)
      mockAudioAnalyzer.audioState.isSupported = false

      const result = await measurement.startMeasurement()

      expect(result).toBe(false)
      expect(measurement.measurementState.phase).toBe('error')
      expect(measurement.measurementState.message).toContain(
        'ブラウザがサポートされていません',
      )
    })

    it('マイク権限エラーの場合、エラー状態になる', async () => {
      mockAudioAnalyzer.checkBrowserSupport.mockReturnValue(true)
      mockAudioAnalyzer.requestMicrophonePermission.mockResolvedValue(false)
      mockAudioAnalyzer.audioState.isSupported = true
      mockAudioAnalyzer.audioState.hasPermission = false

      const result = await measurement.startMeasurement()

      expect(result).toBe(false)
      expect(measurement.measurementState.phase).toBe('error')
      expect(measurement.measurementState.message).toContain(
        'マイクアクセス権限が必要です',
      )
    })
  })

  describe('測定のキャンセルとリセット', () => {
    it('測定をキャンセルする', () => {
      // @ts-expect-error - accessing private state for testing
      measurement.measurementState.phase = 'typing'
      measurement.cancelMeasurement()

      expect(measurement.measurementState.phase).toBe('idle')
      expect(measurement.measurementState.message).toBe('')
    })

    it('測定をリセットする', () => {
      // @ts-expect-error - accessing private state for testing
      measurement.measurementState.phase = 'completed'
      measurement.resetMeasurement()

      expect(measurement.measurementState.phase).toBe('idle')
      expect(measurement.measurementResult.value).toBeNull()
      expect(mockAudioAnalyzer.cleanup).toHaveBeenCalled()
    })
  })

  describe('JUDGMENT_THRESHOLDS', () => {
    it('判定閾値が正しく設定されている', () => {
      expect(measurement.JUDGMENT_THRESHOLDS.quiet).toEqual({ min: 0, max: 5 })
      expect(measurement.JUDGMENT_THRESHOLDS.normal).toEqual({
        min: 6,
        max: 12,
      })
      expect(measurement.JUDGMENT_THRESHOLDS.loud).toEqual({
        min: 13,
        max: Infinity,
      })
    })
  })
})

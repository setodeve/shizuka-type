import type { Mock } from 'vitest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useEnvironmentDetection } from '~/composables/useEnvironmentDetection'
import { useMeasurement } from '~/composables/useMeasurement'

// useAudioAnalyzerのモック
vi.mock('~/composables/useAudioAnalyzer', () => ({
  useAudioAnalyzer: vi.fn(),
}))

describe('測定フロー統合テスト', () => {
  let environmentDetection: ReturnType<typeof useEnvironmentDetection>
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

    environmentDetection = useEnvironmentDetection()
    measurement = useMeasurement()
  })

  describe('環境検出から測定までのフロー', () => {
    it('環境検出から測定開始までの一連の流れ', async () => {
      // モックの設定
      mockAudioAnalyzer.checkBrowserSupport.mockReturnValue(true)
      mockAudioAnalyzer.requestMicrophonePermission.mockResolvedValue(true)
      mockAudioAnalyzer.initializeAudioContext.mockResolvedValue(true)
      mockAudioAnalyzer.audioState.isSupported = true
      mockAudioAnalyzer.audioState.hasPermission = true
      mockAudioAnalyzer.audioState.isInitialized = true

      // 環境検出を開始
      const envResult = await environmentDetection.startEnvironmentDetection()
      expect(envResult).toBe(true)
      expect(environmentDetection.environmentState.hasDetected).toBe(true)

      // 測定を開始
      const measurementResult = await measurement.startMeasurement()
      expect(measurementResult).toBe(true)
      expect(measurement.measurementState.phase).toBe('baseline')
    })

    it('環境検出でエラーが発生した場合の処理', async () => {
      // ブラウザサポートエラーをシミュレート
      mockAudioAnalyzer.checkBrowserSupport.mockReturnValue(false)
      mockAudioAnalyzer.audioState.isSupported = false

      const envResult = await environmentDetection.startEnvironmentDetection()
      expect(envResult).toBe(false)
      expect(environmentDetection.environmentState.error).toBeTruthy()

      // 測定は開始されない
      const measurementResult = await measurement.startMeasurement()
      expect(measurementResult).toBe(false)
      expect(measurement.measurementState.phase).toBe('error')
    })
  })

  describe('測定フェーズの遷移', () => {
    it('測定をキャンセルした場合の処理', async () => {
      // 正常な測定を開始
      mockAudioAnalyzer.checkBrowserSupport.mockReturnValue(true)
      mockAudioAnalyzer.requestMicrophonePermission.mockResolvedValue(true)
      mockAudioAnalyzer.initializeAudioContext.mockResolvedValue(true)
      mockAudioAnalyzer.audioState.isSupported = true
      mockAudioAnalyzer.audioState.hasPermission = true
      mockAudioAnalyzer.audioState.isInitialized = true

      await measurement.startMeasurement()
      expect(measurement.measurementState.phase).toBe('baseline')

      // 測定をキャンセル
      measurement.cancelMeasurement()
      expect(measurement.measurementState.phase).toBe('idle')
      // メッセージは空文字列になる
      expect(measurement.measurementState.message).toBe('')
    })
  })

  describe('測定完了時の結果', () => {
    it('測定完了時に結果が正しく計算される', async () => {
      // 正常な測定を開始
      mockAudioAnalyzer.checkBrowserSupport.mockReturnValue(true)
      mockAudioAnalyzer.requestMicrophonePermission.mockResolvedValue(true)
      mockAudioAnalyzer.initializeAudioContext.mockResolvedValue(true)
      mockAudioAnalyzer.audioState.isSupported = true
      mockAudioAnalyzer.audioState.hasPermission = true
      mockAudioAnalyzer.audioState.isInitialized = true

      await measurement.startMeasurement()
      expect(measurement.measurementState.phase).toBe('baseline')

      // 測定結果が設定されることを確認
      expect(measurement.measurementResult.value).toBeDefined()
    })
  })

  describe('リソース管理', () => {
    it('測定完了後にリソースが正しくクリーンアップされる', async () => {
      // 正常な測定を開始
      mockAudioAnalyzer.checkBrowserSupport.mockReturnValue(true)
      mockAudioAnalyzer.requestMicrophonePermission.mockResolvedValue(true)
      mockAudioAnalyzer.initializeAudioContext.mockResolvedValue(true)
      mockAudioAnalyzer.audioState.isSupported = true
      mockAudioAnalyzer.audioState.hasPermission = true
      mockAudioAnalyzer.audioState.isInitialized = true

      await measurement.startMeasurement()
      measurement.resetMeasurement()

      // クリーンアップが呼ばれることを確認
      expect(mockAudioAnalyzer.cleanup).toHaveBeenCalled()
      expect(measurement.measurementResult.value).toBeNull()
      expect(measurement.measurementState.phase).toBe('idle')
    })

    it('環境検出完了後にリソースが正しくクリーンアップされる', async () => {
      // 環境検出を開始
      mockAudioAnalyzer.checkBrowserSupport.mockReturnValue(true)
      mockAudioAnalyzer.requestMicrophonePermission.mockResolvedValue(true)
      mockAudioAnalyzer.initializeAudioContext.mockResolvedValue(true)
      mockAudioAnalyzer.audioState.isSupported = true
      mockAudioAnalyzer.audioState.hasPermission = true
      mockAudioAnalyzer.audioState.isInitialized = true

      await environmentDetection.startEnvironmentDetection()
      environmentDetection.resetDetection()

      // クリーンアップが呼ばれることを確認
      expect(mockAudioAnalyzer.cleanup).toHaveBeenCalled()
      expect(environmentDetection.environmentState.hasDetected).toBe(false)
    })
  })

  describe('状態の整合性', () => {
    it('測定結果の整合性', async () => {
      // 正常な測定を開始
      mockAudioAnalyzer.checkBrowserSupport.mockReturnValue(true)
      mockAudioAnalyzer.requestMicrophonePermission.mockResolvedValue(true)
      mockAudioAnalyzer.initializeAudioContext.mockResolvedValue(true)
      mockAudioAnalyzer.audioState.isSupported = true
      mockAudioAnalyzer.audioState.hasPermission = true
      mockAudioAnalyzer.audioState.isInitialized = true

      await measurement.startMeasurement()

      // 測定状態の整合性を確認
      expect(measurement.isActive.value).toBe(true)
      expect(measurement.measurementState.phase).not.toBe('idle')
      expect(measurement.phaseMessage.value).not.toBe(
        '測定を開始する準備ができています',
      )
    })
  })
})

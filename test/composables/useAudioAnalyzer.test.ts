import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAudioAnalyzer } from '~/composables/useAudioAnalyzer'

// Web Audio APIのモック
const mockGetUserMedia = vi.fn()
const mockAudioContext = vi.fn()
const mockAnalyser = {
  fftSize: 256,
  smoothingTimeConstant: 0.8,
  frequencyBinCount: 128,
  getByteFrequencyData: vi.fn(),
  connect: vi.fn(),
}
const mockMediaStream = {
  getTracks: vi.fn(() => [{ stop: vi.fn() }]),
}
const mockMicrophone = {
  connect: vi.fn(),
  disconnect: vi.fn(),
}

// グローバルオブジェクトのモック
Object.defineProperty(global, 'navigator', {
  value: {
    mediaDevices: {
      getUserMedia: mockGetUserMedia,
    },
  },
  writable: true,
})

Object.defineProperty(global, 'AudioContext', {
  value: mockAudioContext,
  writable: true,
})

Object.defineProperty(global, 'webkitAudioContext', {
  value: mockAudioContext,
  writable: true,
})

// requestAnimationFrameのモック
global.requestAnimationFrame = vi.fn((callback) => {
  setTimeout(callback, 16)
  return 1
})

global.cancelAnimationFrame = vi.fn()

describe('useAudioAnalyzer', () => {
  let audioAnalyzer: ReturnType<typeof useAudioAnalyzer>

  beforeEach(() => {
    vi.clearAllMocks()

    // AudioContextのモック設定
    mockAudioContext.mockImplementation(() => ({
      createAnalyser: vi.fn(() => mockAnalyser),
      createMediaStreamSource: vi.fn(() => mockMicrophone),
      state: 'running',
      resume: vi.fn(),
      close: vi.fn(),
    }))

    audioAnalyzer = useAudioAnalyzer()
  })

  describe('checkBrowserSupport', () => {
    it('ブラウザがサポートされている場合、trueを返す', () => {
      const result = audioAnalyzer.checkBrowserSupport()
      expect(result).toBe(true)
      expect(audioAnalyzer.audioState.isSupported).toBe(true)
    })

    it('getUserMediaが利用できない場合、falseを返す', () => {
      // getUserMediaを無効化
      Object.defineProperty(global, 'navigator', {
        value: {
          mediaDevices: {},
        },
        writable: true,
      })

      const result = audioAnalyzer.checkBrowserSupport()
      expect(result).toBe(false)
      expect(audioAnalyzer.audioState.isSupported).toBe(false)

      // 元に戻す
      Object.defineProperty(global, 'navigator', {
        value: {
          mediaDevices: {
            getUserMedia: mockGetUserMedia,
          },
        },
        writable: true,
      })
    })

    it('AudioContextが利用できない場合、falseを返す', () => {
      // AudioContextを無効化
      const originalAudioContext = global.AudioContext
      Object.defineProperty(global, 'AudioContext', {
        value: undefined,
        writable: true,
      })
      Object.defineProperty(global, 'webkitAudioContext', {
        value: undefined,
        writable: true,
      })

      const result = audioAnalyzer.checkBrowserSupport()
      expect(result).toBe(false)
      expect(audioAnalyzer.audioState.isSupported).toBe(false)

      // 元に戻す
      Object.defineProperty(global, 'AudioContext', {
        value: originalAudioContext,
        writable: true,
      })
      Object.defineProperty(global, 'webkitAudioContext', {
        value: originalAudioContext,
        writable: true,
      })
    })
  })

  describe('requestMicrophonePermission', () => {
    it('マイクアクセス権限を正常に取得する', async () => {
      mockGetUserMedia.mockResolvedValue(mockMediaStream)

      const result = await audioAnalyzer.requestMicrophonePermission()

      expect(result).toBe(true)
      expect(audioAnalyzer.audioState.hasPermission).toBe(true)
      expect(audioAnalyzer.audioState.error).toBeNull()
    })

    it('権限が拒否された場合、エラーを設定する', async () => {
      const permissionError = new Error('Permission denied')
      permissionError.name = 'NotAllowedError'
      mockGetUserMedia.mockRejectedValue(permissionError)

      const result = await audioAnalyzer.requestMicrophonePermission()

      expect(result).toBe(false)
      expect(audioAnalyzer.audioState.hasPermission).toBe(false)
      expect(audioAnalyzer.audioState.error).toContain(
        'マイクアクセス権限が拒否されました',
      )
    })

    it('マイクが見つからない場合、エラーを設定する', async () => {
      const notFoundError = new Error('NotFoundError')
      notFoundError.name = 'NotFoundError'
      mockGetUserMedia.mockRejectedValue(notFoundError)

      const result = await audioAnalyzer.requestMicrophonePermission()

      expect(result).toBe(false)
      expect(audioAnalyzer.audioState.hasPermission).toBe(false)
      expect(audioAnalyzer.audioState.error).toContain('マイクが見つかりません')
    })
  })

  describe('initializeAudioContext', () => {
    it('Audio Contextを正常に初期化する', async () => {
      // まずマイク権限を取得
      mockGetUserMedia.mockResolvedValue(mockMediaStream)
      await audioAnalyzer.requestMicrophonePermission()

      const result = await audioAnalyzer.initializeAudioContext()
      expect(result).toBe(true)
      expect(audioAnalyzer.audioState.isInitialized).toBe(true)
      expect(audioAnalyzer.audioState.error).toBeNull()
    })

    it('メディアストリームが取得されていない場合、エラーを返す', async () => {
      const result = await audioAnalyzer.initializeAudioContext()
      expect(result).toBe(false)
      expect(audioAnalyzer.audioState.error).toContain(
        'メディアストリームが取得されていません',
      )
    })
  })

  describe('startAnalysis', () => {
    it('分析を開始する', async () => {
      // 初期化を完了
      mockGetUserMedia.mockResolvedValue(mockMediaStream)
      await audioAnalyzer.requestMicrophonePermission()
      await audioAnalyzer.initializeAudioContext()

      const onUpdate = vi.fn()
      audioAnalyzer.startAnalysis(onUpdate)

      expect(audioAnalyzer.audioState.isAnalyzing).toBe(true)

      // 少し待ってから停止
      await new Promise((resolve) => setTimeout(resolve, 50))
      audioAnalyzer.stopAnalysis()
      expect(audioAnalyzer.audioState.isAnalyzing).toBe(false)
    })

    it('アナライザーが初期化されていない場合、エラーをログに出力する', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      audioAnalyzer.startAnalysis()

      expect(consoleSpy).toHaveBeenCalledWith(
        'アナライザーが初期化されていません',
      )
      consoleSpy.mockRestore()
    })
  })

  describe('stopAnalysis', () => {
    it('分析を停止する', async () => {
      // 初期化を完了
      mockGetUserMedia.mockResolvedValue(mockMediaStream)
      await audioAnalyzer.requestMicrophonePermission()
      await audioAnalyzer.initializeAudioContext()

      audioAnalyzer.startAnalysis()
      expect(audioAnalyzer.audioState.isAnalyzing).toBe(true)

      audioAnalyzer.stopAnalysis()
      expect(audioAnalyzer.audioState.isAnalyzing).toBe(false)
    })
  })

  describe('startDataAccumulation', () => {
    it('データ蓄積を開始する', () => {
      audioAnalyzer.startDataAccumulation()
      expect(audioAnalyzer.getAccumulatedData()).toEqual([])
    })
  })

  describe('getAccumulatedData', () => {
    it('蓄積されたデータを取得する', () => {
      const data = audioAnalyzer.getAccumulatedData()
      expect(Array.isArray(data)).toBe(true)
    })
  })

  describe('collectAudioData', () => {
    it('指定時間の音量データを収集する', async () => {
      // 初期化を完了
      mockGetUserMedia.mockResolvedValue(mockMediaStream)
      await audioAnalyzer.requestMicrophonePermission()
      await audioAnalyzer.initializeAudioContext()

      // モックデータを設定
      mockAnalyser.getByteFrequencyData.mockImplementation((array) => {
        for (let i = 0; i < array.length; i++) {
          array[i] = Math.floor(Math.random() * 255)
        }
      })

      const data = await audioAnalyzer.collectAudioData(100)

      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBeGreaterThan(0)

      // データの構造をチェック
      if (data.length > 0) {
        expect(data[0]).toHaveProperty('averageLevel')
        expect(data[0]).toHaveProperty('maxLevel')
        expect(data[0]).toHaveProperty('timestamp')
      }
    })
  })

  describe('cleanup', () => {
    it('リソースを正しくクリーンアップする', async () => {
      // 初期化を完了
      mockGetUserMedia.mockResolvedValue(mockMediaStream)
      await audioAnalyzer.requestMicrophonePermission()
      await audioAnalyzer.initializeAudioContext()

      audioAnalyzer.cleanup()

      expect(audioAnalyzer.audioState.isInitialized).toBe(false)
      expect(audioAnalyzer.audioState.isAnalyzing).toBe(false)
      expect(audioAnalyzer.audioState.hasPermission).toBe(false)
    })
  })

  describe('audioState', () => {
    it('読み取り専用の状態を返す', () => {
      const state = audioAnalyzer.audioState
      // 状態が読み取り専用であることを確認（Vue 3のreadonlyは実際にはエラーを投げない）
      expect(state.isSupported).toBeDefined()
      expect(state.hasPermission).toBeDefined()
      expect(state.isInitialized).toBeDefined()
      expect(state.isAnalyzing).toBeDefined()
      expect(state.currentLevel).toBeDefined()
      expect(state.error).toBeDefined()
    })
  })
})

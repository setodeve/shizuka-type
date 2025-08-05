import { reactive, readonly, ref } from 'vue'

export interface AudioAnalysisResult {
  averageLevel: number
  maxLevel: number
  timestamp: number
}

export interface MeasurementSettings {
  sampleRate: number
  fftSize: number
  smoothingTimeConstant: number
}

export interface AudioState {
  isSupported: boolean
  hasPermission: boolean
  isInitialized: boolean
  isAnalyzing: boolean
  currentLevel: number
  error: string | null
}

export const useAudioAnalyzer = () => {
  const audioState = reactive<AudioState>({
    isSupported: false,
    hasPermission: false,
    isInitialized: false,
    isAnalyzing: false,
    currentLevel: 0,
    error: null,
  })

  const analysisResults = ref<AudioAnalysisResult[]>([])

  let audioContext: AudioContext | null = null
  let analyser: AnalyserNode | null = null
  let microphone: MediaStreamAudioSourceNode | null = null
  let mediaStream: MediaStream | null = null
  let animationFrame: number | null = null

  const defaultSettings: MeasurementSettings = {
    sampleRate: 44100,
    fftSize: 256,
    smoothingTimeConstant: 0.8,
  }

  // ブラウザサポートチェック
  const checkBrowserSupport = (): boolean => {
    try {
      const hasGetUserMedia = !!navigator.mediaDevices?.getUserMedia
      const hasAudioContext = !!(
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      )

      audioState.isSupported = hasGetUserMedia && hasAudioContext
      return audioState.isSupported
    } catch (error) {
      console.error('Browser support check failed:', error)
      audioState.error = 'ブラウザがWeb Audio APIに対応していません'
      return false
    }
  }

  // マイクアクセス権限を要求
  const requestMicrophonePermission = async (): Promise<boolean> => {
    try {
      audioState.error = null

      if (!checkBrowserSupport()) {
        return false
      }

      // マイクストリームを取得
      mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
          sampleRate: defaultSettings.sampleRate,
        },
      })

      audioState.hasPermission = true
      return true
    } catch (error: unknown) {
      console.error('Microphone permission error:', error)

      if (error instanceof Error) {
        if (
          error.name === 'NotAllowedError' ||
          error.name === 'PermissionDeniedError'
        ) {
          audioState.error =
            'マイクアクセス権限が拒否されました。ブラウザの設定からマイクアクセスを許可してください。'
        } else if (error.name === 'NotFoundError') {
          audioState.error =
            'マイクが見つかりません。マイクが接続されているか確認してください。'
        } else {
          audioState.error = `マイクアクセスエラー: ${error.message}`
        }
      } else {
        audioState.error = 'マイクアクセスエラーが発生しました'
      }

      audioState.hasPermission = false
      return false
    }
  }

  // Audio Contextとアナライザーを初期化
  const initializeAudioContext = async (): Promise<boolean> => {
    try {
      if (!mediaStream) {
        throw new Error('メディアストリームが取得されていません')
      }

      // AudioContext作成
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      audioContext = new AudioContextClass()

      // AudioContextが停止している場合は再開
      if (audioContext.state === 'suspended') {
        await audioContext.resume()
      }

      // アナライザーノード作成
      analyser = audioContext.createAnalyser()
      analyser.fftSize = defaultSettings.fftSize
      analyser.smoothingTimeConstant = defaultSettings.smoothingTimeConstant

      // マイクをアナライザーに接続
      microphone = audioContext.createMediaStreamSource(mediaStream)
      microphone.connect(analyser)

      audioState.isInitialized = true
      return true
    } catch (error: unknown) {
      console.error('Audio context initialization error:', error)
      audioState.error =
        error instanceof Error
          ? `音声コンテキストの初期化エラー: ${error.message}`
          : '音声コンテキストの初期化エラーが発生しました'
      return false
    }
  }

  // 音量レベルを計算（dB単位）
  const calculateDecibelLevel = (dataArray: Uint8Array): number => {
    let sum = 0
    for (let i = 0; i < dataArray.length; i++) {
      sum += (dataArray[i] ?? 0) * (dataArray[i] ?? 0)
    }

    const rms = Math.sqrt(sum / dataArray.length)
    const db = 20 * Math.log10(rms / 128.0)

    // -Infinityの場合は最小値を返す
    return Number.isFinite(db) ? Math.max(db, -60) : -60
  }

  // リアルタイム音量分析を開始
  const startAnalysis = (onUpdate?: (level: number) => void) => {
    if (!analyser || !audioState.isInitialized) {
      console.error('アナライザーが初期化されていません')
      return
    }

    audioState.isAnalyzing = true
    const dataArray = new Uint8Array(analyser.frequencyBinCount)

    const analyze = () => {
      if (!audioState.isAnalyzing || !analyser) return

      analyser.getByteFrequencyData(dataArray)
      const currentLevel = calculateDecibelLevel(dataArray)

      audioState.currentLevel = currentLevel
      onUpdate?.(currentLevel)

      animationFrame = requestAnimationFrame(analyze)
    }

    analyze()
  }

  // 指定時間の音量データを収集
  const collectAudioData = async (
    durationMs: number,
  ): Promise<AudioAnalysisResult[]> => {
    return new Promise((resolve) => {
      const results: AudioAnalysisResult[] = []
      const startTime = Date.now()
      const collectInterval = 150 // 150ms間隔でデータ収集

      const collectData = () => {
        const elapsedTime = Date.now() - startTime

        if (elapsedTime >= durationMs) {
          resolve(results)
          return
        }

        if (analyser) {
          const dataArray = new Uint8Array(analyser.frequencyBinCount)
          analyser.getByteFrequencyData(dataArray)

          const level = calculateDecibelLevel(dataArray)
          results.push({
            averageLevel: level,
            maxLevel: level,
            timestamp: elapsedTime,
          })
        }

        setTimeout(collectData, collectInterval)
      }

      collectData()
    })
  }

  // 分析停止
  const stopAnalysis = () => {
    audioState.isAnalyzing = false

    if (animationFrame) {
      cancelAnimationFrame(animationFrame)
      animationFrame = null
    }
  }

  // リソースクリーンアップ
  const cleanup = () => {
    stopAnalysis()

    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop())
      mediaStream = null
    }

    if (microphone) {
      microphone.disconnect()
      microphone = null
    }

    if (audioContext && audioContext.state !== 'closed') {
      audioContext.close()
      audioContext = null
    }

    analyser = null

    // 状態リセット
    audioState.hasPermission = false
    audioState.isInitialized = false
    audioState.isAnalyzing = false
    audioState.currentLevel = 0
    audioState.error = null
  }

  // 初期化時にブラウザサポートをチェック
  checkBrowserSupport()

  return {
    audioState: readonly(audioState),
    analysisResults,
    checkBrowserSupport,
    requestMicrophonePermission,
    initializeAudioContext,
    startAnalysis,
    stopAnalysis,
    collectAudioData,
    cleanup,
  }
}

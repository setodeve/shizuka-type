import { vi } from 'vitest'

// Web Audio APIのモック
global.AudioContext = vi.fn().mockImplementation(() => ({
  createAnalyser: vi.fn().mockReturnValue({
    fftSize: 256,
    smoothingTimeConstant: 0.8,
    frequencyBinCount: 128,
    getByteFrequencyData: vi.fn(),
  }),
  createMediaStreamSource: vi.fn().mockReturnValue({
    connect: vi.fn(),
    disconnect: vi.fn(),
  }),
  resume: vi.fn().mockResolvedValue(undefined),
  close: vi.fn().mockResolvedValue(undefined),
  state: 'running',
}))

// WebkitAudioContextのモック
// @ts-expect-error - adding webkit polyfill for testing
;(
  global as typeof globalThis & { webkitAudioContext: typeof AudioContext }
).webkitAudioContext = global.AudioContext

// MediaDevicesのモック
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn().mockResolvedValue({
      getTracks: () => [{ stop: vi.fn() }],
    }),
  },
  writable: true,
})

// requestAnimationFrameのモック
global.requestAnimationFrame = vi.fn((callback) => {
  setTimeout(callback, 16)
  return 1
})

global.cancelAnimationFrame = vi.fn()

// Chart.jsのモック
vi.mock('chart.js', () => ({
  Chart: vi.fn(),
  registerables: [],
}))

// Vue Chart.jsのモック
vi.mock('vue-chartjs', () => ({
  Line: vi.fn(),
  Bar: vi.fn(),
  Doughnut: vi.fn(),
  Pie: vi.fn(),
  Radar: vi.fn(),
  PolarArea: vi.fn(),
  Bubble: vi.fn(),
  Scatter: vi.fn(),
}))

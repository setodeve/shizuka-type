<script setup lang="ts">
import {
  CategoryScale,
  type ChartData,
  Chart as ChartJS,
  type ChartOptions,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js'
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import type { AudioAnalysisResult } from '~/composables/useAudioAnalyzer'

// Chart.jsのコンポーネントを登録
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

interface Props {
  data: AudioAnalysisResult[]
  baselineLevel: number
  typingThreshold: number
  title?: string
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  title: '音量推移グラフ',
  height: 300,
})

// チャートデータを準備
const chartData = computed<ChartData<'line'>>(() => {
  const labels = props.data.map((d) => `${Math.round(d.timestamp / 1000)}s`)

  return {
    labels,
    datasets: [
      {
        label: '音量レベル (dB)',
        data: props.data.map((d) => d.averageLevel),
        borderColor: 'rgb(59, 130, 246)', // blue-500
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        pointRadius: 1,
        pointHoverRadius: 4,
        fill: true,
        tension: 0.2,
      },
      {
        label: '基準値',
        data: Array(props.data.length).fill(props.baselineLevel),
        borderColor: 'rgb(156, 163, 175)', // gray-400
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderDash: [5, 5],
        pointRadius: 0,
        pointHoverRadius: 0,
        fill: false,
      },
      {
        label: 'タイピング検出閾値',
        data: Array(props.data.length).fill(props.typingThreshold),
        borderColor: 'rgb(239, 68, 68)', // red-500
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [10, 5],
        pointRadius: 0,
        pointHoverRadius: 0,
        fill: false,
      },
    ],
  }
})

// チャートオプション
const chartOptions = computed<ChartOptions<'line'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    title: {
      display: true,
      text: props.title,
      font: {
        size: 16,
        weight: 'bold',
      },
      color: '#374151', // gray-700
    },
    legend: {
      position: 'top',
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          size: 12,
        },
      },
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      borderColor: '#374151',
      borderWidth: 1,
      callbacks: {
        label: (context) => {
          const value = Number(context.parsed.y)
          return `${context.dataset.label}: ${value.toFixed(1)} dB`
        },
      },
    },
  },
  scales: {
    x: {
      display: true,
      title: {
        display: true,
        text: '時間',
        color: '#6B7280', // gray-500
        font: {
          size: 12,
          weight: 'bold',
        },
      },
      grid: {
        color: 'rgba(156, 163, 175, 0.2)', // gray-400 with opacity
        drawBorder: false,
      },
      ticks: {
        color: '#6B7280',
        font: {
          size: 11,
        },
      },
    },
    y: {
      display: true,
      title: {
        display: true,
        text: '音量 (dB)',
        color: '#6B7280',
        font: {
          size: 12,
          weight: 'bold',
        },
      },
      grid: {
        color: 'rgba(156, 163, 175, 0.2)',
        drawBorder: false,
      },
      ticks: {
        color: '#6B7280',
        font: {
          size: 11,
        },
        callback: (value) => `${Number(value).toFixed(0)} dB`,
      },
      // Y軸の範囲を動的に調整
      min: Math.min(...props.data.map((d) => d.averageLevel)) - 5,
      max: Math.max(...props.data.map((d) => d.averageLevel)) + 5,
    },
  },
  interaction: {
    mode: 'nearest',
    axis: 'x',
    intersect: false,
  },
  elements: {
    point: {
      hoverBackgroundColor: '#ffffff',
      hoverBorderWidth: 2,
    },
  },
}))

// タイピング音検出ポイントを計算
const typingEvents = computed(() => {
  return props.data.filter((d) => d.averageLevel >= props.typingThreshold)
})

// 統計情報
const statistics = computed(() => {
  if (props.data.length === 0) return null

  const levels = props.data.map((d) => d.averageLevel)
  const max = Math.max(...levels)
  const min = Math.min(...levels)
  const avg = levels.reduce((sum, level) => sum + level, 0) / levels.length

  return {
    max: max.toFixed(1),
    min: min.toFixed(1),
    avg: avg.toFixed(1),
    events: typingEvents.value.length,
  }
})
</script>

<template>
  <div class="space-y-4">
    <!-- グラフコンテナ -->
    <div 
      class="bg-white rounded-lg shadow-sm border p-4"
      :style="{ height: `${height + 60}px` }"
    >
      <Line
        v-if="data.length > 0"
        :data="chartData"
        :options="chartOptions"
      />
      
      <!-- データなしメッセージ -->
      <div 
        v-else 
        class="flex items-center justify-center h-full text-gray-500"
      >
        <div class="text-center space-y-2">
          <svg class="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
          <p class="text-sm">測定データがありません</p>
        </div>
      </div>
    </div>

    <!-- 統計情報 -->
    <div v-if="statistics" class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-blue-50 rounded-lg p-3 text-center">
        <div class="text-lg font-bold text-blue-900">{{ statistics.max }}</div>
        <div class="text-xs text-blue-600">最大音量 (dB)</div>
      </div>
      
      <div class="bg-green-50 rounded-lg p-3 text-center">
        <div class="text-lg font-bold text-green-900">{{ statistics.min }}</div>
        <div class="text-xs text-green-600">最小音量 (dB)</div>
      </div>
      
      <div class="bg-yellow-50 rounded-lg p-3 text-center">
        <div class="text-lg font-bold text-yellow-900">{{ statistics.avg }}</div>
        <div class="text-xs text-yellow-600">平均音量 (dB)</div>
      </div>
      
      <div class="bg-red-50 rounded-lg p-3 text-center">
        <div class="text-lg font-bold text-red-900">{{ statistics.events }}</div>
        <div class="text-xs text-red-600">検出イベント数</div>
      </div>
    </div>

    <!-- グラフの説明 -->
    <div class="bg-gray-50 rounded-lg p-4">
      <h4 class="font-semibold text-gray-900 mb-2">グラフの見方</h4>
      <div class="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
        <div class="flex items-center space-x-2">
          <div class="w-4 h-0.5 bg-blue-500"></div>
          <span>実際の音量推移</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-4 h-0.5 bg-gray-400 border-dashed border-t-2"></div>
          <span>環境音基準値</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-4 h-0.5 bg-red-500 border-dashed border-t-2"></div>
          <span>タイピング検出閾値</span>
        </div>
      </div>
      <p class="text-xs text-gray-500 mt-2">
        赤い破線を超えた音量がタイピング音として検出されます
      </p>
    </div>
  </div>
</template>

<style scoped>
/* グラフ専用のスタイル */
</style>
<template>
  <div class="h-full flex flex-col">
    <!-- 编辑页 Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3">
        <button @click="$router.back()" class="btn-ghost p-2">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
        <h2 class="text-lg font-display font-bold text-text-primary">图片编辑</h2>
      </div>
      <div class="flex items-center gap-2">
        <button class="btn-secondary">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          导出 PNG
        </button>
        <button class="btn-primary">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          导出 PSD
        </button>
      </div>
    </div>

    <!-- 三栏布局 -->
    <div class="flex-1 flex gap-4 min-h-0">
      <!-- 左侧工具栏 -->
      <div class="w-14 flex flex-col gap-1 p-1.5 bg-surface rounded-[var(--radius-lg)] border border-border-light shrink-0">
        <button
          v-for="tool in tools"
          :key="tool.key"
          @click="activeTool = tool.key"
          class="w-11 h-11 rounded-[var(--radius-md)] flex flex-col items-center justify-center gap-0.5 transition-all"
          :class="activeTool === tool.key ? 'bg-primary-50 text-primary-600' : 'text-text-tertiary hover:text-text-secondary hover:bg-surface-secondary'"
          :title="tool.label"
        >
          <component :is="tool.icon" class="w-[18px] h-[18px]" />
          <span class="text-[9px] font-medium">{{ tool.label }}</span>
        </button>
        <div class="flex-1"></div>
        <button class="w-11 h-11 rounded-[var(--radius-md)] flex flex-col items-center justify-center gap-0.5 text-text-tertiary hover:text-text-secondary hover:bg-surface-secondary transition-all" title="撤销">
          <svg class="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
          <span class="text-[9px] font-medium">撤销</span>
        </button>
        <button class="w-11 h-11 rounded-[var(--radius-md)] flex flex-col items-center justify-center gap-0.5 text-text-tertiary hover:text-text-secondary hover:bg-surface-secondary transition-all" title="重做">
          <svg class="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          <span class="text-[9px] font-medium">重做</span>
        </button>
      </div>

      <!-- 中间画布 -->
      <div class="flex-1 bg-surface rounded-[var(--radius-lg)] border border-border-light flex items-center justify-center overflow-hidden relative">
        <div v-if="imageUrl" class="relative max-w-full max-h-full p-4">
          <img :src="imageUrl" class="max-w-full max-h-[calc(100vh-220px)] object-contain rounded-[var(--radius-md)] shadow-card" alt="编辑图片" />
        </div>
        <div v-else class="text-center">
          <div class="w-12 h-12 rounded-full bg-surface-secondary flex items-center justify-center mx-auto mb-3">
            <svg class="w-6 h-6 text-text-tertiary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </div>
          <p class="text-sm text-text-tertiary">加载图片中...</p>
        </div>
      </div>

      <!-- 右侧面板 -->
      <div class="w-72 bg-surface rounded-[var(--radius-lg)] border border-border-light flex flex-col shrink-0 overflow-hidden">
        <!-- 标签页 -->
        <div class="flex border-b border-border-light">
          <button
            v-for="panel in panels"
            :key="panel.key"
            @click="activePanel = panel.key"
            class="flex-1 py-2.5 text-xs font-medium transition-colors relative"
            :class="activePanel === panel.key ? 'text-primary-600' : 'text-text-tertiary hover:text-text-secondary'"
          >
            {{ panel.label }}
            <div v-if="activePanel === panel.key" class="absolute bottom-0 left-3 right-3 h-0.5 bg-primary-500 rounded-full"></div>
          </button>
        </div>

        <!-- 属性面板 -->
        <div v-if="activePanel === 'props'" class="flex-1 overflow-auto scroll-thin p-4 space-y-5">
          <div class="space-y-3">
            <label class="text-xs font-semibold text-text-secondary uppercase tracking-wider">亮度 / 对比度</label>
            <div class="space-y-2">
              <div class="flex items-center gap-3">
                <span class="text-xs text-text-tertiary w-10">亮度</span>
                <input type="range" class="flex-1 accent-primary-500" min="-100" max="100" value="0" />
              </div>
              <div class="flex items-center gap-3">
                <span class="text-xs text-text-tertiary w-10">对比度</span>
                <input type="range" class="flex-1 accent-primary-500" min="-100" max="100" value="0" />
              </div>
            </div>
          </div>
          <div class="space-y-3">
            <label class="text-xs font-semibold text-text-secondary uppercase tracking-wider">饱和度 / 色温</label>
            <div class="space-y-2">
              <div class="flex items-center gap-3">
                <span class="text-xs text-text-tertiary w-10">饱和</span>
                <input type="range" class="flex-1 accent-primary-500" min="-100" max="100" value="0" />
              </div>
              <div class="flex items-center gap-3">
                <span class="text-xs text-text-tertiary w-10">色温</span>
                <input type="range" class="flex-1 accent-primary-500" min="-100" max="100" value="0" />
              </div>
            </div>
          </div>
        </div>

        <!-- 图层面板 -->
        <div v-else class="flex-1 overflow-auto scroll-thin p-4">
          <div class="space-y-2">
            <div class="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] bg-primary-50 border border-primary-100">
              <svg class="w-4 h-4 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <span class="text-sm text-text-primary flex-1">背景层</span>
              <svg class="w-4 h-4 text-text-tertiary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              <svg class="w-4 h-4 text-text-tertiary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <div class="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] bg-surface-secondary border border-border-light">
              <svg class="w-4 h-4 text-text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <span class="text-sm text-text-primary flex-1">商品层</span>
              <svg class="w-4 h-4 text-text-tertiary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              <svg class="w-4 h-4 text-text-tertiary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <div class="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] bg-surface-secondary border border-border-light">
              <svg class="w-4 h-4 text-text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
              <span class="text-sm text-text-primary flex-1">文字层</span>
              <svg class="w-4 h-4 text-text-tertiary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              <svg class="w-4 h-4 text-text-tertiary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, h } from 'vue'
import { useRoute } from 'vue-router'
import { useHistoryStore } from '../stores/history.js'

const route = useRoute()
const historyStore = useHistoryStore()
const recordId = route.params.recordId

const record = computed(() => historyStore.getRecordById(recordId))
const imageUrl = computed(() => record.value?.imageUrls?.[0] || '')

const activeTool = ref('crop')
const activePanel = ref('props')

const tools = [
  { key: 'crop', label: '裁剪', icon: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round' }, [h('path', { d: 'M6.13 1L6 16a2 2 0 0 0 2 2h15' }), h('path', { d: 'M1 6.13L16 6a2 2 0 0 1 2 2v15' })]) },
  { key: 'adjust', label: '调色', icon: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round' }, [h('circle', { cx: '12', cy: '12', r: '10' }), h('path', { d: 'M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20' }), h('path', { d: 'M2 12h20' })]) },
  { key: 'text', label: '文字', icon: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round' }, [h('polyline', { points: '4 7 4 4 20 4 20 7' }), h('line', { x1: '9', y1: '20', x2: '15', y2: '20' }), h('line', { x1: '12', y1: '4', x2: '12', y2: '20' })]) },
  { key: 'filter', label: '滤镜', icon: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round' }, [h('polygon', { points: '22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3' })]) },
]

const panels = [
  { key: 'props', label: '属性' },
  { key: 'layers', label: '图层' },
]

</script>

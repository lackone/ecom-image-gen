<template>
  <aside class="w-60 flex flex-col bg-surface border-r border-border-light shrink-0">
    <!-- 导航菜单 -->
    <nav class="flex-1 p-3 space-y-1">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="nav-item"
        :class="{ active: isActive(item) }"
      >
        <component :is="item.icon" class="w-[18px] h-[18px] shrink-0" />
        <span class="font-medium">{{ item.label }}</span>
      </router-link>
    </nav>

    <!-- 底部信息 -->
    <div class="p-3 border-t border-border-light">
      <div class="px-3 py-2 rounded-[var(--radius-md)] bg-surface-secondary">
        <div class="text-[11px] text-text-tertiary">当前模型</div>
        <div class="text-xs font-medium text-text-secondary mt-0.5 truncate">
          {{ configStore.activeProfile?.name || '未配置' }}
        </div>
      </div>
      <div class="mt-2 px-3 text-[11px] text-text-tertiary">v1.0.0</div>
    </div>
  </aside>
</template>

<script setup>
import { h } from 'vue'
import { useRoute } from 'vue-router'
import { useConfigStore } from '../stores/config.js'

const configStore = useConfigStore()
const route = useRoute()

function isActive(item) {
  // 首页精确匹配
  if (item.path === '/') return route.path === '/'
  // 文生图：/generate 且无 mode
  if (item.path === '/generate') return route.path === '/generate' && !route.query.mode
  // 图生图：/generate?mode=image2img
  if (item.path === '/generate?mode=image2img') return route.path === '/generate' && route.query.mode === 'image2img'
  // 其他：前缀匹配
  return route.path.startsWith(item.path)
}

const IconHome = () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
  h('path', { d: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' }),
  h('polyline', { points: '9 22 9 12 15 12 15 22' })
])

const IconPen = () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
  h('path', { d: 'M12 19l7-7 3 3-7 7-3-3z' }),
  h('path', { d: 'M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z' }),
  h('path', { d: 'M2 2l7.586 7.586' }),
  h('circle', { cx: '11', cy: '11', r: '2' })
])

const IconImage = () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
  h('rect', { x: '3', y: '3', width: '18', height: '18', rx: '2', ry: '2' }),
  h('circle', { cx: '8.5', cy: '8.5', r: '1.5' }),
  h('polyline', { points: '21 15 16 10 5 21' })
])

const IconHistory = () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
  h('circle', { cx: '12', cy: '12', r: '10' }),
  h('polyline', { points: '12 6 12 12 16 14' })
])

const IconSettings = () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
  h('circle', { cx: '12', cy: '12', r: '3' }),
  h('path', { d: 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z' })
])

const navItems = [
  { path: '/', label: '首页', icon: IconHome },
  { path: '/generate', label: '文生图', icon: IconPen },
  { path: '/generate?mode=image2img', label: '图生图', icon: IconImage },
  { path: '/history', label: '历史记录', icon: IconHistory },
  { path: '/settings', label: '设置', icon: IconSettings },
]
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between mb-5">
      <div>
        <h2 class="text-xl font-display font-bold text-text-primary">历史记录</h2>
        <p class="text-sm text-text-tertiary mt-0.5">共 {{ historyStore.records.length }} 条生成记录</p>
      </div>
      <div class="flex items-center gap-2">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索提示词..."
            class="input-field pl-9 w-48 md:w-64"
          />
        </div>
      </div>
    </div>

    <!-- 筛选标签 -->
    <div class="flex items-center gap-2 mb-4 flex-wrap">
      <button
        v-for="filter in filters"
        :key="filter.key"
        @click="activeFilter = filter.key"
        class="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
        :class="activeFilter === filter.key ? 'bg-primary-500 text-white' : 'bg-surface-secondary text-text-secondary hover:bg-primary-50 hover:text-primary-600'"
      >
        {{ filter.label }}
      </button>
    </div>

    <!-- 记录列表 -->
    <div v-if="filteredRecords.length > 0" class="flex-1 overflow-auto scroll-thin -mx-2 px-2">
      <div class="space-y-3 pb-4">
        <div
          v-for="record in filteredRecords"
          :key="record.id"
          class="card p-4 flex gap-4 group cursor-pointer hover:border-primary-200 transition-all"
          @click="selectRecord(record.id)"
          :class="{ 'ring-2 ring-primary-100 border-primary-300': selectedId === record.id }"
        >
          <!-- 缩略图 -->
          <div class="w-20 h-20 rounded-[var(--radius-md)] bg-surface-secondary overflow-hidden shrink-0 border border-border-light">
            <img
              v-if="record.imageUrls?.[0]"
              :src="record.imageUrls[0]"
              class="w-full h-full object-cover"
              alt=""
            />
            <div v-else class="w-full h-full flex items-center justify-center text-text-tertiary">
              <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
          </div>

          <!-- 信息 -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <p class="text-sm text-text-primary font-medium truncate">{{ record.prompt }}</p>
                <div class="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span class="tag">{{ record.type === 'text2img' ? '文生图' : '图生图' }}</span>
                  <span class="tag">{{ record.aspectRatio }}</span>
                  <span class="tag">{{ record.resolution }}</span>
                  <span v-if="record.favorite" class="tag bg-yellow-50 text-yellow-600 border-yellow-100">
                    <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  </span>
                </div>
              </div>
              <div class="text-xs text-text-tertiary shrink-0">{{ formatDate(record.createdAt) }}</div>
            </div>
            <div class="flex items-center gap-2 mt-2">
              <span class="text-xs text-text-tertiary">{{ record.model }}</span>
              <span class="text-border-default">|</span>
              <span class="text-xs text-text-tertiary">{{ record.width }}×{{ record.height }}</span>
              <span class="text-border-default">|</span>
              <span class="text-xs text-text-tertiary">{{ record.imageUrls?.length || 0 }} 张</span>
            </div>
          </div>

          <!-- 操作 -->
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              @click.stop="historyStore.toggleFavorite(record.id)"
              class="w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center hover:bg-surface-secondary transition-colors"
              :class="record.favorite ? 'text-yellow-500' : 'text-text-tertiary hover:text-yellow-500'"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" :fill="record.favorite ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </button>
            <button
              @click.stop="openViewer(record.imageUrls)"
              class="w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-surface-secondary transition-colors"
              title="查看"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
            <button
              @click.stop="deleteRecord(record.id)"
              class="w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center text-text-tertiary hover:text-danger hover:bg-red-50 transition-colors"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 图片浏览弹窗 -->
    <div
      v-if="viewerOpen"
      class="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      @click.self="viewerOpen = false"
    >
      <button
        v-if="viewerImages.length > 1"
        @click.stop="viewerIndex = (viewerIndex - 1 + viewerImages.length) % viewerImages.length"
        class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <img
        :src="viewerImages[viewerIndex]"
        class="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
        alt=""
      />
      <button
        v-if="viewerImages.length > 1"
        @click.stop="viewerIndex = (viewerIndex + 1) % viewerImages.length"
        class="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
      <div class="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm">
        {{ viewerIndex + 1 }} / {{ viewerImages.length }}
      </div>
      <button
        @click="viewerOpen = false"
        class="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>

    <!-- 空状态 -->
    <div v-else class="flex-1 flex flex-col items-center justify-center text-center py-16">
      <div class="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mb-4">
        <svg class="w-8 h-8 text-primary-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      </div>
      <h3 class="text-base font-medium text-text-primary">暂无记录</h3>
      <p class="text-sm text-text-tertiary mt-1">去生成页创作你的第一张电商图吧</p>
      <router-link to="/generate" class="btn-primary mt-4">开始生成</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useHistoryStore } from '../stores/history.js'
import { Modal } from 'ant-design-vue'

const historyStore = useHistoryStore()
const searchQuery = ref('')
const activeFilter = ref('all')
const selectedId = ref(null)

const viewerOpen = ref(false)
const viewerImages = ref([])
const viewerIndex = ref(0)

const filters = [
  { key: 'all', label: '全部' },
  { key: 'text2img', label: '文生图' },
  { key: 'image2img', label: '图生图' },
  { key: 'favorite', label: '收藏' },
]

const filteredRecords = computed(() => {
  let list = historyStore.sortedRecords
  if (activeFilter.value === 'text2img') list = list.filter(r => r.type === 'text2img')
  if (activeFilter.value === 'image2img') list = list.filter(r => r.type === 'image2img')
  if (activeFilter.value === 'favorite') list = list.filter(r => r.favorite)
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(r => r.prompt?.toLowerCase().includes(q))
  }
  return list
})

function selectRecord(id) {
  selectedId.value = id
}

function openViewer(urls) {
  const list = Array.isArray(urls) ? urls.filter(Boolean) : []
  if (!list.length) return
  viewerImages.value = list
  viewerIndex.value = 0
  viewerOpen.value = true
}

function deleteRecord(id) {
  Modal.confirm({
    title: '删除记录',
    content: '确定要删除这条生成记录吗？关联的图片文件也会被删除。',
    okText: '删除',
    okType: 'danger',
    cancelText: '取消',
    onOk: () => {
      historyStore.removeRecord(id)
      if (selectedId.value === id) selectedId.value = null
    },
  })
}

function onKeydown(e) {
  if (!viewerOpen.value) return
  if (e.key === 'Escape') viewerOpen.value = false
  if (e.key === 'ArrowLeft') viewerIndex.value = (viewerIndex.value - 1 + viewerImages.value.length) % viewerImages.value.length
  if (e.key === 'ArrowRight') viewerIndex.value = (viewerIndex.value + 1) % viewerImages.value.length
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

function formatDate(iso) {
  const d = new Date(iso)
  const now = new Date()
  const diff = now - d
  if (diff < 86400000 && d.getDate() === now.getDate()) return '今天 ' + d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  if (diff < 172800000 && d.getDate() === now.getDate() - 1) return '昨天 ' + d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString('zh-CN') + ' ' + d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}
</script>

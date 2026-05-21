<template>
  <div class="space-y-6">
    <!-- Hero 区域 -->
    <div class="relative overflow-hidden rounded-[var(--radius-xl)] bg-gradient-to-br from-primary-500 via-primary-500 to-primary-600 text-white p-8 md:p-10">
      <div class="absolute inset-0 opacity-10">
        <svg class="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" stroke-width="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)"/>
        </svg>
      </div>
      <div class="relative z-10 max-w-xl">
        <h2 class="text-3xl md:text-4xl font-display font-bold tracking-tight mb-3">AI 驱动电商图片生成</h2>
        <p class="text-primary-100 text-base md:text-lg mb-6 leading-relaxed">输入提示词或上传参考图，一键生成高质量可商用的电商商品图。支持多模型、多尺寸、多风格。</p>
        <div class="flex flex-wrap gap-3">
          <router-link to="/generate" class="btn-primary bg-white text-primary-600 hover:bg-primary-50">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            开始生成
          </router-link>
          <router-link to="/generate?mode=image2img" class="btn-primary bg-primary-600/40 text-white border border-white/20 hover:bg-primary-600/60 backdrop-blur-sm">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            图生图
          </router-link>
        </div>
      </div>
    </div>

    <!-- 统计 + 最近生成 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 统计卡片 -->
      <div class="card p-5 space-y-4">
        <h3 class="text-sm font-semibold text-text-secondary uppercase tracking-wider">本次会话</h3>
        <div class="grid grid-cols-2 gap-4">
          <div class="p-3 rounded-[var(--radius-md)] bg-surface-secondary">
            <div class="text-2xl font-display font-bold text-text-primary">{{ sessionStats.generated }}</div>
            <div class="text-xs text-text-tertiary mt-1">已生成图片</div>
          </div>
          <div class="p-3 rounded-[var(--radius-md)] bg-surface-secondary">
            <div class="text-2xl font-display font-bold text-text-primary">{{ sessionStats.tokens }}</div>
            <div class="text-xs text-text-tertiary mt-1">消耗额度</div>
          </div>
        </div>
        <div v-if="configStore.activeProfile" class="flex items-center gap-2 text-xs text-text-secondary">
          <span class="w-1.5 h-1.5 rounded-full bg-success"></span>
          常用模型：{{ configStore.activeProfile.name }}
        </div>
      </div>

      <!-- 最近生成 -->
      <div class="lg:col-span-2 card p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-text-secondary uppercase tracking-wider">最近生成</h3>
          <router-link to="/history" class="text-xs text-primary-600 hover:text-primary-700 font-medium">查看全部</router-link>
        </div>
        <div v-if="recentRecords.length > 0" class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          <div
            v-for="record in recentRecords"
            :key="record.id"
            class="group relative aspect-square rounded-[var(--radius-md)] overflow-hidden bg-surface-secondary cursor-pointer border border-border-light hover:border-primary-300 transition-all"
            @click="$router.push('/history')"
          >
            <img
              v-if="record.imageUrls?.[0]"
              :src="record.imageUrls[0]"
              class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              alt=""
            />
            <div v-else class="w-full h-full flex items-center justify-center text-text-tertiary">
              <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
            <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
              <span class="text-[10px] text-white truncate">{{ record.prompt?.slice(0, 20) }}...</span>
            </div>
          </div>
        </div>
        <div v-else class="flex flex-col items-center justify-center py-10 text-center">
          <div class="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center mb-3">
            <svg class="w-6 h-6 text-primary-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
          <p class="text-sm text-text-tertiary">还没有生成记录</p>
          <router-link to="/generate" class="mt-2 text-sm text-primary-600 font-medium hover:underline">去生成第一张图</router-link>
        </div>
      </div>
    </div>

    <!-- 使用说明 -->
    <div class="card p-5">
      <h3 class="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">使用说明</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="flex gap-3 p-3 rounded-[var(--radius-md)] bg-surface-secondary">
          <div class="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-bold font-display shrink-0">1</div>
          <div>
            <div class="text-sm font-medium text-text-primary">配置模型</div>
            <div class="text-xs text-text-tertiary mt-0.5">在设置页添加 OpenAI、阿里云等模型配置</div>
          </div>
        </div>
        <div class="flex gap-3 p-3 rounded-[var(--radius-md)] bg-surface-secondary">
          <div class="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-bold font-display shrink-0">2</div>
          <div>
            <div class="text-sm font-medium text-text-primary">输入提示词</div>
            <div class="text-xs text-text-tertiary mt-0.5">描述你想要的商品图场景、风格和细节</div>
          </div>
        </div>
        <div class="flex gap-3 p-3 rounded-[var(--radius-md)] bg-surface-secondary">
          <div class="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-bold font-display shrink-0">3</div>
          <div>
            <div class="text-sm font-medium text-text-primary">下载与编辑</div>
            <div class="text-xs text-text-tertiary mt-0.5">支持 PNG/JPG/WebP 下载，可导出 PSD 分层</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useConfigStore } from '../stores/config.js'
import { useHistoryStore } from '../stores/history.js'

const configStore = useConfigStore()
const historyStore = useHistoryStore()

const recentRecords = computed(() => historyStore.sortedRecords.slice(0, 6))

const sessionStats = computed(() => ({
  generated: historyStore.records.length,
  tokens: historyStore.records.length * 4,
}))
</script>

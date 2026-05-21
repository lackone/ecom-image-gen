<template>
  <div class="h-full flex flex-col -m-4 md:-m-6 p-4 md:p-6">
    <!-- 上方：结果展示区 -->
    <div ref="resultArea" class="flex-1 overflow-auto scroll-thin space-y-4 min-h-0 mb-4">
      <!-- 空状态 -->
      <div v-if="genStore.status === 'idle' && genStore.results.length === 0" class="flex flex-col items-center justify-center h-full text-center">
        <div class="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-primary-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 19l7-7 3 3-7 7-3-3z"/>
            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
            <path d="M2 2l7.586 7.586"/>
            <circle cx="11" cy="11" r="2"/>
          </svg>
        </div>
        <h3 class="text-base font-medium text-text-primary">{{ configStore.hasAnyProfile ? '准备就绪，开始创作吧' : '请先配置 AI 模型' }}</h3>
        <p class="text-sm text-text-tertiary mt-1 max-w-sm">
          {{ configStore.hasAnyProfile ? '在下方输入提示词，选择图片比例和分辨率，点击生成按钮。' : '你还没有配置任何 AI 模型，点击右上角「设置」进行配置。' }}
        </p>
        <router-link v-if="!configStore.hasAnyProfile" to="/settings" class="btn-primary mt-4">去配置模型</router-link>
      </div>

      <!-- 已有结果列表 -->
      <div v-for="(result, idx) in resultList" :key="idx" class="space-y-3">
        <!-- 用户消息（参数） -->
        <div class="flex justify-end">
          <div class="max-w-[80%] bg-primary-500 text-white rounded-[var(--radius-lg)] rounded-tr-sm px-4 py-3 shadow-sm">
            <p class="text-sm leading-relaxed">{{ result.prompt }}</p>
            <div class="flex items-center gap-2 mt-2 flex-wrap">
              <span class="text-[11px] bg-white/20 px-1.5 py-0.5 rounded">{{ result.aspectRatio }}</span>
              <span class="text-[11px] bg-white/20 px-1.5 py-0.5 rounded">{{ result.resolution }}</span>
              <span class="text-[11px] bg-white/20 px-1.5 py-0.5 rounded">{{ result.batchSize }}张</span>
            </div>
          </div>
        </div>

        <!-- AI 结果 -->
        <div class="flex justify-start">
          <div class="max-w-[90%] w-full space-y-3">
            <!-- 图片网格 -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                v-for="(img, i) in result.displayUrls"
                :key="i"
                class="group relative bg-surface rounded-[var(--radius-lg)] overflow-hidden border border-border-light hover:border-primary-300 transition-all shadow-card"
              >
                <img :src="img" class="w-full aspect-square object-cover" alt="生成结果" />
                <!-- 悬停操作层 -->
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-end justify-between p-3">
                  <div class="flex items-center gap-1.5">
                    <button @click="downloadImage(img)" class="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/30 transition-colors" title="下载">
                      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    </button>
                    <button @click="openViewer(result.displayUrls, i)" class="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/30 transition-colors" title="查看">
                      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                    <button @click="toggleFavorite(result.recordId)" class="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/30 transition-colors" title="收藏">
                      <svg class="w-4 h-4" viewBox="0 0 24 24" :fill="historyStore.getRecordById(result.recordId)?.favorite ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    </button>
                  </div>
                  <span class="text-[11px] text-white/80 font-medium">{{ result.width }}×{{ result.height }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载中 -->
      <div v-if="genStore.status === 'loading'" class="flex justify-start">
        <div class="max-w-[90%] w-full space-y-3">
          <div class="card p-5 space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                <svg class="w-4 h-4 text-primary-500 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              </div>
              <div>
                <div class="text-sm font-medium text-text-primary">正在生成...</div>
                <div class="text-xs text-text-tertiary mt-0.5">预计剩余 {{ genStore.estimatedTime }} 秒</div>
              </div>
            </div>
            <div class="h-2 bg-surface-secondary rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-primary-400 to-primary-500 rounded-full transition-all duration-500" :style="{ width: genStore.progress + '%' }"></div>
            </div>
            <div class="flex items-center justify-between text-xs text-text-tertiary">
              <span>{{ genStore.progress }}%</span>
              <button @click="genStore.cancel()" class="text-danger hover:underline">取消生成</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 错误状态 -->
      <div v-if="genStore.status === 'error'" class="flex justify-start">
        <div class="max-w-[90%]">
          <div class="bg-danger/5 border border-danger/20 rounded-[var(--radius-lg)] px-4 py-3">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-danger shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span class="text-sm text-danger font-medium">生成失败</span>
            </div>
            <p class="text-xs text-text-secondary mt-1">{{ genStore.errorMessage }}</p>
            <button @click="retryGenerate" class="mt-2 text-xs text-primary-600 hover:text-primary-700 font-medium">点击重试</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 下方：输入区域 -->
    <div class="shrink-0 space-y-3">
      <!-- 图生图/图像编辑：参考图上传区 -->
      <div
        v-if="isImageMode"
        class="card p-3"
        :class="isDragging ? 'ring-2 ring-primary-300' : ''"
        @dragover.prevent="isDragging = true"
        @dragleave="isDragging = false"
        @drop.prevent="handleDrop"
      >
        <div
          v-if="referenceImages.length === 0"
          class="border-2 border-dashed rounded-[var(--radius-md)] p-4 text-center transition-all cursor-pointer"
          :class="isDragging ? 'border-primary-500 bg-primary-50/40' : 'border-border-light hover:border-primary-400 hover:bg-primary-50/20'"
          @click="triggerUpload"
        >
          <svg class="w-6 h-6 text-text-tertiary mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          <p class="text-sm text-text-secondary">
            {{ imageMode === 'image2edit' ? '点击或拖拽上传参考图（可多选）' : '点击或拖拽上传参考图' }}
          </p>
          <p class="text-xs text-text-tertiary mt-1">
            {{ imageMode === 'image2edit' ? '支持 JPG / PNG / WebP，最多 3 张，用于图像编辑或融合' : '支持 JPG / PNG / WebP，上传 1 张参考图用于风格迁移' }}
          </p>
          <input ref="fileInput" type="file" accept="image/*" :multiple="imageMode === 'image2edit'" class="hidden" @change="onFileChange" />
        </div>
        <div v-else class="space-y-3">
          <div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
            <div v-for="(img, idx) in referenceImages" :key="idx" class="relative group">
              <img :src="img" draggable="false" class="w-full aspect-square rounded-[var(--radius-md)] object-cover border border-border-light" :alt="`参考图${idx + 1}`" />
              <button @click="removeReferenceImage(idx)" class="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-danger text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div v-if="referenceImages.length < maxReferenceImages" class="aspect-square rounded-[var(--radius-md)] border-2 border-dashed border-border-light flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/20 transition-all" @click="triggerUpload">
              <svg class="w-5 h-5 text-text-tertiary mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              <span class="text-[11px] text-text-tertiary">添加</span>
              <input ref="fileInput" type="file" accept="image/*" :multiple="imageMode === 'image2edit'" class="hidden" @change="onFileChange" />
            </div>
          </div>
          <div v-if="referenceImages.length > 0" class="flex items-center gap-3">
            <span class="text-xs text-text-tertiary">相似度/强度</span>
            <input v-model.number="strength" type="range" min="0.1" max="1" step="0.1" class="w-32 accent-primary-500" />
            <span class="text-xs text-text-secondary w-8">{{ strength }}</span>
            <span class="text-[11px] text-text-tertiary ml-auto">{{ referenceImages.length }}/{{ maxReferenceImages }} 张</span>
          </div>
        </div>
      </div>

      <!-- 快捷设置栏 -->
      <div class="flex items-center gap-2 flex-wrap">
        <div class="flex items-center bg-surface rounded-[var(--radius-md)] border border-border-light p-1">
          <button
            v-for="r in aspectRatios"
            :key="r.value"
            @click="form.aspectRatio = r.value"
            class="px-2.5 py-1.5 rounded text-xs font-medium transition-all"
            :class="form.aspectRatio === r.value ? 'bg-primary-500 text-white shadow-sm' : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'"
          >
            {{ r.label }}
          </button>
        </div>
        <div class="flex items-center bg-surface rounded-[var(--radius-md)] border border-border-light p-1">
          <button
            v-for="res in resolutions"
            :key="res.value"
            @click="form.resolution = res.value"
            class="px-2.5 py-1.5 rounded text-xs font-medium transition-all"
            :class="form.resolution === res.value ? 'bg-primary-500 text-white shadow-sm' : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'"
          >
            {{ res.label }}
          </button>
        </div>
        <div class="flex items-center gap-1.5 bg-surface rounded-[var(--radius-md)] border border-border-light px-2 py-1">
          <span class="text-[11px] text-text-tertiary">宽</span>
          <input v-model.number="form.width" type="number" min="256" max="4096" step="64" class="w-14 text-xs text-center bg-transparent border-b border-border-light focus:border-primary-400 focus:outline-none py-0.5 text-text-primary" />
          <span class="text-[11px] text-text-tertiary">高</span>
          <input v-model.number="form.height" type="number" min="256" max="4096" step="64" class="w-14 text-xs text-center bg-transparent border-b border-border-light focus:border-primary-400 focus:outline-none py-0.5 text-text-primary" />
        </div>
        <button @click="showAdvanced = !showAdvanced" class="btn-ghost text-xs py-1.5">
          <svg class="w-3.5 h-3.5 transition-transform" :class="{ 'rotate-180': showAdvanced }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          高级设置
        </button>
      </div>

      <!-- 高级设置 -->
      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div v-if="showAdvanced" class="card p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-text-secondary">生成数量</label>
            <div class="flex items-center bg-surface-secondary rounded-[var(--radius-md)] p-0.5">
              <button v-for="n in 4" :key="n" @click="form.batchSize = n" class="flex-1 py-1.5 rounded text-xs font-medium transition-all" :class="form.batchSize === n ? 'bg-surface text-primary-600 shadow-sm' : 'text-text-secondary'">{{ n }}</button>
            </div>
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-text-secondary">风格预设</label>
            <select v-model="form.stylePreset" class="input-field text-xs py-2">
              <option value="">默认</option>
              <option value="电商风">电商风</option>
              <option value="极简">极简</option>
              <option value="高级感">高级感</option>
              <option value="生活场景">生活场景</option>
              <option value="复古">复古</option>
            </select>
          </div>
          <div class="space-y-1.5 md:col-span-2">
            <div class="flex items-center justify-between">
              <label class="text-xs font-medium text-text-secondary">负面提示词</label>
              <button @click="loadNegativePrompt" class="text-[11px] text-primary-600 hover:text-primary-700">载入电商常用</button>
            </div>
            <input v-model="form.negativePrompt" placeholder="不希望出现的元素..." class="input-field text-xs py-2" />
          </div>
        </div>
      </Transition>

      <!-- 未配置模型提示 -->
      <div v-if="!configStore.hasAnyProfile" class="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] bg-warning/10 border border-warning/20 text-warning text-xs">
        <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        未配置 AI 模型，
        <router-link to="/settings" class="underline font-medium hover:no-underline">去配置</router-link>
      </div>

      <!-- 提示词输入框 -->
      <div class="relative">
        <div class="flex items-end gap-2 bg-surface rounded-[var(--radius-xl)] border border-border-light p-2 shadow-card focus-within:border-primary-300 focus-within:shadow-[var(--shadow-input-focus)] transition-all">
          <textarea
            v-model="form.prompt"
            rows="6"
            :disabled="genStore.status === 'loading'"
            placeholder="描述你想要的电商图片..."
            class="flex-1 resize-none bg-transparent px-3 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none min-h-[140px] max-h-64 leading-relaxed cursor-text disabled:opacity-50 disabled:cursor-not-allowed"
            @keydown.enter.prevent="onEnter"
            @input="autoResize"
            ref="textareaRef"
          ></textarea>
          <div class="flex flex-col justify-between shrink-0 self-stretch py-0.5">
            <button
              v-if="form.prompt.length > 0"
              @click="form.prompt = ''; nextTick(() => { const el = textareaRef.value; if (el) { el.style.height = 'auto' } })"
              class="w-10 h-10 rounded-xl flex items-center justify-center bg-surface-secondary text-text-tertiary hover:bg-danger hover:text-white transition-colors"
              title="清空"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div v-else class="w-10 h-10"></div>
            <button
              @click="generate"
              :disabled="!canGenerate"
              class="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
              :class="canGenerate ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-md active:scale-95' : 'bg-surface-secondary text-text-tertiary cursor-not-allowed'"
            >
              <svg v-if="genStore.status === 'loading'" class="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              <svg v-else class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
        <!-- 提示词模板快捷标签 -->
        <div v-if="form.prompt.length === 0" class="flex items-center gap-1.5 mt-2 px-1 overflow-x-auto scroll-thin">
          <span class="text-[11px] text-text-tertiary shrink-0">常用：</span>
          <button
            v-for="t in promptTemplates"
            :key="t"
            @click="form.prompt = t"
            class="px-2 py-0.5 rounded-full text-[11px] bg-surface-secondary text-text-secondary hover:bg-primary-50 hover:text-primary-600 transition-colors border border-border-light whitespace-nowrap"
          >
            {{ t.length > 12 ? t.slice(0, 12) + '...' : t }}
          </button>
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
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useConfigStore } from '../stores/config.js'
import { useGenerationStore } from '../stores/generation.js'
import { useHistoryStore } from '../stores/history.js'
import { generateText2Image, generateImage2Image } from '../api/ai.js'
// 本地保存暂时跳过，前端直接用厂商URL显示
// import { saveImage, saveThumbnail, generateThumbnail, getImageUrl, getThumbnailUrl } from '../utils/fileStorage.js'

const route = useRoute()
const configStore = useConfigStore()
const genStore = useGenerationStore()
const historyStore = useHistoryStore()

const imageMode = computed(() => {
  const mode = route.query.mode
  if (mode === 'image2img') return 'image2img'
  if (mode === 'image2edit') return 'image2edit'
  return 'text2img'
})
const isImageMode = computed(() => imageMode.value !== 'text2img')
const maxReferenceImages = computed(() => imageMode.value === 'text2img' ? 0 : 3)

const resultArea = ref(null)
const textareaRef = ref(null)
const fileInput = ref(null)
const showAdvanced = ref(false)
const referenceImages = ref([])
const strength = ref(0.7)
const isDragging = ref(false)

const viewerOpen = ref(false)
const viewerImages = ref([])
const viewerIndex = ref(0)

const form = reactive({
  prompt: '',
  negativePrompt: '',
  aspectRatio: '1:1',
  resolution: '1K',
  width: 1024,
  height: 1024,
  batchSize: 1,
  stylePreset: '',
})

// 会话级持久化：sessionId + resultList
const SESSION_KEY = 'ecom_session_id'
const RESULT_LIST_KEY = 'ecom_session_results'

function getSessionId() {
  let sid = sessionStorage.getItem(SESSION_KEY)
  if (!sid) {
    sid = crypto.randomUUID()
    sessionStorage.setItem(SESSION_KEY, sid)
  }
  return sid
}

function loadSessionResults() {
  try {
    const raw = sessionStorage.getItem(RESULT_LIST_KEY)
    if (!raw) return []
    const list = JSON.parse(raw)
    if (!Array.isArray(list)) return []
    // 兼容旧数据：没有 displayUrls 的用 localPaths 兜底
    return list.map(item => ({
      ...item,
      displayUrls: item.displayUrls || item.localPaths || item.images || [],
    }))
  } catch {
    return []
  }
}

function saveSessionResults(list) {
  // 保存前把 displayUrls 切换为 localPaths，刷新后优先显示本地已下载的图片
  const toSave = list.map(item => ({
    ...item,
    displayUrls: item.localPaths || item.displayUrls || item.images || [],
  }))
  sessionStorage.setItem(RESULT_LIST_KEY, JSON.stringify(toSave))
}

const sessionId = getSessionId()
const resultList = ref(loadSessionResults())

// resultList 变化时自动保存到 sessionStorage
watch(resultList, saveSessionResults, { deep: true })

const aspectRatios = [
  { value: '1:1', label: '1:1' },
  { value: '4:3', label: '4:3' },
  { value: '16:9', label: '16:9' },
  { value: '3:4', label: '3:4' },
  { value: '9:16', label: '9:16' },
]

const resolutions = [
  { value: '1K', label: '1K' },
  { value: '2K', label: '2K' },
  { value: '4K', label: '4K' },
]

const promptTemplates = [
  '专业电商商品图，纯白背景，柔和打光，高清细节',
  '极简风格产品摄影，单色背景，苹果风格',
  '奢侈品级别产品摄影，黑色丝绒背景，金色光泽',
]

const canGenerate = computed(() => {
  return configStore.hasAnyProfile && genStore.status !== 'loading' && form.prompt.trim().length > 0
})

function autoResize() {
  nextTick(() => {
    const el = textareaRef.value
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    el.style.height = 'auto'
    const newHeight = Math.min(Math.max(el.scrollHeight, 52), 128)
    el.style.height = newHeight + 'px'
    el.setSelectionRange(start, end)
  })
}

function onEnter(e) {
  if (!e.shiftKey) {
    generate()
  }
}

function loadNegativePrompt() {
  form.negativePrompt = '水印, 文字, 签名, 模糊, 低分辨率, 变形, 多余物体, 杂乱背景, 裁剪, 边框, logo, 品牌名, 质量差, 过曝, 欠曝'
}

function triggerUpload() {
  fileInput.value?.click()
}

function processFiles(files, source = 'unknown') {
  const rawFiles = Array.from(files)
  console.log(`[Upload] source=${source}, total=${rawFiles.length}, names=${rawFiles.map(f => f.name).join(', ')}`)

  const imageFiles = rawFiles.filter(f => {
    const byType = f.type.startsWith('image/')
    const byExt = /\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(f.name)
    console.log(`[Upload]  file=${f.name}, type=${f.type}, byType=${byType}, byExt=${byExt}`)
    return byType || byExt
  })

  if (imageFiles.length === 0) {
    console.warn('[Upload] 没有检测到图片文件')
    return
  }

  const remainingSlots = maxReferenceImages.value - referenceImages.value.length
  console.log(`[Upload] remainingSlots=${remainingSlots}, max=${maxReferenceImages.value}, current=${referenceImages.value.length}`)

  const toProcess = imageFiles.slice(0, remainingSlots)
  if (toProcess.length < imageFiles.length) {
    console.warn(`[Upload] 超出上限，只处理前 ${toProcess.length} 张`)
  }

  for (const file of toProcess) {
    const reader = new FileReader()
    reader.onload = (ev) => { referenceImages.value.push(ev.target.result) }
    reader.onerror = (err) => { console.error('[Upload] FileReader 失败:', file.name, err) }
    reader.readAsDataURL(file)
  }
}

function onFileChange(e) {
  processFiles(e.target.files || [], 'input')
  // 清空 input 以便重复选择同一文件
  e.target.value = ''
}

function handleDrop(e) {
  isDragging.value = false
  const dtFiles = e.dataTransfer?.files
  console.log(`[Upload] drop event, dataTransfer.files.length=${dtFiles?.length ?? 0}`)
  processFiles(dtFiles || [], 'drop')
}

function removeReferenceImage(idx) {
  referenceImages.value.splice(idx, 1)
}

async function generate() {
  if (!canGenerate.value) return

  const profile = configStore.activeProfile
  if (!profile) return

  genStore.startGenerating({ ...form })

  // 模拟进度动画
  let progress = 0
  const interval = setInterval(() => {
    progress += Math.random() * 12 + 3
    if (progress > 90) progress = 90
    genStore.setProgress(Math.round(progress), Math.max(1, Math.round((100 - progress) / 8)))
  }, 600)

  try {
    const request = {
      prompt: form.prompt,
      negativePrompt: form.negativePrompt,
      aspectRatio: form.aspectRatio,
      resolution: form.resolution,
      width: form.width,
      height: form.height,
      batchSize: form.batchSize,
      stylePreset: form.stylePreset,
      ...(isImageMode.value && referenceImages.value.length > 0
        ? { images: referenceImages.value, strength: strength.value }
        : {}),
    }

    const generateFn = isImageMode.value ? generateImage2Image : generateText2Image
    const { images, localPaths, recordId } = await generateFn(request, profile, sessionId)

    clearInterval(interval)
    genStore.setProgress(95, 1)

    // images = 厂商临时URL（前端立即显示）
    // localPaths = 本地永久路径（历史记录保存）
    genStore.finishSuccess(images)

    const record = {
      id: recordId,
      type: imageMode.value,
      prompt: form.prompt,
      negativePrompt: form.negativePrompt,
      aspectRatio: form.aspectRatio,
      resolution: form.resolution,
      width: form.width,
      height: form.height,
      batchSize: form.batchSize,
      stylePreset: form.stylePreset,
      model: profile.modelId || 'unknown',
      imageUrls: localPaths,
      thumbUrls: localPaths,
      hasReferenceImages: referenceImages.value.length > 0,
      referenceCount: referenceImages.value.length,
      createdAt: new Date().toISOString(),
      favorite: false,
      tags: [],
      projectId: null,
    }
    historyStore.addRecord(record)
    resultList.value.push({
      ...form,
      images,
      localPaths,
      displayUrls: images, // 新生成时优先显示厂商临时URL，本地异步下载可能还没完成
      recordId,
      width: form.width,
      height: form.height,
    })

    form.prompt = ''
    nextTick(() => {
      const el = textareaRef.value
      if (el) { el.style.height = 'auto'; el.scrollTop = 0 }
    })
  } catch (err) {
    clearInterval(interval)
    let msg = err.message || '生成失败'
    if (err.status === 401) msg = 'API Key 错误，请检查配置'
    if (err.status === 429) msg = 'API 配额不足，请稍后再试或切换模型'
    if (err.status === 408 || err.name === 'AbortError') msg = '生成超时，请重试'
    genStore.finishError(msg)
  }
}

async function downloadImage(url) {
  if (!url) return
  try {
    const resp = await fetch(url)
    const blob = await resp.blob()
    const blobUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = `image_${Date.now()}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(blobUrl)
  } catch {
    // 跨域或网络失败时 fallback：直接新窗口打开
    window.open(url, '_blank')
  }
}

function openViewer(urls, startIndex = 0) {
  const list = Array.isArray(urls) ? urls.filter(Boolean) : []
  if (!list.length) return
  viewerImages.value = list
  viewerIndex.value = startIndex
  viewerOpen.value = true
}

function onKeydown(e) {
  if (!viewerOpen.value) return
  if (e.key === 'Escape') viewerOpen.value = false
  if (e.key === 'ArrowLeft') viewerIndex.value = (viewerIndex.value - 1 + viewerImages.value.length) % viewerImages.value.length
  if (e.key === 'ArrowRight') viewerIndex.value = (viewerIndex.value + 1) % viewerImages.value.length
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

function toggleFavorite(id) {
  if (!id) return
  historyStore.toggleFavorite(id)
  // 强制触发一次 sessionStorage 保存，保证页面内收藏状态同步
  saveSessionResults(resultList.value)
}

function retryGenerate() {
  if (genStore.currentParams) {
    Object.assign(form, genStore.currentParams)
    generate()
  }
}
</script>

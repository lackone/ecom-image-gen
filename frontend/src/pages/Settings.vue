<template>
  <div class="max-w-3xl mx-auto">
    <h2 class="text-xl font-display font-bold text-text-primary mb-5">设置</h2>

    <!-- Tab 切换 -->
    <div class="flex items-center gap-1 p-1 bg-surface-secondary rounded-[var(--radius-lg)] mb-6 w-fit">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="activeTab = tab.key"
        class="px-4 py-2 rounded-[var(--radius-md)] text-sm font-medium transition-all"
        :class="activeTab === tab.key ? 'bg-surface text-text-primary shadow-sm' : 'text-text-tertiary hover:text-text-secondary'"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- 模型配置 -->
    <div v-if="activeTab === 'models'" class="space-y-4">
      <!-- 已配置模型卡片 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div
          v-for="profile in configStore.profiles"
          :key="profile.id"
          class="card p-4 relative group"
          :class="{ 'ring-2 ring-primary-200 border-primary-300': profile.isActive }"
        >
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                </svg>
              </div>
              <div>
                <div class="text-sm font-semibold text-text-primary">{{ profile.name }}</div>
                <div class="text-xs text-text-tertiary mt-0.5">{{ profile.modelId }}</div>
              </div>
            </div>
            <div class="flex items-center gap-1">
              <span v-if="profile.isActive" class="tag bg-success/10 text-success border-success/20">当前使用</span>
              <button
                v-else
                @click="configStore.setActive(profile.id)"
                class="text-xs text-primary-600 hover:text-primary-700 font-medium px-2 py-1 rounded hover:bg-primary-50 transition-colors"
              >
                启用
              </button>
            </div>
          </div>
          <div class="mt-3 pt-3 border-t border-border-light flex items-center justify-between">
            <div class="text-xs text-text-tertiary truncate max-w-[180px]">{{ profile.apiBaseUrl }}</div>
            <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button @click="editProfile(profile)" class="w-7 h-7 rounded flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-surface-secondary transition-colors">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button @click="removeProfile(profile.id)" class="w-7 h-7 rounded flex items-center justify-center text-text-tertiary hover:text-danger hover:bg-red-50 transition-colors">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- 新增按钮 -->
        <button @click="showForm = true; editingId = null; resetForm()" class="card p-4 flex flex-col items-center justify-center gap-2 text-text-tertiary hover:text-primary-600 hover:border-primary-300 hover:bg-primary-50/30 transition-all min-h-[120px]">
          <div class="w-10 h-10 rounded-xl bg-surface-secondary flex items-center justify-center">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </div>
          <span class="text-sm font-medium">新增模型配置</span>
        </button>
      </div>

      <!-- 配置表单 -->
      <div v-if="showForm" class="card p-5 space-y-4 mt-4">
        <h3 class="text-sm font-semibold text-text-primary">{{ editingId ? '编辑配置' : '新增配置' }}</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-text-secondary">配置名称</label>
            <input v-model="form.name" placeholder="例如：OpenAI DALL·E 3" class="input-field" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-text-secondary">厂商</label>
            <select v-model="form.provider" @change="onProviderChange" class="input-field">
              <option value="openai">OpenAI</option>
              <option value="aliyun">阿里云（百炼）</option>
              <option value="tencent">腾讯云</option>
              <option value="jimeng">即梦 AI</option>
              <option value="custom">自定义 OpenAI 兼容</option>
            </select>
          </div>
          <div class="space-y-1.5 md:col-span-2">
            <label class="text-xs font-medium text-text-secondary">API Base URL</label>
            <input v-model="form.apiBaseUrl" placeholder="https://api.openai.com/v1" class="input-field" />
          </div>
          <div class="space-y-1.5 md:col-span-2">
            <label class="text-xs font-medium text-text-secondary">API Key</label>
            <div class="relative">
              <input v-model="form.apiKey" :type="showKey ? 'text' : 'password'" placeholder="sk-xxxxxxxx" class="input-field pr-10" />
              <button @click="showKey = !showKey" class="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-text-secondary">模型 ID</label>
            <input v-model="form.modelId" placeholder="dall-e-3" class="input-field" />
          </div>
        </div>
        <div class="flex items-center gap-2 pt-2">
          <button @click="saveProfile" class="btn-primary">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            保存
          </button>
          <button @click="showForm = false" class="btn-secondary">取消</button>
          <button class="btn-ghost text-primary-600 ml-auto">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            测试连接
          </button>
        </div>
      </div>
    </div>

    <!-- 全局设置 -->
    <div v-else-if="activeTab === 'global'" class="card p-5 space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm font-medium text-text-primary">默认下载格式</div>
          <div class="text-xs text-text-tertiary mt-0.5">生成图片的默认导出格式</div>
        </div>
        <select v-model="globalSettings.downloadFormat" class="input-field w-32">
          <option value="png">PNG</option>
          <option value="jpg">JPG</option>
          <option value="webp">WebP</option>
        </select>
      </div>
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm font-medium text-text-primary">JPG 质量</div>
          <div class="text-xs text-text-tertiary mt-0.5">导出 JPG 时的压缩质量</div>
        </div>
        <div class="flex items-center gap-3 w-48">
          <input v-model.number="globalSettings.jpgQuality" type="range" min="1" max="100" class="flex-1 accent-primary-500" />
          <span class="text-sm text-text-secondary w-8 text-right">{{ globalSettings.jpgQuality }}</span>
        </div>
      </div>
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm font-medium text-text-primary">生成超时时间</div>
          <div class="text-xs text-text-tertiary mt-0.5">超过此时间自动取消请求</div>
        </div>
        <div class="flex items-center gap-3 w-48">
          <input v-model.number="globalSettings.timeout" type="range" min="10" max="300" class="flex-1 accent-primary-500" />
          <span class="text-sm text-text-secondary w-12 text-right">{{ globalSettings.timeout }}s</span>
        </div>
      </div>
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm font-medium text-text-primary">历史记录上限</div>
          <div class="text-xs text-text-tertiary mt-0.5">最多保存多少条记录</div>
        </div>
        <div class="flex items-center gap-3 w-48">
          <input v-model.number="globalSettings.maxHistory" type="range" min="20" max="500" step="10" class="flex-1 accent-primary-500" />
          <span class="text-sm text-text-secondary w-10 text-right">{{ globalSettings.maxHistory }}</span>
        </div>
      </div>
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm font-medium text-text-primary">自动翻译提示词</div>
          <div class="text-xs text-text-tertiary mt-0.5">发送前自动将中文翻译为英文</div>
        </div>
        <button
          @click="globalSettings.autoTranslate = !globalSettings.autoTranslate"
          class="w-11 h-6 rounded-full transition-colors duration-200 relative"
          :class="globalSettings.autoTranslate ? 'bg-primary-500' : 'bg-border-default'"
        >
          <span class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200" :class="globalSettings.autoTranslate ? 'translate-x-5' : 'translate-x-0'"></span>
        </button>
      </div>
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm font-medium text-text-primary">生成完成提示音</div>
          <div class="text-xs text-text-tertiary mt-0.5">生成完成后播放声音提醒</div>
        </div>
        <button
          @click="globalSettings.soundNotify = !globalSettings.soundNotify"
          class="w-11 h-6 rounded-full transition-colors duration-200 relative"
          :class="globalSettings.soundNotify ? 'bg-primary-500' : 'bg-border-default'"
        >
          <span class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200" :class="globalSettings.soundNotify ? 'translate-x-5' : 'translate-x-0'"></span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useConfigStore } from '../stores/config.js'
import { Modal } from 'ant-design-vue'

const configStore = useConfigStore()

const tabs = [
  { key: 'models', label: '模型配置' },
  { key: 'global', label: '全局设置' },
]
const activeTab = ref('models')

const showForm = ref(false)
const editingId = ref(null)
const showKey = ref(false)

const providerDefaults = {
  openai: { apiBaseUrl: 'https://api.openai.com/v1', modelId: 'dall-e-3' },
  aliyun: { apiBaseUrl: 'https://dashscope.aliyuncs.com/api/v1', modelId: 'qwen-image-2.0-pro' },
  tencent: { apiBaseUrl: 'https://hunyuan.tencentcloudapi.com/', modelId: 'hunyuan-image' },
  jimeng: { apiBaseUrl: '', modelId: '' },
  custom: { apiBaseUrl: '', modelId: '' },
}

const form = reactive({
  name: '',
  provider: 'openai',
  apiBaseUrl: 'https://api.openai.com/v1',
  apiKey: '',
  modelId: 'dall-e-3',
})

const globalSettings = reactive({
  downloadFormat: 'png',
  jpgQuality: 92,
  timeout: 60,
  maxHistory: 200,
  autoTranslate: false,
  soundNotify: true,
})

function resetForm() {
  form.name = ''
  form.provider = 'openai'
  form.apiBaseUrl = 'https://api.openai.com/v1'
  form.apiKey = ''
  form.modelId = 'dall-e-3'
}

function onProviderChange() {
  const defaults = providerDefaults[form.provider]
  if (defaults) {
    form.apiBaseUrl = defaults.apiBaseUrl
    form.modelId = defaults.modelId
  }
}

function editProfile(profile) {
  editingId.value = profile.id
  Object.assign(form, {
    name: profile.name,
    provider: profile.provider,
    apiBaseUrl: profile.apiBaseUrl,
    apiKey: profile.apiKey,
    modelId: profile.modelId,
  })
  showForm.value = true
}

function saveProfile() {
  const data = {
    id: editingId.value || crypto.randomUUID(),
    ...form,
    isActive: false,
    translateApi: { provider: 'none', apiKey: '', apiSecret: '', enabled: false },
    createdAt: new Date().toISOString(),
  }
  if (editingId.value) {
    configStore.updateProfile(editingId.value, data)
  } else {
    configStore.addProfile(data)
  }
  showForm.value = false
  editingId.value = null
}

function removeProfile(id) {
  Modal.confirm({
    title: '删除配置',
    content: '确定删除此模型配置吗？',
    okText: '删除',
    okType: 'danger',
    onOk: () => configStore.removeProfile(id),
  })
}
</script>

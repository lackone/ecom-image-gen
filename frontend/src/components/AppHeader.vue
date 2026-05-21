<template>
  <header class="h-16 px-4 md:px-6 flex items-center justify-between bg-surface/80 backdrop-blur-xl border-b border-border-light z-50 shrink-0">
    <div class="flex items-center gap-3">
      <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-sm">
        <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
      </div>
      <div class="hidden sm:block">
        <h1 class="text-base font-bold font-display tracking-tight text-text-primary leading-none">EcomImageGen</h1>
        <p class="text-[11px] text-text-tertiary mt-0.5 leading-none">电商AI智图</p>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <!-- 模型切换 -->
      <div class="relative">
        <button
          v-if="configStore.hasAnyProfile"
          @click="showModelDropdown = !showModelDropdown"
          class="flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-md)] bg-surface-secondary border border-border-light hover:border-border-default transition-all text-sm"
        >
          <span class="w-2 h-2 rounded-full bg-success"></span>
          <span class="text-text-secondary font-medium max-w-[140px] truncate">{{ configStore.activeProfile?.name || '选择模型' }}</span>
          <svg class="w-4 h-4 text-text-tertiary" :class="{ 'rotate-180': showModelDropdown }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        <router-link
          v-else
          to="/settings"
          class="flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-md)] bg-warning/10 border border-warning/20 text-warning text-sm font-medium hover:bg-warning/15 transition-all"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          未配置模型
        </router-link>

        <!-- 下拉菜单 -->
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 scale-95 -translate-y-1"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 -translate-y-1"
        >
          <div
            v-if="showModelDropdown && configStore.hasAnyProfile"
            class="absolute right-0 top-full mt-2 w-64 bg-surface rounded-[var(--radius-lg)] border border-border-light shadow-dropdown py-1.5 z-50"
          >
            <div class="px-3 py-1.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">已配置模型</div>
            <button
              v-for="profile in configStore.profiles"
              :key="profile.id"
              @click="selectModel(profile.id)"
              class="w-full flex items-center gap-3 px-3 py-2 hover:bg-surface-secondary transition-colors text-left"
            >
              <span class="w-2 h-2 rounded-full shrink-0" :class="profile.id === configStore.activeProfileId ? 'bg-primary-500' : 'bg-text-tertiary/30'"></span>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-text-primary truncate">{{ profile.name }}</div>
                <div class="text-xs text-text-tertiary">{{ profile.modelId }}</div>
              </div>
              <svg v-if="profile.id === configStore.activeProfileId" class="w-4 h-4 text-primary-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </button>
            <div class="border-t border-border-light mt-1 pt-1">
              <router-link to="/settings" class="flex items-center gap-2 px-3 py-2 text-sm text-primary-600 hover:bg-primary-50 transition-colors">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                管理模型配置
              </router-link>
            </div>
          </div>
        </Transition>
      </div>

      <!-- 设置 -->
      <router-link
        to="/settings"
        class="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-surface-tertiary transition-all"
        :class="{ 'bg-primary-50 text-primary-600': $route.path === '/settings' }"
      >
        <svg class="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      </router-link>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useConfigStore } from '../stores/config.js'

const configStore = useConfigStore()
const showModelDropdown = ref(false)

function selectModel(id) {
  configStore.setActive(id)
  showModelDropdown.value = false
}
</script>

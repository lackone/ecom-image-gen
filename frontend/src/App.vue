<template>
  <div class="h-screen flex flex-col bg-surface-secondary">
    <AppHeader />
    <div class="flex flex-1 overflow-hidden">
      <AppSidebar class="hidden md:flex" />
      <main class="flex-1 overflow-auto scroll-thin p-4 md:p-6">
        <div class="max-w-7xl mx-auto">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import AppHeader from './components/AppHeader.vue'
import AppSidebar from './components/AppSidebar.vue'
</script>

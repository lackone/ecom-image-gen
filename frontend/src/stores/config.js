import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const STORAGE_KEY = 'ecom_ai_profiles'
const ACTIVE_KEY = 'activeProfileId'

function loadProfiles() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function loadActiveId() {
  return localStorage.getItem(ACTIVE_KEY) || null
}

export const useConfigStore = defineStore('config', () => {
  const profiles = ref(loadProfiles())
  const activeProfileId = ref(loadActiveId())

  const activeProfile = computed(() => {
    return profiles.value.find(p => p.id === activeProfileId.value) || profiles.value[0] || null
  })

  const hasAnyProfile = computed(() => profiles.value.length > 0)

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles.value))
    if (activeProfileId.value) {
      localStorage.setItem(ACTIVE_KEY, activeProfileId.value)
    }
  }

  function addProfile(profile) {
    profiles.value.push(profile)
    if (!activeProfileId.value) {
      activeProfileId.value = profile.id
    }
    save()
  }

  function updateProfile(id, data) {
    const idx = profiles.value.findIndex(p => p.id === id)
    if (idx !== -1) {
      profiles.value[idx] = { ...profiles.value[idx], ...data }
      save()
    }
  }

  function removeProfile(id) {
    profiles.value = profiles.value.filter(p => p.id !== id)
    if (activeProfileId.value === id) {
      activeProfileId.value = profiles.value[0]?.id || null
    }
    save()
  }

  function setActive(id) {
    activeProfileId.value = id
    profiles.value.forEach(p => {
      p.isActive = (p.id === id)
    })
    save()
  }

  return {
    profiles,
    activeProfileId,
    activeProfile,
    hasAnyProfile,
    addProfile,
    updateProfile,
    removeProfile,
    setActive,
    save,
  }
})

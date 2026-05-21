import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const STORAGE_KEY = 'ecom_ai_history'
const MAX_RECORDS = 200

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const list = JSON.parse(raw)
    if (!Array.isArray(list)) return []
    // 清洗旧记录中的大 base64 字段，防止配额超限
    return list.map(r => {
      const cleaned = { ...r }
      if (cleaned.referenceImageUrl && typeof cleaned.referenceImageUrl === 'string' && cleaned.referenceImageUrl.startsWith('data:')) {
        cleaned.referenceImageUrl = null
        cleaned.hasReferenceImages = true
      }
      if (Array.isArray(cleaned.referenceImageUrls)) {
        cleaned.referenceImageUrls = null
        cleaned.hasReferenceImages = true
        cleaned.referenceCount = cleaned.referenceImageUrls.length
      }
      return cleaned
    })
  } catch {
    return []
  }
}

export const useHistoryStore = defineStore('history', () => {
  const records = ref(loadHistory())

  const sortedRecords = computed(() => {
    return [...records.value].sort((a, b) => {
      if (a.favorite && !b.favorite) return -1
      if (!a.favorite && b.favorite) return 1
      return new Date(b.createdAt) - new Date(a.createdAt)
    })
  })

  const favorites = computed(() => sortedRecords.value.filter(r => r.favorite))

  function save() {
    const data = JSON.stringify(records.value)
    try {
      localStorage.setItem(STORAGE_KEY, data)
    } catch (e) {
      if (e.name === 'QuotaExceededError' || e.code === 22) {
        // 配额超限：逐条删除最旧的非收藏记录，直到能存下
        const original = [...records.value]
        let trimmed = original
        while (trimmed.length > 0) {
          // 找最旧且未收藏的记录
          const oldestIdx = trimmed.findLastIndex(r => !r.favorite)
          if (oldestIdx === -1) break // 全是收藏的，无法删减
          trimmed.splice(oldestIdx, 1)
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
            records.value = trimmed
            return
          } catch (err2) {
            if (err2.name !== 'QuotaExceededError' && err2.code !== 22) throw err2
          }
        }
        // 如果删到只剩收藏的还存不下，清空全部
        console.error('[History] localStorage 配额不足，无法保存任何记录')
      } else {
        throw e
      }
    }
  }

  function addRecord(record) {
    records.value.unshift(record)
    if (records.value.length > MAX_RECORDS) {
      records.value = records.value.slice(0, MAX_RECORDS)
    }
    save()
  }

  function removeRecord(id) {
    records.value = records.value.filter(r => r.id !== id)
    save()
  }

  function toggleFavorite(id) {
    const r = records.value.find(r => r.id === id)
    if (r) {
      r.favorite = !r.favorite
      save()
    }
  }

  function getRecordById(id) {
    return records.value.find(r => r.id === id)
  }

  return {
    records,
    sortedRecords,
    favorites,
    addRecord,
    removeRecord,
    toggleFavorite,
    getRecordById,
  }
})

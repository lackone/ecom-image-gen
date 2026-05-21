import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useGenerationStore = defineStore('generation', () => {
  const status = ref('idle') // idle | loading | success | error
  const progress = ref(0)
  const estimatedTime = ref(0)
  const results = ref([])
  const errorMessage = ref('')
  const currentParams = ref(null)

  function startGenerating(params) {
    status.value = 'loading'
    progress.value = 0
    estimatedTime.value = 15
    errorMessage.value = ''
    currentParams.value = params
  }

  function setProgress(p, est) {
    progress.value = p
    if (est !== undefined) estimatedTime.value = est
  }

  function finishSuccess(images) {
    status.value = 'success'
    progress.value = 100
    results.value = images
  }

  function finishError(msg) {
    status.value = 'error'
    errorMessage.value = msg
  }

  function cancel() {
    status.value = 'idle'
    progress.value = 0
  }

  function reset() {
    status.value = 'idle'
    progress.value = 0
    results.value = []
    errorMessage.value = ''
    currentParams.value = null
  }

  return {
    status,
    progress,
    estimatedTime,
    results,
    errorMessage,
    currentParams,
    startGenerating,
    setProgress,
    finishSuccess,
    finishError,
    cancel,
    reset,
  }
})

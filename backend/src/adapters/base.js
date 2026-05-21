/**
 * Adapter 基类
 */
export class BaseAdapter {
  constructor(profile) {
    this.profile = profile
    this.apiBaseUrl = profile.apiBaseUrl?.replace(/\/$/, '') || ''
    this.apiKey = profile.apiKey
    this.modelId = profile.modelId
  }

  buildHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
    }
  }

  async text2img(request) {
    throw new Error('Not implemented')
  }

  async image2img(request) {
    throw new Error('Not implemented')
  }

  async testConnection() {
    throw new Error('Not implemented')
  }

  async post(url, body, extraHeaders = {}) {
    const response = await fetch(url, {
      method: 'POST',
      headers: { ...this.buildHeaders(), ...extraHeaders },
      body: JSON.stringify(body),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      const error = new Error(data.error?.message || `HTTP ${response.status}`)
      error.status = response.status
      error.code = data.error?.code || data.code
      throw error
    }

    return data
  }

  extractImages(data, responseFormat = 'url') {
    if (Array.isArray(data.data)) {
      return data.data.map(item => responseFormat === 'url' ? item.url : item.b64_json).filter(Boolean)
    }
    if (Array.isArray(data.output?.results)) {
      return data.output.results.map(r => r.url).filter(Boolean)
    }
    if (data.url) return [data.url]
    if (data.b64_json) return [data.b64_json]
    return []
  }
}

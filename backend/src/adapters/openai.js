import { BaseAdapter } from './base.js'

export class OpenAIAdapter extends BaseAdapter {
  resolveSize(aspectRatio, resolution) {
    const sizeMap = {
      '1:1': { '1K': '1024x1024', '2K': '2048x2048', '4K': '4096x4096' },
      '4:3': { '1K': '1024x768',  '2K': '2048x1536', '4K': '4096x3072' },
      '16:9':{ '1K': '1024x576',  '2K': '2048x1152', '4K': '4096x2304' },
      '3:4': { '1K': '768x1024',  '2K': '1536x2048', '4K': '3072x4096' },
      '9:16':{ '1K': '576x1024',  '2K': '1152x2048', '4K': '2304x4096' },
    }
    return sizeMap[aspectRatio]?.[resolution] || '1024x1024'
  }

  buildPayload(request, responseFormat = 'url') {
    const { prompt, negativePrompt, aspectRatio, resolution, batchSize } = request
    const size = this.resolveSize(aspectRatio, resolution)

    const body = {
      model: this.modelId,
      prompt,
      n: Math.min(Math.max(batchSize || 1, 1), 4),
      size,
      response_format: responseFormat,
    }

    if (request.quality) body.quality = request.quality
    if (request.style) body.style = request.style

    return body
  }

  async text2img(request) {
    try {
      const data = await this.post(
        `${this.apiBaseUrl}/images/generations`,
        this.buildPayload(request, 'url')
      )
      return this.extractImages(data, 'url')
    } catch (err) {
      const data = await this.post(
        `${this.apiBaseUrl}/images/generations`,
        this.buildPayload(request, 'b64_json')
      )
      return this.extractImages(data, 'b64_json')
    }
  }

  async image2img(request) {
    const body = this.buildPayload(request, 'url')
    if (request.image) {
      body.image = typeof request.image === 'string' && request.image.startsWith('data:')
        ? request.image.split(',')[1]
        : request.image
    }
    if (request.strength !== undefined) {
      body.strength = request.strength
    }

    try {
      const data = await this.post(`${this.apiBaseUrl}/images/generations`, body)
      return this.extractImages(data, 'url')
    } catch {
      const data = await this.post(`${this.apiBaseUrl}/images/generations`, { ...body, response_format: 'b64_json' })
      return this.extractImages(data, 'b64_json')
    }
  }

  async testConnection() {
    try {
      const resp = await fetch(`${this.apiBaseUrl}/models`, {
        headers: this.buildHeaders(),
      })
      if (resp.ok) {
        return { ok: true, message: '连接成功' }
      }
      const data = await this.post(`${this.apiBaseUrl}/images/generations`, {
        model: this.modelId,
        prompt: 'test',
        n: 1,
        size: '1024x1024',
      }).catch(e => {
        if (e.status === 401) throw e
        return null
      })
      if (data) return { ok: true, message: '连接成功' }
      return { ok: true, message: '服务端可达' }
    } catch (err) {
      if (err.status === 401) {
        return { ok: false, message: 'API Key 无效或已过期' }
      }
      return { ok: false, message: err.message || '连接失败' }
    }
  }
}

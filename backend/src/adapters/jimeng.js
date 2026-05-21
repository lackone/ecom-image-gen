import { BaseAdapter } from './base.js'

export class JimengAdapter extends BaseAdapter {
  resolveSize(aspectRatio, resolution) {
    const sizeMap = {
      '1:1': { '1K': [1024, 1024], '2K': [2048, 2048], '4K': [4096, 4096] },
      '4:3': { '1K': [1024, 768],  '2K': [2048, 1536], '4K': [4096, 3072] },
      '16:9':{ '1K': [1024, 576],  '2K': [2048, 1152], '4K': [4096, 2304] },
      '3:4': { '1K': [768, 1024],  '2K': [1536, 2048], '4K': [3072, 4096] },
      '9:16':{ '1K': [576, 1024],  '2K': [1152, 2048], '4K': [2304, 4096] },
    }
    return sizeMap[aspectRatio]?.[resolution] || [1024, 1024]
  }

  buildPayload(request) {
    const { prompt, negativePrompt, aspectRatio, resolution, batchSize } = request
    const [width, height] = this.resolveSize(aspectRatio, resolution)

    const body = {
      model: this.modelId,
      prompt,
      width,
      height,
      n: Math.min(Math.max(batchSize || 1, 1), 4),
    }

    if (negativePrompt) body.negative_prompt = negativePrompt

    return body
  }

  async text2img(request) {
    const data = await this.post(
      `${this.apiBaseUrl}/v1/images/generations`,
      this.buildPayload(request)
    )
    return this.extractImages(data)
  }

  async image2img(request) {
    const body = this.buildPayload(request)
    if (request.image) {
      body.image = typeof request.image === 'string' && request.image.startsWith('data:')
        ? request.image
        : `data:image/png;base64,${request.image}`
    }
    if (request.strength !== undefined) {
      body.strength = request.strength
    }
    const data = await this.post(
      `${this.apiBaseUrl}/v1/images/generations`,
      body
    )
    return this.extractImages(data)
  }

  async testConnection() {
    try {
      const data = await this.post(
        `${this.apiBaseUrl}/v1/images/generations`,
        {
          model: this.modelId,
          prompt: 'test',
          width: 1024,
          height: 1024,
          n: 1,
        }
      )
      return { ok: true, message: '连接成功' }
    } catch (err) {
      if (err.status === 401) return { ok: false, message: 'API Key 无效' }
      return { ok: false, message: err.message || '连接失败' }
    }
  }
}

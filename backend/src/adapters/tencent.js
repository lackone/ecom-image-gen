import { BaseAdapter } from './base.js'

export class TencentAdapter extends BaseAdapter {
  resolveSize(aspectRatio, resolution) {
    const sizeMap = {
      '1:1': { '1K': '1024:1024', '2K': '2048:2048', '4K': '4096:4096' },
      '4:3': { '1K': '1024:768',  '2K': '2048:1536', '4K': '4096:3072' },
      '16:9':{ '1K': '1024:576',  '2K': '2048:1152', '4K': '4096:2304' },
      '3:4': { '1K': '768:1024',  '2K': '1536:2048', '4K': '3072:4096' },
      '9:16':{ '1K': '576:1024',  '2K': '1152:2048', '4K': '2304:4096' },
    }
    return sizeMap[aspectRatio]?.[resolution] || '1024:1024'
  }

  buildPayload(request) {
    const { prompt, negativePrompt, aspectRatio, resolution, batchSize } = request
    const [width, height] = this.resolveSize(aspectRatio, resolution).split(':').map(Number)

    return {
      Model: this.modelId,
      Prompt: prompt,
      NegativePrompt: negativePrompt || '',
      Width: width,
      Height: height,
      Seed: request.seed || 0,
      Sample: batchSize || 1,
    }
  }

  async text2img(request) {
    const data = await this.post(
      `${this.apiBaseUrl}/`,
      this.buildPayload(request),
      { 'X-TC-Action': 'TextToImage' }
    )
    if (data.Response?.Result?.ImageUrls) {
      return data.Response.Result.ImageUrls
    }
    return this.extractImages(data)
  }

  async image2img(request) {
    const body = this.buildPayload(request)
    if (request.image) {
      body.ImageBase64 = typeof request.image === 'string' && request.image.startsWith('data:')
        ? request.image.split(',')[1]
        : request.image
    }
    const data = await this.post(
      `${this.apiBaseUrl}/`,
      body,
      { 'X-TC-Action': 'ImageToImage' }
    )
    if (data.Response?.Result?.ImageUrls) {
      return data.Response.Result.ImageUrls
    }
    return this.extractImages(data)
  }

  async testConnection() {
    try {
      const data = await this.post(
        `${this.apiBaseUrl}/`,
        {
          Model: this.modelId,
          Prompt: 'test',
          Width: 1024,
          Height: 1024,
        },
        { 'X-TC-Action': 'TextToImage' }
      )
      if (data.Response?.Error) {
        return { ok: false, message: data.Response.Error.Message }
      }
      return { ok: true, message: '连接成功' }
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        return { ok: false, message: '鉴权失败，请检查 SecretId/SecretKey' }
      }
      return { ok: false, message: err.message || '连接失败' }
    }
  }
}

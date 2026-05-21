/**
 * 阿里云百炼千问图像模型（Qwen-Image）适配器
 *
 * 千问图像模型使用同步接口：
 * POST https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation
 *
 * 请求体格式（ messages 风格，与通义千问 LLM 一致）：
 * {
 *   model: "qwen-image-2.0-pro",
 *   input: {
 *     messages: [
 *       {
 *         role: "user",
 *         content: [{ text: "提示词..." }]
 *       }
 *     ]
 *   },
 *   parameters: {
 *     size: "2048*2048",
 *     negative_prompt: "...",
 *     n: 1,
 *     prompt_extend: true,
 *     watermark: false,
 *     seed?: number
 *   }
 * }
 *
 * 响应格式：
 * {
 *   output: {
 *     choices: [
 *       {
 *         finish_reason: "stop",
 *         message: {
 *           role: "assistant",
 *           content: [{ image: "https://..." }]
 *         }
 *       }
 *     ]
 *   },
 *   usage: { width, height, image_count }
 * }
 *
 * 注意：
 * - qwen-image-2.0-pro / qwen-image-2.0 仅支持同步接口
 * - qwen-image-max / qwen-image-plus 支持异步接口（当前不实现）
 * - size 格式为 "宽*高"，如 "2048*2048"
 * - n 参数：qwen-image-2.0 系列支持 1~6 张，max/plus 系列固定为 1
 * - 图片 URL 有效期 24 小时，后端拿到后需立即下载
 */
import { BaseAdapter } from './base.js'

export class AliyunAdapter extends BaseAdapter {
  /**
   * 将前端比例+分辨率映射为千问支持的 size 字符串
   * qwen-image-2.0 系列支持自由宽高（总像素 512*512 ~ 2048*2048）
   */
  resolveSize(aspectRatio, resolution) {
    const sizeMap = {
      '1:1':  { '1K': '1024*1024', '2K': '2048*2048' },
      '4:3':  { '1K': '1024*768',  '2K': '2048*1536' },
      '16:9': { '1K': '1024*576',  '2K': '2048*1152' },
      '3:4':  { '1K': '768*1024',  '2K': '1536*2048' },
      '9:16': { '1K': '576*1024',  '2K': '1152*2048' },
    }
    return sizeMap[aspectRatio]?.[resolution] || '1024*1024'
  }

  /**
   * 构建千问同步接口请求体
   */
  buildPayload(request) {
    const { prompt, negativePrompt, aspectRatio, resolution, batchSize } = request
    const size = this.resolveSize(aspectRatio, resolution)

    return {
      model: this.modelId,
      input: {
        messages: [
          {
            role: 'user',
            content: [{ text: prompt }],
          },
        ],
      },
      parameters: {
        size,
        n: Math.min(Math.max(batchSize || 1, 1), 6),
        ...(negativePrompt ? { negative_prompt: negativePrompt } : {}),
        prompt_extend: request.promptExtend !== false, // 默认 true
        watermark: request.watermark === true,         // 默认 false
        ...(request.seed !== undefined ? { seed: request.seed } : {}),
      },
    }
  }

  getApiUrl() {
    // 兼容用户填写 https://dashscope.aliyuncs.com 或 https://dashscope.aliyuncs.com/api/v1
    const base = this.apiBaseUrl.replace(/\/api\/v1\/?$/, '')
    return `${base}/api/v1/services/aigc/multimodal-generation/generation`
  }

  async text2img(request) {
    const data = await this.post(
      this.getApiUrl(),
      this.buildPayload(request)
    )
    return this.extractImages(data)
  }

  async image2img(request) {
    const body = this.buildPayload(request)

    // 千问图像编辑：content 数组中图片必须在 text 之前
    // 支持单图编辑和多图融合（最多 3 张）
    const content = []

    const images = request.images || (request.image ? [request.image] : [])
    for (const img of images.slice(0, 3)) {
      const imageUrl = typeof img === 'string' && img.startsWith('data:')
        ? img
        : `data:image/png;base64,${img}`
      content.push({ image: imageUrl })
    }

    content.push({ text: request.prompt })
    body.input.messages[0].content = content

    // qwen-image-edit 特殊处理：不可指定 size，n 固定为 1
    if (this.modelId === 'qwen-image-edit') {
      delete body.parameters.size
      delete body.parameters.prompt_extend
      body.parameters.n = 1
    }

    const data = await this.post(
      this.getApiUrl(),
      body
    )
    return this.extractImages(data)
  }

  async testConnection() {
    try {
      const data = await this.post(
        this.getApiUrl(),
        {
          model: this.modelId,
          input: {
            messages: [
              {
                role: 'user',
                content: [{ text: 'test' }],
              },
            ],
          },
          parameters: {
            size: '1024*1024',
            n: 1,
          },
        }
      )
      if (data) return { ok: true, message: '连接成功' }
      return { ok: false, message: '未知错误' }
    } catch (err) {
      if (err.status === 401) return { ok: false, message: 'API Key 无效' }
      if (err.status === 400) {
        // 400 可能是模型ID错误或参数格式问题，说明服务端可达
        return { ok: true, message: '服务端可达（模型ID可能需要确认）' }
      }
      return { ok: false, message: err.message || '连接失败' }
    }
  }

  /**
   * 重写 extractImages 以支持千问同步接口响应格式
   * output.choices[0].message.content[0].image
   */
  extractImages(data) {
    // 千问同步接口格式
    if (data.output?.choices?.[0]?.message?.content) {
      const content = data.output.choices[0].message.content
      return content
        .filter(item => item && item.image)
        .map(item => item.image)
    }
    // 异步接口兜底（output.results[].url）
    if (Array.isArray(data.output?.results)) {
      return data.output.results.map(r => r.url).filter(Boolean)
    }
    // OpenAI 兼容格式兜底
    if (Array.isArray(data.data)) {
      return data.data.map(item => item.url || item.b64_json).filter(Boolean)
    }
    if (data.url) return [data.url]
    if (data.b64_json) return [data.b64_json]
    return []
  }
}

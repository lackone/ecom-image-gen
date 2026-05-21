import { Router } from 'express'
import { createAdapter } from '../adapters/index.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import crypto from 'crypto'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const router = Router()

const UPLOAD_BASE = path.join(__dirname, '..', '..', 'uploads')

/**
 * 获取当前日期的 YYYY/MM/DD 路径
 */
function getDatePath() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}/${m}/${d}`
}

/**
 * 异步下载图片到本地（不阻塞响应）
 */
function scheduleDownload(results, recordId, baseTs) {
  const datePath = getDatePath()

  for (let i = 0; i < results.length; i++) {
    const item = results[i]
    if (!item) {
      console.warn(`[AsyncDownload] 跳过空结果 index=${i}`)
      continue
    }

    const fileName = `${baseTs}_${i}.png`
    const savePath = `${datePath}/${recordId}/${fileName}`
    const targetDir = path.join(UPLOAD_BASE, 'gens', path.dirname(savePath))
    try {
      fs.mkdirSync(targetDir, { recursive: true })
    } catch (err) {
      console.error(`[AsyncDownload] 创建目录失败: ${targetDir}`, err.message)
      continue
    }
    const targetFile = path.join(UPLOAD_BASE, 'gens', savePath)

    if (typeof item === 'string' && item.startsWith('http')) {
      console.log(`[AsyncDownload] 开始下载 ${i + 1}/${results.length}: ${item.substring(0, 80)}...`)
      fetch(item)
        .then(resp => {
          if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
          return resp.arrayBuffer()
        })
        .then(buf => {
          fs.writeFileSync(targetFile, Buffer.from(buf))
          console.log(`[AsyncDownload] 成功保存: ${targetFile}`)
        })
        .catch(err => console.error(`[AsyncDownload] 失败: ${item.substring(0, 80)}...`, err.message))
    } else if (typeof item === 'string' && item.startsWith('data:')) {
      try {
        const base64 = item.replace(/^data:image\/\w+;base64,/, '')
        fs.writeFileSync(targetFile, Buffer.from(base64, 'base64'))
        console.log(`[AsyncDownload] base64 保存成功: ${targetFile}`)
      } catch (err) {
        console.error(`[AsyncDownload] base64 保存失败: ${targetFile}`, err.message)
      }
    } else {
      console.warn(`[AsyncDownload] 未知类型，跳过 index=${i}:`, typeof item, item?.substring?.(0, 50))
    }
  }
}

/**
 * 计算本地保存路径列表（供前端历史记录使用）
 */
function computeLocalPaths(results, recordId, baseTs) {
  const datePath = getDatePath()
  return results.map((_, i) => `/gens/${datePath}/${recordId}/${baseTs}_${i}.png`)
}

/**
 * POST /api/generate
 * Body: {
 *   provider: 'openai' | 'aliyun' | 'tencent' | 'jimeng' | 'custom',
 *   modelId: string,
 *   apiKey: string,
 *   apiUrl?: string,
 *   extraHeaders?: Record<string, string>,
 *   request: {
 *     prompt: string,
 *     negativePrompt?: string,
 *     aspectRatio?: string,
 *     resolution?: string,
 *     batchSize?: number,
 *     stylePreset?: string,
 *     image?: string,       // 图生图/编辑：单张 base64 图片（与 images 二选一）
 *     images?: string[],    // 图像编辑/融合：多张 base64 图片，最多 3 张
 *   }
 * }
 * Response: {
 *   images: string[]  // 本地URL数组，如 ["/gens/2026/05/21/uuid/0.png"]
 * }
 *
 * 由后端调用各厂商 API，避免前端暴露 API Key
 * 图片下载保存到本地，避免厂商URL过期（千问URL仅24小时有效）
 */
router.post('/generate', async (req, res, next) => {
  try {
    const { provider, modelId, apiKey, apiBaseUrl, extraHeaders, request, sessionId } = req.body

    if (!provider || !apiKey) {
      return res.status(400).json({ error: '缺少 provider 或 apiKey' })
    }

    const profile = {
      provider,
      modelId: modelId || 'unknown',
      apiKey,
      apiBaseUrl,
      extraHeaders: extraHeaders || {},
    }

    const adapter = createAdapter(profile)
    const isImageMode = !!request.image || (Array.isArray(request.images) && request.images.length > 0)

    const results = isImageMode
      ? await adapter.image2img(request)
      : await adapter.text2img(request)

    // 使用前端传来的 sessionId 作为归档目录，实现会话级图片管理
    const sid = sessionId || crypto.randomUUID()
    const recordId = crypto.randomUUID()  // 每条生成记录独立ID，避免删除时误删同会话其他记录
    const baseTs = Date.now()
    const localPaths = computeLocalPaths(results, sid, baseTs)

    // 后台异步下载图片到本地（不阻塞响应）
    scheduleDownload(results, sid, baseTs)

    // 组装每张图片的详情
    const imageList = results.map((url, i) => ({
      index: i,
      sourceUrl: url,
      localPath: localPaths[i],
    }))

    res.json({
      ok: true,
      recordId,
      sessionId: sid,
      count: results.length,
      images: imageList,
    })
  } catch (err) {
    console.error('[Generate Error]', err)
    next(err)
  }
})

/**
 * POST /api/generate/test
 * 测试连接
 */
router.post('/generate/test', async (req, res, next) => {
  try {
    const { provider, modelId, apiKey, apiBaseUrl, extraHeaders } = req.body

    const profile = {
      provider,
      modelId: modelId || 'unknown',
      apiKey,
      apiBaseUrl,
      extraHeaders: extraHeaders || {},
    }

    const adapter = createAdapter(profile)
    const result = await adapter.testConnection()
    res.json(result)
  } catch (err) {
    next(err)
  }
})

export default router

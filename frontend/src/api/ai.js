/**
 * AI 接口统一封装层（后端代理模式）
 * 前端不再直接调用各厂商 API，而是通过后端 /api/generate 代理，避免 API Key 暴露
 *
 * 负责：
 * 1. 将 profile + request 发给后端代理
 * 2. 统一错误处理（超时、重试）
 * 3. 图片下载/解码（URL → Blob / base64 → Blob）
 * 4. 上传到服务端 gens/ 目录（由 fileStorage.js 处理）
 */

const API_BASE = '/api'

/**
 * 文生图
 * @param {Object} request - 前端统一请求格式
 * @param {Object} profile - 当前激活的模型配置
 * @param {string} sessionId - 会话ID
 * @returns {Promise<{images: string[], localPaths: string[], recordId: string, count: number}>}
 */
export async function generateText2Image(request, profile, sessionId) {
  return callGenerate(request, profile, sessionId)
}

/**
 * 图生图
 * @param {Object} request - 前端统一请求格式（含 image）
 * @param {Object} profile - 当前激活的模型配置
 * @param {string} sessionId - 会话ID
 * @returns {Promise<{images: string[], localPaths: string[], recordId: string, count: number}>}
 */
export async function generateImage2Image(request, profile, sessionId) {
  return callGenerate(request, profile, sessionId)
}

/**
 * 调用后端代理接口
 * @returns {Promise<{images: string[], localPaths: string[], recordId: string, count: number}>}
 */
async function callGenerate(request, profile, sessionId) {
  const resp = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: profile.provider,
      modelId: profile.modelId,
      apiKey: profile.apiKey,
      apiBaseUrl: profile.apiBaseUrl,
      extraHeaders: profile.extraHeaders || {},
      request,
      sessionId,
    }),
  })

  const data = await resp.json().catch(() => ({}))

  if (!resp.ok) {
    const error = new Error(data.error || `HTTP ${resp.status}`)
    error.status = resp.status
    throw error
  }

  if (!data.ok || !Array.isArray(data.images)) {
    throw new Error(data.error || '后端返回格式异常')
  }

  const images = data.images.map(item => item.sourceUrl)
  const localPaths = data.images.map(item => item.localPath)

  return { images, localPaths, recordId: data.recordId, count: data.count }
}

/**
 * 测试连接
 * @param {Object} profile
 * @returns {Promise<{ok: boolean, message: string}>}
 */
export async function testConnection(profile) {
  const resp = await fetch(`${API_BASE}/generate/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: profile.provider,
      modelId: profile.modelId,
      apiKey: profile.apiKey,
      apiBaseUrl: profile.apiBaseUrl,
      extraHeaders: profile.extraHeaders || {},
    }),
  })

  const data = await resp.json().catch(() => ({}))

  if (!resp.ok) {
    return { ok: false, message: data.error || `HTTP ${resp.status}` }
  }

  return data
}

// normalizeImages 已移除：后端直接返回本地永久URL，无需前端处理

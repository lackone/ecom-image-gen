/**
 * 图片存储工具
 * 负责与后端交互，将图片保存到服务端 gens/ 目录
 *
 * 目录结构：
 * gens/YYYY/MM/DD/{recordId}/
 *   - 0.png, 1.png ...          原图
 *   - ref.png                   参考图
 * gens/thumbs/YYYY/MM/DD/
 *   - {recordId}_0.jpg          缩略图
 */

const API_BASE = '/api'

/**
 * 获取当前日期的 YYYY/MM/DD 路径
 */
function getDatePath(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}/${m}/${d}`
}

/**
 * 上传图片到服务端保存
 * @param {string} recordId
 * @param {number} index
 * @param {Blob} blob
 * @param {string} mimeType
 * @returns {Promise<string>} - 服务端返回的 URL 路径
 */
export async function saveImage(recordId, index, blob, mimeType = 'image/png') {
  const datePath = getDatePath()
  const ext = mimeType === 'image/jpeg' ? 'jpg' : 'png'
  const filename = `${index}.${ext}`
  const relativePath = `${datePath}/${recordId}/${filename}`

  const formData = new FormData()
  formData.append('file', blob, filename)
  formData.append('path', relativePath)

  const resp = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!resp.ok) {
    const err = await resp.text()
    throw new Error(`上传失败: ${err}`)
  }

  const data = await resp.json()
  return data.url || `/gens/${relativePath}`
}

/**
 * 上传缩略图
 * @param {string} recordId
 * @param {number} index
 * @param {Blob} blob
 * @returns {Promise<string>}
 */
export async function saveThumbnail(recordId, index, blob) {
  const datePath = getDatePath()
  const filename = `${recordId}_${index}.jpg`
  const relativePath = `thumbs/${datePath}/${filename}`

  const formData = new FormData()
  formData.append('file', blob, filename)
  formData.append('path', relativePath)

  const resp = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!resp.ok) throw new Error('缩略图上传失败')
  const data = await resp.json()
  return data.url || `/gens/${relativePath}`
}

/**
 * 上传参考图
 * @param {string} recordId
 * @param {Blob} blob
 * @returns {Promise<string>}
 */
export async function saveReferenceImage(recordId, blob) {
  const datePath = getDatePath()
  const relativePath = `${datePath}/${recordId}/ref.png`

  const formData = new FormData()
  formData.append('file', blob, 'ref.png')
  formData.append('path', relativePath)

  const resp = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!resp.ok) throw new Error('参考图上传失败')
  const data = await resp.json()
  return data.url || `/gens/${relativePath}`
}

/**
 * 获取图片 URL
 */
export function getImageUrl(recordId, index, datePath) {
  const dp = datePath || getDatePath()
  return `/gens/${dp}/${recordId}/${index}.png`
}

/**
 * 获取缩略图 URL
 */
export function getThumbnailUrl(recordId, index, datePath) {
  const dp = datePath || getDatePath()
  return `/gens/thumbs/${dp}/${recordId}_${index}.jpg`
}

/**
 * 获取参考图 URL
 */
export function getReferenceImageUrl(recordId, datePath) {
  const dp = datePath || getDatePath()
  return `/gens/${dp}/${recordId}/ref.png`
}

/**
 * 删除整条记录的图片文件夹
 * @param {string} recordId
 * @param {string} datePath
 */
export async function deleteRecordFolder(recordId, datePath) {
  const dp = datePath || getDatePath()
  const resp = await fetch(`${API_BASE}/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: `${dp}/${recordId}` }),
  })
  if (!resp.ok) throw new Error('删除失败')
}

/**
 * 生成 100×100 缩略图
 * @param {Blob} imageBlob
 * @returns {Promise<Blob>}
 */
export async function generateThumbnail(imageBlob) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(imageBlob)

    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 100
      canvas.height = 100
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, 100, 100)
      URL.revokeObjectURL(url)

      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
        else reject(new Error('缩略图生成失败'))
      }, 'image/jpeg', 0.85)
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('图片加载失败'))
    }

    img.src = url
  })
}

/**
 * 检查文件是否存在
 * @param {string} recordId
 * @param {number} index
 * @param {string} datePath
 * @returns {Promise<boolean>}
 */
export async function exists(recordId, index, datePath) {
  const dp = datePath || getDatePath()
  try {
    const resp = await fetch(`/gens/${dp}/${recordId}/${index}.png`, { method: 'HEAD' })
    return resp.ok
  } catch {
    return false
  }
}

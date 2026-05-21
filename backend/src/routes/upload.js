import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const router = Router()

const UPLOAD_BASE = path.join(__dirname, '..', '..', 'uploads')

/**
 * 根据请求中的 path 参数动态决定存储路径
 */
const storage = multer.diskStorage({
  destination(req, file, cb) {
    const relativePath = req.body.path || ''
    const targetDir = path.join(UPLOAD_BASE, 'gens', path.dirname(relativePath))
    fs.mkdirSync(targetDir, { recursive: true })
    cb(null, targetDir)
  },
  filename(req, file, cb) {
    const relativePath = req.body.path || ''
    const basename = path.basename(relativePath) || file.originalname
    cb(null, basename)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
})

/**
 * POST /api/upload
 * Body: multipart/form-data
 *   - file: 图片文件
 *   - path: 相对路径，如 2026/05/21/uuid/0.png
 * Response: { url: "/gens/2026/05/21/uuid/0.png" }
 */
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '未上传文件' })
  }

  const relativePath = req.body.path || req.file.filename
  const url = `/gens/${relativePath.replace(/\\/g, '/')}`

  res.json({ ok: true, url, path: relativePath })
})

/**
 * POST /api/delete
 * Body: JSON { path: "2026/05/21/uuid" }
 */
router.post('/delete', (req, res) => {
  const { path: relativePath } = req.body
  if (!relativePath) {
    return res.status(400).json({ error: '缺少 path 参数' })
  }

  const target = path.join(UPLOAD_BASE, 'gens', relativePath)
  // 安全检查：确保在 uploads/gens 目录内
  if (!target.startsWith(path.join(UPLOAD_BASE, 'gens'))) {
    return res.status(403).json({ error: '非法路径' })
  }

  fs.rm(target, { recursive: true, force: true }, (err) => {
    if (err) {
      console.error('[Delete Error]', err)
      return res.status(500).json({ error: '删除失败' })
    }
    res.json({ ok: true })
  })
})

export default router

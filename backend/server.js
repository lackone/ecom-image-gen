import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import uploadRoutes from './src/routes/upload.js'
import generateRoutes from './src/routes/generate.js'
import { errorHandler } from './src/middleware/errorHandler.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// 静态资源服务：gens/ 目录映射到 /gens
app.use('/gens', (req, res, next) => {
  const filePath = path.join(__dirname, 'uploads', 'gens', decodeURIComponent(req.path))
  console.log(`[Static] 请求: ${req.path} -> 查找: ${filePath} 存在=${fs.existsSync(filePath)}`)
  next()
}, express.static(path.join(__dirname, 'uploads', 'gens')))
app.use('/refs', express.static(path.join(__dirname, 'uploads', 'refs')))

// 路由
app.use('/api', uploadRoutes)
app.use('/api', generateRoutes)

// 健康检查
app.get('/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() })
})

// 错误处理
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`[EcomImageGen] Backend running on http://localhost:${PORT}`)
})

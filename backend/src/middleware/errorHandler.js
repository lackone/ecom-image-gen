/**
 * 全局错误处理中间件
 */
export function errorHandler(err, req, res, next) {
  console.error('[Error]', err.message || err)

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: '文件过大' })
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ error: '字段名错误，期望 file' })
  }

  res.status(err.status || 500).json({
    error: err.message || '服务器内部错误',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}

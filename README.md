# EcomImageGen — 电商图片生成器

基于 AI 的电商场景图片生成工具，支持文生图、图生图和图像编辑，集成阿里云千问等模型 API。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Vue 3 + Vite + Pinia + Vue Router + Tailwind CSS + Ant Design Vue |
| 后端 | Node.js + Express + CORS + Multer |
| AI 接口 | 阿里云千问（通义万相） |

## 目录结构

```
ecom-image-gen/
├── frontend/          # 前端工程（Vite + Vue3）
│   ├── src/
│   │   ├── api/       # AI 接口请求封装
│   │   ├── components/# 公共组件（侧边栏等）
│   │   ├── pages/     # 页面（生成页、历史记录、设置等）
│   │   ├── stores/    # Pinia 状态管理
│   │   └── ...
│   └── package.json
├── backend/           # 后端工程（Express）
│   ├── src/
│   │   ├── routes/    # 路由：/api/upload、/api/generate
│   │   └── middleware/# 错误处理等中间件
│   ├── uploads/       # 本地图片存储目录
│   │   ├── gens/      # 生成结果图片
│   │   └── refs/      # 参考图/上传图片
│   ├── server.js      # 服务入口
│   └── package.json
└── README.md
```

## 前置要求

- [Node.js](https://nodejs.org/) >= 18
- npm（随 Node.js 附带）

## 安装依赖

分别进入前后端目录安装依赖：

```bash
# 后端
cd backend
npm install

# 前端
cd ../frontend
npm install
```

## 运行项目

### 1. 启动后端服务

```bash
cd backend
```

**开发模式**（文件变更自动重启）：
```bash
npm run dev
```

**生产模式**：
```bash
npm start
```

后端默认运行在 `http://localhost:3000`，可通过环境变量修改端口：
```bash
set PORT=4000 && npm run dev    # Windows PowerShell
$env:PORT=4000; npm run dev     # Windows PowerShell
PORT=4000 npm run dev           # Linux / macOS
```

### 2. 启动前端开发服务器

```bash
cd frontend
npm run dev
```

前端默认运行在 `http://localhost:5173`，打开浏览器访问该地址即可使用。

前端会通过代理或直连方式请求后端 `http://localhost:3000` 的接口与静态资源（`/gens/`、`/refs/`）。

## 功能特性

- **文生图**：输入提示词直接生成电商商品图
- **图生图**：上传 1~3 张参考图进行风格迁移或融合
- **图像编辑**：基于参考图进行 AI 编辑
- **批量生成**：支持一次生成 1~4 张图片
- **历史记录**：本地持久化，支持收藏、删除、全屏查看
- **多图预览**：生成结果和历史记录均支持弹窗多图切换（键盘 `←` `→` / `ESC`）
- **图片管理**：支持下载、查看、收藏、拖拽上传

## 配置 AI 模型

首次使用时，点击右上角 **设置**，添加模型配置：

| 配置项 | 说明 |
|--------|------|
| 模型 | 阿里云千问（通义万相） |
| API Key | 从阿里云控制台获取的 API Key |
| 其他参数 | 根据实际模型文档填写 endpoint 等 |

配置完成后即可在生成页面选择该模型进行创作。

## 构建生产版本

```bash
cd frontend
npm run build
```

构建产物输出到 `frontend/dist/` 目录，可部署到任意静态服务器或配合后端托管。

## 常见问题

### 本地图片 404
确认后端已正常启动，且 `backend/uploads/gens/` 目录存在并包含生成的图片文件。

### 前端请求后端失败
确认后端服务已启动，且前端请求的后端地址与后端实际监听地址一致（默认 `http://localhost:3000`）。

## License

MIT

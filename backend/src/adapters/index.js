import { OpenAIAdapter } from './openai.js'
import { AliyunAdapter } from './aliyun.js'
import { TencentAdapter } from './tencent.js'
import { JimengAdapter } from './jimeng.js'
import { CustomAdapter } from './custom.js'

const adapterMap = {
  openai: OpenAIAdapter,
  aliyun: AliyunAdapter,
  tencent: TencentAdapter,
  jimeng: JimengAdapter,
  custom: CustomAdapter,
}

export function createAdapter(profile) {
  const AdapterClass = adapterMap[profile.provider]
  if (!AdapterClass) {
    throw new Error(`不支持的厂商类型: ${profile.provider}`)
  }
  return new AdapterClass(profile)
}

export function getSupportedProviders() {
  return Object.keys(adapterMap)
}

export { OpenAIAdapter, AliyunAdapter, TencentAdapter, JimengAdapter, CustomAdapter }

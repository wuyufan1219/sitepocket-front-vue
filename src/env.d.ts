/// <reference types="vite/client" />

/**
 * 扩展 Vite 环境变量类型
 * 在 .env.development / .env.production 中定义的变量需在此声明
 */
interface ImportMetaEnv {
  /** API 基础地址（开发环境留空走 proxy，生产环境配置实际后端地址） */
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

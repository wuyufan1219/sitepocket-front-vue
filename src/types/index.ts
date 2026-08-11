/**
 * 前端通用类型定义
 */

/** 网站卡片（分类板块下的网站项） */
export interface WebsiteCard {
  id: number
  name: string
  url: string
  desc: string | null
  icon: string | null
}

/** 分类板块（一个子分类对应一个板块，内含若干网站） */
export interface Section {
  subCategoryId: number
  subCategoryName: string
  parentCategoryId: number
  websites: WebsiteCard[]
}

/** 搜索结果中的网站项（字段命名与 WebsiteCard 不同，后端返回的搜索接口字段） */
export interface SearchSite {
  id: number
  siteName: string
  siteUrl: string
  siteIcon: string | null
  siteDesc: string | null
}

/** 搜索分页数据 */
export interface SearchPageData {
  records: SearchSite[]
  total: number
  hasMore: boolean
}

/** 分类树子节点 */
export interface CategoryChild {
  id: number
  name: string
}

/** 分类树父节点 */
export interface CategoryNode {
  id: number
  name: string
  children?: CategoryChild[]
}

/** 后端统一响应包装 */
export interface ApiResponse<T = unknown> {
  data: T
  message?: string
  msg?: string
  code?: number
}

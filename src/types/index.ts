/**
 * 前端通用类型定义
 */

/** 网站可访问状态 */
export type SiteStatus = 'alive' | 'dead' | 'unknown'

/** 网站卡片（分类板块下的网站项） */
export interface WebsiteCard {
  id: number
  name: string
  url: string
  desc: string | null
  icon: string | null
  /** 后端返回的可访问状态，预留字段：alive=可用, dead=不可用, unknown=未知 */
  isAlive?: SiteStatus
  /** 检测状态：0=未检测, 1=正常, 2=疑似失效 */
  checkStatus?: number
  /** 收藏数 */
  favoriteCount?: number
  /** 累计访问量（最多访问排序用） */
  visitCount?: number
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
  /** 后端返回的可访问状态，预留字段 */
  isAlive?: SiteStatus
  /** 检测状态：0=未检测, 1=正常, 2=疑似失效 */
  checkStatus?: number
  /** 收藏数 */
  favoriteCount?: number
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
  siteCount?: number
}

/** 后端统一响应包装 */
export interface ApiResponse<T = unknown> {
  data: T
  message?: string
  msg?: string
  code?: number
}

/** 后台：网站列表项 */
export interface AdminWebsite {
  id: number
  siteName: string
  siteUrl: string
  siteIcon: string | null
  siteDesc: string | null
  sortOrder: number
  visitCount: number
  isPublic: number
  status: number
  /** 检测状态：0=未检测, 1=正常, 2=疑似失效 */
  checkStatus?: number
  /** 最后检测时间 */
  lastCheckTime?: string
  categoryIds: number[]
  categoryNames: string
  createTime?: string
  updateTime?: string
}

/** 后台：分页结果 */
export interface AdminPageData<T> {
  records: T[]
  total: number
  page: number
  size: number
  hasMore?: boolean
}

/** 后台：分类 */
export interface AdminCategory {
  id: number
  name: string
  parentId: number
  sortOrder: number
  createTime?: string
  updateTime?: string
}

/** 后台：前台注册用户 */
export interface AdminUser {
  id: number
  username: string
  nickName: string | null
  userSex: number | null
  status: number
  createTime?: string
  updateTime?: string
}

/** 后台：仪表盘统计 */
export interface DashboardStats {
  websiteCount: number
  aliveCount: number
  deadCount: number
  categoryCount: number
  userCount: number
  favoriteCount: number
}

/** 网站提交记录（前台我的提交 / 后台审核共用） */
export interface WebsiteSubmission {
  id: number
  userId: number
  siteName: string
  siteUrl: string
  siteDesc: string | null
  siteIcon: string | null
  categoryId: number | null
  categoryName: string | null
  status: number
  rejectReason: string | null
  createTime?: string
  updateTime?: string
}

<template>
  <div class="nav-wrapper" :style="{ '--accent': accentColor }">
    <!-- Hero 搜索区 -->
    <div class="hero">
      <h1>{{ heroTitle }}</h1>
      <p class="hero-subtitle">{{ heroSubtitle }}</p>
      <div class="search-box">
        <Search :size="18" class="search-icon" />
        <input v-model="keyword" :placeholder="searchPlaceholder" @keyup.enter="handleSearch" />
        <button v-if="keyword" class="search-clear" @click="clearSearch">✕</button>
      </div>
    </div>

    <!-- 搜索结果 -->
    <div class="search-results" v-if="searching || searchResults.length">
      <div class="search-header">
        <span v-if="searching">搜索中...</span>
        <span v-else>搜索「{{ lastKeyword }}」找到 {{ searchTotal }} 个结果</span>
      </div>
      <div class="site-grid" v-if="searchResults.length">
        <a v-for="site in searchResults" :key="site.id" :href="site.siteUrl" target="_blank" class="site-card" :class="siteStatusClass(site)">
          <button class="bookmark-btn" :class="{ active: bookmarked.has(site.id) }" @click.stop.prevent="toggleBookmark(site.id)" :title="bookmarked.has(site.id) ? '取消收藏' : '收藏'">
            <Heart :size="15" />
          </button>
          <div class="site-row">
            <img :src="site.siteIcon || getFavicon(site.siteUrl)" class="site-favicon" />
            <div class="site-text">
              <span class="site-name">{{ site.siteName }}</span>
              <span class="site-desc" v-if="site.siteDesc">{{ site.siteDesc }}</span>
            </div>
          </div>
        </a>
      </div>
      <!-- 加载更多触发器 -->
      <div v-if="searchHasMore && !searchingMore" ref="loadMoreTrigger" class="load-more">
        <span>滚动加载更多...</span>
      </div>
      <div v-if="searchingMore" class="load-more">
        <span>加载中...</span>
      </div>
      <div v-if="!searching && lastKeyword && !searchResults.length" class="no-result">未找到相关网站</div>
    </div>

    <!-- 分类板块滚动区 -->
    <div class="sections" v-if="!loading && !searchResults.length">
      <div class="sort-bar">
        <span class="sort-label">排序：</span>
        <button :class="{ active: sortMode === 'default' }" @click="sortMode = 'default'">默认</button>
        <button :class="{ active: sortMode === 'visit' }" @click="sortMode = 'visit'">最多访问</button>
      </div>
      <section
        v-for="sec in sortedSections"
        :key="sec.subCategoryId"
        :id="'section-' + sec.subCategoryId"
        class="category-section"
      >
        <div class="section-header">
          <h2>{{ sec.subCategoryName }}</h2>
          <span class="section-count">{{ sec.websites.length }} 个</span>
        </div>
        <div class="site-grid">
          <a v-for="site in sec.websites" :key="site.id" :href="site.url" target="_blank" class="site-card" :class="siteStatusClass(site)" @click="recordVisit(site.id)">
          <button class="bookmark-btn" :class="{ active: bookmarked.has(site.id) }" @click.stop.prevent="toggleBookmark(site.id)" :title="bookmarked.has(site.id) ? '取消收藏' : '收藏'">
            <Heart :size="15" />
          </button>
          <div class="site-row">
            <img :src="site.icon || getFavicon(site.url)" class="site-favicon" />
            <div class="site-text">
              <span class="site-name">
                <span v-if="site.checkStatus === 2" class="dead-badge" title="疑似失效">⚠</span>
                {{ site.name }}
              </span>
              <span class="site-desc" v-if="site.desc">{{ site.desc }}</span>
              <span class="site-fav" v-if="site.favoriteCount">{{ site.favoriteCount }} 人收藏</span>
            </div>
          </div>
        </a>
        </div>
      </section>
    </div>

    <div v-if="loading" class="loading-text">加载中...</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import request from '@/utils/request'
import { recordVisit } from '@/utils/visit'
import { useAuthStore } from '@/stores/auth'
import { Search, Heart } from '@lucide/vue'
import type { Section, SearchSite, SearchPageData } from '@/types'

/**
 * 通用导航页组件 —— 统一游戏 / 二次元 / 其他分类页的展示与搜索逻辑
 * 通过 props 区分主题文案、默认分类、主题色等差异
 */
const props = withDefaults(defineProps<{
  heroTitle: string
  heroSubtitle: string
  searchPlaceholder: string
  defaultCategoryId: number
  /** 主题色（hover、边框等强调色） */
  accentColor: string
  /** 是否在 onMounted 时额外加载分类树 */
  loadCategoryTree?: boolean
  /** 是否从路由 query.category 读取默认分类 */
  readRouteCategory?: boolean
}>(), {
  loadCategoryTree: false,
  readRouteCategory: false,
})

const route = useRoute()
const authStore = useAuthStore()

const keyword = ref('')
const loading = ref(true)
const activeCat = ref<number>(props.defaultCategoryId)

const sections = ref<Section[]>([])

// 搜索相关
const SEARCH_PAGE_SIZE = 20
const searching = ref(false)
const searchingMore = ref(false)
const lastKeyword = ref('')
const searchPage = ref(1)
const searchTotal = ref(0)
const searchHasMore = ref(false)
const searchResults = ref<SearchSite[]>([])

// 滚动加载触发器
const loadMoreTrigger = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

// 收藏状态
const bookmarked = ref(new Set<number>())
const bookmarkLoading = ref(new Set<number>())

async function toggleBookmark(siteId: number) {
  if (!authStore.token) {
    window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { initialView: 'login' } }))
    return
  }
  if (bookmarkLoading.value.has(siteId)) return
  bookmarkLoading.value.add(siteId)
  try {
    if (bookmarked.value.has(siteId)) {
      await request.delete(`/api/front/user/bookmark/${siteId}`)
      bookmarked.value.delete(siteId)
    } else {
      await request.post(`/api/front/user/bookmark/${siteId}`)
      bookmarked.value.add(siteId)
    }
  } catch (e) {
    console.error('收藏操作失败', e)
  } finally {
    bookmarkLoading.value.delete(siteId)
  }
}

const filteredSections = computed(() =>
  activeCat.value ? sections.value.filter(s => s.parentCategoryId === activeCat.value) : sections.value
)

// 排序：默认（后端顺序） / 最多访问（累计访问量倒序）
const sortMode = ref<'default' | 'visit'>('default')
const sortedSections = computed(() => {
  if (sortMode.value !== 'visit') return filteredSections.value
  return filteredSections.value.map(sec => ({
    ...sec,
    websites: [...sec.websites].sort((a, b) => (b.visitCount ?? 0) - (a.visitCount ?? 0)),
  }))
})

onMounted(async () => {
  try {
    const tasks: Promise<unknown>[] = [
      request.get('/api/front/website/sections').then((res) => {
        sections.value = res.data.data
      }),
    ]
    if (props.loadCategoryTree) {
      // 加载分类树（当前未在模板使用，保留以备扩展）
      tasks.push(request.get('/api/front/category/tree'))
    }
    await Promise.all(tasks)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
  if (props.readRouteCategory) {
    const qCat = route.query.category
    if (qCat) activeCat.value = Number(qCat)
  }
})

// 监听 loadMoreTrigger 元素变化，挂载 IntersectionObserver
watch(loadMoreTrigger, (el) => {
  observer?.disconnect()
  if (el) {
    observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && searchHasMore.value && !searchingMore.value) {
        loadMore()
      }
    }, { threshold: 0.1 })
    observer.observe(el)
  }
})

onUnmounted(() => observer?.disconnect())

async function handleSearch() {
  const q = keyword.value.trim()
  if (!q) return
  lastKeyword.value = q
  searching.value = true
  searchResults.value = []
  searchPage.value = 1
  searchTotal.value = 0
  searchHasMore.value = false
  try {
    const res = await request.get('/api/front/search', {
      params: { keyword: q, page: 1, size: SEARCH_PAGE_SIZE },
    })
    const pageData: SearchPageData = res.data.data
    searchResults.value = pageData.records || []
    searchTotal.value = pageData.total
    searchHasMore.value = pageData.hasMore
    searchPage.value = 1
  } catch (e) {
    console.error('搜索失败', e)
    searchResults.value = [{ id: 0, siteName: '网络错误', siteUrl: '#', siteIcon: null, siteDesc: String(e) }]
  } finally {
    searching.value = false
  }
}

async function loadMore() {
  if (!searchHasMore.value || searchingMore.value) return
  searchingMore.value = true
  const nextPage = searchPage.value + 1
  try {
    const res = await request.get('/api/front/search', {
      params: { keyword: lastKeyword.value, page: nextPage, size: SEARCH_PAGE_SIZE },
    })
    const pageData: SearchPageData = res.data.data
    searchResults.value.push(...(pageData.records || []))
    searchTotal.value = pageData.total
    searchHasMore.value = pageData.hasMore
    searchPage.value = nextPage
  } catch (e) {
    console.error('加载更多失败', e)
  } finally {
    searchingMore.value = false
    await nextTick()
    // 如果加载后仍有更多数据但触发器不可见，继续触发
    if (loadMoreTrigger.value && searchHasMore.value) {
      const rect = loadMoreTrigger.value.getBoundingClientRect()
      if (rect.top < window.innerHeight) loadMore()
    }
  }
}

function clearSearch() {
  keyword.value = ''
  searchResults.value = []
  lastKeyword.value = ''
  searchTotal.value = 0
  searchHasMore.value = false
  searchPage.value = 1
}

function getFavicon(url: string): string {
  try {
    return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`
  } catch {
    return ''
  }
}

/** 根据 checkStatus 返回 CSS 类名（疑似失效显示红色背景） */
function siteStatusClass(site: { checkStatus?: number }): string {
  return site.checkStatus === 2 ? 'status-dead' : ''
}
</script>

<style scoped>
.nav-wrapper { min-height: 100vh; margin: -56px -24px 0; }

.hero {
  text-align: center; padding: 104px 24px 80px;
  background: url("/wallhaven-pkw6y3.webp") center/cover no-repeat;
  color: #fff;
  text-shadow: 0 2px 8px rgba(0,0,0,0.5);
}
.hero h1 { font-size: 28px; margin: 0 0 8px; }
.hero-subtitle { font-size: 14px; opacity: 0.85; margin: 0 0 20px; }
.search-box {
  display: inline-flex; align-items: center; gap: 8px;
  background: #fff; border-radius: 8px; padding: 10px 16px;
  width: 100%; max-width: 480px; box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}
.search-box input { border: none; outline: none; font-size: 14px; width: 100%; color: #303133; }
.search-icon { color: #909399; flex-shrink: 0; }
.search-clear {
  border: none; background: #e0e3e9; color: #909399; width: 22px; height: 22px;
  border-radius: 50%; cursor: pointer; font-size: 12px; line-height: 1;
}
.search-clear:hover { background: #c0c4cc; color: #606266; }

.search-results { padding: 20px 24px 0; max-width: 1200px; margin: 0 auto; }
.search-header { font-size: 14px; color: #606266; margin-bottom: 14px; }
.no-result { text-align: center; padding: 40px; color: #909399; font-size: 14px; }
.load-more { text-align: center; padding: 20px; color: #909399; font-size: 13px; }

.sections { padding: 24px 24px 48px; max-width: 1200px; margin: 0 auto; }
.sort-bar {
  display: flex; align-items: center; gap: 8px;
  margin-bottom: 16px;
}
.sort-label { font-size: 13px; color: #909399; }
.sort-bar button {
  padding: 4px 14px; border: 1px solid #dcdfe6; border-radius: 14px;
  background: #fff; color: #606266; font-size: 13px; cursor: pointer;
  transition: all 0.15s;
}
.sort-bar button:hover { border-color: var(--accent); color: var(--accent); }
.sort-bar button.active { background: var(--accent); border-color: var(--accent); color: #fff; }
.category-section { margin-bottom: 36px; scroll-margin-top: 80px; }
.section-header {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 14px; padding-bottom: 8px; border-bottom: 2px solid #ebeef5;
}
.section-header h2 { margin: 0; font-size: 18px; color: #303133; }
.section-count { font-size: 12px; color: #909399; }

.site-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; }
.site-card {
  position: relative;
  display: flex; flex-direction: column; gap: 2px;
  padding: 12px 16px; border-radius: 8px;
  background: #fff; border: 1px solid #ebeef5;
  text-decoration: none; color: inherit; transition: all 0.15s;
}
/* 疑似失效 — 红色背景（与 ⚠ 图标同时出现） */
.site-card.status-dead   { background: #fff5f5; border-color: #fed7d7; }
.site-card.status-dead .site-name { color: #c53030; }
/* 主题色通过 CSS 变量 --accent 注入 */
.site-card:hover {
  border-color: var(--accent);
  box-shadow: 0 2px 8px color-mix(in srgb, var(--accent) 30%, transparent);
  transform: translateY(-1px);
}
.site-row { display: flex; align-items: center; gap: 10px; }
.site-favicon {
  width: 34px; height: 34px; border-radius: 6px;
  flex-shrink: 0; object-fit: contain;
}
.site-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.site-name { font-size: 14px; font-weight: 600; color: #303133; }
.dead-badge { color: #e6a23c; font-size: 12px; margin-right: 2px; }
.site-desc { font-size: 12px; color: #909399; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.site-fav { font-size: 11px; color: #e6a23c; }

/* 收藏按钮 */
.bookmark-btn {
  position: absolute; top: 6px; right: 6px;
  display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border-radius: 50%;
  border: none; background: transparent; color: #c0c4cc;
  cursor: pointer; transition: all 0.2s; z-index: 1;
}
.bookmark-btn:hover { background: #fef0f0; color: #f56c6c; }
.bookmark-btn.active { color: #f56c6c; background: #fef0f0; }

.loading-text { text-align: center; padding: 60px; color: #909399; font-size: 14px; }

@media (max-width: 640px) { .site-grid { grid-template-columns: 1fr; } }
</style>

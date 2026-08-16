<template>
  <div class="home-wrapper">
    <!-- ==================== Hero 搜索区 ==================== -->
    <section class="hero">
      <h1 class="hero-title">网站口袋</h1>
      <p class="hero-subtitle">发现、收藏、管理你的专属网址导航</p>
      <div class="search-box">
        <Search :size="20" class="search-icon" />
        <input
          v-model="keyword"
          placeholder="搜索全站网站..."
          @keyup.enter="handleSearch"
          @input="onKeywordInput"
        />
        <button v-if="keyword" class="search-clear" @click="clearSearch">✕</button>
        <!-- 实时建议下拉 -->
        <div v-if="suggestions.length && !searchResults.length" class="suggest-dropdown">
          <div
            v-for="s in suggestions"
            :key="s.id"
            class="suggest-item"
            @click="goToSite(s)"
          >
            <img :src="s.siteIcon || getFavicon(s.siteUrl)" class="suggest-favicon" />
            <span class="suggest-name">{{ s.siteName }}</span>
            <span class="suggest-cat">{{ s.categoryName }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== 搜索结果 ==================== -->
    <section class="search-results" v-if="searchResults.length || searching">
      <div class="search-header">
        <span v-if="searching">搜索中...</span>
        <span v-else>搜索「{{ lastKeyword }}」找到 {{ searchTotal }} 个结果</span>
        <button v-if="!searching" class="btn-back" @click="clearSearch">返回首页</button>
      </div>
      <div class="site-grid">
        <a
          v-for="site in searchResults"
          :key="site.id"
          :href="site.siteUrl"
          target="_blank"
          class="site-card"
          :class="siteStatusClass(site)"
          @click="recordVisit(site.id)"
        >
          <button class="bookmark-btn" :class="{ active: bookmarked.has(site.id) }" @click.stop.prevent="toggleBookmark(site.id)" :title="bookmarked.has(site.id) ? '取消收藏' : '收藏'">
            <Heart :size="15" />
          </button>
          <img :src="site.siteIcon || getFavicon(site.siteUrl)" class="site-favicon" />
          <div class="site-text">
            <span class="site-name">{{ site.siteName }}</span>
            <span class="site-desc" v-if="site.siteDesc">{{ site.siteDesc }}</span>
            <span class="site-fav" v-if="site.favoriteCount">{{ site.favoriteCount }} 人收藏</span>
          </div>
        </a>
      </div>
      <div v-if="searchHasMore && !searchingMore" ref="loadMoreTrigger" class="load-more">
        <span>滚动加载更多...</span>
      </div>
      <div v-if="searchingMore" class="load-more"><span>加载中...</span></div>
    </section>

    <!-- ==================== 未搜索时显示首页内容 ==================== -->
    <template v-if="!searchResults.length && !searching">
      <!-- 统计卡片 -->
      <section class="stats-row">
        <div class="stat-card">
          <span class="stat-num">{{ stats.siteCount }}</span>
          <span class="stat-label">收录网站</span>
        </div>
        <div class="stat-card">
          <span class="stat-num">{{ stats.catCount }}</span>
          <span class="stat-label">分类数量</span>
        </div>
        <div class="stat-card">
          <span class="stat-num">{{ alivePercent }}%</span>
          <span class="stat-label">可用率</span>
        </div>
      </section>

      <!-- 分类快捷入口 -->
      <section class="category-section">
        <h2 class="section-title">分类浏览</h2>
        <div class="category-grid">
          <a
            v-for="cat in categories"
            :key="cat.id"
            class="category-card"
            :href="cat.route"
            @click.prevent="goToCategory(cat)"
          >
            <component :is="getCatIcon(cat.name)" :size="28" class="cat-icon" />
            <span class="cat-name">{{ cat.name }}</span>
            <span class="cat-count">{{ cat.siteCount || 0 }} 个</span>
          </a>
        </div>
      </section>

      <!-- 最近添加 -->
      <section class="recent-section" v-if="recentSites.length">
        <h2 class="section-title">最近添加</h2>
        <div class="site-grid">
          <a
            v-for="site in recentSites"
          :key="site.id"
          :href="site.siteUrl"
          target="_blank"
          class="site-card"
          :class="siteStatusClass(site)"
          @click="recordVisit(site.id)"
        >
            <button class="bookmark-btn" :class="{ active: bookmarked.has(site.id) }" @click.stop.prevent="toggleBookmark(site.id)" :title="bookmarked.has(site.id) ? '取消收藏' : '收藏'">
              <Heart :size="15" />
            </button>
            <img :src="site.siteIcon || getFavicon(site.siteUrl)" class="site-favicon" />
            <div class="site-text">
              <span class="site-name">
                <span v-if="site.checkStatus === 2" class="dead-badge" title="疑似失效">⚠</span>
                {{ site.siteName }}
              </span>
              <span class="site-desc" v-if="site.siteDesc">{{ site.siteDesc }}</span>
              <span class="site-fav" v-if="site.favoriteCount">{{ site.favoriteCount }} 人收藏</span>
            </div>
          </a>
        </div>
      </section>

      <!-- 热门推荐 -->
      <section class="hot-section">
        <div class="hot-header">
          <h2 class="section-title">热门推荐</h2>
          <div class="hot-tabs">
            <button :class="{ active: hotPeriod === 'week' }" @click="switchHot('week')">周榜</button>
            <button :class="{ active: hotPeriod === 'month' }" @click="switchHot('month')">月榜</button>
            <button :class="{ active: hotPeriod === 'all' }" @click="switchHot('all')">总榜</button>
          </div>
        </div>
        <div class="site-grid" v-if="hotSites.length">
          <a
            v-for="site in hotSites"
            :key="site.id"
            :href="site.siteUrl"
            target="_blank"
            class="site-card"
            :class="siteStatusClass(site)"
            @click="recordVisit(site.id)"
          >
            <button class="bookmark-btn" :class="{ active: bookmarked.has(site.id) }" @click.stop.prevent="toggleBookmark(site.id)" :title="bookmarked.has(site.id) ? '取消收藏' : '收藏'">
              <Heart :size="15" />
            </button>
            <img :src="site.siteIcon || getFavicon(site.siteUrl)" class="site-favicon" />
            <div class="site-text">
              <span class="site-name">
                <span v-if="site.checkStatus === 2" class="dead-badge" title="疑似失效">⚠</span>
                {{ site.siteName }}
              </span>
              <span class="site-desc" v-if="site.siteDesc">{{ site.siteDesc }}</span>
              <span class="site-fav" v-if="site.favoriteCount">{{ site.favoriteCount }} 人收藏</span>
            </div>
          </a>
        </div>
        <div v-else class="empty-hot">暂无热门数据</div>
      </section>
    </template>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-text">加载中...</div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick, type Component } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import request from '@/utils/request'
import { recordVisit } from '@/utils/visit'
import { useAuthStore } from '@/stores/auth'
import { Search, Heart, Gamepad2, Palette, BookOpen, GraduationCap, Wrench, Film, Music, MessageCircle, PenTool, Brain, Compass } from '@lucide/vue'
import type { SearchSite, SearchPageData, CategoryNode } from '@/types'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// --- 状态 ---
const keyword = ref('')
const loading = ref(true)
const searching = ref(false)
const searchingMore = ref(false)
const lastKeyword = ref('')
const searchPage = ref(1)
const searchTotal = ref(0)
const searchHasMore = ref(false)
const searchResults = ref<SearchSite[]>([])
const suggestions = ref<(SearchSite & { categoryName?: string })[]>([])

const categories = ref<(CategoryNode & { route?: string; siteCount?: number })[]>([])
const recentSites = ref<SearchSite[]>([])
const hotSites = ref<SearchSite[]>([])
const hotPeriod = ref<'week' | 'month' | 'all'>('week')

const stats = reactive({ siteCount: 0, catCount: 0, aliveCount: 0 })
const alivePercent = computed(() => {
  if (!stats.siteCount) return 100
  return Math.round((stats.aliveCount / stats.siteCount) * 100)
})

// --- 滚动加载 ---
const SEARCH_PAGE_SIZE = 20
const loadMoreTrigger = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

watch(loadMoreTrigger, (el) => {
  observer?.disconnect()
  if (el) {
    observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && searchHasMore.value && !searchingMore.value) loadMore()
    }, { threshold: 0.1 })
    observer.observe(el)
  }
})

onUnmounted(() => observer?.disconnect())

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

// --- 图标映射 ---
const iconMap: Record<string, Component> = {
  '游戏': Gamepad2, '二次元': Palette, '书籍': BookOpen,
  '学习': GraduationCap, '工具': Wrench, '影视': Film,
  '音乐': Music, '论坛': MessageCircle, '设计': PenTool,
  'AI': Brain,
}
function getCatIcon(name: string) { return iconMap[name] || Compass }

const catRoutes: Record<string, string> = {
  '游戏': '/game', '二次元': '/acg',
}

// --- 初始化 ---
onMounted(async () => {
  // 未登录访问受保护页面被重定向到首页时，自动弹出登录弹窗
  if (route.query.login === '1') {
    window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { initialView: 'login' } }))
    router.replace({ path: '/home' })
  }
  try {
    const [treeRes, statsRes, recentRes, hotRes] = await Promise.allSettled([
      request.get('/api/front/category/tree'),
      request.get('/api/front/website/stats'),
      request.get('/api/front/website/recent', { params: { size: 12 } }),
      request.get('/api/front/website/hot', { params: { size: 12, period: hotPeriod.value } }),
    ])

    if (treeRes.status === 'fulfilled') {
      const tree: CategoryNode[] = treeRes.value.data.data
      categories.value = tree.map(cat => ({
        ...cat,
        route: catRoutes[cat.name],
        siteCount: cat.siteCount ?? 0,
      }))
    }

    if (statsRes.status === 'fulfilled') {
      const d = statsRes.value.data.data
      stats.siteCount = d?.siteCount ?? 0
      stats.catCount = d?.catCount ?? 0
      stats.aliveCount = d?.aliveCount ?? 0
    }

    if (recentRes.status === 'fulfilled') {
      recentSites.value = recentRes.value.data.data || []
    }

    if (hotRes.status === 'fulfilled') {
      hotSites.value = hotRes.value.data.data || []
    }
  } catch (e) {
    console.error('首页加载失败', e)
  } finally {
    loading.value = false
  }
})

// --- 热门榜切换 ---
async function switchHot(period: 'week' | 'month' | 'all') {
  if (hotPeriod.value === period) return
  hotPeriod.value = period
  try {
    const res = await request.get('/api/front/website/hot', { params: { size: 12, period } })
    hotSites.value = res.data.data || []
  } catch (e) {
    console.error('热门加载失败', e)
  }
}

// --- 搜索 ---
let suggestTimer: ReturnType<typeof setTimeout> | null = null

function onKeywordInput() {
  const q = keyword.value.trim()
  if (suggestTimer) clearTimeout(suggestTimer)
  if (!q || q.length < 2) {
    suggestions.value = []
    return
  }
  suggestTimer = setTimeout(async () => {
    try {
      const res = await request.get('/api/front/search/suggest', { params: { keyword: q, size: 6 } })
      suggestions.value = res.data.data || []
    } catch { suggestions.value = [] }
  }, 200)
}

async function handleSearch() {
  const q = keyword.value.trim()
  if (!q) return
  lastKeyword.value = q
  searching.value = true
  searchResults.value = []
  suggestions.value = []
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
  } catch (e) {
    console.error('搜索失败', e)
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
    if (loadMoreTrigger.value && searchHasMore.value) {
      const rect = loadMoreTrigger.value.getBoundingClientRect()
      if (rect.top < window.innerHeight) loadMore()
    }
  }
}

function clearSearch() {
  keyword.value = ''
  searchResults.value = []
  suggestions.value = []
  lastKeyword.value = ''
  searchTotal.value = 0
  searchHasMore.value = false
  searchPage.value = 1
}

// --- 工具 ---
function getFavicon(url: string): string {
  try {
    return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`
  } catch { return '' }
}

function siteStatusClass(site: { checkStatus?: number }): string {
  return site.checkStatus === 2 ? 'status-dead' : ''
}

function goToSite(site: SearchSite) {
  recordVisit(site.id)
  window.open(site.siteUrl, '_blank')
}

function goToCategory(cat: CategoryNode & { route?: string }) {
  if (cat.route) {
    router.push({ path: cat.route, query: { category: String(cat.id) } })
  } else {
    router.push({ path: '/game', query: { category: String(cat.id) } })
  }
}
</script>

<style scoped>
.home-wrapper { min-height: 100vh; margin: -56px -24px 0; }

/* ==================== Hero ==================== */
.hero {
  text-align: center; padding: 120px 24px 80px;
  background: url("/wallhaven-pkw6y3.webp") center/cover no-repeat;
  color: #fff; text-shadow: 0 2px 8px rgba(0,0,0,0.5);
}
.hero-title { font-size: 36px; font-weight: 800; margin: 0 0 8px; letter-spacing: 2px; }
.hero-subtitle { font-size: 16px; opacity: 0.85; margin: 0 0 28px; }

.search-box {
  position: relative;
  display: inline-flex; align-items: center; gap: 8px;
  background: #fff; border-radius: 10px; padding: 12px 20px;
  width: 100%; max-width: 560px;
  box-shadow: 0 6px 24px rgba(0,0,0,0.15);
}
.search-box input {
  border: none; outline: none; font-size: 16px; width: 100%; color: #303133;
}
.search-icon { color: #909399; flex-shrink: 0; }
.search-clear {
  border: none; background: #e0e3e9; color: #909399; width: 24px; height: 24px;
  border-radius: 50%; cursor: pointer; font-size: 12px; line-height: 1;
}
.search-clear:hover { background: #c0c4cc; color: #606266; }

/* 搜索建议 */
.suggest-dropdown {
  position: absolute; top: calc(100% + 4px); left: 0; right: 0;
  background: #fff; border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  max-height: 280px; overflow-y: auto; z-index: 10; text-align: left;
  text-shadow: none;
}
.suggest-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 16px; cursor: pointer; transition: background 0.12s;
  color: #303133; font-size: 14px;
}
.suggest-item:hover { background: #f5f7fa; }
.suggest-favicon { width: 22px; height: 22px; border-radius: 4px; flex-shrink: 0; object-fit: contain; }
.suggest-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.suggest-cat { font-size: 12px; color: #909399; flex-shrink: 0; }

/* ==================== 搜索结果 ==================== */
.search-results { padding: 20px 24px 0; max-width: 1200px; margin: 0 auto; }
.search-header {
  display: flex; align-items: center; justify-content: space-between;
  font-size: 14px; color: #606266; margin-bottom: 14px;
}
.btn-back { border: none; background: none; color: #409EFF; cursor: pointer; font-size: 13px; }
.btn-back:hover { text-decoration: underline; }
.no-result { text-align: center; padding: 40px; color: #909399; font-size: 14px; }
.load-more { text-align: center; padding: 20px; color: #909399; font-size: 13px; }

/* ==================== 统计卡片 ==================== */
.stats-row {
  display: flex; gap: 16px; justify-content: center;
  padding: 40px 24px 0; max-width: 800px; margin: 0 auto;
}
.stat-card {
  flex: 1; text-align: center; background: #fff; border-radius: 10px;
  padding: 24px 16px; border: 1px solid #ebeef5;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.stat-num { display: block; font-size: 28px; font-weight: 700; color: #303133; }
.stat-label { display: block; font-size: 13px; color: #909399; margin-top: 6px; }

/* ==================== 分类入口 ==================== */
.category-section, .recent-section, .hot-section {
  padding: 32px 24px 0; max-width: 1200px; margin: 0 auto;
}
.section-title { font-size: 18px; font-weight: 700; color: #303133; margin: 0 0 16px; }

/* 热门榜头部与切换 */
.hot-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 16px; flex-wrap: wrap; gap: 8px;
}
.hot-header .section-title { margin: 0; }
.hot-tabs { display: flex; gap: 6px; }
.hot-tabs button {
  padding: 4px 14px; border: 1px solid #dcdfe6; border-radius: 14px;
  background: #fff; color: #606266; font-size: 13px; cursor: pointer;
  transition: all 0.15s;
}
.hot-tabs button:hover { border-color: #409EFF; color: #409EFF; }
.hot-tabs button.active { background: #409EFF; border-color: #409EFF; color: #fff; }
.empty-hot { text-align: center; color: #909399; font-size: 13px; padding: 24px 0; }

.category-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 12px;
}
.category-card {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 20px 12px; border-radius: 10px;
  background: #fff; border: 1px solid #ebeef5;
  text-decoration: none; color: inherit; cursor: pointer;
  transition: all 0.15s ease;
}
.category-card:hover {
  border-color: #409EFF;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
  transform: translateY(-2px);
}
.cat-icon { color: #409EFF; }
.cat-name { font-size: 14px; font-weight: 600; color: #303133; }
.cat-count { font-size: 12px; color: #909399; }

/* ==================== 网站网格 ==================== */
.site-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px;
}
.site-card {
  position: relative;
  display: flex; align-items: center; gap: 10px;
  padding: 12px 16px; border-radius: 8px;
  background: #fff; border: 1px solid #ebeef5;
  text-decoration: none; color: inherit; transition: all 0.15s;
}
.site-card:hover {
  border-color: #409EFF;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
  transform: translateY(-1px);
}
/* 疑似失效 — 红色背景 */
.site-card.status-dead   { background: #fff5f5; border-color: #fed7d7; }
.site-card.status-dead .site-name { color: #c53030; }

.site-favicon {
  width: 34px; height: 34px; border-radius: 6px;
  flex-shrink: 0; object-fit: contain;
}
.site-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.site-name { font-size: 14px; font-weight: 600; color: #303133; }
.dead-badge { color: #e6a23c; font-size: 12px; margin-right: 2px; }
.site-desc {
  font-size: 12px; color: #909399; overflow: hidden;
  text-overflow: ellipsis; white-space: nowrap;
}

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

@media (max-width: 640px) {
  .hero { padding: 80px 16px 60px; }
  .hero-title { font-size: 26px; }
  .site-grid, .category-grid { grid-template-columns: 1fr; }
  .stats-row { flex-direction: column; }
}
</style>

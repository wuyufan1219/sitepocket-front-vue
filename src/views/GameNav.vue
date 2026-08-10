<template>
  <div class="game-wrapper">
    <!-- Hero 搜索区 -->
    <div class="hero">
      <h1>发现精彩网站资源</h1>
      <p class="hero-subtitle">骨灰级玩家必备导航 — 汇聚全网优质网站与工具</p>
      <div class="search-box">
        <Search :size="18" class="search-icon" />
        <input v-model="keyword" placeholder="搜索网站名称或描述..." @keyup.enter="handleSearch" />
        <button v-if="keyword" class="search-clear" @click="clearSearch">✕</button>
      </div>
    </div>

    <!-- 搜索结果 -->
    <div class="search-results" v-if="searching || searchResults.length">
      <div class="search-header">
        <span v-if="searching">搜索中...</span>
        <span v-else>搜索「{{ lastKeyword }}」找到 {{ searchResults.length }} 个结果</span>
      </div>
      <div class="site-grid" v-if="searchResults.length">
        <a v-for="site in searchResults" :key="site.id" :href="site.siteUrl" target="_blank" class="site-card">
          <div class="site-row">
            <img
              v-if="site.siteIcon"
              :src="site.siteIcon"
              class="site-favicon"
            />
            <div class="site-text">
              <span class="site-name">{{ site.siteName }}</span>
              <span class="site-desc" v-if="site.siteDesc">{{ site.siteDesc }}</span>
            </div>
          </div>
        </a>
      </div>
      <div v-if="!searching && lastKeyword && !searchResults.length" class="no-result">未找到相关网站</div>
    </div>

    <!-- 分类板块滚动区 -->
    <div class="sections" v-if="!loading && !searchResults.length">
      <section
        v-for="sec in filteredSections"
        :key="sec.subCategoryId"
        :id="'section-' + sec.subCategoryId"
        class="category-section"
      >
        <div class="section-header">
          <h2>{{ sec.subCategoryName }}</h2>
          <span class="section-count">{{ sec.websites.length }} 个</span>
        </div>
        <div class="site-grid">
          <a v-for="site in sec.websites" :key="site.id" :href="site.url" target="_blank" class="site-card">
            <div class="site-row">
              <img
                v-if="site.icon"
                :src="site.icon"
                class="site-favicon"
              />
              <div class="site-text">
                <span class="site-name">{{ site.name }}</span>
                <span class="site-desc" v-if="site.desc">{{ site.desc }}</span>
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
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import request from '@/utils/request'
import { Search } from '@lucide/vue'

const route = useRoute()

const keyword = ref('')
const loading = ref(true)
const activeCat = ref<number>(1)

interface WebsiteCard { id: number; name: string; url: string; desc: string | null; icon: string | null }
interface Section { subCategoryId: number; subCategoryName: string; parentCategoryId: number; websites: WebsiteCard[] }

const sections = ref<Section[]>([])
const parentNames = ref<Record<number, string>>({})

const searching = ref(false)
const lastKeyword = ref('')
const searchResults = ref<{ id:number; siteName:string; siteUrl:string; siteIcon:string|null; siteDesc:string|null }[]>([])

const filteredSections = computed(() =>
  activeCat.value ? sections.value.filter(s => s.parentCategoryId === activeCat.value) : sections.value
)

onMounted(async () => {
  try {
    const [secRes, treeRes] = await Promise.all([
      request.get('/api/front/website/sections'),
      request.get('/api/front/category/tree'),
    ])
    sections.value = secRes.data.data
    for (const p of treeRes.data.data) parentNames.value[p.id] = p.name
  } catch (e) { console.error(e) } finally { loading.value = false }
  const qCat = route.query.category
  if (qCat) activeCat.value = Number(qCat)
})

async function handleSearch() {
  const q = keyword.value.trim()
  if (!q) return
  lastKeyword.value = q
  searching.value = true
  searchResults.value = []
  try {
    const res = await request.get('/api/front/search', { params: { keyword: q } })
    searchResults.value = res.data.data || []
  } catch (e) {
    console.error('搜索失败', e)
    searchResults.value = [{ id:0, siteName:'网络错误', siteUrl:'#', siteDesc: String(e) }]
  }
  finally { searching.value = false }
}

function clearSearch() {
  keyword.value = ''
  searchResults.value = []
  lastKeyword.value = ''
}
</script>

<style scoped>
.game-wrapper { min-height: 100vh; margin: -56px -24px 0; }

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

.sections { padding: 24px 24px 48px; max-width: 1200px; margin: 0 auto; }
.category-section { margin-bottom: 36px; scroll-margin-top: 80px; }
.section-header {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 14px; padding-bottom: 8px; border-bottom: 2px solid #ebeef5;
}
.section-header h2 { margin: 0; font-size: 18px; color: #303133; }
.section-count { font-size: 12px; color: #909399; }

.site-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; }
.site-card {
  display: flex; flex-direction: column; gap: 2px;
  padding: 12px 16px; border-radius: 8px;
  background: #fff; border: 1px solid #ebeef5;
  text-decoration: none; color: inherit; transition: all 0.15s;
}
.site-card:hover { border-color: #409EFF; box-shadow: 0 2px 8px rgba(64,158,255,0.12); transform: translateY(-1px); }
.site-row { display: flex; align-items: center; gap: 10px; }
.site-favicon {
  width: 34px; height: 34px; border-radius: 6px;
  flex-shrink: 0; object-fit: contain;
}
.site-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.site-name { font-size: 14px; font-weight: 600; color: #303133; }
.site-desc { font-size: 12px; color: #909399; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.loading-text { text-align: center; padding: 60px; color: #909399; font-size: 14px; }

@media (max-width: 640px) { .site-grid { grid-template-columns: 1fr; } }
</style>

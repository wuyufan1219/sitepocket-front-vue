<template>
  <div class="user-wrapper">
    <!-- ==================== 用户头部卡片 ==================== -->
    <div class="user-header">
      <div class="user-avatar">
        <UserRound :size="44" />
      </div>
      <div class="user-info">
        <h2 class="user-nickname">{{ nickname }}</h2>
        <p class="user-username">@{{ username }}</p>
      </div>
      <div class="user-stats">
        <div class="ustat">
          <span class="ustat-num">{{ bookmarks.length }}</span>
          <span class="ustat-label">收藏</span>
        </div>
        <div class="ustat">
          <span class="ustat-num">{{ historyCount }}</span>
          <span class="ustat-label">浏览</span>
        </div>
      </div>
    </div>

    <!-- ==================== Tab 切换 ==================== -->
    <div class="tab-bar">
      <button :class="{ active: activeTab === 'bookmarks' }" @click="activeTab = 'bookmarks'">
        <Bookmark :size="16" /> 我的收藏
      </button>
      <button :class="{ active: activeTab === 'history' }" @click="activeTab = 'history'">
        <History :size="16" /> 最近浏览
      </button>
      <button :class="{ active: activeTab === 'settings' }" @click="activeTab = 'settings'">
        <Settings :size="16" /> 设置
      </button>
    </div>

    <!-- ==================== 收藏列表 ==================== -->
    <div class="tab-content" v-if="activeTab === 'bookmarks'">
      <div class="toolbar">
        <div class="search-inline">
          <Search :size="14" />
          <input v-model="bmKeyword" placeholder="搜索收藏..." @input="filterBookmarks" />
        </div>
        <span class="bm-count">共 {{ filteredBookmarks.length }} 项</span>
      </div>

      <div class="site-grid" v-if="filteredBookmarks.length">
        <a
          v-for="site in pagedBookmarks"
          :key="site.id"
          :href="site.siteUrl"
          target="_blank"
          class="site-card"
          :class="siteStatusClass(site)"
        >
          <img :src="site.siteIcon || getFavicon(site.siteUrl)" class="site-favicon" />
          <div class="site-text">
            <span class="site-name">{{ site.siteName }}</span>
            <span class="site-desc" v-if="site.siteDesc">{{ site.siteDesc }}</span>
          </div>
          <button class="btn-unbookmark" @click.prevent="removeBookmark(site.id)" title="取消收藏">
            <X :size="14" />
          </button>
        </a>
      </div>
      <div v-else class="empty-state">
        <Bookmark :size="48" class="empty-icon" />
        <p>还没有收藏过网站</p>
        <p class="empty-hint">浏览网站时点击收藏按钮即可添加到此处</p>
      </div>

      <div class="pagination" v-if="bmTotalPages > 1">
        <button :disabled="bmPage <= 1" @click="bmPage--">上一页</button>
        <span>{{ bmPage }} / {{ bmTotalPages }}</span>
        <button :disabled="bmPage >= bmTotalPages" @click="bmPage++">下一页</button>
      </div>
    </div>

    <!-- ==================== 最近浏览 ==================== -->
    <div class="tab-content" v-if="activeTab === 'history'">
      <div class="toolbar">
        <span class="bm-count">最近浏览的网站</span>
        <button class="btn-clear" @click="clearHistory">清空记录</button>
      </div>

      <div class="site-grid" v-if="browseHistory.length">
        <a
          v-for="item in pagedHistory"
          :key="item.id"
          :href="item.siteUrl"
          target="_blank"
          class="site-card"
        >
          <img :src="item.siteIcon || getFavicon(item.siteUrl)" class="site-favicon" />
          <div class="site-text">
            <span class="site-name">{{ item.siteName }}</span>
            <span class="site-desc" v-if="item.siteDesc">{{ item.siteDesc }}</span>
          </div>
          <span class="history-time">{{ formatTime(item.visitedAt) }}</span>
        </a>
      </div>
      <div v-else class="empty-state">
        <History :size="48" class="empty-icon" />
        <p>暂无浏览记录</p>
      </div>

      <div class="pagination" v-if="histTotalPages > 1">
        <button :disabled="histPage <= 1" @click="histPage--">上一页</button>
        <span>{{ histPage }} / {{ histTotalPages }}</span>
        <button :disabled="histPage >= histTotalPages" @click="histPage++">下一页</button>
      </div>
    </div>

    <!-- ==================== 设置 ==================== -->
    <div class="tab-content" v-if="activeTab === 'settings'">
      <div class="settings-card">
        <div class="setting-row">
          <span class="setting-label">昵称</span>
          <div class="setting-value">
            <template v-if="!editingNick">
              <span>{{ nickname }}</span>
              <button class="btn-edit" @click="startEditNick"><Pencil :size="14" /></button>
            </template>
            <template v-else>
              <input v-model="newNickname" placeholder="新昵称" maxlength="20" />
              <button class="btn-save-sm" @click="saveNickname" :disabled="nickLoading">
                {{ nickLoading ? '...' : '保存' }}
              </button>
              <button class="btn-cancel-sm" @click="editingNick = false">取消</button>
            </template>
          </div>
        </div>

        <div class="setting-row">
          <span class="setting-label">密码</span>
          <button class="btn-action-sm" @click="goToProfile">修改密码</button>
        </div>

        <div class="setting-row">
          <span class="setting-label">账号</span>
          <button class="btn-logout-sm" @click="handleLogout">退出登录</button>
        </div>
      </div>
      <p v-if="nickMsg" class="form-msg">{{ nickMsg }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import request from '@/utils/request'
import { UserRound, Bookmark, History, Settings, Search, X, Pencil } from '@lucide/vue'
import type { SearchSite } from '@/types'

const router = useRouter()
const authStore = useAuthStore()

// --- 用户信息 ---
const nickname = ref(localStorage.getItem('nickname') || '用户')
const username = ref('')

// --- Tab ---
type Tab = 'bookmarks' | 'history' | 'settings'
const activeTab = ref<Tab>('bookmarks')

// --- 收藏 ---
interface BookmarkItem extends SearchSite {
  bookmarkedAt?: string
}

const bookmarks = ref<BookmarkItem[]>([])
const bmKeyword = ref('')
const bmPage = ref(1)
const BM_PAGE_SIZE = 12

const filteredBookmarks = computed(() => {
  if (!bmKeyword.value.trim()) return bookmarks.value
  const q = bmKeyword.value.toLowerCase()
  return bookmarks.value.filter(b =>
    b.siteName.toLowerCase().includes(q) || (b.siteDesc || '').toLowerCase().includes(q)
  )
})

const bmTotalPages = computed(() => Math.max(1, Math.ceil(filteredBookmarks.value.length / BM_PAGE_SIZE)))
const pagedBookmarks = computed(() => {
  const start = (bmPage.value - 1) * BM_PAGE_SIZE
  return filteredBookmarks.value.slice(start, start + BM_PAGE_SIZE)
})

function filterBookmarks() { bmPage.value = 1 }

async function removeBookmark(id: number) {
  try {
    await request.delete(`/api/front/user/bookmark/${id}`)
    bookmarks.value = bookmarks.value.filter(b => b.id !== id)
  } catch (e) { console.error('取消收藏失败', e) }
}

// --- 浏览记录 ---
interface HistoryItem extends SearchSite {
  visitedAt?: string
}

const browseHistory = ref<HistoryItem[]>([])
const historyCount = ref(0)
const histPage = ref(1)
const HIST_PAGE_SIZE = 12

const histTotalPages = computed(() => Math.max(1, Math.ceil(browseHistory.value.length / HIST_PAGE_SIZE)))
const pagedHistory = computed(() => {
  const start = (histPage.value - 1) * HIST_PAGE_SIZE
  return browseHistory.value.slice(start, start + HIST_PAGE_SIZE)
})

async function clearHistory() {
  try {
    await request.delete('/api/front/user/history')
    browseHistory.value = []
    historyCount.value = 0
  } catch (e) { console.error('清空失败', e) }
}

// --- 昵称编辑 ---
const editingNick = ref(false)
const newNickname = ref('')
const nickLoading = ref(false)
const nickMsg = ref('')

function startEditNick() {
  newNickname.value = nickname.value
  editingNick.value = true
  nickMsg.value = ''
}

async function saveNickname() {
  const val = newNickname.value.trim()
  if (!val) { nickMsg.value = '昵称不能为空'; return }
  nickLoading.value = true; nickMsg.value = ''
  try {
    await request.put('/api/front/user/nickname', { nickname: val })
    nickname.value = val
    localStorage.setItem('nickname', val)
    editingNick.value = false
  } catch (e: any) {
    nickMsg.value = e?.message || '网络错误'
  } finally { nickLoading.value = false }
}

function goToProfile() { router.push('/profile') }

function handleLogout() {
  authStore.logout()
  router.push('/home')
}

// --- 工具 ---
function getFavicon(url: string): string {
  try { return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32` } catch { return '' }
}

function siteStatusClass(site: { isAlive?: string }): string {
  if (!site.isAlive || site.isAlive === 'unknown') return ''
  return `status-${site.isAlive}`
}

function formatTime(ts?: string): string {
  if (!ts) return ''
  const d = new Date(ts)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  return d.toLocaleDateString('zh-CN')
}

// --- 初始化 ---
onMounted(async () => {
  try {
    const userInfo = await request.get('/api/front/user/info')
    if (userInfo.data.data) {
      username.value = userInfo.data.data.username || ''
      nickname.value = userInfo.data.data.nickname || userInfo.data.data.username || '用户'
      localStorage.setItem('nickname', nickname.value)
    }
  } catch { /* 静默 */ }

  // 加载收藏
  try {
    const bmRes = await request.get('/api/front/user/bookmarks')
    bookmarks.value = bmRes.data.data || []
  } catch { /* 收藏接口可能未实现 */ }

  // 加载浏览记录
  try {
    const histRes = await request.get('/api/front/user/history')
    browseHistory.value = histRes.data.data || []
    historyCount.value = browseHistory.value.length
  } catch { /* 浏览记录接口可能未实现 */ }
})
</script>

<style scoped>
.user-wrapper { min-height: 100vh; margin: -56px -24px 0; padding: 0 24px; max-width: 1000px; margin-left: auto; margin-right: auto; padding-top: 24px; }

/* ==================== 用户头部 ==================== */
.user-header {
  display: flex; align-items: center; gap: 20px;
  background: #fff; border-radius: 12px; padding: 28px 32px;
  border: 1px solid #ebeef5; box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  margin-bottom: 16px;
}
.user-avatar {
  width: 80px; height: 80px; border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff; display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.user-info { flex: 1; }
.user-nickname { font-size: 22px; font-weight: 700; color: #303133; margin: 0; }
.user-username { font-size: 13px; color: #909399; margin: 4px 0 0; }
.user-stats { display: flex; gap: 28px; }
.ustat { text-align: center; }
.ustat-num { display: block; font-size: 20px; font-weight: 700; color: #303133; }
.ustat-label { display: block; font-size: 12px; color: #909399; margin-top: 2px; }

/* ==================== Tab ==================== */
.tab-bar {
  display: flex; gap: 4px; margin-bottom: 20px;
  background: #fff; border-radius: 8px; padding: 4px;
  border: 1px solid #ebeef5;
}
.tab-bar button {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
  padding: 10px; border: none; background: transparent; color: #606266;
  font-size: 14px; font-weight: 500; cursor: pointer; border-radius: 6px;
  transition: all 0.15s;
}
.tab-bar button:hover { background: #f5f7fa; }
.tab-bar button.active { background: #409EFF; color: #fff; }

/* ==================== 工具栏 ==================== */
.toolbar {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  margin-bottom: 16px;
}
.search-inline {
  display: flex; align-items: center; gap: 6px;
  background: #fff; border: 1px solid #dcdfe6; border-radius: 6px;
  padding: 6px 12px; flex: 1; max-width: 300px;
}
.search-inline input { border: none; outline: none; font-size: 13px; width: 100%; color: #303133; }
.bm-count { font-size: 13px; color: #909399; white-space: nowrap; }
.btn-clear { border: none; background: none; color: #ef5c5c; font-size: 13px; cursor: pointer; }
.btn-clear:hover { text-decoration: underline; }

/* ==================== 网站网格 ==================== */
.site-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 10px; margin-bottom: 20px; }

.site-card {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px; border-radius: 8px;
  background: #fff; border: 1px solid #ebeef5;
  text-decoration: none; color: inherit; transition: all 0.15s;
  position: relative;
}
.site-card:hover { border-color: #409EFF; box-shadow: 0 2px 8px rgba(64,158,255,0.15); }
.site-card.status-alive { background: #f0fff4; border-color: #c6f6d5; }
.site-card.status-dead  { background: #fff5f5; border-color: #fed7d7; }
.site-card.status-dead .site-name { color: #c53030; }

.site-favicon { width: 32px; height: 32px; border-radius: 6px; flex-shrink: 0; object-fit: contain; }
.site-text { flex: 1; min-width: 0; }
.site-name { font-size: 14px; font-weight: 600; color: #303133; display: block; }
.site-desc { font-size: 12px; color: #909399; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block; }

.btn-unbookmark {
  border: none; background: none; color: #c0c4cc; cursor: pointer; padding: 4px;
  border-radius: 4px; transition: all 0.15s; flex-shrink: 0;
}
.btn-unbookmark:hover { color: #ef5c5c; background: #fff5f5; }
.history-time { font-size: 11px; color: #c0c4cc; flex-shrink: 0; }

/* ==================== 空状态 ==================== */
.empty-state { text-align: center; padding: 60px 20px; color: #909399; }
.empty-icon { color: #c0c4cc; margin-bottom: 12px; }
.empty-state p { margin: 4px 0; font-size: 14px; }
.empty-hint { font-size: 12px; color: #c0c4cc; }

/* ==================== 分页 ==================== */
.pagination {
  display: flex; align-items: center; justify-content: center; gap: 16px;
  padding: 12px 0;
}
.pagination button {
  padding: 6px 16px; border: 1px solid #dcdfe6; border-radius: 4px;
  background: #fff; color: #303133; cursor: pointer; font-size: 13px;
}
.pagination button:disabled { opacity: 0.4; cursor: not-allowed; }
.pagination span { font-size: 13px; color: #606266; }

/* ==================== 设置页 ==================== */
.settings-card { background: #fff; border-radius: 8px; border: 1px solid #ebeef5; overflow: hidden; }
.setting-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px; border-bottom: 1px solid #f5f7fa;
}
.setting-row:last-child { border-bottom: none; }
.setting-label { font-size: 14px; color: #303133; font-weight: 500; }
.setting-value { display: flex; align-items: center; gap: 8px; }
.setting-value input {
  padding: 6px 10px; border: 1px solid #dcdfe6; border-radius: 4px;
  font-size: 13px; outline: none; width: 140px;
}
.setting-value input:focus { border-color: #409EFF; }
.btn-edit { border: none; background: none; color: #409EFF; cursor: pointer; padding: 2px; }
.btn-edit:hover { color: #337ecc; }
.btn-save-sm, .btn-cancel-sm, .btn-action-sm {
  padding: 6px 14px; border-radius: 4px; font-size: 13px; cursor: pointer; border: none;
}
.btn-save-sm { background: #409EFF; color: #fff; }
.btn-save-sm:hover { background: #337ecc; }
.btn-cancel-sm { background: #f5f7fa; color: #606266; }
.btn-cancel-sm:hover { background: #e8eaed; }
.btn-action-sm { background: #f5f7fa; color: #606266; }
.btn-action-sm:hover { background: #e8eaed; }
.btn-save-sm:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-logout-sm { padding: 6px 14px; border: 1px solid #ef5c5c; border-radius: 4px; background: #fff; color: #ef5c5c; cursor: pointer; font-size: 13px; }
.btn-logout-sm:hover { background: #ef5c5c; color: #fff; }
.form-msg { font-size: 12px; color: #e6a23c; text-align: center; margin-top: 10px; }

@media (max-width: 640px) {
  .user-header { flex-direction: column; text-align: center; padding: 20px; }
  .user-stats { gap: 16px; }
  .site-grid { grid-template-columns: 1fr; }
}
</style>

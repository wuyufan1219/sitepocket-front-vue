<template>
  <div class="home-wrapper">
    <!-- ==================== Hero 区域 ==================== -->
    <section class="hero">
      <div class="hero-content">
        <div class="hero-badge">✨ 发现·收藏·分享</div>
        <h1>网站口袋</h1>
        <p class="hero-desc">一个懂你的网站导航，汇聚全网优质资源，让每一次浏览都有价值</p>
        <div class="hero-actions">
          <button class="btn-primary" @click="$router.push('/game')">
            <Compass :size="18" />
            开始探索
          </button>
          <button class="btn-outline" @click="scrollToCategories">
            <LayoutGrid :size="18" />
            浏览分类
          </button>
        </div>
      </div>
      <div class="hero-visual">
        <div class="floating-cards">
          <div class="float-card c1">🎮 游戏</div>
          <div class="float-card c2">📚 学习</div>
          <div class="float-card c3">🎬 影视</div>
          <div class="float-card c4">🛠️ 工具</div>
        </div>
      </div>
    </section>

    <!-- ==================== 统计数字 ==================== -->
    <section class="stats">
      <div class="stat-item">
        <span class="stat-num">{{ stats.sites }}</span>
        <span class="stat-label">收录网站</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-num">{{ stats.categories }}</span>
        <span class="stat-label">分类板块</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-num">{{ stats.users }}</span>
        <span class="stat-label">活跃用户</span>
      </div>
    </section>

    <!-- ==================== 分类快速入口 ==================== -->
    <section id="categories" class="categories-section">
      <div class="section-head">
        <h2>探索分类</h2>
        <p>选择你感兴趣的领域，发现优质网站</p>
      </div>
      <div class="cat-grid" v-if="!loading">
        <div
          v-for="cat in categories"
          :key="cat.id"
          class="cat-card"
          @click="navigateToCategory(cat.id)"
        >
          <div class="cat-icon" :style="{ background: getCatColor(cat.id) }">
            <component :is="getCatIcon(cat.name)" :size="28" />
          </div>
          <span class="cat-name">{{ cat.name }}</span>
          <span class="cat-desc">{{ getCatDesc(cat.name) }}</span>
          <span class="cat-count">{{ cat.children?.length || 0 }} 个子类</span>
        </div>
      </div>
      <div v-else class="loading-text">加载中...</div>
    </section>

    <!-- ==================== 精选推荐 ==================== -->
    <section class="featured-section">
      <div class="section-head">
        <h2>精选推荐</h2>
        <p>编辑精选的高质量网站资源</p>
      </div>
      <div class="featured-grid">
        <a
          v-for="site in featuredSites"
          :key="site.id"
          :href="site.url"
          target="_blank"
          class="featured-card"
        >
          <div class="featured-cover" :style="{ background: site.bg }">
            <span class="featured-emoji">{{ site.emoji }}</span>
          </div>
          <div class="featured-info">
            <span class="featured-name">{{ site.name }}</span>
            <span class="featured-desc">{{ site.desc }}</span>
          </div>
        </a>
      </div>
    </section>

    <!-- ==================== 底部 CTA ==================== -->
    <section class="cta-section">
      <h2>准备好了吗？</h2>
      <p>上千个精选网站在等你发现</p>
      <button class="btn-primary" @click="$router.push('/game')">
        立即探索 →
      </button>
    </section>

    <!-- ==================== 页脚 ==================== -->
    <footer class="home-footer">
      <p>© 2026 SitePocket 网站口袋 · 发现世界的窗口</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, type Component } from 'vue'
import { useRouter } from 'vue-router'
import { Compass, LayoutGrid, Gamepad2, Palette, BookOpen, GraduationCap, Wrench, Film, Music, MessageCircle, PenTool, Brain } from '@lucide/vue'

const router = useRouter()

interface CategoryNode { id: number; name: string; children: { id: number; name: string }[] }

const categories = ref<CategoryNode[]>([])
const loading = ref(true)

const stats = ref({ sites: 0, categories: 0, users: 0 })

// 图标映射
const iconMap: Record<string, Component> = {
  '游戏': Gamepad2, '二次元': Palette, '书籍': BookOpen,
  '学习': GraduationCap, '工具': Wrench, '影视': Film,
  '音乐': Music, '论坛': MessageCircle, '设计': PenTool,
  'AI': Brain,
}

// 分类描述
const descMap: Record<string, string> = {
  '游戏': '热门游戏资讯与攻略', '二次元': '动漫、漫画与插画',
  '书籍': '电子书、小说与阅读', '学习': '在线课程与知识平台',
  '工具': '效率工具与实用网站', '影视': '电影、剧集与动漫',
  '音乐': '在线音乐与音频资源', '论坛': '技术社区与交流平台',
  '设计': '设计灵感与素材资源', 'AI': '人工智能工具与资源',
}

// 颜色渐变
const colorPalette = [
  'linear-gradient(135deg, #667eea, #764ba2)',
  'linear-gradient(135deg, #f093fb, #f5576c)',
  'linear-gradient(135deg, #4facfe, #00f2fe)',
  'linear-gradient(135deg, #43e97b, #38f9d7)',
  'linear-gradient(135deg, #fa709a, #fee140)',
  'linear-gradient(135deg, #a18cd1, #fbc2eb)',
  'linear-gradient(135deg, #fccb90, #d57eeb)',
  'linear-gradient(135deg, #96fbc4, #f9f586)',
  'linear-gradient(135deg, #e0c3fc, #8ec5fc)',
  'linear-gradient(135deg, #d299c2, #fef9d7)',
]

function getCatIcon(name: string): Component { return iconMap[name] || Compass }
function getCatDesc(name: string): string { return descMap[name] || '探索更多精彩内容' }
function getCatColor(id: number): string { return colorPalette[(id - 1) % colorPalette.length] }

// 精选推荐（mock）
const featuredSites = [
  { id: 1, name: 'GitHub', emoji: '🐙', desc: '全球最大的代码托管平台', url: 'https://github.com', bg: 'linear-gradient(135deg, #24292e, #444d56)' },
  { id: 2, name: 'B站', emoji: '📺', desc: '国内领先的视频社区', url: 'https://www.bilibili.com', bg: 'linear-gradient(135deg, #fb7299, #ff80ab)' },
  { id: 3, name: '知乎', emoji: '💡', desc: '高质量问答社区', url: 'https://www.zhihu.com', bg: 'linear-gradient(135deg, #0084ff, #0066cc)' },
  { id: 4, name: 'Steam', emoji: '🎮', desc: '全球最大PC游戏平台', url: 'https://store.steampowered.com', bg: 'linear-gradient(135deg, #1b2838, #2a475e)' },
  { id: 5, name: 'ChatGPT', emoji: '🤖', desc: 'OpenAI 智能对话助手', url: 'https://chat.openai.com', bg: 'linear-gradient(135deg, #10a37f, #1a7f64)' },
  { id: 6, name: 'MDN', emoji: '📖', desc: 'Web 开发权威文档', url: 'https://developer.mozilla.org', bg: 'linear-gradient(135deg, #1c1c1c, #4e4e4e)' },
]

onMounted(async () => {
  try {
    const res = await fetch('/api/front/category/tree')
    const json = await res.json()
    if (json.code === '00000') {
      categories.value = json.data
      // 统计子类总数
      let subCount = 0
      for (const p of json.data) {
        subCount += (p.children?.length || 0)
      }
      stats.value.categories = subCount
    }
  } catch (e) { console.error(e) } finally { loading.value = false }

  // 尝试获取网站数量
  try {
    const res = await fetch('/api/front/website/sections')
    const json = await res.json()
    if (json.code === '00000') {
      let total = 0
      for (const sec of json.data) {
        total += (sec.websites?.length || 0)
      }
      stats.value.sites = total
    }
  } catch (e) { /* ignore */ }
  stats.value.users = 1280
})

function navigateToCategory(catId: number) {
  router.push({ path: '/game', query: { category: String(catId) } })
}

function scrollToCategories() {
  document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style scoped>
.home-wrapper { min-height: 100vh; background: #fff; }

/* ==================== Hero ==================== */
.hero {
  display: flex; align-items: center; justify-content: space-between;
  padding: 80px 60px 60px; gap: 40px;
  background:
    url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.06'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3Ccircle cx='0' cy='0' r='1.5'/%3E%3Ccircle cx='60' cy='0' r='1.5'/%3E%3Ccircle cx='0' cy='60' r='1.5'/%3E%3Ccircle cx='60' cy='60' r='1.5'/%3E%3C/g%3E%3Cg stroke='%23ffffff' stroke-opacity='0.04' stroke-width='0.5'%3E%3Cline x1='30' y1='30' x2='0' y2='0'/%3E%3Cline x1='30' y1='30' x2='60' y2='0'/%3E%3Cline x1='30' y1='30' x2='0' y2='60'/%3E%3Cline x1='30' y1='30' x2='60' y2='60'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"),
    linear-gradient(135deg, #0f0c29, #302b63, #24243e);
  color: #fff; overflow: hidden; position: relative; min-height: 520px;
}
.hero::before {
  content: ''; position: absolute; top: -50%; right: -20%;
  width: 600px; height: 600px;
  background: radial-gradient(circle, rgba(102,126,234,0.3) 0%, transparent 70%);
  border-radius: 50%;
}
.hero-content { position: relative; z-index: 1; max-width: 520px; }
.hero-badge {
  display: inline-block; padding: 4px 14px;
  border-radius: 20px; font-size: 12px; font-weight: 600;
  background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2);
  margin-bottom: 16px; letter-spacing: 1px;
}
.hero h1 { font-size: 48px; font-weight: 800; margin: 0 0 16px; line-height: 1.2; }
.hero-desc { font-size: 17px; line-height: 1.6; opacity: 0.8; margin: 0 0 32px; }
.hero-actions { display: flex; gap: 12px; }
.btn-primary {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 28px; border: none; border-radius: 8px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff; font-size: 15px; font-weight: 600;
  cursor: pointer; transition: all 0.2s;
}
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(102,126,234,0.4); }
.btn-outline {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 28px; border: 2px solid rgba(255,255,255,0.3);
  border-radius: 8px; background: transparent; color: #fff;
  font-size: 15px; font-weight: 600; cursor: pointer;
  transition: all 0.2s;
}
.btn-outline:hover { border-color: #fff; background: rgba(255,255,255,0.08); }

/* 浮动卡片 */
.hero-visual { position: relative; z-index: 1; display: none; }
.floating-cards { position: relative; width: 280px; height: 280px; }
.float-card {
  position: absolute; padding: 16px 22px; border-radius: 12px;
  font-size: 15px; font-weight: 700; color: #333;
  background: rgba(255,255,255,0.92); box-shadow: 0 8px 32px rgba(0,0,0,0.15);
  backdrop-filter: blur(10px); animation: float 3s ease-in-out infinite;
}
.c1 { top: 10px; left: 10px; animation-delay: 0s; }
.c2 { top: 40px; right: 0; animation-delay: 0.5s; }
.c3 { bottom: 30px; left: 30px; animation-delay: 1s; }
.c4 { bottom: 10px; right: 20px; animation-delay: 1.5s; }
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
@media (min-width: 1024px) { .hero-visual { display: block; } }

/* ==================== 统计 ==================== */
.stats {
  display: flex; justify-content: center; align-items: center;
  gap: 48px; padding: 36px 24px; background: #fff;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}
.stat-item { text-align: center; }
.stat-num { display: block; font-size: 28px; font-weight: 800; color: #302b63; }
.stat-label { font-size: 13px; color: #909399; margin-top: 4px; display: block; }
.stat-divider { width: 1px; height: 36px; background: #ebeef5; }

/* ==================== 分类入口 ==================== */
.categories-section { padding: 60px 24px; max-width: 1200px; margin: 0 auto; }
.section-head { text-align: center; margin-bottom: 36px; }
.section-head h2 { font-size: 28px; font-weight: 700; color: #303133; margin: 0 0 8px; }
.section-head p { font-size: 15px; color: #909399; margin: 0; }

.cat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
.cat-card {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 28px 16px; border-radius: 12px; cursor: pointer;
  background: #fff; border: 1px solid #ebeef5;
  transition: all 0.25s; text-align: center;
}
.cat-card:hover { border-color: #667eea; box-shadow: 0 4px 20px rgba(102,126,234,0.12); transform: translateY(-4px); }
.cat-icon {
  width: 56px; height: 56px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center; color: #fff;
}
.cat-name { font-size: 16px; font-weight: 600; color: #303133; }
.cat-desc { font-size: 12px; color: #909399; }
.cat-count { font-size: 11px; color: #c0c4cc; padding: 2px 10px; border-radius: 10px; background: #f5f7fa; }

/* ==================== 精选推荐 ==================== */
.featured-section { padding: 40px 24px 60px; max-width: 1200px; margin: 0 auto; }
.featured-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.featured-card {
  display: flex; align-items: center; gap: 14px;
  padding: 16px; border-radius: 10px;
  background: #fff; border: 1px solid #ebeef5;
  text-decoration: none; transition: all 0.2s;
}
.featured-card:hover { border-color: #667eea; box-shadow: 0 2px 12px rgba(102,126,234,0.1); transform: translateY(-2px); }
.featured-cover {
  width: 48px; height: 48px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.featured-emoji { font-size: 24px; }
.featured-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.featured-name { font-size: 14px; font-weight: 600; color: #303133; }
.featured-desc { font-size: 12px; color: #909399; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* ==================== CTA ==================== */
.cta-section {
  text-align: center; padding: 64px 24px;
  background: linear-gradient(135deg, #667eea, #764ba2); color: #fff;
}
.cta-section h2 { font-size: 28px; margin: 0 0 8px; }
.cta-section p { font-size: 15px; opacity: 0.85; margin: 0 0 24px; }
.cta-section .btn-primary {
  background: #fff; color: #667eea; font-size: 16px; padding: 14px 36px;
}
.cta-section .btn-primary:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.2); }

/* ==================== 页脚 ==================== */
.home-footer {
  text-align: center; padding: 24px; color: #909399;
  font-size: 13px; border-top: 1px solid #ebeef5;
}

.loading-text { text-align: center; padding: 40px; color: #909399; }

@media (max-width: 768px) {
  .hero { padding: 48px 24px 40px; flex-direction: column; text-align: center; min-height: auto; }
  .hero h1 { font-size: 34px; }
  .hero-actions { justify-content: center; flex-wrap: wrap; }
  .stats { gap: 24px; }
  .featured-grid { grid-template-columns: 1fr; }
  .cat-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>

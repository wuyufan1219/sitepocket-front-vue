<template>
  <aside class="sidebar" :class="{ collapsed: !modelValue }">
    <!-- 品牌 -->
    <div class="sidebar-brand" @click="router.push('/home')" style="cursor:pointer">
      <img src="/图标.png" alt="logo" class="brand-logo" />
      <span class="brand-name">网站口袋</span>
    </div>

    <!-- 分类树（主体） -->
    <nav class="category-tree" v-if="!loading">
      <!-- 首页入口 -->
      <div class="tree-parent">
        <a
          href="javascript:void(0)"
          class="tree-toggle"
          :class="{ active: route.path === '/home' }"
          @click="router.push('/home')"
        >
          <Home :size="16" class="tree-icon" />
          <span class="tree-name">首页</span>
        </a>
      </div>

      <div v-for="cat in categories" :key="cat.id" class="tree-parent">
        <a
          href="javascript:void(0)"
          class="tree-toggle"
          :class="{ active: expandedId === cat.id }"
          :title="cat.name"
          @click="toggleCat(cat)"
        >
          <component :is="getIcon(cat.name)" :size="16" class="tree-icon" />
          <span class="tree-name">{{ cat.name }}</span>
          <ChevronRight
            v-if="cat.children?.length"
            :size="14"
            class="tree-arrow"
            :class="{ open: expandedId === cat.id }"
          />
        </a>

        <div v-if="!collapsed && expandedId === cat.id && cat.children?.length" class="tree-children">
          <a
            v-for="child in cat.children"
            :key="child.id"
            href="javascript:void(0)"
            class="tree-child"
            @click="scrollToChild(child.id)"
          >
            {{ child.name }}
          </a>
        </div>
      </div>
    </nav>

    <div v-if="loading" class="loading-text">加载中...</div>

    <!-- 底部收起按钮 -->
    <div class="sidebar-footer">
      <button class="collapse-btn" @click="$emit('update:modelValue', !modelValue)">
        <ChevronLeft :size="18" :class="{ rotated: !modelValue }" />
        <span v-if="modelValue" class="collapse-label">收起侧栏</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, type Component } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import request from '@/utils/request'
import { Gamepad2, Palette, BookOpen, GraduationCap, Wrench, Film, Music, MessageCircle, PenTool, Brain, Compass, ChevronLeft, ChevronRight, Home } from '@lucide/vue'

const props = defineProps<{ modelValue: boolean }>()
defineEmits<{
  (e: 'update:modelValue', v: boolean): void
}>()

const collapsed = computed(() => !props.modelValue)

const router = useRouter()
const route = useRoute()

const categories = ref<CategoryNode[]>([])
const expandedId = ref<number | null>(null)
const loading = ref(true)

interface CategoryNode { id: number; name: string; children: { id: number; name: string }[] }

const iconMap: Record<string, Component> = {
  '游戏': Gamepad2, '二次元': Palette, '书籍': BookOpen,
  '学习': GraduationCap, '工具': Wrench, '影视': Film,
  '音乐': Music, '论坛': MessageCircle, '设计': PenTool,
  'AI': Brain,
}
function getIcon(name: string) { return iconMap[name] || Compass }

onMounted(async () => {
  try {
    const res = await request.get('/api/front/category/tree')
    categories.value = res.data.data
  } catch (e) { console.error(e) } finally { loading.value = false }
})

const catRoutes: Record<string, string> = {
  '游戏': '/game', '二次元': '/acg',
}

function toggleCat(cat: CategoryNode) {
  if (expandedId.value === cat.id) {
    expandedId.value = null
    router.push(catRoutes[cat.name] || '/game')
  } else {
    expandedId.value = cat.id
    const target = catRoutes[cat.name] || '/game'
    router.push({ path: target, query: { category: String(cat.id) } })
  }
}

function currentPage(): string {
  if (!expandedId.value) return '/game'
  const cat = categories.value.find(c => c.id === expandedId.value)
  return cat ? (catRoutes[cat.name] || '/game') : '/game'
}

function scrollToChild(subCategoryId: number) {
  const target = currentPage()
  if (route.path !== target) {
    router.push({ path: target, query: scrollQuery() }).then(() => {
      setTimeout(() => doScroll(subCategoryId), 250)
    })
  } else {
    doScroll(subCategoryId)
  }
}

function scrollQuery() {
  const q: Record<string, string> = {}
  if (expandedId.value) q.category = String(expandedId.value)
  return q
}

function doScroll(subCategoryId: number) {
  const el = document.getElementById('section-' + subCategoryId)
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<style scoped>
/* ==================== 基础 ==================== */
.sidebar {
  position: fixed; left: 0; top: 0; bottom: 0;
  width: 220px; background: #fff;
  border-right: 1px solid #ebeef5;
  display: flex; flex-direction: column;
  z-index: 200; transition: width 0.25s ease;
  overflow: hidden; box-sizing: border-box;
}
.sidebar.collapsed { width: 60px; }

.sidebar-brand {
  display: flex; align-items: center; gap: 10px;
  padding: 16px 14px; border-bottom: 1px solid #ebeef5;
  white-space: nowrap; overflow: hidden; flex-shrink: 0;
}
.brand-logo {
  width: 32px; height: 32px; min-width: 32px;
  background: linear-gradient(135deg, #409EFF, #1890ff);
  color: #fff; font-size: 14px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  border-radius: 6px;
}
.brand-name { font-size: 16px; font-weight: 700; color: #303133; overflow: hidden; }
.collapsed .brand-name { display: none; }
.collapsed .sidebar-brand { justify-content: center; padding: 16px 0; }

/* ==================== 分类树 ==================== */
.category-tree { flex: 1; overflow-y: auto; padding: 4px 8px; }
.tree-parent { margin-bottom: 2px; }

.tree-toggle {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 12px; border-radius: 6px;
  color: #303133; text-decoration: none; font-size: 14px; font-weight: 500;
  transition: all 0.15s; cursor: pointer;
}
.tree-toggle:hover { background: #f5f7fa; color: #409EFF; }
.tree-toggle.active { background: #ecf5ff; color: #409EFF; }
.tree-toggle.tree-all {
  color: #409EFF; font-weight: 600;
}
.tree-toggle.tree-all .tree-icon { color: #409EFF; }
.tree-icon { flex-shrink: 0; }
.tree-name { flex: 1; overflow: hidden; white-space: nowrap; }
.tree-arrow { flex-shrink: 0; color: #909399; transition: transform 0.2s; }
.tree-arrow.open { transform: rotate(90deg); }

.collapsed .tree-name,
.collapsed .tree-arrow,
.collapsed .tree-children { display: none; }
.collapsed .tree-toggle { justify-content: center; padding: 8px 0; }
.collapsed .category-tree { padding: 8px 4px; }

.tree-children { padding-left: 24px; display: flex; flex-direction: column; gap: 1px; }
.tree-child {
  display: block; padding: 7px 12px; border-radius: 4px;
  color: #606266; text-decoration: none; font-size: 13px; cursor: pointer;
  transition: all 0.12s;
}
.tree-child:hover { background: #f0f5ff; color: #409EFF; }

/* ==================== 底部区域 ==================== */
.loading-text { text-align: center; font-size: 13px; color: #909399; padding: 16px; }

.sidebar-footer {
  border-top: 1px solid #ebeef5;
  padding: 4px 8px;
  flex-shrink: 0;
}

.collapse-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 12px 14px; border: none;
  color: #909399; cursor: pointer; font-size: 13px;
  transition: color 0.15s; white-space: nowrap;
  background: none; width: 100%; margin-top: 2px;
  border-top: 1px solid #ebeef5;
}
.collapse-btn:hover { color: #409EFF; }
.collapsed .collapse-btn { justify-content: center; padding: 12px 0; }
.collapse-label { overflow: hidden; }
.rotated { transform: rotate(180deg); transition: transform 0.25s ease; }
</style>

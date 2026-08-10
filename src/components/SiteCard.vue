<template>
  <a :href="site.url" target="_blank" class="site-card">
    <!-- 左侧图标 -->
    <div class="card-icon" :style="{ background: site.bg }">
      <span class="card-emoji">{{ site.emoji }}</span>
    </div>

    <!-- 右侧信息 -->
    <div class="card-body">
      <!-- 标题行：名称 + 可选评分 -->
      <div class="card-title-row">
        <h4 class="card-name">{{ site.name }}</h4>
        <span v-if="site.rating" class="card-rating">⭐ {{ site.rating }}</span>
      </div>

      <!-- 描述 -->
      <p class="card-desc">{{ site.desc }}</p>

      <!-- 标签行 -->
      <div class="card-tags">
        <span v-if="site.category" class="tag category-tag">{{ site.category }}</span>
        <span v-for="t in site.tags" :key="t" class="tag">{{ t }}</span>
      </div>

      <!-- 底部：链接 + 可选用户数 -->
      <div class="card-meta">
        <span class="card-link">查看详情 →</span>
        <span v-if="site.users" class="card-users">{{ fmtUsers(site.users) }} 人在用</span>
      </div>
    </div>
  </a>
</template>

<script setup lang="ts">
export interface SiteCardData {
  id: number
  name: string
  emoji: string
  desc: string
  tags: string[]
  url: string
  bg: string
  category?: string
  rating?: number
  users?: number
}

defineProps<{
  site: SiteCardData
}>()

function fmtUsers(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + '万'
  return String(n)
}
</script>

<style scoped>
.site-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 16px;
  text-decoration: none;
  transition: all 0.25s;
}

.site-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
  border-color: #c6e2ff;
}

/* 左侧图标 */
.card-icon {
  width: 48px;
  height: 48px;
  min-width: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-emoji {
  font-size: 24px;
}

/* 右侧信息 */
.card-body {
  flex: 1;
  min-width: 0;
}

.card-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.card-name {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.card-rating {
  font-size: 12px;
  color: #e6a23c;
  font-weight: 600;
  white-space: nowrap;
}

.card-desc {
  margin: 0 0 8px;
  font-size: 12px;
  color: #909399;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 标签 */
.card-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.tag {
  padding: 1px 6px;
  background: #ecf5ff;
  color: #409EFF;
  border-radius: 3px;
  font-size: 11px;
  border: 1px solid #d9ecff;
}

.tag.category-tag {
  background: #fdf6ec;
  color: #e6a23c;
  border-color: #faecd8;
}

/* 底部操作行 */
.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-link {
  font-size: 12px;
  color: #409EFF;
  font-weight: 600;
}

.card-users {
  font-size: 12px;
  color: #c0c4cc;
}
</style>

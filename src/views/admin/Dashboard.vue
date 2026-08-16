<template>
  <div>
    <el-row :gutter="16">
      <el-col v-for="card in cards" :key="card.label" :span="8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-label">{{ card.label }}</div>
          <div class="stat-value" :style="{ color: card.color }">{{ card.value }}</div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import request from '@/utils/request'
import type { DashboardStats } from '@/types'

const stats = ref<DashboardStats>({
  websiteCount: 0,
  aliveCount: 0,
  deadCount: 0,
  categoryCount: 0,
  userCount: 0,
  favoriteCount: 0,
})

const cards = computed(() => [
  { label: '网站总数', value: stats.value.websiteCount, color: '#303133' },
  { label: '分类数量', value: stats.value.categoryCount, color: '#303133' },
  { label: '可用网站', value: stats.value.aliveCount, color: '#16a34a' },
  { label: '禁用网站', value: stats.value.deadCount, color: '#dc2626' },
  { label: '注册用户', value: stats.value.userCount, color: '#303133' },
  { label: '收藏总数', value: stats.value.favoriteCount, color: '#303133' },
])

onMounted(async () => {
  const res = await request.get('/api/admin/dashboard/stats')
  stats.value = res.data.data || res.data
})
</script>

<style scoped>
.stat-card {
  margin-bottom: 16px;
  text-align: center;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  margin-top: 8px;
}
</style>

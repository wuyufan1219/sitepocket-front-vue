<template>
  <NavPage
    hero-title="发现精彩网站资源"
    hero-subtitle="骨灰级玩家必备导航 — 汇聚全网优质网站与工具"
    search-placeholder="搜索网站名称或描述..."
    :default-category-id="1"
    accent-color="#409EFF"
    :load-category-tree="true"
    :read-route-category="true"
  />
</template>

<script setup lang="ts">
import NavPage from '@/components/NavPage.vue'
</script>

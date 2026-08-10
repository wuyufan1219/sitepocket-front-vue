import { defineStore } from 'pinia'
import { ref } from 'vue'
import request from '@/utils/request'

/** 游戏分类项 */
export interface GameCategory {
  name: string
}

export const useGameFilterStore = defineStore('gameFilter', () => {
  // ---- 分类列表（后续从后端 API 获取） ----
  const categories = ref<GameCategory[]>([
    { name: '全部' },
    { name: '游戏平台' },
    { name: '单机游戏' },
    { name: '动作冒险' },
    { name: '射击竞技' },
    { name: 'RPG' },
    { name: '休闲益智' },
    { name: '模拟经营' },
    { name: '游戏工具' },
    { name: '游戏直播' },
  ])

  // ---- 当前选中分类 ----
  const activeCategory = ref('全部')

  function setCategory(cat: string) {
    activeCategory.value = cat
  }

  /** 从后端加载分类列表 */
  async function fetchCategories() {
    try {
      const res = await request.get('/api/front/categories', { params: { type: 'game' } })
      const list = res.data.data || res.data
      if (Array.isArray(list) && list.length) {
        categories.value = list
      }
    } catch {
      // 后端不可用时使用默认分类
    }
  }

  return { categories, activeCategory, setCategory, fetchCategories }
})

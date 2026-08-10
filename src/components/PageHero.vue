<template>
  <section class="page-hero">
    <h2>{{ title }}</h2>
    <p v-if="subtitle">{{ subtitle }}</p>
    <div class="search-box">
      <input
        v-model="query"
        type="text"
        :placeholder="placeholder"
        class="search-input"
        @keyup.enter="$emit('search', query)"
      />
      <button class="search-btn" @click="$emit('search', query)">搜索</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  title: string
  subtitle?: string
  placeholder?: string
}>()

defineEmits<{
  (e: 'search', query: string): void
}>()

const query = ref('')
</script>

<style scoped>
.page-hero {
  text-align: center;
  margin-bottom: 28px;
}

.page-hero h2 {
  font-size: 28px;
  color: #1a1a1a;
  margin: 0 0 8px;
}

.page-hero p {
  font-size: 15px;
  color: #666;
  margin: 0 0 20px;
}

.search-box {
  display: flex;
  max-width: 560px;
  margin: 0 auto;
}

.search-input {
  flex: 1;
  height: 44px;
  padding: 0 16px;
  border: 1px solid #dcdfe6;
  border-right: none;
  border-radius: 6px 0 0 6px;
  font-size: 14px;
  outline: none;
  background: #fff;
  color: #333;
}

.search-input::placeholder {
  color: #c0c4cc;
}

.search-input:focus {
  border-color: #409EFF;
}

.search-btn {
  height: 44px;
  padding: 0 24px;
  background: #409EFF;
  color: #fff;
  border: none;
  border-radius: 0 6px 6px 0;
  font-size: 14px;
  cursor: pointer;
}

.search-btn:hover {
  background: #337ecc;
}
</style>

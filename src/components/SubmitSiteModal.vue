<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="close">
      <div class="modal-card">
        <span class="modal-close" @click.stop="close">✕</span>
        <h1>提交网站</h1>
        <p class="modal-tip">提交后由管理员审核，通过后即可在对应分类展示</p>

        <form class="submit-form" @submit.prevent="handleSubmit">
          <div class="form-item">
            <label for="sub-siteName">网站名称 *</label>
            <input v-model="form.siteName" id="sub-siteName" type="text" placeholder="请输入网站名称" maxlength="100" />
          </div>

          <div class="form-item">
            <label for="sub-siteUrl">网站地址 *</label>
            <input v-model="form.siteUrl" id="sub-siteUrl" type="text" placeholder="https://example.com" maxlength="255" />
          </div>

          <div class="form-item">
            <label for="sub-category">分类</label>
            <select v-model="form.categoryId" id="sub-category">
              <option :value="null">请选择分类（选填）</option>
              <optgroup v-for="g in categories" :key="g.id" :label="g.name">
                <option v-for="c in g.children" :key="c.id" :value="c.id">{{ c.name }}</option>
              </optgroup>
            </select>
          </div>

          <div class="form-item">
            <label for="sub-desc">描述</label>
            <textarea v-model="form.siteDesc" id="sub-desc" rows="2" placeholder="简单介绍这个网站（选填）" maxlength="500"></textarea>
          </div>

          <div class="form-item">
            <label for="sub-icon">图标 URL</label>
            <input v-model="form.siteIcon" id="sub-icon" type="text" placeholder="https://...（选填）" maxlength="255" />
          </div>

          <button type="submit" class="btn-submit" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            {{ loading ? '提交中...' : '提交审核' }}
          </button>

          <p v-if="msg" :class="['message', msgType]">{{ msg }}</p>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import request from '@/utils/request'
import type { CategoryNode } from '@/types'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'success'): void
}>()

const categories = ref<CategoryNode[]>([])
const loading = ref(false)
const msg = ref('')
const msgType = ref<'success' | 'error'>('success')

const form = reactive({
  siteName: '',
  siteUrl: '',
  siteDesc: '',
  siteIcon: '',
  categoryId: null as number | null,
})

watch(() => props.visible, (val) => {
  if (val) {
    reset()
    loadCategories()
  }
})

function reset() {
  form.siteName = ''
  form.siteUrl = ''
  form.siteDesc = ''
  form.siteIcon = ''
  form.categoryId = null
  msg.value = ''
  loading.value = false
}

async function loadCategories() {
  try {
    const res = await request.get('/api/front/category/tree')
    categories.value = res.data.data || []
  } catch {
    categories.value = []
  }
}

function close() {
  emit('update:visible', false)
}

async function handleSubmit() {
  if (!form.siteName.trim() || !form.siteUrl.trim()) {
    msg.value = '请填写网站名称和地址'
    msgType.value = 'error'
    return
  }
  loading.value = true
  msg.value = ''
  try {
    await request.post('/api/front/submission', {
      siteName: form.siteName.trim(),
      siteUrl: form.siteUrl.trim(),
      siteDesc: form.siteDesc.trim() || null,
      siteIcon: form.siteIcon.trim() || null,
      categoryId: form.categoryId,
    })
    msg.value = '提交成功，等待审核'
    msgType.value = 'success'
    emit('success')
    setTimeout(close, 800)
  } catch (e: any) {
    msg.value = e?.message || '提交失败，请稍后重试'
    msgType.value = 'error'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 16px;
}

.modal-card {
  width: 100%;
  max-width: 460px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #0f0303;
  padding: 32px 28px 24px;
  box-shadow: 8px 8px 0px #000000;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 16px;
  font-size: 20px;
  color: #999;
  cursor: pointer;
  line-height: 1;
}
.modal-close:hover { color: #333; }

h1 { font-size: 22px; font-weight: 700; color: #000; margin: 0 0 6px; text-align: center; }
.modal-tip { font-size: 12px; color: #999; text-align: center; margin: 0 0 18px; }

.submit-form { display: flex; flex-direction: column; gap: 14px; }

.form-item { display: flex; flex-direction: column; gap: 4px; }
.form-item label { font-size: 13px; font-weight: 600; color: #333; }
.form-item input,
.form-item textarea,
.form-item select {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid #000;
  font-size: 14px;
  color: #333;
  outline: none;
  box-sizing: border-box;
  background: #fff;
}
.form-item textarea { resize: vertical; font-family: inherit; }
.form-item input::placeholder,
.form-item textarea::placeholder { color: #bbb; }
.form-item input:focus,
.form-item textarea:focus,
.form-item select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.12);
}

.btn-submit {
  height: 44px;
  margin-top: 2px;
  border: none;
  background: #667eea;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: opacity 0.2s;
  border-radius: 4px;
}
.btn-submit:hover:not(:disabled) { opacity: 0.92; }
.btn-submit:disabled { opacity: 0.65; cursor: not-allowed; }

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.message { margin: 0; padding: 8px 14px; border-radius: 6px; font-size: 13px; text-align: center; }
.message.success { background: #e6f9ed; color: #1a8a4a; }
.message.error { background: #fdecea; color: #d32f2f; }
</style>

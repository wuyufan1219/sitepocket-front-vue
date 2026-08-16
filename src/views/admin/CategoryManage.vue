<template>
  <div>
    <div class="toolbar">
      <el-button type="primary" @click="openAdd">新增分类</el-button>
    </div>

    <el-table :data="rows" border v-loading="loading">
      <el-table-column prop="name" label="分类名称" min-width="160" />
      <el-table-column label="父分类" width="160">
        <template #default="{ row }">{{ parentName(row as AdminCategory) }}</template>
      </el-table-column>
      <el-table-column prop="sortOrder" label="排序" width="80" />
      <el-table-column label="操作" width="160">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row as AdminCategory)">编辑</el-button>
          <el-button link type="danger" @click="onDelete(row as AdminCategory)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑分类' : '新增分类'" width="480px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="父分类">
          <el-select v-model="form.parentId" style="width: 100%">
            <el-option label="顶级分类" :value="0" />
            <el-option v-for="c in parentOptions" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sortOrder" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'
import type { AdminCategory } from '@/types'

const loading = ref(false)
const rows = ref<AdminCategory[]>([])
const dialogVisible = ref(false)
const editingId = ref<number | null>(null)

const form = reactive({ name: '', parentId: 0, sortOrder: 0 })

const parentOptions = computed(() => rows.value.filter((c) => c.parentId === 0))

async function load() {
  loading.value = true
  try {
    const res = await request.get('/api/admin/category/list')
    rows.value = res.data.data || res.data
  } finally {
    loading.value = false
  }
}

function parentName(row: AdminCategory): string {
  if (row.parentId === 0) return '顶级分类'
  return rows.value.find((c) => c.id === row.parentId)?.name || '-'
}

function openAdd() {
  editingId.value = null
  form.name = ''
  form.parentId = 0
  form.sortOrder = 0
  dialogVisible.value = true
}

function openEdit(row: AdminCategory) {
  editingId.value = row.id
  form.name = row.name
  form.parentId = row.parentId
  form.sortOrder = row.sortOrder
  dialogVisible.value = true
}

async function submit() {
  if (!form.name.trim()) {
    ElMessage.warning('请输入分类名称')
    return
  }
  try {
    if (editingId.value) {
      await request.put(`/api/admin/category/${editingId.value}`, { ...form })
    } else {
      await request.post('/api/admin/category', { ...form })
    }
    ElMessage.success('保存成功')
    dialogVisible.value = false
    load()
  } catch (e: any) {
    ElMessage.error(e.message || '保存失败')
  }
}

async function onDelete(row: AdminCategory) {
  try {
    await ElMessageBox.confirm(`确定删除分类「${row.name}」吗？`, '提示', { type: 'warning' })
  } catch {
    return
  }
  try {
    await request.delete(`/api/admin/category/${row.id}`)
    ElMessage.success('删除成功')
    load()
  } catch (e: any) {
    ElMessage.error(e.message || '删除失败')
  }
}

onMounted(load)
</script>

<style scoped>
.toolbar {
  margin-bottom: 16px;
}
</style>

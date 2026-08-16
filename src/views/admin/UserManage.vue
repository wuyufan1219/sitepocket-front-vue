<template>
  <div>
    <div class="toolbar">
      <el-input
        v-model="query.keyword"
        placeholder="搜索用户名/昵称"
        clearable
        style="width: 200px"
        @keyup.enter="search"
      />
      <el-select v-model="query.status" clearable placeholder="状态" style="width: 120px">
        <el-option label="正常" :value="0" />
        <el-option label="禁用" :value="1" />
      </el-select>
      <el-button type="primary" @click="search">搜索</el-button>
      <el-button @click="reset">重置</el-button>
    </div>

    <el-table :data="rows" border v-loading="loading">
      <el-table-column prop="id" label="ID" width="90" />
      <el-table-column prop="username" label="用户名" min-width="120" />
      <el-table-column label="昵称" min-width="120">
        <template #default="{ row }">{{ row.nickName || '-' }}</template>
      </el-table-column>
      <el-table-column label="性别" width="70">
        <template #default="{ row }">
          {{ row.userSex === 0 ? '男' : row.userSex === 1 ? '女' : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.status === 0 ? 'success' : 'danger'">
            {{ row.status === 0 ? '正常' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="注册时间" width="170" />
      <el-table-column label="操作" width="140" fixed="right">
        <template #default="{ row }">
          <el-button link :type="row.status === 0 ? 'warning' : 'success'" @click="onToggleStatus(row as AdminUser)">
            {{ row.status === 0 ? '禁用' : '启用' }}
          </el-button>
          <el-button link type="danger" @click="onDelete(row as AdminUser)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pager">
      <el-pagination
        background
        layout="total, prev, pager, next"
        :total="total"
        :page-size="query.size"
        :current-page="query.page"
        @current-change="onPageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'
import type { AdminUser } from '@/types'

const loading = ref(false)
const rows = ref<AdminUser[]>([])
const total = ref(0)

const query = reactive({
  page: 1,
  size: 10,
  keyword: '',
  status: undefined as number | undefined,
})

async function load() {
  loading.value = true
  try {
    const res = await request.get('/api/admin/user', { params: query })
    const data = res.data.data || res.data
    rows.value = data.records || []
    total.value = data.total || 0
  } finally {
    loading.value = false
  }
}

function search() {
  query.page = 1
  load()
}

function reset() {
  query.page = 1
  query.keyword = ''
  query.status = undefined
  load()
}

function onPageChange(page: number) {
  query.page = page
  load()
}

async function onToggleStatus(row: AdminUser) {
  const target = row.status === 0 ? 1 : 0
  const actionText = target === 1 ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(`确定要${actionText}用户「${row.username}」吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  try {
    await request.put(`/api/admin/user/${row.id}/status`, null, { params: { status: target } })
    ElMessage.success(`已${actionText}`)
    load()
  } catch (e: any) {
    ElMessage.error(e?.message || '操作失败')
  }
}

async function onDelete(row: AdminUser) {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户「${row.username}」吗？其收藏、浏览记录、提交记录将被一并清理，此操作不可恢复。`,
      '删除用户',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'error',
      },
    )
  } catch {
    return
  }
  try {
    await request.delete(`/api/admin/user/${row.id}`)
    ElMessage.success('已删除')
    load()
  } catch (e: any) {
    ElMessage.error(e?.message || '操作失败')
  }
}

onMounted(load)
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.pager {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>

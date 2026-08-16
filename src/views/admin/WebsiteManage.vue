<template>
  <div>
    <div class="toolbar">
      <el-input
        v-model="query.keyword"
        placeholder="搜索名称/描述"
        clearable
        style="width: 200px"
        @keyup.enter="search"
      />
      <el-select v-model="query.parentId" clearable placeholder="父分类" style="width: 130px" @change="onParentChange">
        <el-option v-for="g in categoryTree" :key="g.id" :label="g.name" :value="g.id" />
      </el-select>
      <el-select v-model="query.categoryId" clearable placeholder="子分类" style="width: 130px">
        <el-option v-for="c in subCategories" :key="c.id" :label="c.name" :value="c.id" />
      </el-select>
      <el-select v-model="query.status" clearable placeholder="状态" style="width: 120px">
        <el-option label="正常" :value="1" />
        <el-option label="禁用" :value="0" />
      </el-select>
      <el-select v-model="query.checkStatus" clearable placeholder="检测状态" style="width: 130px">
        <el-option label="正常" :value="1" />
        <el-option label="疑似失效" :value="2" />
      </el-select>
      <el-button type="primary" @click="search">搜索</el-button>
      <el-button @click="reset">重置</el-button>
      <div style="margin-left: auto; display: flex; gap: 12px">
        <el-button type="warning" :loading="checking" @click="checkNow">立即检测</el-button>
        <el-button @click="toggleSelectAll">全选所有</el-button>
        <el-button type="danger" @click="batchOffline">批量下架</el-button>
        <el-button @click="batchOnline">批量恢复</el-button>
        <el-button type="primary" @click="openAdd">新增网站</el-button>
      </div>
    </div>

    <el-table ref="tableRef" :data="rows" border v-loading="loading" @selection-change="onSelectionChange">
      <el-table-column type="selection" width="50" />
      <el-table-column prop="siteName" label="名称" min-width="140" />
      <el-table-column prop="siteUrl" label="网址" min-width="200" show-overflow-tooltip />
      <el-table-column prop="categoryNames" label="分类" min-width="140" show-overflow-tooltip />
      <el-table-column label="检测状态" width="110">
        <template #default="{ row }">
          <el-tag v-if="row.checkStatus === 2" type="warning" size="small">疑似失效</el-tag>
          <el-tag v-else-if="row.checkStatus === 1" type="success" size="small">正常</el-tag>
          <el-tag v-else type="info" size="small">未检测</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="sortOrder" label="排序" width="70" />
      <el-table-column prop="visitCount" label="访问量" width="90" />
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-switch :model-value="row.status === 1" @change="(v) => toggleStatus(row as AdminWebsite, !!v)" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row as AdminWebsite)">编辑</el-button>
          <el-button link type="danger" @click="onDelete(row as AdminWebsite)">删除</el-button>
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

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑网站' : '新增网站'" width="640px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="form.siteName" />
        </el-form-item>
        <el-form-item label="网址">
          <el-input v-model="form.siteUrl" />
        </el-form-item>
        <el-form-item label="图标URL">
          <el-input v-model="form.siteIcon" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.siteDesc" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="form.categoryIds" multiple style="width: 100%" placeholder="可选择多个小分类">
            <el-option-group v-for="g in categoryTree" :key="g.id" :label="g.name">
              <el-option v-for="c in g.children" :key="c.id" :label="c.name" :value="c.id" />
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sortOrder" :min="0" />
        </el-form-item>
        <el-form-item label="公开">
          <el-switch v-model="form.isPublic" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
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
import type { AdminWebsite } from '@/types'

interface CategoryGroup {
  id: number
  name: string
  children: { id: number; name: string }[]
}

const loading = ref(false)
const rows = ref<AdminWebsite[]>([])
const total = ref(0)
const categoryTree = ref<CategoryGroup[]>([])
const dialogVisible = ref(false)
const selectedRows = ref<AdminWebsite[]>([])
const checking = ref(false)
const tableRef = ref()
const allSelected = ref(false)

const query = reactive({
  page: 1,
  size: 10,
  keyword: '',
  parentId: undefined as number | undefined,
  categoryId: undefined as number | undefined,
  status: undefined as number | undefined,
  checkStatus: undefined as number | undefined,
})

const form = reactive({
  id: undefined as number | undefined,
  siteName: '',
  siteUrl: '',
  siteIcon: '',
  siteDesc: '',
  sortOrder: 0,
  isPublic: 1,
  status: 1,
  categoryIds: [] as number[],
})

async function load() {
  loading.value = true
  try {
    const res = await request.get('/api/admin/website', { params: query })
    const data = res.data.data || res.data
    rows.value = data.records || []
    total.value = data.total || 0
  } finally {
    loading.value = false
  }
}

async function loadCategoryTree() {
  const res = await request.get('/api/front/category/tree')
  categoryTree.value = res.data.data || res.data
}

// 当前选中父分类下的子分类列表
const subCategories = computed(() => {
  if (query.parentId == null) return []
  return categoryTree.value.find((g) => g.id === query.parentId)?.children ?? []
})

// 切换父分类时清空已选子分类
function onParentChange() {
  query.categoryId = undefined
}

function search() {
  query.page = 1
  load()
}

function reset() {
  query.page = 1
  query.keyword = ''
  query.parentId = undefined
  query.categoryId = undefined
  query.status = undefined
  query.checkStatus = undefined
  load()
}

function onPageChange(page: number) {
  query.page = page
  load()
}

function onSelectionChange(rows: AdminWebsite[]) {
  selectedRows.value = rows
}

function toggleSelectAll() {
  allSelected.value = !allSelected.value
  if (allSelected.value) {
    tableRef.value?.clearSelection()
    ElMessage.success(`已全选所有筛选结果（共 ${total.value} 条）`)
  } else {
    ElMessage.info('已取消全选')
  }
}

async function checkNow() {
  if (checking.value) return
  try {
    await request.post('/api/admin/website/check', [])
    checking.value = true
    ElMessage.success('检测已启动，结果会随列表自动刷新')
    let count = 0
    const timer = setInterval(() => {
      load()
      if (++count >= 30) {
        clearInterval(timer)
        checking.value = false
        ElMessage.success('检测完成')
      }
    }, 4000)
  } catch (e: any) {
    ElMessage.error(e.message || '检测失败')
  }
}

async function batchOffline() {
  await batchStatus(0)
}

async function batchOnline() {
  await batchStatus(1)
}

async function batchStatus(status: number) {
  try {
    if (allSelected.value) {
      const res = await request.put('/api/admin/website/batch-status', {
        selectAll: true,
        status,
        keyword: query.keyword || undefined,
        categoryId: query.categoryId,
        parentId: query.parentId,
        statusFilter: query.status,
        checkStatusFilter: query.checkStatus,
      })
      const count = res.data.data || 0
      ElMessage.success(status === 1 ? `已批量恢复 ${count} 个网站` : `已批量下架 ${count} 个网站`)
      allSelected.value = false
      load()
      return
    }
    const ids = selectedRows.value.map((r) => r.id)
    if (!ids.length) {
      ElMessage.warning('请先勾选要操作的网站')
      return
    }
    await request.put('/api/admin/website/batch-status', { ids, status })
    ElMessage.success(status === 1 ? '批量恢复成功' : '批量下架成功')
    load()
  } catch (e: any) {
    ElMessage.error(e.message || '操作失败')
  }
}

function openAdd() {
  Object.assign(form, {
    id: undefined,
    siteName: '',
    siteUrl: '',
    siteIcon: '',
    siteDesc: '',
    sortOrder: 0,
    isPublic: 1,
    status: 1,
    categoryIds: [],
  })
  dialogVisible.value = true
}

function openEdit(row: AdminWebsite) {
  Object.assign(form, {
    id: row.id,
    siteName: row.siteName,
    siteUrl: row.siteUrl,
    siteIcon: row.siteIcon || '',
    siteDesc: row.siteDesc || '',
    sortOrder: row.sortOrder,
    isPublic: row.isPublic,
    status: row.status,
    categoryIds: [...(row.categoryIds || [])],
  })
  dialogVisible.value = true
}

function buildPayload() {
  return {
    siteName: form.siteName,
    siteUrl: form.siteUrl,
    siteIcon: form.siteIcon,
    siteDesc: form.siteDesc,
    sortOrder: form.sortOrder,
    isPublic: form.isPublic,
    status: form.status,
    categoryIds: form.categoryIds,
  }
}

async function submit() {
  if (!form.siteName.trim() || !form.siteUrl.trim()) {
    ElMessage.warning('请填写网站名称和网址')
    return
  }
  try {
    if (form.id) {
      await request.put(`/api/admin/website/${form.id}`, buildPayload())
    } else {
      await request.post('/api/admin/website', buildPayload())
    }
    ElMessage.success('保存成功')
    dialogVisible.value = false
    load()
  } catch (e: any) {
    ElMessage.error(e.message || '保存失败')
  }
}

async function toggleStatus(row: AdminWebsite, value: boolean) {
  try {
    await request.put(`/api/admin/website/${row.id}/status?status=${value ? 1 : 0}`)
    row.status = value ? 1 : 0
    ElMessage.success(value ? '已启用' : '已禁用')
  } catch (e: any) {
    ElMessage.error(e.message || '操作失败')
  }
}

async function onDelete(row: AdminWebsite) {
  try {
    await ElMessageBox.confirm(`确定删除网站「${row.siteName}」吗？`, '提示', { type: 'warning' })
  } catch {
    return
  }
  try {
    await request.delete(`/api/admin/website/${row.id}`)
    ElMessage.success('删除成功')
    load()
  } catch (e: any) {
    ElMessage.error(e.message || '删除失败')
  }
}

onMounted(() => {
  load()
  loadCategoryTree()
})
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

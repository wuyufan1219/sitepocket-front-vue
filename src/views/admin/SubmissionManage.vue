<template>
  <div>
    <div class="toolbar">
      <el-input
        v-model="query.keyword"
        placeholder="搜索名称/网址"
        clearable
        style="width: 200px"
        @keyup.enter="search"
      />
      <el-select v-model="query.status" clearable placeholder="状态" style="width: 120px">
        <el-option label="待审核" :value="0" />
        <el-option label="已通过" :value="1" />
        <el-option label="已驳回" :value="2" />
      </el-select>
      <el-button type="primary" @click="search">搜索</el-button>
      <el-button @click="reset">重置</el-button>
    </div>

    <el-table :data="rows" border v-loading="loading">
      <el-table-column prop="siteName" label="网站名称" min-width="140" />
      <el-table-column prop="siteUrl" label="网址" min-width="200" show-overflow-tooltip />
      <el-table-column label="分类" width="100">
        <template #default="{ row }">{{ row.categoryName || '未分类' }}</template>
      </el-table-column>
      <el-table-column prop="userId" label="提交用户ID" width="100" />
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.status)">{{ statusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="驳回原因" min-width="140" show-overflow-tooltip>
        <template #default="{ row }">{{ row.rejectReason || '-' }}</template>
      </el-table-column>
      <el-table-column prop="createTime" label="提交时间" width="160" />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <template v-if="row.status === 0">
            <el-button link type="primary" @click="openApprove(row as WebsiteSubmission)">通过</el-button>
            <el-button link type="danger" @click="onReject(row as WebsiteSubmission)">驳回</el-button>
          </template>
          <span v-else class="muted">已处理</span>
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

    <el-dialog v-model="dialogVisible" title="审核通过（可修改后发布）" width="640px">
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
          <el-select v-model="form.categoryId" clearable placeholder="选择分类" style="width: 100%">
            <el-option-group v-for="g in categoryTree" :key="g.id" :label="g.name">
              <el-option v-for="c in g.children" :key="c.id" :label="c.name" :value="c.id" />
            </el-option-group>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitApprove">通过并发布</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'
import type { WebsiteSubmission } from '@/types'

interface CategoryGroup {
  id: number
  name: string
  children: { id: number; name: string }[]
}

const loading = ref(false)
const rows = ref<WebsiteSubmission[]>([])
const total = ref(0)
const categoryTree = ref<CategoryGroup[]>([])
const dialogVisible = ref(false)
const currentId = ref<number>()

const query = reactive({
  page: 1,
  size: 10,
  keyword: '',
  status: undefined as number | undefined,
})

const form = reactive({
  siteName: '',
  siteUrl: '',
  siteIcon: '',
  siteDesc: '',
  categoryId: undefined as number | undefined,
})

async function load() {
  loading.value = true
  try {
    const res = await request.get('/api/admin/submission', { params: query })
    const data = res.data.data || res.data
    rows.value = data.records || []
    total.value = data.total || 0
  } finally {
    loading.value = false
  }
}

async function loadCategoryTree() {
  const res = await request.get('/api/front/category/tree')
  categoryTree.value = res.data.data || []
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

function statusText(status: number): string {
  return status === 0 ? '待审核' : status === 1 ? '已通过' : '已驳回'
}

function statusTagType(status: number): 'warning' | 'success' | 'danger' {
  return status === 0 ? 'warning' : status === 1 ? 'success' : 'danger'
}

function openApprove(row: WebsiteSubmission) {
  currentId.value = row.id
  form.siteName = row.siteName
  form.siteUrl = row.siteUrl
  form.siteIcon = row.siteIcon || ''
  form.siteDesc = row.siteDesc || ''
  form.categoryId = row.categoryId ?? undefined
  dialogVisible.value = true
}

async function submitApprove() {
  if (!form.siteName.trim() || !form.siteUrl.trim()) {
    ElMessage.warning('请填写网站名称和网址')
    return
  }
  try {
    await request.post(`/api/admin/submission/${currentId.value}/approve`, {
      siteName: form.siteName,
      siteUrl: form.siteUrl,
      siteIcon: form.siteIcon,
      siteDesc: form.siteDesc,
      sortOrder: 0,
      isPublic: 1,
      status: 1,
      categoryIds: form.categoryId ? [form.categoryId] : [],
    })
    ElMessage.success('已通过并发布')
    dialogVisible.value = false
    load()
  } catch (e: any) {
    ElMessage.error(e?.message || '操作失败')
  }
}

async function onReject(row: WebsiteSubmission) {
  let reason = ''
  try {
    const r = await ElMessageBox.prompt('请输入驳回原因', '驳回', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPlaceholder: '请填写驳回原因',
    })
    reason = r.value || ''
  } catch {
    return
  }
  if (!reason.trim()) {
    ElMessage.warning('请填写驳回原因')
    return
  }
  try {
    await request.post(`/api/admin/submission/${row.id}/reject`, { rejectReason: reason.trim() })
    ElMessage.success('已驳回')
    load()
  } catch (e: any) {
    ElMessage.error(e?.message || '操作失败')
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

.muted {
  color: #c0c4cc;
  font-size: 13px;
}
</style>

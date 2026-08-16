<template>
  <el-container class="admin-layout">
    <el-aside width="220px" class="admin-aside">
      <div class="admin-brand">
        <ShieldCheck :size="22" />
        <span class="admin-brand-text">SitePocket 后台</span>
      </div>
      <el-menu
        class="admin-menu"
        :default-active="route.path"
        router
        background-color="#001529"
        text-color="#a3adbd"
        active-text-color="#409eff"
      >
        <el-menu-item index="/admin/dashboard">
          <LayoutDashboard :size="18" />
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/admin/category">
          <FolderTree :size="18" />
          <span>分类管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/website">
          <Globe :size="18" />
          <span>网站管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/submission">
          <ClipboardCheck :size="18" />
          <span>网站审核</span>
        </el-menu-item>
        <el-menu-item index="/admin/user">
          <Users :size="18" />
          <span>用户管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="admin-header">
        <div class="header-title">SitePocket 管理后台</div>
        <el-dropdown @command="onCommand">
          <span class="admin-user">
            <UserRound :size="18" />
            <span>{{ adminStore.realName || '管理员' }}</span>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout">
                <LogOut :size="14" />
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-header>

      <el-main class="admin-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import { ShieldCheck, LayoutDashboard, FolderTree, Globe, ClipboardCheck, UserRound, LogOut, Users } from '@lucide/vue'

const route = useRoute()
const router = useRouter()
const adminStore = useAdminStore()

function onCommand(command: string) {
  if (command === 'logout') {
    adminStore.logout()
    router.push('/login')
  }
}
</script>

<style scoped>
.admin-layout {
  height: 100vh;
}

.admin-aside {
  background: #001529;
  display: flex;
  flex-direction: column;
}

.admin-brand {
  height: 56px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 20px;
  color: #fff;
}

.admin-brand-text {
  font-size: 15px;
  font-weight: 600;
}

.admin-menu {
  border-right: none;
  flex: 1;
}

.admin-menu :deep(.el-menu-item) {
  display: flex;
  align-items: center;
  gap: 10px;
}

.admin-header {
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.admin-user {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  color: #303133;
  outline: none;
}

.admin-main {
  background: #f0f2f5;
}
</style>

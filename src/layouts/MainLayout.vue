<template>
  <div class="layout-wrapper" :class="{ 'sidebar-collapsed': !sidebarExpanded }">
    <!-- 侧边栏 — 品牌在侧栏顶部 -->
    <Sidebar v-model="sidebarExpanded" />

    <!-- 右侧主体 -->
    <div class="layout-main">
      <!-- 顶部：滚动到顶部时透明 -->
      <header class="layout-header" :class="{ transparent: isAtTop }">
        <div class="header-inner">
          <!-- 左侧留空，品牌已在侧边栏 -->
          <div class="header-left"></div>

          <!-- 右侧：只有头像图标 -->
          <div class="header-right">
            <span class="avatar-btn" @click.stop="showMenu = !showMenu">
              <UserRound :size="22" />
            </span>
            <div v-if="showMenu" class="user-dropdown" @click.stop>
              <template v-if="!user">
                <div class="dropdown-item" @click="openAuthModal('login')">
                  登录
                </div>
                <div class="dropdown-item" @click="openAuthModal('register')">
                  注册
                </div>
              </template>
              <template v-else>
                <router-link to="/profile" class="dropdown-item" @click="showMenu = false">
                  个人中心
                </router-link>
                <div class="dropdown-item" @click="handleLogout">
                  退出登录
                </div>
              </template>
            </div>
          </div>
        </div>
      </header>

      <!-- 内容区 -->
      <main class="layout-content">
        <router-view />
      </main>
    </div>

    <!-- 登录/注册弹窗 -->
    <AuthModal
      v-model:visible="showAuthModal"
      :mode="authModalMode"
      @login-success="onLoginSuccess"
      @register-success="onRegisterSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { UserRound } from '@lucide/vue'
import AuthModal from '@/components/AuthModal.vue'
import Sidebar from '@/components/Sidebar.vue'

const authStore = useAuthStore()
const user = computed(() => authStore.fetchUserInfo())
const showMenu = ref(false)
const showAuthModal = ref(false)
const authModalMode = ref<'login' | 'register'>('login')
const sidebarExpanded = ref(true)
const isAtTop = ref(true)

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', onScroll)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', onScroll)
})

function onScroll() {
  isAtTop.value = window.scrollY < 10
}

function handleClickOutside() {
  showMenu.value = false
}

function openAuthModal(mode: 'login' | 'register') {
  showMenu.value = false
  authModalMode.value = mode
  showAuthModal.value = true
}

function onLoginSuccess() {
  // user 是 computed，自动更新，无需手动设置
}

function onRegisterSuccess() {
  // nothing special
}

function handleLogout() {
  authStore.logout()
  showMenu.value = false
}

</script>

<style scoped>
/* ============================
   整体布局：侧边栏 + 右侧主体
   ============================ */
.layout-wrapper {
  min-height: 100vh;
  background: #f0f2f5;
}

.layout-main {
  margin-left: 220px;
  transition: margin-left 0.25s ease;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.sidebar-collapsed .layout-main {
  margin-left: 60px;
}

/* ---------- 顶部导航 — 极简 ---------- */
.layout-header {
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  position: sticky;
  top: 0;
  z-index: 100;
  transition: background 0.3s, box-shadow 0.3s;
}
.layout-header.transparent {
  background: transparent;
  box-shadow: none;
}

.header-inner {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 24px;
}

.header-left {
  flex: 1;
}

/* ---------- 右侧头像 ---------- */
.header-right {
  position: relative;
  display: flex;
  align-items: center;
}

.avatar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  color: #606266;
  background: #f5f7fa;
  transition: all 0.2s;
}

.avatar-btn:hover {
  background: #ecf5ff;
  color: #409EFF;
}

/* ---------- 下拉菜单 ---------- */
.user-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.12);
  min-width: 110px;
  z-index: 100;
  overflow: hidden;
}

.dropdown-item {
  display: block;
  padding: 10px 16px;
  cursor: pointer;
  font-size: 13px;
  color: #333;
  text-decoration: none;
  transition: all 0.15s;
}

.dropdown-item:hover {
  background: #f5f7fa;
  color: #409EFF;
}

/* ---------- 内容区 ---------- */
.layout-content {
  flex: 1;
  padding: 0 24px 24px;
}
</style>

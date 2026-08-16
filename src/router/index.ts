import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('@/layouts/MainLayout.vue'),
      redirect: '/home',
      children: [
        {
          path: 'home',
          name: 'home',
          component: () => import('@/views/Home.vue'),
        },
        {
          path: 'game',
          name: 'game',
          component: () => import('@/views/GameNav.vue'),
        },
        {
          path: 'acg',
          name: 'acg',
          component: () => import('@/views/AcgNav.vue'),
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/views/Profile.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'user',
          name: 'user',
          component: () => import('@/views/User.vue'),
          meta: { requiresAuth: true },
        },
      ],
    },
    {
      path: '/admin',
      component: () => import('@/layouts/AdminLayout.vue'),
      redirect: '/admin/dashboard',
      meta: { requiresAdmin: true },
      children: [
        {
          path: 'dashboard',
          name: 'admin-dashboard',
          component: () => import('@/views/admin/Dashboard.vue'),
        },
        {
          path: 'category',
          name: 'admin-category',
          component: () => import('@/views/admin/CategoryManage.vue'),
        },
        {
          path: 'website',
          name: 'admin-website',
          component: () => import('@/views/admin/WebsiteManage.vue'),
        },
        {
          path: 'submission',
          name: 'admin-submission',
          component: () => import('@/views/admin/SubmissionManage.vue'),
        },
        {
          path: 'user',
          name: 'admin-user',
          component: () => import('@/views/admin/UserManage.vue'),
        },
      ],
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login.vue'),
    },
  ],
})

// 路由守卫
router.beforeEach((to) => {
  const token = localStorage.getItem('token')
  const adminToken = localStorage.getItem('admin_token')

  // 后台受保护页面 → 未登录跳后台登录页
  if (to.meta.requiresAdmin && !adminToken) {
    return { path: '/login' }
  }
  // 前台受保护页面（/profile, /user）→ 未登录跳首页并触发登录弹窗
  if (to.meta.requiresAuth && !token) {
    return { path: '/home', query: { login: '1' } }
  }
  // 已登录管理员访问后台登录页 → 直接进后台首页
  if (to.path === '/login' && adminToken) {
    return { path: '/admin' }
  }
})

export default router

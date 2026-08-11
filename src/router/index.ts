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
      path: '/register',
      name: 'register',
      component: () => import('@/views/Register.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login.vue'),
    },
  ],
})

// 路由守卫
router.beforeEach((to, _from) => {
  const token = localStorage.getItem('token')
  // 未登录访问受保护页面 → 跳转登录
  if (to.meta.requiresAuth && !token) {
    return { path: '/login', query: { redirect: to.fullPath } }
  // 已登录访问登录/注册页 → 跳转首页
  } else if (token && (to.path === '/login' || to.path === '/register')) {
    return '/home'
  }
})

export default router

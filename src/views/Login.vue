<template>
  <div class="admin-login">
    <!-- 左侧品牌区 -->
    <div class="login-aside">
      <div class="aside-content">
        <div class="brand">
          <div class="brand-logo">
            <ShieldCheck :size="30" />
          </div>
          <div class="brand-text">
            <h1 class="brand-name">SitePocket</h1>
            <p class="brand-sub">后台管理系统</p>
          </div>
        </div>

        <h2 class="aside-slogan">网址导航<br />内容与用户管理平台</h2>
        <p class="aside-desc">管理分类、网站收录、用户与收藏数据，集中运营你的导航站点。</p>

        <div class="aside-features">
          <div class="feature">
            <Database :size="18" />
            <span>网站与分类管理</span>
          </div>
          <div class="feature">
            <Users :size="18" />
            <span>用户与权限控制</span>
          </div>
          <div class="feature">
            <BarChart3 :size="18" />
            <span>访问数据统计</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧登录表单 -->
    <div class="login-main">
      <div class="login-card">
        <h3 class="card-title">管理员登录</h3>
        <p class="card-sub">请使用管理员账号登录后台</p>

        <form class="login-form" @submit.prevent="handleLogin">
          <div class="form-item">
            <label for="username">账号</label>
            <div class="input-wrap">
              <User :size="18" class="input-icon" />
              <input
                v-model="loginForm.username"
                type="text"
                id="username"
                placeholder="请输入管理员账号"
                autocomplete="username"
              />
            </div>
          </div>

          <div class="form-item">
            <label for="password">密码</label>
            <div class="input-wrap">
              <Lock :size="18" class="input-icon" />
              <input
                v-model="loginForm.password"
                type="password"
                id="password"
                placeholder="请输入密码"
                autocomplete="current-password"
              />
            </div>
          </div>

          <button type="submit" :disabled="loading" class="btn-login">
            <span v-if="loading" class="spinner"></span>
            {{ loading ? '登录中...' : '登 录' }}
          </button>

          <transition name="fade">
            <p v-if="msg" :class="['message', msgType]">{{ msg }}</p>
          </transition>
        </form>

        <div class="card-footer">
          <span class="dot"></span>
          仅限授权管理员访问
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/utils/request'
import { ShieldCheck, User, Lock, Database, Users, BarChart3 } from '@lucide/vue'

const router = useRouter()
const loading = ref(false)
const msg = ref('')
const msgType = ref<'success' | 'error'>('success')

const loginForm = reactive({ username: '', password: '' })

async function handleLogin() {
  if (!loginForm.username.trim() || !loginForm.password) {
    msg.value = '请输入账号和密码'
    msgType.value = 'error'
    return
  }
  loading.value = true
  msg.value = ''
  try {
    // 后台登录：只查 sys_user_info，签 JWT（userType=admin）
    const res = await request.post('/api/admin/auth/login', {
      username: loginForm.username.trim(),
      password: loginForm.password,
    })
    const payload = res.data.data || res.data
    const token = payload.token || ''
    if (!token) {
      msg.value = '登录失败：未获取到 token'
      msgType.value = 'error'
      return
    }
    // 存入后台独立登录态，进入站内后台管理界面
    localStorage.setItem('admin_token', token)
    localStorage.setItem('admin_real_name', payload.realName || loginForm.username.trim())
    msg.value = '登录成功，正在跳转...'
    msgType.value = 'success'
    router.push('/admin')
  } catch (e: any) {
    msg.value = e.message || '登录失败，请检查账号或密码'
    msgType.value = 'error'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.admin-login {
  display: flex;
  min-height: 100vh;
  background: #f5f7fa;
}

/* ==================== 左侧品牌区 ==================== */
.login-aside {
  flex: 0 0 44%;
  background: linear-gradient(160deg, #1e293b 0%, #0f172a 60%, #111827 100%);
  color: #fff;
  display: flex;
  align-items: center;
  padding: 0 64px;
  position: relative;
  overflow: hidden;
}
/* 装饰光斑 */
.login-aside::before {
  content: '';
  position: absolute;
  width: 360px; height: 360px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(59,130,246,0.25), transparent 70%);
  top: -80px; right: -80px;
}
.login-aside::after {
  content: '';
  position: absolute;
  width: 280px; height: 280px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(99,102,241,0.2), transparent 70%);
  bottom: -60px; left: -40px;
}
.aside-content { position: relative; z-index: 1; }

.brand { display: flex; align-items: center; gap: 14px; margin-bottom: 56px; }
.brand-logo {
  width: 52px; height: 52px; border-radius: 12px;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  display: flex; align-items: center; justify-content: center;
}
.brand-name { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px; }
.brand-sub { margin: 2px 0 0; font-size: 13px; color: #94a3b8; }

.aside-slogan {
  font-size: 30px; font-weight: 700; line-height: 1.4; margin: 0 0 16px;
}
.aside-desc { font-size: 14px; color: #94a3b8; line-height: 1.7; margin: 0 0 40px; max-width: 320px; }

.aside-features { display: flex; flex-direction: column; gap: 16px; }
.feature {
  display: flex; align-items: center; gap: 10px;
  font-size: 14px; color: #cbd5e1;
}
.feature :first-child { color: #60a5fa; }

/* ==================== 右侧表单区 ==================== */
.login-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.login-card {
  width: 100%;
  max-width: 380px;
  background: #fff;
  border-radius: 14px;
  padding: 40px 36px;
  box-shadow: 0 8px 30px rgba(15, 23, 42, 0.08);
}
.card-title { margin: 0; font-size: 24px; font-weight: 700; color: #0f172a; }
.card-sub { margin: 8px 0 28px; font-size: 13px; color: #94a3b8; }

.login-form { display: flex; flex-direction: column; gap: 18px; }

.form-item { display: flex; flex-direction: column; gap: 6px; }
.form-item label { font-size: 13px; font-weight: 600; color: #334155; }
.input-wrap {
  position: relative;
  display: flex; align-items: center;
}
.input-icon {
  position: absolute; left: 12px; color: #94a3b8; pointer-events: none;
}
.input-wrap input {
  width: 100%; height: 44px;
  padding: 0 16px 0 40px;
  border: 1px solid #e2e8f0; border-radius: 8px;
  font-size: 14px; color: #0f172a; outline: none;
  transition: border-color 0.2s, box-shadow 0.2s; box-sizing: border-box;
}
.input-wrap input::placeholder { color: #cbd5e1; }
.input-wrap input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

.btn-login {
  height: 46px; margin-top: 6px;
  border: none; border-radius: 8px;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: #fff; font-size: 15px; font-weight: 600; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: opacity 0.2s, transform 0.15s;
}
.btn-login:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); }
.btn-login:disabled { opacity: 0.6; cursor: not-allowed; }

.spinner {
  width: 18px; height: 18px;
  border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
  border-radius: 50%; animation: spin 0.6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.message {
  margin: 0; padding: 10px 14px; border-radius: 8px;
  font-size: 13px; text-align: center;
}
.message.success { background: #ecfdf5; color: #059669; }
.message.error { background: #fef2f2; color: #dc2626; }

.card-footer {
  margin-top: 28px; padding-top: 20px;
  border-top: 1px solid #f1f5f9;
  display: flex; align-items: center; justify-content: center; gap: 6px;
  font-size: 12px; color: #94a3b8;
}
.dot { width: 6px; height: 6px; border-radius: 50%; background: #10b981; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ==================== 响应式 ==================== */
@media (max-width: 860px) {
  .login-aside { display: none; }
  .login-main { padding: 16px; }
}
</style>

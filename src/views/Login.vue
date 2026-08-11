<template>
  <div class="login-page">
    <div class="login-card">
      <h1>登录</h1>

      <form class="login-form" @keyup.enter="handleLogin">
        <div class="form-item">
          <label for="username">用户名</label>
          <input
            v-model="loginForm.username"
            type="text"
            id="username"
            placeholder="请输入用户名"
            autocomplete="username"
          />
        </div>

        <div class="form-item">
          <label for="password">密码</label>
          <input
            v-model="loginForm.password"
            type="password"
            id="password"
            placeholder="请输入密码"
            autocomplete="current-password"
          />
        </div>

        <button type="button" :disabled="loading" class="btn-login" @click="handleLogin">
          <span v-if="loading" class="spinner"></span>
          {{ loading ? '登录中...' : '登 录' }}
        </button>

        <div class="footer">
          没有账号？ <a href="#" @click.prevent="goToRegister">注册</a>
        </div>
      </form>

      <!-- 消息提示 -->
      <transition name="fade">
        <p v-if="msg" :class="['message', msgType]">{{ msg }}</p>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const msg = ref('')
const msgType = ref<'success' | 'error'>('success')

const loginForm = reactive({ username: '', password: '' })

async function handleLogin() {
  loading.value = true
  msg.value = ''
  try {
    await authStore.login(loginForm.username, loginForm.password)
    msg.value = '登录成功，正在跳转...'
    msgType.value = 'success'
    // 根据角色跳转：admin → Vben Admin 管理后台，user/vip → 前台首页
    if (authStore.role === 'admin') {
      const url = `http://localhost:5777/login?token=${encodeURIComponent(authStore.token)}`
      window.location.href = url
    } else {
      router.push('/home')
    }
  } catch (e: any) {
    msg.value = e.message || '登录失败，请检查用户名或密码'
    msgType.value = 'error'
  } finally {
    loading.value = false
  }
}

function goToRegister() {
  router.push('/register')
}
</script>

<style scoped>
/* ==================== 页面背景 ==================== */
.login-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 0;
}

/* ==================== 登录卡片 ==================== */
.login-card {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #0f0303;
  padding: 32px 24px;
  box-shadow: 8px 8px 0px #000000;
  position: relative;
}

h1 {
  font-size: 28px;
  font-weight: 700;
  color: #000000;
  margin-bottom: 20px;
  text-align: center;
}

/* ==================== 表单 ==================== */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-item label {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.form-item input {
  width: 100%;
  height: 44px;
  padding: 0 16px;
  border: 1.5px solid #000000;
  font-size: 15px;
  color: #333;
  outline: none;
  transition: border-color 0.25s, box-shadow 0.25s;
  box-sizing: border-box;
}

.form-item input::placeholder {
  color: #bbb;
}

.form-item input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.12);
}

/* ==================== 登录按钮 ==================== */
.btn-login {
  height: 46px;
  margin-top: 4px;
  border: none;
  background: #ef5c5c;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: opacity 0.25s, transform 0.15s;
}

.btn-login:hover:not(:disabled) {
  opacity: 0.92;
  transform: translateY(-1px);
}

.btn-login:active:not(:disabled) {
  transform: translateY(0);
}

.btn-login:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

/* ==================== 加载动画 ==================== */
.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ==================== 消息提示 ==================== */
.message {
  margin-top: 12px;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 13px;
  text-align: center;
}

.message.success {
  background: #e6f9ed;
  color: #1a8a4a;
}

.message.error {
  background: #fdecea;
  color: #d32f2f;
}

/* ==================== 过渡动画 ==================== */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.footer {
  text-align: center;
  margin-top: 16px;
  color: #0f0303;
}

.footer a {
  color: #0f0303;
  font-weight: bold;
  text-decoration: underline;
}
</style>

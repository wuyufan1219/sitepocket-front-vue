<template>
  <div class="register-page">
    <div class="register-card">
      <h1>注册</h1>

      <form class="register-form" @keyup.enter="handleRegister">
        <div class="form-item" :class="{ 'has-error': regErrors.username }">
          <label for="reg-username">用户名</label>
          <input
            v-model="registerForm.username"
            type="text"
            id="reg-username"
            placeholder="请输入用户名（至少3位）"
            autocomplete="username"
            @input="regErrors.username = ''"
          />
          <span v-if="regErrors.username" class="field-error">{{ regErrors.username }}</span>
        </div>

        <div class="form-item">
          <label for="reg-nickname">昵称</label>
          <input
            v-model="registerForm.name"
            type="text"
            id="reg-nickname"
            placeholder="请输入昵称（选填）"
          />
        </div>

        <div class="form-item" :class="{ 'has-error': regErrors.password }">
          <label for="reg-password">密码</label>
          <div class="input-wrap">
            <input
              v-model="registerForm.password"
              :type="showRegPwd ? 'text' : 'password'"
              id="reg-password"
              placeholder="请输入密码（至少6位）"
              autocomplete="new-password"
              @input="regErrors.password = ''"
            />
            <span class="toggle-pwd" @click="showRegPwd = !showRegPwd">
              {{ showRegPwd ? '🙈' : '👁' }}
            </span>
          </div>
          <span v-if="regErrors.password" class="field-error">{{ regErrors.password }}</span>
        </div>

        <div class="form-item" :class="{ 'has-error': regErrors.confirm }">
          <label for="reg-confirm">确认密码</label>
          <div class="input-wrap">
            <input
              v-model="registerForm.confirmPassword"
              :type="showRegPwd ? 'text' : 'password'"
              id="reg-confirm"
              placeholder="请再次输入密码"
              autocomplete="new-password"
              @input="regErrors.confirm = ''"
            />
          </div>
          <span v-if="regErrors.confirm" class="field-error">{{ regErrors.confirm }}</span>
        </div>

        <button type="button" :disabled="loading" class="btn-register" @click="handleRegister">
          <span v-if="loading" class="spinner"></span>
          {{ loading ? '注册中...' : '注 册' }}
        </button>

        <div class="footer">
          已有账号？ <a href="#" @click.prevent="goToLogin">登录</a>
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
const showRegPwd = ref(false)

const registerForm = reactive({ username: '', name: '', password: '', confirmPassword: '' })
const regErrors = reactive({ username: '', password: '', confirm: '' })

async function handleRegister() {
  // 清空之前的错误
  regErrors.username = ''
  regErrors.password = ''
  regErrors.confirm = ''
  msg.value = ''

  // 前端校验
  let hasError = false
  if (!registerForm.username || registerForm.username.trim().length < 3) {
    regErrors.username = '用户名至少需要3个字符'
    hasError = true
  }
  if (!registerForm.password || registerForm.password.length < 6) {
    regErrors.password = '密码至少需要6位'
    hasError = true
  }
  if (registerForm.password !== registerForm.confirmPassword) {
    regErrors.confirm = '两次输入的密码不一致'
    hasError = true
  }
  if (hasError) return

  loading.value = true
  try {
    await authStore.register(
      registerForm.username,
      registerForm.password,
      registerForm.name || undefined,
    )
    msg.value = '注册成功，即将跳转到登录页...'
    msgType.value = 'success'
    setTimeout(() => {
      router.push('/login')
    }, 1200)
  } catch (e: any) {
    msg.value = e.message || '注册失败，请稍后重试'
    msgType.value = 'error'
  } finally {
    loading.value = false
  }
}

function goToLogin() {
  router.push('/login')
}
</script>

<style scoped>
/* ==================== 页面背景 ==================== */
.register-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 0;
}

/* ==================== 注册卡片 ==================== */
.register-card {
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
.register-form {
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

/* ==================== 输入框包装（密码可见切换） ==================== */
.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrap input {
  padding-right: 40px;
}

.toggle-pwd {
  position: absolute;
  right: 12px;
  cursor: pointer;
  font-size: 16px;
  user-select: none;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.toggle-pwd:hover {
  opacity: 1;
}

/* ==================== 字段级错误 ==================== */
.has-error input {
  border-color: #ef5c5c;
}

.has-error input:focus {
  box-shadow: 0 0 0 3px rgba(239, 92, 92, 0.12);
}

.field-error {
  font-size: 12px;
  color: #ef5c5c;
  margin-top: 2px;
}

/* ==================== 注册按钮 ==================== */
.btn-register {
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

.btn-register:hover:not(:disabled) {
  opacity: 0.92;
  transform: translateY(-1px);
}

.btn-register:active:not(:disabled) {
  transform: translateY(0);
}

.btn-register:disabled {
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

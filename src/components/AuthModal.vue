<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="close">
        <div class="modal-card">
          <!-- 关闭按钮 -->
          <span class="modal-close" @click.stop="close">✕</span>

          <h1>{{ isRegister ? '注册' : '登录' }}</h1>

          <!-- ========== 登录表单 ========== -->
          <form v-if="!isRegister" class="auth-form" @keyup.enter="handleLogin">
            <div class="form-item">
              <label for="login-username">用户名</label>
              <input
                v-model="loginForm.username"
                type="text"
                id="login-username"
                placeholder="请输入用户名"
                autocomplete="username"
              />
            </div>

            <div class="form-item">
              <label for="login-password">密码</label>
              <input
                v-model="loginForm.password"
                type="password"
                id="login-password"
                placeholder="请输入密码"
                autocomplete="current-password"
              />
            </div>

            <button type="button" :disabled="loading" class="btn-submit" @click="handleLogin">
              <span v-if="loading" class="spinner"></span>
              {{ loading ? '登录中...' : '登 录' }}
            </button>

            <div class="footer">
              没有账号？
              <a href="#" @click.prevent="switchToRegister">注册</a>
            </div>
          </form>

          <!-- ========== 注册表单 ========== -->
          <form v-else class="auth-form" @keyup.enter="handleRegister">
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

            <button type="button" :disabled="loading" class="btn-submit" @click="handleRegister">
              <span v-if="loading" class="spinner"></span>
              {{ loading ? '注册中...' : '注 册' }}
            </button>

            <div class="footer">
              已有账号？
              <a href="#" @click.prevent="switchToLogin">登录</a>
            </div>
          </form>

          <!-- 消息提示 -->
          <transition name="fade">
            <p v-if="msg" :class="['message', msgType]">{{ msg }}</p>
          </transition>
        </div>
      </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{
  visible: boolean
  mode?: 'login' | 'register'
}>()

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'login-success'): void
  (e: 'register-success'): void
}>()

const authStore = useAuthStore()

const loading = ref(false)
const msg = ref('')
const msgType = ref<'success' | 'error'>('success')
const isRegister = ref(false)
const showRegPwd = ref(false)

const loginForm = reactive({ username: '', password: '' })
const registerForm = reactive({ username: '', name: '', password: '', confirmPassword: '' })
const regErrors = reactive({ username: '', password: '', confirm: '' })

// 打开弹窗时根据 mode 切换登录/注册
watch(() => props.visible, (val) => {
  if (val) {
    isRegister.value = props.mode === 'register'
    resetForms()
  }
})

function close() {
  emit('update:visible', false)
}

function resetForms() {
  msg.value = ''
  loading.value = false
  showRegPwd.value = false
  loginForm.username = ''
  loginForm.password = ''
  registerForm.username = ''
  registerForm.name = ''
  registerForm.password = ''
  registerForm.confirmPassword = ''
  regErrors.username = ''
  regErrors.password = ''
  regErrors.confirm = ''
}

function switchToRegister() {
  isRegister.value = true
  msg.value = ''
}
function switchToLogin() {
  isRegister.value = false
  msg.value = ''
  showRegPwd.value = false
  regErrors.username = ''
  regErrors.password = ''
  regErrors.confirm = ''
}

// ==================== 登录 ====================
async function handleLogin() {
  loading.value = true
  msg.value = ''
  let ok = false
  try {
    await authStore.login(loginForm.username, loginForm.password)
    msg.value = '登录成功'
    msgType.value = 'success'
    emit('login-success')
    ok = true
  } catch (e: any) {
    msg.value = e.message || '登录失败，请检查用户名或密码'
    msgType.value = 'error'
  } finally {
    loading.value = false
    if (ok) {
      setTimeout(() => close(), 600)
    }
  }

}

// ==================== 注册 ====================
async function handleRegister() {
  regErrors.username = ''
  regErrors.password = ''
  regErrors.confirm = ''
  msg.value = ''

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
    msg.value = '注册成功，请登录'
    msgType.value = 'success'
    emit('register-success')
    // 自动切到登录并填充用户名密码
    loginForm.username = registerForm.username
    loginForm.password = registerForm.password
    setTimeout(() => switchToLogin(), 1000)
  } catch (e: any) {
    msg.value = e.message || '注册失败，请稍后重试'
    msgType.value = 'error'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* ==================== 遮罩层 ==================== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 16px;
}

/* ==================== 弹窗卡片 ==================== */
.modal-card {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #0f0303;
  padding: 40px 28px 28px;
  box-shadow: 8px 8px 0px #000000;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 16px;
  font-size: 20px;
  color: #999;
  cursor: pointer;
  line-height: 1;
}
.modal-close:hover {
  color: #333;
}

h1 {
  font-size: 24px;
  font-weight: 700;
  color: #000;
  margin: 0 0 20px;
  text-align: center;
}

/* ==================== 表单 ==================== */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.form-item label {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}
.form-item input {
  width: 100%;
  height: 42px;
  padding: 0 14px;
  border: 1.5px solid #000;
  font-size: 14px;
  color: #333;
  outline: none;
  box-sizing: border-box;
}
.form-item input::placeholder { color: #bbb; }
.form-item input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.12);
}

/* 密码可见切换 */
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
}
.toggle-pwd:hover { opacity: 1; }

/* 字段错误 */
.has-error input { border-color: #ef5c5c; }
.has-error input:focus {
  box-shadow: 0 0 0 3px rgba(239, 92, 92, 0.12);
}
.field-error {
  font-size: 12px;
  color: #ef5c5c;
  margin-top: 2px;
}

/* 按钮 */
.btn-submit {
  height: 44px;
  margin-top: 2px;
  border: none;
  background: #ef5c5c;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: opacity 0.2s;
}
.btn-submit:hover:not(:disabled) { opacity: 0.92; }
.btn-submit:disabled { opacity: 0.65; cursor: not-allowed; }

/* 加载动画 */
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* 消息 */
.message {
  margin-top: 14px;
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 13px;
  text-align: center;
}
.message.success { background: #e6f9ed; color: #1a8a4a; }
.message.error   { background: #fdecea; color: #d32f2f; }

/* 底部链接 */
.footer {
  text-align: center;
  margin-top: 12px;
  color: #0f0303;
  font-size: 13px;
}
.footer a {
  color: #0f0303;
  font-weight: bold;
  text-decoration: underline;
}

/* 过渡 */
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.modal-fade-enter-active { transition: opacity 0.25s ease; }
.modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from,
.modal-fade-leave-to { opacity: 0; }
</style>

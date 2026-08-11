<template>
  <div class="profile-page">
    <!-- ==================== 顶部封面卡片 ==================== -->
    <div class="cover-card">
      <div class="cover-bg"></div>
      <div class="cover-body">
        <div class="avatar-wrap">
          <div class="avatar">
            <UserRound :size="42" />
          </div>
          <span class="online-dot"></span>
        </div>
        <div class="user-meta">
          <h2 class="user-name">{{ nickname || username }}</h2>
          <p class="user-id">@{{ username }} · ID: {{ userId || '-' }}</p>
        </div>
        <div class="cover-stats">
          <div class="cstat">
            <span class="cstat-num">{{ bookmarkCount }}</span>
            <span class="cstat-label">收藏</span>
          </div>
          <div class="cstat">
            <span class="cstat-num">{{ browseCount }}</span>
            <span class="cstat-label">浏览</span>
          </div>
          <div class="cstat">
            <span class="cstat-num">{{ loginDays }}</span>
            <span class="cstat-label">天</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 卡片区 ==================== -->
    <div class="cards-row">
      <!-- 基本信息卡片 -->
      <div class="info-card">
        <div class="card-header">
          <UserCog :size="18" />
          <span>基本信息</span>
        </div>

        <template v-if="!editingNick">
          <div class="info-item">
            <span class="info-label">昵称</span>
            <span class="info-value">{{ nickname || '-' }}</span>
            <button class="btn-icon" @click="editingNick = true"><Pencil :size="15" /></button>
          </div>
        </template>
        <template v-else>
          <div class="inline-edit">
            <input
              v-model="newNickname"
              placeholder="输入新昵称"
              maxlength="20"
              ref="nickInput"
              @keyup.enter="saveNickname"
            />
            <div class="inline-actions">
              <button class="btn-sm btn-save" @click="saveNickname" :disabled="nickLoading">
                {{ nickLoading ? '...' : '保存' }}
              </button>
              <button class="btn-sm btn-cancel" @click="editingNick = false; nickMsg = ''">取消</button>
            </div>
            <p v-if="nickMsg" class="msg warn">{{ nickMsg }}</p>
          </div>
        </template>

        <div class="info-item">
          <span class="info-label">账号</span>
          <span class="info-value">{{ username }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">角色</span>
          <span class="info-value">
            <span class="badge" :class="roleClass">{{ roleText }}</span>
          </span>
        </div>
        <div class="info-item">
          <span class="info-label">注册时间</span>
          <span class="info-value">{{ createTime || '-' }}</span>
        </div>
      </div>

      <!-- 安全设置卡片 -->
      <div class="info-card">
        <div class="card-header">
          <ShieldCheck :size="18" />
          <span>安全设置</span>
        </div>

        <template v-if="!changingPwd">
          <div class="info-item">
            <span class="info-label">密码</span>
            <span class="info-value">********</span>
            <button class="btn-link" @click="changingPwd = true">修改</button>
          </div>
        </template>
        <template v-else>
          <div class="pwd-form">
            <input v-model="oldPassword" type="password" placeholder="旧密码" />
            <input v-model="newPassword" type="password" placeholder="新密码（至少6位）" />
            <input v-model="confirmPassword" type="password" placeholder="确认新密码" />
            <div class="inline-actions">
              <button class="btn-sm btn-save" @click="savePassword" :disabled="pwdLoading">
                {{ pwdLoading ? '...' : '确认修改' }}
              </button>
              <button class="btn-sm btn-cancel" @click="changingPwd = false; pwdMsg = ''; clearPwdFields()">取消</button>
            </div>
            <p v-if="pwdMsg" class="msg" :class="pwdMsg.includes('成功') ? 'success' : 'warn'">{{ pwdMsg }}</p>
          </div>
        </template>

        <div class="info-item">
          <span class="info-label">绑定邮箱</span>
          <span class="info-value muted">未设置</span>
        </div>
        <div class="info-item no-border">
          <span class="info-label">上次登录</span>
          <span class="info-value">{{ lastLogin || '-' }}</span>
        </div>
      </div>
    </div>

    <!-- 退出 -->
    <div class="logout-area">
      <button class="btn-logout" @click="handleLogout">
        <LogOut :size="16" /> 退出登录
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import request from '@/utils/request'
import { UserRound, Pencil, LogOut, UserCog, ShieldCheck } from '@lucide/vue'

const router = useRouter()
const authStore = useAuthStore()

const userId = ref<number | null>(null)
const username = ref('')
const nickname = ref('')
const createTime = ref('')
const lastLogin = ref('')
const bookmarkCount = ref(0)
const browseCount = ref(0)
const loginDays = ref(0)

const editingNick = ref(false)
const changingPwd = ref(false)
const newNickname = ref('')
const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const nickMsg = ref('')
const pwdMsg = ref('')
const nickLoading = ref(false)
const pwdLoading = ref(false)
const nickInput = ref<HTMLInputElement | null>(null)

const roleText = computed(() => authStore.role === 'admin' ? '管理员' : '普通用户')
const roleClass = computed(() => authStore.role === 'admin' ? 'admin' : '')

watch(editingNick, async (val) => {
  if (val) {
    await nextTick()
    newNickname.value = nickname.value
    nickInput.value?.focus()
  }
})

onMounted(async () => {
  try {
    const [infoRes, statsRes] = await Promise.allSettled([
      request.get('/api/front/user/info'),
      request.get('/api/front/user/stats'),
    ])

    if (infoRes.status === 'fulfilled') {
      const d = infoRes.value.data.data
      if (d) {
        userId.value = d.id
        username.value = d.username
        nickname.value = d.nickname || d.username
        createTime.value = d.createTime || ''
        lastLogin.value = d.lastLoginTime || ''
        localStorage.setItem('nickname', nickname.value)
      }
    }

    if (statsRes.status === 'fulfilled') {
      const s = statsRes.value.data.data
      bookmarkCount.value = s?.bookmarkCount ?? 0
      browseCount.value = s?.browseCount ?? 0
      loginDays.value = s?.loginDays ?? 0
    }
  } catch { /* 静默降级 */ }
})

async function saveNickname() {
  const val = newNickname.value.trim()
  if (!val) { nickMsg.value = '昵称不能为空'; return }
  nickLoading.value = true; nickMsg.value = ''
  try {
    await request.put('/api/front/user/nickname', { nickname: val })
    nickname.value = val
    localStorage.setItem('nickname', val)
    authStore.$patch({ nickname: val })
    editingNick.value = false
  } catch (e: any) { nickMsg.value = e?.message || '网络错误' }
  finally { nickLoading.value = false }
}

async function savePassword() {
  if (!oldPassword.value) { pwdMsg.value = '请输入旧密码'; return }
  if (newPassword.value.length < 6) { pwdMsg.value = '新密码至少6位'; return }
  if (newPassword.value !== confirmPassword.value) { pwdMsg.value = '两次密码不一致'; return }
  pwdLoading.value = true; pwdMsg.value = ''
  try {
    await request.put('/api/front/user/password', {
      oldPassword: oldPassword.value, newPassword: newPassword.value,
    })
    pwdMsg.value = '密码修改成功'
    setTimeout(() => { changingPwd.value = false; pwdMsg.value = '' }, 1000)
    clearPwdFields()
  } catch (e: any) { pwdMsg.value = e?.message || '网络错误' }
  finally { pwdLoading.value = false }
}

function clearPwdFields() {
  oldPassword.value = ''; newPassword.value = ''; confirmPassword.value = ''
}

function handleLogout() {
  authStore.logout()
  router.push('/home')
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  margin: -56px -24px 0;
  padding-bottom: 40px;
}

/* ==================== 封面卡片 ==================== */
.cover-card {
  background: #fff; overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}
.cover-bg {
  height: 100px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
}
.cover-body {
  display: flex; align-items: center; gap: 20px;
  padding: 0 32px 24px; position: relative;
}
.avatar-wrap {
  position: relative; margin-top: -36px; flex-shrink: 0;
}
.avatar {
  width: 88px; height: 88px; border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff; display: flex; align-items: center; justify-content: center;
  border: 4px solid #fff; box-shadow: 0 4px 12px rgba(102,126,234,0.35);
}
.online-dot {
  position: absolute; bottom: 8px; right: 8px;
  width: 14px; height: 14px; border-radius: 50%;
  background: #52c41a; border: 3px solid #fff;
}
.user-meta { flex: 1; padding-top: 8px; }
.user-name { font-size: 22px; font-weight: 700; color: #1a1a2e; margin: 0; }
.user-id { font-size: 13px; color: #909399; margin: 4px 0 0; }

.cover-stats { display: flex; gap: 28px; padding-top: 8px; }
.cstat { text-align: center; }
.cstat-num { display: block; font-size: 22px; font-weight: 700; color: #303133; }
.cstat-label { display: block; font-size: 12px; color: #909399; margin-top: 2px; }

/* ==================== 两栏卡片 ==================== */
.cards-row {
  display: grid; grid-template-columns: 1fr 1fr; gap: 20px;
  max-width: 900px; margin: 24px auto 0; padding: 0 24px;
}
.info-card {
  background: #fff; border-radius: 10px;
  border: 1px solid #ebeef5; overflow: hidden;
  box-shadow: 0 1px 6px rgba(0,0,0,0.04);
}
.card-header {
  display: flex; align-items: center; gap: 8px;
  padding: 16px 20px; border-bottom: 1px solid #f5f7fa;
  font-size: 14px; font-weight: 600; color: #303133;
}
.card-header :first-child { color: #409EFF; }

/* 信息行 */
.info-item {
  display: flex; align-items: center;
  padding: 14px 20px; border-bottom: 1px solid #f5f7fa;
  font-size: 14px;
}
.info-item.no-border { border-bottom: none; }
.info-label { color: #909399; width: 70px; flex-shrink: 0; }
.info-value { color: #303133; flex: 1; }
.info-value.muted { color: #c0c4cc; font-size: 13px; }
.btn-icon {
  border: none; background: none; color: #c0c4cc; cursor: pointer;
  padding: 4px; display: flex; align-items: center; transition: color 0.15s;
}
.btn-icon:hover { color: #409EFF; }
.btn-link {
  border: none; background: none; color: #409EFF; cursor: pointer;
  font-size: 13px; padding: 0;
}
.btn-link:hover { text-decoration: underline; }

/* 徽章 */
.badge {
  display: inline-block; padding: 2px 10px; border-radius: 10px;
  font-size: 12px; font-weight: 500;
  background: #f0f5ff; color: #409EFF;
}
.badge.admin { background: #fff7e6; color: #fa8c16; }

/* 内联编辑 */
.inline-edit { padding: 10px 20px; border-bottom: 1px solid #f5f7fa; }
.inline-edit input {
  width: 100%; padding: 8px 12px; border: 1px solid #dcdfe6;
  border-radius: 6px; font-size: 14px; outline: none; box-sizing: border-box;
  transition: border-color 0.2s;
}
.inline-edit input:focus { border-color: #409EFF; }

.pwd-form { padding: 10px 20px; border-bottom: 1px solid #f5f7fa; }
.pwd-form input {
  display: block; width: 100%; padding: 8px 12px; margin-bottom: 10px;
  border: 1px solid #dcdfe6; border-radius: 6px;
  font-size: 14px; outline: none; box-sizing: border-box;
  transition: border-color 0.2s;
}
.pwd-form input:focus { border-color: #409EFF; }

.inline-actions {
  display: flex; gap: 8px; margin-top: 4px;
}
.btn-sm {
  padding: 6px 16px; border-radius: 5px;
  font-size: 13px; font-weight: 500; cursor: pointer; border: none;
  transition: all 0.15s;
}
.btn-save { background: #409EFF; color: #fff; }
.btn-save:hover { background: #337ecc; }
.btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-cancel { background: #f5f7fa; color: #606266; }
.btn-cancel:hover { background: #e8eaed; }

/* 消息 */
.msg { font-size: 12px; margin: 6px 0 0; }
.msg.warn { color: #e6a23c; }
.msg.success { color: #52c41a; }

/* ==================== 退出 ==================== */
.logout-area {
  max-width: 900px; margin: 24px auto 0; padding: 0 24px;
}
.btn-logout {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  width: 100%; padding: 14px; border: 1.5px solid #ef5c5c;
  border-radius: 10px; background: #fff; color: #ef5c5c;
  font-size: 15px; font-weight: 600; cursor: pointer;
  transition: all 0.2s;
}
.btn-logout:hover { background: #ef5c5c; color: #fff; }

@media (max-width: 700px) {
  .cards-row { grid-template-columns: 1fr; }
  .cover-body { flex-direction: column; text-align: center; padding: 0 20px 20px; }
  .cover-stats { justify-content: center; }
  .avatar-wrap { margin-top: -40px; }
}
</style>

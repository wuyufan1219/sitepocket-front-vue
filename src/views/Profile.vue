<template>
  <div class="profile-wrapper">
    <div class="profile-card">
      <div class="profile-avatar">
        <UserRound :size="48" />
      </div>
      <h2>{{ username }}</h2>

      <!-- 用户信息展示 -->
      <div class="profile-info" v-if="!editingNick && !changingPwd">
        <div class="info-row">
          <span class="info-label">用户ID</span>
          <span class="info-value">{{ userId || '-' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">昵称</span>
          <span class="info-value">{{ nickname || '-' }}</span>
          <button class="btn-edit" @click="editingNick = true"><Pencil :size="14" /></button>
        </div>
      </div>

      <!-- 修改昵称 -->
      <div class="edit-form" v-if="editingNick">
        <label>新昵称</label>
        <input v-model="newNickname" placeholder="请输入新昵称" maxlength="20" />
        <p class="form-hint" v-if="nickMsg">{{ nickMsg }}</p>
        <div class="form-actions">
          <button class="btn-cancel" @click="editingNick = false; nickMsg = ''">取消</button>
          <button class="btn-save" @click="saveNickname" :disabled="nickLoading">
            {{ nickLoading ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>

      <!-- 修改密码 -->
      <div class="edit-form" v-if="changingPwd">
        <label>旧密码</label>
        <input v-model="oldPassword" type="password" placeholder="请输入旧密码" />
        <label>新密码</label>
        <input v-model="newPassword" type="password" placeholder="请输入新密码" minlength="6" />
        <label>确认新密码</label>
        <input v-model="confirmPassword" type="password" placeholder="请再次输入新密码" />
        <p class="form-hint" v-if="pwdMsg">{{ pwdMsg }}</p>
        <div class="form-actions">
          <button class="btn-cancel" @click="changingPwd = false; pwdMsg = ''; clearPwdFields()">取消</button>
          <button class="btn-save" @click="savePassword" :disabled="pwdLoading">
            {{ pwdLoading ? '保存中...' : '修改密码' }}
          </button>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="profile-actions" v-if="!editingNick && !changingPwd">
        <button class="btn-action" @click="editingNick = true">
          <Pencil :size="16" /> 修改昵称
        </button>
        <button class="btn-action" @click="changingPwd = true">
          <Lock :size="16" /> 修改密码
        </button>
        <button class="btn-logout" @click="handleLogout">退出登录</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { UserRound, Pencil, Lock } from '@lucide/vue'

const router = useRouter()
const authStore = useAuthStore()

const userId = ref<number | null>(null)
const username = ref('')
const nickname = ref('')

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

function getAuthHeader() {
  const token = localStorage.getItem('token') || ''
  return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
}

onMounted(async () => {
  try {
    const res = await fetch('/api/front/user/info', { headers: getAuthHeader() })
    const json = await res.json()
    if (json.code === '00000' && json.data) {
      userId.value = json.data.id
      username.value = json.data.username
      nickname.value = json.data.nickname || json.data.username
      localStorage.setItem('nickname', nickname.value)
    }
  } catch (e) { console.error(e) }
})

async function saveNickname() {
  const val = newNickname.value.trim()
  if (!val) { nickMsg.value = '昵称不能为空'; return }
  nickLoading.value = true; nickMsg.value = ''
  try {
    const res = await fetch('/api/front/user/nickname', {
      method: 'PUT', headers: getAuthHeader(),
      body: JSON.stringify({ nickname: val }),
    })
    const json = await res.json()
    if (json.code === '00000') {
      nickname.value = val
      localStorage.setItem('nickname', nickname.value)
      editingNick.value = false
      newNickname.value = ''
    } else {
      nickMsg.value = json.message || '修改失败'
    }
  } catch (e) { nickMsg.value = '网络错误' }
  finally { nickLoading.value = false }
}

async function savePassword() {
  if (!oldPassword.value) { pwdMsg.value = '请输入旧密码'; return }
  if (newPassword.value.length < 6) { pwdMsg.value = '新密码至少6位'; return }
  if (newPassword.value !== confirmPassword.value) { pwdMsg.value = '两次密码不一致'; return }
  pwdLoading.value = true; pwdMsg.value = ''
  try {
    const res = await fetch('/api/front/user/password', {
      method: 'PUT', headers: getAuthHeader(),
      body: JSON.stringify({ oldPassword: oldPassword.value, newPassword: newPassword.value }),
    })
    const json = await res.json()
    if (json.code === '00000') {
      pwdMsg.value = '密码修改成功'
      changingPwd.value = false
      clearPwdFields()
    } else {
      pwdMsg.value = json.message || '修改失败'
    }
  } catch (e) { pwdMsg.value = '网络错误' }
  finally { pwdLoading.value = false }
}

function clearPwdFields() {
  oldPassword.value = ''; newPassword.value = ''; confirmPassword.value = ''
}

function handleLogout() {
  authStore.logout()
  router.push('/game')
}
</script>

<style scoped>
.profile-wrapper {
  display: flex; justify-content: center;
  padding: 48px 24px;
}
.profile-card {
  width: 100%; max-width: 440px;
  background: #fff; border-radius: 12px;
  border: 1px solid #ebeef5;
  padding: 40px 36px; text-align: center;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}
.profile-avatar {
  width: 88px; height: 88px; border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff; display: flex; align-items: center;
  justify-content: center; margin: 0 auto 12px;
}
h2 { font-size: 22px; font-weight: 700; color: #303133; margin: 0 0 24px; }

/* 信息行 */
.profile-info { text-align: left; margin-bottom: 20px; }
.info-row {
  display: flex; align-items: center;
  padding: 12px 0; border-bottom: 1px solid #f5f7fa;
}
.info-row:last-child { border-bottom: none; }
.info-label { font-size: 14px; color: #909399; width: 60px; flex-shrink: 0; }
.info-value { font-size: 14px; color: #303133; font-weight: 500; flex: 1; }
.btn-edit {
  border: none; background: none; color: #409EFF;
  cursor: pointer; padding: 4px; display: flex; align-items: center;
}
.btn-edit:hover { color: #337ecc; }

/* 编辑表单 */
.edit-form {
  text-align: left; margin-bottom: 20px;
}
.edit-form label {
  display: block; font-size: 13px; color: #606266;
  margin-bottom: 6px; margin-top: 14px;
}
.edit-form input {
  width: 100%; padding: 10px 12px; border: 1px solid #dcdfe6;
  border-radius: 6px; font-size: 14px; outline: none;
  box-sizing: border-box; transition: border-color 0.2s;
}
.edit-form input:focus { border-color: #409EFF; }
.form-hint { font-size: 12px; color: #e6a23c; margin: 6px 0 0; }
.form-actions {
  display: flex; gap: 12px; margin-top: 20px;
}
.btn-cancel, .btn-save {
  flex: 1; padding: 10px; border-radius: 6px;
  font-size: 14px; font-weight: 600; cursor: pointer; border: none;
  transition: all 0.2s;
}
.btn-cancel { background: #f5f7fa; color: #606266; }
.btn-cancel:hover { background: #e8eaed; }
.btn-save { background: #409EFF; color: #fff; }
.btn-save:hover { background: #337ecc; }
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }

/* 操作按钮 */
.profile-actions {
  display: flex; flex-direction: column; gap: 10px;
}
.btn-action {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  width: 100%; padding: 12px; border: 1.5px solid #dcdfe6;
  border-radius: 8px; background: #fff; color: #303133;
  font-size: 15px; font-weight: 500; cursor: pointer;
  transition: all 0.2s;
}
.btn-action:hover { border-color: #409EFF; color: #409EFF; }
.btn-logout {
  width: 100%; padding: 12px; border: 1.5px solid #ef5c5c;
  border-radius: 8px; background: #fff; color: #ef5c5c;
  font-size: 15px; font-weight: 600; cursor: pointer; margin-top: 8px;
  transition: all 0.2s;
}
.btn-logout:hover { background: #ef5c5c; color: #fff; }
</style>

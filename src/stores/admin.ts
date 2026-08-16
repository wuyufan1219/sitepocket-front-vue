import { defineStore } from 'pinia'
import { ref } from 'vue'
import request from '@/utils/request'

/**
 * 后台管理登录态
 * 与前台 auth store 隔离：使用独立的 admin_token，避免前后台 token 互相覆盖。
 */
export const useAdminStore = defineStore('admin', () => {
    const token = ref<string>(localStorage.getItem('admin_token') || '')
    const realName = ref<string>(localStorage.getItem('admin_real_name') || '')

    async function login(username: string, password: string) {
        const res = await request.post('/api/admin/auth/login', { username, password })
        const payload = res.data.data || res.data
        token.value = payload.token || ''
        realName.value = payload.realName || username
        localStorage.setItem('admin_token', token.value)
        localStorage.setItem('admin_real_name', realName.value)
    }

    function logout() {
        token.value = ''
        realName.value = ''
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_real_name')
    }

    return { token, realName, login, logout }
})

import { defineStore } from 'pinia'
import { ref } from 'vue'
import request from '@/utils/request'

interface UserInfo {
    id?: number
    username?: string
    nickname?: string
    realName?: string
    role?: string
}

export const useAuthStore = defineStore('auth', () => {
    const token = ref<string>(localStorage.getItem('token') || '')
    const role = ref<string>(localStorage.getItem('role') || '')
    const nickname = ref<string>(localStorage.getItem('nickname') || '')

    async function login(username: string, password: string) {
        const res = await request.post('/api/front/user/login', { username, password })
        const payload = res.data.data || res.data
        token.value = payload.token || ''
        role.value = payload.role || 'user'
        nickname.value = payload.nickname || username
        localStorage.setItem('token', token.value)
        localStorage.setItem('role', role.value)
        localStorage.setItem('nickname', nickname.value)
    }

    /** 用户注册：对接后端 POST /api/front/user/register */
    async function register(username: string, password: string, name?: string) {
        const res = await request.post('/api/front/user/register', {
            username, password, ...(name ? { name } : {}),
        })
        return res.data
    }

    /** 获取当前用户信息（从登录时缓存的 nickName 读取），不请求后端 */
    function fetchUserInfo(): UserInfo | null {
        if (!token.value) return null
        return {
            nickname: nickname.value || localStorage.getItem('nickname') || '',
            username: localStorage.getItem('nickname') || ''
        }
    }

    function logout() {
        token.value = ''
        role.value = ''
        nickname.value = ''
        localStorage.removeItem('token')
        localStorage.removeItem('role')
        localStorage.removeItem('nickname')
    }

    return { token, role, nickname, login, register, fetchUserInfo, logout }
})

import { defineStore } from 'pinia'
import { ref } from 'vue'

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
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), 10000)
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
                signal: controller.signal,
            })
            clearTimeout(timer)
            if (!res.ok) {
                const err = await res.json().catch(() => ({}))
                throw { response: { data: err } }
            }
            const data = await res.json()
            // RestResp 格式: { code, message, data: { token, uid, nickname } }
            const loginOk = data.code === undefined || data.code === 0 || data.code === '0' || data.code === '00000'
            if (!loginOk) {
                throw { response: { data } }
            }
            const payload = data.data || data
            token.value = payload.token || ''
            role.value = 'user'
            nickname.value = payload.nickname || username
            localStorage.setItem('token', token.value)
            localStorage.setItem('role', role.value)
            localStorage.setItem('nickname', nickname.value)
        } finally {
            clearTimeout(timer)
        }
    }

    /** 用户注册：对接后端 POST /api/front/user/register */
    async function register(
        username: string,
        password: string,
        name?: string,
    ) {
        const res = await fetch('/api/front/user/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, ...(name ? { name } : {}) }),
        })
        if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            throw { response: { data: err } }
        }
        const data = await res.json()
        // RestResp 格式: { code, message, data: {...} }
        const regOk = data.code === undefined || data.code === 0 || data.code === '0' || data.code === '00000'
        if (!regOk) {
            throw { response: { data } }
        }
        return data
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

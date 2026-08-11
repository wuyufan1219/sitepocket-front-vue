import axios from 'axios'

const request = axios.create({
  // 通过环境变量配置 API 基础地址：
  // - 开发环境：留空，走 Vite proxy（见 vite.config.ts）
  // - 生产环境：在 .env.production 中配置实际后端地址
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// 请求拦截：自动带 token
request.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截：统一处理错误
request.interceptors.response.use(
  (res) => res,
  (err) => {
    // 401：token 过期或未授权，清除登录态并跳转登录页
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('role')
      localStorage.removeItem('nickname')
      // 避免在登录/注册页重复跳转
      const path = window.location.pathname
      if (path !== '/login' && path !== '/register') {
        const redirect = path + window.location.search
        window.location.href = `/login?redirect=${encodeURIComponent(redirect)}`
      }
    }
    const msg = err.response?.data?.message || err.response?.data?.msg || err.message
    return Promise.reject(new Error(msg))
  },
)

export default request

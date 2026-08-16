import axios from 'axios'

const request = axios.create({
  // 通过环境变量配置 API 基础地址：
  // - 开发环境：留空，走 Vite proxy（见 vite.config.ts）
  // - 生产环境：在 .env.production 中配置实际后端地址
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// 请求拦截：自动带 token（后台与前台使用独立的 token，避免互相覆盖）
request.interceptors.request.use((config) => {
  const url = config.url || ''
  const isAdmin = url.startsWith('/api/admin')
  const token = localStorage.getItem(isAdmin ? 'admin_token' : 'token')
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
      const url = err.config?.url || ''
      // 后台接口：清除后台登录态，跳转后台登录页
      if (url.startsWith('/api/admin')) {
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_real_name')
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        return Promise.reject(new Error('登录已过期，请重新登录'))
      }
      // 前台接口：清除前台登录态
      localStorage.removeItem('token')
      localStorage.removeItem('role')
      localStorage.removeItem('nickname')
      // 避免在登录页重复跳转
      const path = window.location.pathname
      if (path !== '/login') {
        const redirect = path + window.location.search
        window.location.href = `/login?redirect=${encodeURIComponent(redirect)}`
      }
    }
    const msg = err.response?.data?.message || err.response?.data?.msg || err.message
    return Promise.reject(new Error(msg))
  },
)

export default request

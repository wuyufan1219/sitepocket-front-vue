/**
 * 静默记录一次网站访问（浏览历史）。
 *
 * 说明：
 * - 仅登录用户记录（未登录无 token 时直接跳过）；
 * - 使用原生 fetch 而非 axios `request`，避免未登录/401 触发全局跳登录页，
 *   且该操作属于「尽力而为」，失败不打扰用户。
 */
export function recordVisit(siteId: number): void {
  const token = localStorage.getItem('token')
  if (!token) return

  const base = import.meta.env.VITE_API_BASE_URL ?? ''
  fetch(`${base}/api/front/user/history/${siteId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => {
    // 静默失败，不阻塞跳转、不提示
  })
}

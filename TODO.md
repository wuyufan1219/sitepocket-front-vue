# 网站口袋前端 TODO

> 基于代码审查分析整理，按优先级分类

---

## 🔴 P0 — Bug 修复 & 代码清理

### 1. 清理 style.css 中的 Vite 模板残留
- [x] 删除 `style.css` 中的 Vite 模板样式（hero、counter、#next-steps、#docs 等无用 CSS）
- [x] 保留必要的 CSS 变量和基础样式

### 2. 移除未使用的 Element Plus
- [x] 确认项目是否真的需要 Element Plus（当前未使用其任何组件）
- [x] 如不需要：从 `main.ts` 移除 `import ElementPlus` 及相关依赖
- [x] 如需要：用 Element Plus 组件替换现有自定义 UI（表单、按钮等）

### 3. 修复 GameNav 缺少 favicon 回退
- [x] `GameNav.vue` 中网站图标加载失败时，未提供 favicon 回退方案
- [x] `AcgNav.vue` 已有 `getFavicon()` 函数，GameNav 应同步该逻辑

### 4. 清理调试代码和未使用代码
- [x] `Login.vue` 中移除所有 `console.log` 调试语句
- [x] `Sidebar.vue` 中移除未使用的 `showAll()`、`isActive()` 函数
- [x] `gameFilter.ts` store 已定义但未被任何视图使用，考虑删除或启用

### 5. 请求拦截器增加 401 处理
- [x] `request.ts` 响应拦截器需增加 401 状态码检测
- [x] 401 时自动清除 token 并跳转登录页

---

## 🟠 P1 — 架构重构

### 1. GameNav / AcgNav 代码重复严重（~90% 重复）
- [x] 抽取通用 `NavPage.vue` 组件，支持 `props` 区分主题/分类
- [x] 将搜索逻辑、加载更多逻辑、分类展示逻辑统一
- [x] GameNav 和 AcgNav 改为使用 NavPage，仅传入不同配置
- [x] 预估节省 ~300 行重复代码

### 2. 增加环境变量配置
- [x] 创建 `.env.development` 和 `.env.production`
- [x] 使用 `VITE_API_BASE_URL` 配置 API 基础地址
- [x] `request.ts` 的 `baseURL` 改为读取环境变量

### 3. 完善 TypeScript 类型定义
- [x] 创建 `src/types/` 目录存放接口类型
- [x] 提取 `WebsiteCard`、`Section`、`CategoryNode` 等类型到独立文件
- [x] 统一 API 响应类型定义

---

## 🟡 P2 — 缺失功能

### 1. 完善侧边栏分类页面
- [ ] 当前侧边栏支持分类：游戏、二次元、书籍、学习、工具、影视、音乐、论坛、设计、AI
- [ ] 但仅有游戏和二次元有对应页面
- [ ] 补充：书籍导航页、学习导航页、工具导航页等
- [ ] 或实现通用分类页面，根据路由参数动态加载

### 2. 添加 404 页面
- [ ] 创建 `NotFound.vue` 页面
- [ ] 在路由中配置 `/:pathMatch(.*)*` 通配符路由

### 3. 实现收藏功能
- [ ] 创建 `favorites.ts` store 管理收藏
- [ ] 网站卡片添加收藏/取消收藏按钮
- [ ] 创建"我的收藏"页面
- [ ] 对接后端收藏 API

### 4. 实现搜索结果筛选与排序
- [ ] 搜索结果支持按名称排序
- [ ] 支持按分类筛选
- [ ] 支持按时间/热度排序

### 5. 添加暗色模式
- [ ] 实现主题切换按钮
- [ ] 完善 CSS 变量的暗色主题
- [ ] 持久化用户主题偏好

---

## 🟢 P3 — 体验优化

### 1. 响应式设计完善
- [ ] 侧边栏在移动端自动收起
- [ ] 网站卡片网格在平板/手机端自适应
- [ ] 添加汉堡菜单按钮

### 2. 添加页脚
- [ ] 创建 `AppFooter.vue` 组件
- [ ] 显示版权信息、友情链接、联系方式等

### 3. 加载状态优化
- [ ] 添加骨架屏（Skeleton）组件
- [ ] 替换纯文字"加载中..."提示
- [ ] 优化图片加载失败的占位图

### 4. 添加 Toast 消息组件
- [ ] 替换现有零散的消息提示
- [ ] 统一成功/错误/警告提示风格

### 5. 页面过渡动画
- [ ] 路由切换添加过渡效果
- [ ] 列表加载添加动画

### 6. SEO 优化
- [ ] 为每个页面设置合理的 title
- [ ] 添加 meta description
- [ ] 考虑使用 `vue-meta` 或 `@unhead/vue`

---

## 📝 完成记录

| 日期 | 完成项 | 备注 |
|------|--------|------|
| 2026-08-11 | P0 全部完成 | 清理 style.css、移除 Element Plus、修复 GameNav favicon、清理调试代码、删除 gameFilter.ts、request.ts 401 处理 |
| 2026-08-11 | P1 全部完成 | 提取 src/types、NavPage 组件统一 GameNav/AcgNav（节省 ~4 kB JS + 2.7 kB CSS）、.env 环境变量 + request.ts baseURL |

---

## 🎯 建议执行顺序

1. **先做 P0**：清理无用代码，修复 bug，快速提升代码质量
2. **再做 P1**：重构 NavPage 组件，减少维护成本
3. **然后 P2**：补充缺失功能，完善产品
4. **最后 P3**：打磨细节，提升用户体验

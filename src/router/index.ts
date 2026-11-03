import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

export const navigation = [
  { path: '/chat', title: 'AI 对话', mark: 'AI' },
  { path: '/knowledge', title: '知识库管理', mark: 'KB' },
  { path: '/tools', title: 'Tool / MCP 管理', mark: 'TL' },
  { path: '/usage', title: 'Usage 统计', mark: 'US' },
  { path: '/logs', title: '执行日志', mark: 'LG' },
]
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { title: '测试登录' },
    },
    {
      path: '/',
      component: () => import('@/layouts/AdminLayout.vue'),
      redirect: '/chat',
      children: [
        {
          path: 'chat',
          component: () => import('@/views/ChatView.vue'),
          meta: { title: 'AI 对话' },
        },
        ...navigation
          .slice(1)
          .map((item) => ({
            path: item.path.slice(1),
            component: () => import('@/views/PlaceholderView.vue'),
            meta: { title: item.title },
          })),
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/chat' },
  ],
})
router.beforeEach((to) => {
  const store = useUserStore()
  if (to.name !== 'login' && !store.user)
    return { name: 'login', query: { redirect: to.fullPath } }
  if (to.name === 'login' && store.user) return '/chat'
})
router.afterEach((to) => {
  document.title = `${String(to.meta.title || '控制台')} · AI Agent`
})
export default router

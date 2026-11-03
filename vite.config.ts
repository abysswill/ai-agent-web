import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const identityEnabled =
    command === 'serve' &&
    mode === 'development' &&
    env.DEV_IDENTITY_ENABLED === 'true'
  const target = env.API_PROXY_TARGET || 'http://127.0.0.1:8080'
  if (identityEnabled) {
    const host = new URL(target).hostname
    if (!['localhost', '127.0.0.1', '[::1]'].includes(host)) {
      throw new Error('测试身份注入仅允许连接本机后端')
    }
    if (!env.DEV_USER_ID || !env.DEV_USER_NAME)
      throw new Error('请配置 DEV_USER_ID 和 DEV_USER_NAME')
  }
  return {
    plugins: [vue()],
    preview: { host: '127.0.0.1', proxy: {} },
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: {
      host: '127.0.0.1',
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': {
          target,
          changeOrigin: true,
          rewrite: (path) =>
            path.replace(
              /^\/api(?=\/|$)/,
              env.API_PROXY_CONTEXT_PATH ?? '/ai/agent',
            ),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              // Never trust identity headers supplied by the browser.
              proxyReq.removeHeader('loginform')
              proxyReq.removeHeader('tenantId')
              if (identityEnabled) {
                proxyReq.setHeader(
                  'loginform',
                  encodeURIComponent(
                    JSON.stringify({
                      userId: env.DEV_USER_ID,
                      userName: env.DEV_USER_NAME,
                      tenantId: env.DEV_TENANT_ID || '',
                    }),
                  ),
                )
              }
            })
          },
        },
      },
    },
  }
})

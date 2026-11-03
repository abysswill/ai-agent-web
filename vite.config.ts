import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import type { IncomingMessage } from 'node:http'

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), '')

  console.log('当前工作目录:', process.cwd())
  console.log('环境变量文件读取结果:', {
    API_PROXY_TARGET: env.API_PROXY_TARGET,
    API_PROXY_CONTEXT_PATH: env.API_PROXY_CONTEXT_PATH,
  })

  const identityEnabled =
    command === 'serve' &&
    mode === 'development' &&
    env.DEV_IDENTITY_ENABLED === 'true'
  const target = env.API_PROXY_TARGET || 'http://127.0.0.1:8080'

  console.log('Vite mode:', mode)
  console.log('Proxy target:', target)
  console.log('Proxy context:', env.API_PROXY_CONTEXT_PATH)

  if (identityEnabled) {
    const host = new URL(target).hostname
    if (!['localhost', '127.0.0.1', '[::1]'].includes(host)) {
      throw new Error('测试身份注入仅允许连接本机后端')
    }
    if (!env.DEV_USER_ID || !env.DEV_USER_NAME)
      throw new Error('请配置 DEV_USER_ID 和 DEV_USER_NAME')
  }


  const proxyRequests = new WeakMap<
    IncomingMessage,
    { url: string; method: string; startedAt: number }
  >()

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
          secure: false,
          rewrite: (path) =>
            path.replace(
              /^\/api(?=\/|$)/,
              env.API_PROXY_CONTEXT_PATH ?? '/ai/agent',
            ),

          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              // 本地联调默认请求头
              proxyReq.setHeader('tenantId', 'xk')
              proxyReq.setHeader('accessType', 'web')
              proxyReq.setHeader('ticket', 'efd53417b6944e89b4752eedc99b5d36')

              // 不允许浏览器自行伪造 loginform
              proxyReq.removeHeader('loginform')

              if (identityEnabled) {
                proxyReq.setHeader(
                  'loginform',
                  encodeURIComponent(
                    JSON.stringify({
                      userId: env.DEV_USER_ID,
                      userName: env.DEV_USER_NAME,
                      tenantId: env.DEV_TENANT_ID || 'xk',
                    }),
                  ),
                )
              }

              const finalUrl = new URL(proxyReq.path, target).toString()

              proxyRequests.set(req, {
                url: finalUrl,
                method: req.method || 'GET',
                startedAt: Date.now(),
              })

              console.log('\n========== API REQUEST ==========')
              console.log('Method:', req.method)
              console.log('URL:', finalUrl)

              const headers = { ...proxyReq.getHeaders() }
              for (const key of Object.keys(headers)) {
                if (/authorization|cookie|token|loginform|secret|api[-_]?key/i.test(key)) {
                  headers[key] = '[REDACTED]'
                }
              }
              console.log('Headers:', headers)
              console.log('=================================\n')
            })

            proxy.on('proxyRes', (proxyRes, req) => {
              const request = proxyRequests.get(req)

              console.log('\n========== API RESPONSE ==========')
              console.log('URL:', request?.url ?? req.url)
              console.log('Status:', proxyRes.statusCode)
              console.log(
                'Duration:',
                request ? `${Date.now() - request.startedAt}ms` : 'unknown',
              )
              console.log('==================================\n')
            })

            proxy.on('error', (err, req) => {
              const request = proxyRequests.get(req)

              console.error('\n========== PROXY ERROR ==========')
              console.error('URL:', request?.url ?? req.url)
              console.error('Error:', err.message)
              console.error('=================================\n')
            })
          },

        },
      },
    },
  }
})

import axios, { type AxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import type { ApiResult } from '@/types/api'

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code?: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}
const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  withCredentials: true,
})
// Extension point for future Gateway-supported authentication. Never attach browser loginform.
http.interceptors.request.use((config) => {
  config.headers.delete('loginform')
  config.headers.delete('tenantId')
  return config
})
http.interceptors.response.use(
  (response) => {
    unwrapResult(response.data)
    return response
  },
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ERR_CANCELED') return Promise.reject(error)
      const status = error.response?.status
      const message =
        error.code === 'ECONNABORTED'
          ? '请求超时，请稍后重试'
          : status === 401
            ? 'Gateway 登录已失效，请重新登录'
            : status === 403
              ? '没有访问权限'
              : status === 502 || status === 503 || status === 504
                ? '无法连接后端服务，请检查服务与代理配置'
                : status === 500
                  ? '服务器请求失败，请检查后端运行状态或代理配置'
                  : status
                    ? `HTTP 请求失败（${status}）`
                    : '无法连接后端服务，请检查网络、服务与代理配置'
      return Promise.reject(new ApiError(message, status))
    }
    return Promise.reject(error)
  },
)

export function unwrapResult<T>(value: unknown): T {
  if (
    !value ||
    typeof value !== 'object' ||
    !('rspCode' in value) ||
    !('rspMsg' in value) ||
    typeof value.rspCode !== 'number' ||
    typeof value.rspMsg !== 'string'
  ) {
    throw new ApiError('后端响应格式不符合 ApiResult 协议')
  }
  const result = value as ApiResult<T>
  if (result.rspCode !== 0)
    throw new ApiError(result.rspMsg || '业务操作失败', result.rspCode)
  return result.data as T
}
let lastMessage = ''
let lastShownAt = 0
function notify(error: unknown) {
  if (axios.isCancel(error)) return
  const message =
    error instanceof Error ? error.message : '请求失败，请稍后重试'
  const now = Date.now()
  if (message !== lastMessage || now - lastShownAt > 2000) {
    ElMessage.error(message)
    lastMessage = message
    lastShownAt = now
  }
}
/** Single error notification boundary for both transport and business errors. */
export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await http.request<ApiResult<T>>(config)
    return response.data.data as T
  } catch (error) {
    notify(error)
    throw error
  }
}

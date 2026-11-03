import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AxiosError, type AxiosResponse } from 'axios'
vi.mock('element-plus', () => ({ ElMessage: { error: vi.fn() } }))
import { ElMessage } from 'element-plus'
import { request } from '../src/utils/http'

beforeEach(() => vi.mocked(ElMessage.error).mockClear())

describe('unified request pipeline', () => {
  it('strips browser identity headers and extracts successful data', async () => {
    const result = await request<string>({
      method: 'POST',
      url: '/ai/room/create',
      headers: { loginform: 'untrusted', tenantId: 'untrusted' },
      adapter: async (config) => {
        expect(config.headers.has('loginform')).toBe(false)
        expect(config.headers.has('tenantId')).toBe(false)
        expect(config.timeout).toBe(15000)
        expect(config.withCredentials).toBe(true)
        return {
          config,
          status: 200,
          statusText: 'OK',
          headers: {},
          data: { rspCode: 0, rspMsg: '操作成功', data: 'session-test' },
        }
      },
    })
    expect(result).toBe('session-test')
    expect(ElMessage.error).not.toHaveBeenCalled()
  })
  it('rejects HTTP-200 business errors and deduplicates identical notifications', async () => {
    const config = {
      url: '/ai/room/create',
      adapter: async (): Promise<AxiosResponse> => ({
        config: {} as AxiosResponse['config'],
        status: 200,
        statusText: 'OK',
        headers: {},
        data: { rspCode: 401, rspMsg: '测试身份已失效' },
      }),
    }
    await expect(request(config)).rejects.toMatchObject({
      code: 401,
      message: '测试身份已失效',
    })
    await expect(request(config)).rejects.toMatchObject({ code: 401 })
    expect(ElMessage.error).toHaveBeenCalledTimes(1)
  })
  it('maps connection failures to actionable feedback', async () => {
    await expect(
      request({
        url: '/ai/room/create',
        adapter: async () => {
          throw new AxiosError('Network Error', 'ERR_NETWORK')
        },
      }),
    ).rejects.toThrow('无法连接后端服务')
    expect(ElMessage.error).toHaveBeenCalledTimes(1)
  })
  it('maps timeouts without exposing low-level errors', async () => {
    await expect(
      request({
        url: '/ai/room/create',
        adapter: async () => {
          throw new AxiosError('timeout', 'ECONNABORTED')
        },
      }),
    ).rejects.toThrow('请求超时')
    expect(ElMessage.error).toHaveBeenCalledTimes(1)
  })
})

import { describe, expect, it, vi } from 'vitest'
vi.mock('element-plus', () => ({ ElMessage: { error: vi.fn() } }))
import { unwrapResult, ApiError } from '../src/utils/http'
describe('backend ApiResult contract', () => {
  it('extracts the sessionId string', () =>
    expect(
      unwrapResult({ rspCode: 0, rspMsg: '操作成功', data: 'session-123' }),
    ).toBe('session-123'))
  it('rejects business unauthorized even when HTTP is successful', () => {
    try {
      unwrapResult({ rspCode: 401, rspMsg: '未登陆或token过期' })
      throw new Error('Expected rejection')
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError)
      expect((error as ApiError).code).toBe(401)
    }
  })
  it.each([
    null,
    {},
    '<html>bad gateway</html>',
    { rspCode: '0', rspMsg: 'ok' },
  ])('rejects malformed responses: %j', (value) =>
    expect(() => unwrapResult(value)).toThrow('ApiResult'),
  )
})

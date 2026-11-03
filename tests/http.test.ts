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

describe('Gateway + ApiResult contract', () => {
  it('extracts the inner sessionId after Gateway success', () => {
    expect(
      unwrapResult<string>({
        code: '000',
        msg: 'OK',
        data: { rspCode: 0, rspMsg: '操作成功', data: 'gateway-session' },
      }),
    ).toBe('gateway-session')
  })
  it('uses the Gateway failure message and preserves its string code', () => {
    expect(() =>
      unwrapResult({ code: 'AUTH_FAILED', msg: 'Gateway 会话失效' }),
    ).toThrow('Gateway 会话失效')
    try {
      unwrapResult({ code: 'AUTH_FAILED', msg: 'Gateway 会话失效' })
    } catch (error) {
      expect(error).toMatchObject({ code: 'AUTH_FAILED' })
    }
  })
  it('uses the inner business failure message', () => {
    expect(() =>
      unwrapResult({
        code: '000',
        msg: 'OK',
        data: { rspCode: 403, rspMsg: '业务访问被拒绝' },
      }),
    ).toThrow('业务访问被拒绝')
  })
  it.each([
    { code: 0, msg: 'OK' },
    { code: '000' },
    { code: '000', msg: null },
  ])('rejects malformed Gateway envelopes: %j', (value) => {
    expect(() => unwrapResult(value)).toThrow('Gateway 协议')
  })
  it.each([
    undefined,
    null,
    'session-without-ApiResult',
    {},
    { rspCode: '0', rspMsg: 'OK' },
  ])('rejects malformed Gateway inner data: %j', (data) => {
    expect(() => unwrapResult({ code: '000', msg: 'OK', data })).toThrow(
      'ApiResult 协议',
    )
  })
})

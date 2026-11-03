import { request, ApiError } from '@/utils/http'

/** Mirrors backend basic/enums/AiProvider.java; availability depends on server configuration. */
export const providers = [
  'BAILIAN_MODEL',
  'BAILIAN_APP',
  'QIANFAN',
  'DEEPSEEK',
  'OPENAI',
  'DIFY',
] as const
export type AiProvider = (typeof providers)[number]
export interface AiChatRoomCreateParam {
  provider: AiProvider
  targetId: string
}
export async function createRoom(
  param: AiChatRoomCreateParam,
): Promise<string> {
  const sessionId = await request<unknown>({
    method: 'POST',
    url: '/ai/room/create',
    data: param,
  })
  if (typeof sessionId !== 'string' || !sessionId.trim())
    throw new ApiError('创建会话响应未返回有效的 sessionId')
  return sessionId
}

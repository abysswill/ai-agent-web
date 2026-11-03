/** Mirrors backend support/common/ApiResult.java. */
export interface ApiResult<T> {
  rspCode: number
  rspMsg: string
  data?: T | null
}

/** Optional outer envelope returned by Spring Cloud Gateway. */
export interface GatewayResult<T> {
  code: string
  msg: string
  data?: T | null
}

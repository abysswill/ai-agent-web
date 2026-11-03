/** Mirrors backend support/common/ApiResult.java. */
export interface ApiResult<T> {
  rspCode: number
  rspMsg: string
  data?: T | null
}

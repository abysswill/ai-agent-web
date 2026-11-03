import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { DisplayUser } from '@/types/user'

const KEY = 'ai-agent-display-user'
function restore(): DisplayUser | null {
  try {
    const value: unknown = JSON.parse(sessionStorage.getItem(KEY) || 'null')
    if (
      value &&
      typeof value === 'object' &&
      'userName' in value &&
      typeof value.userName === 'string' &&
      value.userName.trim()
    ) {
      return { userName: value.userName }
    }
  } catch {
    /* Unavailable storage or stale local display state. */
  }
  return null
}
export const useUserStore = defineStore('user', () => {
  const user = ref<DisplayUser | null>(restore())
  function login(userName: string) {
    user.value = { userName: userName.trim() }
    try {
      sessionStorage.setItem(KEY, JSON.stringify(user.value))
    } catch {
      /* In-memory state still works. */
    }
  }
  function logout() {
    user.value = null
    try {
      sessionStorage.removeItem(KEY)
    } catch {
      /* Storage may be disabled. */
    }
  }
  return { user, login, logout }
})

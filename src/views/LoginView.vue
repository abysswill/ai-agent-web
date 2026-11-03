<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
const dev = import.meta.env.DEV
const name = ref(dev ? '开发测试用户' : '')
const route = useRoute()
const router = useRouter()
const store = useUserStore()
function login() {
  if (!name.value.trim()) return
  store.login(name.value)
  const destination = route.query.redirect
  void router.replace(
    typeof destination === 'string' &&
      destination.startsWith('/') &&
      !destination.startsWith('//') &&
      !destination.startsWith('/login')
      ? destination
      : '/chat',
  )
}
</script>
<template>
  <div class="login-page">
    <div class="login-intro">
      <span class="eyebrow">AI AGENT / WORKSPACE</span>
      <h1>让 AI 能力，<br />有序连接业务。</h1>
      <p>统一工作空间 · 清晰管理 · 高效协作</p>
      <div class="login-decoration">AI<span>Agent Console</span></div>
    </div>
    <el-card class="login-card" shadow="never">
      <span class="eyebrow">WELCOME BACK</span>
      <h2>{{ dev ? '测试登录' : '进入工作台' }}</h2>
      <p class="muted">
        {{
          dev
            ? '选择展示用户，进入开发联调工作台'
            : '请先通过企业 Gateway 完成身份认证'
        }}
      </p>
      <el-alert
        :closable="false"
        type="info"
        show-icon
        :title="
          dev
            ? '此处仅维护前端展示状态，不执行后端身份认证。联调身份由本机开发代理配置。'
            : '此处仅记录展示名称；访问权限由 Gateway 验证，输入名称不会获得后端权限。'
        "
      />
      <el-form label-position="top" class="login-form" @submit.prevent="login">
        <el-form-item label="用户展示名称">
          <el-input
            v-model="name"
            maxlength="40"
            placeholder="请输入展示名称"
            autocomplete="nickname"
          />
        </el-form-item><el-button
          v-if="dev"
          text
          type="primary"
          @click="name = '开发测试用户'"
        >
          使用开发测试用户
        </el-button><el-button
          class="login-submit"
          type="primary"
          native-type="submit"
          :disabled="!name.trim()"
        >
          进入工作台
        </el-button>
      </el-form>
      <p class="login-note">AI Agent 管理控制台 · 基础版本</p>
    </el-card>
  </div>
</template>

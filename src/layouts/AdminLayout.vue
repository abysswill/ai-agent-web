<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { navigation } from '@/router'
import { useUserStore } from '@/stores/user'
const route = useRoute()
const router = useRouter()
const store = useUserStore()
const importMetaDev = import.meta.env.DEV
async function logout() {
  store.logout()
  await router.replace('/login')
}
</script>
<template>
  <div class="admin-shell">
    <aside class="sidebar">
      <router-link class="brand" to="/chat"><span class="brand-symbol">A</span><span>AI Agent<small>管理控制台</small></span></router-link>
      <div class="nav-label">工作空间</div>
      <el-menu
        :default-active="route.path"
        router
        background-color="transparent"
        text-color="#a7b6cc"
        active-text-color="#ffffff"
      >
        <el-menu-item
          v-for="item in navigation"
          :key="item.path"
          :index="item.path"
        >
          <span class="menu-mark">{{ item.mark }}</span><span>{{ item.title }}</span>
        </el-menu-item>
      </el-menu>
      <div class="sidebar-footer">
        <span class="status-dot"></span>基础联调工作台 <small>v0.1.0</small>
      </div>
    </aside>
    <div class="workspace">
      <header class="topbar">
        <div class="breadcrumb">
          工作空间 <span>/</span> <strong>{{ route.meta.title }}</strong>
        </div>
        <div class="user-area">
          <el-tag type="info" effect="plain">
            {{
              importMetaDev ? '开发环境' : 'Gateway 模式'
            }}
          </el-tag><span class="avatar">{{ store.user?.userName.slice(0, 1) }}</span><span>{{ store.user?.userName }}</span><el-button text @click="logout">退出登录</el-button>
        </div>
      </header>
      <main class="main-content"><router-view /></main>
    </div>
  </div>
</template>

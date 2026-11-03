<script setup lang="ts">
import { useRoute } from 'vue-router'
const route = useRoute()
</script>
<template>
  <section>
    <div class="page-heading">
      <div>
        <span class="eyebrow">WORKSPACE MODULE</span>
        <h1>{{ route.meta.title }}</h1>
        <p>统一管理 AI 平台能力。</p>
      </div>
      <el-tag type="info" effect="plain">规划中</el-tag>
    </div>
    <el-card shadow="never" class="placeholder-card">
      <el-empty :description="`${String(route.meta.title)}将在后续阶段接入`">
        <p class="muted">本阶段已建立页面入口，暂不提供业务操作。</p>
      </el-empty>
    </el-card>
  </section>
</template>

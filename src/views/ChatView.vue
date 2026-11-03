<script setup lang="ts">
import CreateRoomPanel from '@/components/CreateRoomPanel.vue'
</script>
<template>
  <section>
    <div class="page-heading">
      <div>
        <span class="eyebrow">AI WORKSPACE</span>
        <h1>AI 对话</h1>
        <p>从建立一次会话开始，验证应用与 AI 平台的连接。</p>
      </div>
      <el-tag effect="plain">基础联调</el-tag>
    </div>
    <div class="overview-grid">
      <div class="overview-item">
        <span>01 / 当前阶段</span><strong>会话创建</strong>
        <p>验证基础请求与响应协议</p>
      </div>
      <div class="overview-item">
        <span>02 / 接口协议</span><strong>POST <small>/ai/room/create</small></strong>
        <p>ApiResult&lt;String&gt; · rspCode = 0</p>
      </div>
      <div class="overview-item">
        <span>03 / 后续能力</span><strong>逐步接入</strong>
        <p>聊天与流式响应将在后续阶段实现</p>
      </div>
    </div>
    <CreateRoomPanel />
  </section>
</template>

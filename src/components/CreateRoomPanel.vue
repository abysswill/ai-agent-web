<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { createRoom, providers, type AiChatRoomCreateParam } from '@/api/chat'
const form = reactive<AiChatRoomCreateParam>({
  provider: 'BAILIAN_MODEL',
  targetId: 'qwen-plus',
})
const formRef = ref<FormInstance>()
const loading = ref(false)
const sessionId = ref('')
const errorMessage = ref('')
const rules: FormRules<AiChatRoomCreateParam> = {
  provider: [{ required: true, message: '请选择提供方', trigger: 'change' }],
  targetId: [
    {
      validator: (_rule, value: string, callback) =>
        value?.trim() ? callback() : callback(new Error('请输入目标 ID')),
      trigger: 'blur',
    },
  ],
}
async function submit() {
  if (loading.value || !(await formRef.value?.validate().catch(() => false)))
    return
  loading.value = true
  sessionId.value = ''
  errorMessage.value = ''
  try {
    sessionId.value = await createRoom({
      provider: form.provider,
      targetId: form.targetId.trim(),
    })
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : '创建失败，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>
<template>
  <el-card shadow="never" class="panel">
    <template #header>
      <div class="panel-heading">
        <div>
          <h2>创建会话</h2>
          <p>使用后端真实接口进行通信验证</p>
        </div>
        <span class="method-badge">POST</span>
      </div>
    </template>
    <div class="create-grid">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @submit.prevent="submit"
      >
        <el-form-item label="接口提供方 provider" prop="provider">
          <el-select v-model="form.provider" placeholder="选择提供方">
            <el-option
              v-for="provider in providers"
              :key="provider"
              :label="provider"
              :value="provider"
            />
          </el-select>
        </el-form-item><el-form-item label="目标 ID targetId" prop="targetId">
          <el-input
            v-model="form.targetId"
            placeholder="模型编号或后端约定的应用标识"
          />
        </el-form-item>
        <p class="field-help">
          例如 BAILIAN_MODEL /
          qwen-plus。枚举选项不代表后端均已启用，请使用实际配置的提供方。
        </p>
        <el-button type="primary" native-type="submit" :loading="loading">
          {{
            loading ? '正在创建…' : '创建会话'
          }}
        </el-button>
      </el-form>
      <div class="result-area">
        <span class="eyebrow">RESPONSE / SESSION</span><template v-if="sessionId">
          <h3>会话创建成功</h3>
          <el-tag type="success">rspCode: 0</el-tag>
          <p class="muted">sessionId</p>
          <code class="session-id">{{ sessionId }}</code>
        </template><template v-else-if="errorMessage">
          <h3>请求未完成</h3>
          <el-alert
            :title="errorMessage"
            type="error"
            :closable="false"
            show-icon
          />
          <p class="muted">
            请检查后端运行状态、API 代理地址及 Gateway 或开发身份配置。
          </p>
        </template><template v-else>
          <div class="result-icon">↗</div>
          <h3>等待创建会话</h3>
          <p class="muted">
            填写参数并提交后，返回的 sessionId 将显示在这里。
          </p>
        </template>
      </div>
    </div>
  </el-card>
</template>

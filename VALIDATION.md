# 验证记录

当前云实例已完成以下检查。后端源码只用于协议核实，没有修改或启动后端，也没有访问配置中的远程数据库或 AI 服务。

| 检查 | 结果 |
| --- | --- |
| npm install / npm ci | 均成功，已生成并验证 package-lock.json |
| npm run dev | 成功，Vite 在 loopback 上启动，Chromium 可访问 |
| npm run lint | 通过，无错误或警告 |
| npm test | 2 个文件、10 项测试通过 |
| npm run build | TypeScript 检查与 Vite 生产构建成功 |
| 浏览器登录与刷新 | 展示名称、状态持久化正常 |
| 五个菜单 | 全部可切换，无浏览器运行时异常 |
| 退出与路由守卫 | 退出后清理展示状态，访问受保护页面回到登录页 |
| 移动布局 | 390px 宽度无水平溢出 |
| 后端未启动 | 通过真实 Vite 代理请求验证，失败时显示友好提示并恢复按钮 |
| 创建会话协议 | 浏览器拦截响应测试验证 POST、精确 body 与字符串 sessionId 显示；不是 Java 后端成功结果 |
| 业务 401 | HTTP 200 + rspCode 401 被正确拒绝，显示 rspMsg，清除上一次成功结果 |
| 表单校验 | 空白 targetId 不发送请求 |
| 代理转发 | 临时本机接收器验证完整路径 /ai/agent/ai/room/create、POST 请求体 |
| 开发身份 | 默认关闭；浏览器伪造头被清理；开启后从服务端配置注入 URL 编码身份 |
| 真实后端会话创建 | 未执行：当前没有运行中的 Java 后端与配套服务 |

单元测试覆盖真实 ApiResult 格式、成功数据、业务失败、格式错误、身份头清理、超时、连接失败及重复 toast 去重。

构建存在 Element Plus 全量引入造成的 chunk 大小提示（主包约 1 MB、gzip 341 KB），不影响类型检查或生产构建。本阶段保留简单的官方组件接入方式，未增加自动导入或复杂打包插件。

浏览器与代理检查使用临时测试工具和临时协议接收器，没有向项目添加浏览器运行依赖；可重复执行的单元测试在 tests/，手工步骤见 README.md。

## 本次新增文件

- 工程：package.json、package-lock.json、index.html、tsconfig.json、vite.config.ts、eslint.config.ts、.gitignore。
- 环境：.env.development、.env.production、.env.local.example。
- 入口：src/main.ts、src/App.vue、src/styles/main.css。
- 布局与路由：src/layouts/AdminLayout.vue、src/router/index.ts。
- 用户态：src/stores/user.ts、src/types/user.ts、src/views/LoginView.vue。
- 请求协议：src/types/api.ts、src/utils/http.ts、src/api/chat.ts。
- 页面：src/views/ChatView.vue、src/views/PlaceholderView.vue、src/components/CreateRoomPanel.vue。
- 测试：tests/http.test.ts、tests/request.test.ts。
- 文档：README.md、VALIDATION.md。

未修改后端文件或数据库结构。未实现完整聊天、SSE、RAG 或 Tool 业务功能。

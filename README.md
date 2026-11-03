# ai-agent-web

Vue 3 + TypeScript + Vite 管理后台。使用 Vue Router、Pinia、Axios、Element Plus 与 npm。本阶段仅包含基础布局、展示用户态、业务页面入口与创建会话联调。

## 启动与检查

需要 Node.js 22.12+（22 系列）或 24+；当前验证版本为 Node.js 24.19.0 / npm 11.9.0。

```bash
cd /workspace/ai-agent-web
npm ci
npm run dev
npm run lint
npm test
npm run build
```

开发服务默认绑定本机 127.0.0.1:5173，不对外开放。`npm run preview` 可检查构建产物，preview 不提供开发代理，请使用正式反向代理或独立的测试环境。

## 目录

```text
src/
  api/chat.ts                   # 真实创建会话接口与参数类型
  components/CreateRoomPanel.vue # 创建会话表单与结果
  layouts/AdminLayout.vue       # 侧栏、顶栏与内容布局
  router/index.ts               # 路由与展示用户守卫
  stores/user.ts                # sessionStorage 展示状态
  types/                        # ApiResult、DisplayUser
  utils/http.ts                 # Axios、统一错误处理
  views/                        # 测试登录、AI 对话及共享占位页面
  styles/main.css               # 响应式基础样式
```

## 已核实的后端协议

来源：`abysswill/ai-agent`，阅读时提交为 `9c8b055fc1ff56d545d1a66368f1a4a654a8b87d`。未修改后端文件或数据库结构。

- `basic/controller/AiChatController.java`：`POST /ai/room/create`，JSON body。
- `basic/request/AiChatRoomCreateParam.java`：仅有 `provider` 和 `targetId`。
- `basic/enums/AiProvider.java`：BAILIAN_MODEL、BAILIAN_APP、QIANFAN、DEEPSEEK、OPENAI、DIFY。后端未必注册了所有枚举对应的客户端。
- `support/common/ApiResult.java`：实际响应不是 ObjectResponse，而是 `{ rspCode: number, rspMsg: string, data: T }`，失败响应可能没有 data。
- `support/common/RspEntityEnum.java`：0 为成功；401 为未登录；403 为无权限；404 为参数校验失败；500 为业务失败。
- `server/src/main/resources/application.yml`：context-path 为 `/ai/agent`，所以直连完整路径为 `/ai/agent/ai/room/create`。
- `support/interceptor/WebAccessInterceptor.java`：解析 URL 编码 JSON 请求头 `loginform`，构建 CurrentUser；无身份时返回业务码 401，HTTP 状态可能仍为 200。
- `basic/service/impl/AiChatServiceImpl.java`：保存会话并刷新缓存，返回 sessionId 字符串。提供方需真实可用，数据库等基础服务需启动。

请求示例：

```json
{ "provider": "BAILIAN_MODEL", "targetId": "qwen-plus" }
```

成功响应示意（sessionId 为实际后端生成值）：

```json
{ "rspCode": 0, "rspMsg": "操作成功", "data": "<sessionId>" }
```

## 开发代理与简化登录

`.env.development` 中 `/api` 被 Vite 转发至 `http://127.0.0.1:8080`，并改写为 `/ai/agent`。例如浏览器 `/api/ai/room/create` 转发到后端 `/ai/agent/ai/room/create`。可在 `.env.local` 覆盖 `API_PROXY_TARGET` 和 `API_PROXY_CONTEXT_PATH`；修改后重启 Vite。

当前后端没有开发测试认证接口。最小适配采用 **仅开发 Vite 代理注入固定测试身份**，没有新增后端接口或认证体系：

1. 复制 `.env.local.example` 为 `.env.local`。
2. 使用真实的开发测试用户 ID / 名称填写 `DEV_USER_ID`、`DEV_USER_NAME`，按需填写 `DEV_TENANT_ID`。
3. 设置 `DEV_IDENTITY_ENABLED=true`，重启 `npm run dev`。
4. Vite 从服务端变量读取身份，并编码为后端既有 `loginform`。仅 development + serve 生效；启用时强制目标为本机后端，开发服务保持 loopback 监听。不要使用 `--host` 对外开放此模式，不要对生产后端启用。

浏览器不能选择可信后端身份；代理会删除浏览器传来的 `loginform` 和 `tenantId`，再按显式配置注入固定身份。切换实际测试身份需要修改服务端配置并重启。登录页可选择或输入展示名称，只影响本标签页展示状态，不代表认证成功；这点在 UI 中明确提示。刷新保留展示状态，退出清除展示状态并回到登录页。退出不注销企业 Gateway 会话，企业 SSO 注销需使用实际 Gateway 的注销流程，本项目没有编造该接口。

如果需要浏览器选择真实身份，后续应在后端 local/dev profile 中单独设计受限测试适配，限定测试环境和允许的用户，并在生产配置中硬性禁用；本次没有新增这种接口。

## 生产部署

`npm run build` 输出 `dist/`。由 Web 服务提供静态文件，对前端 history 路由回退到 `index.html`，将 `/api/` 转发至已配置的 Spring Cloud Gateway；具体 Gateway 路径以部署配置为准。`.env.production` 的 `VITE_API_BASE_URL` 默认为 `/api`，可按实际 Gateway 修改后重新构建。

Gateway 必须验证真实会话并清理客户端传入的身份头，再注入可信 `loginform`；后端应只允许受信任 Gateway 访问。生产包不提供测试身份切换服务，不包含 DEV_USER_ID 等服务端变量。Axios 使用同源 Gateway Cookie（withCredentials），保留请求拦截器作为后续真实认证头扩展点。此项目的前端路由守卫只控制展示，访问权限必须由 Gateway/后端执行。

## 手工验收

1. 启动前端，访问开发服务，未设置展示用户时进入登录页。输入名称或选择默认开发展示用户进入工作台。
2. 切换五个菜单，AI 对话显示会话创建区域，其余菜单显示占位页；刷新和退出状态正常。
3. 启动真实后端及其依赖，配置开发代理测试身份（或通过已有 Gateway 会话访问），输入后端可用的 provider / targetId，提交并检查真实 sessionId。
4. 未配置身份时应展示业务 401 的 rspMsg。不可用的 provider 或 targetId 应展示后端真实业务错误。
5. 停止后端后提交，页面显示连接/服务器失败提示，按钮恢复可操作，不残留上一次 sessionId。相同错误短时间内只弹出一次 toast。
6. 生产部署必须通过真实 Gateway 认证；任意展示名称都不能获得后端权限。

自动化结果与限制见 [VALIDATION.md](./VALIDATION.md)。尚未进行真实后端数据库写入的成功联调时，不应将协议测试的示例 sessionId 当作真实结果。

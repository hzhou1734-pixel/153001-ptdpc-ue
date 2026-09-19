# 顾好家平台端管理后台 - 项目记忆

## 分支与推送策略（2026-09-19 起生效）
- 需求文档对照整改统一在分支 `feature/req-align` 开发，**不再推送 main 主分支**。
- 已配置 `.git/hooks/post-commit`：在非 main 分支提交后自动 `git push origin <当前分支>`；main 分支永不自动推送（保护 main，仅通过 PR/合并合入）。
- hook 用 `~/.ghj_publish_token` 内联 PAT 推送，推送失败仅警告不阻塞 commit。
- 切回 main 工作前需手动 `git checkout main`；合并用 PR 或 `git merge feature/req-align`。

## 本地预览
- 启动：`node node_modules/vite/bin/vite.js --host 0.0.0.0 --port 5173`（中文路径下 dev 模式可正常启动，但 optimizeDeps 预构建约 40s+ 才 ready，需耐心等待）。
- 访问：http://localhost:5173
- **协作约定（强约束）：每次修改代码后，必须用 present_files 在右侧内置浏览器预览面板打开 http://localhost:5173 核对效果**，确认 UI/交互无误再交付。dev server 未启动时先按上面命令拉起。
- 注意：本机 `vite build` 在 index.html 阶段会因中文路径 + html-inline-proxy 失败（仅 2 模块转换即中断），与代码无关；EdgeOne 云端构建不受影响。类型检查用 `node node_modules/vue-tsc/bin/vue-tsc.js --noEmit`。

## Git 环境注意
- Bash 工具默认 PATH 无 git，需先 `export PATH="/c/Users/zhou/.workbuddy/binaries/PortableGit/versions/1.2.0/mingw64/bin:/c/Users/zhou/.workbuddy/binaries/PortableGit/versions/1.2.0/cmd:$PATH"`。
- GitHub 直连间歇性重置/443 不可达，需重试或探测 `curl https://github.com` 连通后推送。
- 推送姿势：`TOKEN="$(<${HOME}/.ghj_publish_token)"; TOKEN="${TOKEN//[$'\t\r\n']}"; GIT_TERMINAL_PROMPT=0 git -c credential.helper= push "https://hzhou1734-pixel:${TOKEN}@github.com/hzhou1734-pixel/153001-ptdpc-ue.git" <branch>`。

## 项目本质
- 整个平台端是**前端 MOCK 原型**：业务数据全在 `src/mock/db.ts`，`src/api/ghj/*.ts` 读写 mock DB，无真实后端。菜单/页面/字段/操作可自由按需求文档重塑。
- 需求文档：`项目资料/1530-01-01 顾好家社区服务APP需求细化文档-平台端.docx`（8 大板块：账号登录、数据台、运营管理、用户管理、内容管理、系统设置、角色管理、管理员管理）。

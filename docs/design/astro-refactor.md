# Astro 工程重构

## 范围与实现

用户要求使用 Astro 项目结构，不手写独立 HTML 文件；没有要求改为 SSR。保留 Astro 5 的静态生成方式、全部既有 URL 和内容审核规则，`dist/` 由框架生成。

- 首页、目的地和费用页分别使用 HomeLayout、DestinationLayout、PricingLayout。
- 轮播、咨询卡片、报价清单和图片渲染各自是独立 `.astro` 组件，Props 由 TypeScript 定义。
- 主要营销文案从组件中提取到 `src/data/marketing`，组件不再包含整块三语对象。
- 浏览器逻辑移动到 `src/scripts`，通过 Astro 原生 `<script>` 入口构建；不引入 React 或全站水合。
- 图片采用 `astro:assets` 的 Image，源图用静态 import，生成 WebP 与 srcset。保留原 public 路径兼容历史内容。
- `src/lib/page-view.ts` 集中决定既有页面使用哪套布局，避免路由组件中堆积长条件表达式。
- 移除单文件预览生成器和自制静态服务器，使用 `dev:demo` / `astro preview`。
- 修复原有 Astro 检查问题：MDX render 类型、表单条件表达式中的注释、向导空节点及数据类型。
- 保留 4 秒自动轮播、暂停及减弱动效设置、咨询展开收起和清单复制行为。

## 使用的 Skills

已阅读并应用以下上游指引；未把未知安装器作为项目构建依赖。源码版本锁定如下，便于后续复查。

| Skill | 上游路径 | 阅读版本 |
|---|---|---|
| astro-framework | https://github.com/delineas/astro-framework-agents/tree/main/skills/astro-framework | 3e32c91cc433424e162472b81afaa5e9324669bb |
| frontend-design | https://github.com/anthropics/skills/tree/main/skills/frontend-design | dbd4588f9e1033efb41dad4bef2f7947c8993d44 |
| web-design-guidelines | https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines | 063bee94c3f4df8453406c830b0a7df0f2860278 |

Astro skill 的组件与图片参考页用于 Props、slot、图片 import 和图片组件实现。按实际功能采用轻量 TypeScript，不为纯内容增加客户端框架，也不为了使用 session 等条目改变渲染方式。

设计指引用于保持用户已确认的海岛、医疗摄影、短标题和三语视觉，而非重新套用另一套风格。Vercel 界面检查覆盖现有按钮语义、表单标签、图片尺寸、键盘操作、自动轮播暂停、减弱动效与状态提示。

webapp-testing 的上游说明已查阅；本环境缺少受支持的浏览器验收通道，因此没有声称已完成 Playwright 或截图验收。

## 验证

- `astro check`：0 errors、0 warnings；保留两条原有未使用参数提示。
- 单元与集成测试：63 项通过，包含新增的三语内容完整性、报价数据完整性和页面布局选择回归检查。
- 演示构建：50 页；54 个响应式 WebP 图片产物。
- 站内链接及页面审计：1,443 条链接，0 errors、0 warnings。
- 浏览器视觉与运行时交互尚待在实际 Astro 服务上验收。

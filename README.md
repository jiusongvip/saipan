# Saipan IVF · Astro 项目

Astro 5 + TypeScript + MDX。页面由 `.astro` 布局、组件和内容集合生成，不维护手写 HTML 页面，也不再通过单文件 HTML 查看网站。

已启用简体中文、繁体中文和英文。日文、韩文保留配置但暂未启用。现有内容发布、事实审核与表单接口规则继续保留。

## 本地查看

需要 Node.js 24+、pnpm 10.34.1。

```bash
pnpm install --frozen-lockfile
pnpm run dev:demo
```

打开终端输出的地址，通常是 `http://localhost:4321`。`dev:demo` 显示草稿页面，并隐藏审阅工具条，适合查看当前设计。请通过此地址测试导航、语言切换、轮播和表单界面。

普通开发（带审阅工具条）：`pnpm run dev`。

构建后使用 Astro 原生预览：

```bash
pnpm run build:demo
pnpm run preview
```

`build:demo` 只用于设计审阅。正式发布仍使用 `pnpm run build`，并遵循内容审核规则。Astro 自动生成的 `dist/` 是部署产物，不是手写源码，不提交到仓库。

## 工程结构

```text
src/pages/                     Astro 文件路由、站点地图
src/layouts/HomeLayout.astro    首页布局
src/layouts/DestinationLayout.astro
src/layouts/PricingLayout.astro
src/layouts/BaseLayout.astro    HTML 文档、SEO、页头与页脚
src/components/marketing/      HeroCarousel、ConsultationPanel、QuoteBrief、MarketingImage
src/components/                公共表单、导航、内容展示组件
src/data/marketing/            各页面三语文案、轮播数据与图片映射
src/assets/marketing/          通过 Astro Image 处理的图片源文件
src/scripts/                   轮播、咨询、报价清单、行前工具的 TypeScript
src/lib/page-view.ts           既有内容路径到布局的选择规则
src/styles/                    共享与页面样式
content/                       MDX 内容、审核信息、页面清单
data/                         事实数据、站点与渠道配置
tests/                        单元测试与集成测试
```

修改文案优先到 `src/data/marketing/`；修改交互到 `src/scripts/`；修改视觉到相应布局、组件及样式文件。

现有路由保留：英文与繁体的目的地、费用页面，以及简体对应的对比、费用文章，使用相同的营销布局，不引入未经审核的新页面。

## 检查

```bash
pnpm run check
pnpm run typecheck
pnpm run test
pnpm run build:demo
pnpm run links
pnpm run audit
```

`pnpm run format` 使用 Prettier 与 Astro 插件格式化 `src/`。

Astro Image 使用 Sharp 生成响应式 WebP；原始 `public/images` 路径保留，兼容现有 MDX 与分享图片地址。

## 发布与外部服务

- 生产构建只公开 `published` 内容；草稿和演示构建不应直接用作正式发布。
- 医生、价格、渠道和政策数据继续遵守原有核验规则。
- 咨询卡片提供站内咨询入口，尚未接入真实在线客服。
- 未配置并核准联系 API 时，不发送真实表单请求。
- GA4 仍由同意状态与事件白名单控制。

本次重构采用的 skills、对应源码版本及验收记录见 `docs/design/astro-refactor.md`。

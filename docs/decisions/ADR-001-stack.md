# ADR-001：技术栈基线

- 状态：**proposed**（待项目负责人确认为 accepted）
- 日期：2026-10-13
- 决策方：项目负责人（待确认）；起草：P0 内容/合规 Agent
- 依据：开发文档 2.1（建议技术栈）、2.2（仓库目录）、2.3（URL 与语言规则）、8.1（必须自动化的检查）、13.1（构建级发布闸门）、13.6（上线与回滚）
- 关联事实：`fact-register.csv` 中 `inst-primary-domain-control`（DNS/托管/验证权限 obtained:no）

## 背景

项目是五语（zh-hant / zh-hans / en / ja / ko）多语言内容型获客静态站，首版目标规模 165 页，内容必须先经事实与法律审核才可发布。要求：静态生成、MDX 内容、边缘托管、表单不自建后端、可自动化校验 SEO 与内容状态。

## 决策（基线）

| 层 | 选择 | 理由 |
|---|---|---|
| 框架 | Astro 5 + TypeScript | 内容型多语言静态站的成熟方案；零默认 JS 输出有利首屏 < 2 秒目标（文档 2.1、7.4）；`src/pages/[...slug].astro` 单路由即可承载 165 条 manifest 路径 |
| 内容 | MDX（`@astrojs/mdx`） | frontmatter 可承载 `lang/path/translation_key/template/status/reviewed_*/fact_sources/required_sections/primary_cta/noindex` 等审核字段（文档 3.1），并支持构建级 schema 校验 |
| SEO | `@astrojs/sitemap` + 自建 `scripts/validate-seo.ts` | 需分语言 sitemap 与 sitemap index、canonical/hreflang 自动校验（文档 2.3、7.2、8.1） |
| 包管理 | pnpm（lockfile 入库） | 文档 2.1 建议；仓库已存在 `pnpm-lock.yaml` 与 `packageManager` 声明，一致性最好 |
| 样式 | CSS 变量 + CSS Modules，无大型 UI 框架 | 文档 2.1 明确避免大型 UI 框架；对比表、日程表、费用表需自定义排版（7.4 桌面端优先）；`src/styles/tokens.css` 承载设计 token |
| 部署 | Cloudflare Pages（静态边缘托管）+ `_redirects` | 文档 2.1 指定；`_redirects` 可承载旧域 301 与新站路径规则；无尾斜杠规范化需在托管层验证 |
| 校验 | `astro check` + `scripts/validate-content.ts` / `validate-entry-policy.ts` / `validate-seo.ts` / `check-links.ts`（`tsx` 执行） | 覆盖文档 8.1 的 15 项自动化检查；发布闸门做成构建级限制（13.1） |
| 分析 | GA4 + GSC，同意机制待法律确认 | 文档 2.1、6.4；`analytics-consent-policy` obtained:no，同意机制未定前不默认采集 |
| 表单 | 复用集团 `POST /api/contact`，前端不接飞书、不暴露密钥 | 文档 2.1；契约见 ADR-002（BLOCKED） |

## 备选方案与被排除原因

- Next.js / Nuxt：需要更多运行时与数据层约定，本站无服务端个性化需求，且文档 2.1 建议静态生成优先。
- 传统 CMS（首版采购）：文档 1.3 明确首版不采购 CMS，内容走 Git + Markdown/MDX + PR 审核。
- Tailwind / 组件库（shadcn、Chakra 等）：与文档 2.1 "避免引入大型 UI 框架" 冲突；设计 token 以 CSS 变量落地即可。
- 自建表单后端 / 直接对接飞书多维表格：违反"表单不自建后端"和密钥暴露禁令。

## 后果

正面：

- 构建期即可拒绝未审页面进入 sitemap，降低合规风险；
- 单一 manifest + 结构化数据文件（entry-policy/flight-routes/contact-channels/site-config）让五语共享事实只有一个来源；
- 输出纯静态，托管与回滚成本低，利于逐页 301 验证。

负面与代价：

- 165 页 × 5 语的 hreflang/canonical/sitemap 需要自建校验脚本，前期工程投入较大；
- MDX frontmatter schema 必须与模板同步演进，否则批量写页时返工（先以 5–8 个代表页试点，文档 13.11）；
- 无 UI 框架意味着表格、表单、语言切换器等组件需自研并做可访问性验证（7.4）。

## 变更成本（若要换栈）

| 变更项 | 成本 | 说明 |
|---|---|---|
| 换框架（Astro → Next 等） | 高 | 需重写路由、metadata、sitemap、`_redirects` 与全部校验脚本；URL/canonical/hreflang 规则必须逐条回归验证，165 页路径不变但构建层全换 |
| 引入 UI 框架 | 中 | 与文档 2.1 冲突，需新 ADR；设计 token 迁移 + 首屏性能重测 |
| 包管理器换 npm/yarn | 低 | 需重生成 lockfile 并更新 CI 与文档；不改变内容模型 |
| 换托管平台 | 中 | 需重配无尾斜杠规范、301 规则、环境变量与预览环境；`_redirects` 语法差异要逐条重测旧域映射 |
| 采购 CMS | 高 | 内容模型、PR 审核流程、发布闸门与审核矩阵都要重做，属范围变更（文档 1.3） |
| 新增运行时依赖 | 中 | 与"不擅自更换技术栈、不依赖未写进仓库的本机状态"（0.1）冲突，须先记录 ADR |

## 未决与阻塞

1. Cloudflare Pages 账号、`saipanivf.org` 的 DNS/SSL/托管与验证权限归属尚未确认（`inst-primary-domain-control` = obtained:no）。
2. 集团表单 API 契约未确认（ADR-002 = BLOCKED）。
3. CI 环境与密钥（GSC/GA4 token、部署 token）需由上线负责人提供，见 `docs/operations/raci.md`。
4. Astro/pnpm 版本基线以仓库现有 `package.json` / `pnpm-lock.yaml` 为准；本次未运行任何安装或构建命令（依赖由并行进程安装中）。

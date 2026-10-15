# ADR-003：内容发布闸门（构建级）

- 状态：**proposed**（已在代码中实现，待项目负责人确认）
- 日期：2026-10-13
- 决策方：项目负责人（待确认）；起草：P0–P2 工程 Agent
- 依据：开发文档 0.1 第 4/6 条、3.2（发布流程）、8.1 第 3 项、12（草稿/未审核页不得进入生产 sitemap）、13.1（明确内容发布闸门）
- 关联文件：`src/lib/config.ts`、`src/lib/content.ts`、`src/lib/page-rules.ts`、`scripts/validate-seo.ts`、`tests/unit/seo.test.ts`

## 背景

原方案强调「院方审核后才发布」，但没有把审核状态做成工程约束。风险场景很具体：内容同事把 draft MDX 合进 main，托管平台自动构建生产站点，未审核的医疗/入境/价格文案就直接对外，且在 Google 留下索引。人工纪律挡不住这种事故，必须在构建层拒绝。

## 决策

1. **状态与渲染解耦，生产只认 `published`。**
   `rendersInThisBuild(status)`：`published → true`；`retired → false`；`draft/review/approved → 仅当 includeDrafts`。
   `isLivePage(status)` 同样只认 `published`，决定 sitemap、hreflang 互指与「可被生产页链接」。
   approved **不等同上线**：仍须通过工程校验与机构/法务签核后才改 published（刻意保守，符合 3.2）。
2. **开关只有一个，且默认关闭。**
   `includeDrafts = DEV || process.env.INCLUDE_DRAFTS === '1'`。生产流水线不注入该变量；`pnpm run build:preview` 是唯一带它的命令。读取用 `globalThis.process` 并配可选链，既避免被构建期静态替换，也让 tsx 环境（无 `import.meta.env`）可导入同一模块。
3. **闸门不止在路由层。**
   - sitemap：`src/lib/sitemap.ts` 只枚举 live 页；`validate-seo.ts` 直接解析 `dist/` 产物，发现 sitemap 列出非 published / noindex / 未启用语言的页面即报错。
   - 内链：`navItemsForLang()`、`breadcrumbsFor()`、`languageHomeIfBuilt()`、`ctaHref()` 全部只从「本次构建可见页」推导；落点不存在时链接宁可不渲染，而不是留下 404 或空锚点（`src/lib/cta.ts`，单测覆盖三种回退）。
   - 结构化数据：`organizationJsonLd()` 在品牌正式名称未确认时返回 `null`，整段不输出。
   - 事实：入境/航线/渠道/医生/价格只渲染 `verification_status: verified` 且新鲜度合格（入境类 31 天）的记录。
4. **规则单一来源。** `src/lib/page-rules.ts` 被 MDX schema 的 `superRefine` 与 `scripts/validate-content.ts` 共用，构建期与校验期不可能给出不同结论。

## 备选方案

| 方案 | 否决原因 |
|---|---|
| 靠 PR 审查 + 人工确认状态 | 正是文档 13.1 指出的漏洞：一次误合并即事故，且无法回溯 |
| 生产渲染 approved（把 approved 当作可发布） | approved 只代表内容审核通过，未包含法务/机构事实与工程校验；文档 3.2 明确两者不同步 |
| 运行时按域名/环境变量过滤 HTML | 静态站没有运行时；且草稿文案仍会出现在构建产物里，可能被缓存或抓取 |
| 草稿输出到独立预览域名+robots 屏蔽 | 可作为托管层增强，但不能替代闸门：生产构建仍需自证不含草稿。当前用 `INCLUDE_DRAFTS=1` 构建 + 不指向生产域名达成同等效果 |

## 后果

**正面**

- 未审内容进入生产的路径全部被代码封死，误操作最多让预览构建多几页。
- 「生产构建只有 2 个页面（根选择页 + 404）」成为可见事实，而不是被 165 页假象掩盖。
- 校验器与单测可复现：`pnpm run ci` 目前 0 error（0 个 published 页时 sitemap/hreflang 检查自动通过）。

**代价与约束**

- 内容审核必须真推进：闸门收紧后，approved 仍需人工改 published 才上线。发布流程要在 P2 后半段与运维确认由谁、在什么凭据下改状态。
- 预览与生产是两次构建（两次耗时约 2.5s），不能用同一 dist 兼两职。
- `INCLUDE_DRAFTS=1` 一旦被误配到生产托管，草稿会立即上线 → 部署阶段必须由 ADR/环境变量清单显式声明「生产 secrets 不含 INCLUDE_DRAFTS」，并在上线检查清单加一条验证项。
- 空锚点/断链防护依赖「从已构建页推导」，意味着新增页面时导航与 CTA 会自动出现，无需改代码；但也意味着导航顺序由 `NAV_SPEC` 优先级表控制，改动需同步设计文档。

## 需要项目负责人确认

1. approved → published 的变更权限与操作人（见 `docs/operations/raci.md`，当前该角色登记为 pending）；
2. 是否需要独立 staging 预览域名（若需要，本 ADR 的预览构建方式改为分支预览，闸门不变）；
3. 生产流水线环境变量白名单，确认不含 `INCLUDE_DRAFTS`。

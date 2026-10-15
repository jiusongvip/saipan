# 塞班生殖中心官网（saipanivf.org）

五语（zh-hant / zh-hans / en / ja / ko）静态获客与预约转化站。Astro 5 + TypeScript + MDX，内容先经事实与法律审核才进入生产构建。

**当前状态：P0/P1/P2 工程框架已完成，站内 0 页上线。** 172 页清单（165 冻结值 + 2 行经批准的科普 hub 结构页 + 5 行经批准的工具层，偏差见 STATUS.md）已冻结在 `content/page-manifest.csv`，仓库内只有 38 个草稿骨架页；所有医疗、入境、价格、渠道、医生事实均为「待院方书面确认」，缺事实的位置在生产构建中不渲染。执行状态见 `docs/handoff/STATUS.md`。

## 环境

| 项 | 值 |
|---|---|
| Node | v24+（本机 `node -v` 实测 v26.3.0） |
| 包管理器 | pnpm 10.34.1（`packageManager` 已锁定，lockfile 必须提交） |
| astro | 5.18.2 |
| @astrojs/mdx | 4.3.14 |
| typescript | 5.x |
| tsx | 4.23.15 |
| yaml | 2.9.1（校验脚本读 frontmatter） |

```bash
pnpm install --frozen-lockfile
```

## 命令

```bash
pnpm run dev              # 本地开发：等同预览，草稿页可见
pnpm run build            # 生产构建：只渲染 published（当前为 0 个内容页）
pnpm run build:preview    # 预览构建：INCLUDE_DRAFTS=1，草稿也渲染
pnpm run preview:serve    # 最小静态服务器托管 dist/（无尾斜杠 URL、目录 index、404 回落）
pnpm run typecheck        # tsc --noEmit
pnpm run validate         # 内容/政策/数据/SEO/风险话术五套校验
pnpm run test             # tsx --test 单元测试
pnpm run links            # 以 dist/ 为准的站内链接与锚点检查
pnpm run ci               # typecheck → 内容/政策/话术校验 → 测试 → build → SEO → links → audit
```

单步：`pnpm run validate:content`、`validate:policy`（入境政策 + 数据）、`validate:seo`、`validate:claims`。

## 目录

```text
content/            页面内容：page-manifest.csv（172 行：165 冻结值 + 2 行科普 hub 结构页 + 5 行工具层）+ {lang}/**.mdx
data/               事实数据：site-config / entry-policy / flight-routes / contact-channels / programs / doctors
src/lib/            纯逻辑：config（闸门）content（取页与导航）seo facts（事实闸门）
                    forms validation（表单契约）analytics（GA4 白名单）page-rules（内容规则）claims（风险话术）cta（落点解析）
src/components/     Header Footer LanguageSwitcher PrimaryCTA FloatingCTA ContactForm MessagingLinks
                    EntryPolicyTable FlightTable FactSlot ProgramCard ProgramIndexList DoctorCard FAQList
                    Breadcrumbs SourceNote DraftBanner ConsentNotice
src/layouts/        BaseLayout（head/SEO/脚本）LandingLayout（落地页+表单）ContentLayout（正文页）
src/pages/          index.astro（语言选择）404.astro [...slug].astro（manifest 路由）sitemap-index.xml.ts sitemaps/[lang].xml.ts
src/styles/         tokens.css（唯一 token 定义处）global.css components.css
scripts/            校验器与测试辅助（tsx 运行，不得 import 依赖 import.meta.env 的模块）
tests/unit/         48 个断言：内容规则、SEO/hreflang、表单契约、事实闸门、CTA 落点、风险话术
tests/integration/  表单管道集成测试（validate → buildPayload → cleanParams 组合契约）
tests/e2e/          E2E 验收规划（待浏览器运行器批准后落地，见目录内 README）
docs/               合规、内容、决策、运营、SEO、规格与交接文档
```

## 三条硬规则（工程实现，不靠人工记律）

1. **发布闸门**：`rendersInThisBuild()` 在生产构建只放行 `published`。approved 仍不算上线（须通过工程校验后才发布），所以误操作无法把未审 MDX 带进生产。详见 `docs/decisions/ADR-003-content-publish-gate.md`。
2. **事实闸门**：`src/lib/facts.ts` 只渲染 `verification_status: verified` 且（入境类）31 天内复核过的记录；缺事实时生产不输出、预览输出 `.pending-slot`。品牌正式名称、邮箱、电话、账号、医生、价格区间同理，全部来自 `data/*.json`，代码内不写字面值。
3. **内容规则**：`src/lib/page-rules.ts` 一份定义，MDX schema（`superRefine`）与 `scripts/validate-content.ts` 共用；路径、语言、CTA、程序页六问、noindex、审核字段等不符即构建失败。

## 站内外链接

- 域名只用 `saipanivf.org`；`sivf-asia.com` 处置未决前站内零引用（`validate-data` + `check-prohibited-claims` 双重拦截）。
- URL 无尾斜杠（根路径除外）；语言前缀 `/zh-hant|zh-hans|en|ja|ko`；ja/ko 未启用时不参与路由、hreflang、sitemap。
- 所有 CTA / 语言切换 / 导航链接都由「本次构建里真实存在的页面」推导，落点不存在时宁可不渲染链接，见 `src/lib/cta.ts`。

## 表单与分析

集团 `POST /api/contact` 契约未确认（`docs/decisions/ADR-002-api-contract.md` 为 BLOCKED）：未配置 `PUBLIC_CONTACT_API_URL` 时不发任何请求，生产构建下表单区块改为提示使用联络渠道。GA4 只在访客同意后加载，事件参数走白名单，表单内容与任何 PII 一律不上报。规格见 `docs/forms/form-spec.md`、`docs/analytics/event-spec.md`。

## 验收清单（每阶段必跑）

```bash
pnpm run ci && pnpm run build:preview && pnpm run preview:serve
```

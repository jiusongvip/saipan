# 设计系统（P1 交付物）

对应开发文档 4.1–4.3、7.4。实现层只有三个文件：`src/styles/tokens.css`（唯一数值定义处）、`global.css`（排版与可访问性基线）、`components.css`（实测 90 条规则、64 个类名；科普文章卡片复用既有 `.card`/`.card__title`/`.card__body`/`.card__meta`/`.grid-cards`/`.cta-secondary`，本轮未新增类）。**组件内不得写死颜色、字号、间距**，需要新值时先加 token。

## 1. Token

| 组 | 变量 | 说明 |
|---|---|---|
| 墨色 | `--color-ink` `#0e2233` / `--color-ink-muted` `#3d5771` / `--color-ink-soft` `#5b7186` | 正文 / 次要文字与表单说明 / 来源注记与待核槽位（最小字号档）；`--color-ink` 同时是页脚底色（深藏青） |
| 面 | `--color-surface` `#fff` / `--color-surface-alt` `#f1f5f9` / `--color-surface-warm` `#f7f1e3` | 分区交替底色；`-alt` 冷蓝灰、`-warm` 浅沙金（hero 渐变起点） |
| 线 | `--color-line` `#d7e1ea` / `--color-line-strong` `#aec0d1` / `--color-line-field` `#6c8296` | 分隔线 / 装饰性区块边框 / **交互控件描边**（输入框、次级按钮、下拉、导航开关） |
| 主色（蓝） | `--color-primary` `#1a5f9e` / `-strong` `#0d4471` / `-soft` `#e4eefa` | 主 CTA、链接、导航下划线、信息条 |
| 强调（金） | `--color-accent` `#8a6516` / `-soft` `#f6ead0` | 链接 hover、焦点描边、hero 眉标、页脚上沿 3px 实线、首图外框 |
| 语义 | `--color-success/warning/danger` + `-soft` | 表单状态、草稿横幅 |
| 字体 | `--font-sans`（Noto Sans TC/SC → 系统中文）/ `--font-serif` | 未采购 Web 字体：五语字重与授权未确认，先用系统栈 |
| 字号 | `--text-xs…--text-3xl`、`--text-hero: clamp(2rem, 1.4rem + 2.6vw, 3.1rem)` | hero 用流式缩放 |
| 行高 | `--leading-tight 1.25` / `--leading-body 1.7` | 长正文 1.7 |
| 间距 | `--space-1…--space-8`（0.25→4rem） | 只允许这 8 档 |
| 圆角/阴影 | `--radius-sm/md/lg/pill`、`--shadow-sm/md/lg` | 阴影色随 `--color-ink` 调为 `rgba(14,34,51,…)` |
| 布局 | `--container 1140px`、`--container-narrow 760px`、`--header-height 68px` | 正文页用 narrow |
| 层级 | `--z-header 40`、`--z-floating 30`、`--z-consent 50` | |
| 触控 | `--tap-target 44px` | 所有可点元素最小 44px |

配色口径：**蓝负责专业与安全**（主按钮、链接、页脚、导航状态），**金负责引导与温度**（hover、焦点、眉标、首图外框），**白与浅蓝灰负责可读**（正文区底、卡片）。原「青绿 `#16697a` + 陶土 `#af6232`」方案已于 2026-10-13 整体替换，替换后 19 组配对全部重算（见 1.1）。

### 1.1 颜色对比度（实测锁定）

全部色值按 WCAG 2.1 相对亮度公式在 `scripts/audit-dist.ts` 内实算，每轮 `pnpm run audit` 对**当前真正成对使用**的前景色/背景色逐条判定；实测表见 `docs/testing/audit-report.md` 第 1 节（当前 19 组，全过）。

| 口径 | 阈值 | 当前最低实测 |
|---|---|---|
| 正文与说明文字 | ≥ 4.5:1 | 4.72:1（`--color-accent` 金字于 `--color-surface-warm`，即 hero 眉标） |
| 交互控件描边、焦点环、非文本 UI | ≥ 3:1 | 3.64:1（`--color-line-field` 于 `--color-surface-alt`） |

四条规则约束了取色方式：

1. 金只能取**深金/古铜**：`--color-accent` `#8a6516` 同时承担 `a:hover` 文字（白底 5.31:1）、hero 眉标（压在 `--color-surface-warm` 渐变上 4.72:1）与 3px 焦点描边（`global.css:73`）。更亮的金（`#9c7512` 一档）在白底只有 4.23:1，做不了正文级文字，因此站内**亮金只出现在非文字装饰**：首图外框用 `--color-accent-soft`、页脚上沿 3px 实线。
2. 蓝要能托白字：`--color-primary` `#1a5f9e` 白字 6.62:1、`-strong` `#0d4471` 10.08:1，所以主按钮与反白区块用蓝而不是金。
3. 输入框、下拉、次级按钮、导航开关的描边用 `--color-line-field` `#6c8296`；`.banner`、`.pending-slot`、`.consent` 等**纯装饰分隔**仍用 `--color-line-strong`，不参与 3:1 判定，避免为了过阈值把整站边框一律加深。
4. 只断言已在 CSS 中实际配对出现的组合，不给"可能出现"的组合预留规则；新增配对（如金字压暖色渐变）必须同时把该组合加进 `audit-dist.ts` 的 `PAIRS`。

暗色模式：`prefers-color-scheme` 显式锁 `color-scheme: light`。首版不做暗色适配（未经设计评审的暗色对比度不达标）。

断点：`900px`（导航收合、栅格降列）、`860px`（表格外层滚动）、`700px`（hero 单列、卡片单列）。移动端导航用纯 CSS（`checkbox#nav-toggle` + `.site-nav`），无 JS 依赖。

≤900px 的头部规则（文档 8.1 第 6 项「移动端不横向溢出」）：`.site-header__inner` 允许换行、品牌名可折行并降到 `--text-base`、待核徽章按内容宽度自然换行、`.header-tools` 用 `margin-left: auto` 保持右对齐，折叠菜单面板用 `inset: 100% 0 auto` 跟随**实际**头部高度（不能用 `--header-height` 常量：头部一旦换行，固定值会让面板盖住菜单）。验收方式是逐档宽度实测 `scrollWidth - clientWidth`（320/390/768/1280 四档 × 全部产物必须为 0），不是目测。

卡片栅格同理：`.grid-cards` 的轨道下限写成 `minmax(min(100%, 260px), 1fr)` 而不是 `minmax(260px, 1fr)`。科普 hub 的卡片列表落在 `container--narrow` 内，320px 视口下可用宽度只有 209px，固定 260px 下限会让卡片撑出 3px 横向溢出（实测发现并修复）；`min(100%, …)` 只在窄栏生效，宽屏排布不变。

## 2. 页面骨架

| 区块 | 规则 |
|---|---|
| skip-link | 每个页面第一个可聚焦元素 → `#main` |
| DraftBanner | 非生产构建且页面为 draft/review/approved 时显示状态、阻塞原因与可切换语言；生产不输出 |
| Header | 品牌 + 主导航 + 语言切换器 + `book_consult` 次级按钮；sticky。导航项由 `NAV_SPEC` 生成：`requiresTemplate` 的入口（科普 hub）在本次构建该语言没有可见内容页时**整项不输出**，不留下点进去是空的入口 |
| Hero | 最多 1 个主 CTA + 1 个文本式次级动作；信任证据条最多 2 条，且只有 `status=published` 且有 `fact_sources` 才显示原文，否则标注「待院方书面确认」 |
| Section | `.section` / `.section--alt` 交替底色；标题层级 h1→h2→h3 不跳级 |
| ContactForm | 落地页与正文页底部（`contact_success` 除外） |
| MessagingLinks | 渠道区块 `#messaging`，只有 `verified` 且 `enabled` 的账号才输出链接 |
| FloatingCTA | 滚动 35% 后出现，指向 `#consult`；表单或系统控件进入视口时让位；`contact_success`、根选择页、404 不渲染 |
| Footer | 渠道 / 品牌与联系方式 / 隐私声明 + 非医疗建议、非法律意见两条固定免责声明 |

## 3. 组件契约

| 组件 | 输入 | 渲染条件 |
|---|---|---|
| `PrimaryCTA` | `lang cta pageType pagePath variant hasForm homePath href?` | 落点不存在（`ctaHref()` 返回 null）时整个组件不渲染 |
| `LanguageSwitcher` | `lang currentPath translationKey` | 只列本次构建中真有页面的启用语言；无同 `translation_key` 页时回退该语言落点 |
| `ContactForm` | `lang pageType pagePath ctaLabel variant` | 生产构建且无 `PUBLIC_CONTACT_API_URL` 或无可渠道时，只渲染 `form.no_api` 提示，不渲染表单 |
| `FactSlot` | `lang slot` | 已核验→值；未核验→生产/演示不输出，仅审阅外壳显示 `.pending-slot`（见 4.1） |
| `EntryPolicyTable` | `lang nationalitySlots` | 槽位缺 verified 记录时同上处理 |
| `FlightTable` | `lang` | 只显示 verified 航线 |
| `ProgramCard` / `ProgramIndexList` | 方案对象 / `lang` | 停留天数与价格区间只在 `medical_review_status=approved` 且 `institution_fact_status=verified` 时出现 |
| `ArticleCard` | `lang page` | 标题（指向文章）+ `description` + 「繼續閱讀」；`page.status !== 'published'` 时只在审阅外壳显示 `common.pending_fact`。文章可见性口径见 3.1 |
| `ArticleIndexList` | `lang` | 用 `visibleArticles()` 即时生成本次构建可见的科普文章卡片；无可见文章时整块不渲染（hub 不出现空列表，也不硬编码篇数） |
| `Breadcrumbs` | `lang page` | 上级面包屑取 `navLabelKeyFor()` 的**导航短标签**（如「就醫科普」）而不是页面长标题，避免面包屑把 hero 级标题重复一遍；层级不足两级时整块不输出 |
| `DoctorCard` | 医生对象 | 执照号、照片授权未 verified 时不渲染姓名与照片 |
| `SourceNote` | `label url lastVerified` | 有来源才显示；显示「最后核对日期」 |
| `ReviewOnly` | 子内容 | 仅审阅外壳渲染；演示与生产不输出 |
| `FactGate` | `need('flights'\|'entry') nationalitySlots?` | 对应事实记录为空时整块（含所属 `<section>`）不渲染；审阅外壳始终渲染 |
| `MessagingLinks` | `lang pageType pagePath title?` | 无 verified 渠道时整块不渲染（审阅外壳下显示 `messaging.none_ready` 兜底语） |
| `ConsentNotice` | `lang` | 未同意前不加载 GA4、不上报任何事件 |

### 3.1 科普入口（hub）与文章列表

- **唯一可见性口径**：`src/lib/content.ts` 的 `visibleArticles(pages, lang)` = `buildVisible()` 过滤 `template === 'article'` 后按路径排序。导航入口（`NAV_SPEC` 里 `requiresTemplate: 'article'`）、hub 卡片列表（`ArticleIndexList`）与面包屑上级都从这一处取值，因此生产构建（0 篇可见文章）不会渲染出科普入口，也不会在 hub 上留空列表。
- **不做文章篇数与排序的第二套定义**：hub 文案不写「本站有 N 篇文章」，卡片数随构建结果变化。
- **路径复用清单已保留的 `/{lang}/articles/{slug}`**：hub 用父段 `/zh-*/articles`，所以面包屑上级天然存在，无需新增路由；`article_index` 只是第 17 个模板枚举值。

## 4. 文案与本地化

- UI 字符串全部走 `t(lang, key)`（`src/lib/i18n.ts`，当前 139 键 × 3 语；ja/ko 未写，属 P3 前置条件）。缺键时返回键名本身，便于当场发现，绝不静默回退到别的语言句子。键数由 `tests/unit/facts.test.ts` 做三语 missingKeys/extraKeys 对账，新增键必须在三语同时给值（科普入口用了 `nav.articles`「就醫科普／就医科普／Guides」与 `articles.read`「繼續閱讀／继续阅读／Read the guide」）。
- 页面正文一律在 MDX 内撰写，**简中独立撰写而非繁中转换**；`check-prohibited-claims` 会用简化字/繁体字独占字集检测混排（zh-hant 混入简化字=错误，zh-hans 混入繁体字=警告）。
- 禁用话术（包成功、保证怀孕/性别、可选性别、无口径成功率数字、最高级形容词、FDA/美国标准、先进设备、落地即入籍、供卵库存、免签保证、规避法律、稀缺倒计时营销）由 `src/lib/claims.ts` 的 13 条规则扫描全部渲染面，命中即构建失败。
- 未确认事实的统一占位语：`common.pending_fact` =「待院方书面确认」。
- **面向用户的文案不写工程自述**：正文与 `description`/`hero` 里不得出现「本页面尚未接入 API」「数据在 `data/*.json`」「待登记到 `docs/compliance/fact-register.csv`」「P3 前置条件」「草稿框架」这类实现口径；确需说明缺口时写进 `<ReviewOnly>`。无事实可写时，用**范围与流程**描述把段落写实（怎么做评估、包含哪些环节、由谁书面确认），不靠占位语凑版面，也不补写数字。

### 4.1 审阅外壳（review chrome）与三种构建

审计性标注（DRAFT 横幅、逐槽位「待院方书面确认」、来源待登记提示、未启用语言说明、表单未接入提示）属于**审阅工具**，不是成品文案，因此由 `src/lib/config.ts` 的 `reviewChrome` 单点控制：

```ts
export const reviewChrome: boolean = includeDrafts && process.env.REVIEW !== '0';
```

| 命令 | 变量 | 页数（当前） | 外壳 | 用途 |
|---|---|---|---|---|
| `pnpm run build` | 无 | 2 | 无（生产恒 `false`） | 只含 `status: published` 页；草稿不进 sitemap/导航/槽位，**科普导航入口随可见文章为 0 而整项不输出** |
| `pnpm run build:preview` | `INCLUDE_DRAFTS=1` | 31（29 篇草稿 + 根选择页 + 404） | 有，实测 52 处 `.pending-slot` + 55 处 `class="banner"`（分布在 29 个草稿页） | 内部核对缺口，逐页看还差哪份书面确认 |
| `pnpm run build:demo` | `INCLUDE_DRAFTS=1 REVIEW=0` | 31 | 0 处（`pending-slot`/`class="banner"`/`DRAFT`/`待院方`/`docs/compliance`/`fact-register`/`尚未接入`/`保持空白` 全字符串实扫为 0） | 对外演示：草稿可见但页面渲染为成品面貌 |

- 渲染点：`DraftBanner`、`FactSlot`、`SourceNote`、`DoctorCard`、`EntryPolicyTable`、`FlightTable`、`ProgramCard`、`MessagingLinks`、`ContactForm`、`Header`/`Footer` 的待确认位、`LandingLayout` 的 trust items、根选择页的 P3 说明，全部改成 `reviewChrome` 判定；MDX 里的审阅备注写在 `<ReviewOnly>`（`src/components/ReviewOnly.astro`）内，演示与生产构建不输出。
- **区块级门控（`FactGate.astro`）**：内容完全来自事实记录的区块（航线表、入境条件表）在没有可发布记录时**整块不渲染**，而不是留下「标题 + 一段说明 + 空表格」的空壳。MDX 写法：`<FactGate need="flights">…section…</FactGate>`、`<FactGate need="entry" nationalitySlots={[…]}>`；审阅外壳下仍显示，以便逐条核对缺口。
- **不留指向缺失内容的文案**：`MessagingLinks` 在没有任何可用渠道时整块（含 `<h2>`）不渲染，因此表单错误提示、提交成功页与页脚文案不再写「请使用页面下方的其他联络方式」；数据区块的说明文字不再写「列于下表」。新增/改写文案时需按 `dist/` 实际渲染面复核（本轮以 DOM 扫描 `其他聯絡方式`/`another contact channel`/`下表` = 0 为验收口径）。
- **与发布闸门正交**：`reviewChrome` 只控制标注，不控制页面是否进入构建；`INCLUDE_DRAFTS` 仍是草稿可见性的唯一开关，生产构建两者皆为 `false`。
- **未核验事实在任何构建都不渲染**：这条不随外壳开关变化。未 verified 的成功率、价格、医生姓名与照片、航线、入境条件、hero `trust_items` 一律整块不出现——演示构建只是不再显示「此处待确认」的提示，绝不因此补写事实。
- 缺数据时页面靠**范围与流程**支撑（例如入境页的「您的条件怎么确认」四步：护照与日期→查官方来源→具名顾问覆核→出发前再查对），这类内容描述我方可控流程，不属于院方事实，因此可以写实；不得写成承诺时限或结果。
- 读取方式：`reviewChrome` 通过 `globalThis.process.env` 取值，避免 Vite 静态替换把布尔量固化到客户端模块图。

## 5. 可访问性与性能

- 语义地标：`header/nav/main/footer`、`aria-current="page"`、`aria-labelledby`、`role="status" aria-live="polite"`（表单反馈）。
- 折叠控件用原生 `details/summary`（导航分组、语言切换器），移动端菜单用 `checkbox + label`，均可纯键盘操作。
- 焦点：`:focus-visible` 保留可见轮廓；语言切换器支持 focus 与 hover 两种展开路径。
- 零必需 JS：静态 HTML 完成导航与菜单；脚本仅 3 个模块（表单、同意提示、事件计数），未同意时不加载第三方。
- 图片：`loading="lazy"`（首屏 hero 用 `eager`）+ 显式 `width/height`；`alt` 走 i18n 字典，不写死在模板里。
- 未验证项：真实 Lighthouse/CrUX 性能数据（12 上线清单要求）——需在预览站点对已发布页实测后补录。

### 5.1 首图（hero 素材）

| 项 | 现状 |
|---|---|
| 文件 | `public/images/saipan-lagoon-aerial.jpg`，640×358，实测 26,763 B（`pnpm run audit` 第 2 节「本地资源体积」逐轮复量）；旧素材 `saipan-marianas-sts103.jpg` 已不再被引用，暂留 `public/images/` 未删 |
| 内容 | 航拍视角的塞班岛海岸：白色沙嘴伸入绿松石色浅潟湖，岸侧为海岸林与红顶建筑（画面无可定位地标，文案不指具体海滩名、不指方位） |
| 来源 | 用户 2026-10-14 提供的企业微信截图（原文件 725×405 PNG，742,738 B，无 EXIF/ICC）；开发侧离线缩至 640 宽等比 → 640×358，mozjpeg quality 72、progressive，未裁剪未拉伸 |
| 授权 | 由用户指定为首页首图；拍摄者与商用授权链**未书面确认**，因此站内**不写来源题注**（`hero.image_credit` 键已删除），避免代写无法核验的授权结论 |
| 渲染 | `src/lib/config.ts` 的 `heroImage` 是唯一路径来源，现由 `LandingLayout.astro`（各语言落地页）与 `pages/index.astro`（根首页首屏右栏）共用；落地页可用 frontmatter `hero.image` 覆盖，覆盖图**必须同为 640×358**（`width/height` 按此写死，比例不符会变形） |
| 版式 | `.hero-figure` 限宽 640px 并居中：单列断点下不放大糊图；图片直接呈现，不加描边、外框线与阴影，且无题注行 |
| 边界 | 首图是**目的地装饰**，不承载医疗、法律、入境、价格、成功率等任何事实主张，因此不受 ADR-003 发布闸门约束；图上任何文字性说明（如题注）属对外文案，只允许写可核验的来源信息——无核验来源时宁可不写 |

### 5.2 根首页（`/`，简体营销版）

| 项 | 现状 |
|---|---|
| 定位 | 用户 2026-10-14 拍板：根路径直接渲染**简体中文**营销首页（老板预览图导向），其余语言首页仍在 `/<lang>`，内页、Header、Footer、共享组件不跟着改版 |
| 视觉 | 首屏右栏放**一张**照片：`heroImage` 指向的塞班潟湖航拍（640×358 同一素材，`alt` 走 `hero.image_alt`，无题注行）；其余区块仍用渐变面板 + 内联 SVG 图标（`aria-hidden="true"`，不进无障碍树）。图上不再叠文字，标语 `Saipan / More than a destination.` 落在照片下方的深色面板里 |
| 图标 | 根首页 20 个图标的 path 数据取自 **Lucide**（`lucide-static` v1.57.0，ISC 授权，https://github.com/lucide-icons/lucide）。**不引依赖**：只把 24×24 网格上的 `d` 抄进 `index.astro` 的 `icons` 常量，外层 `viewBox/fill/stroke/linecap` 由本页 `svg()` helper 统一给，`stroke-width` 用 **1.6**（比 Lucide 默认 2 细，配大标题不抢戏）。产物仍是内联 SVG，零 HTTP 请求、零客户端 JS、lockfile 不变；出处注释写在 `icons` 常量上方。用户 2026-10-15 拍板**范围只到根首页**，内页与共享组件的图标不跟着换 |
| 样式层 | `src/styles/marketing-home.css` **只被 `pages/index.astro` 引入**，因此 `.mhero`/`.mcard` 等首页专用类不会进内页产物；`tokens.css`/`global.css`/`components.css` 属设计轮维护，本层不往里加值 |
| 色值 | 首页专用海色定义在本层 `:root`（`--mh-ink/--mh-sea-deep/--mh-sea-mid/--mh-shell/--mh-lagoon/--mh-lagoon-light`），是**唯一允许脱离 tokens 定义颜色的位置**，且仅限根首页。用户 2026-10-14 拍板改走**马尔代夫蓝**：深礁蓝 `#06384b` → 中调 `#0a5a75` → 潟湖青 `#0b6b81`，装饰浅青 `#17a2bd`/`#8fe6f0`，浅底 `#e7f6f8`；藏蓝 `--color-primary*` 在本层已全部替换，只保留金色 `--color-accent` 作分隔线点缀 |
| 对比度 | 白字只落在深段（`#06384b`/`#0a5a75`/`#0b6b81`，对白字手算分别 12.5:1、7.7:1、6.1:1；首屏面板半透明合成后 `#084c63` 约 9.4:1）；`#17a2bd`/`#8fe6f0` 这类浅青只用于无文字的装饰色带与光斑，其上的标签是白底深字（`--mh-ink` 对白底 12.5:1、对 `#e7f6f8` 11.3:1）。`pnpm run audit` 实测对比度 0 条告警 |
| 链接 | 所有内链经 `buildVisiblePaths()` 校验，缺页时退到真实存在的科普/方案页，退无可退就不渲染该链接；演示构建实测内链 0 broken（`pnpm run links`） |

## 6. 待决（不得由开发侧自行选定）

| 项 | 状态 |
|---|---|
| 品牌正式名称、logo、字标 | 未确认（`site-config.brand.official_name=null`）；生产构建不显示品牌名，`validate-data` 会拦截发布 |
| 字体采购与五语字重 | 未决 |
| 摄影/插画素材与授权 | 首图已换成用户提供的塞班海岸航拍实景（见 5.1）；院方实拍、医院/实验室素材与**使用授权**仍未提供 |
| 首图素材的授权链 | 换实景海滩照一项已由用户 2026-10-14 拍板执行；剩余问题是该图的拍摄者与商用授权未书面确认——托管/对外发布前需法务或授权文件，届时再决定是否补回来源题注 |
| 暗色模式 | 明确推迟 |

# 技术 SEO 检查清单（实现口径与上线前逐项核对）

- 状态：**已实现并自动化校验；索引效果验证 BLOCKED（待托管与 Search Console）**
- 校验来源：`scripts/validate-seo.ts`（源码层）、`scripts/audit-dist.ts`（构建产物层）、`tests/unit/seo.test.ts`（规则回归）
- 执行入口：`pnpm run validate:seo`（无需构建）、`pnpm run audit`（需先构建，产物层规则）
- 关联事实：`docs/compliance/fact-register.csv` 的 `inst-primary-domain-control`、`redirect-old-domain-list`、`brand-official-name`

## 1. URL 与 canonical 规范

全站唯一主域 `saipanivf.org`，路径以语言目录开头，**无尾斜杠（根路径除外）**。

| 位置 | 规范要求 | 实现与校验 |
|---|---|---|
| frontmatter `path` | 以 `/` 开头、以 `/{lang}` 开头、无尾斜杠 | `validate-seo.ts:30-32` |
| canonical | `https://saipanivf.org` + 归一化路径 | `src/lib/seo.ts:13` `canonicalUrl()` |
| 内链 | 与 canonical 同一归一化函数，避免"内链带斜杠、canonical 不带" | `normalizePath()` 单点实现 |
| sitemap `<loc>` | 与 canonical 逐字一致 | `audit-dist.ts` sitemap↔产物一致性检查 |
| 旧域 301 目标 | 只指向本清单规范下的新路径 | `docs/seo/redirect-map-notes.md` |

尾斜杠策略为 `never`（`data/site-config.json` `routing.trailing_slash`），并由 `validate-data.ts` 断言，禁止在实现阶段被静默改成 `always`。

## 2. 状态 × 索引 × sitemap × hreflang × 内链矩阵

发布闸门（开发文档 3.2）决定一个页面在四个位置上是否出现。这四个位置必须同源判断，不允许各自为政。

| status | 生产构建是否渲染 | robots meta | 分语言 sitemap | hreflang 互指 | 可被生产页内链 |
|---|---|---|---|---|---|
| `published` | 是 | `index,follow`（必须 `noindex: false`） | 是 | 是 | 是 |
| `approved` | 否 | — | 否 | 否 | 否 |
| `review` | 否 | — | 否 | 否 | 否 |
| `draft` | 仅 `INCLUDE_DRAFTS=1` 预览构建 | `noindex,nofollow` | 否 | 否 | 否 |
| `retired` | 否 | — | 否 | 否 | 否 |

代码依据：`isLivePage()` / `rendersInThisBuild()`（`src/lib/config.ts`）；`livePages()` 用于 sitemap 与 hreflang，`buildVisible()` 用于渲染与内链（`src/lib/content.ts:67-79`）。

结构性约束（`src/lib/page-rules.ts:169-176`）：

- `published` 页不得 `noindex: true`，不得缺 `fact_sources`、`reviewed_by`、`reviewed_at`。
- 提交成功页（`contact_success`）必须 `noindex: true`，任何情况下不进索引。
- `draft`/`review` 页必须 `noindex: true`（`validate-seo.ts:38-40`）。
- 未启用语言（`languages[].enabled = false`）不得有 `published` 页。

`noindex` 页面在审计中不要求出现在 sitemap：审计只把 `content="index..."` 且非 `/404` 的产物页纳入"sitemap 必须收录"检查，因此当前 0 published 页时 sitemap 只有根选择页 1 条，属预期，不是漏提交。

## 3. title / description 长度口径

长度按**显示宽度**而非字节判断。CJK 字符约为拉丁字符两倍宽，同一像素预算下可容纳的字符数约减半，因此中日韩与拉丁文使用两套口径。以下为经验口径（Google 桌面标题约 580–600px、描述约 920px 的显示宽度换算），属 **warning 级**建议值，不是搜索引擎硬性门槛；若院方或 SEO 负责人给出不同口径，改 `scripts/audit-dist.ts:225-226` 的区间常量，不要在各页面正文里各自凑字数。

| 语言族 | title 建议 | description 建议 |
|---|---|---|
| CJK（zh-hant / zh-hans / ja / ko） | 6–30 字符 | 20–90 字符 |
| 拉丁（en 及后续拉丁语言） | 25–60 字符 | 50–160 字符 |

审计同时检查：title 与 description 的**跨页唯一性**（重复即 warning）、`<title>` 与 `meta description` 的存在性（缺失即 error）。

当前实测 warning：**6 条，且全部出现在预览构建**（`pnpm run build:preview && pnpm run audit`，19 页 / 14 个表单）；生产构建只渲染 published 页，当前 published 为 0，因此 `dist/` 只有根选择页与 404 页、`audit` 为 0 error / 0 warning。这 6 条都是代表页草稿标题过短，需在内容阶段补成"意图 + 区分信息"的完整标题，不得靠堆关键词凑长度：

- `en/contact-success`（9）、`en/entry-path`（17）、`en/pricing`（15）、`en/why-saipan`（10）
- `zh-hans/contact-success`（5）、`zh-hant/faq`（4）

## 4. sitemap 架构

```
/sitemap-index.xml          ← robots.txt 只指向这里
/sitemaps/zh-hant.xml
/sitemaps/zh-hans.xml
/sitemaps/en.xml
```

| 规则 | 实现 | 校验 |
|---|---|---|
| 按语言分片，每片只含该语言已上线页 | `languageSitemap(live, lang)`（`src/lib/sitemap.ts`） | `validate-seo.ts:97` 分片含未启用语言即 error |
| 单片 URL 上限 50,000 | `MAX_URLS_PER_SITEMAP` | 常量截断，超限需改为分片文件 |
| `<lastmod>` 用 `last_verified`，缺失则不写 | `src/lib/sitemap.ts:22` | 审计不校验时间语义 |
| 根选择页 `https://saipanivf.org/` **只由默认语言的 sitemap 提交一次** | `languageSitemap(..., includeRoot)`，调用侧传 `lang === defaultLanguage` | `validate-seo.ts:109/126` 重复提交即 error |
| sitemap 里每个 URL 都有对应产物 | — | `audit-dist.ts:335` 反向检查 |
| 每个可索引产物都在 sitemap 里 | — | `audit-dist.ts:337-341` |
| 未发布页 / noindex 页不得出现在 sitemap | `livePages()` 过滤 | `validate-seo.ts:120-122` |

根选择页是构建出的语言落地选择页（`src/pages/index.astro`），不是 MDX 内容页，因此不在 `livePages()` 集合内；早期它"可索引却不在任何 sitemap 中"，由 `includeRoot` 修复。日/韩启用后（P3）会自动出现在 `sitemap-index.xml`，无需改动本文件。

## 5. hreflang 规则

三层过滤，缺一不可（`hreflangAlternates()`，`src/lib/seo.ts:22-41`）：

1. **同组**：只有 `translation_key` 相同的页面互为等价页。
2. **已上线**：组内 `status` 为 `published` 的成员才参与；本页自己未上线时整组输出空列表（不给未上线页声明 hreflang）。
3. **已启用**：成员语言 `enabled` 为真；`path` 已归一化。

输出规则：

- 每个成员用自己的 `hreflang` 值（`languages[].hreflang`，如 `zh-Hant` / `zh-Hans` / `en`），繁简必须分开声明，不得都写 `zh`。
- 必含**自指条目**（当前页自身 URL），`audit-dist.ts:267` 缺失即 error。
- `x-default` 指向 `x_default_target`（当前配置为 `zh-hant`）对应页面，且该页也必须在组内已上线；配置目标未上线时宁可不输出 `x-default`。
- 缺某语言版本时**不虚构该语言 URL**——搜索引擎对指向 404 或重定向的 hreflang 会整组忽略。
- 同一 `translation_key` 组内同一语言出现多页即 error（`validate-seo.ts:57`）。

## 6. 语言切换器与 hreflang 的分工

两者数据来源不同，故意不共用一个列表：

| | hreflang | 语言切换器 |
|---|---|---|
| 受众 | 搜索引擎 | 真实用户 |
| 范围 | 仅 `published` 等价页 | 仅**本次构建可见**页面 |
| 缺同义页时 | 不输出该语言 | 回退到该语言本次构建的真实落点（`languageHomeIfBuilt()`） |
| 该语言一页未建 | 不输出 | 整个语言不出现（`switcherTargets()` 返回不含该语言） |

`switcherTargets(self, group, langs, homeFor)` 的 `homeFor` 返回 `null` 时不输出该语言项，这是"预览构建里能看到 ja/ko 切换项却点开 404"的预防措施。

## 7. robots.txt、结构化数据与 OG

- `public/robots.txt`：`User-agent: * / Allow: /`，只声明 `Sitemap: https://saipanivf.org/sitemap-index.xml`。草稿与审核页不进生产构建，因此**不需要** `Disallow`；上线后旧域逐页 301 不在 robots 里表达。
- 404 页必须 `noindex`（`audit-dist.ts:255` 为 error 级）。
- 结构化数据：品牌正式名称未取得书面核准前 `organizationJsonLd()` 返回 `null`，页面**完全不输出** JSON-LD，不输出残缺的 Organization（开发文档 7.1）。输出的 JSON-LD 必须可被 `JSON.parse`（审计逐块解析）。
- OG：`og:title` / `og:description` / `og:url` 缺失为 warning；`og:image` 仅在 frontmatter 声明 `og_image` 时输出，图片资产未到位时留空而非占位。
- 站内 HTML 不得出现禁用域（`sivf-asia.com` 等，处置未决 → 零引用）；扫描范围为页面 HTML，不含 `robots.txt` 的维护说明文字。

## 8. 产物审计已发现并回归的两个缺陷

记录在此是为了避免后续阶段把同类问题当"已通过"。

| 缺陷 | 后果 | 根因 | 修复与回归 |
|---|---|---|---|
| 分语言 sitemap 全片为空 | 所有语言永远无 URL 提交，索引完全依赖外链发现 | 端点 `GET(context)` 里 `context.props` 为 `{}`，Astro 5 把路由参数放在 `context.params`（实测） | `src/pages/sitemaps/[lang].xml.ts` 改为 `context.params?.lang ?? context.props?.lang ?? ''`；`tests/unit/seo.test.ts` 增加分片正确性与"取不到 lang 时整片为空"的回归断言 |
| 表单无 `method` → 原生 GET 兜底 | JS 未接管时提交内容进入 URL、浏览历史与 Referer，违反开发文档 6.2 | `<form>` 缺省 method 即 GET | `ContactForm.astro` 加 `method="post"`；`audit-dist.ts` 对每个表单断言 `method=post`、无 `multipart`、无 `type=file`、字段名在白名单内 |

## 9. 上线前逐项核对

上线决策由项目负责人勾选，未勾选项不得进入发布：

- [ ] `pnpm run ci` 全绿（typecheck → validate → test → build → links → audit），且末条命令是 `pnpm run build`（生产构建）而非 `build:preview`。
- [ ] `pnpm run audit`：error 为 0；title/description 长度 warning 已逐条处理或书面说明保留理由。
- [ ] 每个 `published` 页都有 `fact_sources`、`reviewed_by`、`reviewed_at`，且五语同义页在**同一批次**内提交。
- [ ] `sitemap-index.xml` 与每个分语言 sitemap 在**生产域名**下可访问，URL 全为 `https://saipanivf.org/...` 且无尾斜杠。
- [ ] `robots.txt` 可从主域访问并指向 sitemap index；Search Console 已验证并提交该 index。
- [ ] 旧域逐页 301 已在 `docs/seo/redirect-map.csv` 填全并实测 `verified=yes`；无链式/循环跳转、无指向 draft 页的目标。
- [ ] `sivf-asia.com` 处置决策已书面确认，站内仍为零引用（审计无相关 error）。
- [ ] 品牌正式名称已核准，`organizationJsonLd()` 开始输出，且其中不含未核准字段。
- [ ] 未上线语言保持 `enabled: false`，其目录无产物、无 sitemap 分片、无 hreflang 条目。

## 10. 本清单不覆盖的项目

- **排名、点击、索引覆盖**：需在真实托管 + Search Console 数据上观察，本地构建无法判定。
- **首屏性能与 Core Web Vitals**：`docs/testing/audit-report.md` 只给 HTML/CSS/JS 的实测字节与请求数，不给时间估计；<2 秒门槛需要真实网络档位与 Lighthouse 复测。
- **301 实测状态码**：`redirect-map.csv` 的 `verified` 列必须在旧域可访问后逐条实测填写，不接受推测。
- **hreflang 在已发布规模下的对称性**：当前仅 0 published 页，规则由单元测试以构造数据覆盖；真实五语页面到位后需重跑 `pnpm run audit` 复核。
- **表单安全规则的生效前提**：`pnpm run audit` 的报告头部会写明"检查对象：… N 个 `<form>`"与构建模式。生产构建在没有 published 联系页时 `<form>` 数为 0，此时"0 error"只表示没有违规，**不表示表单已验证**；表单规则的实际覆盖在预览构建（14 个表单）与 `tests/unit/forms.test.ts` 上完成。
- **图片 SEO**：同一张塞班航拍首图（26,763 B）现服务两处——各语言 landing 页（`/zh-hant`、`/zh-hans`、`/en` 及其子页）与**根首页 `/` 的首屏右栏**；`alt` 本地化（根首页取 `hero.image_alt` 的简体值，点名塞班），`width/height` 显式，首屏图 `loading="eager"`。仍未做：`og:image`（品牌与素材授权未定）、`srcset`/多密度、WebP/AVIF 转换（构建链不依赖 sharp，`public/` 原图直出）。文件名 `saipan-lagoon-aerial.jpg` 含地点与主题关键词，来源与授权口径见 `docs/design/design-system.md` 5.1。

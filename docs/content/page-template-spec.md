# 内容模型与页面模板规格（P1 交付物）

对应开发文档 2.3（URL 与语言规则）、3.1（内容模型）、3.2（发布流程）、5（模板）、8.1（自动化校验）。

## 1. 唯一清单

`content/page-manifest.csv` 是页面集合的唯一真相，**165 行已冻结 + 2 行经批准的结构性新增**（列：`translation_key,path,lang,template,intent_group,title_working,primary_cta,secondary_cta,required_sections,fact_source_ids,review_types,review_owner,status,priority,notes`）。

| 维度 | 实测分布 |
|---|---|
| 语言配额 | zh-hant 46、zh-hans 46、en 35、ja 20、ko 20（合计 167；`validate-data` 断言总数等于五语 `page_count_quota` 之和，且逐语言等于配额） |
| 清单状态 | blocked 143、draft 24 |
| 模板 | program 45、legal 29、article 20、city 18、home/why_destination/entry_path/hospital_lab/pricing/success_data/faq/contact_success/egg_donor_program/patient_story 各 5、doctor 3、article_index 2 |
| 仓库内 MDX | 29 个（全部 `status: draft`，`noindex: true`） |

167 = 165 + 2 的偏差是本阶段唯一经批准的清单变更，且只增结构页不增内容页：`/zh-hant/articles` 与 `/zh-hans/articles` 两个科普 hub（`article_index` 模板，`P2-deferred`，`medical_reviewer_pending`）。为容纳这两行，zh-hant/zh-hans 的 `page_count_quota` 由 45 提到 46，`site-config.json` 的 `note` 记明「配額 45+1：科普 hub 為清單新增的結構頁」。文档 1.2 的 45/45/35/20/20 与 165 总口径仍是内容配额基线，未被重新解释为可写内容上限。

165（本阶段含 hub 为 167）是上限与清单管理口径，不是内容 KPI：没有事实来源或母语审核的页面必须留在 blocked/draft，禁止为凑数写薄内容（文档 0.1 第 7 条）。

清单与代码不允许各写一套：`scripts/validate-content.ts` 与 `tests/unit/content.test.ts` 会把每个 MDX 与清单行逐字段对齐（`path`/`template`/`primary_cta` 不一致=错误；`secondary_cta`、`required_sections` 不一致=警告），并且：

- 清单标 `blocked` 的行，其 MDX 绝不能是 approved/published；
- 已发布（published）的 MDX，其清单行必须是 approved/published。

## 2. URL 与语言规则

- 路径 = 清单 `path`，一律以 `/` 开头、**无尾斜杠**、无扩展名、无 query 承载业务含义；`normalizePath()` 与 `checkPageRules()` 双重保证（尾斜杠直接判错）。
- 语言由目录前缀决定：`/zh-hant|/zh-hans|/en|/ja|/ko`，且必须等于 frontmatter `lang`。
- `translation_key` 是五语同页分组键：hreflang 只在同组、同语言启用、且 `published` 的页面之间互指；`x-default` 指向 `site-config.x_default_target`（zh-hant）。缺语言版本不输出伪造 URL，语言切换器回退到该语言落点。
- 不自动按 IP 跳转语言（`auto_redirect_by_ip: false`）。

## 3. frontmatter 模型（`src/content.config.ts` + `src/lib/page-rules.ts`）

必填：`lang path translation_key title description template primary_cta`；其余有默认值。

| 字段 | 类型/枚举 | 规则 |
|---|---|---|
| `lang` | zh-hant/zh-hans/en/ja/ko | 必须与路径前缀一致 |
| `path` | `/…` | 无尾斜杠、全站唯一 |
| `translation_key` | string | 同组共享；重复由脚本判错 |
| `template` | 17 个枚举（home, why_destination, city, entry_path, hospital_lab, doctor, program, pricing, success_data, legal, faq, article, article_index, patient_story, egg_donor_program, contact_success, generic） | 与清单一致 |
| `status` | draft(默认)/review/approved/published/retired | 见第 4 节闸门 |
| `owner` / `reviewed_by[]` / `reviewed_at` | | published 必须三值齐全 |
| `last_verified` | date 或 null | published、legal/entry_path 离开 draft 时必填；入境类另有 31 天新鲜度闸门 |
| `fact_sources[]` | `{id,label,url,obtained_at,verified_by}` | published 至少 1 条 |
| `required_sections[]` | | program 模板必须覆盖六问；legal 页至少声明一项 |
| `primary_cta` / `secondary_cta` | 8 个枚举（assess_program, request_itinerary, request_price_guide, book_consult, contact_us, contact_whatsapp, view_programs, donor_inquiry） | 同页不得重复；`contact_success` 只用 `contact_whatsapp`/`book_consult` |
| `noindex` | 默认 true | 非 published 页必须 true；published 必须 false；`contact_success` 恒为 true |
| `city` / `nationality_slots[]` / `doctor_id` / `program_slug` | | published 的 entry_path 必须声明 `nationality_slots`，doctor 页必须 `doctor_id` |
| `blocked_reason` / `replacement` | | `retired` 必须给 `replacement` 或 `blocked_reason` |
| `hero` | `{eyebrow,lede,trust_items[],image}` | `trust_items` 最多渲染 2 条，且只在 published 显示原文 |

规则只写一遍：`page-rules.ts` 同时被 MDX schema 的 `superRefine`（构建期直接失败）和离线校验脚本（输出 error/warning 两级）引用，避免构建与校验两套口径。

## 4. 状态与发布闸门

```text
draft → review → approved → published → retired
```

| status | 预览构建 | 生产构建 | sitemap | hreflang | 可被生产页链接 |
|---|---|---|---|---|---|
| draft | 渲染 + 草稿横幅 | 不渲染 | 否 | 否 | 否 |
| review | 渲染 + 横幅 | 不渲染 | 否 | 否 | 否 |
| approved | 渲染 + 横幅 | **不渲染** | 否 | 否 | 否 |
| published | 渲染 | 渲染 | 是 | 是 | 是 |
| retired | 不渲染 | 不渲染 | 否 | 否 | 否 |

- 开关：`INCLUDE_DRAFTS=1 astro build`（只用于内部预览，禁止指向生产域名）；`astro dev` 等同预览。
- approved 不等同上线：仍须通过工程校验与法务/机构签核（文档 3.2），闸门刻意保守。
- 生产构建当前只输出 2 个页面（根语言选择页 + 404）：**0 个内容页上线**，这是预期结果，不是缺陷。

## 5. 模板规格

| template | 必含模块 | CTA 与闸门 |
|---|---|---|
| `home` | hero 价值主张、信任证据槽、方案入口、就医流程步骤、医生/实验室信任槽、为何塞班摘要、停留与入境入口、费用入口、FAQ 入口、联络 CTA | 主 `assess_program`，次 `request_itinerary`；hero 未写 `image` 时用 `heroImage` 默认首图（见 design-system 5.1），覆盖图须为 640×427 |
| `program` | 六问：`suitability / exclusions / process / stay_duration / risks / price_range` | 停留天数与价格区间只在 `programs.json` 的 `medical_review_status=approved` 且 `institution_fact_status=verified` 时出现，否则为待审核槽位 |
| `entry_path` | 逐 nationality 槽位的入境条件、中转与联程 | `nationality_slots` + `EntryPolicyTable`；每条政策记录须 verified 且 31 天内复核 |
| `why_destination` | 航线表、入境表、口径一致的目的地对比 | 对比维度限定为「是否公布带方法与样本量的年龄分层数据」等可核验项 |
| `city` | 出发地—塞班航线、时差、集合与中转 | 只引用 verified 航线 |
| `hospital_lab` | 机构与实验室事实、自建/外包与检测资质 | 全部来自 `fact_sources`，未核验不渲染 |
| `doctor` | 姓名、执照号、照片授权、专长 | `data/doctors.json` 无 verified 记录 → 整页不渲染，预览显示待审核 |
| `pricing` | 价格区间、包含/不含、加项、非医疗费用、付款、退款与改期、币种与有效期 | 无院方价格文件时**不输出任何数字**，只输出七个小标题 + 待审核槽 |
| `success_data` | 成功率口径 | 未带定义/分母/年龄层/样本量/年份的数字禁止出现（`claims.ts` 拦截） |
| `legal` | 必须声明 `required_sections` | 恒 noindex；离开 draft 需 `last_verified`；内容以法律顾问书面意见为准 |
| `faq` | `FAQList` 组件 | 主 `assess_program` |
| `article` | `working-summary`（先给结论）、`body-from-verified-facts-only`、`source-note`、`intent-matched-cta` | 正文只写**判断方法**（该问什么、以什么书面材料为准），不写机构事实、数字、成功率、价格、医生姓名、签证/法律结论与最高级形容词；本中心相关信息须先进 `data/*.json` 或 fact register 并 verified，未核验部分放进 `<ReviewOnly>` 而非正文 |
| `article_index` | `hub-intro`（这些文章回答什么问题）、`article-card-list-from-build`、`source-note`、`intent-matched-cta` | 主 `assess_program`，次 `contact_whatsapp`；卡片列表由 `ArticleIndexList` 在本次构建的可见页里即时生成，hub 不写死文章清单，也不描述没有渲染出来的内容 |
| `patient_story` | 患者故事 | 需书面授权事实登记后才可推进状态 |
| `egg_donor_program` | 供者招募 | `donor_inquiry` → 供者表单变体；渠道须 `form_channel` |
| `contact_success` | 提交成功说明 | 恒 noindex、无表单、无浮动 CTA；主 `contact_whatsapp` |

## 6. 五语一致与简中独立性

- 同一 `translation_key` 的五语版本必须在同一个 PR 内同步修改（文档 0.1 第 9 条）。
- zh-hans **独立撰写**，不是 zh-hant 的字符转换：`check-prohibited-claims` 用独占字集检测混排，繁中页混入简化字为错误，简中页混入繁体字为警告。
- ja/ko：`site-config.languages` 中 `enabled: false` 且带 `blocked_reason`（母语校对与渠道未确认），路由、sitemap、hreflang、语言切换器全部排除；`validate-data` 对清单已有 ja/ko 行输出 2 条警告，作为 P3 的提醒而非放行凭证。

## 7. 新增一页的正确顺序

1. 确认清单已有该行且状态允许；没有就先改清单并登记决策，不在代码里另立页面。
2. `content/{lang}/{path}.mdx`：写 frontmatter（`status: draft`、`noindex: true`、`translation_key`、`primary_cta`、`required_sections`、`fact_sources` 留空或待补）。
3. 事实放进 `data/*.json` 或 `docs/compliance/fact-register.csv`，不在 MDX 里写死数字、日期、账号。
4. `pnpm run validate && pnpm run test` → `pnpm run build:preview && pnpm run preview:serve` 目视。
5. 状态推进只能由审核记录驱动：draft → review → approved →（工程校验 + 法务/机构签核）→ published。

## 8. 当前 29 个骨架页

```text
zh-hant  index, why-saipan, entry-path, pricing, faq, contact-success, programs/ivf-icsi, cities/taipei, legal/privacy-and-data-protection
         articles/index + articles/{how-to-read-success-statistics, ivf-abroad-decision-checklist, lab-own-or-outsourced, stay-itinerary-planning, translation-and-support-arrangements}
zh-hans  index, entry-path, contact-success + 上述 articles/ 六页（独立撰写，非繁中转换）
en       index, why-saipan, entry-path, pricing, contact-success
```

全部 `status: draft`。它们的作用是承载模板、组件与闸门，不是可发布内容。

科普层的三条结构性约定（避免「空入口」和「指向未渲染内容」）：

1. **入口与卡片同源**：导航「就醫科普」项与 hub 上的卡片列表都走 `visibleArticles(buildVisible …)`，口径与渲染构建一致——生产构建里没有可见文章时，导航项整体不输出，而不是点进一个空 hub。
2. **hub 不硬编码清单**：`ArticleIndexList` 从本次构建的可见页生成卡片，新增/下线文章不需要改 hub 文案。
3. **文章路径复用清单已保留的 `/{lang}/articles/{slug}`**，父段 `/zh-*/articles` 即面包屑上级，因此没有新增路由代码；面包屑上级标签取导航短标签（`navLabelKeyFor`）而不是长标题。

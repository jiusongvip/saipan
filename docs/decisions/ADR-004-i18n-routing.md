# ADR-004：五语路由、语言启用与 hreflang 规则

- 状态：**proposed**（已在代码中实现，待项目负责人确认）
- 日期：2026-10-13
- 决策方：项目负责人（待确认）；起草：P0–P2 工程 Agent
- 依据：开发文档 0.1 第 10 条（不擅自更换语言目录规则）、2.3（URL 规范）、4.11（内容模型）、7.2（sitemap）、7.3（主域）、13.8（不做 IP 自动跳转）
- 关联文件：`data/site-config.json`、`src/lib/config.ts`、`src/lib/content.ts`、`src/lib/seo.ts`、`src/lib/sitemap.ts`、`src/lib/page-rules.ts`、`src/lib/i18n.ts`、`src/pages/[...slug].astro`、`src/pages/index.astro`、`src/components/LanguageSwitcher.astro`

## 背景

五个语言、165 页的站点，最容易出的三类事故都是路由层面的：

1. 未准备好审核与母语校对的语言（日/韩）被机械翻译批量生成页面并进入 sitemap；
2. 简体中文由繁中「一键转换」产出，形成两套语言互相复制的半翻译内容；
3. 语言切换器与 hreflang 指向不存在的 URL（`/ja`、`/zh-hans/program`），既产生 404，又让 Google 抓取到残缺的等价组。

语言目录一旦上线就不可回退：换 URL 规则等于全站重定向表重写、既有外链与索引作废。因此本 ADR 在写第一行路由代码前把规则钉死。

## 决策

### 1. URL 结构：路径前缀 + 语言码，无尾斜杠

- 每个页面 `path` 必须以 `/${lang}` 开头，语言首页恰好等于 `/${lang}`（`page-rules.ts:152`、`page-rules.ts:156`）。
- 除根路径外全站无尾斜杠（`page-rules.ts:151`），canonical、内链、sitemap 使用同一规范化函数 `normalizePath()`。
- 语言码固定五个枚举值：`zh-hant` / `zh-hans` / `en` / `ja` / `ko`（`config.ts:3`），与目录名 1:1，不做 `zh-TW`、`zh-CN` 之类的地区码变体，避免出现第二套目录规则。
- 路由实现是单个 catch-all：`src/pages/[...slug].astro` 由 `getStaticPaths()` 从「本次构建可见页」映射，`pathToRoute()` 只剥掉前导 `/`。语言段是路径的一部分，不是中间件或重写规则，因此托管层无需任何语言感知配置。
- 根路径 `/`（`src/pages/index.astro`）是**构建出来的语言选择页**，只列出本次构建里真实存在的语言首页；无 published 内容页时它是生产站点唯一入口之一（另一个是 404）。

### 2. 语言启用由数据控制，代码不写死语言数量

- `data/site-config.json` 的 `languages[].enabled` 是唯一开关；`enabledLanguages = allLanguages.filter(l => l.enabled === true)`（`config.ts:21`）。
- 未启用语言在三处同时消失：路由与内链（`buildVisible()` / `livePages()` 都过 `langEnabled()`，`content.ts:67`、`content.ts:72`）、语言切换器、hreflang 与 sitemap。所以「启用日语」是改一行数据 + 走一次 CI，而不是改代码。
- 当前状态：`zh-hant` / `zh-hans` / `en` = `active_draft`；`ja` / `ko` = `enabled: false`，`status: blocked`，`blocked_reason` 记录的是 P3 前置条件（母语校对人力、LINE/KakaoTalk 客服账号、审核人）。**这两项未确认前，任何人不得把 `enabled` 改成 true。**
- 配额也写在数据里：`page_count_quota` 45/45/35/20/20（合计 165），`scripts/validate-data.ts:51` 用它对照 `content/page-manifest.csv`，某语言行数超出配额、或五语配额合计 ≠ 清单行数即报错。
- 校验器会区分「语言被禁用」与「内容缺失」：manifest 里 ja/ko 的行在语言关闭期只产生 warning（`validate-data.ts:56`，当前 2 条），不会阻断 CI；一旦 enabled 变 true，同样内容即按 error 处理。`default_language` 与 `x_default_target` 必须是已启用语言，否则直接报错，防止关错语言后 x-default 悬空。

### 3. 简中独立撰写，不做繁中转换

- `zh-hans` 是独立目录与独立 MDX，内容由简中写手按 `docs/content/terminology-five-languages.csv` 的术语表撰写；工程上不存在任何繁→简转换脚本，也不允许引入。
- 数据里 `zh-hans.note` 已写明附加字段要求：简中咨询表单含「是否持有效美国签证」字段（`ContactForm.astro` 按 `lang === 'zh-hans'` 条件渲染），这是简中与繁中页面唯一的结构性差异，其余模块必须同构。
- 后果：五语版本页脚、免责声明等共用文案也要各自成文，不能靠 `t()` 自动降级；`t()` 缺键会静默降级到英文，因此字典完整性改由单元测试 `missingKeys()` 兜住，漏译会让 CI 失败，而不是等浏览器验收时才发现混语言。

### 4. 日/韩的 P3 前置条件（不是工程阻塞，是业务阻塞）

| 前置条件 | 归属 | 当前 |
|---|---|---|
| 母语校对人力（写手 + 校对人姓名与资质） | 项目负责人 | 未确认 |
| LINE 官方账号（ja）/ KakaoTalk 频道 + 邮箱值守（ko） | 院方运营 | 未确认 |
| 各语言的审核人写入 `docs/operations/raci.md` | 项目负责人 | 登记为 pending |
| 术语表 ja/ko 两列补全 | 内容 | 空白 |

工程侧已准备好：目录、hreflang、配额、校验规则都留了位置。缺失的是上面四项，**不允许用机器翻译或模型代写来「先填上」**（开发文档 0.2 第 4 条）。

### 5. hreflang 只在真实上线的等价组内互指

`hreflangAlternates()`（`seo.ts:22`）的三层过滤，缺任一层即整组不输出：

1. 页面自身必须 `isLivePage(status)`，即 `published`（approved 仍不算上线，见 ADR-003）；
2. 组内只保留 `isLivePage` 且 `path` 已规范化的成员；
3. 只保留 `enabled` 语言。

`x-default` 指向 `site-config.x_default_target`（当前 `zh-hant`）对应的上线页，该页不在组内时不输出 `x-default`。翻译组身份用 `translation_key`（`groupByTranslationKey()`），不用路径字符串匹配——路径改了 key 不变，组不会静默解体。

推论（当前真实状态）：**生产站点没有任何 hreflang**，因为 published 页数为 0；预览构建里的 17 个 draft 页也一律 `noindex,nofollow`。这是设计意图，不是缺陷。

### 6. 语言切换器宁可不显示，也不伪造链接

`switcherTargets(self, group, langs, homeFor)`（`seo.ts:48`）的优先级：

1. 同 `translation_key` 组内该语言的页面 → 直接指向它；
2. 该语言没有同义页 → `homeFor(lang)`，即 `languageHomeIfBuilt()`：该语言本次构建的首页，退而取该语言路径序第一个可见页；
3. 该语言本次构建一页都没有 → 返回 `null`，**该语言条目整个不渲染**。

`LanguageSwitcher.astro` 只用 `available`（过滤掉当前语言与无落点语言）渲染，全站导航与 CTA 用同一套推导（`navItemsForLang()`、`ctaHref()`）。这条规则的来源是可复现的校验结果，不是主观判断：旧实现按「已启用语言」无条件拼 `/${code}` 与 `#consult`，生产构建（0 个内容页）下 `scripts/check-links.ts` 报出 16 条指向不存在页面的链接；改为从可见页集合推导后，同一命令在生产 dist 上报 0 错（5 个链接）、预览 dist 上 0 错（232 个链接）。

### 7. 不做 IP/语言头自动跳转

- 服务器不按 `Accept-Language` 或 IP 重定向，用户始终落在其点击的语言目录；根路径只提供选择页。这条同时是数据契约：`data/site-config.json` 的 `routing.auto_redirect_by_ip` 必须为 `false`、`routing.trailing_slash` 必须为 `never`，`scripts/validate-data.ts:62` 对二者直接报错，改配置就过不了 CI。
- 理由：本站的目标市场与访问地分离（大陆/港澳台用户查询、赴美就医），自动跳转会把简中用户推进繁中目录，且跳转历史不可复现，无法验证「哪个语言页被看到」。开发文档 13.8 明确列为禁止项。
- 语言偏好若要记忆，只在同一会话内记住切换器选择，且不得写入 cookie 之外的存储（与表单数据、GA4  consent 分离）。当前未实现，属于 P4 增强项。

### 8. UI chrome 与正文分离

- `src/lib/i18n.ts` 只装页头/页脚/表单/表格列名/提示（130 个键 × 3 语言，ja/ko 不在字典内），页面正文一律在 MDX 中按语言独立撰写。
- 好处：模板改动（例如表单字段名）不会连带改动医疗文案；坏处：新增 chrome 文案必须一次补齐三语。`t()` 缺键时会先降级到英文字典、再原样返回键名（`i18n.ts:415`），所以漏译不会崩，只会露出裸键名；字典完整性由单元测试 `missingKeys()` 断言（`tests/unit/facts.test.ts:72`），缺键即 CI 失败——这是刻意的摩擦。
- 简中表单的「是否持有效美国签证」是唯一按语言分支渲染的字段（`ContactForm.astro:120` 的 `lang === 'zh-hans'` 条件），其余字段五语同构；form-spec 已记录其他语言不出现该字段，避免收集非必要信息。

## 备选方案

| 方案 | 否决原因 |
|---|---|
| 子域（`en.saipanivf.org`）或 ccTLD | 需 DNS、证书、托管与重定向四套配置，且主域唯一性已受医疗广告审核牵连（文档 7.3）；`saipanivf.org` 之外的域名在处置未决前不得引用 |
| 单域 + 查询参数 `?lang=` | canonical/hreflang 与缓存会因参数分裂，GA4 归因也变复杂；不利于分语言看内容表现 |
| 繁中作默认根路径（`/` 即繁中） | 会让根路径同时承担「选择页」与「某语言首页」两职，切换器与 x-default 逻辑含糊；简中用户也可能被当成「未翻译的繁中」 |
| 按 `Accept-Language` 自动跳转 | 见决策 7；不可验证且与目标市场错位 |
| ja/ko 先机翻占位、审核后再替换 | 机翻页面会先进 sitemap 与索引，替换成本高（外链、快照），且违反 0.2 第 4 条「不得用猜测补齐」 |

## 后果

**正面**

- 加一门语言 = 改 `enabled` + 建目录 + 补术语表列，代码零改动；关一门语言同样安全。
- 断链类缺陷从「靠肉眼点击发现」变成构建期不可能：所有语言链接都源自可见页集合。
- hreflang 组与页面状态绑定，未审内容不会获得国际版信号，也不会在 Google 留下残缺组。

**代价与约束**

- 内容成本按语言乘算：130 个 chrome 键 × 3 语言已写，ja/ko 启用时需各补 130 键 + 全部正文；文档里的 45/45/35/20/20 配额只是上限，不构成必须填满的理由（0.2 第 7 条禁止为凑页数产出薄内容）。
- `translation_key` 成为契约：新增页面忘了填 key（或 key 打错）会让该页孤立于 hreflang 组之外，需要在 review-matrix 逐行核对，校验器目前只检查非空。
- 路径规则不可回退：一旦 published 页上线，改 `path` 前缀就等于全站重定向工程（`docs/seo/redirect-map.csv` 现为空表，等真实页面产生后填充）。
- 「生产 0 个 hreflang / 0 条 sitemap URL」会持续存在直到第一份书面审核完成，外部看站点像空的——需要提前向业务方解释，避免误判为工程未完成。

## 需要项目负责人确认

1. 根路径 `/` 长期保留为语言选择页，还是在 ja/ko 关闭期间让 `/` 直接服务繁中首页（若改，需同步 `x-default` 与页面模板规范）；
2. `ja` / `ko` 的 P3 前置条件归属人与确认期限（当前四项均无姓名）；
3. 简中「是否持有效美国签证」字段的收集是否经法务确认（涉及入境信息的书面依据）；
4. 是否需要在 P4 加入「记住上次语言选择」的会话内偏好（本 ADR 决定不做跨会话与自动跳转）。

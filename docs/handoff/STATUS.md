# 项目交接状态

- 更新时间：2026-10-14（本机时间，第四轮）
- 当前阶段：**对标优化轮**（用户指令「七项可吸取的优点 134567 都可以做 2 不做……有了框架里面的文字可以随时补充修改……作为一个可以直接上线的版本来做……你也可以先写一两份来凑数」→ 实施批准的第 1/3/4/5/6/7 项框架层优化；第 2 项 methodology 页明确不做）
- 阶段状态：**READY_FOR_REVIEW**。CI 顺序全链路实测全绿：typecheck 0 error → 内容/政策/数据/话术校验 0 error（数据校验 2 warning 为 ja/ko 未启用，属设计内）→ **58/58 测试** → 生产构建 2 页 → validate:seo 0/0 → links 0/0 → audit 0/0；预览/演示构建 42 页 650 链 0 错、演示外壳标记 0 命中。
- 当前分支与 commit：**`main` @ `b759624`**。**阻塞项 1（不是 git 仓库）已解除** —— 2026-10-15 10:28 本机时间，用户指令「你先把这个项目的代码上传到 https://github.com/jiusongvip/saipan」→ `git init -b main` + 初始提交 189 个文件 + 推送成功；远端 `refs/heads/main` 与本地 HEAD 同哈希，递归 tree 比对 189/189 无差集。仓库 **`jiusongvip/saipan` 为 public**（`private: false`）。`.gitignore` 本次新增 `.opencode/`、`.agents/`、`.qoder/`（agent 工具目录不入库），`dist/`、`node_modules/`、`.astro/`、`.env` 原已在列，故**仓库内是纯源码 + 文档，无构建产物、无密钥**（`.env.example` 保留）。提交身份用命令行内联 `-c user.name/-c user.email` 指定为 `NEC01 <spwo@qq.com>`，**未改动任何 git 配置文件**（本机全局 `user.name` 现为坏值 `NEC01\nec01`，含字面 `\n`，需用户自行修）。

## 最新执行状态（第九轮 · 根首页图标换 Lucide，2026-10-15 09:34 本机时间）

> 用户给了 https://github.com/lucide-icons/lucide 问「能否优化下我们的显示面板」。同轮用 AskUserQuestion 定两件事：**范围只到根首页**（延续第七轮的「只换首页」），**`stroke-width` 保持 1.6**（不用 Lucide 默认的 2）。改动落在 `src/pages/index.astro` 与首页专用样式层 `src/styles/marketing-home.css`（后者只加了 `.mhero__chips .mi{width:18px;height:18px;flex:none}` 一条，把首屏 chip 里的图标压回文字级尺寸），未新增依赖、未碰 `package.json` / `pnpm-lock.yaml` / 共享组件。
>
> **口径纠正（09:57 复核）**：本小节初版写的是「本轮只动 `index.astro` 一个文件」，与 `marketing-home.css` 的实际 mtime（09:51:58，晚于 09:34 那次验证）不符——CSS 确实被改过一条规则。09:54 的复跑链路已包含该改动且全绿，故产物无风险，但"只动一个文件"的说法作废。

- **为什么不引依赖也能换**：`svg()` helper 输出的图形契约与 Lucide 完全一致（`viewBox="0 0 24 24"`、`fill="none"`、`stroke="currentColor"`、round cap/join），只差 `stroke-width`。所以**只把 24×24 网格上的 `d` 抄进来**即可，外层属性由 helper 统一给。这样绕开了 ADR-001「新增运行时依赖属中等变更、须先记 ADR 并经项目负责人确认」那条闸门——产物仍是内联 SVG，零 HTTP 请求、零客户端 JS、lockfile 不变。
- **取图方式**：本机对 `cdn.jsdelivr.net/npm/lucide-static/icons/*.svg` 与 `raw.githubusercontent.com` 均可直连（实测 200），一次性 curl 到本机临时目录后离线抽取 inner markup，**没有 `pnpm add`**。21 个候选图标名先逐个验过存在（`hospital`/`palmtree`/`stethoscope`/`languages`/`chart-column`/`receipt-text` 等全部 200），避免猜名。
- **映射与语义修正**：20 个图标换为 Lucide 几何（`shield-check / file-text / scale / users / plane / palmtree / flask-conical / receipt-text / chart-column / languages / book-open / calendar-days / heart / lock / search / hospital / stethoscope / baby / route / compass`）。三处 `icons.chat`（首屏 chip「中文与多语种全程陪同」、为什么选塞班「语言与跨境协调」、Beyond the Clinic「母语沟通与就医协调」）语义都是多语种沟通，键名改 `chat → lang`、字形换成 `languages`（文A），比原来的气泡更贴题。**删掉 `wave`**——全文件 0 处引用（`grep -o "icons\.wave[, ]"` 计数为 0），属上一轮遗留的死代码。
- **授权**：ISC，`lucide-static` 每个 SVG 头部自带 `<!-- @license lucide-static v1.57.0 - ISC -->`；本仓库不引包，故在 `icons` 常量上方写了出处与版本注释。design-system 5.2 新增「图标」行记录这件事（此前文档里没有第三方素材许可清单文件，未新建）。
- **实测链路（演示构建，09:34）**：typecheck 0 error → **60/60 测试** → `build:demo` **50 页** → validate:claims 0/0 → links 0 error → `REVIEW=0` guardrails **0 error / 4 warning** → audit **0 error 0 warning**。图标块共 4,344 B 源码，内联后首页体积变化在 audit 资源表内未触发任何阈值。
- **09:54 复跑同一链路并落笔**（`dist/` 与 `docs/testing/audit-report.md` 现为本次演示构建的产物）：typecheck 0 error → validate:content 0/0（清单 180 行）→ entry-policy 0/0、data 0 error/2 warning（ja/ko 未启用，设计内）→ validate:claims 0/0 → **60/60 测试** → `build:demo`（`INCLUDE_DRAFTS=1 REVIEW=0`）**50 页** → validate:seo 0/0 → links **50 页 / 935 条站内链 0 error 0 warning** → guardrails **0 error / 4 warning** → audit **50 页 / 1 sitemap / 6 本地资源 0 error 0 warning**。首页产物实测：内联 `class="mi"` 图标 **34 个**、`stroke-width="1.6"` 命中 34、`images/saipan-lagoon-aerial.jpg` 为首屏唯一 `<img>`。
- **浏览器目视确认**（窗口可见，截图已出）：`.mtrust__icon`（52px 圆底）、`.mcard__icon`（46px 方底）、`.mpoints__icon`（42px）、`.mline__icon`（44px）四类面板里的图标线条、端点、视觉重量已统一；`hospital`（合作医疗机构）、`stethoscope`（医生团队）、`flask-conical`（实验室与流程）、`chart-column`（临床数据）、`languages`（语言与跨境协调）逐一核对到位，首屏深色面板上的 `flask-conical` 大图标几何无变形。
- **未做**：内页与共享组件（Header/Footer/ProgramCard 等）的图标仍是原样——按拍板属设计内，不是漏改；`og:image`、`srcset`/WebP（阻塞项 12）、「成功案例」正文缺口（全仓 0 篇 `patient_story`）三项不变。

## 最新执行状态（第八轮 · 根首页首图 + 马尔代夫蓝，2026-10-14 18:24 本机时间）

> 用户指令只有一句：**「首图用我的这个 色调也尽量是马尔代夫蓝」**（再次附 `C:\Users\nec01\Downloads\企业微信截图_17919683857432.png`）。本轮**取代第七轮的「先出无照片版」拍板**：根首页 `/` 的首屏右栏改为放这张塞班航拍；配色从藏蓝系整体转成深礁蓝→潟湖青。范围仅 `src/pages/index.astro` + `src/styles/marketing-home.css`，未动 `tokens.css`、内页、Header/Footer、共享组件、事实数据与内容清单。

- **首图复用既有素材，没有新预处理**：源文件仍是 725×405 PNG（742,738 B，本轮复核过），产物仍用第六轮离线缩好的 `public/images/saipan-lagoon-aerial.jpg`（640×358，26,763 B）。`index.astro` 从 `../lib/config` 引入 `heroImage`、从 `../lib/i18n` 引入 `t`，`alt` 走 `t('zh-hans','hero.image_alt')`（＝「塞班岛航拍：碧绿潟湖环绕的白色沙嘴与海岸林」），**不渲染题注**（延续第六轮拍板，`hero.image_credit` 键仍不存在）。`loading="eager" decoding="async"`，`width/height` 显式 640×358。
- **结构变化**：删掉纯装饰的 `.mhero__lagoon` 色块（CSS 规则一并移除，产物命中 0）；`.mhero__panel` 从 `aria-hidden="true"` 改成真实内容容器（内有需被朗读的 `alt`），标语 `Saipan / More than a destination. / A new beginning.` 保留在照片**下方**的深色面板上并单独 `aria-hidden`——**没有在照片上叠字**，避开半透明图上的对比度不可判定问题。`.mhero__photo` 为 `width:100%; height:auto; aspect-ratio:640/358; object-fit:cover`。
- **马尔代夫蓝的具体取值**（全部只写在 `marketing-home.css` 的 `:root`，`tokens.css` 未加值）：`--mh-ink`/`--mh-sea-deep` `#06384b`、`--mh-sea-mid` `#0b6b81`、`--mh-shell` `#e7f6f8`、`--mh-lagoon` `#17a2bd`、`--mh-lagoon-light` `#8fe6f0`，首屏与分栏渐变中段 `#0a5a75`。本层原先 13 处 `--color-primary*`（`#1a5f9e`/`#0d4471`/`#e4eefa`）已全部替换为上述 token，产物 computed style 里旧藏蓝 hex 命中 **0**；金色 `--color-accent`（分隔线小标与安心承诺图标）保留，读起来像沙滩暖调。
- **对比度是这次的主要风险，已逐对手算**：白字对 `#06384b`/`#0a5a75`/`#0b6b81` 分别 **12.5 / 7.7 / 6.1:1**；`.mhero__panel` 是半透明叠加，浅端合成后为 `#084c63`，白字 **9.4:1**；眉标 `--color-accent-soft`（`#f6ead0`）对 `#06384b` **10.5:1**；深字 `--mh-ink` 对白底 **12.5:1**、对 `--mh-shell` **11.3:1**、对 `--color-surface-alt` **11.4:1**。浅青 `#17a2bd`/`#8fe6f0` 仍只用于无文字的光斑与缩略色带（其上标签是白底深字）。`pnpm run audit` 实测 **0 error 0 warning**。
- **两处补的"整页都是马尔代夫蓝"**（18:28 复跑同一链路，仍 50 页 / 935 链 0 错 / guardrails 0 错 4 警 / audit 0/0）：① 交替区块底色由共享的冷灰 `#f1f5f9` 改为浅潟湖青 `--mh-shell` `#e7f6f8`（规则写在首页专用层，内页的 `.section--alt` 不受影响；`--color-ink-muted` 对其 **6.8:1**）；② 首页上的主按钮（「了解更多医疗信息」「浏览全部科普指南」与咨询表单的「提交咨询」）从藏蓝 `#1a5f9e` 转成 `--mh-sea-mid`，用 `.btn.btn--primary` 多一层类压过在本层之后加载的 `components.css`，hover 落 `--mh-sea-deep`。
- **浏览器实测（截图已出）**：`main` 内旧藏蓝 computed 值命中 **0**，3 个主按钮全为 `rgb(11,107,129)`，首图 `currentSrc` 指向 `/images/saipan-lagoon-aerial.jpg`、`naturalWidth 640`。**Header/Footer 仍是共享藏蓝**——这是"只换首页"拍板内的正确行为，不是漏改；要一起转色需他点头。中途一次 `scrollIntoView` 把标签页带去了 `/zh-hans/entry-path`（内页按钮仍是藏蓝，属设计内），已回到 `/` 复核。
- **实测链路（演示构建，18:21）**：typecheck 0 error → **60/60 测试** → `build:demo` **50 页** → validate:claims 99 文件 0/0 → links **935 条站内链 0 error**（比上轮 +1，新增的是图片资源引用面）→ `REVIEW=0` guardrails **0 error / 4 warning**（pending-slot 0、banner 0、占位文案 0、253 条向导建议链接全落已构建页）→ audit **50 页 / 1 sitemap / 6 本地资源 0/0**。产物核验：`dist/index.html` 有 1 个 `.mhero__photo`、alt 为简体塞班串、`mhero__lagoon` 命中 0、9 个 section、34 个内联 SVG。
- **文档已同步**：design-system 5.1「渲染」行改成 `heroImage` 由 `LandingLayout` 与根首页共用；5.2 小节标题去掉「无照片」，视觉/色值/对比度三行按本轮重写；`docs/seo/technical-seo-checklist.md` 图片 SEO 行撤销「根首页 `<img>` 数为 0」的说法。
- **本机浏览器限制**（本轮已解除）：窗口点到前台后 `take_screenshot` 可用，首屏两栏与整页截图均已出；此前报 `NATIVE_BROWSER_VIEWPORT_UNAVAILABLE`（`visibilityState=hidden`）时只能用 computed style 做结构验收。
- **仍未解决**：`og:image` 仍为空、无 `srcset`/多密度（阻塞项 12 未拍板）；第七轮遗留的「成功案例」正文缺口不变（全仓 0 篇 `patient_story`，缺的是授权案例不是代码）。

## 最新执行状态（第七轮 · 根首页无照片营销版，2026-10-14 18:01 本机时间）

> 用户给了老板希望的预览图（蓝色渐变简体医疗营销落地页）并拍板四件事：**先出无照片版**、目标形态为**演示构建 `build:demo`**、**根路径 `/` 直接渲染简体首页**、**只换首页**（内页、Header、Footer、共享组件不动）。本轮范围就是 `src/pages/index.astro` + 新增的 `src/styles/marketing-home.css` + 4 条导航文案。

- **根首页改版**：`/` 由「三语根选择页」改为简体营销首页，9 个 section（首屏 / 信任条 / 为什么选塞班 / 医疗服务 / 全流程支持 / 适用人群 / 资讯 / 安心承诺 / 咨询表单），`lang=zh-hans`、`noindex=false`、canonical `/`。首屏 h1「遵循严谨医学标准，提供透明辅助生殖方案。」+ 副句「塞班 IVF，您的安心之选。」，四个卖点 chip 以**免签/线上授权**打头（沿用「免签前置」口径，禁词 `无需签证`/`免签保证` 未触碰）。**0 张 `<img>`**，视觉由渐变面板与 34 个内联 `aria-hidden` SVG 图标承担。
- **样式层边界**：新层只被 `index.astro` 引入，内页产物拿不到 `.mhero`/`.mcard` 等类；首页专用海色写在本层 `:root`（唯一允许脱离 tokens 定义颜色的位置，详见 design-system 5.2）。白字只压深段渐变，最浅 `#1a5f9e` 对白字手算 **6.6:1**；浅海色 `#2f9ec4` 只做无文字装饰带。早前 `.msplit__caption` 压在 `#2f9ec4` 上只有 3.08:1，已把两处渐变压暗修掉。
- **内链一律过可见性闸门**：`link()` + 新增 `anyLink(候选…)` 取第一个本次真实构建出来的落点。原版有 4 个 CTA 因简体对应页不存在而**整块消失**（首屏白底主按钮、「了解我们的服务」按钮等），现已给每个入口配了已存在的备选页（例如 医院与实验室 → `programs/ivf-icsi`、法律与政策 → `articles/entry-policy-change-what-to-check`）。根首页内链从 19 条升到 30 条，`links` 仍 0 broken。
- **导航文案（繁简各改）**：`nav.programs` 方案 → **生育方案**；`nav.patient_stories` 患者经历/患者經驗 → **成功案例**；简体 `nav.why_saipan` 与 `section.why_saipan`「为什么选择塞班」→ **中国政策允许**（繁侧保留「為何選擇塞班」，因为它正挂着已构建的 `/zh-hant/why-saipan` 页，改成政策口径会文不对题）。键数不变（179×3），`facts.test.ts` 三语键集 parity 仍绿。
- **「成功案例」这一项现在不会出现在导航里**：入口由 `NAV_SPEC`（`src/lib/content.ts:136`）按可见性生成，而全仓库 **0 个 `patient_story` 正文页**（清单 5 行 patient_stories 只有工作标题，`content/` 下没有对应 MDX）。要让简体头部真的出现这一项，必须先有至少一条**经书面授权**的案例正文；本轮没有伪造患者经历，也没有建空列表页（空列表 = 用户明确否掉的「点进去是空的入口」）。
- **「美国标准」没写进文案**：该词属 4.5「无可核验凭据的资质宣传」禁词族，写成「美国医疗标准」只是插词绕过正则、仍违反 `docs/compliance/prohibited-claims.md` 第 5 行的口径，因此改用事实性的「美国医疗体系」。**未新增禁词、未改 `claims.ts` 规则**。
- **实测链路（演示构建，18:01）**：typecheck 0 error → validate:content 180 行清单/48 篇 MDX/未建页 132 0 error → validate:policy 0/2（ja/ko 未启用，设计内）→ validate:claims 100 文件 0/0 → **60/60 测试** → `build:demo` **50 页** → validate:seo 0/0 → links **934 条站内链 0 error** → `REVIEW=0` guardrails **0 error / 4 warning**（pending-slot 0、banner 0、占位文案 0 命中、253 条向导建议链接全落已构建页）→ audit **50 页 0 error 0 warning**。浏览器实测（视口 854px）：无横向溢出、9 个 section、0 张图、`#consult` 表单与 4 个 select 就位、`.btn--light/.mhero__actions/.mcard__tag/.mpoints__icon/.mline__icon` 五条样式全部命中计算值。
- **共享产物归属**：`dist/` 与 `docs/testing/audit-report.md` 被本轮演示构建覆写（此前是另一轮的预览构建产物，17:48 版报告已备份到本机临时目录 `/tmp/mhv/audit-report.before-*.md`）。`data/site-config.json`、`content/page-manifest.csv` 与 `content/*/articles/*` 本轮**未动**，仍归并行写作的那一轮。
- **本机浏览器限制**：应用内浏览器视口 0×0/hidden，`take_screenshot` 与 Tabbit 建页均失败 → 视觉验收只能靠 snapshot + computed style，**1280px 宽屏的两栏版式未做目视确认**。



## 最新执行状态（第六轮 · 首页首图替换，2026-10-14 17:11 本机时间）

> 范围只有一个：把首页首图从 NASA 太空记录照换成用户提供的塞班海岸航拍实景。本轮未改动任何事实数据、内容页与样式 token。**本节点名「视觉轮 1. 首图」小节的「落位」「文案」两行已被本轮取代**（选型过程那三行失败路径保留，仍有效）。

- **素材**：用户给的是 `C:\Users\nec01\Downloads\企业微信截图_17919683857432.png`（725×405、RGBA、742,738 B、无 EXIF/ICC）。离线缩到 640 宽等比 → **`public/images/saipan-lagoon-aerial.jpg`，640×358，26,763 B**（mozjpeg、quality 72、progressive、`.rotate()` 吃掉方向标记、未裁剪未拉伸）。比旧图轻 52,437 B。
- **为什么是 640×358 而不是硬凑 640×427**：新图 1.79:1，旧槽 3:2，直接改尺寸会拉伸变形；`.hero-figure` 的 `max-width: 640px` 与 `img{width:100%;height:auto}` 只依赖宽度，所以把 `heroImage.width/height` 一起改成 640×358 即可，比例保持原图。frontmatter `hero.image` 的覆盖约定随之改为 **640×358**（design-system 5.1 已同步）。
- **sharp 的用法边界**：本机 `node_modules/.pnpm/sharp@0.34.5` 确实可用（用绝对路径 require 成功，`versions` 含 mozjpeg/webp）。本轮只在**离线一次性预处理素材**时用了一次，产物是 `public/` 里的静态 JPEG；**没有** `pnpm add sharp`、**没有**接进构建链，`astro.config.mjs` 与 `config.ts` 的「构建期不做 sharp 优化」口径不变。阻塞项 12（是否为 WebP/`srcset` 正式引入 sharp）仍未拍板。
- **题注按用户拍板删除**：`hero.image_credit` 键从三语字典整体移除（不是留空），`index.astro` 与 `LandingLayout.astro` 的 `<figcaption>` 一并删掉，`components.css` 里失效的 `.hero-figure figcaption` 规则删除。理由：新图来源与商用授权链未书面确认，按 5.1「题注只写可核验来源信息」宁缺不编。i18n 键数 **180 → 179 × 3 语**，三语键集仍一致（`facts.test.ts` 的 `missingKeys/extraKeys` 绿）。
- **alt 按用户要求点名塞班**：繁「塞班島航拍：碧綠潟湖環繞的白色沙嘴與海岸林」／简同形／英 "Aerial view of Saipan: a white sandbar and coastal forest ringed by a turquoise lagoon"。用户已确认该图确为塞班实拍，因此地点主张成立；画面里没有可定位地标，所以**不写具体海滩名**。
- **旧素材未删**：`public/images/saipan-marianas-sts103.jpg`（79,200 B）已无任何引用，但本工作区不是 git 仓库、删了不可回退，故原地保留作回退副本。要清掉需先确认，删时同步 5.1 与 seo-checklist 的体积行并重跑 audit。
- **实测链路**：typecheck 0 error → **60/60 测试** → 生产构建 2 页 → validate:seo 0/0 → links（生产）0 error/6 链 → **guardrails 0 error / 4 warning** → audit **0/0**（报告已刷新为生产模式，资源表首图 26,763 B）→ 预览构建 46 页 → links 827 链 0 错。产物核验：15 个含 `hero-figure` 的页面全部指向新图、`figcaption` 命中 0、旧图名命中 0，三语 alt 各就各位。**dist 最终留在预览构建（46 页）状态**，供 `pnpm run preview:serve` 目检。
- **仍未做**：`og:image` 仍为空（品牌与素材授权未定）；无 `srcset`/多密度——640 CSS px 在 2x 屏上仍会放大，要改善需先拍板阻塞项 12。

## 最新执行状态（第五轮 · 缺陷修复轮，2026-10-14 15:57 本机时间）

> 本节为当前真相；上方第四轮的 58 测试 / 650 链 / 38 MDX 三个数字已被本轮实测取代，见「对第四轮的更正」。

- 当前阶段：**缺陷修复轮**。独立复核第四轮成果后发现的 4 个「声明已完成、运行时不成立」缺陷全部修复，并加断言防回退。本轮未新增内容页、未改动任何事实数据文件。
- 阶段状态：**READY_FOR_REVIEW**。实测链路：typecheck 0 error → 内容/入境/数据/话术校验 0 error（数据校验 2 warning 仍为 ja/ko 未启用，设计内）→ **60/60 测试** → 生产构建 2 页 → validate:seo 0/0 → links 0/0 → **guardrails 0 error / 4 warning** → audit 0/0。演示构建 42 页 **749 链** 0 错、HTML 内外壳标记（`pending-slot`、横幅、`DRAFT`、`待院方`）命中 0；预览构建 42 页 749 链 0 错、`pending-slot` 63 / 横幅 117 仅计数不报错（预览是唯一允许外壳的形态）。
- **对第四轮的更正（以本轮实测为准）**：MDX 实为 **40**（用户随后自建 2 篇方法文）；单测实为 **60**；演示/预览内链实为 **749** —— 差额来自向导建议链接由客户端拼接改为 SSR 渲染，链接闸门第一次真正覆盖到这批链接。

### 一、修了什么

1. **浮动「评估向导」按钮点了没反应**：`BaseLayout.astro` 对所有带表单的页无条件传 `wizardAnchor="#wizard"`，但向导容器没有 `id="wizard"`，锚点目标不存在。现向导容器补 `id="wizard"`，`BaseLayout` 新增 `hasWizard` 显式 prop（仅 `LandingLayout` 传 `withForm`），`ContentLayout` 保持默认 `false` —— 不渲染向导的页（科普列表、FAQ、工具页等）不再出现这个按钮。
2. **向导「建议阅读」链接指向不存在的页**：`ProgramFitWizard.astro` 客户端硬编码 `CONCERNS` 表，把所有语言都链向 `/programs/ivf-icsi`、`/pricing`、`/faq`，而 zh-hans 无 faq/pricing、en 无 faq —— 点了就是 404，且因为是 JS 注入，`check-links` 与 `guardrails` 都看不见。现删除客户端重复表，SSR 用已有但从未被引用的 `buildVisiblePaths()` 过滤本次构建真实渲染的落点，以 `data-wizard-data` JSON 注入；某语言一个建议页都没有时整块隐藏。原 `visiblePaths`/`suggestions`/`langPrefix` 三处死代码转为实际数据源。
3. **对照表替院方作答**：`ComparisonMethod.astro` 的 `ours` 列写成「應答：實驗室為院內自建，監測與培養在同一地點完成（待院方確認）」——未经核实的机构事实断言，且与所在科普文「在此之前不列出任何說法」自相矛盾，同时破坏演示构建「`待院方` 0 命中」标准。现改为方法口径「要求出示：……的書面說明」（三语 × 3 行全改），表头 i18n 键 `comparison.ours` 由「我方口径 / Our approach」改为「我方要求出示 / What we ask to see」。
4. **guardrails 覆盖面两个洞**：检查①的外壳标记错误只在 `isDemo` 分支触发，生产构建含 `pending-slot`/横幅也只计数不失败；且正则 `class="banner"` 匹配不到 `class="banner banner--info"`（表单未接入横幅）——计数本身漏网。现改为整词匹配 `class="…\bbanner\b…"`，断言条件改为「非预览构建」（`INCLUDE_DRAFTS=1 && REVIEW!==0` 之外一律必须为 0），生产与演示同标准。
5. **新增检查④**：把修复 2 的成果固化——扫描各页 `data-wizard-data`，逐条断言其中的 href 确实渲染成页；SSR 注入使这批链接第一次变成静态可审计对象。实测演示/预览各 253 条全部命中，0 异常。
6. **向导控件触发 audit 闸门 42 错**（修复 1–5 后跑 `pnpm run audit` 才暴露，属第四轮 14:50 建向导时的回退，其 14:28 记录的「预览/演示 audit 0/0」测于向导存在之前）：`scripts/audit-dist.ts` 对页面上每个具名 `input/textarea` 要求 `name` 命中表单字段白名单，而向导的 `wizard-age`/`wizard-country`/`wizard-past-treatment` 是纯客户端输入、从不提交——14 个含向导的页 × 3 控件 = 42 error。修法：向导 5 个控件全部去掉 `name`（保留 `id` 与 `<label for>`，脚本选择器改 `#wizard-program`），从根上消除「可提交字段」的歧义；同时把 audit 的可访问名判定由「无 name 就跳过」改为「有 name 或有 id 都要查」，避免摘 `name` 反而让向导输入脱离 label 检查。改后演示构建 audit **0 error / 0 warning**，且未放宽任何阈值。
7. **audit 报告把演示包标成生产包**（第 6 项排查时扫报告头部顺手发现，风险高于前 6 项）：报告「构建模式」只判断产物里有没有 `>DRAFT<` 横幅，而演示构建（`REVIEW=0`）按设计就没有横幅——于是 42 页含草稿的演示包被写成「生产（产物内无草稿横幅）」，而本文件禁令恰恰是「报告头部显示预览就禁止上传」。这条误判等于给可上传发了通行证。修法：改三态——有 `>DRAFT<` 判预览；无横幅但产物里存在不在 sitemap 的页（`/404` 与根选择页除外）判演示并给出该页数；两者皆无才判生产。**已实测**：44 页预览包正确判为「预览」。**未实测**：「演示」分支——改完时 `dist/` 已被并行 agent 重建为预览包，我不能再动构建；复检 `pnpm run build:demo && REVIEW=0 INCLUDE_DRAFTS=1 pnpm run audit`，预期头部为「**演示**（产物含 40 个未上线页…）」，旧版此处曾误标「生产」。

### 二、本轮改动文件

- `src/layouts/BaseLayout.astro`（`hasWizard` prop + 向导槽位条件化）
- `src/layouts/LandingLayout.astro`（传 `hasWizard={withForm}`）
- `src/components/ProgramFitWizard.astro`（`id="wizard"`；删客户端 `CONCERNS`；SSR 可见性过滤 + `data-wizard-data`）
- `src/components/ComparisonMethod.astro`（`ours` 列三语改方法口径）
- `src/lib/i18n.ts`（`comparison.ours` 三语表头文案）
- `scripts/guardrails.ts`（检查①整词匹配 + 非预览断言；新增检查④）
- `scripts/audit-dist.ts`（可访问名判定改为「有 name 或有 id 都查」）
- `src/components/ProgramFitWizard.astro`（同上第 6 项：控件去 `name`）
- 未改动：`content/**`、`data/**`、`tests/**`（现有 60 测试无一下滑，向导与对照表均无测试锁定旧文案）

### 五、本轮结束时的工作区状态（供下一位对齐，勿凭记忆覆盖）

- 修复 1–6 的验证全部在 15:48–16:00 完成：typecheck 0、60/60 测试、生产 CI 链（2 页）0 error、演示构建 42 页 749 链 0 错 + guardrails 0 error + audit 0/0、浏览器逐步点击（步骤机 1→2→3→结果、链接全 200、console 无 error/warn、6 项资源全 200、向导内 0 个具名控件）。
- 16:01 我再跑 `pnpm run ci` 时出现 2 个 `validate:content` error——**不是本轮改动引起**：并行工作的 agent 于 16:00:55 与 16:02:02 新建 `content/{zh-hans,zh-hant}/articles/us-born-baby-advantages.mdx`，清单行到 16:02:20 才补上；16:03 复查 `validate:content` 已回到 0 error，清单 172 → **174 行**、MDX 40 → **42 个**。我发现后立刻停写，未编辑他的文件、未再触发构建。
- 当前产物归属（16:05 实测，勿凭本节之前的描述推断）：`dist/` 是**并行 agent 的预览构建**（44 页，`dist/zh-hant/articles/index.html` 含 `>DRAFT<` 横幅，已含他新建的 `us-born-baby-advantages` 两页）。我 16:01 那次 `pnpm run ci` 在 `validate:content` 就中止，**从未走到 build**，所以 dist 不是我产出的。
- 我于 16:04 对自己的新构建模式判定跑过一次 `pnpm run audit`，对象正是他这份 44 页预览包，结果 0 error / 0 warning，并因此**覆写了 `docs/testing/audit-report.md`**（该文件现描述预览包，头部正确标注「**预览**（含草稿横幅，禁止指向生产）」）。这是我本轮唯一一次写到共享产物上，此后停手，未再触发任何构建。
- 接手第一件事：按顺序串行复检并把 dist 收回可演示形态——`pnpm run build:demo && pnpm run links && REVIEW=0 INCLUDE_DRAFTS=1 pnpm run guardrails && REVIEW=0 INCLUDE_DRAFTS=1 pnpm run audit`。预期：44 页、内链数略高于本轮实测的 749、audit 头部由旧版误标「生产」变为「**演示**（产物含未上线页数）」——这也是第 7 项唯一未实测的分支。
- 本轮 1–6 项的验证数字（749 链 / 253 条向导建议 / 42 页 / 14 个含向导页）测于他补入 2 篇科普文之前，复检后会小幅上浮，属正常，不是回退。

### 三、浏览器实测（演示构建 + 本地 4321）

- `/zh-hant`：`document.getElementById('wizard')` 存在且即向导容器本体；选 `donor_egg` → 结果区可见、4 条关注点、3 条链接 `/zh-hant/programs/ivf-icsi`、`/zh-hant/pricing`、`/zh-hant/faq` 全部 `fetch` 返回 **200**。
- `/zh-hans`：选 `ivf` → 仅给出 `/zh-hans/programs/ivf-icsi`（**200**），原先必然 404 的 faq/pricing 已被过滤；页面上不再存在悬空 `href="#wizard"`。
- `/zh-hant/articles`、`/zh-hant/faq`、`/zh-hant/tools`：`data-program-wizard` 命中 0、`href="#wizard"` 命中 0（与修复前相反）。
- 未覆盖：像素级视觉、真机读屏。

### 四、下一位的唯一下一步

阻塞项不变（git 未初始化、ADR-002 表单契约未回填、0 页 published）。本轮 5 项修复无遗留；若继续对标方案 v4，未实施的批次 1 项为 schema 矩阵（BreadcrumbList / FAQPage / MedicalWebPage / Physician）、文章页内 TOC 与文内 FAQ、工具层「计算口径 + 依据来源」两格。

## 一、阶段结论（对标优化轮）

按批准实施第 1/3/4/5/6/7 项（第 2 项 methodology 透明度页按用户要求不做）：

1. **信息架构补层（项 1）——工具层落地**：新增 `tools` 模板（必填三要素：fee-comparison / stay-estimator / tool-disclaimer）；清单 +5 行（zh-hant/zh-hans/en draft、ja/ko blocked），清单 167 → **172 行**；`site-config.json` 各语言配额同步 +1（47/47/36/21/21）；导航新增「工具」入口（`nav.tools`）。
2. **互动工具（项 4）**：`ProgramFeeTable.astro`（费用对照表）与 `StayEstimator.astro`（停留天数试算，客户端选择器）从 `programs.json` 寄存器渲染，均以 31 天复核窗口为闸门——**界面始终渲染**：费用对照表列出全部方案，未确认行显示「未公布」；试算器下拉列出全部方案，选择后显示「尚未公布——将于院方书面确认后公布」；`data/programs.json` 新增 `stay_last_verified` 字段（9 条记录均 null）。
3. **标准化模板（项 3）**：`tools` 模板沿用同一 frontmatter 模型与槽位模式；program 模板的六要素标准化保持不变。方案指南层 = program 模板 + success_data + legal 的组合覆盖，无需新模板。
4. **sitemap 策略（项 5）**：新增 `sitemapEntryPolicy()` 按模板分层——首页 weekly/1.0；文章/科普/城市/方案/捐卵 weekly/0.8；费用/入境/医院/数据/FAQ/工具 monthly/0.7；法律/案例/医生 monthly/0.6；`languageSitemap` 每条 URL 输出 `changefreq`+`priority`，根选择页 weekly/1.0。
5. **时效性框架（项 6）**：frontmatter 新增 `valid_until` 字段（schema/规则/布局全线贯通）：声明有效期必须同时有 `last_verified`、须为 YYYY-MM-DD、已过期只告警不阻断；`ValidUntilNote.astro` 在页面头部展示「本页资料有效期至 …」。时效运营落点不变：入境规定变动类文章（用户已写 2 篇）即该模式的实践。
6. **技术验证（项 7）**：对标站同为 Astro 且 GA4 延迟加载与本项目 `initAnalytics()` 同款——选型与修复方向获行业实践印证，无代码改动。
7. **凑数内容（经用户批准）**：清单已登记但未建的 `article_documents_before_first_visit`（首次就医前需要准备的文件）以方法导向草稿建成繁/简 2 页——不列任何具体文件要求，只整理该问什么、回答记在哪、出发前为何再核对；与用户先写入境核对文同一模式。
8. **修复 3 个既有框架缺陷**（本轮 typecheck 暴露，非本轮引入）：`EntryPolicyRecord` 接口与 `entry-policy.json` 实际结构不符——`nationality` 应为 `label`、`mainland_us_access` 是文字说明非布尔、`transit_constraints`/`alternative_programs` 是文字非数组。TS2352 曾阻断 typecheck；且 `EntryPolicyTable.astro` 对文字字段调 `.join()`、把说明文字当布尔渲染、`official_source` 读 `label` 实际为 `name`——记录转 verified 后会运行时报错。本次把接口与组件全面对齐数据结构。
9. **工具页界面修复（用户反馈驱动）**：初版组件设计为「无 verified 数据时整模块不渲染」，导致工具页只剩标题与说明文字（用户反馈「工具点不开，就只是做了字符」）。改为**界面始终渲染 + 空状态文案**：费用对照表列出全部方案、未确认行显示「未公布」；停留试算器下拉列出全部方案、选择后显示「尚未公布——将于院方书面确认后公布」。同时为 zh-hans/en 补建 `programs/ivf-icsi.mdx` 方案页骨架（纯 FactSlot 槽位，无事实内容），使三个语言的工具页均有完整界面；院方填入费用/停留天数后工具自动显示数字，无需再改代码。

## 二、交付物路径

- 代码（修改）：`src/lib/sitemap.ts`（`sitemapEntryPolicy`、changefreq/priority 输出）、`src/lib/page-rules.ts`（`tools` 模板、`TOOLS_REQUIRED_SECTIONS`、`valid_until` 规则）、`src/content.config.ts`（`valid_until` schema）、`src/lib/content.ts`（`valid_until`、`TEMPLATE_PAGE_TYPE.tools`、`nav.tools` 导航）、`src/lib/i18n.ts`（12 个新键 × 3 语言）、`src/lib/facts.ts`（`programFeeRow`/`programStayOption`、`EntryPolicyRecord` 对齐）、`src/components/EntryPolicyTable.astro`（渲染对齐数据结构）、`src/layouts/ContentLayout.astro`（接 `ValidUntilNote`）、`src/styles/components.css`（`.valid-until`、`.stay-estimator`）、`data/programs.json`（`stay_last_verified`）、`data/site-config.json`（配额 +1）
- 代码（新增）：`src/components/{ProgramFeeTable,StayEstimator,ValidUntilNote}.astro`
- 内容（新增）：`content/{zh-hant,zh-hans,en}/tools.mdx`、`content/{zh-hant,zh-hans}/articles/documents-before-first-visit.mdx`、`content/{zh-hans,en}/programs/ivf-icsi.mdx`（方案页骨架，纯 FactSlot 槽位）
- 清单（修改）：`content/page-manifest.csv`（+5 行工具层，172 行）
- 测试（修改）：`tests/unit/{content,page-rules,seo,facts}.test.ts`（+4 用例：工具页三要素、valid_until、sitemap 分层、工具层数据源；根选择页 sitemap 断言随 XML 形态更新；清单断言 167 → 172）
- 文档（修改）：`README.md`（172 行 / 38 MDX）、`docs/handoff/STATUS.md`（本节）

## 三、测试结果（本轮实测）

- CI 顺序全链路：typecheck 0 error（含修复既有 TS2352）；`validate:content` 0/0（清单 172 行 / MDX 38 / 未建 134）；`validate:entry-policy` 0/0；`validate:data` 0 error / 2 warning（ja、ko 未启用，同前）；`validate:claims` 0/0；**test 58/58**；生产 build 2 页；`validate:seo` 0/0；`check-links` 2 页 6 链 0/0；`audit-dist` 0/0。
- `build:preview`（INCLUDE_DRAFTS=1）：42 页 / 650 链 / links 0/0 / audit 0/0；工具页渲染完整界面——费用对照表列出方案行（未确认列显示「未公布」）、停留试算器下拉列出方案（选择后显示「尚未公布」）。
- `build:demo`（INCLUDE_DRAFTS=1 REVIEW=0）：42 页 / 650 链 / 0 error / 0 warning；外壳标记（`pending-slot`、`class="banner"`、`DRAFT`、`待院方`、`docs/compliance`、`尚未接入`）全部 0 命中；工具页界面完整、无槽位痕迹。
- 链接闸门本轮拦下并修正 3 处跨语言硬链接：zh-hans 无 pricing/faq 页、en 无 faq 页（清单已登记但未建），MDX 已改为只链接该语言实际存在的页面。
- 用户在本轮期间又建成 2 篇草稿文章（`price-ranges-and-addon-items` 繁/简）——闸门按设计放行，MDX 计数 36 → 38。

## 四、阻塞事项 / 需要用户决定

- 工具层内容（费用区间、停留天数）待院方书面确认后自动渲染——框架已就绪，无需再改代码。
- 新增待决策：`valid_until` 是否在首批上线页启用；工具层页面（P1-core）是否随 P1 核心页一起进入首批审核。
- 1–17 项历史阻塞继续生效（ADR-002 表单 API 契约仍为唯一阻塞解除动作）。

## 五、下一阶段启动指令（只给指令，不自动执行）

- 唯一阻塞解除动作不变：向项目负责人索取 **ADR-002 表单 API 契约的书面回填**。
- 院方书面提供费用与停留天数后：填入 `data/programs.json` 对应记录（`price_range`/`price_currency`/`price_last_verified`、`stay_days`/`stay_last_verified`），工具层自动渲染——先跑完整 CI 链再更新本文件。

## 禁止下一位 Agent 擅自做的事（对标优化轮补充）

- 不得在 MDX 中硬链接该语言尚未构建的页面（如 zh-hans 的 pricing/faq、en 的 faq）——链接闸门会拦截；页面建成后再补链接。
- 不得把 `EntryPolicyRecord` 改回布尔/数组形态——数据结构以 `entry-policy.json` 实际记录为准。
- 不得在 YAML frontmatter 的纯量值中使用未加引号的 `: `（英文冒号+空格），会导致构建期 frontmatter 解析失败。
- 不得实现 methodology 透明度页——用户已明确排除（本轮第 2 项不做）。
- 其余禁令（见下方各轮记录）全部继续生效。

---

# 上一轮记录（对标分析轮，2026-10-14）

> 对标优化轮（2026-10-14 稍晚）按用户批准实施第 1/3/4/5/6/7 项：工具层落地（tools 模板 + 费用对照表 + 停留试算器）、sitemap changefreq/priority 分层、valid_until 时效性框架、导航与 i18n 扩展、3 个既有类型/渲染缺陷修复、2 篇凑数文章。测试 54 → 58，清单 167 → 172 行。第 2 项 methodology 页按用户要求不做。

- 更新时间：2026-10-14（本机时间，第三轮）
- 当前阶段：**对标分析轮**（用户指令「https://ivfnext.com/ 是我们的对标网站之一，你看看这个网站有什么我们可以吸取的优点并给出优化方案，注意目前不需要具体到文章内容，而是整个网站的规划」→ 纯分析：不改代码、不改内容、不改审核状态）
- 阶段状态：**READY_FOR_REVIEW**（继承一致性修复轮；本轮无文件改动，CI 链路无需重跑）。
- 当前分支与 commit：**无法填写 —— 本工作区仍不是 git 仓库**（阻塞项 1 继续生效）。本轮未 init、未 commit、未建分支。

## 一、阶段结论（对标分析轮）

实测拆解 ivfnext.com（繁中跨国 IVF 诊所比较平台，Astro 构建，GA4 延迟加载）：

**对标站结构（8 大板块）**：home / about / methodology（透明度页：资料来源、揭露什么、利益关系）/ hospitals（8 国 60+ 诊所目录，按国家分组，评分+评论数+服务标签）/ guide（六种治疗方式标准化指南：适用对象/流程/费用/成功率/法规）/ blog（约 30 篇、高频更新、每篇标来源与查核日期）/ subsidy（台湾补助试算工具）/ hospitals/{slug}（单诊所详情：费用表、服务语言、同志友善度、国际患者、患者评论）。

**七项可吸取的优点**：
1. **信息架构分层**：入口→指南→目录→详情→工具→博客，每层搜索意图明确。本项目已有 home/programs/cities/articles/legal 层，缺「工具层」与「透明度方法页」。
2. **methodology 透明度页**（最值得吸收）：其「资料不足或无法查证时直接标示为未提供，不以推估数字填补充」原则与本项目合规模型（fact_sources / last_verified / 缺事实留空）完全同构，但本项目尚无对外页面说明该机制——E-E-A-T 加分项。
3. **标准化模板**：对标站 guide 与本项目 program 模板（suitability/exclusions/process/stay/risks/price_range）同构，继续保持并按院方确认的服务范围扩展方案矩阵。
4. **互动工具**（subsidy 试算器）：实用工具提升停留时间与转化；本项目可做费用区间对照/行程天数试算，但数字必须全部来自已核实事实库，无事实时显示待确认。
5. **sitemap 策略**：changefreq/priority 分层 + lastmod；本项目目前只有 loc+lastmod（框架层可增强，不涉事实）。
6. **时效性内容运营**：对标站围绕 2026/9/1 补助新制发布时效文章；本项目 entry-policy 层已规划，用户新加的「入境规定变动核对」文即同思路。
7. **技术验证**：对标站同为 Astro，其 GA4 延迟加载（交互后加载）与本项目修复后的 `initAnalytics()` 同款——技术选型与修复方向获行业实践印证。

**三类不能照搬**：第三方诊所目录与评分评论（比较平台定位；评分/评论需逐一核验授权，与院方官网定位冲突且有利益关系披露风险）；「推荐榜单」式表达（医疗广告合规风险）；台湾补助试算（与塞班官网业务关联属市场定位决策，需院方拍板）。

**优化方案（分层，待批准后实施）**：
- 框架层（不涉事实）：① 新增「信息核对方法」页对外说明事实核对机制（清单 +N 行，167 冻结规则 → 重新登记决策，同科普 hub 先例）；② sitemap 增加 changefreq/priority（首页 weekly/1.0、文章与城市页 weekly/0.8、静态页 monthly/0.6–0.7，lastmod 仍只取 last_verified）；③ schema.org 扩展：现有 MedicalOrganization JSON-LD（缺字段不输出已实现）→ 增 FAQPage/Article，全部字段从已核实事实库渲染；④ 内链矩阵规范化（方案↔城市↔文章↔FAQ 交叉链接槽位）。
- 需院方事实（blocked 类）：工具层数字、programs 方案矩阵扩展（IUI/冻卵/借精等需院方确认服务范围）、患者评论（需书面授权，patient_story 模板已规划）。
- 需拍板决策：methodology 页与工具页是否入清单；博客更新节奏（对标站 daily，本项目 article 层 20 篇 P2）；是否做台湾客群专属内容；多语言优势保持（对标站仅繁中，本项目 zh-hant/zh-hans/en + 日韩预留，客源覆盖是优势，P3 前置条件不变）。

**现有基础确认（优化落地点）**：`last_verified` 已在模板层全线贯通（FactSlot/SourceNote/FlightTable/EntryPolicyTable/FAQList/DoctorCard/ContentLayout/LandingLayout）；robots.txt 已指向 sitemap-index.xml；`organizationJsonLd()` 已实现「缺字段不输出」。

## 二、交付物路径

- 本轮无代码/内容改动；交付物为分析结论（本节）与下列交接记录。

## 三、测试结果（本轮实测）

- 继承上一轮全绿结果（typecheck 0 error、校验 0 error、54/54 测试、生产构建 2 页、validate:seo/links/audit 0/0）；本轮未改动任何文件，无需重跑。

## 四、阻塞事项 / 需要用户决定

- 新增待决策：methodology 页与工具页是否登记进清单（167 行冻结规则）；sitemap changefreq/priority 与 schema.org 扩展是否实施；博客更新节奏；台湾客群专属内容定位。
- 1–17 项历史阻塞继续生效（ADR-002 表单 API 契约仍为唯一阻塞解除动作）。

## 五、下一阶段启动指令（只给指令，不自动执行）

- 唯一阻塞解除动作不变：向项目负责人索取 **ADR-002 表单 API 契约的书面回填**。
- 若用户批准「对标优化方案」，按登记顺序实施框架层四项（方法页登记 → sitemap 增强 → schema 扩展 → 内链矩阵），每项实施后按序串行跑完整 CI 链并更新本文件。

## 禁止下一位 Agent 擅自做的事（对标分析轮补充）

- 不得照搬对标站的第三方诊所目录、评分评论或推荐榜单——既无事实授权，也与院方官网定位冲突。
- 不得把对标站的台湾补助规则当作本站事实——属市场定位决策且需院方书面确认。
- 不得在未登记清单前新增页面（167 行冻结规则，偏差需重新登记决策）。
- 其余禁令（见下方各轮记录）全部继续生效。

---

# 上一轮记录（一致性修复轮，2026-10-14）

> 对标分析轮（2026-10-14 稍晚）完成 ivfnext.com 对标分析：七项可吸取优点（信息架构分层、透明度方法页、标准化模板、互动工具、sitemap 策略、时效性运营、技术验证）、三类不照搬（第三方目录/评分评论/推荐榜单/台湾补助）、框架层四项优化待登记批准。本轮无代码改动。

- 更新时间：2026-10-14（本机时间，第二轮）
- 当前阶段：**一致性修复轮**（用户指令「继续」→ 处理上轮列出的框架一致性项 6–11；仍只做框架，不涉及内容与事实数据）
- 阶段状态：**READY_FOR_REVIEW**。按 CI 顺序全链路实测全绿：typecheck 0 error → 内容/政策/话术校验 0 error → **54/54 测试**（48 unit + 2 新 SEO unit + 4 新集成）→ 生产构建 2 页 → validate:seo（本次产物）0/0 → links 0/0 → audit 0/0；预览/演示构建 33 页 458 链 0 错、演示外壳标记 0 命中。
- 当前分支与 commit：**无法填写 —— 本工作区仍不是 git 仓库**（阻塞项 1 继续生效）。本轮未 init、未 commit、未建分支。

## 一、阶段结论（一致性修复轮）

修复 6 项框架一致性问题（均为工程规范，不改任何内容、事实数据与审核状态）：

1. **README 数字过期**：「165 行清单 / 17 个 MDX / 45 个断言」同步为实际的 **167 / 29 / 54**，并注明 167 = 165 冻结值 + 2 行经批准的科普 hub 结构页（偏差指向 STATUS.md）；目录树补 `tests/integration` 与 `tests/e2e` 两行。
2. **`og:locale` 格式不符 OG 协议**：原输出语言代码（`zh-hant`），搜索引擎不认。新增 `seo.ogLocale()`（zh-hant→`zh_TW`、zh-hans→`zh_CN`、en→`en_US`、ja→`ja_JP`、ko→`ko_KR`，未知回退 `en_US`），`BaseLayout` 改用它；产物实测 `<meta property="og:locale" content="zh_TW">`。
3. **integration/e2e 空目录**：新增 `tests/integration/form-pipeline.test.ts`（4 条用例：合法输入的管道组合契约、病历字段在 payload 层被丢弃、缺必填项首步拦截、提交耗时反滥用）；`tests/e2e/README.md` 登记文档 8.2 五项验收的落地规划与前置条件（浏览器运行器属依赖决策，未擅自引入），`package.json` 的 `test` 脚本纳入 integration 目录。
4. **空语言 sitemap 分片**：`sitemap-index.xml.ts` 原对三个启用语言一律生成 index 条目，无已上线页的语言会提交空 urlset。新增纯函数 `sitemap.sitemapIndexLanguages()`：只列出有已上线页的语言，默认语言恒列入（根选择页由它提交）；实测当前产物 index 只含 `zh-hant` 一条。
5. **7 处内联 `style`**：全部收敛进 `components.css` 的新类（`.faq-list .card`、`.consent__title`、`.consent__body`、`.draft-banner`、`.prose--padded`、`.source-note--spaced`、`.card-list-reset`），涉及 FAQList / ConsentNotice / DraftBanner / ContentLayout / index / 404；`src/**/*.astro` 内联样式实测 **0 处**，样式仍只集中在三个 CSS 文件。
6. **`seo.ts` 死代码**：`hreflangAlternates` 中 `page.path === normalizePath(path)` 为恒真过滤（path 本就无尾斜杠），已移除。
7. **本轮检查期间出现 2 篇新草稿文章**（非本 Agent 所写，按用户工作保留）：`content/{zh-hant,zh-hans}/articles/entry-policy-change-what-to-check.mdx`——`status: draft`、`noindex: true`、与清单 `article_entry_policy_change_what_to_check` blocked 行对应；结构校验、简繁混排、风险话术、清单对账、blocked 行不得 approved/published 等闸门全部按设计通过（validate-content 0/0、test 54/54）。预览与演示构建因此从 31 页变为 **33 页**、链接 425 → **458**。这正是发布闸门的预期行为：新增 MDX 只要合规则自动进入预览，构建层无需改动。

## 二、交付物路径

- 代码（修改）：`src/lib/seo.ts`（`ogLocale`、死代码移除）、`src/lib/sitemap.ts`（`sitemapIndexLanguages`）、`src/pages/sitemap-index.xml.ts`（GET 改异步并过滤空分片）、`src/layouts/BaseLayout.astro`（`ogLocale`）、`src/layouts/ContentLayout.astro`、`src/components/{FAQList,ConsentNotice,DraftBanner}.astro`、`src/pages/{index,404}.astro`、`src/styles/components.css`（新增 7 个类）、`package.json`（`test` 脚本纳入 integration）
- 测试（新增）：`tests/integration/form-pipeline.test.ts`（4 用例）、`tests/unit/seo.test.ts`（+2 用例：OG locale 格式、sitemap index 语言过滤）
- 文档（新增）：`tests/e2e/README.md`（E2E 验收规划与落地条件）
- 文档（修改）：`README.md`（数字同步与目录树）、`docs/handoff/STATUS.md`（本节）

## 三、测试结果（本轮实测）

- 新 CI 顺序全链路：typecheck 0 error；`validate:content` 0/0（清单 167 行 / MDX 31 / 未建 136）；`validate:entry-policy` 0/0；`validate:data` 0 error / 2 warning（ja、ko 未启用，同前）；`validate:claims` 0/0；**test 54/54**；生产 build 2 页；`validate:seo` 0/0（已检查本次产物）；`check-links` 2 页 6 链 0/0；`audit-dist` 0/0。
- `build:preview`（INCLUDE_DRAFTS=1）：33 页 / 458 链 / links 0 error / audit 0 error；产物 `og:locale` 为 `zh_TW`。
- `build:demo`（INCLUDE_DRAFTS=1 REVIEW=0）：33 页 / 458 链 / 0 error；外壳标记（`pending-slot`、`class="banner"`、`DRAFT`、`待院方`、`docs/compliance`、`尚未接入`）全部 0 命中。
- 内联样式：`src/**/*.astro` 中 `style=` 实测 0 处。

## 四、阻塞事项 / 需要用户决定

1–17 项（见下方各轮记录）继续生效，本轮无新增阻塞。

## 五、下一阶段启动指令（只给指令，不自动执行）

- 唯一阻塞解除动作不变：向项目负责人索取 **ADR-002 表单 API 契约的书面回填**；拿到后把集团 API host 写入 `data/site-config.json` 的 `contact_api.allowed_hosts`，再实现提交链路与成功/失败体验并补对应单测。
- 其余阻塞项需用户/负责人拍板：git 初始化（阻塞项 1）、`saipan-ivf.com` 定性（16）、清单 167 行偏差确认（15）、移动端头部高度口径（9）、`device_category` 阈值定义（8）、`astro check` 是否入 CI（7）、`public/_headers` 落地平台（6）。

## 当前本地预览状态（供用户查看）

- 本地服务器：已改为 Astro 原生预览：`pnpm run build:demo && pnpm run preview`；开发用 `pnpm run dev:demo`。
- 浏览器已打开 5 个标签页：`/`（语言选择）、`/zh-hant`（首页）、`/zh-hant/pricing`（费用+表单）、`/zh-hant/articles`（科普 hub，7 张卡片）、`/zh-hant/articles/entry-policy-change-what-to-check`（新草稿文章）。
- `dist/` 当前为**演示构建**（`INCLUDE_DRAFTS=1 REVIEW=0`）：33 页、无审阅外壳，**仅供本地查看，禁止指向生产域名**。
- 切换构建形态：预览（带 DRAFT 横幅与待核槽位）用 `pnpm run build:preview`；生产（当前 0 页上线）用 `pnpm run build`。
- 5 页浏览器实测：控制台 0 error / 0 warning（文档 7.4）。
- 本环境无法截取浏览器窗口截图（桌面窗口对捕获管线不可见），页面请直接在浏览器标签页查看。

## 禁止下一位 Agent 擅自做的事（一致性修复轮补充）

- 不得为「填满」sitemap index 把无已上线页的语言分片重新列入——空分片不进 index 是 7.2 的设计意图。
- 不得把内联样式写回组件；新增样式一律进 `tokens.css / global.css / components.css` 三文件之一。
- 不得擅自引入 Playwright 等浏览器运行器来填 `tests/e2e`——属依赖决策，见该目录 README 的落地条件。
- 不得为让 og:locale「更精确」擅自改 zh-hant→zh_HK 等映射；区域变体属术语表决策（docs/content/terminology-five-languages.csv）。
- 其余禁令（不改状态为 published、不注入 INCLUDE_DRAFTS 到生产、不补写事实、不做繁→简转换、不删他人产出、不假装已提交、构建必须串行）见下方各轮记录，全部继续生效。

---

# 上一轮记录（框架修复轮，2026-10-14）

> 一致性修复轮（2026-10-14 稍晚）处理了上轮遗留的一致性项 6–11：README 数字同步（167/29/54）、`og:locale` 改用 OG 规范格式、integration 集成测试与 e2e 规划落地、sitemap index 空分片过滤、7 处内联样式收敛进 components.css、`seo.ts` 死代码移除。测试数 48 → 54。上轮的 5 个框架缺陷修复（GA4 回访加载、UTM 采集、端点白名单接线、CI 顺序、CI workflow）继续有效。

- 更新时间：2026-10-14（本机时间）
- 当前阶段：**框架修复轮**（用户指令「根据开发文档继续优化…先检查哪里需要优化的地方」→ 检查后修复框架层缺陷 1–5；只做框架，不涉及内容与事实数据）
- 阶段状态：**READY_FOR_REVIEW**。按新 CI 顺序全链路实测全绿：typecheck 0 error → 内容/政策/话术校验 0 error → 48/48 测试 → 生产构建 2 页 → validate:seo（本次产物）0/0 → links 0/0 → audit 0/0；预览构建 31 页 425 链 0 错；演示构建 31 页、外壳标记 0 命中。
- 当前分支与 commit：**无法填写 —— 本工作区仍不是 git 仓库**（阻塞项 1 继续生效）。本轮未 init、未 commit、未建分支。

## 一、阶段结论（框架修复轮）

对照开发文档逐项检查后，修复 5 个框架层真实缺陷（均不触碰内容、事实数据与审核状态）：

1. **GA4 回访用户不加载**：`loadGa4()` 此前只在访客点击「允许」时触发，localStorage 已存 `granted` 的回访用户永远不会被追踪（同意横幅只在「未定」状态显示，已同意用户不会再触发 `setConsent`）。新增 `analytics.initAnalytics()`，`BaseLayout` 每页脚本初始化时检查已存同意并加载；`loadGa4` 内有 dataLayer 守卫，与首次点击路径不会重复加载。
2. **UTM 采集失效**：`buildPayload` 此前从 `new URL(pagePath, placeholder)` 读 `utm_*`，但 `pagePath` 是无 query 的路径，UTM 恒为空串。新增纯函数 `utmFromSearch()`，改为从 `window.location.search` 采集（SSR/测试环境为空串）；`source_page` 仍只保留路径、丢弃 query（6.2 不变）。
3. **端点白名单未接线**：`resolveEndpoint()` 此前定义而未被任何组件调用，`ContactForm` 直接 fetch 原始 endpoint。现已接线：`data/site-config.json` 新增 `contact_api.allowed_hosts`（空数组，`pending_adr002`），`config.ts` 导出 `contactApiAllowedHosts`，`ContactForm` 先经 `resolveEndpoint()` 解析才写入 `data-endpoint`。白名单为空时拒绝一切已配置接口（fail-closed），表单安全降级为「未接入」——实测演示构建产物 `data-endpoint` 为空、提交走 not-connected 提示。ADR-002 书面确认后把集团 API host 填入白名单即生效。
4. **CI 顺序缺陷**：`ci` 链中 `validate`（含读 `dist/` 的 `validate:seo`）原排在 `build` 之前，检查的是上次构建的残留产物。现拆为：typecheck → 内容/政策/话术校验 → 测试 → **build** → validate:seo → links → audit。
5. **无 CI 配置**：新增 `.github/workflows/ci.yml`（pnpm 10.34.1 + Node 24 + `pnpm install --frozen-lockfile` + `pnpm run ci`），文档 §8 的自动化检查首次具备托管运行入口。

## 二、交付物路径

- 代码（修改）：`src/lib/analytics.ts`（`initAnalytics`）、`src/lib/forms.ts`（`utmFromSearch`、`buildPayload` 的 UTM 来源）、`src/lib/config.ts`（`contactApiAllowedHosts`）、`src/components/ContactForm.astro`（接线 `resolveEndpoint`）、`src/layouts/BaseLayout.astro`（初始化分析）、`package.json`（`ci` 顺序）
- 代码（新增）：`.github/workflows/ci.yml`
- 数据（修改）：`data/site-config.json`（`contact_api` 段）
- 测试（修改）：`tests/unit/forms.test.ts`（原「pagePath 带 query 读 UTM」用例改断言 SSR 下 UTM 为空；新增 `utmFromSearch` 白名单键与 80 限长用例）
- 文档（修改）：`README.md`（ci 命令链描述）、`docs/handoff/STATUS.md`（本节）

## 三、测试结果（本轮实测）

- 新 CI 顺序全链路：typecheck 0 error；`validate:content` 0/0（清单 167 行 / MDX 29 / 未建 138）；`validate:entry-policy` 0/0；`validate:data` 0 error / 2 warning（ja、ko 未启用，同前）；`validate:claims` 0/0；**test 48/48**（+1 为 UTM 纯函数用例）；生产 build 2 页；`validate:seo` 0/0（已检查本次构建产物）；`check-links` 2 页 6 链 0/0；`audit-dist` 0/0。
- `build:preview`（INCLUDE_DRAFTS=1）：31 页 / 425 链 / links 0 error / audit 0 error。
- `build:demo`（INCLUDE_DRAFTS=1 REVIEW=0）：31 页 / 425 链 / 0 error；`pending-slot`、`class="banner"`、`DRAFT`、`待院方`、`docs/compliance`、`尚未接入` 在 `dist/**/*.html` 全部 0 命中；ContactForm 渲染且 `data-endpoint` 为空（白名单 fail-closed 的预期形态）。
- 过程记录：首轮验证时两条构建命令并行跑导致 `dist/` 互相踩踏、links 报 20 条伪错误；改串行重跑后全绿。后续构建务必串行。

## 四、阻塞事项 / 需要用户决定

1–17 项（见下方各轮记录）继续生效，本轮无新增阻塞。

## 五、下一阶段启动指令（只给指令，不自动执行）

- 唯一阻塞解除动作不变：向项目负责人索取 **ADR-002 表单 API 契约的书面回填**；拿到契约后把集团 API host 写入 `data/site-config.json` 的 `contact_api.allowed_hosts`（本轮已接好白名单管线，填值即生效），再实现提交链路与成功/失败体验并补对应单测。
- 可选并行（不需新事实，用户本轮未选）：一致性项 6–11（README 数字同步、`og:locale` 格式、integration/e2e 空目录、空语言 sitemap 分片、7 处内联样式、`seo.ts` 死代码）。

## 禁止下一位 Agent 擅自做的事（框架修复轮补充）

- 不得把 `contact_api.allowed_hosts` 填成猜测值或示例 host；ADR-002 书面确认前保持为空数组（fail-closed 是设计意图）。
- 不得为让 UTM「有值」在测试或代码里伪造 window.location；UTM 只从真实 URL query 采集。
- 不得把 `ci` 顺序改回「validate 在 build 前」——validate:seo 依赖本次构建产物。
- 不得并行跑两个构建（共享 `dist/` 会互相踩踏）；构建与 links/audit 必须串行。
- 其余禁令（不改状态为 published、不注入 INCLUDE_DRAFTS 到生产、不补写事实、不做繁→简转换、不删他人产出、不假装已提交）见下方各轮记录，全部继续生效。

---

# 上一轮记录（科普层轮，2026-10-13 18:15）

> 框架修复轮（2026-10-14）修复了 5 个框架层缺陷（GA4 回访加载、UTM 采集、端点白名单接线、CI 顺序、CI workflow）；测试数 47 → 48，`ci` 命令链顺序变更。本轮的交付物、结论与禁令继续生效，其中「测试 47」已被 48 取代。

- 更新时间：2026-10-13 18:15（本机时间）
- 当前阶段：**科普层轮**（用户判定「我感觉有些框架还没做，比如说类似 proivf.com 那样有文章和对应科普入口」）——补 P2 的内容框架（文章 + 科普入口），未新开阶段，P3 仍 BLOCKED。
- 阶段状态：**READY_FOR_REVIEW**。`dist/` 当前是**演示构建**（`REVIEW=0`），服务在 http://localhost:4322；本轮 `validate / test / typecheck / build:preview / build:demo / links / audit` 全部重跑并全绿。
- 当前分支与 commit：**无法填写 —— 本工作区仍不是 git 仓库。** 未擅自 `git init`、未 commit、未建分支。文件清单见「二、交付物路径」。

## 一、阶段结论（科普层轮）

1. **框架补齐**：新增第 17 个模板 `article_index`，科普入口落在清单已保留的 `/{lang}/articles`（繁中、简中各 1 个 hub）+ 10 篇文章（5 个主题 × 繁中/简中），配套 `ArticleCard.astro` 与 `ArticleIndexList.astro`。导航「就醫科普／就医科普」项排在费用与常見問題之间，文章页面包屑为「首頁 › 就醫科普 › 文章标题」。
2. **入口不留空壳**：导航项与 hub 卡片列表共用 `visibleArticles()` 一个口径，并由 `NAV_SPEC` 新增的 `requiresTemplate` 门控——生产构建（0 篇可见文章）里科普入口整项不输出，实测 `/en` 导航无「Guides」。
3. **范围偏差（需你确认，见阻塞项 15）**：你批准的是「Hub + 现有 /articles 路径（清单 +3 行，三语 hub）」与「繁中 + 简中（20 行，零清单变更）」。两者不能同时成立：只做繁中/简中文章时，英文 hub 必然是空壳，等于制造你此前明确反对的「没有内容的入口」。因此本轮**只建繁中/简中两个 hub**，清单实际 +2 行（165 → 167），繁中/简中配额各 45 → 46。
4. **未补写任何机构事实**：10 篇文章只写判断方法（该问什么、以哪份书面材料为准），成功率、价格、医生、实验室地点、签证与法律结论一律不写；「本中心实验室情况」这类待核内容移进 `<ReviewOnly>`，演示与生产构建不输出。清单里 5 个 blocked 主题的 10 行**未动**。
5. **发现并修复 1 个真实缺陷**：hub 的 `.grid-cards` 轨道下限写死 `minmax(260px,1fr)`，在 320px 视口下把两个 hub 各撑出 **+3px 横向溢出**（文档 8.1 第 6 项不达标）。改为 `minmax(min(100%, 260px), 1fr)` 后，31 页 × {320, 390, 768, 1280} = **124 组溢出全部为 0**，宽屏排布未变。
6. **可发布页面数没有变化**：生产构建仍只输出 2 页（根选择页 + 404）。新增的 12 页全部 `status: draft` + `noindex,nofollow`，不进 sitemap、不被生产页链接——这是发布闸门的设计意图，不是回归。
7. **对标站点的定性问题（见阻塞项 16）**：你给的 `https://www.saipan-ivf.com/` 实测是**在线的第三方站点**（页脚「2024- SIVF Clinic Co. All rights reserved」、`info@saipan-ivf.com`、地址 3rd Floor, Bank of Guam Garapan，英文站，导航为 Why SIVF? / Treatments / Resources / Egg Donation / Sperm Donation / Become a donor）。而本项目 `data/site-config.json` 把它登记为 `forbidden_domains` 里的 `legacy_redirect_only`（「仅用于 redirect-map.csv 的旧域 301 来源」，依据是开发文档 7.3）。两者冲突：若它不是我们的旧域，则 301 迁移计划不成立，需从配置里改定性；本轮**未改配置、站内零引用**该域。`proivf.com` 侧只做了结构确认（sitemap 有 `sitemap-guides-0.xml` 的 guides 集合与 `/calculators` 工具集），未抓取其内容、未复制其文案。

## 二、交付物路径

- 内容（新增 12 个 MDX，全部 `status: draft`、`noindex: true`）：
  - `content/zh-hant/articles/index.mdx`、`content/zh-hans/articles/index.mdx`（hub：`article_index`，必含模块 `hub-intro;article-card-list-from-build;source-note;intent-matched-cta`）
  - `content/{zh-hant,zh-hans}/articles/{how-to-read-success-statistics, ivf-abroad-decision-checklist, lab-own-or-outsourced, stay-itinerary-planning, translation-and-support-arrangements}.mdx`（简中为独立撰写，非繁中转换）
- 组件（新增）：`src/components/ArticleCard.astro`、`src/components/ArticleIndexList.astro`；（修改）`src/components/Breadcrumbs.astro`（上级标签改用导航短标签）
- 口径层（修改）：`src/lib/page-rules.ts`（`TEMPLATES` 加 `article_index`）、`src/lib/content.ts`（`TEMPLATE_PAGE_TYPE`、`NAV_SPEC.requiresTemplate`、`visibleArticles()`、`navLabelKeyFor()`）、`src/lib/i18n.ts`（`nav.articles`、`articles.read` → 139 键 × 3 语）
- 清单与配额（修改）：`content/page-manifest.csv`（+2 hub 行 = 167）、`data/site-config.json`（繁中/简中 `page_count_quota` 45→46 并写明理由）、`tests/unit/content.test.ts`（断言 167 并注明偏差来源）
- 样式（修改）：`src/styles/components.css`（`.grid-cards` 轨道下限，见结论 5）
- 规格文档（修改）：`docs/content/page-template-spec.md`（§1 清单口径与偏差、§3 模板枚举 17 个、§5 新增 `article`/`article_index` 两行、§8 科普层三条结构性约定）、`docs/design/design-system.md`（§2 导航门控、§3 `ArticleCard`/`ArticleIndexList`/`Breadcrumbs` 契约行、新增 §3.1、§1.1 溢出与栅格口径、§4 键数 139、§4.1 三种构建实测数）
- 交接：`docs/handoff/STATUS.md`（本节）；`docs/testing/audit-report.md`（自动生成，当前对应演示构建）

## 三、测试结果（本轮实测）

- `pnpm run validate`：`validate-content` **0/0**——「页面清单 167 行；仓库内 MDX 29 个；未建页 138（其中清单标 blocked 132）」；`validate-entry-policy` 0/0；`validate-data` 0 error / **2 warning**（ja、ko 未启用，同前）；`validate-seo` 0/0——「内容页 29 个，其中 published 0 个」；`check-prohibited-claims` 0/0（扫描 73 个文件，含 12 个新页面的简繁混排与禁用话术）。
- `pnpm run test`：**47 tests / 47 pass / 0 fail**（含清单 167 行断言、三语 139 键 `missingKeys/extraKeys` 对账）。`pnpm run typecheck`：0 error。
- `pnpm run build:preview`：**31 页** / 425 条站内链接 / `check-links` 0 error 0 warning / `audit-dist` **0 error 0 warning**；外壳实测 `.pending-slot` **52** 处、`class="banner"` **55** 处（分布在 29 个草稿页），hub 与文章页均带 DRAFT 横幅与「待院方书面确认」槽位。
- `pnpm run build:demo`：**31 页** / 425 条站内链接 / 0 error 0 warning；`pending-slot`、`class="banner"`、`DRAFT`、`待院方`、`docs/compliance`、`fact-register`、`data/site-config`、`尚未接入`、`保持空白` 在 `dist/**/*.html` 命中数**全部为 0**。
- 清单↔产物对账（脚本实测）：29 个 MDX 的 `path` 全部在清单内（`NOT-IN-MANIFEST` = 0）；24 个 draft 行中 18 行已有 MDX、6 行未建（`/zh-hans/why-saipan`、三语 `hospital-lab`、`/zh-hans/faq`、`/en/faq`）；11 个 blocked 行有 draft MDX（P1 起的骨架占位，validator 允许 draft、禁止 approved/published）。
- 可见正文长度（`<main>` 去标签去空白，演示构建）：hub 繁中 1,196 / 简中 1,172；10 篇文章 844–1,122；短页仍按设计为 404（68）、根选择页（130）、`contact-success`（290/299）。
- 移动端溢出：修复前 124 组中 **2 组各 +3px**（两个 hub @320px）；修复后 **0 组**。
- 浏览器验收（视口 1116×785，`visibilityState=visible`）：`/zh-hant/articles` 截图确认金/蓝/白、无审阅外壳、导航「就醫科普」带 `aria-current`；DOM 实测 hub 5 张卡片与 5 个「繼續閱讀」、面包屑「首頁 › 就醫科普 › 胚胎實驗室…」、`robots=noindex,nofollow`、canonical `https://saipanivf.org/zh-hant/articles`；`/en/pricing` 导航无 Guides 项；简中切换落点 `/zh-hans/articles`。
- **像素级视觉的边界**：窄屏（320/390）只做了 `scrollWidth - clientWidth` 数值实测，未出图（截图取的是真实窗口宽度，无法逐档改窗口）；读屏顺序与真机仍未验证。

## 四、阻塞事项 / 需要用户决定

1–14 项（见下方两轮记录）继续生效。本轮新增：

15. **清单口径偏差需你拍板**：本轮把清单从冻结的 165 行改为 167 行、繁中/简中配额 45→46，并**只建了繁中/简中 hub**（与你选项里「三语 hub」的措辞不一致，理由见结论 3）。两个方向请选一个：(a) 接受 167 行 + 双语 hub，英文科普入口等英文文章有审核人再开；(b) 要三语 hub，则需先定英文文章的医疗审核人与简/繁英同 PR 的同步口径，否则英文 hub 是空壳。
16. **`saipan-ivf.com` 定性冲突**：配置按开发文档 7.3 记为「我们的旧域、只做 301 来源」，实测该站在线且署名为 `SIVF Clinic Co.`（见结论 7）。需要你确认它到底是①我方可控旧域（则 `redirect-map.csv` 需要其后台 URL 导出，仍缺）、②第三方/竞品（则 `legacy_redirect_only` 与整份 301 迁移计划要作废重写）、还是③同一集团但由他人运营。开发侧不猜、不改配置、站内零引用。
17. **10 篇文章与 2 个 hub 全部停在 draft**：清单 `review_owner` 为 `medical_reviewer_pending`，涉及医疗内容的 5 个主题需医疗团队书面确认后才能 draft→review。没有审核人，科普层只能停留在「演示可见、不可发布」。

## 五、下一阶段启动指令（只给指令，不自动执行）

- **唯一阻塞解除动作**：向项目负责人索取 **ADR-002 表单 API 契约的书面回填**（`docs/decisions/ADR-002-api-contract.md` 必须确认清单逐项填写）；拿到契约后实现提交与成功/失败链路并补对应单测。在此之前不写提交代码、不定义伪字段、不建 mock 端点。
- **并行可推进（不需新事实）**：把三项人工复核固化成脚本断言并接进 `ci`——①预览/演示构建的 `.pending-slot` 与横幅计数、②「指向未渲染内容的文案」DOM 扫描、③本轮新增的「科普入口与卡片列表同源可见性」（`requiresTemplate` 命中即必须有 ≥1 篇可见文章）。否则后续 138 页开工时这三类回退没人拦。
- **需你先答复才动**：阻塞项 15（清单 167 行是否成立）、16（`saipan-ivf.com` 定性）、1（git 初始化）。三者都不该由开发侧默认选择。

## 禁止下一位 Agent 擅自做的事（科普层轮补充）

- 不得为凑「三语 hub」把英文 hub 建成没有文章的入口；空入口的正确形态是**整项不输出**（`NAV_SPEC.requiresTemplate`），不是写一句「文章即将上线」。
- 不得在文章正文里写本中心的实验室地点、委外范围、成功率、价格、医生、签证或法律结论；这类机构事实须先进 `data/*.json` 或 `docs/compliance/fact-register.csv` 并 verified，未核验的说明只写在 `<ReviewOnly>`。
- 不得把清单的 167 行/配额 46 当作新基线继续加行：165 是文档冻结值，本轮 +2 行是经批准的结构页例外，任何再增都需重新登记决策。
- 不得为让 hub 显得「内容多」而批量生成薄文章（文档 0.1 第 7 条）；也不得从 `proivf.com` 或 `saipan-ivf.com` 复制任何文案、结构或素材。
- 不得为了消除 `.grid-cards` 溢出而放宽四档宽度的 0 溢出断言；正确做法是本轮的 `min(100%, …)` 轨道写法。
- 其余禁令（不改状态为 published、不注入 `INCLUDE_DRAFTS` 到生产、不补写事实、不做繁→简转换、不删他人产出、不假装已提交）见下方各轮记录，全部继续生效。

---

# 上一轮记录（演示就绪轮，2026-10-13 16:59）

> 上方科普层轮已取代其中的这些数字：**17 个 MDX → 29 个**、**清单 165 行 → 167 行**、**137 键 → 139 键**、**预览/演示构建 19 页 → 31 页**、**`.pending-slot` 50 → 52**、**DRAFT 横幅 17 处 → `class="banner"` 55 处**、**76 组溢出 → 124 组溢出**、`check-prohibited-claims` 58 文件 → 73 文件。三类处理（工程自述改写 / 审计脚手架降级 / 无事实区块整块不渲染）与 `reviewChrome`、`FactGate`、`build:demo` 的结论继续有效，本轮未回退。

## 一、阶段结论（演示就绪轮）

问题被拆成三类，分别用三种不同手段处理，**不是一律改文案**：

| 类别 | 例 | 处理 |
|---|---|---|
| 1. 工程自述写进了对外文案 | 「草稿框架」「等待来源登记：见 docs/compliance/fact-register.csv」「数据在 data/programs.json」「P3 前置条件」「本模块待接入」 | **改写成成品级文案**：17 个 MDX 的 `description`、`hero.eyebrow/lede` 与正文全部重写；内部路径类备注移入 `<ReviewOnly>` |
| 2. 审计脚手架，本身不是内容 | DRAFT 横幅、逐槽位「待院方書面確認」、来源待登记提示、未启用语言说明、表单未接入提示 | **降级为预览外壳**：由 `src/lib/config.ts` 的 `reviewChrome` 单点控制，新增 `pnpm run build:demo`（`INCLUDE_DRAFTS=1 REVIEW=0`）渲染零外壳页面 |
| 3. 确实没有已核验事实的区块 | 航线表、入境条件表、方案卡、医生卡、价格槽位 | **整块不渲染**：新增 `src/components/FactGate.astro`（`need="flights"/"entry"`）与 `MessagingLinks` 的无渠道门控；**未补写任何医疗、法律、入境、价格、成功率事实** |

结论：演示构建 19 页、审计 0 error / 0 warning、外壳标记 0 处、四档宽度 76 组组合溢出 0 像素；预览构建仍有 50 处 `.pending-slot` 与 17 处 DRAFT 横幅，即审阅工具未被削弱。**演示页面看起来是成品，但可发布页面数没有变化——生产构建仍只有 2 页**，因为 0 页通过发布闸门，这是设计意图而非回归。

## 二、交付物路径

- 开关与构建口径：`src/lib/config.ts`（`reviewChrome`）、`package.json`（`build:preview`、`build:demo`）、`docs/design/design-system.md` 新增 **4.1 审阅外壳（review chrome）与三种构建** 与 §3 的 `ReviewOnly`/`FactGate`/`MessagingLinks` 契约行
- 新组件：`src/components/ReviewOnly.astro`、`src/components/FactGate.astro`
- 外壳改造（12 个）：`DraftBanner`、`FactSlot`、`SourceNote`、`DoctorCard`、`EntryPolicyTable`、`FlightTable`、`ProgramCard`、`MessagingLinks`、`ContactForm`、`Header`、`Footer`、`LandingLayout`、`src/pages/index.astro`
- 文案：`content/{zh-hant,zh-hans,en}/**` 共 17 个 MDX；`src/lib/i18n.ts`（137 键 × 3 语）；`src/lib/claims.ts`（去掉 `述` 这类一简对多繁独占字，消除误判）；`src/components/FAQList.astro`（新增 `lede`，去掉与 MDX 重复的 `<h2>`）
- 本轮新增的**流程类**内容（描述我方可控流程，不是院方事实）：三语入境页「您的条件怎么确认」四步、`en/why-saipan` 与 `zh-hant/why-saipan` 的停留决定因素、`zh-hans/index` 四步流程、三语提交成功页「接下来会发生什么」、`zh-hant/cities/taipei` 五段写实说明
- 交接：`docs/handoff/STATUS.md`（本节）；`docs/testing/audit-report.md`（自动生成，当前对应演示构建）

## 三、测试结果（本轮实测）

- `pnpm run ci`（typecheck → validate → test → build → links → audit）：**全绿**。typecheck 0 error；`validate-content` 0/0（清单 165 行 / 仓库 MDX 17 / 未建 148）；`validate-entry-policy` 0/0；`validate-data` 0 error / 2 warning（ja、ko 未启用）；`validate-seo` 0/0；`check-prohibited-claims` 0/0（扫描 58 个文件）；**47 tests / 47 pass / 0 fail**；生产构建 2 页 / 6 条内链 / audit 0-0。
- `pnpm run build:preview`：19 页 / 245 条内链 / audit **0 error 0 warning**；外壳实测 `.pending-slot` 50 处、DRAFT 横幅 17 处、「待院方…」标注 92 处。
- `pnpm run build:demo`：19 页 / 245 条内链 / audit **0 error 0 warning**；`pending-slot`、`draft-banner`、`DRAFT`、`待院方`、`docs/compliance`、`fact-register`、`data/programs.json`、`其他聯絡方式`、`another contact channel` 在 `dist/**/*.html` 中命中数**全部为 0**。
- 移动端溢出：19 页 × {320, 390, 768, 1280} = **76 组，溢出 0 组**。
- 可见正文长度（`main` 去空白字符数）：根选择页 130、404 页 68（两者按设计为短页），其余 17 页 **290–2,267**。
- 视觉抽检（本轮视口可用：1005×785，`visibilityState=visible`，此前的 `NATIVE_BROWSER_VIEWPORT_UNAVAILABLE` 未复现）：`/zh-hant/`（首屏）、`/zh-hant/pricing/`（整页）、`/en/entry-path/`（整页）三张截图确认无 DRAFT 横幅、无待核标注、无空表格空壳；`/zh-hant/` 页面 10 条内链 `fetch` 全 200。
- 已知度量口径：CJK 页面按「<160 字符且无列表/表格」判定时剩余 **9** 个短段区块，绝大多数是繁中/简中页的 53–156 **汉字**短段（信息量约合英文 250–650 字符），属语言密度差异，未为此注水；`details` 折叠内容不计入 `innerText`，FAQ 页 364 字符为低估。

## 四、阻塞事项 / 需要用户决定

1–12 项（见下方两轮记录）继续生效。本轮新增：

13. **演示中「没有数据」的区块只能由院方材料填上**：航线、入境条件、方案卡、医生、价格五类区块在演示构建中整块缺席，因为 `data/*.json` 里 verified 记录数为 0（航线 0、入境 0、渠道 8 条全 pending/blocked、方案 9 条全 pending/pending）。要演示「有数据的样子」，需要院方/法务提供可登记进 `docs/compliance/fact-register.csv` 的书面材料；开发侧不造样例数据、不用占位数字。
14. **页脚与「其他联络方式」区块**：无 verified 渠道时该区块不再出现（此前显示一句兜底语，且表单错误提示指向它，形成悬空引用）。需 P0 客服渠道确认后才有真实账号；届时 `usableChannels()` 自动恢复渲染。

## 五、下一阶段启动指令（只给指令，不自动执行）

- 先向项目负责人索取 **ADR-002 表单 API 契约的书面回填**（`docs/decisions/ADR-002-api-contract.md` 必须确认清单逐项填写）；拿到契约后实现提交与成功/失败链路并补对应单测。在此之前不写提交代码、不定义伪字段、不建 mock 端点。
- 并行可推进（不需新事实即可开工）：把本轮的「外壳标记数」与「指向缺失内容的文案」两项人工复核固化为脚本断言，接进 `ci`，避免后续 148 页开工时回退。
  （若同日先处理阻塞项 1「git 初始化」或 11「首图换素材」，以该动作为准，本条顺延。）

## 禁止下一位 Agent 擅自做的事（演示就绪轮补充）

- 不得为了「让演示看起来有数据」在 `data/*.json` 或 `fact-register.csv` 里填猜测值、示例值或从模型知识补写；门控失效的表现应是区块消失，不是出现假数据。
- 不得把 `REVIEW=0` 用于生产之外的口径误解：`build:demo` 仍含草稿页面，**禁止把演示构建指向生产域名**。
- 不得删除或放宽 `check-prohibited-claims` 的字集与规则来消除混排报错；改写文案而不是改检测器（本轮 `claims.ts` 只删了会造成误判的一简对多繁独占字 `述`）。
- 不得为为凑版面写「本模块待接入」「待来源登记」这类过程语进正文；过程性备注一律走 `<ReviewOnly>`。
- 其余禁令（不改状态为 published、不注入 `INCLUDE_DRAFTS` 到生产、不补写事实、不造薄内容、不做繁→简转换、不删他人产出、不假装已提交）见下方各轮记录，全部继续生效。

---

# 上一轮记录（视觉轮，2026-10-13 15:58）

> 首图与金/蓝/白配色结论继续有效（本轮未改 token 与素材）；其中 **132 键** 已被本轮的 137 键取代，「预览构建 6 warning」已被本轮 0 warning 取代，`dist/` 现为演示构建而非预览构建，「视觉抽检三处目视确认」的截图本轮已重做。该轮的素材来源、授权待决与禁令继续生效。

- 更新时间：2026-10-13 15:58（本机时间）
- 当前阶段：**视觉轮**（用户指令「先优化下首图 放张美丽的塞班岛图片 / 然后色调以金、蓝、白为主，营造专业安全的氛围」）——属 P1 设计系统与首屏实现的迭代，未新开阶段，P3 仍 BLOCKED。
- 阶段状态：**READY_FOR_REVIEW**（`dist/` 当前是**预览**构建，服务仍在 http://localhost:4322 供你抽检；生产链 `pnpm run ci` 已在本轮跑过并全绿）
- 当前分支与 commit：**无法填写 —— 本工作区仍不是 git 仓库。** 未擅自 `git init`、未 commit、未建分支。文件清单见「新增 / 修改文件（视觉轮）」。

## 本次范围（视觉轮）

- 做的：首图素材落地并接入两处首屏；整站配色改为金/蓝/白并重算全部对比度配对；顺带修正审计脚本的资源统计口径（首图字节此前会被漏计）。
- 没做的：**未**推进 148 个未建页面，**未**开始 P3，**未**部署上线，**未**写表单提交逻辑（ADR-002 仍 BLOCKED），**未**改字号/间距/断点/语义三色。

## 已完成事项（视觉轮）

### 1. 首图

- **选型过程（含失败路径，供下一位不再重试）**：
  - `ImageGen` 生成图：返回 `403 {"code":"112","message":"…pricingUrl…"}`，本账号当前不可用。
  - 可核验的免费实景源：`commons.wikimedia.org`、`upload.wikimedia.org`、`en.wikipedia.org`、`google.com`、`www.pexels.com`、`cdn.pixabay.com`、`loremflickr.com` 在本机 curl 全部 `000`（连接失败）或 `401/403`；`unsplash.com` 检索页 WebFetch 返回 `401`，只有 `images.unsplash.com` 与 `images-assets.nasa.gov` 可达 → 拿不到「可核验确属塞班 + 授权明确」的第三方海滩图，且**不猜 URL**。
  - 最终取 NASA 图像库公开检索接口命中的唯一一条塞班记录：`https://images-api.nasa.gov/search?q=s103e5361` → `center=JSC`、`date_created=1999-12-24`、原始说明「This vertical view from the Space Shuttle Discovery shows two small islands of the Marianas Islands (Saipan and Tinian)…」，直链 `https://images-assets.nasa.gov/image/s103e5361/s103e5361~orig.jpg`（640×427，实测 79,200 B）。
- **落位**：`public/images/saipan-marianas-sts103.jpg`；路径与尺寸的唯一来源是 `src/lib/config.ts` 的 `heroImage`，由 `LandingLayout.astro`（10 个 landing 模板）与 `src/pages/index.astro`（根选择页，生产构建唯一内容页）共用；页面可用 frontmatter `hero.image` 覆盖，覆盖图必须同为 640×427（`width/height` 写死，比例不符会变形）。
- **文案**：`alt` 与题注走 i18n，新增 `hero.image_alt`、`hero.image_credit` 两键 → **132 键 × 3 语**（`tests/unit/facts.test.ts` 的 `missingKeys/extraKeys` 保证三语键集一致）。题注只写来源与编号，**不写「公有领域」**——检索接口没有 rights 字段，授权结论不由开发侧代写（归入阻塞项 11）。
- **规则同步**：删除 hero 的 `.pending-slot` 死分支与 `LandingLayout` 里随之失效的 `isProductionBuild` 导入；旧规则「hero 缺已核验素材时不输出 `<img>`」改写为 `docs/design/design-system.md` 新增的 **5.1 首图（hero 素材）**（来源、授权口径、渲染入口、640px 限宽、以及「首图属目的地装饰、不承载事实主张、因此不受 ADR-003 闸门约束」的边界），`docs/content/page-template-spec.md` 的 `home` 行与 `docs/seo/technical-seo-checklist.md` 的图片 SEO 条目同步。
- **版式**：`.hero-figure` 限宽 640px 且居中，避免单列断点下把 640px 素材拉成 705px 糊图；外框用 `--color-accent-soft`（装饰，不参与对比度判定）。根选择页语言卡片新增 `.hero__langs` 改两列，使左栏高度与首图相当（此前三张卡叠成一列，左栏比右栏高一倍）。
- **未采用 astro:assets 的原因**：`<Image>` 走 sharp，本机 pnpm 下 Astro 抛 `MissingSharp: Could not find Sharp`（`sharp@0.34.5` 与 `@img/sharp-win32-x64` 确实在 `node_modules/.pnpm`，但 astro 的解析上下文取不到）。为「宿主 CI 不新增原生图像依赖」这条口径，没有去 `pnpm add sharp`，改为 `public/` 原图直出。

### 2. 金 / 蓝 / 白配色

- `src/styles/tokens.css` 全量替换（旧 → 新，括号为改后实测比值）：
  - 蓝（专业与安全）：`--color-primary` `#16697a→#1a5f9e`（白字 6.62:1）、`-strong` `#0f4c59→#0d4471`（10.08:1）、`-soft` `#e2f0f3→#e4eefa`。
  - 金（引导与温度）：`--color-accent` `#af6232→#8a6516`（白底 5.31:1、压暖底 4.72:1）、`-soft` `#fbeadd→#f6ead0`；`--color-surface-warm` `#fbf6ef→#f7f1e3`（hero 渐变起点的浅沙金）。
  - 白与中性：`--color-ink` `#12232b→#0e2233`（深藏青，兼页脚底色）、`-muted` `#4b6470→#3d5771`、`-soft` `#677981→#5b7186`（5.06:1）、`--color-surface-alt` `#f4f7f8→#f1f5f9`、`--color-line` `#d8e2e6→#d7e1ea`、`-strong` `#b3c4cb→#aec0d1`、`-field` `#7f8c91→#6c8296`（3.98 / 3.64:1）。
  - 阴影 `rgba(18,35,43,…)→rgba(14,34,51,…)` 跟随 ink；页脚加 3px `--color-accent` 上沿实线、分隔线 `#2c4451→#28425c`；hero 眉标由蓝改金。
- **亮金只能做非文字装饰**：`#9c7512` 一档在白底只有 4.23:1，达不到正文 4.5:1，所以站内亮金只出现在首图外框与页脚金线（非文本），文字级金色锁在 `#8a6516`。
- `scripts/audit-dist.ts` 的 `PAIRS` 从 18 对增至 **19 对**：新增「金字压 `--color-surface-warm`」——因为 hero 眉标这次真的落在了暖色渐变上，按既有口径（只断言实际配对）必须补进判定，实测 4.72:1 通过。
- 未改动：`--color-success/warning/danger` 三对语义色、字号阶梯、间距、圆角、断点、`--header-height`。

### 3. 测量口径修正

- `scripts/audit-dist.ts` 的本地资源正则原为 `(?:src|href)="/(_astro/…)"`，`public/` 下的图片与字体不计入 → 首图 79,200 B 会漏出「本地资源体积」表。已扩为 `/(?:_astro|images|fonts)/…`。
- 顺带确认 `scripts/check-links.ts` 第 63–64 行的 `<img src>` 也在内链检查范围内，因此图片路径不存在会被链接检查直接报 error（预览链接数由 232 → 245，正好是 13 个含首图页面的新增引用）。

## 测试与构建结果（视觉轮实测）

- `pnpm run ci`（typecheck → validate → test → build → links → audit）：**全绿**。typecheck 0 error；**47 tests / 47 pass**；`validate-content` 0/0（165 行清单 / 17 MDX / 未建 148）；`validate-entry-policy` 0/0；`validate-data` 0 error / 2 warning（ja、ko 未启用，同前）；`validate-seo` 0/0；`check-prohibited-claims` 0/0。
- 生产构建：**2 page(s) built in 2.94s**；`check-links` 2 页 / 6 条 / 0 error；`audit-dist` **0 error / 0 warning**，19 对对比度全过。
- 生产载荷（实测字节）：根选择页 HTML 3,931 B（gzip 1,877 B）、404 HTML 3,815 B（gzip 1,637 B）、CSS 14,643 B、JS chunk 464 + 299 B、**首图 79,200 B**；外域资源 0 个、阻塞 CSS 1 个、无内联 `<style>`。首屏总传输量约 98 KB（未压缩口径）。
- 预览构建（当前 `dist/`）：19 页 / 14 个 `<form>` / 245 条站内链接；`audit-dist` 0 error / **6 warning**（全部是代表页草稿 title 短于建议长度带，同前，内容阶段处理）。
- 移动端溢出复测：16 个产物 × {320, 390, 768, 1280} = **64 组，溢出 0 组**；390px 下首图实宽 327px、768px 单列下由 705px 收敛到 640px 上限（不再放大）。
- 视觉抽检（截图）：`/`（根选择页，两列语言卡 + 右栏首图 + 页脚金线）、`/zh-hant`（眉标金色、蓝色主按钮、金色外框首图与题注）、390px `/zh-hant`（首图落到文字下方、无溢出）三处目视确认符合「金/蓝/白 + 专业安全」。

## 新增 / 修改文件（视觉轮 15:40–15:58，本机时间）

- 素材（新增）：`public/images/saipan-marianas-sts103.jpg`（79,200 B，来源见 design-system 5.1）
- 代码（修改）：`src/styles/tokens.css`、`src/styles/components.css`、`src/lib/config.ts`、`src/lib/i18n.ts`、`src/layouts/LandingLayout.astro`、`src/pages/index.astro`、`scripts/audit-dist.ts`
- 文档（修改）：`docs/design/design-system.md`（token 表、1.1 对比度、新增 5.1 首图、第 6 节待决两行、i18n 键数）、`docs/content/page-template-spec.md`（`home` 行首图口径）、`docs/seo/technical-seo-checklist.md`（图片 SEO 条目）、`docs/testing/audit-report.md`（自动生成）、`docs/handoff/STATUS.md`
- **未改动**：`data/*.json`、`content/**`、`src/content.config.ts`、其余 `src/components/*`、`src/layouts/BaseLayout.astro`、`src/layouts/ContentLayout.astro`、其余 `scripts/*`、`tests/*`、`docs/compliance/*`、`docs/decisions/*`、`docs/forms/*`、`docs/analytics/*`、`docs/operations/*`、`README.md`。

## 阻塞项 / 需要用户决定（视觉轮新增 11–12；1–10 见下方 P2 收口轮记录，继续生效）

11. ~~**首图是否换成实景海滩照**~~ —— **已由用户 2026-10-14 拍板并执行**（见「第六轮 · 首页首图替换」）：换成用户提供的塞班海岸航拍实景，题注按「无核验来源就不写」删除。**剩余待决**：该图的拍摄者与商用授权链仍无书面凭证，托管/对外发布前需法务确认；确认后要否补回来源题注，届时再定。
12. **是否允许为 WebP/AVIF 与 `srcset` 引入 `sharp`**：当前构建链零原生依赖，首图以 27 KB JPEG 原图直出。要上多密度/现代格式需 `pnpm add sharp`（属依赖与 CI 决策，未擅自加）。

## 下一位 Agent 的唯一下一步

- 向项目负责人索取 **ADR-002 表单 API 契约的书面回填**（`docs/decisions/ADR-002-api-contract.md` 的必须确认清单逐项填写），拿到契约后实现提交与成功/失败链路并补对应单测。在此之前不写任何提交代码、不定义伪字段、不建 mock 端点。
  （若同日先处理阻塞项 1「git 初始化」或 11「首图换素材」，以该动作为准，本条顺延。）

## 禁止下一位 Agent 擅自做的事（视觉轮补充）

- 不得为让 `pnpm run audit` 变绿而放宽 `PAIRS` 或阈值；新增「某色压在某底上」的真实用法时，必须同时把该配对加进 `PAIRS` 实算（本轮金字压暖底即为此例）。
- 不得在没有授权依据的情况下在站内写「公有领域 / 已授权 / 商用可用」这类结论；素材题注只写可核验的来源与编号。
- 不得为图片擅自 `pnpm add sharp` 或引入第三方图源 URL；`ImageGen` 与多数图库当前在本机不可用，重试前先确认阻塞项 11 的答复。
- 其余禁令（不改状态为 published、不注入 `INCLUDE_DRAFTS`、不补写事实、不造薄内容、不做繁→简转换、不删他人产出、不假装已提交）见下方各轮记录，全部继续生效。

---

# 上一轮记录（P2 收口，2026-10-13 15:20）

> 以下是过程依据，其中**色值、对比度对数（18 对）、载荷（0 张图片）与「本轮」措辞已被上方视觉轮取代**；该轮的工具、缺陷修复记录与禁令仍然有效。

## 本次范围（P2 任务 10 + 交付物）

- 做的：对**真实构建产物**做可访问性、SEO、表单安全与载荷的自动化检测；修掉检测暴露的实现缺陷；补 `docs/seo/technical-seo-checklist.md`、`docs/operations/deploy-runbook.md`，更新设计系统的对比度取色依据。
- 没做的：**未**推进 148 个未建页面，**未**开始 P3（日/韩，前置条件不满足，见阻塞项 3），**未**部署、**未**上线、**未**写表单提交逻辑（ADR-002 仍 BLOCKED）。
- 判断依据：开发文档 §9 规定 P2→P3 的前置是「P0 中日/韩人力、客服渠道和审核人员已确认」，四项均未确认，因此 P3 状态为 **BLOCKED**；在不动范围、不猜事实的前提下，本轮把 P2 剩下的可执行部分做完。

## 已完成事项

### 检测工具（本轮新增，零外部依赖）

- `scripts/audit-dist.ts`：扫描 `dist/` 全部 HTML，按 WCAG 2.1 相对亮度公式**实算**设计 token 的前/背景配对对比度（正文 ≥4.5:1，非文本 UI 与大字号 ≥3:1），并检查每页的 title/description 存在性与唯一性（按语言分长度带）、canonical 与产物路径逐字一致、robots meta、`/404` 必 noindex、OG 三项、hreflang 组含自指与 `x-default`、JSON-LD 可解析、sitemap ↔ 产物双向一致、禁用域零引用、以及表单安全规则。结果写入 `docs/testing/audit-report.md`，末行 `0 error(s), 0 warning(s)` 为 CI 门禁。
- 已接入 `package.json`：`"audit": "tsx scripts/audit-dist.ts"`，并加入 `ci` 链末尾（`… && pnpm run links && pnpm run audit`）。
- 报告自检：产出量（各页 HTML 原/压缩字节、`_astro` 资源字节、CSS 阻塞数、内联样式字节、脚本块数、`<img>` 数、外域清单）、检查对象计数与构建模式，以及「未在本文档中测定的项目」清单，避免把没测的东西当成已通过。

### 检测暴露并修复的真实缺陷

1. **分语言 sitemap 全片为空**（最高危）。Astro 5 在预渲染端点的 `GET(context)` 里给出的 `context.props` 是 `{}`，路由参数只在 `context.params` 上（实测确认）。`src/pages/sitemaps/[lang].xml.ts` 原先只读 `context.props.lang`，导致每个语言分片都拿到空字符串、只生成空 `<urlset>`——所有已上线 URL 永远不会被提交，且 `sitemap-index.xml` 本身合法，看不出异常。已改为 `context.params?.lang ?? context.props?.lang ?? ''`，并在 `tests/unit/seo.test.ts` 加了两条回归（分语言正确分片 + 根选择页只由默认语言提交一次）。
2. **根选择页不在任何 sitemap 中**。`/` 是构建出的语言选择页而非 MDX 内容页，因此不在内容页推导的 sitemap 里，却带 `index,follow`——可索引却无提交。现由默认语言的 sitemap 以 `includeRoot` 提交一次，`scripts/validate-seo.ts` 增加断言：`/` 只允许出现在默认语言分片，重复提交即 error。
3. **表单缺 `method`**。`ContactForm.astro` 的 `<form>` 未写 `method`，浏览器默认 GET：一旦客户端 JS 未接管（脚本被拦、低网速、禁 JS），提交内容会进入 **URL、浏览历史与 Referer**，直接违反文档 6.2「URL 不带表单数据」。已加 `method="post"` 作为无 JS 兜底，并在审计中固化规则：每个 `<form>` 必须 `method="post"`、不得 `enctype="multipart/form-data"`、不得出现 `type="file"`、不得出现 NEVER_COLLECTED 字段、`name` 必须在语言白名单内、`maxlength` 必须等于契约值（DOM 与 JS 双重限制都要在）、蜜罐必须 `aria-hidden="true"` 且 `tabindex="-1"`。
4. **`validate-seo` 对根 URL 的误判**（本轮跑 `ci` 时暴露）。上一条修复后根 URL 为 `https://saipanivf.org/`，被尾斜杠规则判为 error——该规则的例外只写了语言首页。`normalizePath('/')` 保留 `/` 是设计意图，已把 `/` 加入例外（`scripts/validate-seo.ts:103-105`），对 `/zh-hant/` 这类路径仍保持 error。
5. **对比度实测不达 AA 的 token**：审计首轮报出 3 条 error（3 对前/背景），已按实算改色，现 18 对全过（见「可访问性」小节）。
6. **移动端横向溢出（文档 8.1 第 6 项不达标）**：视觉通道本轮恢复后，用同源 iframe 在 320/390/768/1280 四档宽度实测 15 个产物的 `scrollWidth - clientWidth`，改前 **15/15 页在 390px 溢出**（繁中/简中 +35px，英文页 +454px；英文页在 768px 仍 +76px）。根因：`.brand { white-space: nowrap }` 与 `.site-header__inner` 不换行——英文品牌名 + 待核徽章 + 语言切换器 + CTA 在窄屏排不进一行；且折叠导航面板用固定的 `inset: var(--header-height)` 定位，头部一旦换行就会盖住菜单。修复（`components.css` 的 `@media (max-width: 900px)`）：头部允许 `flex-wrap`、品牌名可换行且字号降到 `--text-base`、徽章按内容宽度自然换行、工具区 `margin-left: auto`、导航面板改用 `inset: 100% 0 auto` 跟随实际头部高度。改后 **60 组组合（15 页 × 4 档）溢出像素全部为 0**，桌面端头部高度 69px 未受影响，390px 下折叠菜单实测可展开（面板顶 382 = 头底 383，链接高 44px、菜单按钮 44×44）。

### 视觉抽检（本轮通道恢复）

- 截图通道本轮可用（此前 `NATIVE_BROWSER_VIEWPORT_UNAVAILABLE` 的情况已消失），已对 `/`、`/404`、`/zh-hant`、`/zh-hant/pricing`、`/zh-hant/entry-path`、`/en` 出图目视检查：DRAFT 横幅、待核槽位、表单、页脚免责与版权行、404 语言入口均按设计呈现。
- 目视发现并已修：上述移动端溢出。
- 目视发现**未改、需你定口径**：390px 下头部高度 122px（繁中/简中）～184px（英文），320px 下 157～212px。这是 sticky 头在窄屏换行的必然结果，压缩它需要在「隐藏品牌待核徽章」与「头部不 sticky」之间选一个，属设计决策，我没有擅自选。
- 测量方法可复现：`pnpm run build:preview && pnpm run preview:serve`，再用同源 iframe 逐档宽度读 `scrollWidth - clientWidth`（媒体查询按帧生效，等价于真机宽度）。

### 可访问性（对比度实算：改前 3 对不达标 → 改后 18 对全过）

审计首轮跑出的 3 条 error（同一公式实算，非目测）：

| 用途 | 改前 | 改前实测 | 要求 | 改后 token | 改后实测 |
|---|---|---|---|---|---|
| 来源注记、待核槽位（小字号文字） | `--color-ink-soft` `#7b909a` / `#fff` | **3.33:1** | ≥4.5 | `#677981` | 4.54:1 |
| 强调色上的按钮文字 | `#fff` / `--color-accent` `#c9713a` | **3.56:1** | ≥4.5 | `#af6232` | 4.55:1 |
| 输入框描边（非文本 UI） | `--color-line-strong` `#b3c4cb` / `#fff` | **1.80:1** | ≥3 | 新增 `--color-line-field` `#7f8c91` | 3.46:1（落在 `#f4f7f8` 浅底为 3.22:1） |

其余 15 对本轮实测即达标，未改动（列此以说明"没有全改"是有依据的）：正文 `#12232b`/`#fff` 16.14:1、次要文字 `#4b6470`/`#fff` 6.26:1、浅底区块正文 14.99:1、暖底区块正文 15.01:1、正文内链接 `#16697a`/`#fff` 6.30:1、主按钮内链态 `#0f4c59`/`#fff` 9.55:1、主按钮反白 `#fff`/`#0f4c59` 9.55:1、次级实心按钮 `#fff`/`#16697a` 6.30:1、`a:hover` 文字 4.55:1、焦点环 3px 4.55:1、页脚正文 `#dbe6ea`/`#12232b` 12.70:1、错误提示 6.46:1、待审/警告提示 5.24:1、成功提示 5.61:1、信息条文字 8.18:1。

- 改动方式：`--color-ink-soft` `#7b909a→#677981`、`--color-accent` `#c9713a→#af6232`、新增 `--color-line-field` `#7f8c91` 专用于交互控件描边（`src/styles/tokens.css`，文件内有注释标注这些值由审计实算锁定，调亮前必须先过 `pnpm run audit`）。`components.css` 把 `.btn--secondary`、`.nav-toggle-label`、`.lang-switcher__summary`、`.input/.select/.textarea` 的描边改用新 token；`.banner`、`.pending-slot`、`.consent` 等**装饰性**边框保留 `line-strong`，不参与 3:1 判定。
- 键盘可达性、skip-link、label 绑定、焦点可见性：沿用上一轮的 DOM 求值验证；**读屏软件与真机未在验收范围**（见「上一阶段记录」与「未完成事项」）。

### 载荷（生产构建实测字节，非估计）

| 对象 | 字节 | gzip |
|---|---|---|
| `dist/index.html`（根选择页） | 3,600 | 1,648 |
| `dist/404.html` | 3,815 | 1,630 |
| `dist/_astro/_slug.*.css` | 13,829 | 3,422 |
| `ContactForm` chunk | 4,903 | 2,070 |
| `analytics` chunk | 1,491 | 819 |
| `BaseLayout` chunk | 464 | 302 |
| `ConsentNotice` chunk | 299 | 230 |

- 页面 0 张图片、0 个外域资源、1 个阻塞 CSS、无内联 `<style>`；`script-src` 未放宽（`public/_headers` 未创建，见阻塞项 6）。
- 预览构建（`build:preview`）下 19 页 HTML 实测 4,636–14,308 B（gzip 1,961–5,060 B），内容页仍只加载 1 个 CSS + 1–2 个 JS chunk。

### SEO 与文档

- 语言切换器与 hreflang 分工：`hreflangAlternates()` 三层过滤（同 `translation_key` + `published` + `enabled`）；切换器只用本次构建可见页，落点由 `languageHomeIfBuilt()` 给出（该语言首页不存在时取路径序第一个可见页），无落点即整条不输出；未启用语言不生成 sitemap 分片。
- 删除 `src/lib/seo.ts` 中会无条件拼出 `/${lang}` 的死函数；`src/lib/sitemap.ts` 改为只导入类型，使 XML 生成可被 tsx 单元测试直接覆盖。
- 404 页与根选择页补齐 `<title>` / description / robots（新增 3 个 i18n 键：`page.not_found_title`、`page.not_found_description`、`page.root_description`）。
- `docs/seo/technical-seo-checklist.md`（新增）：URL 与 canonical 规范、状态 × 索引 × sitemap × hreflang × 内链矩阵、title/description 长度口径（CJK 与拉丁分档及换算依据）、sitemap 架构与根选择页规则、hreflang 与语言切换器分工、robots/结构化数据/OG、两个已修复缺陷的回归记录、上线前 9 项核对、以及本清单明确不覆盖的项目。
- `docs/operations/deploy-runbook.md`（新增）：工具链版本、命令表（含「末步必须是 build，谁最后写 `dist/` 就上线谁」）、三个环境变量与留空时的安全降级、托管层五条等价规则（无尾斜杠命中、带斜杠 301 而非并列 200、404 不得 soft-404、`_astro` 指纹资源 immutable 而 HTML/sitemap `no-cache`、唯一主域 + HTTPS）、响应头基线、上线前 10 项门禁、发布与 24 小时复查步骤、回滚（含「页面降级优于整体回滚」的单页下架手法）、已知限制表。
- `docs/design/design-system.md`：新增「1.1 颜色对比度（实测锁定）」小节，并修正 token 表中三个色值的记录（原记 `--color-accent` 为改动前的 `#c9713a`）。

## 测试与构建结果（本轮实测）

- `pnpm run ci`（typecheck → validate → test → build → links → audit）：**全绿**。
- `pnpm run typecheck`（tsc 5.9.3）：0 error。
- `tsx --test tests/unit/*.test.ts`：**47 tests / 47 pass / 0 fail**（较上一轮 +2，即 sitemap 分片与根提交两条回归），约 0.46s。
- `validate-content`：0 error / 0 warning；「页面清单 165 行；仓库内 MDX 17 个；未建页 148（其中清单标 blocked 132）」。
- `validate-entry-policy`：0 error / 0 warning；`validate-data`：0 error / **2 warning**（ja、ko 清单各 20 行但未启用，构建层已排除）。
- `validate-seo`：0 error / 0 warning；「内容页 17 个，其中 published 0 个；hreflang 组 0 个；启用语言 zh-hant, zh-hans, en；已检查 dist 产物」。
- `check-prohibited-claims`：0 error / 0 warning（扫描 57 个文件）。
- 生产构建：**2 page(s) built in 2.65s**；`check-links` 2 页 / 5 条站内链接 / 0 error 0 warning；`audit-dist`：**0 error / 0 warning**（报告头注明「检查对象：2 个 HTML 产物、**0 个 `<form>`**、1 条 sitemap URL」——生产构建无 published 页因此无表单可检，该事实写进报告第 3 节，不允许把"全绿"读成"表单安全已验证")。
- 预览构建（本轮另跑）：19 页 / **14 个 `<form>`** / 232 条站内链接；`audit-dist` 0 error / **6 warning**，6 条全部是代表页草稿的 title 短于建议长度带（内容阶段处理，非阻断）。
- 审计规则的可信度用反向验证确认：手改 `dist` 里的 `method=get`、加 `enctype=multipart/form-data`、加 `name="diagnosis"`、把 `maxlength` 改成 5，审计如实报出对应 5 条 error；随后重建，产物回到干净状态。
- 移动端溢出实测（同源 iframe，媒体查询按帧生效）：改前 15 页在 390px 全部溢出（中文 +35px、英文 +454px，英文 768px 仍 +76px）；改后 **15 页 × {320, 390, 768, 1280} = 60 组，溢出 0 组**，桌面头部高度 69px 不变，390px 折叠菜单展开后面板顶边 382px 恰在头底 383px 之下、菜单链接高 44px。

## 新增 / 修改文件（本轮 14:00–14:58，本机时间）

- 代码（新增）：`scripts/audit-dist.ts`
- 代码（修改）：`src/pages/sitemaps/[lang].xml.ts`、`src/lib/sitemap.ts`、`src/styles/tokens.css`、`src/styles/components.css`、`src/components/ContactForm.astro`、`src/lib/i18n.ts`、`src/pages/404.astro`、`src/pages/index.astro`、`scripts/validate-seo.ts`、`tests/unit/seo.test.ts`、`package.json`
- 文档（新增）：`docs/seo/technical-seo-checklist.md`、`docs/operations/deploy-runbook.md`、`docs/testing/audit-report.md`（自动生成）
- 文档（修改）：`docs/design/design-system.md`、`docs/handoff/STATUS.md`
- **未改动**（上一轮 12:40–13:45 产出的其余文件）：`src/lib/content.ts`、`src/lib/config.ts`、`src/lib/seo.ts`、`src/lib/facts.ts`、`src/lib/analytics.ts`、`src/layouts/*.astro`、其余 `src/components/*.astro`、`src/content.config.ts`、其余 `scripts/*`、其余 `tests/*`、`README.md` 及其他 spec 文档。
- **未改动**（同日 12:06–12:30 更早产出，属前序成果，本轮零覆盖）：`data/*.json`、`content/page-manifest.csv`、`docs/content/*`、`docs/compliance/*`、`docs/seo/redirect-map*`、`docs/operations/raci.md`、`docs/operations/entry-policy-review.md`、`docs/decisions/ADR-001`、`ADR-002`。

## 未完成事项

- 148 个页面未创建（132 行清单标 `blocked`，缺书面事实），文档 0.2 第 7 条禁止为凑页数造薄内容。
- P3 全部：日/韩核心页与四套模板，`enabled` 保持 `false`。
- 表单提交与成功/失败链路：等 ADR-002 契约回填。
- 事实数据：入境政策 verified 0 条、航线 verified 0 条、医生 0 位；品牌正式名称、logo、OG 图未确认 → 不输出 `organizationJsonLd`。
- 旧域迁移：`redirect-map.csv` 仍只有表头，`public/_redirects` 仍为空。
- 性能门槛「首屏 < 2 秒」未验证（需真实托管与 Lighthouse），本轮只给字节与请求数。
- 代表页 title 长度带 warning 尚未逐条改写（属内容阶段工作）。

## 阻塞项 / 需要用户决定

1. **是否初始化 git 仓库**（含远端与分支/PR 策略）。不初始化则「一个 PR 对应一份可审核材料」与回滚能力都不存在。
2. **ADR-002 表单 API 契约**需集团 API 负责人逐项书面回填。
3. **P3 的四项前置**（日/韩母语校对人力、LINE/KakaoTalk 与邮箱客服渠道、审核人、术语表与审核矩阵责任人）未确认 → P3 保持 BLOCKED，未擅自启动。
4. **事实的书面确认归属**：院方（成功率、价格、医生、实验室、航线、渠道值守）与法律顾问（入境、出生公民权、辅助生殖合规、隐私保留）。
5. **`approved → published` 的操作人与凭据**（`docs/operations/raci.md` 人名列全空）。
6. **响应头落地方式**：`deploy-runbook.md` 写了 `X-Content-Type-Options` / `Referrer-Policy` / `script-src 'self'` 基线，但**未**创建 `public/_headers`——该文件只对特定托管生效，属托管选型决策，需负责人先定平台。
7. **`pnpm run check`（astro check）是否纳入 `ci`**：目前 `ci` 只跑 `tsc --noEmit`，改链属工具链决策，未擅自改。
8. **`device_category` 的 767px 阈值与 CSS 断点 900/860/700 不一致**：文档口径与实现口径冲突，已记录，等定义。
9. **移动端头部高度口径（新）**：横向溢出已修（见缺陷 6），但 390px 下 sticky 头为 122px（中文）～184px（英文）、320px 下 157～212px。要再压缩只能二选一：窄屏隐藏品牌「待院方書面確認」徽章，或让头部在移动端不 sticky。两者都会丢掉一项信息或一个交互承诺，我没有擅自选。
10. **视觉/像素级验收通道**：本轮**已恢复可用**（截图成功，此前 `NATIVE_BROWSER_VIEWPORT_UNAVAILABLE` 与 Tabbit `Target.createTarget` 的情况未再出现），已完成 6 个页面的目视抽检 + 15 页 × 4 档宽度的溢出实测。剩余需你在真实设备上看：字体渲染、iOS Safari 表单缩放、读屏顺序。

## 执行过的命令（本轮）

```
date "+%Y-%m-%d %H:%M"                                  # 14:55–14:58
pnpm run ci                                             # 首次运行即在 validate:seo 暴露根 URL 误判（缺陷 4）
git rev-parse --is-inside-work-tree                     # fatal: not a git repository
pnpm run build:preview && pnpm run audit                # 19 页 / 14 个 form / 0 error 6 warning
pnpm run ci                                             # 全绿：47 tests、2 页构建、audit 0 error 0 warning
PORT=4322 pnpm run preview:serve                        # 本地起服务供目视抽检（4321 已被上一阶段的 dev server 占用）
# 浏览器侧：navigate + take_screenshot 抽检 /、/404、/zh-hant、/zh-hant/pricing、/zh-hant/entry-path、/en
# 溢出实测：同源 iframe 逐档宽度读 scrollWidth - clientWidth（15 页 × 4 档）
pnpm run build:preview && pnpm run links && pnpm run audit   # 改 CSS 后复测：232 链接 0 error、audit 0 error 6 warning
node -e "…require('./node_modules/<pkg>/package.json').version"   # 锁定依赖版本
find . -newermt "2026-10-13 14:00"                      # 本轮改动文件清单
```

## 下一位 Agent 的唯一下一步

- 向项目负责人索取 **ADR-002 表单 API 契约的书面回填**（`docs/decisions/ADR-002-api-contract.md` 的必须确认清单逐项填写），拿到契约后实现提交与成功/失败链路并补对应单测。在此之前不写任何提交代码、不定义伪字段、不建 mock 端点。
  （若同日先处理阻塞项 1「git 初始化」，以该动作为准，本条顺延；两者不并行。）

## 禁止下一位 Agent 擅自做的事

- 不得把任何页面状态改成 `published`；不得在生产流水线注入 `INCLUDE_DRAFTS`；`pnpm run audit` 报告头部的「构建模式」若显示 **预览**，说明 `dist/` 含草稿，禁止上传。
- 不得补写医疗、法律、入境、成功率、价格、资质、医生等任何事实类内容。
- 不得为凑满 165 页批量生成薄内容；不得为 ja/ko 做机器翻译占位（4 项 P3 前置未确认前 `enabled` 必须保持 `false`）。
- 不得把简体中文页面改成由繁中转换；不得引入繁→简自动转换脚本。
- 不得擅自更换技术栈、域名、语言目录规则、URL 规范或项目范围；发现冲突先记录成 ADR 并提交决策，不静默选择。（`saipanivf.org` 是唯一对外域名；`sivf-asia.com` 处置未决前站内零引用；`redirect-map.csv` 无凭据不填猜测旧 URL。）
- 不得收集附件、病历原件，不得把 PII 放进 GA4 参数或 URL（含原生 GET 兜底）；不得实现绕过同意门的上报。
- 不得为让 `pnpm run audit` 变绿而放宽 `PAIRS` 或阈值——只能改真实色值；不得把未检对象（0 个表单、0 个 published 页）当作已通过。
- 不得未经用户批准删除或覆盖他人的产出（「新增 / 修改文件」一节中标为「未改动」的文件全部在此范围内）。
- 不得在无 git 的情况下假装「已提交/已推送」；涉及提交、推送、发布的动作前必须先实测仓库与产物状态。

## 上一阶段记录（P0 / P1 / P2 框架，2026-10-13 13:45）

该阶段的完整交付说明已折叠进本文件，要点：Astro 5.18.2 静态 + TypeScript 5.9.3 + @astrojs/mdx 4.3.14（pnpm 10.34.1，Node 实测 v26.3.0）；`src/content.config.ts` 的 zod + `superRefine` 委托 `src/lib/page-rules.ts` 作规则单一来源（16 template / 5 status / 8 CTA），构建期与 `scripts/validate-content.ts` 不可能给出不同结论；`content/page-manifest.csv` 165 行冻结（繁中 45 / 简中 45 / 英 35 / 日 20 / 韩 20）并与仓库 17 个 MDX 双向校验；发布闸门（ADR-003）覆盖路由、内链、导航、CTA、sitemap、hreflang、JSON-LD、事实槽位八处；五语路由（ADR-004）`/${lang}` + 无尾斜杠、`x-default → zh-hant`、`auto_redirect_by_ip=false`；设计系统主体、18 个共用组件、3 个布局、5 个路由 + `public/robots.txt`、`public/_redirects`；表单契约（`docs/forms/form-spec.md`：12+1 字段、`us_visa_status` 仅简中、双重长度限制、无附件、蜜罐 + 最短耗时、NEVER_COLLECTED、14 个隐藏字段、解除 ADR-002 所需 7 项确认）与分析契约（`docs/analytics/event-spec.md`：同意门 + `PARAM_ALLOWLIST`/`PII_KEYS` 双重过滤）；6 个校验脚本 + 6 个单测文件 45 tests 全绿；生产构建 2 页 / 5 链接 0 error，预览构建 19 页 / 232 链接 0 error。
该阶段浏览器验收（可访问性树 + DOM 求值 + console）发现并修复的 4 个缺陷——「表单未连接」提示在繁/简中硬编码英文、超长输入误报「必填」、`og:site_name` 在品牌名未确认时输出空值、生产 dist 16 条指向不存在页面的链接（改为「只从本次构建可见页推导链接」）——本轮均未回退，且 `pnpm run audit` 与 `check-links` 会持续复查。
该阶段已声明且本轮仍未消除的未验证项：视觉与像素级呈现、真机屏幕阅读器与 iOS Safari 表单缩放、`noindex` 页面在真实域名下确实不被索引、MDX 草稿正文必填要素齐备性、`terminology-five-languages.csv` 与 `review-matrix.csv` 的逐行交叉核对。

# 部署与运维手册（P2 交付物）

对应开发文档 8.2、12。本项目是**纯静态站点**（`astro.config.mjs` `output: 'static'`），托管层不需要 Node 运行时；唯一的后端调用是表单接口 `PUBLIC_CONTACT_API_URL`（契约见 `docs/decisions/ADR-002-api-contract.md`，当前 BLOCKED）。

## 1. 工具链与版本

| 项 | 值 | 说明 |
|---|---|---|
| 包管理器 | `pnpm@10.34.1` | `package.json` `packageManager` 字段锁定，构建机不得改用 npm/yarn（会产生不同 lockfile） |
| Node（本次实测） | v26.3.0 | `package.json` 未声明 `engines`，构建机以能装上 lockfile 为准；换版本须重跑 `pnpm run ci` |
| astro | 5.18.2 | |
| @astrojs/mdx | 4.3.14 | |
| typescript | 5.9.3 | |
| tsx | 4.23.15 | |
| yaml | 2.9.1 | |
| @astrojs/check | 0.9.10 | `pnpm run check`，目前**不在** `ci` 链内，见第 8 节 |

安装：`pnpm install --frozen-lockfile`（构建机禁用不带 `--frozen-lockfile` 的安装，避免依赖漂移）。

## 2. 命令

| 命令 | 用途 | 能否用于生产 |
|---|---|---|
| `pnpm run ci` | typecheck → validate → test → **build** → links → audit | 是，且必须是流水线最后一步（保证 `dist/` 停在生产构建） |
| `pnpm run build` | 生产构建：只渲染 `published` 页 | 是 |
| `pnpm run build:preview` | 内部预览构建（注入 `INCLUDE_DRAFTS=1`，含 draft/review） | **否，禁止指向生产环境** |
| `pnpm run validate` | 内容 / 入境政策 / SEO / 话术四组源码层校验 | 是 |
| `pnpm run audit` | 对 `dist/` 产物做可访问性、SEO、表单安全、载荷审计，写 `docs/testing/audit-report.md` | 是 |
| `pnpm run preview:serve` | 本地最小静态服务器（`PORT` 默认 4321），人工验收用 | 否 |
| `pnpm run check` | `astro check` 类型诊断 | 是（建议加入 CI，见第 8 节） |

**为什么末步是 build 而不是 preview**：`dist/` 是唯一被上传的目录，谁最后写它就上线谁。所有预览验证做完后必须再跑一次 `pnpm run build`，否则上传的是含草稿的产物。

## 3. 环境变量

只有三个变量，`.env.example` 是唯一模板；`.env.local` 不提交。

| 变量 | 作用 | 留空时的行为（安全降级） |
|---|---|---|
| `PUBLIC_CONTACT_API_URL` | 表单 POST 目标 | `ContactForm.astro` 不发任何请求，改为展示已确认的联络渠道，并显示"接口未开通"横幅 |
| `PUBLIC_GA4_MEASUREMENT_ID` | GA4 | 不加载任何第三方脚本，同意组件不出现 |
| `INCLUDE_DRAFTS` | 构建闸门开关 | 空/`0` = 生产（只 published）。**生产环境必须为空**；`build:preview` 是唯一注入它的脚本 |

规则：

1. 两个 `PUBLIC_*` 变量会编译进前端 bundle，**只能放公开可知的值**。任何密钥、令牌、内部地址一律不入仓、不入环境变量。
2. 取值必须由负责人确认后填写（接口 URL、GA4 媒体资源 ID 都在事实登记表的未核验清单里），未确认前保持留空。
3. 主机名变更（如表单接口从测试域切到生产域）需同步 `docs/compliance/fact-register.csv` 与 `docs/forms/form-spec.md`，不能只改环境变量。

## 4. 托管层配置清单

`public/_redirects`（Cloudflare Pages 格式）目前只有说明注释、**零条重定向**——旧域 URL 清单未导出，不预填猜测映射。换托管时需等价翻译以下五条规则：

| 需求 | 配置要点 | 验证方式 |
|---|---|---|
| 无尾斜杠 URL | `format: 'directory'` + `trailingSlash: 'never'`，产物是 `zh-hant/faq/index.html`，须能被 `/zh-hant/faq` 命中 | `curl -I https://saipanivf.org/zh-hant/faq` 返回 200 且 `content-type: text/html` |
| 带斜杠不得并列 | `/zh-hant/faq/` 应 301 到 `/zh-hant/faq`，不能 200 出同一份内容（否则 canonical 生效前产生重复索引页） | `curl -I` 看 301 + `location` |
| 404 回落 | 未命中路径返回 `dist/404.html`，**状态码必须是 404**（不能 soft-404 返回 200） | `curl -sI https://saipanivf.org/does-not-exist \| head -1` |
| 缓存 | `/_astro/*` 内容哈希文件名 → `max-age=31536000, immutable`；`*.html`、`/robots.txt`、`/sitemap*`、`/sitemaps/*` → `no-cache` 或短 TTL | 首屏后再改文案能立即生效，哈希资源命中内存缓存 |
| 唯一主域 | `saipanivf.org` 为规范域名；`www` 与任何旧域 301 到它，全站 HTTPS，HTTP 强制跳转 | 检查 `location` 与 HSTS |

响应头基线（托管层或 `_headers` 文件设置）：

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`（表单不使用 URL 传参，此项为纵深防御）
- `Content-Security-Policy`：页面为同源静态资源，仅 `script-src 'self'`；**配置 GA4 后必须追加 `googletagmanager.com` / `google-analytics.com`**，未配置时不加，避免为不存在的第三方放宽策略。

## 5. 上线前门禁（逐条通过才发布）

1. `pnpm run ci` 全绿，`pnpm run audit` 的 **error 数为 0**。
2. 本次上传的 `dist/` 由 `pnpm run build` 产出（不带 `INCLUDE_DRAFTS`）。核验：`dist/` 内页面数 == `published` 页数；`grep -rl ">DRAFT<" dist --include=*.html` 与 `>REVIEW<`、`>APPROVED<` 均无命中（草稿横幅由 `DraftBanner.astro` 渲染成 `<strong>DRAFT</strong>`，只要命中就说明上传的是预览构建）。
3. 待发布页的 `status` 均为 `published`，且各自具备 `fact_sources` / `reviewed_by` / `reviewed_at`（由 `validate-content` 与 `page-rules` 强制）。
4. **同一事实的五语版本在同一个发布批次内**，禁止只上线某语言的单页改动。
5. `docs/compliance/prohibited-claims.md` 与 `docs/compliance/approved-claims.md` 无未处理项：成功率、价格数字、入境政策、资质表述必须有书面核准记录，否则该页不得 `published`。
6. `pnpm run audit` 无禁用域命中（站内 HTML 零引用 `sivf-asia.com` 等处置未决域）。
7. `sitemap-index.xml` 与各分语言 sitemap 在生产域名可访问，且只含已上线 URL；`/` 根选择页只出现一次。
8. `robots.txt` 生产可访问，指向 sitemap index，无 `Disallow`。
9. 表单：`PUBLIC_CONTACT_API_URL` 为空时**允许**上线（当前状态，接口契约未确认）；一旦填入真实 URL，须先在测试环境验证后端不接收 `NEVER_COLLECTED` 字段、不写病历类内容、不做逐字段长度信任。
10. 分析：`PUBLIC_GA4_MEASUREMENT_ID` 为空时禁止任何第三方脚本上线。
11. 移动端不横向溢出（文档 8.1 第 6 项）：`pnpm run build:preview && pnpm run preview:serve` 后，用同源 iframe 在 320/390/768/1280 四档宽度对**全部产物**读 `document.documentElement.scrollWidth - clientWidth`，必须全为 0；同时确认折叠菜单展开后面板落在实际头部之下（媒体查询按帧生效，此法等价于真机宽度）。

## 6. 发布步骤

```bash
pnpm install --frozen-lockfile
pnpm run ci                        # 末步为 pnpm run build，dist/ 停在生产构建
pnpm run preview:serve &           # 人工抽检：无尾斜杠链接、404、语言切换器落点
kill %1
# 上传 dist/ 到托管（或触发托管侧构建，构建命令 pnpm run ci 等价，但必须确保最后一步是 build）
```

上线后 24 小时内：

1. Search Console 验证域名属性（前缀 + 域名两种都验证），提交 `sitemap-index.xml`。
2. 抽查索引覆盖报告，确认无"重复页，选定为规范页面"异常增长（尾斜杠并列的信号）。
3. 按 `docs/seo/technical-seo-checklist.md` 第 9 节逐项勾选。
4. 表单接口开通后，用测试邮箱真实提交一次，确认成功页 `/zh-hant/contact-success` 可达、URL 中不含任何表单值、后台收到且未存储病历类文本。

## 7. 回滚

静态站点回滚 = 重新发布上一版产物，不需要回滚数据库或依赖。

1. 托管侧保留每次发布的产物版本（Cloudflare Pages 的部署历史；自建托管则按发布号归档产物目录，`dist/` 本身被 `.gitignore` 忽略，不入仓）。
2. 触发：内容错误（医疗/法律/入境/价格类）立即回滚，不等修复；文案类可先用 `disabled` 语言开关或页面 `status` 降级后重构建。
3. **页面降级不是回滚的替代**：把页面 `status` 从 `published` 改回 `approved` 再 `pnpm run build`，该页会从生产产物、sitemap 与 hreflang 组中同时消失（闸门同源），这是首选的"下架单页"手段。
4. 回滚后重跑 `pnpm run audit`，并检查 sitemap 是否仍与产物一致。

## 8. 已知限制与待办

| 项 | 状态 | 影响 |
|---|---|---|
| 表单接口契约 | BLOCKED（ADR-002 未回填） | 站可上线但不收询盘，只能展示联络渠道 |
| 首屏 < 2 秒 / Core Web Vitals | 未测 | 需真实托管 + 网络档位 + Lighthouse；本手册只有字节与请求数 |
| 视觉像素级验收 | 未执行（测试环境视口不可用） | 由人工在验收步骤补做 |
| `pnpm run check`（astro check） | 不在 `ci` 链内 | 建议加入，属工具链决策，需确认后改动 |
| `package.json` 无 `engines` | 待补 | 构建机 Node 版本漂移无约束 |
| `device_category` 767px 口径 vs CSS 断点 900/860/700 | 不一致，未静默修改 | 见 `docs/handoff/STATUS.md`，需负责人定口径 |
| 旧域 301 | 阻塞（旧 URL 清单未导出） | `public/_redirects` 保持零条映射，不猜测 |

# 分析事件规格（P1 交付物）

对应开发文档 1.1（核心指标口径）、6.4（埋点与隐私）、8.1 第 13 项。实现：`src/lib/analytics.ts` + `BaseLayout.astro` 的点击观察者 + `ContactForm.astro` 的表单事件。

## 1. 前置条件

| 条件 | 行为 |
|---|---|
| 未配置 `PUBLIC_GA4_MEASUREMENT_ID` | 不加载 gtag、不出现在页面、不派发事件；同意横幅也不渲染（没有追踪就不打扰） |
| 已配置 ID 但访客未同意 | `track()` 立即 return：不加载脚本、不上报、不派发 DOM 事件 |
| 同意后 | `setConsent('granted')` → 注入 `googletagmanager.com/gtag/js?id=…`，`config` 带 `anonymize_ip: true, send_page_view: true` |
| 拒绝 | 记住 `denied`，永不加载 |

同意状态存 `localStorage['sivf.analytics-consent']`（值 `granted|denied`，未设置为 `unset` 时显示横幅）。同意策略本身属法务待确认项（`fact-register.csv` 的 `analytics-consent-policy`、文档 13.3）：五个市场的 Cookie 规则未书面确认前，**不启用 GA4 配置**，即当前构建不加载任何第三方脚本（已在预览中实测：外部请求 0 条）。

## 2. 事件表

| 事件 | 触发点 | 参数 | 实现 |
|---|---|---|---|
| `cta_click` | 任意 `[data-cta-id]`（hero 主/次 CTA、页头按钮、浮动 CTA、卡片次级链接）被点击 | `lang page_type page_path cta_id` | 已接线（捕获阶段监听，`page_path` 取实时 `location.pathname`） |
| `messaging_entry_click` | `[data-channel-link]`（页脚/联络区的渠道入口） | `lang page_type page_path channel` | 已接线；当前 `contact-channels.json` 无 verified+enabled 账号 → 页面上没有渠道链接，事件不会触发（这是事实闸门的预期结果） |
| `form_start` | 表单首次 `focusin`（每次页面最多一次） | `lang page_type page_path` | 已接线 |
| `form_submit_success` | 服务端返回 2xx | `lang page_type page_path` | 已接线（依赖 ADR-002 才能真正发生） |
| `form_submit_error` | 校验失败 `cta_id=validation`；网络/端点失败 `cta_id=network` | `lang page_type page_path cta_id` | 已接线；蜜罐与过快提交**不上报**（避免把机器人流量灌进漏斗） |
| `success_page_view` | `pageType === 'success'`（contact_success 模板） | `lang page_type page_path` | 已接线 |
| `download_itinerary_click` | 行程 PDF 下载按钮 | 同上 + `cta_id` | **未接线**：行程文件与价格指南文件由院方提供后才存在（缺 `asset-itinerary-pdf`、`asset-price-guide-pdf` 事实） |
| `download_price_guide_click` | 价格指南下载 | 同上 | **未接线**，同上 |

预留属性：导航链接带 `data-analytics-nav={labelKey}`，当前由 GA4 自动 `page_view` 覆盖目的地，未单独发事件；若后续要区分导航点击，需先扩展白名单再实现，避免自造未登记参数。

## 3. 参数白名单与 PII 防线

```ts
PARAM_ALLOWLIST = lang, page_type, page_path, cta_id, channel,
                  campaign_source, utm_source, device_category
PII_KEYS（静默丢弃，即便出现在 params 里也不外发）
                  = salutation, name, contact_account, email, phone, message,
                    past_treatment, age, country, diagnosis
```

- 双重限制：键必须在白名单内，值必须是 `string | number | boolean`，字符串截断 120 字符。
- 表单字段名一律不在白名单内 → 表单内容物理上进不了事件。
- `device_category` 目前只进表单 payload（`window.matchMedia('(max-width: 767px)')`）；GA4 侧由平台自动维度提供，DOM 未标注，避免同一指标两套口径。
- URL 不带任何表单数据；`page_path` 为 pathname，UTM 只取白名单四项且截断 80 字符。
- 无匿名 ID/跨通道去重实现：文档 13.5 要求先确认同意与隐私边界，未确认前报表只能按事件计数，**不得声称「已去重咨询数」**。

## 4. 指标口径（写进报表前必须遵守）

| 指标 | 口径 | 禁止说法 |
|---|---|---|
| 咨询线索 | `form_submit_success` 事件数 | 不得用 `form_start` 或点击数代替 |
| 入口点击 | `cta_click + messaging_entry_click` | 只代表点击，不得称「已开启会话」「已回复」 |
| 表单转化 | `form_submit_success / form_start` | 蜜罐与过快提交不计入分母 |
| 跨通道 7 天去重 | 未实现 | 不得出现在任何汇报中 |

## 5. 上线前需要补的验证

1. GA4 属性与数据流、GSC 验证由谁持有（`inst-primary-domain-control` 权限未确认）；
2. 配置 `PUBLIC_GA4_MEASUREMENT_ID` 后在预览环境实测同意/拒绝两条路径（当前只能验证「未配置=零请求」）；
3. 事件在 GA4 报告里的调试视图截图归档到 `docs/handoff/`；
4. 若法务要求 Server-Side Tagging 或禁用 `send_page_view`，改动需新 ADR。

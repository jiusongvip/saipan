# 表单规格（P1 交付物）

对应开发文档 6.1–6.5、8.1 第 12/13 项。**提交传输层仍被 `docs/decisions/ADR-002-api-contract.md`（BLOCKED）挡住**：字段契约、校验、反滥用、隐私边界已实现并可测试；接口地址、鉴权、限流、幂等、数据保留未确认前不发送任何请求。

## 1. 出现位置与变体

| 位置 | 说明 |
|---|---|
| 落地页与正文页底部 `#consult` | `LandingLayout` / `ContentLayout`（`withForm` 为真时）；`contact_success` 页不放表单 |
| 供者入口 | `variant="donor"` → `#donor-form`，与患者咨询分流（文档 12 清单）；当前仅在供者页模板调用时启用 |
| 语言 | 表单文案全部来自 `t(lang, 'form.*')`，zh-hans 多出美国签证字段 |

生产构建且缺少 `PUBLIC_CONTACT_API_URL` 或没有可用渠道时，**整个表单不渲染**，改为提示「请改用联络渠道」（`form.no_api`）。这是刻意的：不收集无法送达的线索。

## 2. 字段契约（`src/lib/forms.ts`）

可见字段（12 + zh-hans 附加 1）：

| name | 类型 | 必填 | 上限 | 取值 |
|---|---|---|---|---|
| `salutation` | text | 是 | 60 | 称呼，不要求全名 |
| `channel` | select | 是 | — | line/email/whatsapp/kakaotalk/phone（已核验渠道优先，未核验时列计划渠道并标注待确认） |
| `contact_account` | text | 是 | 160 | 按所选渠道的账号或电话 |
| `country` | text | 是 | 80 | 所在国家或地区 |
| `age` | number | 否 | — | 18–75 整数 |
| `program` | select | 是 | — | ivf/egg_freezing/donor_egg/donor_sperm/surrogacy/lgbtq/recurrent_failure/unsure |
| `past_treatment` | textarea | 否 | 400 | 提示「请勿填写病历号、诊断结论或上传检查报告」 |
| `timeline` | select | 是 | — | 1m/3m/6m/researching |
| `preferred_time` | text | 否 | 60 | 方便联系时段 |
| `timezone` | 隐藏 | — | 60 | |
| `message` | textarea | 否 | 1000 | 同上提醒 |
| `privacy_consent` | checkbox | 是（必须为 true） | — | 勾选前须能看到隐私声明 |
| `us_visa_status` | select | 仅 zh-hans 必填 | — | yes/no/processing（其他语言不出现，避免收集非必要信息） |

隐藏上下文（14）：`form_variant lang page_type page_path source_page cta_label device_category referrer_domain utm_source utm_medium utm_campaign utm_content visitor_timezone submitted_at`。

**绝不收集**：`attachments file chart_number diagnosis medical_record id_number`。没有附件上传功能（文档 1.3、6.2）；`NEVER_COLLECTED` 会在 `buildPayload()` 里二次剔除，即使误加字段也不进 payload。

## 3. 校验

- 客户端：`validate(values, {lang})` → 错误码 map（`form.error_required` / `form.error_length`），UI 只翻译键名，不把错误文案写死在脚本里。
- 服务端必须再校验一次（文档 6.2）；前端校验只是体验层。
- 枚举值白名单：`program/timeline/us_visa_status` 不在允许值内即报错，不接受自由文本注入。
- 长度双重限制：`maxlength` 属性（输入时）+ `buildPayload()` 再次 `slice(0, MAX_LENGTHS)`（提交时）。
- 错误提示映射：全部为长度类错误 → 长度文案；否则 → 必填文案。

## 4. 反滥用

| 手段 | 实现 | 失败时的表现 |
|---|---|---|
| 蜜罐 | `name="company"`，`.hp-field` + `aria-hidden` + `tabindex="-1"`；`collect()` 就把它排除在业务字段外 | 一旦非空即判定机器人 |
| 最短耗时 | `MIN_ELAPSED_MS = 4000`（`performance.now()` 自脚本初始化起算） | 过快提交拒绝 |
| 拒绝话术 | 统一返回 `form.error_network` | 不暴露内部原因，不给攻击者反馈 |
| 端点白名单 | `resolveEndpoint(configured, allowedHosts)`：只接受 `https:` 且主机在允许列表内，否则返回 null | 未确认契约时不请求 |
| 无密钥外露 | 不允许前端直连飞书；若契约要求签名，必须由边缘函数代理（待 ADR-002 决定） | — |

## 5. 提交结果

- 成功：若同语言存在 `contact_success` 页则跳转该路径（`data-success-path`），否则隐藏表单并显示 `form.success_title`；上报 `form_submit_success`（只带匿名维度）。
- 失败：恢复按钮、文案改为「重试」、上报 `form_submit_error(cta_id=network)`。
- 不承诺响应时间：`contact_success` 正文只写「不设固定回复时限承诺」，响应承诺须与真实值班表一致（文档 12 清单），值班表未确认前不得写数字。
- 无 localStorage/sessionStorage 写入表单内容（文档 6.3）；`sanitizeForLog()` 直接抛错，作为「表单值不得进日志」的编译期提醒。

## 6. 隐私边界

- 表单内容一律不进 GA4：`PARAM_ALLOWLIST`（lang/page_type/page_path/cta_id/channel/campaign_source/utm_source/device_category）+ `PII_KEYS` 双重过滤，非白名单键静默丢弃。
- `source_page` 只保留规范化 pathname，**丢弃 query**（避免 URL 泄漏 token 等敏感参数）；UTM 单独取白名单四项。
- 表单数据不进 URL、不写日志、不做前端持久化。
- 未同意分析时 `track()` 直接 return：不加载 GA4、不上报、也不派发 DOM 事件。
- 数据保留/删除 SLA 属法务待确认项（`fact-register.csv` 的 `legal-privacy-retention`），未在 `privacy-and-data-protection` 页写死期限。

## 7. 解除阻塞需要（逐项回填 ADR-002）

1. 端点 base URL 与环境划分、CORS/代理方案；
2. 鉴权方式与密钥归属（浏览器不可见时代理由谁实现）；
3. 请求体字段名与本文 12+14 字段的映射、必填与长度是否与后端一致；
4. 响应结构与失败码（用于区分「已收到」与「已入表」）；
5. 限流/幂等（同一访客重复提交是否去重）；
6. 数据保留期限、访问角色、删除流程与备份边界；
7. 允许的 host 白名单（写入 `resolveEndpoint` 的 `allowedHosts`）。

上述确认后只需：注入 `PUBLIC_CONTACT_API_URL` → 在 `ContactForm.astro` 用 `resolveEndpoint()` 校验 → 补一条契约测试。**在此之前不得添加任何 mock 端点或伪字段。**

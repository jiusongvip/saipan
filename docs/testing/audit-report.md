# 构建产物技术审计报告

- 生成命令：`pnpm run audit`（本文件由 scripts/audit-dist.ts 自动生成，请勿手改）
- 审计对象：`dist/`，50 个页面，sitemap 条目 1 个
- 判定口径：对比度按 WCAG 2.1 相对亮度实算；正文阈值 4.5:1，非文本 UI 与大字号 3:1
- 检查对象：50 个 HTML 产物、46 个 <form>、1 条 sitemap URL
- 构建模式：**演示**（产物含 48 个未上线页，外壳已剥离，禁止指向生产）
- 结果：**0 error / 0 warning**

## 1. 颜色对比度（token 实算）

| 用途 | 前景 | 背景 | 比值 | 要求 | 结果 |
|---|---|---|---|---|---|
| 正文（body） | #0e2233 | #ffffff | 16.21:1 | ≥4.5:1 | 通过 |
| 次要文字、表单说明 | #3d5771 | #ffffff | 7.5:1 | ≥4.5:1 | 通过 |
| 来源注记、待核槽位（小字号） | #5b7186 | #ffffff | 5.06:1 | ≥4.5:1 | 通过 |
| 卡片与浅底区块正文 | #0e2233 | #f1f5f9 | 14.8:1 | ≥4.5:1 | 通过 |
| 强调底色上的正文 | #0e2233 | #f7f1e3 | 14.4:1 | ≥4.5:1 | 通过 |
| 正文内链接 | #1a5f9e | #ffffff | 6.62:1 | ≥4.5:1 | 通过 |
| 主按钮文字（内链态） | #0d4471 | #ffffff | 10.08:1 | ≥4.5:1 | 通过 |
| 主按钮文字 / 反白区 | #ffffff | #0d4471 | 10.08:1 | ≥4.5:1 | 通过 |
| 次级实心按钮文字 | #ffffff | #1a5f9e | 6.62:1 | ≥4.5:1 | 通过 |
| 链接 hover 文字（a:hover） | #8a6516 | #ffffff | 5.31:1 | ≥4.5:1 | 通过 |
| hero 眉标（金字压在暖色渐变上） | #8a6516 | #f7f1e3 | 4.72:1 | ≥4.5:1 | 通过 |
| 焦点描边 3px（非文本 UI） | #8a6516 | #ffffff | 5.31:1 | ≥3:1 | 通过 |
| 表单控件与次级按钮描边 | #6c8296 | #ffffff | 3.98:1 | ≥3:1 | 通过 |
| 控件描边落在浅底区块上 | #6c8296 | #f1f5f9 | 3.64:1 | ≥3:1 | 通过 |
| 页脚正文 | #dbe6ea | #0e2233 | 12.75:1 | ≥4.5:1 | 通过 |
| 错误提示 | #9c2a2a | #fbe9e9 | 6.46:1 | ≥4.5:1 | 通过 |
| 待审/警告提示 | #8a5b00 | #fdf1d9 | 5.24:1 | ≥4.5:1 | 通过 |
| 成功提示 | #1c6b45 | #e3f2ea | 5.61:1 | ≥4.5:1 | 通过 |
| 信息条文字 | #0d4471 | #e4eefa | 8.6:1 | ≥4.5:1 | 通过 |

## 2. 页面载荷（实测字节）

| URL | HTML | HTML(gzip) | 本地资源数 | CSS 阻塞数 | 内联样式 | 脚本块 | 图片 | 外部域名 |
|---|---|---|---|---|---|---|---|---|
| /404 | 7371 B | 2673 B | 3 | 1 | 0 B | 4 | 0 | 无 |
| /en/contact-success | 7399 B | 2761 B | 4 | 2 | 0 B | 4 | 0 | 无 |
| /en/entry-path | 23304 B | 6647 B | 6 | 2 | 0 B | 7 | 1 | 无 |
| /en | 27804 B | 8532 B | 18 | 2 | 0 B | 9 | 13 | 无 |
| /en/pricing | 23412 B | 6759 B | 6 | 2 | 0 B | 7 | 1 | 无 |
| /en/programs/ivf-icsi | 23458 B | 6663 B | 6 | 2 | 0 B | 7 | 1 | 无 |
| /en/tools | 15334 B | 4953 B | 5 | 2 | 0 B | 8 | 0 | 无 |
| /en/why-saipan | 23482 B | 6701 B | 6 | 2 | 0 B | 7 | 1 | 无 |
| / | 28116 B | 9386 B | 18 | 2 | 0 B | 8 | 13 | 无 |
| /zh-hans/articles/amh-low-ovarian-reserve | 18237 B | 7037 B | 5 | 2 | 0 B | 6 | 0 | 无 |
| /zh-hans/articles/documents-before-first-visit | 15916 B | 5618 B | 5 | 2 | 0 B | 6 | 0 | 无 |
| /zh-hans/articles/entry-policy-change-what-to-check | 18616 B | 7128 B | 5 | 2 | 0 B | 6 | 0 | 无 |
| /zh-hans/articles/flights-to-saipan-routes | 18109 B | 6935 B | 5 | 2 | 0 B | 6 | 0 | 无 |
| /zh-hans/articles/how-to-read-success-statistics | 16794 B | 6134 B | 5 | 2 | 0 B | 6 | 0 | 无 |
| /zh-hans/articles | 23939 B | 7540 B | 5 | 2 | 0 B | 6 | 0 | 无 |
| /zh-hans/articles/ivf-abroad-decision-checklist | 16253 B | 5969 B | 5 | 2 | 0 B | 6 | 0 | 无 |
| /zh-hans/articles/lab-own-or-outsourced | 16915 B | 6176 B | 5 | 2 | 0 B | 6 | 0 | 无 |
| /zh-hans/articles/price-ranges-and-addon-items | 18040 B | 6789 B | 5 | 2 | 0 B | 6 | 0 | 无 |
| /zh-hans/articles/saipan-vs-us-mainland | 18758 B | 7165 B | 5 | 2 | 0 B | 6 | 0 | 无 |
| /zh-hans/articles/stay-itinerary-planning | 16210 B | 5931 B | 5 | 2 | 0 B | 6 | 0 | 无 |
| /zh-hans/articles/translation-and-support-arrangements | 16108 B | 5765 B | 5 | 2 | 0 B | 6 | 0 | 无 |
| /zh-hans/articles/us-born-baby-advantages | 18127 B | 6929 B | 5 | 2 | 0 B | 6 | 0 | 无 |
| /zh-hans/contact-success | 8308 B | 3237 B | 4 | 2 | 0 B | 4 | 0 | 无 |
| /zh-hans/entry-path | 23019 B | 7299 B | 6 | 2 | 0 B | 7 | 1 | 无 |
| /zh-hans | 28729 B | 9614 B | 18 | 2 | 0 B | 9 | 13 | 无 |
| /zh-hans/programs/ivf-icsi | 23103 B | 7168 B | 6 | 2 | 0 B | 7 | 1 | 无 |
| /zh-hans/tools | 16355 B | 5534 B | 5 | 2 | 0 B | 8 | 0 | 无 |
| /zh-hant/articles/amh-low-ovarian-reserve | 18564 B | 7034 B | 5 | 2 | 0 B | 6 | 0 | 无 |
| /zh-hant/articles/documents-before-first-visit | 16404 B | 5705 B | 5 | 2 | 0 B | 6 | 0 | 无 |
| /zh-hant/articles/entry-policy-change-what-to-check | 19000 B | 7224 B | 5 | 2 | 0 B | 6 | 0 | 无 |
| /zh-hant/articles/flights-to-saipan-routes | 18630 B | 7112 B | 5 | 2 | 0 B | 6 | 0 | 无 |
| /zh-hant/articles/how-to-read-success-statistics | 17270 B | 6227 B | 5 | 2 | 0 B | 6 | 0 | 无 |
| /zh-hant/articles | 24427 B | 7605 B | 5 | 2 | 0 B | 6 | 0 | 无 |
| /zh-hant/articles/ivf-abroad-decision-checklist | 16869 B | 6094 B | 5 | 2 | 0 B | 6 | 0 | 无 |
| /zh-hant/articles/lab-own-or-outsourced | 17343 B | 6252 B | 5 | 2 | 0 B | 6 | 0 | 无 |
| /zh-hant/articles/price-ranges-and-addon-items | 18670 B | 6930 B | 5 | 2 | 0 B | 6 | 0 | 无 |
| /zh-hant/articles/saipan-vs-us-mainland | 18972 B | 7141 B | 5 | 2 | 0 B | 6 | 0 | 无 |
| /zh-hant/articles/stay-itinerary-planning | 16781 B | 6039 B | 5 | 2 | 0 B | 6 | 0 | 无 |
| /zh-hant/articles/translation-and-support-arrangements | 16578 B | 5829 B | 5 | 2 | 0 B | 6 | 0 | 无 |
| /zh-hant/articles/us-born-baby-advantages | 18602 B | 7092 B | 5 | 2 | 0 B | 6 | 0 | 无 |
| /zh-hant/cities/taipei | 24423 B | 7464 B | 6 | 2 | 0 B | 7 | 1 | 无 |
| /zh-hant/contact-success | 8728 B | 3327 B | 4 | 2 | 0 B | 4 | 0 | 无 |
| /zh-hant/entry-path | 24449 B | 7421 B | 6 | 2 | 0 B | 7 | 1 | 无 |
| /zh-hant/faq | 15684 B | 5376 B | 5 | 2 | 0 B | 6 | 0 | 无 |
| /zh-hant | 28824 B | 9664 B | 18 | 2 | 0 B | 9 | 13 | 无 |
| /zh-hant/legal/privacy-and-data-protection | 15458 B | 5311 B | 5 | 2 | 0 B | 6 | 0 | 无 |
| /zh-hant/pricing | 24599 B | 7419 B | 6 | 2 | 0 B | 7 | 1 | 无 |
| /zh-hant/programs/ivf-icsi | 24539 B | 7285 B | 6 | 2 | 0 B | 7 | 1 | 无 |
| /zh-hant/tools | 16883 B | 5647 B | 5 | 2 | 0 B | 8 | 0 | 无 |
| /zh-hant/why-saipan | 25917 B | 7931 B | 6 | 2 | 0 B | 7 | 1 | 无 |

### 本地资源体积

| 资源 | 字节 |
|---|---|
| /images/american-flag.jpg | 494262 B |
| /images/quiet-botanical.jpg | 399736 B |
| /images/daily-meals.jpg | 269934 B |
| /images/island-pool.jpg | 252530 B |
| /images/stay-room.jpg | 200424 B |
| /images/flight-wing.jpg | 172240 B |
| /images/couple-editorial.jpg | 145707 B |
| /images/laboratory-care.jpg | 144088 B |
| /images/care-consultation.jpg | 82019 B |
| /images/saipan-lagoon-aerial.jpg | 26763 B |
| /_astro/_slug_.DtLwtXCg.css | 20402 B |
| /_astro/_slug_.D_4NdcrV.css | 18659 B |
| /_astro/ContactForm.astro_astro_type_script_index_0_lang.BxxlsuRS.js | 5106 B |
| /_astro/BaseLayout.astro_astro_type_script_index_0_lang.B3ON7J0h.js | 982 B |
| /_astro/ConsentNotice.astro_astro_type_script_index_0_lang.Cqo2LTDW.js | 299 B |

## 3. 未在本文档中测定的项目

- 首屏 < 2 秒（文档 8.1 第 9 项）：需要真实托管 + 网络档位（Fast3G/4G）与 Lighthouse，本脚本只给字节与请求数，不给时间估计。
- 真机屏幕阅读器（NVDA/VoiceOver）与 iOS Safari 表单缩放：需要人工，本脚本只验证结构与 label 绑定。
- 表单提交与失败链路：ADR-002 契约未确认，未接线。
- GA4 实际上报：未配置 measurement ID，只验证「同意前 0 事件、同意后仅白名单参数」。

## 4. 本次判定的问题清单

### error（0）

- （无）

### warning（0）

- （无）

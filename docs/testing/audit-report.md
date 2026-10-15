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
| /404 | 7371 B | 2675 B | 3 | 1 | 0 B | 4 | 0 | 无 |
| /en/contact-success | 7934 B | 2836 B | 5 | 3 | 0 B | 4 | 0 | 无 |
| /en/entry-path | 23839 B | 6722 B | 7 | 3 | 0 B | 7 | 1 | 无 |
| /en | 28272 B | 8563 B | 19 | 3 | 0 B | 9 | 13 | 无 |
| /en/pricing | 23947 B | 6833 B | 7 | 3 | 0 B | 7 | 1 | 无 |
| /en/programs/ivf-icsi | 23993 B | 6738 B | 7 | 3 | 0 B | 7 | 1 | 无 |
| /en/tools | 15869 B | 5031 B | 6 | 3 | 0 B | 8 | 0 | 无 |
| /en/why-saipan | 18555 B | 6156 B | 12 | 3 | 0 B | 6 | 6 | 无 |
| / | 28049 B | 9374 B | 18 | 2 | 0 B | 8 | 13 | 无 |
| /zh-hans/articles/amh-low-ovarian-reserve | 18296 B | 7053 B | 6 | 3 | 0 B | 6 | 0 | 无 |
| /zh-hans/articles/documents-before-first-visit | 15975 B | 5633 B | 6 | 3 | 0 B | 6 | 0 | 无 |
| /zh-hans/articles/entry-policy-change-what-to-check | 18675 B | 7142 B | 6 | 3 | 0 B | 6 | 0 | 无 |
| /zh-hans/articles/flights-to-saipan-routes | 18168 B | 6952 B | 6 | 3 | 0 B | 6 | 0 | 无 |
| /zh-hans/articles/how-to-read-success-statistics | 16853 B | 6149 B | 6 | 3 | 0 B | 6 | 0 | 无 |
| /zh-hans/articles | 23998 B | 7552 B | 6 | 3 | 0 B | 6 | 0 | 无 |
| /zh-hans/articles/ivf-abroad-decision-checklist | 16312 B | 5985 B | 6 | 3 | 0 B | 6 | 0 | 无 |
| /zh-hans/articles/lab-own-or-outsourced | 16974 B | 6191 B | 6 | 3 | 0 B | 6 | 0 | 无 |
| /zh-hans/articles/price-ranges-and-addon-items | 18099 B | 6804 B | 6 | 3 | 0 B | 6 | 0 | 无 |
| /zh-hans/articles/saipan-vs-us-mainland | 22757 B | 8851 B | 12 | 3 | 0 B | 6 | 6 | 无 |
| /zh-hans/articles/stay-itinerary-planning | 16269 B | 5946 B | 6 | 3 | 0 B | 6 | 0 | 无 |
| /zh-hans/articles/translation-and-support-arrangements | 16167 B | 5784 B | 6 | 3 | 0 B | 6 | 0 | 无 |
| /zh-hans/articles/us-born-baby-advantages | 18186 B | 6946 B | 6 | 3 | 0 B | 6 | 0 | 无 |
| /zh-hans/contact-success | 8367 B | 3252 B | 5 | 3 | 0 B | 4 | 0 | 无 |
| /zh-hans/entry-path | 23078 B | 7316 B | 7 | 3 | 0 B | 7 | 1 | 无 |
| /zh-hans | 28721 B | 9607 B | 19 | 3 | 0 B | 9 | 13 | 无 |
| /zh-hans/programs/ivf-icsi | 23162 B | 7184 B | 7 | 3 | 0 B | 7 | 1 | 无 |
| /zh-hans/tools | 16414 B | 5550 B | 6 | 3 | 0 B | 8 | 0 | 无 |
| /zh-hant/articles/amh-low-ovarian-reserve | 18623 B | 7045 B | 6 | 3 | 0 B | 6 | 0 | 无 |
| /zh-hant/articles/documents-before-first-visit | 16463 B | 5720 B | 6 | 3 | 0 B | 6 | 0 | 无 |
| /zh-hant/articles/entry-policy-change-what-to-check | 19059 B | 7242 B | 6 | 3 | 0 B | 6 | 0 | 无 |
| /zh-hant/articles/flights-to-saipan-routes | 18689 B | 7123 B | 6 | 3 | 0 B | 6 | 0 | 无 |
| /zh-hant/articles/how-to-read-success-statistics | 17329 B | 6237 B | 6 | 3 | 0 B | 6 | 0 | 无 |
| /zh-hant/articles | 24486 B | 7624 B | 6 | 3 | 0 B | 6 | 0 | 无 |
| /zh-hant/articles/ivf-abroad-decision-checklist | 16928 B | 6108 B | 6 | 3 | 0 B | 6 | 0 | 无 |
| /zh-hant/articles/lab-own-or-outsourced | 17402 B | 6268 B | 6 | 3 | 0 B | 6 | 0 | 无 |
| /zh-hant/articles/price-ranges-and-addon-items | 18729 B | 6945 B | 6 | 3 | 0 B | 6 | 0 | 无 |
| /zh-hant/articles/saipan-vs-us-mainland | 19031 B | 7155 B | 6 | 3 | 0 B | 6 | 0 | 无 |
| /zh-hant/articles/stay-itinerary-planning | 16840 B | 6054 B | 6 | 3 | 0 B | 6 | 0 | 无 |
| /zh-hant/articles/translation-and-support-arrangements | 16637 B | 5843 B | 6 | 3 | 0 B | 6 | 0 | 无 |
| /zh-hant/articles/us-born-baby-advantages | 18661 B | 7108 B | 6 | 3 | 0 B | 6 | 0 | 无 |
| /zh-hant/cities/taipei | 24482 B | 7481 B | 7 | 3 | 0 B | 7 | 1 | 无 |
| /zh-hant/contact-success | 8787 B | 3342 B | 5 | 3 | 0 B | 4 | 0 | 无 |
| /zh-hant/entry-path | 24508 B | 7438 B | 7 | 3 | 0 B | 7 | 1 | 无 |
| /zh-hant/faq | 15743 B | 5388 B | 6 | 3 | 0 B | 6 | 0 | 无 |
| /zh-hant | 28816 B | 9658 B | 19 | 3 | 0 B | 9 | 13 | 无 |
| /zh-hant/legal/privacy-and-data-protection | 15517 B | 5324 B | 6 | 3 | 0 B | 6 | 0 | 无 |
| /zh-hant/pricing | 24658 B | 7433 B | 7 | 3 | 0 B | 7 | 1 | 无 |
| /zh-hant/programs/ivf-icsi | 24598 B | 7302 B | 7 | 3 | 0 B | 7 | 1 | 无 |
| /zh-hant/tools | 16942 B | 5661 B | 6 | 3 | 0 B | 8 | 0 | 无 |
| /zh-hant/why-saipan | 20456 B | 7557 B | 12 | 3 | 0 B | 6 | 6 | 无 |

### 本地资源体积

| 资源 | 字节 |
|---|---|
| /images/american-flag.jpg | 494262 B |
| /images/quiet-botanical.jpg | 399736 B |
| /images/daily-meals.jpg | 269934 B |
| /images/family-moment.jpg | 263491 B |
| /images/island-pool.jpg | 252530 B |
| /images/stay-room.jpg | 200424 B |
| /images/flight-wing.jpg | 172240 B |
| /images/couple-editorial.jpg | 145707 B |
| /images/laboratory-care.jpg | 144088 B |
| /images/care-consultation.jpg | 82019 B |
| /images/saipan-lagoon-aerial.jpg | 26763 B |
| /_astro/_slug_.BKg5Jhpx.css | 20635 B |
| /_astro/_slug_.BQxXWklN.css | 19277 B |
| /_astro/_slug_.ClRDZ2Em.css | 5862 B |
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

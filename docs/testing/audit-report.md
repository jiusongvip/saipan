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
| /404 | 5360 B | 2153 B | 3 | 1 | 0 B | 3 | 0 | 无 |
| /en/contact-success | 6588 B | 2558 B | 4 | 2 | 0 B | 3 | 0 | 无 |
| /en/entry-path | 22508 B | 6493 B | 6 | 2 | 0 B | 6 | 1 | 无 |
| /en | 27008 B | 8421 B | 18 | 2 | 0 B | 8 | 13 | 无 |
| /en/pricing | 22616 B | 6603 B | 6 | 2 | 0 B | 6 | 1 | 无 |
| /en/programs/ivf-icsi | 22662 B | 6507 B | 6 | 2 | 0 B | 6 | 1 | 无 |
| /en/tools | 14523 B | 4790 B | 5 | 2 | 0 B | 7 | 0 | 无 |
| /en/why-saipan | 22686 B | 6554 B | 6 | 2 | 0 B | 6 | 1 | 无 |
| / | 26022 B | 9057 B | 18 | 2 | 0 B | 7 | 13 | 无 |
| /zh-hans/articles/amh-low-ovarian-reserve | 16104 B | 6551 B | 5 | 2 | 0 B | 5 | 0 | 无 |
| /zh-hans/articles/documents-before-first-visit | 13763 B | 5133 B | 5 | 2 | 0 B | 5 | 0 | 无 |
| /zh-hans/articles/entry-policy-change-what-to-check | 16483 B | 6620 B | 5 | 2 | 0 B | 5 | 0 | 无 |
| /zh-hans/articles/flights-to-saipan-routes | 15956 B | 6427 B | 5 | 2 | 0 B | 5 | 0 | 无 |
| /zh-hans/articles/how-to-read-success-statistics | 14641 B | 5634 B | 5 | 2 | 0 B | 5 | 0 | 无 |
| /zh-hans/articles | 21845 B | 7185 B | 5 | 2 | 0 B | 5 | 0 | 无 |
| /zh-hans/articles/ivf-abroad-decision-checklist | 14120 B | 5462 B | 5 | 2 | 0 B | 5 | 0 | 无 |
| /zh-hans/articles/lab-own-or-outsourced | 14762 B | 5664 B | 5 | 2 | 0 B | 5 | 0 | 无 |
| /zh-hans/articles/price-ranges-and-addon-items | 15887 B | 6303 B | 5 | 2 | 0 B | 5 | 0 | 无 |
| /zh-hans/articles/saipan-vs-us-mainland | 16605 B | 6734 B | 5 | 2 | 0 B | 5 | 0 | 无 |
| /zh-hans/articles/stay-itinerary-planning | 14057 B | 5425 B | 5 | 2 | 0 B | 5 | 0 | 无 |
| /zh-hans/articles/translation-and-support-arrangements | 13955 B | 5262 B | 5 | 2 | 0 B | 5 | 0 | 无 |
| /zh-hans/articles/us-born-baby-advantages | 15974 B | 6434 B | 5 | 2 | 0 B | 5 | 0 | 无 |
| /zh-hans/contact-success | 6214 B | 2709 B | 4 | 2 | 0 B | 3 | 0 | 无 |
| /zh-hans/entry-path | 20925 B | 6817 B | 6 | 2 | 0 B | 6 | 1 | 无 |
| /zh-hans | 26635 B | 9289 B | 18 | 2 | 0 B | 8 | 13 | 无 |
| /zh-hans/programs/ivf-icsi | 21009 B | 6688 B | 6 | 2 | 0 B | 6 | 1 | 无 |
| /zh-hans/tools | 14261 B | 5055 B | 5 | 2 | 0 B | 7 | 0 | 无 |
| /zh-hant/articles/amh-low-ovarian-reserve | 16505 B | 6570 B | 5 | 2 | 0 B | 5 | 0 | 无 |
| /zh-hant/articles/documents-before-first-visit | 14325 B | 5217 B | 5 | 2 | 0 B | 5 | 0 | 无 |
| /zh-hant/articles/entry-policy-change-what-to-check | 16941 B | 6748 B | 5 | 2 | 0 B | 5 | 0 | 无 |
| /zh-hant/articles/flights-to-saipan-routes | 16551 B | 6609 B | 5 | 2 | 0 B | 5 | 0 | 无 |
| /zh-hant/articles/how-to-read-success-statistics | 15191 B | 5731 B | 5 | 2 | 0 B | 5 | 0 | 无 |
| /zh-hant/articles | 22407 B | 7268 B | 5 | 2 | 0 B | 5 | 0 | 无 |
| /zh-hant/articles/ivf-abroad-decision-checklist | 14810 B | 5591 B | 5 | 2 | 0 B | 5 | 0 | 无 |
| /zh-hant/articles/lab-own-or-outsourced | 15264 B | 5750 B | 5 | 2 | 0 B | 5 | 0 | 无 |
| /zh-hant/articles/price-ranges-and-addon-items | 16591 B | 6451 B | 5 | 2 | 0 B | 5 | 0 | 无 |
| /zh-hant/articles/saipan-vs-us-mainland | 16893 B | 6717 B | 5 | 2 | 0 B | 5 | 0 | 无 |
| /zh-hant/articles/stay-itinerary-planning | 14702 B | 5542 B | 5 | 2 | 0 B | 5 | 0 | 无 |
| /zh-hant/articles/translation-and-support-arrangements | 14499 B | 5342 B | 5 | 2 | 0 B | 5 | 0 | 无 |
| /zh-hant/articles/us-born-baby-advantages | 16523 B | 6617 B | 5 | 2 | 0 B | 5 | 0 | 无 |
| /zh-hant/cities/taipei | 22412 B | 7017 B | 6 | 2 | 0 B | 6 | 1 | 无 |
| /zh-hant/contact-success | 6708 B | 2804 B | 4 | 2 | 0 B | 3 | 0 | 无 |
| /zh-hant/entry-path | 22438 B | 6958 B | 6 | 2 | 0 B | 6 | 1 | 无 |
| /zh-hant/faq | 13664 B | 4881 B | 5 | 2 | 0 B | 5 | 0 | 无 |
| /zh-hant | 26813 B | 9324 B | 18 | 2 | 0 B | 8 | 13 | 无 |
| /zh-hant/legal/privacy-and-data-protection | 13438 B | 4814 B | 5 | 2 | 0 B | 5 | 0 | 无 |
| /zh-hant/pricing | 22588 B | 6968 B | 6 | 2 | 0 B | 6 | 1 | 无 |
| /zh-hant/programs/ivf-icsi | 22528 B | 6822 B | 6 | 2 | 0 B | 6 | 1 | 无 |
| /zh-hant/tools | 14863 B | 5168 B | 5 | 2 | 0 B | 7 | 0 | 无 |
| /zh-hant/why-saipan | 23906 B | 7481 B | 6 | 2 | 0 B | 6 | 1 | 无 |

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
| /_astro/_slug_.BiqyE-1M.css | 17874 B |
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

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
| /en/contact-success | 7934 B | 2837 B | 5 | 3 | 0 B | 4 | 0 | 无 |
| /en/entry-path | 23761 B | 6598 B | 7 | 3 | 0 B | 7 | 1 | 无 |
| /en | 31859 B | 9062 B | 19 | 3 | 0 B | 9 | 13 | 无 |
| /en/pricing | 22724 B | 7172 B | 11 | 3 | 0 B | 7 | 5 | 无 |
| /en/programs/ivf-icsi | 23915 B | 6612 B | 7 | 3 | 0 B | 7 | 1 | 无 |
| /en/tools | 15731 B | 4890 B | 6 | 3 | 0 B | 8 | 0 | 无 |
| /en/why-saipan | 20141 B | 6395 B | 12 | 3 | 0 B | 6 | 6 | 无 |
| / | 31638 B | 9919 B | 18 | 2 | 0 B | 8 | 13 | 无 |
| /zh-hans/articles/amh-low-ovarian-reserve | 18160 B | 6951 B | 6 | 3 | 0 B | 6 | 0 | 无 |
| /zh-hans/articles/documents-before-first-visit | 15839 B | 5533 B | 6 | 3 | 0 B | 6 | 0 | 无 |
| /zh-hans/articles/entry-policy-change-what-to-check | 18539 B | 7042 B | 6 | 3 | 0 B | 6 | 0 | 无 |
| /zh-hans/articles/flights-to-saipan-routes | 18032 B | 6854 B | 6 | 3 | 0 B | 6 | 0 | 无 |
| /zh-hans/articles/how-to-read-success-statistics | 16717 B | 6047 B | 6 | 3 | 0 B | 6 | 0 | 无 |
| /zh-hans/articles | 23862 B | 7452 B | 6 | 3 | 0 B | 6 | 0 | 无 |
| /zh-hans/articles/ivf-abroad-decision-checklist | 16176 B | 5884 B | 6 | 3 | 0 B | 6 | 0 | 无 |
| /zh-hans/articles/lab-own-or-outsourced | 16838 B | 6089 B | 6 | 3 | 0 B | 6 | 0 | 无 |
| /zh-hans/articles/price-ranges-and-addon-items | 25945 B | 9422 B | 11 | 3 | 0 B | 7 | 5 | 无 |
| /zh-hans/articles/saipan-vs-us-mainland | 24345 B | 9167 B | 12 | 3 | 0 B | 6 | 6 | 无 |
| /zh-hans/articles/stay-itinerary-planning | 16133 B | 5845 B | 6 | 3 | 0 B | 6 | 0 | 无 |
| /zh-hans/articles/translation-and-support-arrangements | 16031 B | 5680 B | 6 | 3 | 0 B | 6 | 0 | 无 |
| /zh-hans/articles/us-born-baby-advantages | 18050 B | 6845 B | 6 | 3 | 0 B | 6 | 0 | 无 |
| /zh-hans/contact-success | 8367 B | 3257 B | 5 | 3 | 0 B | 4 | 0 | 无 |
| /zh-hans/entry-path | 23002 B | 7223 B | 7 | 3 | 0 B | 7 | 1 | 无 |
| /zh-hans | 32310 B | 10158 B | 19 | 3 | 0 B | 9 | 13 | 无 |
| /zh-hans/programs/ivf-icsi | 23086 B | 7096 B | 7 | 3 | 0 B | 7 | 1 | 无 |
| /zh-hans/tools | 16278 B | 5443 B | 6 | 3 | 0 B | 8 | 0 | 无 |
| /zh-hant/articles/amh-low-ovarian-reserve | 18485 B | 6942 B | 6 | 3 | 0 B | 6 | 0 | 无 |
| /zh-hant/articles/documents-before-first-visit | 16325 B | 5610 B | 6 | 3 | 0 B | 6 | 0 | 无 |
| /zh-hant/articles/entry-policy-change-what-to-check | 18921 B | 7135 B | 6 | 3 | 0 B | 6 | 0 | 无 |
| /zh-hant/articles/flights-to-saipan-routes | 18551 B | 7013 B | 6 | 3 | 0 B | 6 | 0 | 无 |
| /zh-hant/articles/how-to-read-success-statistics | 17191 B | 6131 B | 6 | 3 | 0 B | 6 | 0 | 无 |
| /zh-hant/articles | 24348 B | 7514 B | 6 | 3 | 0 B | 6 | 0 | 无 |
| /zh-hant/articles/ivf-abroad-decision-checklist | 16790 B | 5996 B | 6 | 3 | 0 B | 6 | 0 | 无 |
| /zh-hant/articles/lab-own-or-outsourced | 17264 B | 6159 B | 6 | 3 | 0 B | 6 | 0 | 无 |
| /zh-hant/articles/price-ranges-and-addon-items | 18591 B | 6840 B | 6 | 3 | 0 B | 6 | 0 | 无 |
| /zh-hant/articles/saipan-vs-us-mainland | 18893 B | 7047 B | 6 | 3 | 0 B | 6 | 0 | 无 |
| /zh-hant/articles/stay-itinerary-planning | 16702 B | 5944 B | 6 | 3 | 0 B | 6 | 0 | 无 |
| /zh-hant/articles/translation-and-support-arrangements | 16499 B | 5735 B | 6 | 3 | 0 B | 6 | 0 | 无 |
| /zh-hant/articles/us-born-baby-advantages | 18523 B | 6996 B | 6 | 3 | 0 B | 6 | 0 | 无 |
| /zh-hant/cities/taipei | 24404 B | 7381 B | 7 | 3 | 0 B | 7 | 1 | 无 |
| /zh-hant/contact-success | 8787 B | 3343 B | 5 | 3 | 0 B | 4 | 0 | 无 |
| /zh-hant/entry-path | 24430 B | 7335 B | 7 | 3 | 0 B | 7 | 1 | 无 |
| /zh-hant/faq | 15605 B | 5282 B | 6 | 3 | 0 B | 6 | 0 | 无 |
| /zh-hant | 32403 B | 10205 B | 19 | 3 | 0 B | 9 | 13 | 无 |
| /zh-hant/legal/privacy-and-data-protection | 15379 B | 5214 B | 6 | 3 | 0 B | 6 | 0 | 无 |
| /zh-hant/pricing | 23039 B | 7988 B | 11 | 3 | 0 B | 7 | 5 | 无 |
| /zh-hant/programs/ivf-icsi | 24520 B | 7203 B | 7 | 3 | 0 B | 7 | 1 | 无 |
| /zh-hant/tools | 16804 B | 5549 B | 6 | 3 | 0 B | 8 | 0 | 无 |
| /zh-hant/why-saipan | 22042 B | 7832 B | 12 | 3 | 0 B | 6 | 6 | 无 |

### 本地资源体积

| 资源 | 字节 |
|---|---|
| /_astro/american-flag.Bt3XNTC8_Z2sbM74.webp | 301512 B |
| /_astro/quiet-botanical.B46i-_cq_18gRwE.webp | 221470 B |
| /_astro/daily-meals.D5FJZIdz_Z12nSfd.webp | 206272 B |
| /_astro/island-pool.Di-T_Adp_2oNPq9.webp | 151810 B |
| /_astro/family-moment.B_ZoW8J5_Z2wsoQz.webp | 94374 B |
| /_astro/stay-room.DkDJbHG5_ZXOBbK.webp | 91102 B |
| /_astro/saipan-lagoon-aerial.BtGVuRZ5_2bJdJO.webp | 72398 B |
| /_astro/laboratory-care.C3-g2iet_1j3RW0.webp | 72272 B |
| /_astro/stay-room.DkDJbHG5_ZpH9wN.webp | 66430 B |
| /_astro/saipan-lagoon-aerial.BtGVuRZ5_Z25Qp4b.webp | 54486 B |
| /_astro/couple-editorial.CQp1pqN8_16rKHo.webp | 52904 B |
| /_astro/flight-wing.C0W1SxLN_ZRjupH.webp | 48224 B |
| /_astro/flight-wing.C0W1SxLN_E97gT.webp | 48224 B |
| /_astro/saipan-lagoon-aerial.BtGVuRZ5_RXp7S.webp | 43258 B |
| /_astro/couple-editorial.CQp1pqN8_2bCX2d.webp | 34280 B |
| /_astro/care-consultation.BHRctu1B_hbNWI.webp | 33422 B |
| /images/saipan-lagoon-aerial.jpg | 26763 B |
| /_astro/flight-wing.C0W1SxLN_9MR9v.webp | 25082 B |
| /_astro/_slug_.BKg5Jhpx.css | 20635 B |
| /_astro/_slug_.BQxXWklN.css | 19277 B |
| /_astro/_slug_.nQHQYRnD.css | 10944 B |
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

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
| /en/contact-success | 6529 B | 2545 B | 3 | 1 | 0 B | 3 | 0 | 无 |
| /en/entry-path | 22449 B | 6480 B | 5 | 1 | 0 B | 6 | 1 | 无 |
| /en | 23185 B | 6672 B | 5 | 1 | 0 B | 6 | 1 | 无 |
| /en/pricing | 22557 B | 6589 B | 5 | 1 | 0 B | 6 | 1 | 无 |
| /en/programs/ivf-icsi | 22603 B | 6493 B | 5 | 1 | 0 B | 6 | 1 | 无 |
| /en/tools | 14464 B | 4774 B | 4 | 1 | 0 B | 7 | 0 | 无 |
| /en/why-saipan | 22627 B | 6539 B | 5 | 1 | 0 B | 6 | 1 | 无 |
| / | 35492 B | 9425 B | 6 | 2 | 0 B | 4 | 1 | 无 |
| /zh-hans/articles/amh-low-ovarian-reserve | 16045 B | 6537 B | 4 | 1 | 0 B | 5 | 0 | 无 |
| /zh-hans/articles/documents-before-first-visit | 13704 B | 5117 B | 4 | 1 | 0 B | 5 | 0 | 无 |
| /zh-hans/articles/entry-policy-change-what-to-check | 16424 B | 6604 B | 4 | 1 | 0 B | 5 | 0 | 无 |
| /zh-hans/articles/flights-to-saipan-routes | 15897 B | 6409 B | 4 | 1 | 0 B | 5 | 0 | 无 |
| /zh-hans/articles/how-to-read-success-statistics | 14582 B | 5619 B | 4 | 1 | 0 B | 5 | 0 | 无 |
| /zh-hans/articles | 21786 B | 7167 B | 4 | 1 | 0 B | 5 | 0 | 无 |
| /zh-hans/articles/ivf-abroad-decision-checklist | 14061 B | 5447 B | 4 | 1 | 0 B | 5 | 0 | 无 |
| /zh-hans/articles/lab-own-or-outsourced | 14703 B | 5650 B | 4 | 1 | 0 B | 5 | 0 | 无 |
| /zh-hans/articles/price-ranges-and-addon-items | 15828 B | 6286 B | 4 | 1 | 0 B | 5 | 0 | 无 |
| /zh-hans/articles/saipan-vs-us-mainland | 16546 B | 6720 B | 4 | 1 | 0 B | 5 | 0 | 无 |
| /zh-hans/articles/stay-itinerary-planning | 13998 B | 5410 B | 4 | 1 | 0 B | 5 | 0 | 无 |
| /zh-hans/articles/translation-and-support-arrangements | 13896 B | 5246 B | 4 | 1 | 0 B | 5 | 0 | 无 |
| /zh-hans/articles/us-born-baby-advantages | 15915 B | 6416 B | 4 | 1 | 0 B | 5 | 0 | 无 |
| /zh-hans/contact-success | 6155 B | 2692 B | 3 | 1 | 0 B | 3 | 0 | 无 |
| /zh-hans/entry-path | 20866 B | 6802 B | 5 | 1 | 0 B | 6 | 1 | 无 |
| /zh-hans | 21453 B | 6926 B | 5 | 1 | 0 B | 6 | 1 | 无 |
| /zh-hans/programs/ivf-icsi | 20950 B | 6673 B | 5 | 1 | 0 B | 6 | 1 | 无 |
| /zh-hans/tools | 14202 B | 5040 B | 4 | 1 | 0 B | 7 | 0 | 无 |
| /zh-hant/articles/amh-low-ovarian-reserve | 16446 B | 6556 B | 4 | 1 | 0 B | 5 | 0 | 无 |
| /zh-hant/articles/documents-before-first-visit | 14266 B | 5202 B | 4 | 1 | 0 B | 5 | 0 | 无 |
| /zh-hant/articles/entry-policy-change-what-to-check | 16882 B | 6733 B | 4 | 1 | 0 B | 5 | 0 | 无 |
| /zh-hant/articles/flights-to-saipan-routes | 16492 B | 6592 B | 4 | 1 | 0 B | 5 | 0 | 无 |
| /zh-hant/articles/how-to-read-success-statistics | 15132 B | 5716 B | 4 | 1 | 0 B | 5 | 0 | 无 |
| /zh-hant/articles | 22348 B | 7254 B | 4 | 1 | 0 B | 5 | 0 | 无 |
| /zh-hant/articles/ivf-abroad-decision-checklist | 14751 B | 5576 B | 4 | 1 | 0 B | 5 | 0 | 无 |
| /zh-hant/articles/lab-own-or-outsourced | 15205 B | 5734 B | 4 | 1 | 0 B | 5 | 0 | 无 |
| /zh-hant/articles/price-ranges-and-addon-items | 16532 B | 6434 B | 4 | 1 | 0 B | 5 | 0 | 无 |
| /zh-hant/articles/saipan-vs-us-mainland | 16834 B | 6702 B | 4 | 1 | 0 B | 5 | 0 | 无 |
| /zh-hant/articles/stay-itinerary-planning | 14643 B | 5526 B | 4 | 1 | 0 B | 5 | 0 | 无 |
| /zh-hant/articles/translation-and-support-arrangements | 14440 B | 5325 B | 4 | 1 | 0 B | 5 | 0 | 无 |
| /zh-hant/articles/us-born-baby-advantages | 16464 B | 6600 B | 4 | 1 | 0 B | 5 | 0 | 无 |
| /zh-hant/cities/taipei | 22353 B | 7002 B | 5 | 1 | 0 B | 6 | 1 | 无 |
| /zh-hant/contact-success | 6649 B | 2788 B | 3 | 1 | 0 B | 3 | 0 | 无 |
| /zh-hant/entry-path | 22379 B | 6943 B | 5 | 1 | 0 B | 6 | 1 | 无 |
| /zh-hant/faq | 13605 B | 4867 B | 4 | 1 | 0 B | 5 | 0 | 无 |
| /zh-hant | 23308 B | 7073 B | 5 | 1 | 0 B | 6 | 1 | 无 |
| /zh-hant/legal/privacy-and-data-protection | 13379 B | 4798 B | 4 | 1 | 0 B | 5 | 0 | 无 |
| /zh-hant/pricing | 22529 B | 6953 B | 5 | 1 | 0 B | 6 | 1 | 无 |
| /zh-hant/programs/ivf-icsi | 22469 B | 6807 B | 5 | 1 | 0 B | 6 | 1 | 无 |
| /zh-hant/tools | 14804 B | 5152 B | 4 | 1 | 0 B | 7 | 0 | 无 |
| /zh-hant/why-saipan | 23847 B | 7469 B | 5 | 1 | 0 B | 6 | 1 | 无 |

### 本地资源体积

| 资源 | 字节 |
|---|---|
| /images/saipan-lagoon-aerial.jpg | 26763 B |
| /_astro/_slug_.BiqyE-1M.css | 17874 B |
| /_astro/index.DhIhzX5P.css | 9209 B |
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

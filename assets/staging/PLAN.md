# taste-skill 图片暂存与接入计划

状态：**已下载 · 已逐张目检 · 未接入**（等并行会话完成后统一补图）
生成：2026-10-15 · 来源脚本：`.opencode/skills/design-taste-frontend/scripts/assets.mjs`
署名明细：`assets/staging/credits.json`（23 条下载记录，含本计划全部素材）

## 阈值（rules.mjs L111-116）

- `width ≥ 1100` 时：`照片 + 界面碎片 < 4 → FAIL few-pictures`；`照片 < 2 → WARN`；`无视频 → WARN no-footage`
- **SVG 不计入**（站内现有 34 个 SVG 全部不计）；照片、底图扫描、栅格图计
- 现状：首页 1 图（hero）；文章页 0 图；根选择页 1 图

## 接入前置条件

1. 并行会话确认停手（其最后写入 17:10，dist 17:10:44 为其构建）
2. 只动：`public/images/`（新增）、LandingLayout/ContentLayout/文章 MDX 的插图位、页脚来源区
3. 图片规格：section 配图 1280w / hero 640w 惯例，mozjpeg q72 progressive（对齐既有 hero）
   可用 `npx tsx` + sharp（node_modules 里随 astro 附带）预压缩后再入 `public/images/`
4. 验收：lint 0/0 → inspect 三模板 few-pictures 清零 → 全 CI 链串行

## 署名（license 硬约束）

**CC BY / BY-SA 必须署名**（8 张，见 credits.json `creditRequired: true`）；PD/CC0 建议仍署名。
呈现方式待拍板：A. 图下小字题注（figcaption，与并行会话「删图注」决定冲突，需协调）
B. 页脚/独立「图片来源」区块集中列出（推荐：不破坏版面，一处维护）

必署名清单（接入时逐条对应）：

| 文件 | credit |
|---|---|
| forbidden-island-lookout-….jpg | "Forbidden Island Lookout…" by Gage Skidmore, CC BY-SA 4.0, via Wikimedia Commons |
| managahaisland.jpg | "ManagahaIsland" by Buffaboy, CC BY-SA 4.0, via Wikimedia Commons |
| managaha-island.jpg | "Mañagaha Island" by Gage Skidmore, CC BY-SA 4.0, via Wikimedia Commons |
| saipan-international-airport-31037379131.jpg | "Saipan International airport (31037379131)" by Edward Russell, CC BY 2.0, via Wikimedia Commons |
| saipan-beach-23745790.jpg | "Saipan beach (23745790)" by Matt Watts, CC BY-SA 2.0, via Wikimedia Commons |
| micro-beach-530316786.jpg | "Micro Beach (530316786)" by tata_aka_T, CC BY 2.0, via Wikimedia Commons |
| microscope-laboratory-fortepan-61695.jpg | "Microscope, laboratory Fortepan 61695" (Donor: Lipovits Károly), CC BY-SA 3.0, via Wikimedia Commons |
| scanningmicroscopejlm.jpg | "ScanningMicroscopeJLM" by Etan J. Tal, CC BY 3.0, via Wikimedia Commons |

BY-SA 注意：只能**原样**使用（可等比缩放/转格式），不得裁切调色；改图须同许可共享。

## 各页配图映射（建议）

### 首页 zh-hant / zh-hans / en（目标 ≥4）

1. hero（已有）：`saipan-lagoon-aerial.jpg`
2. 段落配图（why-saipan 类）：`saipan.jpg` 塞班全岛航拍（PD）
3. 全宽 band：`managahaisland.jpg` Managaha 16:9 海滩（CC BY-SA 4.0）
4. 收尾 band：`saipan-sunset-2.jpg` 日落（PD）／备选 `forbidden-island-lookout….jpg` 海岬

### 根选择页 /（目标 ≥4）

维持极简主体 + 底部三图 strip：`forbidden-island-lookout` + `managaha-island` + `polynesia….jpg` 古地图

### 文章页（每篇 4 张：头图 + 2 正文配图 + 1 band；跨文章可复用）

按语义分组：

- **航班/交通类**（flights 等）：`entrance-to-saipan-international-airport.jpg`（路牌+凤凰木，PD）、`saipan-international-airport-31037379131.jpg`（航站楼条幅）、`saipan.jpg` 航拍、`polynesia….jpg` 地图
- **住宿/行程类**（stay 等）：`micro-beach`、`saipan-beach-23745790`、`managaha-island`、`forbidden-island-lookout`
- **入境/材料类**（documents、entry-policy 等）：`polynesia….jpg` 古地图（含 Marianas 插图）、`les-isles-philippines.jpg`（1780 地图，关岛/Mariana 边栏）、`entrance-…airport`、`saipan-sunset-2`
- **实验室类**（lab-own-or-outsourced 等）：`journal-of-applied-microscopy….jpg`（1901 显微摄影装置版画，奶黄纸面）、`laboratories-their-planning….jpg`（1921 工作台图纸）、`petri-dish-nih-bioart-404.png`（PD 培养皿）、备选 `scanningmicroscopejlm` / `microscope-laboratory-fortepan-61695`
- **纯医学向文**（amh、statistics、us-born-baby 等）：版画/器物类为主（journal-1901、petri）＋ 1 张岛景 band；**不配会误读为「本院设备/团队」的实拍**
- **文章 hub**：岛景四图（saipan 航拍、forbidden、managaha、sunset）

## 已否决（`_rejected/`，含理由）

红灯笼特写（非岛景）、Dandan 路边快照、Garapan 阴天街景、Saipan-Tinian 雾霭俯瞰、
孵化器快照（品牌标签杂乱）、粉底试管摆拍（stock 感）、NIAID 组织标本（观感不适）、彩色试管 stock（廉价感）

## 视频（no-footage，WARN 级）

未找到合适素材。医疗语境慎用库存视频；建议先豁免，后续有院方实拍再补。

## 待拍板

1. 署名呈现：题注 vs 集中来源页（CC BY 硬约束必须署名）
2. 实验室文章走「版画/档案路线」（推荐，已下载）还是继续找现代实拍
3. 视频补不补（WARN 级，可豁免）
4. 接入时机：并行会话完成后

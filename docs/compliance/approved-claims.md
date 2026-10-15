# 已批准可发布声明清单（Approved Claims）

- 状态：**EMPTY / BLOCKED**
- 关联文件：`docs/compliance/fact-register.csv`（事实来源登记）、`docs/compliance/prohibited-claims.md`（禁用话术）、`docs/content/review-matrix.csv`（审核矩阵）
- 对应开发文档章节：0.1（不得编造事实）、4.9（数据透明）、12（上线前检查清单）

## 列入条件（三条同时满足才可写入本文件）

1. 该声明在 `docs/compliance/fact-register.csv` 中有对应 `fact_id`，且 `obtained=yes`、`source_name`/`source_url` 已回填官方或院方来源；
2. 有院方或法律顾问的**书面确认**（邮件、签署文件或批准版本文件），并已登记 `verified_by` 角色与 `verified_at` 日期；
3. 声明文本与来源逐字对应，未加入推论、比较级、承诺性语气或未经证实的因果表述；五语版本在同一 PR 内提交。

**任何条目须由院方书面确认并附来源后方可列入。本文件当前不包含任何可发布声明。**
在满足上述条件之前，页面模板对应事实槽位必须渲染为待审核状态（或直接隐藏），不得以常识、行业均值或"视情况而定"填充。

## 表格

| claim_id | fact_id | 批准声明原文 | 允许出现的语言 | 允许出现的位置 | 来源与取得方式 | 批准角色 | 批准日期 | 到期复核日 | 备注 |
|---|---|---|---|---|---|---|---|---|---|
| _（暂无）_ | _（暂无）_ | _（暂无）_ | _（暂无）_ | _（暂无）_ | _（暂无）_ | _（暂无）_ | _（暂无）_ | _（暂无）_ | 待院方与法律顾问书面材料 |

## 待列入的高优先级候选（当前一律不可发布）

以下条目仅是**待收集清单**，不构成任何声明：

| 候选主题 | 对应 fact_id | 需要的证据 | 当前状态 |
|---|---|---|---|
| 机构法定名称与地址、电话、营业时间 | `inst-legal-entity-name`、`inst-address`、`inst-phone`、`inst-business-hours` | 院方书面提供 | obtained:no / publishable:false |
| 医生真实姓名、执照州别与编号、专科认证、照片授权 | `doc-real-name`、`doc-license-state`、`doc-license-number`、`doc-board-certification`、`doc-photo-license` | 可核验执照文件 + 授权 | obtained:no / publishable:false |
| 实验室自建或外包、PGT 执行方与资质编号、冷链责任方 | `lab-location-model`、`pgt-performer-credential`、`cold-chain-responsibility` | 院方与实验室书面说明 | obtained:no / publishable:false |
| 九类方案的适应证/禁忌/流程/停留/风险/费用区间 | `prog-*-clinical`、`prog-*-stay`、`price-program-ranges` | 院方可公开医疗内容 | obtained:no / publishable:false |
| 成功率与数据透明数字 | `data-*` 全部条目 | 原始数据 + 定义/分母/年龄层/样本量/年份/纳入排除 | obtained:no / publishable:false |
| 取消、改期与退款政策 | `price-cancellation-refund` | 院方书面政策 | obtained:no / publishable:false |
| 各护照类别入境许可、停留天数、电子授权、票据与中转约束 | `entry-passport-*`、`entry-ticket-requirements`、`entry-transit-constraints` | 官方来源 + 法律顾问书面核对 | obtained:no / publishable:false |
| 航线、航班号与实际飞行时长 | `flight-*`、`flight-schedule-window` | 时刻表来源 + 核对日期 | obtained:no / publishable:false |
| 客服账号、值班表与响应时限 | `channel-*` | 账号与人力确认 | obtained:no / publishable:false |
| 第三方辅助生殖、亲权与出生登记、出生公民权口径 | `legal-surrogacy-rules`、`legal-parenthood-birth`、`legal-birth-citizenship-scope` | 法律顾问书面批准 | obtained:no / publishable:false |
| 患者故事与影像使用 | `story-written-consent`、`asset-story-media` | 逐案书面授权 | obtained:no / publishable:false |

## 撤销与过期

- 任一声明的 `到期复核日` 逾期后，本文件条目立即视为失效：页面须隐藏该结论或改回待审核状态。
- 政策、航线、价格、执照类条目的复核周期见 `docs/operations/entry-policy-review.md` 与 `docs/operations/raci.md`。
- 撤销声明时必须同步：更新 `fact-register.csv`、`review-matrix.csv`、页面 `status`，并检查是否已有外链（禁止静默删除有外链页面）。

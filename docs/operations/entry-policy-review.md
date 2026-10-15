# 入境政策月度复核流程（Entry Policy Review）

- 状态：**骨架（责任人待指派，复核周期与告警实现待代码阶段落地）**
- 依据：开发文档 5.1（`data/entry-policy.json` schema、构建校验、月度复核）、4.4（入境路径页）、4.3（城市页只读数据）、8.1 第 6 项、13.7（内容过期告警）、12（上线前检查清单）、P0 第 12 项（建立月度复核责任人）
- 关联事实：`fact-register.csv` 中 `entry-passport-*`、`entry-electronic-authorization`、`entry-ticket-requirements`、`entry-us-mainland-access`、`entry-transit-constraints`、`entry-alternative-programs`、`entry-official-sources`、`entry-review-cycle`

## 1. 原则

1. **入境结论只有一个数据源**：`data/entry-policy.json`。入境路径页、城市页、Why Saipan 对比表、法律页与 FAQ 均只读取该文件，模板与 MDX 中不得重复写停留天数、授权类别、票据要求。
2. **未 verified 不渲染**：`status != "verified"` 或 `last_verified` 过期时，构建层必须**隐藏对应结论单元格**或阻止该页发布，不得以"视情况而定""请咨询专业人士"填充（文档 4.4、禁用清单第 8 项）。
3. **每条记录可追溯**：必须有官方来源（`official_source`）与审核人（`review_owner`），并由法律顾问书面确认。
4. 政策属时间敏感事实（文档 13.10），不把建站方案中的法律事实当永久常量。

## 2. 记录级字段与状态

| 字段 | 说明 | 约束 |
|---|---|---|
| `id` | 记录标识 | 唯一 |
| `nationality` | 国籍/护照类别（由法律审核确定名称） | 与 `page-manifest.csv` 中城市页/入境页引用的类别一致 |
| `entry_program` | 许可/计划类型（枚举值原样使用，不译写内容） | 术语表 `G-CNMI VWP` 等条目 |
| `maximum_stay_days` | 最长停留天数 | 未 verified 时必须为 `null` 且不渲染 |
| `authorization` | 需要的电子授权（如 ETA） | 附官方申请页来源 |
| `ticket_requirement` | 往返票/可退票/可改票/确认离境日期 | 拆为对象，不得丢细节；未知项 `null` 并隐藏 |
| `mainland_us_access` | 是否允许前往美国本土 | 布尔；未 verified 不渲染 |
| `transit_constraints` | 中转约束 | 数组；空数组与"未核对"须区分（未核对时 `status=pending`） |
| `alternative_programs` | 可选其他入境计划 | 数组 |
| `official_source` | 官方来源列表（URL + 页面标题） | 至少 1 条，禁止用第三方转述 |
| `last_verified` | 最后核对日期 | 由复核人填写 |
| `status` | `pending` \| `verified` \| `expired` \| `blocked` | 只有 `verified` 且未过期可被生产页引用 |
| `review_owner` | 复核责任人（角色 + 人名） | 不得为空才允许 `verified` |

## 3. 复核周期

| 对象 | 周期 | 责任人（角色） | 待指派人名 |
|---|---|---|---|
| 入境路径页引用的所有 entry 记录 | 每月 1 次（固定工作日） | 法律顾问（A）+ 内容负责人（R 执行） | 留空 |
| 中转约束 / 能否赴美国本土 | 每月 1 次，随 entry 一并核对 | 法律顾问 | 留空 |
| 航线与飞行时长（`flight-routes.json`） | 每月 1 次 + 航司时刻表换季时额外核对 | 内容负责人 | 留空 |
| 价格与取消退款政策 | 每季度 + 变更即时 | 院方审核人 | 留空 |
| 医生执照与资质编号 | 每季度 | 院方审核人 | 留空 |
| 营业时间与客服值班表 | 每季度 + 变更即时 | 客服负责人 | 留空 |
| 出生公民权/亲权等法律结论 | 每季度 + 法规变动即时 | 法律顾问 | 留空 |

## 4. 月度复核步骤

1. 取 `data/entry-policy.json` 全部记录，按 `official_source` 打开官方页面（不使用缓存截图作依据）。
2. 逐字段比对：许可类型、最长停留、电子授权、票据要求、地域范围、中转约束、可选计划。
3. 记录差异：在 `docs/handoff/STATUS.md` 与本次复核日志中写明"字段 / 旧值 / 新值 / 官方来源 / 发现日期"。
4. 有差异时：
   - 立即把该记录 `status` 改为 `pending` 或 `expired`（构建层据此隐藏结论单元格）；
   - 通知内容负责人与法律顾问；受影响页面（入境路径页、对应城市页、法律页、FAQ）标记待审，同一事实的五语版本在**同一个 PR** 内修改；
   - 法律顾问书面确认后写回新值、`last_verified`、`review_owner`，`status=verified`。
5. 无差异时：更新 `last_verified` 为本次核对日期（不得凭记忆续期）。
6. 输出：`docs/compliance/approved-claims.md` 的条目复核日同步更新；若字段失效，从可发布声明中移除。

## 5. 触发告警条件

需在 CI/构建脚本（`scripts/validate-entry-policy.ts`）与运营监控中实现，命中即告警并阻止发布：

- `today - last_verified > 31 天`（复核逾期）；
- `status != "verified"` 但被 `published` 页面引用；
- `expires_at` / 记录内 `valid_until`（若有）早于今天；
- `official_source` 为空或指向非官方域；
- 关键字段为 `null` 却在模板中被渲染（例如停留天数字段缺失仍输出表格行）；
- `mainland_us_access` 为 `null` 但页面出现"可前往美国本土"或"不可前往"的任一结论；
- 同一 `nationality` 存在多条互相冲突的 verified 记录（违反五语共享字段一致，文档 8.1 第 7 项）；
- 官方来源页面 404/重定向异常（视为需立即人工确认）。

告警去向：内容负责人 + 法律顾问 + 项目负责人（渠道与值班表见 RACI 第 18/24 行）。

## 6. 过期后的自动降级行为（构建层要求）

1. 记录 `status` 不是 `verified`，或 `last_verified` 超过 31 天：
   - 对应结论单元格**不渲染**（隐藏整格并保留表格结构），不是显示"待确认"文字给终端用户；
   - 若该页因此缺少必需章节（`required_sections` 中的 `maximum-stay-days`、`ticket-and-departure-proof` 等），页面 `status` 自动降为 `blocked`，不进入 sitemap，生产构建失败或跳过该页（由代码阶段确定实现方式，须在 ADR/handoff 记录）。
2. 若政策变更影响页面主旨（例如某护照类别整体不适用），该语言页面退回 `draft`，且城市页只保留不含政策结论的模块。
3. 已发布页的降级必须有可执行动作：更新 → 隐藏 → （必要时）301 到替代页；禁止静默删除有外链页面（文档 3.2 `retired` 规则）。

## 7. 复核日志模板（每月复制一份）

```md
## 入境政策复核 YYYY-MM-DD
- 复核人（角色/人名）：
- 批准人（法律顾问）：
- 覆盖记录 id：
- 使用的官方来源（URL + 访问时间）：
- 差异清单：字段 / 旧值 / 新值 / 影响页面 / 影响语言 / PR 链接
- 未决问题（保持 pending 的字段）：
- 下次复核日期：
```

## 8. 当前阻塞

- `entry-passport-*` 全部 obtained:no，`entry-review-cycle` 未指派 → 入境路径页、6 个城市页、`legal_entry_and_stay_requirements` 在 `page-manifest.csv` 中为 `blocked`。
- 复核脚本与告警通道尚未实现（由负责代码的同事在 P2 落地）；本文件只定义流程与验收条件。

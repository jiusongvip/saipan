# 旧域名迁移说明（redirect-map 使用规范）

- 状态：**BLOCKED（待旧域 URL 清单导出）**
- 关联事实：`docs/compliance/fact-register.csv` 的 `redirect-old-domain-list`、`redirect-sivf-asia-disposal`、`inst-primary-domain-control`
- 数据文件：`docs/seo/redirect-map.csv`（当前仅表头，无数据行）

## 1. 为什么 `redirect-map.csv` 现在是空的

`docs/seo/redirect-map.csv` 只承载可核验的逐条映射，不放说明文字（CSV 中写注释行会破坏解析与后续脚本读取）。
旧域 `saipan-ivf.com` 的约 10 个 URL 需要从其后台或站点地图导出后才能填写，本项目**不得凭记忆或推测编造旧 URL**。
在清单导出并确认可访问之前，本文件所有数据列保持为空。

导出后按下列列填写：

| 列 | 填写规则 |
|---|---|
| `old_url` | 旧域完整路径，含尾斜杠与否照旧域实际形态逐条记录，不做归一化猜测 |
| `new_url` | 必须是 `content/page-manifest.csv` 中已存在的**同语言**路径（无尾斜杠，根路径除外） |
| `redirect_type` | 默认 `301`；仅当页面被判定退役且无匹配替代页时才允许 `410`，须在 `notes` 记录判定人与日期 |
| `old_assets_action` | `keep_path` / `map` / `drop` 三值之一；`map` 时须在 `notes` 写新路径 |
| `verified` | 只有对生产环境实测过状态码后才填 `yes`，未测一律留空或填 `no` |
| `notes` | 记录匹配理由、实测状态码、语言归属、审核人角色（不写个人姓名） |

## 2. 映射原则

1. **逐页 301 到最匹配页面**：按主题与意图匹配到同语言、同意图组的新页，而不是按 URL 字面相似。
2. **禁止全站跳首页**：不得把多个旧页面统一指向 `/{lang}`。首页兜底会稀释相关性与转化路径，属于文档 7.3 明确禁止项。
3. **语言必须一致**：旧域页面的语言无法判断时，该条目标为待确认，不得凭域名或路径猜测语言后落到错误语言目录。
4. **旧图路径保留策略**：
   - 能保留原路径的旧图片/文件优先 `old_assets_action=keep_path`，即在 `public/` 下按旧路径同名放置，避免外链与站内引用失效；
   - 无法保留时填 `map`，并建立明确的一对一映射；
   - 确认无引用且无外链时才允许 `drop`，须记录检查依据（GSC 抓取/外链数据）。
   - 未确认前**不得删除任何有外链的图片路径**。
5. **新站对外只使用唯一主域** `saipanivf.org`：站内链接、canonical、结构化数据、sitemap、邮箱一律同域，且 URL 无尾斜杠（根路径除外）。

## 3. `sivf-asia.com`

归属与处置方案未确认前（`redirect-sivf-asia-disposal` = obtained:no），该域**零引用**：

- 不出现在站内链接、导航、页脚；
- 不出现在邮箱地址或客服渠道；
- 不出现在 Organization / MedicalOrganization 结构化数据；
- 不出现在 `data/site-config.json`、环境变量或任何公开配置；
- 不写入 `redirect-map.csv` 的 `old_url` 或 `new_url`，除非取得书面处置决策。

## 4. 上线前与上线后的检查

检查链式跳转、循环跳转与 404：

- **链式跳转**（A→B→C）：每条映射的目标必须是最终页面，中间跳板一律消除。
- **循环跳转**（A→B→A）：脚本按 `old_url → new_url` 构图检测环。
- **404**：`new_url` 必须存在于 `page-manifest.csv` 且状态允许发布；`draft`/`review` 页不作为 301 目标上线。
- **目标未发布**：若映射目标页仍在审核中，则该条 `verified` 不得填 `yes`，并在 `notes` 标注等待。
- 迁移后在 GSC 监测索引覆盖、404 报告、抓取重定向与自然搜索变化，按文档 7.3 与 12 的清单执行。

## 5. 阻塞项与解锁条件

1. 确认 `saipan-ivf.com` 后台可访问并可导出 URL 清单（含图片资源清单）。
2. 取得 `saipan-ivf.com` DNS/托管变更权限，以及新域 `saipanivf.org` 的 DNS、SSL、托管与验证权限。
3. 项目负责人书面确认 `sivf-asia.com` 处置决策。
4. 新站页面路径冻结（本清单已由 `content/page-manifest.csv` 冻结），301 目标才可最终填写。
5. 逐条实测状态码后才填 `verified=yes`；未实测条目不得进入上线检查清单的勾选状态。

import { checkPageRules, checkPageStructure } from '../src/lib/page-rules';
import { loadManifest, loadRawPages, finish, createReport, type Report } from './lib/pages';

/**
 * 内容 schema 与必填章节校验 + 页面清单交叉核对（开发文档 8.1 第 3、4 项）。
 * 清单 content/page-manifest.csv 是唯一页面台账：MDX 与清单不一致时报错，不允许两边各说一套。
 */

const report: Report = createReport();
const pages = loadRawPages();
const manifest = loadManifest();

const manifestIndex = new Map<string, (typeof manifest)[number]>();
for (const row of manifest) {
  const key = `${row.lang}:${row.translation_key}`;
  if (manifestIndex.has(key)) report.errors.push(`manifest 重复条目：${key}`);
  manifestIndex.set(key, row);
}

const seenPath = new Map<string, string>();
const seenGroup = new Map<string, string>();

for (const page of pages) {
  const { data, file } = page;
  const label = `${file}`;
  for (const issue of [...checkPageStructure(data), ...checkPageRules(data)]) {
    const line = `${label} [${issue.field}] ${issue.message}`;
    if (issue.level === 'error') report.errors.push(line);
    else report.warnings.push(line);
  }

  const path = String(data.path ?? '');
  const key = `${data.lang}:${data.translation_key}`;
  if (seenPath.has(path)) report.errors.push(`${label} 路径重复：${path} 已被 ${seenPath.get(path)} 使用`);
  else seenPath.set(path, label);
  if (seenGroup.has(key)) report.errors.push(`${label} 翻译组重复：${key}`);
  else seenGroup.set(key, label);

  const row = manifestIndex.get(key);
  if (!row) {
    report.errors.push(`${label} 不在页面清单中（translation_key=${data.translation_key}, lang=${data.lang}），须先入清单`);
    continue;
  }
  if (row.path !== path) report.errors.push(`${label} 路径与清单不一致：MDX=${path} 清单=${row.path}`);
  if (row.template !== data.template) {
    report.errors.push(`${label} 模板与清单不一致：MDX=${String(data.template)} 清单=${row.template}`);
  }
  if (row.primary_cta && row.primary_cta !== data.primary_cta) {
    report.errors.push(`${label} 主 CTA 与清单不一致：MDX=${String(data.primary_cta)} 清单=${row.primary_cta}`);
  }
  const manifestSecondary = row.secondary_cta || 'null';
  const mdxSecondary = data.secondary_cta === null || data.secondary_cta === undefined ? 'null' : String(data.secondary_cta);
  if (manifestSecondary !== mdxSecondary) {
    report.warnings.push(`${label} 次级 CTA 与清单不一致：MDX=${mdxSecondary} 清单=${manifestSecondary}`);
  }

  // 清单标注 blocked 表示事实未取得：这类页不得进入 approved/published。
  if (row.status === 'blocked' && ['approved', 'published'].includes(String(data.status))) {
    report.errors.push(`${label} 清单状态为 blocked，MDX 不得为 ${String(data.status)}`);
  }
  if (data.status === 'published' && row.status !== 'approved' && row.status !== 'published') {
    report.errors.push(`${label} MDX 已 published，但清单审核状态仍是 ${row.status || '(空)'}`);
  }
  // 五语同一事实的必填要素必须一致（4.7 的六问）。
  if (data.template === 'program') {
    const sections = Array.isArray(data.required_sections) ? data.required_sections.join(';') : '';
    if (sections !== row.required_sections) {
      report.warnings.push(`${label} 方案页必填要素与清单不同：MDX=${sections || '(空)'} 清单=${row.required_sections}`);
    }
  }
}

// 清单里存在、但仓库还没有文件的页：属于待办而不是错误，输出统计供交接使用。
const built = new Set(pages.map((page) => `${page.data.lang}:${page.data.translation_key}`));
const missing = manifest.filter((row) => !built.has(`${row.lang}:${row.translation_key}`));
const blockedMissing = missing.filter((row) => row.status === 'blocked');

console.log(
  `页面清单 ${manifest.length} 行；仓库内 MDX ${pages.length} 个；未建页 ${missing.length}（其中清单标 blocked ${blockedMissing.length}）`,
);

finish(report, 'validate-content');

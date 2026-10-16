import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createReport, finish, type Report } from './lib/pages';

/**
 * 四类人工复核的脚本断言（优化方案 v3 第 1 批第 8 项）。
 * 以 dist/ 的实际渲染为准，防止批量开工后手工复核回退：
 *  ① 外壳标记计数与断言（pending-slot、横幅）——非预览构建（生产、演示）一律必须为 0；
 *  ②「指向未渲染内容的文案」DOM 扫描（占位文案在任何构建形态下都不得出现）；
 *  ③ 科普/案例入口与卡片列表同源可见性（入口存在即必须 ≥1 条可见内容）；
 *  ④ 向导建议链接落点（SSR 注入的 data-wizard-data 里每个 href 都必须是本次构建真实渲染的页）。
 * 与 check-links.ts（内链落点完整性）互补：本脚本关注"文案与入口承诺"而非 href 本身。
 */

const dist = join(process.cwd(), 'dist');
const report: Report = createReport();
const isDemo = process.env.REVIEW === '0';
/** 预览构建是唯一允许外壳现身的形态：草稿入构建 + 复核横幅开启。 */
const isPreview = process.env.INCLUDE_DRAFTS === '1' && !isDemo;

if (!existsSync(dist)) {
  report.errors.push('dist/ 不存在，请先执行构建再运行 guardrails');
  finish(report, 'guardrails');
} else {
  const htmlFiles = (function walk(dir: string): string[] {
    const out: string[] = [];
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) out.push(...walk(full));
      else if (name.endsWith('.html')) out.push(full);
    }
    return out;
  })(dist);

  const pageFor = (rel: string) => rel.replace(/\\/g, '/');

  /** 已渲染页面路径集合（/、/zh-hant/、/zh-hant/tools/ 与无尾斜杠变体） */
  const rendered = new Set<string>();
  const relOf = (abs: string) => pageFor(relative(dist, abs));
  for (const file of htmlFiles) {
    const path = '/' + relOf(file).replace(/index\.html$/, '');
    rendered.add(path);
    rendered.add(path.replace(/\/$/, ''));
    rendered.add(path.replace(/\/$/, '') + '/');
  }
  const isRendered = (target: string) => {
    const clean = target.split('#')[0].split('?')[0];
    return rendered.has(clean) || rendered.has(clean.replace(/\/$/, '')) || rendered.has(clean.replace(/\/$/, '') + '/');
  };

  // ── 检查 ①：pending-slot 与横幅计数 ──────────────────────────────
  // 仅禁止审核横幅；生产环境的 banner--info 是表单不可用提示，不应阻止发布。
  let pendingCount = 0;
  let bannerCount = 0;
  const pendingFiles: string[] = [];
  const bannerFiles: string[] = [];
  for (const file of htmlFiles) {
    const html = readFileSync(file, 'utf8');
    const rel = relOf(file);
    const p = (html.match(/class="[^"]*\bpending-slot\b[^"]*"/g) ?? []).length;
    const b = (html.match(/class="[^"]*"/g) ?? []).filter((attr) => {
      const classes = attr.slice(7, -1).split(/\\s+/);
      return classes.includes('banner') && !classes.includes('banner--info');
    }).length;
    if (p > 0) {
      pendingCount += p;
      pendingFiles.push(`${rel}×${p}`);
    }
    if (b > 0) {
      bannerCount += b;
      bannerFiles.push(`${rel}×${b}`);
    }
  }
  report.warnings.push(
    `① pending-slot 合计 ${pendingCount}、横幅合计 ${bannerCount}（共 ${htmlFiles.length} 页${
      isDemo ? '，演示构建' : isPreview ? '，预览构建' : '，生产构建'
    }）`,
  );
  if (!isPreview) {
    if (pendingCount > 0) report.errors.push(`非预览构建不得含 pending-slot：${pendingFiles.join('、')}`);
    if (bannerCount > 0) report.errors.push(`非预览构建不得含横幅：${bannerFiles.join('、')}`);
  }

  // ── 检查 ②：「指向未渲染内容的文案」DOM 扫描 ─────────────────────
  const PLACEHOLDER_PATTERNS = [
    '敬请期待',
    '即将上线',
    '即将开放',
    'Coming soon',
    'coming soon',
    'Comming soon',
    'TBD',
    '占位符',
    'placeholder content',
    '内容待补充',
    '此处将展示',
  ];
  const placeholderHits: string[] = [];
  for (const file of htmlFiles) {
    const html = readFileSync(file, 'utf8');
    const rel = relOf(file);
    for (const pattern of PLACEHOLDER_PATTERNS) {
      if (html.includes(pattern)) placeholderHits.push(`${rel}:「${pattern}」`);
    }
  }
  if (placeholderHits.length > 0) {
    report.errors.push(`② 占位文案命中 ${placeholderHits.length} 处：${placeholderHits.join('、')}`);
  } else {
    report.warnings.push('② 占位文案扫描 0 命中');
  }

  // ── 检查 ③：科普/案例入口与卡片列表同源可见性 ────────────────────
  const ENTRY_MARKERS: { id: string; pattern: RegExp }[] = [
    { id: 'articles', pattern: /href="([^"]*\/articles[^"]*)"/g },
    { id: 'patient-story', pattern: /href="([^"]*\/patient-story[^"]*)"/g },
  ];
  const entryViolations: string[] = [];
  for (const file of htmlFiles) {
    const html = readFileSync(file, 'utf8');
    const rel = relOf(file);
    for (const marker of ENTRY_MARKERS) {
      const suffix = marker.id === 'articles' ? '/articles' : '/patient-story';
      const listEntry = Array.from(html.matchAll(marker.pattern))
        .map((m) => m[1])
        .filter((href) => !/^[a-z]+:/i.test(href)) // 跳过绝对 URL（canonical/og:url）
        .find((href) => href.replace(/\/$/, '').endsWith(suffix)); // 只认列表页入口，详情页自身链接不算
      if (!listEntry) continue; // 本页无列表页入口（无入口即无承诺，同源自洽）
      const target = listEntry.split('#')[0].split('?')[0];
      if (!isRendered(target)) {
        entryViolations.push(`${rel}: ${marker.id} 列表入口指向未渲染页 ${target}`);
        continue;
      }
      // 列表页必须至少渲染 1 条子内容（卡片/条目链接）
      const targetFile = join(dist, target.replace(/^\//, ''), 'index.html');
      if (!existsSync(targetFile)) continue;
      const listHtml = readFileSync(targetFile, 'utf8');
      const prefix = target.replace(/\/$/, '');
      const childLinks = new Set(
        Array.from(listHtml.matchAll(new RegExp(`href="(${prefix}/[^"#?]+)"`, 'g')))
          .map((m) => m[1])
          .filter((href) => href !== target && href !== `${target}/`),
      );
      if (childLinks.size === 0) {
        entryViolations.push(`${rel}: ${marker.id} 列表入口存在但列表页 ${target} 无任何子内容`);
      }
    }
  }
  if (entryViolations.length > 0) {
    report.errors.push(`③ 入口/内容不同源 ${entryViolations.length} 处：${entryViolations.join('、')}`);
  } else {
    report.warnings.push('③ 入口与内容同源检查通过');
  }

  // ── 检查 ④：向导建议链接落点 ──────────────────────────────────────
  // 建议阅读页由 SSR 注入 JSON（不经 JS 拼接），静态扫描可见，因此能断言每个落点都真实渲染。
  const decodeAttr = (raw: string) =>
    raw
      .replace(/&#34;/g, '"')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#x27;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&');
  const wizardViolations: string[] = [];
  let wizardHrefCount = 0;
  for (const file of htmlFiles) {
    const html = readFileSync(file, 'utf8');
    const rel = relOf(file);
    for (const match of html.matchAll(/data-wizard-data="([^"]*)"/g)) {
      let data: Record<string, { pages?: { href?: string }[] }>;
      try {
        data = JSON.parse(decodeAttr(match[1]));
      } catch {
        wizardViolations.push(`${rel}: data-wizard-data 无法解析`);
        continue;
      }
      for (const item of Object.values(data)) {
        for (const page of item?.pages ?? []) {
          if (!page.href) continue;
          wizardHrefCount += 1;
          if (!isRendered(page.href)) wizardViolations.push(`${rel}: 向导建议 ${page.href} 未渲染`);
        }
      }
    }
  }
  if (wizardViolations.length > 0) {
    report.errors.push(`④ 向导建议链接 ${wizardViolations.length} 处异常：${wizardViolations.join('、')}`);
  } else {
    report.warnings.push(`④ 向导建议链接 ${wizardHrefCount} 条全部指向本次构建已渲染页`);
  }

  finish(report, 'guardrails');
}

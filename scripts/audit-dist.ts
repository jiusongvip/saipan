import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join, relative } from 'node:path';
import { createReport, finish, type Report } from './lib/pages';
import { readData } from './lib/data';
import { LANGUAGES } from '../src/lib/page-rules';
import { MAX_LENGTHS, NEVER_COLLECTED, allowedFieldsForLang } from '../src/lib/forms';

/**
 * 构建产物技术审计（开发文档 8.1 第 6/9/10/13 项、P2 任务 10）。
 * 以 dist/ 真实产物为准，输出可保存的报告 docs/testing/audit-report.md：
 *  - 可访问性：语言标注、标题层级、label 绑定、可点击文本、重复 id、焦点可见性、对比度（按 token 实算）
 *  - SEO：title/description 长度与唯一性、canonical、robots、hreflang 自指与对称、OG、sitemap 一致性
 *  - 性能：HTML 原始与 gzip 字节、本地资源字节与数量、外部域名引用、阻塞资源
 * 不引入第三方依赖：正则解析 + zlib 实量，测不到的地方明确写「未测」而不是给估计值。
 */

const site = readData<Record<string, any>>('site-config');
const origin = `https://${site.primary_domain?.value ?? 'saipanivf.org'}`;

const report: Report = createReport();
const dist = join(process.cwd(), 'dist');

interface Page {
  file: string;
  rel: string;
  url: string;
  html: string;
  bytes: number;
  gzip: number;
  external?: string[];
  localAssets?: string[];
  blocking?: number;
  inlineBytes?: number;
  scripts?: number;
  imgRefs?: number;
}

function walk(dir: string, ext: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full, ext));
    else if (name.endsWith(ext)) out.push(full);
  }
  return out.sort();
}

function toUrl(file: string): string {
  const rel = relative(dist, file).replace(/\\/g, '/');
  if (rel === 'index.html') return '/';
  if (rel === '404.html') return '/404';
  return `/${rel.replace(/\/index\.html$/, '').replace(/\.html$/, '')}`;
}

function attr(tag: string, name: string): string | null {
  const m = new RegExp(`\\s${name}="([^"]*)"`, 'i').exec(tag);
  return m ? m[1] : null;
}

function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/* ---------- 对比度（WCAG 2.1 相对亮度） ---------- */

function channel(v: number): number {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(a: string, b: string): number {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

const TOKENS = Object.fromEntries(
  (readFileSync(join(process.cwd(), 'src/styles/tokens.css'), 'utf8').matchAll(/--(color-[a-z-]+):\s*(#[0-9a-fA-F]{6})/g)).map(
    (m) => [m[1]!, m[2]!],
  ),
);

interface Pair {
  fg: string;
  bg: string;
  use: string;
  min: number;
}

const PAIRS: Pair[] = [
  { fg: 'color-ink', bg: 'color-surface', use: '正文（body）', min: 4.5 },
  { fg: 'color-ink-muted', bg: 'color-surface', use: '次要文字、表单说明', min: 4.5 },
  { fg: 'color-ink-soft', bg: 'color-surface', use: '来源注记、待核槽位（小字号）', min: 4.5 },
  { fg: 'color-ink', bg: 'color-surface-alt', use: '卡片与浅底区块正文', min: 4.5 },
  { fg: 'color-ink', bg: 'color-surface-warm', use: '强调底色上的正文', min: 4.5 },
  { fg: 'color-primary', bg: 'color-surface', use: '正文内链接', min: 4.5 },
  { fg: 'color-primary-strong', bg: 'color-surface', use: '主按钮文字（内链态）', min: 4.5 },
  { fg: 'color-surface', bg: 'color-primary-strong', use: '主按钮文字 / 反白区', min: 4.5 },
  { fg: 'color-surface', bg: 'color-primary', use: '次级实心按钮文字', min: 4.5 },
  { fg: 'color-accent', bg: 'color-surface', use: '链接 hover 文字（a:hover）', min: 4.5 },
  { fg: 'color-accent', bg: 'color-surface-warm', use: 'hero 眉标（金字压在暖色渐变上）', min: 4.5 },
  { fg: 'color-accent', bg: 'color-surface', use: '焦点描边 3px（非文本 UI）', min: 3 },
  { fg: 'color-line-field', bg: 'color-surface', use: '表单控件与次级按钮描边', min: 3 },
  { fg: 'color-line-field', bg: 'color-surface-alt', use: '控件描边落在浅底区块上', min: 3 },
  { fg: '#dbe6ea', bg: 'color-ink', use: '页脚正文', min: 4.5 },
  { fg: 'color-danger', bg: 'color-danger-soft', use: '错误提示', min: 4.5 },
  { fg: 'color-warning', bg: 'color-warning-soft', use: '待审/警告提示', min: 4.5 },
  { fg: 'color-success', bg: 'color-success-soft', use: '成功提示', min: 4.5 },
  { fg: 'color-primary-strong', bg: 'color-primary-soft', use: '信息条文字', min: 4.5 },
];

function auditContrast(): { rows: { use: string; fg: string; bg: string; ratio: number; min: number; pass: boolean }[] } {
  const rows = PAIRS.map((pair) => {
    const fg = pair.fg.startsWith('#') ? pair.fg : TOKENS[pair.fg]!;
    const bg = pair.bg.startsWith('#') ? pair.bg : TOKENS[pair.bg]!;
    const ratio = contrast(fg, bg);
    return { use: pair.use, fg, bg, ratio: Math.round(ratio * 100) / 100, min: pair.min, pass: ratio >= pair.min };
  });
  for (const row of rows) {
    if (row.pass) continue;
    const line = `对比度不足：${row.use} ${row.fg}/${row.bg} = ${row.ratio}:1，要求 ≥${row.min}:1`;
    if (row.ratio >= row.min - 0.5) report.warnings.push(line);
    else report.errors.push(line);
  }
  return { rows };
}

/* ---------- 可访问性 + SEO：逐页 ---------- */

const headingLevels = /<h([1-6])\b[^>]*>/g;
const pages: Page[] = [];

function auditPage(page: Page, seenTitles: Map<string, string[]>, seenDescriptions: Map<string, string[]>) {
  const { html, url, rel } = page;

  // 可访问性
  const htmlTag = /<html\b[^>]*>/i.exec(html)?.[0] ?? '';
  const lang = attr(htmlTag, 'lang');
  if (!lang) report.errors.push(`${rel}：<html> 缺少 lang`);
  else if (!(LANGUAGES as readonly string[]).includes(lang)) report.errors.push(`${rel}：<html lang="${lang}"> 不是五个受控语言码之一`);

  const h1 = [...html.matchAll(/<h1\b[^>]*>/gi)].length;
  if (h1 !== 1) report.errors.push(`${rel}：<h1> 数量为 ${h1}，要求恰好 1 个`);

  const levels = [...html.matchAll(headingLevels)].map((m) => Number(m[1]));
  for (let i = 1; i < levels.length; i += 1) {
    if (levels[i]! - levels[i - 1]! > 1) {
      report.errors.push(`${rel}：标题层级跳级 h${levels[i - 1]} → h${levels[i]}`);
      break;
    }
  }

  for (const img of [...html.matchAll(/<img\b[^>]*>/gi)]) {
    if (attr(img[0], 'alt') === null) report.errors.push(`${rel}：<img> 缺少 alt：${attr(img[0], 'src')}`);
  }

  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]!);
  const dupes = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (dupes.length > 0) report.errors.push(`${rel}：重复 id：${[...new Set(dupes)].join(', ')}`);

  for (const control of [...html.matchAll(/<(input|select|textarea)\b[^>]*>/gi)]) {
    const tag = control[0];
    if (attr(tag, 'type') === 'hidden') continue;
    const id = attr(tag, 'id');
    const named = attr(tag, 'name');
    // 无 name 的控件（如评估向导的纯客户端输入）同样必须有可访问名称，不能因此跳过检查。
    if (!named && !id) continue;
    const hasLabel = id ? new RegExp(`<label\\b[^>]*for="${id.replace(/[-]/g, '-')}"`, 'i').test(html) : false;
    const hasAria = attr(tag, 'aria-label') !== null || attr(tag, 'aria-labelledby') !== null;
    const wrapped = id ? new RegExp(`<label\\b[^>]*>[\s\S]{0,400}?id="${id}"`, 'i').test(html) : false;
    if (!hasLabel && !hasAria && !wrapped) report.errors.push(`${rel}：控件 ${named} 没有可访问名称（缺 label/aria-label）`);
  }

  for (const anchor of [...html.matchAll(/<a\b[^>]*>[\s\S]{0,400}?<\/a>/gi)]) {
    const text = stripTags(anchor[0]);
    const tag = /<a\b[^>]*>/i.exec(anchor[0])?.[0] ?? '';
    if (!text && !attr(tag, 'aria-label')) report.warnings.push(`${rel}：空链接文本，目标 ${attr(tag, 'href')}`);
    if (attr(tag, 'target') === '_blank' && !/noopener|noreferrer/.test(attr(tag, 'rel') ?? '')) {
      report.warnings.push(`${rel}：target="_blank" 缺少 rel=noopener：${attr(tag, 'href')}`);
    }
  }

  if (!/class="[^"]*skip-link/i.test(html) && url !== '/404') report.warnings.push(`${rel}：未找到 skip-link`);
  if (!/<main\b/i.test(html)) report.errors.push(`${rel}：缺少 <main> 地标`);
  if (!/<header\b/i.test(html) || !/<footer\b/i.test(html)) report.warnings.push(`${rel}：header/footer 地标不完整`);
  if (/<table\b/i.test(html) && !/<th\b/i.test(html)) report.errors.push(`${rel}：表格缺少 <th>`);

  // SEO
  // 表单安全（文档 6.2、8.1 第 13 项）：以真实产物为准
  const formLang = lang ?? 'zh-hant';
  const allowed = new Set(allowedFieldsForLang(formLang));
  for (const match of [...html.matchAll(/<form\b[^>]*>/gi)]) {
    const tag = match[0];
    const method = (attr(tag, 'method') ?? 'get').toLowerCase();
    if (method !== 'post') report.errors.push(`${rel}：<form method="${method}"> 不是 post；无 JS 时表单内容会被写进 URL（6.2）`);
    if ((attr(tag, 'action') ?? '').includes('?')) report.errors.push(`${rel}：form action 带 query，可能泄漏表单数据`);
    if (/enctype="multipart\/form-data"/i.test(tag)) report.errors.push(`${rel}：表单声明附件上传（6.2 禁止）`);
  }
  if (/<input\b[^>]*type="file"/i.test(html)) report.errors.push(`${rel}：页面存在文件上传控件`);
  for (const key of NEVER_COLLECTED) {
    if (new RegExp(`name="${key}"`, 'i').test(html)) report.errors.push(`${rel}：出现绝不收集的字段 ${key}`);
  }
  for (const control of [...html.matchAll(/<(input|textarea)\b[^>]*>/gi)]) {
    const tag = control[0];
    const name = attr(tag, 'name');
    if (!name || name === 'company') continue;
    if (!allowed.has(name)) report.errors.push(`${rel}：控件 name="${name}" 不在 ${formLang} 的字段白名单内`);
    const limit = MAX_LENGTHS[name];
    if (limit && Number(attr(tag, 'maxlength') ?? 0) !== limit) {
      report.errors.push(`${rel}：${name} 的 maxlength=${attr(tag, 'maxlength') ?? '缺失'}，与契约 ${limit} 不一致（双重长度限制失效）`);
    }
  }
  const honeypot = /<div class="hp-field"[\s\S]{0,300}?name="company"[\s\S]{0,120}?>/.exec(html);
  if (honeypot) {
    if (!/aria-hidden="true"/.test(honeypot[0])) report.errors.push(`${rel}：蜜罐缺少 aria-hidden，屏幕阅读器会读到`);
    if (!/tabindex="-1"/.test(honeypot[0])) report.errors.push(`${rel}：蜜罐可被 Tab 聚焦，真实用户可能填入`);
  }

  // SEO：中日韩文字信息密度高，长度口径与拉丁文不同（详见 docs/seo/technical-seo-checklist.md）
  const cjk = /^(zh|ja|ko)/.test(lang ?? '');
  const titleRange = cjk ? [6, 30] : [25, 60];
  const descRange = cjk ? [20, 90] : [50, 160];

  const title = stripTags(/<title\b[^>]*>[\s\S]*?<\/title>/i.exec(html)?.[0] ?? '');
  if (!title) report.errors.push(`${rel}：缺少 <title>`);
  else {
    if (title.length < titleRange[0] || title.length > titleRange[1]) {
      report.warnings.push(`${rel}：title 长度 ${title.length}（本语言建议 ${titleRange[0]}–${titleRange[1]}）：${title}`);
    }
    seenTitles.set(title, [...(seenTitles.get(title) ?? []), url]);
  }

  const descriptionTag = /<meta\s+name="description"\s+content="([^"]*)"/i.exec(html)?.[1] ?? '';
  if (!descriptionTag) report.errors.push(`${rel}：缺少 meta description`);
  else {
    const decoded = descriptionTag.replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'");
    if (decoded.length < descRange[0] || decoded.length > descRange[1]) {
      report.warnings.push(`${rel}：description 长度 ${decoded.length}（本语言建议 ${descRange[0]}–${descRange[1]}）`);
    }
    seenDescriptions.set(decoded, [...(seenDescriptions.get(decoded) ?? []), url]);
  }

  const canonical = attr(/<link rel="canonical"[^>]*>/i.exec(html)?.[0] ?? '', 'href');
  if (!canonical) report.errors.push(`${rel}：缺少 canonical`);
  else if (canonical !== (url === '/' ? `${origin}/` : `${origin}${url}`)) {
    report.errors.push(`${rel}：canonical 与实际 URL 不一致：${canonical} ≠ ${url === '/' ? `${origin}/` : `${origin}${url}`}`);
  }

  const robots = attr(/<meta name="robots"[^>]*>/i.exec(html)?.[0] ?? '', 'content') ?? '';
  if (!robots) report.warnings.push(`${rel}：缺少 robots meta`);
  if (url === '/404' && !/noindex/i.test(robots)) report.errors.push(`${rel}：404 页必须 noindex`);

  for (const og of ['og:title', 'og:description', 'og:url']) {
    if (!html.includes(`property="${og}"`)) report.warnings.push(`${rel}：缺少 ${og}`);
  }

  const alternates = [...html.matchAll(/<link rel="alternate"\s+hreflang="([^"]+)"\s+href="([^"]+)"/gi)].map((m) => ({
    hreflang: m[1]!,
    href: m[2]!,
  }));
  if (alternates.length > 0) {
    const self = url === '/' ? `${origin}/` : `${origin}${url}`;
    if (!alternates.some((a) => a.href === self)) report.errors.push(`${rel}：hreflang 组缺少自指条目`);
    if (!alternates.some((a) => a.hreflang === 'x-default')) report.warnings.push(`${rel}：hreflang 组缺少 x-default`);
  }

  const jsonLd = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
  for (const block of jsonLd) {
    try {
      JSON.parse(block[1]!);
    } catch {
      report.errors.push(`${rel}：JSON-LD 无法解析`);
    }
  }

  // 性能
  const external = new Set<string>();
  for (const m of [...html.matchAll(/(?:src|href)="https?:\/\/([^/"']+)/gi)]) {
    if (m[1] !== site.primary_domain?.value) external.add(m[1]!);
  }
  for (const m of [...html.matchAll(/<(script|link)\b[^>]*>/gi)]) {
    const src = attr(m[0], 'src') ?? attr(m[0], 'href');
    if (src && /^https?:\/\//.test(src)) {
      const host = new URL(src).hostname;
      if (host !== site.primary_domain?.value) external.add(host);
    }
  }
  page.external = [...external];
  // 本地资源含 public/ 静态素材（首图、字体），否则首屏图片体积会漏计。
  page.localAssets = [...html.matchAll(/(?:src|href)="\/((?:_astro|images|fonts)\/[^"]+)"/g)].map((m) => m[1]!);
  page.blocking = page.localAssets.filter((asset) => asset.endsWith('.css')).length;
  page.inlineBytes = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].reduce((sum, m) => sum + Buffer.byteLength(m[1]!, 'utf8'), 0);
  page.scripts = [...html.matchAll(/<script\b[^>]*>[\s\S]*?<\/script>/gi)].filter((m) => !/type="application\/ld\+json"/.test(m[0])).length;
  page.imgRefs = [...html.matchAll(/<img\b[^>]*>/gi)].length;
}

if (!existsSync(dist)) {
  report.errors.push('dist/ 不存在：先运行 pnpm run build 或 pnpm run build:preview');
  finish(report, 'audit-dist');
} else {
  const contrastResult = auditContrast();
  const seenTitles = new Map<string, string[]>();
  const seenDescriptions = new Map<string, string[]>();

  for (const file of walk(dist, '.html')) {
    const html = readFileSync(file, 'utf8');
    const page: Page = {
      file,
      rel: relative(dist, file).replace(/\\/g, '/'),
      url: toUrl(file),
      html,
      bytes: Buffer.byteLength(html, 'utf8'),
      gzip: gzipSync(html).length,
    };
    pages.push(page);
    auditPage(page, seenTitles, seenDescriptions);
  }

  for (const [title, urls] of seenTitles) if (urls.length > 1) report.warnings.push(`title 重复：${title} → ${urls.join(', ')}`);
  for (const [desc, urls] of seenDescriptions) if (urls.length > 1) report.warnings.push(`description 重复（${urls.length} 页）：${desc.slice(0, 40)}…`);

  // sitemap 与产物一致性
  const sitemapFiles = walk(dist, '.xml').filter((f) => /sitemaps[\\/]/.test(f));
  const sitemapUrls: string[] = [];
  for (const file of sitemapFiles) {
    for (const m of [...readFileSync(file, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)]) sitemapUrls.push(m[1]!);
  }
  const indexable = pages.filter((p) => /content="index/i.test(p.html) && p.url !== '/404');
  for (const url of sitemapUrls) {
    if (!url.startsWith(origin)) report.errors.push(`sitemap URL 不是主域：${url}`);
    const path = url.slice(origin.length) || '/';
    if (!pages.some((p) => p.url === path)) report.errors.push(`sitemap 列出的页面不在产物中：${path}`);
  }
  for (const page of indexable) {
    if (!sitemapUrls.some((u) => (u === `${origin}/` ? page.url === '/' : u === `${origin}${page.url}`))) {
      report.errors.push(`可索引页未进入 sitemap：${page.url}`);
    }
  }

  // 资源体积
  const assetBytes = new Map<string, number>();
  for (const page of pages) {
    for (const asset of (page as Page & { localAssets?: string[] }).localAssets ?? []) {
      const full = join(dist, asset);
      if (!existsSync(full)) {
        report.errors.push(`引用了不存在的资源：/${asset}（来自 ${page.rel}）`);
        continue;
      }
      assetBytes.set(asset, statSync(full).size);
    }
  }

  const robotsTxt = existsSync(join(dist, 'robots.txt')) ? readFileSync(join(dist, 'robots.txt'), 'utf8') : '';
  if (!robotsTxt) report.errors.push('dist/robots.txt 不存在');
  else if (!new RegExp(`Sitemap: ${origin}/`).test(robotsTxt)) report.errors.push('robots.txt 未声明主域 sitemap');

  // 禁用域名只查页面产物；robots.txt 与构建脚本里为运维留的旧域说明不算站内引用（文档 7.3、12）。
  const forbidden: string[] = (site.forbidden_domains ?? [])
    .filter((entry: { status: string }) => entry.status !== 'legacy_redirect_only')
    .map((entry: { value: string }) => String(entry.value));
  for (const page of pages) {
    for (const domain of forbidden) {
      if (page.html.includes(domain)) report.errors.push(`${page.rel}：出现禁用域名 ${domain}`);
    }
  }

  /* ---------- 报告落盘 ---------- */

  const lines: string[] = [];
  lines.push('# 构建产物技术审计报告');
  lines.push('');
  lines.push(`- 生成命令：\`pnpm run audit\`（本文件由 scripts/audit-dist.ts 自动生成，请勿手改）`);
  lines.push(`- 审计对象：\`dist/\`，${pages.length} 个页面，sitemap 条目 ${sitemapUrls.length} 个`);
  const formCount = pages.reduce((sum, page) => sum + (page.html.match(/<form\b/gi)?.length ?? 0), 0);
  lines.push(`- 判定口径：对比度按 WCAG 2.1 相对亮度实算；正文阈值 4.5:1，非文本 UI 与大字号 3:1`);
  lines.push(`- 检查对象：${pages.length} 个 HTML 产物、${formCount} 个 <form>、${sitemapUrls.length} 条 sitemap URL`);
  // 三态判定：预览有草稿横幅；演示剥了横幅但产物里仍有未上线页（不在 sitemap 内）；生产只剩已上线页 + 404。
  // 只看「有无 DRAFT 横幅」会把演示包误标成生产——正是可以被人直接上传的那类假信号。
  const liveUrls = new Set(sitemapUrls.map((u) => u.slice(origin.length) || '/'));
  const offSitemapCount = pages.filter((page) => page.url !== '/404' && !liveUrls.has(page.url)).length;
  const buildMode = pages.some((page) => />DRAFT</.test(page.html))
    ? '**预览**（含草稿横幅，禁止指向生产）'
    : offSitemapCount > 0
      ? `**演示**（产物含 ${offSitemapCount} 个未上线页，外壳已剥离，禁止指向生产）`
      : '生产（产物只含已上线页与 404）';
  lines.push(`- 构建模式：${buildMode}`);
  lines.push(`- 结果：**${report.errors.length} error / ${report.warnings.length} warning**`);
  lines.push('');
  lines.push('## 1. 颜色对比度（token 实算）');
  lines.push('');
  lines.push('| 用途 | 前景 | 背景 | 比值 | 要求 | 结果 |');
  lines.push('|---|---|---|---|---|---|');
  for (const row of contrastResult.rows) {
    lines.push(`| ${row.use} | ${row.fg} | ${row.bg} | ${row.ratio}:1 | ≥${row.min}:1 | ${row.pass ? '通过' : '**不通过**'} |`);
  }
  lines.push('');
  lines.push('## 2. 页面载荷（实测字节）');
  lines.push('');
  lines.push('| URL | HTML | HTML(gzip) | 本地资源数 | CSS 阻塞数 | 内联样式 | 脚本块 | 图片 | 外部域名 |');
  lines.push('|---|---|---|---|---|---|---|---|---|');
  for (const page of pages) {
    const p = page as Page & { localAssets?: string[]; inlineBytes?: number; scripts?: number; imgRefs?: number; external?: string[] };
    lines.push(
      `| ${page.url} | ${page.bytes} B | ${page.gzip} B | ${(p.localAssets ?? []).length} | ${p.blocking ?? 0} | ${p.inlineBytes ?? 0} B | ${p.scripts ?? 0} | ${p.imgRefs ?? 0} | ${(p.external ?? []).join(', ') || '无'} |`,
    );
  }
  lines.push('');
  lines.push('### 本地资源体积');
  lines.push('');
  lines.push('| 资源 | 字节 |');
  lines.push('|---|---|');
  for (const [asset, size] of [...assetBytes.entries()].sort((a, b) => b[1] - a[1])) lines.push(`| /${asset} | ${size} B |`);
  if (assetBytes.size === 0) lines.push('| （产物未引用本地 CSS/JS） | — |');
  lines.push('');
  lines.push('## 3. 未在本文档中测定的项目');
  lines.push('');
  lines.push('- 首屏 < 2 秒（文档 8.1 第 9 项）：需要真实托管 + 网络档位（Fast3G/4G）与 Lighthouse，本脚本只给字节与请求数，不给时间估计。');
  lines.push('- 真机屏幕阅读器（NVDA/VoiceOver）与 iOS Safari 表单缩放：需要人工，本脚本只验证结构与 label 绑定。');
  lines.push('- 表单提交与失败链路：ADR-002 契约未确认，未接线。');
  lines.push('- GA4 实际上报：未配置 measurement ID，只验证「同意前 0 事件、同意后仅白名单参数」。');
  if (formCount === 0) {
    lines.push(
      '- **本轮没有表单可检**：产物里没有 `<form>`（生产构建只渲染 published 页）。表单安全规则（method=post、字段白名单、双重长度限制、蜜罐、禁收附件与病历）只在含表单的构建中生效——覆盖它们的命令是 `pnpm run build:preview && pnpm run audit`，以及 `tests/unit/forms.test.ts`。',
    );
  }
  lines.push('');
  lines.push('## 4. 本次判定的问题清单');
  lines.push('');
  lines.push(`### error（${report.errors.length}）`);
  lines.push('');
  for (const line of report.errors) lines.push(`- ${line}`);
  if (report.errors.length === 0) lines.push('- （无）');
  lines.push('');
  lines.push(`### warning（${report.warnings.length}）`);
  lines.push('');
  for (const line of report.warnings) lines.push(`- ${line}`);
  if (report.warnings.length === 0) lines.push('- （无）');
  lines.push('');

  mkdirSync(join(process.cwd(), 'docs/testing'), { recursive: true });
  writeFileSync(join(process.cwd(), 'docs/testing/audit-report.md'), lines.join('\n'), 'utf8');
  console.log(
    `审计：${pages.length} 页 / ${sitemapUrls.length} 条 sitemap / ${assetBytes.size} 个本地资源；报告已写入 docs/testing/audit-report.md`,
  );
  finish(report, 'audit-dist');
}

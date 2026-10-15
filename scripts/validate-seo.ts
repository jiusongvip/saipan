import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createReport, finish, loadRawPages, type Report } from './lib/pages';
import { readData } from './lib/data';
import { LANGUAGES, STATUSES } from '../src/lib/page-rules';

/**
 * SEO 与发布闸门校验（开发文档 2.3、7.2、8.1 第 8、9、10 项）。
 * 先校验内容模型（canonical、hreflang、语言开关），再校验已生成产物（sitemap、robots、noindex）。
 */

const site = readData<Record<string, any>>('site-config');
const report: Report = createReport();
const origin = `https://${site.primary_domain?.value ?? 'saipanivf.org'}`;
const enabled = new Set<string>((site.languages ?? []).filter((l: { enabled: boolean }) => l.enabled).map((l: { code: string }) => l.code));
const hreflangOf = (code: string) => (site.languages ?? []).find((l: { code: string }) => l.code === code)?.hreflang;

const pages = loadRawPages();
const byPath = new Map<string, string[]>();
const groups = new Map<string, typeof pages>();

for (const page of pages) {
  const path = String(page.data.path ?? '');
  const lang = String(page.data.lang ?? '');
  const status = String(page.data.status ?? 'draft');
  const key = String(page.data.translation_key ?? '');

  if (!(LANGUAGES as readonly string[]).includes(lang)) report.errors.push(`${page.file} lang 非法：${lang}`);
  if (!(STATUSES as readonly string[]).includes(status)) report.errors.push(`${page.file} status 非法：${status}`);
  if (!path.startsWith('/')) report.errors.push(`${page.file} path 必须以 / 开头`);
  if (path !== '/' && path.endsWith('/')) report.errors.push(`${page.file} path 不得带尾斜杠：${path}`);
  if (path && lang && !path.startsWith(`/${lang}`)) report.errors.push(`${page.file} canonical 与语言不符：${path}`);

  byPath.set(path, [...(byPath.get(path) ?? []), page.file]);
  groups.set(key, [...(groups.get(key) ?? []), page]);

  const live = status === 'published';
  if (live && page.data.noindex !== false) report.errors.push(`${page.file} 状态 published 但 noindex 未关闭`);
  if (!live && page.data.noindex === false) {
    report.errors.push(`${page.file} 状态 ${status} 尚未上线，必须 noindex（3.2）`);
  }
  if (live && !enabled.has(lang)) report.errors.push(`${page.file} 语言 ${lang} 未启用却处于 published`);
}

for (const [path, files] of byPath) {
  if (files.length > 1) report.errors.push(`canonical 重复：${path} → ${files.join(', ')}`);
}

// hreflang 只在真实存在且已上线的等价页之间互指。
const liveGroups = new Map<string, typeof pages>();
for (const [key, list] of groups) {
  const live = list.filter((page) => page.data.status === 'published' && enabled.has(String(page.data.lang)));
  if (live.length === 0) continue;
  liveGroups.set(key, live);
  const langs = live.map((page) => String(page.data.lang));
  const dupes = langs.filter((lang, index) => langs.indexOf(lang) !== index);
  if (dupes.length > 0) report.errors.push(`hreflang 组 ${key} 同一语言出现多页：${[...new Set(dupes)].join(', ')}`);
  const hasXDefault = langs.includes(String(site.x_default_target));
  if (!hasXDefault) report.errors.push(`hreflang 组 ${key} 缺少 x-default 目标语言 ${String(site.x_default_target)}`);
  for (const page of live) {
    if (!hreflangOf(String(page.data.lang))) report.errors.push(`${page.file} 语言 ${page.data.lang} 没有 hreflang 配置`);
  }
}

/* ---------- 构建产物检查（存在 dist 时） ---------- */
const dist = join(process.cwd(), 'dist');
const built = existsSync(dist);
if (!built) {
  report.warnings.push('dist/ 不存在：跳过 sitemap 与 robots 产物检查（先运行 pnpm build）');
} else {
  const indexFile = join(dist, 'sitemap-index.xml');
  if (!existsSync(indexFile)) {
    report.errors.push('dist/sitemap-index.xml 缺失');
  } else {
    const index = readFileSync(indexFile, 'utf8');
    const urls = [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    for (const url of urls) {
      if (!url.startsWith(origin)) report.errors.push(`sitemap-index 中的 URL 主域不符：${url}`);
      const file = join(dist, url.replace(origin, '').replace(/^\//, ''));
      if (!existsSync(file)) report.errors.push(`sitemap-index 指向不存在的文件：${url}`);
    }
    const robotsFile = join(dist, 'robots.txt');
    if (existsSync(robotsFile)) {
      const robots = readFileSync(robotsFile, 'utf8');
      if (!robots.includes(`${origin}/sitemap-index.xml`)) {
        report.errors.push('robots.txt 未指向 sitemap index');
      }
    } else report.errors.push('dist/robots.txt 缺失');
  }

  const dir = join(dist, 'sitemaps');
  let rootSubmissions = 0;
  if (existsSync(dir)) {
    for (const name of readdirSync(dir)) {
      const lang = name.replace('.xml', '');
      if (!enabled.has(lang)) {
        report.errors.push(`分语言 sitemap 包含未启用语言：${name}`);
        continue;
      }
      const xml = readFileSync(join(dir, name), 'utf8');
      const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
      for (const url of urls) {
        const path = url.replace(origin, '');
        // 根路径是规范形态（canonicalUrl('/') 保留尾斜杠），语言首页本身不带斜杠；其余带斜杠一律视为违规。
        if (url.endsWith('/') && path !== '/' && path !== `/${lang}`) report.errors.push(`${name} 中 URL 带尾斜杠：${url}`);
        if (path === '/') {
          // 根选择页由 src/pages/index.astro 生成，不属于 MDX 内容页；只允许出现在默认语言的 sitemap 里。
          rootSubmissions += 1;
          if (lang !== String(site.default_language)) {
            report.errors.push(`${name}：根选择页只应由默认语言 ${String(site.default_language)} 提交`);
          }
          if (!existsSync(join(dist, 'index.html'))) report.errors.push(`${name} 收录了不存在的根页面`);
          continue;
        }
        const page = pages.find((entry) => String(entry.data.path) === path);
        if (!page) {
          report.errors.push(`${name} 收录了不存在的页面：${url}`);
          continue;
        }
        if (page.data.status !== 'published') {
          report.errors.push(`${name} 收录了未发布页面（${String(page.data.status)}）：${url}`);
        }
        if (page.data.noindex !== false) report.errors.push(`${name} 收录了 noindex 页面：${url}`);
      }
    }
  }
  if (rootSubmissions > 1) report.errors.push('根选择页被多个分语言 sitemap 重复提交');
}

const liveCount = pages.filter((page) => page.data.status === 'published').length;
console.log(
  `SEO：内容页 ${pages.length} 个，其中 published ${liveCount} 个；hreflang 组 ${liveGroups.size} 个；启用语言 ${[...enabled].join(', ')}${built ? '；已检查 dist 产物' : ''}`,
);
finish(report, 'validate-seo');

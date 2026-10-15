import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createReport, finish, type Report } from './lib/pages';
import { readData } from './lib/data';

/**
 * 内部链接检查（开发文档 8.1 第 11 项）：以真实构建产物 dist/ 为准，
 * 检查每个站内链接都能落到已生成的页面，锚点目标存在，且不指向禁用域名。
 */

const site = readData<Record<string, any>>('site-config');
const origin = `https://${site.primary_domain?.value ?? 'saipanivf.org'}`;
const forbidden: string[] = (site.forbidden_domains ?? [])
  .filter((entry: { status: string }) => entry.status !== 'legacy_redirect_only')
  .map((entry: { value: string }) => entry.value);

const report: Report = createReport();
const dist = join(process.cwd(), 'dist');
if (!existsSync(dist)) {
  report.errors.push('dist/ 不存在：先运行 pnpm build 或 pnpm build:preview 再检查链接');
  finish(report, 'check-links');
} else {
  const html = (function walk(dir: string): string[] {
    const out: string[] = [];
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) out.push(...walk(full));
      else if (name.endsWith('.html')) out.push(full);
    }
    return out;
  })(dist);

  const idsByFile = new Map<string, Set<string>>();
  for (const file of html) {
    const text = readFileSync(file, 'utf8');
    idsByFile.set(file, new Set([...text.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  }

  function resolve(target: string, from: string): string | null {
    const clean = target.split('#')[0];
    if (clean === '' || clean === '/') return join(dist, 'index.html');
    if (!clean.startsWith('/')) {
      // 相对链接：相对当前页面目录解析
      const base = join(from, '..');
      return existsSync(join(base, clean, 'index.html'))
        ? join(base, clean, 'index.html')
        : existsSync(join(base, clean))
          ? join(base, clean)
          : null;
    }
    const path = clean.replace(/^\//, '');
    const asDir = join(dist, path, 'index.html');
    if (existsSync(asDir)) return asDir;
    const asFile = join(dist, path);
    if (existsSync(asFile) && statSync(asFile).isFile()) return asFile;
    const asHtml = join(dist, `${path}.html`);
    return existsSync(asHtml) ? asHtml : null;
  }

  let checked = 0;
  for (const file of html) {
    const text = readFileSync(file, 'utf8');
    // 只检查真正会跳转的元素：<a href> / <img src>；<link rel=canonical|alternate> 与 og:url 必须是绝对 URL，不算内链。
    const links = [...text.matchAll(/<(a|img|area)\b[^>]*?\s(?:href|src)="([^"]+)"/gi)].map((m) => m[2]);
    for (const link of links) {
      if (link.startsWith('data:') || link.startsWith('javascript:')) continue;
      if (/^(mailto:|tel:)/i.test(link)) {
        for (const domain of forbidden) if (link.includes(domain)) report.errors.push(`${relative(dist, file)} 邮箱/电话指向禁用域名 ${domain}`);
        continue;
      }
      if (/^https?:\/\//.test(link)) {
        if (link.startsWith(origin)) report.errors.push(`${relative(dist, file)} 站内链接写成绝对 URL，应使用相对路径：${link}`);
        for (const domain of forbidden) if (link.includes(domain)) report.errors.push(`${relative(dist, file)} 链接到禁用域名：${link}`);
        continue;
      }
      if (!link.startsWith('/') && !link.startsWith('#') && !link.startsWith('.')) continue;
      checked += 1;
      if (link.startsWith('#')) {
        const id = link.slice(1);
        if (id && !idsByFile.get(file)?.has(id)) report.errors.push(`${relative(dist, file)} 锚点缺失：${link}`);
        continue;
      }
      const target = resolve(link, file);
      if (!target) {
        report.errors.push(`${relative(dist, file)} 断链：${link}`);
        continue;
      }
      const anchor = link.split('#')[1];
      if (anchor && !idsByFile.get(target)?.has(anchor)) {
        report.errors.push(`${relative(dist, file)} 跨页锚点缺失：${link}`);
      }
    }
  }
  console.log(`链接检查：扫描 ${html.length} 个已生成页面，站内链接 ${checked} 条（dist 模式）`);
  finish(report, 'check-links');
}

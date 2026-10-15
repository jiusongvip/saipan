import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { findProhibited, mixedScriptChars } from '../src/lib/claims';
import { createReport, finish, type Report } from './lib/pages';

/**
 * 风险话术与简繁混用检测（开发文档 8.1 第 15 项、12 上线清单）。
 * 规则本体在 src/lib/claims.ts，与单元测试共用；本脚本只负责扫描仓库文件。
 */

const SELF = 'src/lib/claims.ts'; // 规则文件本身含禁止词样例，跳过

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    if (['node_modules', 'dist', '.astro', '.git', 'docs', 'tests', 'scripts'].includes(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.(mdx|astro|ts|txt)$/.test(name)) out.push(full);
  }
  return out;
}

const report: Report = createReport();
const root = process.cwd();
const files = walk(root)
  .map((full) => relative(root, full).replace(/\\/g, '/'))
  .filter((file) => file !== SELF);

for (const file of files) {
  const text = readFileSync(join(root, file), 'utf8');
  // 话术检测只作用于会呈现给访客的文件；事实登记里的引用说明不算违规。
  const publicSurface = file.startsWith('content/') || file.startsWith('src/') || file.startsWith('public/');

  if (publicSurface) {
    for (const hit of findProhibited(text)) {
      report.errors.push(`${file}:${hit.line} 风险话术「${hit.text}」— ${hit.reason}`);
    }
  }

  const dirLang = file.startsWith('content/') ? file.split('/')[1] : '';
  if (dirLang === 'zh-hant' || dirLang === 'zh-hans') {
    const chars = mixedScriptChars(text, dirLang as 'zh-hant' | 'zh-hans');
    if (chars.length > 0) {
      const line = `${file} 简繁混用（${dirLang}）：${chars.join('')}`;
      if (dirLang === 'zh-hant') report.errors.push(line);
      else report.warnings.push(line);
    }
  }

  if (publicSurface && text.includes('sivf-asia.com')) {
    report.errors.push(`${file} 引用了归属未决的域名 sivf-asia.com（7.3：处置确认前站内零引用）`);
  }
}

console.log(`扫描 ${files.length} 个文件（不含 dist、docs 与校验脚本）`);
finish(report, 'check-prohibited-claims');

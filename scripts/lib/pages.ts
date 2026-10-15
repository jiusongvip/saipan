import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { parse as parseYaml } from 'yaml';

export interface RawPage {
  /** 相对仓库根的路径，例如 content/zh-hant/index.mdx */
  file: string;
  lang: string;
  data: Record<string, unknown>;
  body: string;
}

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const info = statSync(full);
    if (info.isDirectory()) out.push(...walk(full));
    else if (name.endsWith('.mdx')) out.push(full);
  }
  return out.sort();
}

export function splitFrontmatter(source: string): { yaml: string; body: string } {
  if (!source.startsWith('---\n')) throw new Error('文件开头缺少 frontmatter');
  const end = source.indexOf('\n---', 4);
  if (end < 0) throw new Error('frontmatter 未闭合');
  return { yaml: source.slice(4, end + 1), body: source.slice(end + 4) };
}

export function loadRawPages(root = process.cwd()): RawPage[] {
  const base = join(root, 'content');
  return walk(base).map((full) => {
    const source = readFileSync(full, 'utf8');
    const { yaml: yamlText, body } = splitFrontmatter(source);
    const parsed = parseYaml(yamlText) as Record<string, unknown>;
    const rel = relative(root, full).replace(/\\/g, '/');
    return {
      file: rel,
      lang: typeof parsed.lang === 'string' ? parsed.lang : rel.split('/')[1] ?? '',
      data: parsed,
      body,
    };
  });
}

export interface CsvRow extends Record<string, string> {}

export function parseCsv(text: string): CsvRow[] {
  const rows: string[][] = [];
  let field = '';
  let row: string[] = [];
  let quoted = false;
  const src = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < src.length; i += 1) {
    const char = src[i];
    if (quoted) {
      if (char === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i += 1;
        } else quoted = false;
      } else field += char;
      continue;
    }
    if (char === '"') {
      quoted = true;
      continue;
    }
    if (char === ',') {
      row.push(field);
      field = '';
      continue;
    }
    if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      continue;
    }
    if (char === '\r') continue;
    field += char;
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  const [head, ...rest] = rows.filter((entry) => entry.some((cell) => cell.trim() !== ''));
  return rest.map((cells) => {
    const record: CsvRow = {};
    head.forEach((key, index) => {
      record[key.trim()] = cells[index] ?? '';
    });
    return record;
  });
}

export function loadManifest(root = process.cwd()): CsvRow[] {
  return parseCsv(readFileSync(join(root, 'content/page-manifest.csv'), 'utf8'));
}

export interface Report {
  errors: string[];
  warnings: string[];
}

export function createReport(): Report {
  return { errors: [], warnings: [] };
}

export function finish(report: Report, label: string): void {
  for (const line of report.errors) console.error(`[error] ${line}`);
  for (const line of report.warnings) console.warn(`[warn] ${line}`);
  console.log(`${label}: ${report.errors.length} error(s), ${report.warnings.length} warning(s)`);
  if (report.errors.length > 0) process.exitCode = 1;
}

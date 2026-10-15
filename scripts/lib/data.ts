import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export function readData<T = Record<string, unknown>>(name: string, root = process.cwd()): T {
  return JSON.parse(readFileSync(join(root, `data/${name}.json`), 'utf8')) as T;
}

/** 时间敏感事实的复核窗口（开发文档 5.1：入境政策月度复核）。 */
export function isFresh(lastVerified: unknown, days: number): boolean {
  if (typeof lastVerified !== 'string') return false;
  const checked = new Date(`${lastVerified}T00:00:00Z`);
  if (Number.isNaN(checked.getTime())) return false;
  const age = Date.now() - checked.getTime();
  return age >= 0 && age <= days * 86_400_000;
}

export function hasValue(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim() !== '';
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.values(value as Record<string, unknown>).some(hasValue);
  return true;
}

export function pick(source: Record<string, unknown>, dotted: string): unknown {
  return dotted.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[key];
    return undefined;
  }, source);
}

export function flatten(value: unknown): string {
  return JSON.stringify(value) ?? '';
}

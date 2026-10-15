import { LANGUAGES } from '../src/lib/page-rules';
import { finish, createReport, loadRawPages, type Report } from './lib/pages';
import { hasValue, isFresh, pick, readData } from './lib/data';

/**
 * 入境政策数据校验（开发文档 5.1、8.1 第 6 项）。
 * 核心规则：只有 status=verified、必填字段齐全且仍在复核窗口内的记录，才可被生产页面引用；
 * 未达门槛时页面必须整行不渲染，不得以占位或"视情况而定"填充。
 */

interface EntryPolicyFile {
  schemaVersion?: number;
  status_values?: string[];
  records?: Record<string, unknown>[];
  required_records?: { slot_id: string; langs?: string[]; needed_evidence?: string; status?: string }[];
  fields_required_for_verified?: string[];
  review_cycle?: { frequency?: string; owner?: string | null };
}

const WINDOW_DAYS = 31; // 月度复核
const report: Report = createReport();
const file = readData<EntryPolicyFile>('entry-policy');

const records = file.records ?? [];
const slots = file.required_records ?? [];
const requiredFields = file.fields_required_for_verified ?? [];

if (file.schemaVersion !== 1) report.errors.push('entry-policy: schemaVersion 必须为 1');
if (!Array.isArray(file.status_values) || file.status_values.length === 0) {
  report.errors.push('entry-policy: 缺少 status_values 定义');
}
if (requiredFields.length === 0) report.errors.push('entry-policy: 缺少 fields_required_for_verified 清单');

const slotIds = new Set<string>();
for (const slot of slots) {
  if (!slot.slot_id) report.errors.push('entry-policy: required_records 有条目缺少 slot_id');
  if (slotIds.has(slot.slot_id)) report.errors.push(`entry-policy: slot_id 重复：${slot.slot_id}`);
  slotIds.add(slot.slot_id);
  if (!slot.needed_evidence) report.errors.push(`entry-policy: 槽位 ${slot.slot_id} 未登记需要的证据`);
  for (const lang of slot.langs ?? []) {
    if (!(LANGUAGES as readonly string[]).includes(lang)) {
      report.errors.push(`entry-policy: 槽位 ${slot.slot_id} 语言非法：${lang}`);
    }
  }
}

const seen = new Set<string>();
const verifiedIds = new Set<string>();
for (const record of records) {
  const id = String(record.id ?? '');
  if (!id) report.errors.push('entry-policy: 记录缺少 id');
  if (seen.has(id)) report.errors.push(`entry-policy: 记录 id 重复：${id}`);
  seen.add(id);
  if (!slotIds.has(id)) report.errors.push(`entry-policy: 记录 ${id} 没有对应 required_records 槽位`);

  const status = String(record.status ?? '');
  if (!(file.status_values ?? []).includes(status)) {
    report.errors.push(`entry-policy: 记录 ${id} status 非法：${status || '(空)'}`);
  }
  if (status !== 'verified') continue;

  const missing = requiredFields.filter((field) => !hasValue(pick(record, field)));
  if (missing.length > 0) report.errors.push(`entry-policy: 记录 ${id} 标记 verified 但字段缺失：${missing.join(', ')}`);

  const sources = Array.isArray(record.official_source) ? (record.official_source as unknown[]) : [];
  if (sources.length === 0) report.errors.push(`entry-policy: 记录 ${id} 没有官方来源`);
  for (const source of sources) {
    const url = (source as { url?: string })?.url;
    if (!url || !/^https:\/\//.test(url)) report.errors.push(`entry-policy: 记录 ${id} 来源 URL 非法：${String(url)}`);
  }
  if (!isFresh(record.last_verified, WINDOW_DAYS)) {
    report.errors.push(
      `entry-policy: 记录 ${id} 已超过 ${WINDOW_DAYS} 天复核窗口，须停止作为已核实结论展示（复核：${String(record.last_verified)}）`,
    );
  }
  if (!record.review_owner) report.errors.push(`entry-policy: 记录 ${id} 缺少复核责任人`);
  verifiedIds.add(id);
}

if (verifiedIds.size > 0 && !file.review_cycle?.owner) {
  report.warnings.push('entry-policy: 已有 verified 记录，但 review_cycle.owner 未指派（P0 第 12 项）');
}

// 页面引用检查
const pages = loadRawPages();
let referenced = 0;
for (const page of pages) {
  const slotsOnPage = Array.isArray(page.data.nationality_slots) ? (page.data.nationality_slots as string[]) : [];
  const bodySlots = [...page.body.matchAll(/nationalitySlots=\{\[([^\]]*)\]\}/g)].flatMap((m) =>
    m[1]
      .split(',')
      .map((item) => item.trim().replace(/^['"]|['"]$/g, ''))
      .filter(Boolean),
  );
  const used = [...new Set([...slotsOnPage, ...bodySlots])];
  if (used.length === 0) continue;
  referenced += used.length;
  const live = page.data.status === 'published' || page.data.status === 'approved';

  for (const slot of used) {
    if (!slotIds.has(slot)) report.errors.push(`${page.file} 引用了不存在的政策槽位：${slot}`);
    if (live && !verifiedIds.has(slot)) {
      report.errors.push(`${page.file} 状态为 ${String(page.data.status)}，但槽位 ${slot} 没有 verified 且在复核期内的记录`);
    }
  }
  if (live && records.length === 0) {
    report.errors.push(`${page.file} 为上线状态，但 entry-policy 没有任何记录（政策页禁止无来源发布）`);
  }
}

console.log(
  `入境政策：记录 ${records.length} 条（verified ${verifiedIds.size}）、槽位 ${slotIds.size} 个、页面引用 ${referenced} 次`,
);
finish(report, 'validate-entry-policy');

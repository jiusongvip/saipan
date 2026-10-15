import { LANGUAGES } from '../src/lib/page-rules';
import { createReport, finish, loadManifest, loadRawPages, type Report } from './lib/pages';
import { flatten, hasValue, isFresh, readData } from './lib/data';

/**
 * 结构化事实文件校验（开发文档 5.1、5.2、8.1 第 6、7 项）。
 * 原则：未 verified 的事实不得带有值；已 verified 的事实必须字段齐全、有来源、在复核期内；
 * 页面引用与数据文件必须互相对应，禁止"页面写了、数据没有"的口头事实。
 */

const FLIGHT_WINDOW_DAYS = 31;
const DOCTOR_WINDOW_DAYS = 180;
const report: Report = createReport();

const site = readData<Record<string, any>>('site-config');
const flights = readData<Record<string, any>>('flight-routes');
const channels = readData<Record<string, any>>('contact-channels');
const doctors = readData<Record<string, any>>('doctors');
const programs = readData<Record<string, any>>('programs');
const manifest = loadManifest();
const pages = loadRawPages();

/* ---------- site-config ---------- */
if (site.primary_domain?.value !== 'saipanivf.org') {
  report.errors.push(`site-config: 主域必须是 saipanivf.org，当前为 ${String(site.primary_domain?.value)}`);
}
if (site.primary_domain?.status !== 'approved') {
  report.errors.push('site-config: 主域 status 必须为 approved，否则整站不得发布');
}
const forbidden: string[] = (site.forbidden_domains ?? []).map((entry: { value: string }) => entry.value);
if (!forbidden.includes('sivf-asia.com')) {
  report.warnings.push('site-config: forbidden_domains 未登记 sivf-asia.com 的处置状态');
}
const langCodes = (site.languages ?? []).map((entry: { code: string }) => entry.code);
for (const code of langCodes) {
  if (!(LANGUAGES as readonly string[]).includes(code)) report.errors.push(`site-config: 语言代码非法：${code}`);
}
for (const missing of LANGUAGES) {
  if (!langCodes.includes(missing)) report.errors.push(`site-config: 缺少语言配置 ${missing}`);
}
const enabledCodes = (site.languages ?? [])
  .filter((entry: { enabled: boolean }) => entry.enabled === true)
  .map((entry: { code: string }) => entry.code);
for (const key of ['default_language', 'x_default_target']) {
  if (!enabledCodes.includes(site[key])) report.errors.push(`site-config: ${key}=${String(site[key])} 必须是已启用语言`);
}
let quotaTotal = 0;
for (const entry of site.languages ?? []) {
  quotaTotal += Number(entry.page_count_quota ?? 0);
  const count = manifest.filter((row) => row.lang === entry.code).length;
  if (count > Number(entry.page_count_quota ?? 0)) {
    report.errors.push(`site-config: ${entry.code} 清单页数 ${count} 超出首版配额 ${entry.page_count_quota}`);
  }
  if (!entry.enabled && count > 0) {
    report.warnings.push(
      `site-config: ${entry.code} 尚未启用（P3 前置条件），但清单已有 ${count} 行；构建层已排除，不生成页面`,
    );
  }
}
if (quotaTotal !== manifest.length) {
  report.errors.push(`site-config: 五语配额合计 ${quotaTotal}，与清单 ${manifest.length} 行不一致`);
}
if (site.routing?.trailing_slash !== 'never') report.errors.push('site-config: routing.trailing_slash 必须为 never');
if (site.routing?.auto_redirect_by_ip !== false) report.errors.push('site-config: 不得按 IP 自动跳转语言');
if (site.analytics?.pii_in_events !== false) report.errors.push('site-config: analytics.pii_in_events 必须为 false');
if (site.analytics?.consent_required_before_tracking !== true) {
  report.warnings.push('site-config: 未确认同意机制前不得采集分析（13.3 待决策）');
}
const publishedPages = pages.filter((page) => ['published', 'approved'].includes(String(page.data.status)));
if (site.brand?.official_name_status !== 'verified' || !site.brand?.official_name) {
  if (publishedPages.length > 0) {
    report.errors.push('site-config: 品牌正式名称未经书面确认，不得有任何 approved/published 页面（4.1、7.1）');
  }
  if (site.brand?.wordmark_draft_status !== 'internal_placeholder') {
    report.errors.push('site-config: wordmark_draft 必须标注 internal_placeholder，且只用于预览');
  }
}
for (const key of site.contact?.required_before_production ?? []) {
  if (publishedPages.length > 0 && site.contact?.[`${key}_status`] !== 'verified') {
    report.errors.push(`site-config: 联系方式 ${key} 未 verified，页脚与结构化数据不得上线`);
  }
}

/* ---------- flight-routes ---------- */
const routeSlots = new Set<string>();
for (const slot of flights.required_routes ?? []) {
  if (routeSlots.has(slot.slot_id)) report.errors.push(`flight-routes: slot_id 重复：${slot.slot_id}`);
  routeSlots.add(slot.slot_id);
  if (!slot.needed_evidence) report.errors.push(`flight-routes: ${slot.slot_id} 未登记需要的证据`);
}
const flightRequiredFields = [
  'origin_city',
  'origin_iata',
  'destination_city',
  'destination_iata',
  'airline',
  'flight_numbers',
  'direct',
  'block_time_minutes',
  'schedule_valid_from',
  'schedule_valid_to',
  'source_url',
  'last_verified',
];
const verifiedFlightIds = new Set<string>();
for (const record of flights.records ?? []) {
  if (!routeSlots.has(record.id)) report.errors.push(`flight-routes: 记录 ${record.id} 无对应 required_routes 槽位`);
  if (record.status !== 'verified') {
    const filled = flightRequiredFields.filter((field) => hasValue(record[field]) && field !== 'status');
    if (filled.length > 0 && record.status === 'pending') {
      report.warnings.push(`flight-routes: 记录 ${record.id} 状态 pending 但已有值：${filled.join(', ')}（不得展示）`);
    }
    continue;
  }
  const missing = flightRequiredFields.filter((field) => !hasValue(record[field]));
  if (missing.length > 0) report.errors.push(`flight-routes: 已核实记录 ${record.id} 字段缺失：${missing.join(', ')}`);
  if (!isFresh(record.last_verified, FLIGHT_WINDOW_DAYS)) {
    report.errors.push(`flight-routes: 记录 ${record.id} 超出 ${FLIGHT_WINDOW_DAYS} 天复核期`);
  }
  const validTo = record.schedule_valid_to ? new Date(`${record.schedule_valid_to}T00:00:00Z`).getTime() : 0;
  if (validTo && validTo < Date.now()) report.errors.push(`flight-routes: 记录 ${record.id} 时刻表已过期`);
  if (record.source_url && !/^https:\/\//.test(record.source_url)) {
    report.errors.push(`flight-routes: 记录 ${record.id} 来源 URL 非法`);
  }
  verifiedFlightIds.add(record.id);
}
const cityPages = pages.filter((page) => page.data.template === 'city');
for (const page of cityPages) {
  const slug = String(page.data.path).split('/').pop();
  const slot = (flights.required_routes ?? []).find((entry: { slot_id: string }) => entry.slot_id === `route-${slug}`);
  if (!slot) report.errors.push(`${page.file} 城市页 ${slug} 在 flight-routes 中没有对应航线槽位`);
  if (['published', 'approved'].includes(String(page.data.status)) && slot && !verifiedFlightIds.has(slot.slot_id)) {
    report.errors.push(`${page.file} 城市页已 ${page.data.status}，但航线 ${slot.slot_id} 未 verified`);
  }
}

/* ---------- contact-channels ---------- */
const channelIds = new Set<string>();
for (const record of channels.records ?? []) {
  if (channelIds.has(record.id)) report.errors.push(`contact-channels: id 重复：${record.id}`);
  channelIds.add(record.id);
  if (!(LANGUAGES as readonly string[]).includes(record.lang)) {
    report.errors.push(`contact-channels: ${record.id} 语言非法：${record.lang}`);
  }
  const needs = ['handle_or_url', 'owner_or_queue', 'service_hours', 'timezone'];
  if (record.enabled === true) {
    if (record.verification_status !== 'verified') {
      report.errors.push(`contact-channels: ${record.id} enabled 但未 verified`);
    }
    const missing = needs.filter((field) => !hasValue(record[field]));
    if (missing.length > 0) report.errors.push(`contact-channels: ${record.id} enabled 但字段缺失：${missing.join(', ')}`);
    if (!enabledCodes.includes(record.lang)) {
      report.errors.push(`contact-channels: ${record.id} 属于未启用语言 ${record.lang}，不得 enabled`);
    }
  }
  if (record.audience === 'donor' && record.channel_type !== 'form_channel') {
    report.errors.push(`contact-channels: 供者通道 ${record.id} 必须使用独立表单通道（4.10、6.1）`);
  }
  if (record.response_promise_status === 'committed' && !hasValue(record.service_hours)) {
    report.errors.push(`contact-channels: ${record.id} 承诺响应时限但没有值班时段`);
  }
}

/* ---------- doctors ---------- */
const doctorIds = new Set<string>();
for (const record of doctors.records ?? []) {
  if (doctorIds.has(record.id)) report.errors.push(`doctors: id 重复：${record.id}`);
  doctorIds.add(record.id);
  if (record.status !== 'verified') continue;
  const needs = ['name', 'license_state', 'license_number', 'license_verify_url', 'education', 'clinical_languages'];
  const missing = needs.filter((field) => !hasValue(record[field]));
  if (missing.length > 0) report.errors.push(`doctors: 已核实医生 ${record.id} 字段缺失：${missing.join(', ')}`);
  if (hasValue(record.photo?.path) && !hasValue(record.photo?.asset_license_source)) {
    report.errors.push(`doctors: ${record.id} 有照片但缺少授权来源`);
  }
  if (!isFresh(record.last_verified, DOCTOR_WINDOW_DAYS)) {
    report.warnings.push(`doctors: ${record.id} 资料超过 ${DOCTOR_WINDOW_DAYS} 天未复核`);
  }
  if (hasValue(record.public_cycle_volume?.value) && !hasValue(record.public_cycle_volume?.source_id)) {
    report.errors.push(`doctors: ${record.id} 周期量数据缺少来源（4.9）`);
  }
}
for (const page of pages.filter((entry) => entry.data.template === 'doctor')) {
  const id = page.data.doctor_id;
  if (!id) report.errors.push(`${page.file} 医生页必须声明 doctor_id`);
  else if (!doctorIds.has(String(id))) report.warnings.push(`${page.file} doctor_id=${id} 在 data/doctors.json 中不存在`);
  if (['approved', 'published'].includes(String(page.data.status)) && id && !verifiedDoctorIds().includes(String(id))) {
    report.errors.push(`${page.file} 医生页已 ${page.data.status}，但 ${id} 未 verified（4.6 禁止虚构履历）`);
  }
}
function verifiedDoctorIds(): string[] {
  return (doctors.records ?? []).filter((r: Record<string, any>) => r.status === 'verified').map((r: Record<string, any>) => String(r.id));
}

/* ---------- programs ---------- */
const programSlugs = new Set<string>();
for (const record of programs.records ?? []) {
  if (programSlugs.has(record.slug)) report.errors.push(`programs: slug 重复：${record.slug}`);
  programSlugs.add(record.slug);
  const facts = ['suitability', 'exclusions', 'process', 'stay_days', 'visit_count', 'risks', 'price_range'];
  const filled = facts.filter((field) => hasValue(record[field]));
  const approved = record.medical_review_status === 'approved' && record.institution_fact_status === 'verified';
  if (filled.length > 0 && !approved) {
    report.errors.push(`programs: ${record.slug} 已有临床/价格值（${filled.join(', ')}）但审核状态未完成——禁止未经核准的医疗事实`);
  }
  if (approved && filled.length === 0) {
    report.warnings.push(`programs: ${record.slug} 审核通过但内容为空`);
  }
  if (hasValue(record.price_range)) {
    if (!hasValue(record.price_currency) || !hasValue(record.price_last_verified)) {
      report.errors.push(`programs: ${record.slug} 有价格但缺少币种或核对日期（4.8）`);
    }
    if (!hasValue(record.fact_source_ids)) report.errors.push(`programs: ${record.slug} 价格缺少来源`);
  }
  const manifestRows = manifest.filter((row) => row.template === 'program' && row.path.endsWith(`/${record.slug}`));
  if (manifestRows.length === 0) report.errors.push(`programs: ${record.slug} 在清单中没有对应方案页路径`);
}
for (const page of pages.filter((entry) => entry.data.template === 'program')) {
  const slug = String(page.data.path).split('/').pop();
  if (!programSlugs.has(String(slug))) report.errors.push(`${page.file} 方案页 slug ${slug} 不在 data/programs.json 中`);
  if (page.data.program_slug && page.data.program_slug !== slug) {
    report.errors.push(`${page.file} program_slug=${page.data.program_slug} 与路径 ${slug} 不一致`);
  }
}

/* ---------- 全站：禁用域名 ---------- */
// site-config 的 forbidden_domains 段落本身就是禁用声明，扫描时排除，否则会自报。
const { forbidden_domains: _omit, ...siteWithoutBanList } = site;
for (const [name, content] of Object.entries({ site: siteWithoutBanList, flights, channels, doctors, programs })) {
  const dump = flatten(content);
  for (const domain of forbidden) {
    if (domain === 'saipan-ivf.com') continue; // 旧域仅允许出现在 redirect-map（7.3）
    if (dump.includes(domain)) report.errors.push(`data/${name}.json 引用了禁用域名 ${domain}`);
  }
}

console.log(
  `事实文件：航线 verified ${verifiedFlightIds.size} 条、渠道 ${channelIds.size} 个、医生 ${doctorIds.size} 位、方案 ${programSlugs.size} 类；上线候选页 ${publishedPages.length} 个`,
);
finish(report, 'validate-data');

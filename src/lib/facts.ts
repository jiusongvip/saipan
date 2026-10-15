import contactChannels from '../../data/contact-channels.json';
import doctors from '../../data/doctors.json';
import entryPolicy from '../../data/entry-policy.json';
import flightRoutes from '../../data/flight-routes.json';
import programs from '../../data/programs.json';
import { siteConfig } from './config';

/**
 * 事实闸门（开发文档 3.2、4.3、4.4、5.1）：
 * 未 verified 或已过复核周期的事实一律不进入渲染；
 * 预览构建可以列出待审条目用于内部评审，但只以“待审核”标记出现，绝不显示猜测值。
 */

export type ReviewStatus = 'pending' | 'verified' | 'expired' | 'blocked';

export interface EntryPolicyRecord {
  id: string;
  /** 记录在 JSON 中的展示名称（如「中国大陆普通护照」）；国籍由 id（nationality-xx）承载。 */
  label: string;
  entry_program?: string | null;
  maximum_stay_days?: number | null;
  authorization?: string | null;
  ticket_requirement?: Record<string, unknown> | null;
  /** 赴美本土与关岛适用性的文字说明（如「VWP 适用美国全境」），非布尔值。 */
  mainland_us_access?: string | null;
  transit_constraints?: string | null;
  alternative_programs?: string | null;
  official_source?: unknown[];
  last_verified?: string | null;
  status: ReviewStatus;
  review_owner?: string | null;
}

const REVIEW_WINDOW_DAYS = 31; // 入境政策月度复核（5.1）

export function isFresh(lastVerified: string | null | undefined, days = REVIEW_WINDOW_DAYS): boolean {
  if (!lastVerified) return false;
  const checked = new Date(`${lastVerified}T00:00:00Z`);
  if (Number.isNaN(checked.getTime())) return false;
  const age = Date.now() - checked.getTime();
  return age >= 0 && age <= days * 86_400_000;
}

export function verifiedEntryPolicies(nationalitySlots: string[]): EntryPolicyRecord[] {
  return (entryPolicy.records as EntryPolicyRecord[]).filter(
    (record) =>
      record.status === 'verified' &&
      isFresh(record.last_verified) &&
      (nationalitySlots.length === 0 || nationalitySlots.includes(record.id)),
  );
}

export function pendingEntryPolicySlots(nationalitySlots: string[]) {
  return (entryPolicy.required_records as { slot_id: string; label_working: string; status: string }[]).filter(
    (slot) => nationalitySlots.length === 0 || nationalitySlots.includes(slot.slot_id),
  );
}

export function verifiedFlightRoutes(citySlotPrefix?: string) {
  return (flightRoutes.records as { status: string; last_verified?: string | null; slot_id?: string }[]).filter(
    (route) => route.status === 'verified' && isFresh(route.last_verified),
  );
}

export function pendingFlightRoutes(originCity: string | null) {
  const records = flightRoutes.required_routes as { slot_id: string; origin_city: string; status: string }[];
  return originCity ? records.filter((route) => route.origin_city === originCity) : records;
}

export interface ChannelRecord {
  id: string;
  lang: string;
  channel_type: string;
  handle_or_url: string | null;
  owner_or_queue: string | null;
  service_hours: string | null;
  timezone: string | null;
  response_promise_status: string;
  enabled: boolean;
  verification_status: string;
  audience?: string;
  note?: string;
}

/** 渠道可用 = enabled + verified + 有实际账号/链接（4.x：不硬编码未经确认的账号，不承诺响应时限）。 */
export function usableChannels(lang: string, audience: 'patient' | 'donor' = 'patient'): ChannelRecord[] {
  return (contactChannels.records as ChannelRecord[]).filter(
    (channel) =>
      channel.lang === lang &&
      channel.enabled === true &&
      channel.verification_status === 'verified' &&
      Boolean(channel.handle_or_url) &&
      (audience === 'patient' ? channel.audience !== 'donor' : channel.audience === 'donor'),
  );
}

export function plannedChannelTypes(lang: string, audience: 'patient' | 'donor' = 'patient') {
  return (contactChannels.records as ChannelRecord[]).filter(
    (channel) =>
      channel.lang === lang && (audience === 'patient' ? channel.audience !== 'donor' : channel.audience === 'donor'),
  );
}

export function verifiedDoctors() {
  return (doctors.records as { status: string; last_verified?: string | null }[]).filter(
    (doctor) => doctor.status === 'verified' && isFresh(doctor.last_verified),
  );
}

export function programBySlug(slug: string) {
  return (programs.records as Record<string, unknown>[]).find((program) => program.slug === slug) ?? null;
}

/**
 * 工具层数据源（对标优化轮）：方案费用与停留天数只能取自院方书面确认的记录。
 * 任一字段缺失或已过复核周期即返回 null，工具组件据此决定整行/整项不渲染。
 */
export interface ProgramFeeRow {
  price_range: string;
  price_currency: string;
  price_last_verified: string;
  price_band_min: number | null;
  price_band_max: number | null;
}

export function programFeeRow(slug: string): ProgramFeeRow | null {
  const record = programBySlug(slug);
  if (!record) return null;
  const { price_range, price_currency, price_last_verified, price_band_min, price_band_max } = record as {
    price_range?: string | null;
    price_currency?: string | null;
    price_last_verified?: string | null;
    price_band_min?: number | null;
    price_band_max?: number | null;
  };
  if (!price_range || !price_currency || !price_last_verified) return null;
  if (!isFresh(price_last_verified)) return null;
  return { price_range, price_currency, price_last_verified, price_band_min: price_band_min ?? null, price_band_max: price_band_max ?? null };
}

export interface ProgramStayOption {
  stay_days: string;
  stay_last_verified: string;
}

export function programStayOption(slug: string): ProgramStayOption | null {
  const record = programBySlug(slug);
  if (!record) return null;
  const { stay_days, stay_last_verified } = record as {
    stay_days?: string | null;
    stay_last_verified?: string | null;
  };
  if (!stay_days || !stay_last_verified) return null;
  if (!isFresh(stay_last_verified)) return null;
  return { stay_days, stay_last_verified };
}

/** 价格、停留天数等只有在来源已核验时才可读；否则返回 null，模板必须改用索取入口而不是猜测值。 */
export function verifiedProgramFact<T>(program: Record<string, unknown> | null, key: string): T | null {
  if (!program) return null;
  const value = program[key];
  if (value === null || value === undefined) return null;
  if (program.medical_review_status !== 'approved' || program.institution_fact_status !== 'verified') return null;
  return value as T;
}

export function businessHours(): string | null {
  const value = (siteConfig.contact as Record<string, unknown>).business_hours;
  return (siteConfig.contact as Record<string, unknown>).business_hours_status === 'verified' && typeof value === 'string'
    ? value
    : null;
}

export function contactFact(key: 'address' | 'phone' | 'email'): string | null {
  const statusKey = key === 'email' ? 'email_status' : `${key}_status`;
  const contact = siteConfig.contact as Record<string, unknown>;
  if (contact[statusKey] !== 'verified') return null;
  const value = contact[key];
  return typeof value === 'string' && value.trim() !== '' ? value : null;
}

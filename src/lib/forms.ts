import type { LangCode } from './config';

/**
 * 表单契约（开发文档 6.1、6.2）。
 * 前端只发送白名单字段；服务端（集团 POST /api/contact）再做一次校验。
 * 接口契约尚未确认：见 docs/decisions/ADR-002-api-contract.md，未配置 PUBLIC_CONTACT_API_URL 时不发起任何请求。
 */

export const PROGRAM_VALUES = [
  'ivf',
  'egg_freezing',
  'donor_egg',
  'donor_sperm',
  'surrogacy',
  'lgbtq',
  'recurrent_failure',
  'unsure',
] as const;

export const TIMELINE_VALUES = ['1m', '3m', '6m', 'researching'] as const;

export const CHANNEL_VALUES = ['line', 'email', 'whatsapp', 'kakaotalk', 'phone'] as const;

export const VISA_VALUES = ['yes', 'no', 'processing'] as const;

export const MAX_LENGTHS: Record<string, number> = {
  salutation: 60,
  contact_account: 160,
  country: 80,
  past_treatment: 400,
  message: 1000,
  preferred_time: 60,
  timezone: 60,
};

export const VISIBLE_FIELDS = [
  'salutation',
  'channel',
  'contact_account',
  'country',
  'age',
  'program',
  'past_treatment',
  'timeline',
  'preferred_time',
  'timezone',
  'message',
  'privacy_consent',
] as const;

export const HIDDEN_FIELDS = [
  'form_variant',
  'lang',
  'page_type',
  'page_path',
  'source_page',
  'cta_label',
  'device_category',
  'referrer_domain',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'visitor_timezone',
  'submitted_at',
] as const;

/** 简体中文额外字段（6.1）；其他语言不出现，避免收集非必要信息。 */
export function extraFieldsForLang(lang: LangCode | string): string[] {
  return lang === 'zh-hans' ? ['us_visa_status'] : [];
}

export function allowedFieldsForLang(lang: LangCode | string): string[] {
  return [...VISIBLE_FIELDS, ...extraFieldsForLang(lang), ...HIDDEN_FIELDS];
}

/** 绝不发送的字段：即便用户误填也不进入 payload 与分析事件（6.2、6.4）。 */
export const NEVER_COLLECTED = ['attachments', 'file', 'chart_number', 'diagnosis', 'medical_record', 'id_number'];

export interface FormContext {
  lang: LangCode;
  pageType: string;
  pagePath: string;
  ctaLabel?: string;
  variant?: 'consultation' | 'donor';
}

/**
 * UTM 只从当前 URL 的 query 白名单键采集（6.1）；纯函数，便于测试。
 * 此前实现从 pagePath 构造的 URL 读取，但 pagePath 只含路径不含 query，UTM 恒为空。
 */
export function utmFromSearch(search: string): Record<string, string> {
  const out: Record<string, string> = {};
  const params = new URLSearchParams(search);
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'] as const) {
    const value = params.get(key);
    if (value) out[key] = value.slice(0, 80);
  }
  return out;
}

export function buildPayload(values: Record<string, string | boolean>, context: FormContext): Record<string, unknown> {
  const allowed = new Set(allowedFieldsForLang(context.lang));
  const payload: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(values)) {
    if (!allowed.has(key) || NEVER_COLLECTED.includes(key)) continue;
    payload[key] = typeof value === 'string' ? value.trim().slice(0, MAX_LENGTHS[key] ?? 200) : value;
  }
  const url = new URL(context.pagePath, 'https://placeholder.local');
  payload.form_variant = context.variant ?? 'consultation';
  payload.lang = context.lang;
  payload.page_type = context.pageType;
  payload.page_path = context.pagePath;
  // 来源页只保留规范化 URL，不带 query（避免泄漏敏感参数）。
  payload.source_page = url.pathname;
  payload.cta_label = (context.ctaLabel ?? '').slice(0, 80);
  payload.device_category = deviceCategory();
  payload.referrer_domain = referrerDomain();
  // UTM 取自访客实际 URL 的 query（6.1）；pagePath 只含路径，SSR 环境无 query 可言。
  const utm = utmFromSearch(typeof window === 'undefined' ? '' : window.location.search);
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'] as const) {
    payload[key] = utm[key] ?? '';
  }
  payload.visitor_timezone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? '';
  payload.submitted_at = new Date().toISOString();
  return payload;
}

function deviceCategory(): string {
  if (typeof window === 'undefined') return 'unknown';
  return window.matchMedia('(max-width: 767px)').matches ? 'mobile' : 'desktop';
}

function referrerDomain(): string {
  if (typeof document === 'undefined' || !document.referrer) return '';
  try {
    return new URL(document.referrer).hostname;
  } catch {
    return '';
  }
}

/** 只允许批准的接口；其他 origin 一律拒绝。 */
export function resolveEndpoint(configured: string | undefined, allowedHosts: string[]): string | null {
  if (!configured) return null;
  try {
    const url = new URL(configured);
    if (url.protocol !== 'https:') return null;
    return allowedHosts.includes(url.hostname) ? url.toString() : null;
  } catch {
    return null;
  }
}

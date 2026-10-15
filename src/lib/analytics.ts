/**
 * GA4 事件（开发文档 6.4、8.1 第 13 项）。
 * - 未同意不加载、不上报（ConsentNotice 负责取得同意）。
 * - 参数只允许语言、页面、CTA、渠道、设备、来源等匿名维度。
 * - 姓名、联系方式、自由文本、诊断、年龄一律拒绝（白名单 + 值类型双重限制）。
 */

export type EventName =
  | 'cta_click'
  | 'form_start'
  | 'form_submit_success'
  | 'form_submit_error'
  | 'messaging_entry_click'
  | 'success_page_view'
  | 'download_itinerary_click'
  | 'download_price_guide_click';

const PARAM_ALLOWLIST = new Set([
  'lang',
  'page_type',
  'page_path',
  'cta_id',
  'channel',
  'campaign_source',
  'utm_source',
  'device_category',
]);

const PII_KEYS = new Set([
  'salutation',
  'name',
  'contact_account',
  'email',
  'phone',
  'message',
  'past_treatment',
  'age',
  'country',
  'diagnosis',
]);

const MAX_VALUE_LENGTH = 120;

type Params = Record<string, string | number | boolean | undefined>;

export function cleanParams(params: Params): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (PII_KEYS.has(key)) continue; // 静默丢弃：绝不外发
    if (!PARAM_ALLOWLIST.has(key)) continue;
    out[key] = typeof value === 'string' ? value.slice(0, MAX_VALUE_LENGTH) : value;
  }
  return out;
}

const CONSENT_KEY = 'sivf.analytics-consent';

export function consentState(): 'granted' | 'denied' | 'unset' {
  if (typeof localStorage === 'undefined') return 'unset';
  const stored = localStorage.getItem(CONSENT_KEY);
  return stored === 'granted' || stored === 'denied' ? stored : 'unset';
}

export function setConsent(state: 'granted' | 'denied'): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(CONSENT_KEY, state);
  if (state === 'granted') loadGa4();
}

/**
 * 页面初始化时调用：若访客此前已点选「允许」，立即加载 GA4。
 * 否则 localStorage 已存 granted 的回访用户永远不会被追踪：
 * 同意横幅只在「未定」状态显示，已同意用户不会再触发 setConsent。
 */
export function initAnalytics(): void {
  if (typeof window === 'undefined') return;
  if (consentState() === 'granted') loadGa4();
}

function loadGa4(): void {
  const id = import.meta.env?.PUBLIC_GA4_MEASUREMENT_ID;
  if (!id || typeof document === 'undefined') return;
  const win = window as unknown as { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };
  if (!win.dataLayer) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    document.head.append(script);
    win.dataLayer = [];
    win.gtag = (...args: unknown[]) => win.dataLayer?.push(args);
    win.gtag('js', new Date());
    win.gtag('config', id, { anonymize_ip: true, send_page_view: true });
  }
}

export function track(event: EventName, params: Params = {}): void {
  if (typeof window === 'undefined') return;
  if (consentState() !== 'granted') return;
  const win = window as unknown as { gtag?: (...args: unknown[]) => void };
  const cleaned = cleanParams(params);
  if (win.gtag) {
    win.gtag('event', event, cleaned);
    return;
  }
  // 分析未启用（未配置 GA4 或尚未同意）时不上报，只保留 DOM 事件供其他脚本使用。
  window.dispatchEvent(new CustomEvent(`sivf:${event}`, { detail: cleaned }));
}

export function trackable(element: HTMLElement): Params {
  const detail = (name: string) => element.dataset[name] ?? undefined;
  return {
    lang: detail('lang'),
    page_type: detail('pageType'),
    page_path: detail('pagePath'),
    cta_id: detail('ctaId'),
    channel: detail('channel'),
    device_category: detail('deviceCategory'),
    campaign_source: detail('campaignSource'),
  };
}

import siteConfigRaw from '../../data/site-config.json';

export type LangCode = 'zh-hant' | 'zh-hans' | 'en' | 'ja' | 'ko';

export interface LanguageConfig {
  code: LangCode;
  hreflang: string;
  enabled: boolean;
  native_label: string;
  page_count_quota: number;
  status: string;
  note?: string;
  blocked_reason?: string;
}

export const siteConfig = siteConfigRaw;

export const allLanguages = siteConfig.languages as LanguageConfig[];

/** 只有 enabled 的语言参与路由、语言切换器与 hreflang（日/韩在 P3 前置条件满足前不生成页面）。 */
export const enabledLanguages = allLanguages.filter((lang) => lang.enabled === true);

export const defaultLanguage = siteConfig.default_language as LangCode;
export const xDefaultTarget = siteConfig.x_default_target as LangCode;

export function isLangCode(value: string): value is LangCode {
  return allLanguages.some((lang) => lang.code === value);
}

export function langConfig(code: string): LanguageConfig | undefined {
  return allLanguages.find((lang) => lang.code === code);
}

/**
 * 预览/生产闸门。开发文档 3.2：draft 与 review 不进入生产 sitemap，也不得被生产页面链接。
 * INCLUDE_DRAFTS=1 只允许用于内部预览构建，禁止指向生产环境。
 * 用 globalThis 读取避免被构建期静态替换。
 */
export const includeDrafts: boolean =
  import.meta.env?.DEV === true ||
  (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env
    ?.INCLUDE_DRAFTS === '1';

export const isProductionBuild: boolean = !includeDrafts;

/**
 * 审阅外壳开关：DRAFT 横幅、逐槽位待核标注、未启用语言说明都属于审阅工具，不是成品文案。
 * 默认关闭，预览与演示均只渲染成品内容；仅 REVIEW=1 显式开启审阅工具。生产构建恒为 false。
 */
export const reviewChrome: boolean =
  includeDrafts &&
  (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.REVIEW ===
    '1';

export type PublishStatus = 'draft' | 'review' | 'approved' | 'published' | 'retired';

/**
 * 生产构建只渲染 published；draft/review/approved 一律只在预览中出现。
 * 开发文档 3.2：approved 仍需通过工程验证才可发布，因此不等同上线，闸门保持保守。
 */
export function rendersInThisBuild(status: PublishStatus): boolean {
  if (status === 'published') return true;
  if (status === 'retired') return false;
  return includeDrafts;
}

/** 只有 published 才算上线页；approved 仍需通过工程验证（3.2）。 */
export function isLivePage(status: PublishStatus): boolean {
  return status === 'published';
}

export function brandWordmark(code: string): string | null {
  const draft = siteConfig.brand.wordmark_draft as Record<string, string>;
  if (siteConfig.brand.official_name) return siteConfig.brand.official_name as string;
  // 正式名称未确认：生产构建不显示任何品牌名（validate-data.ts 会在此情况下拦截发布）。
  if (isProductionBuild) return null;
  return draft[code] ?? draft[defaultLanguage] ?? null;
}

// 首图：public/ 静态路径，构建期不做 sharp 优化（CI 与宿主不引入原生图像依赖，素材离线预处理后直出）；frontmatter hero.image 按同尺寸覆盖。
export const heroImage = { src: '/images/saipan-lagoon-aerial.jpg', width: 640, height: 358 };

export const contactApiUrl: string | undefined = import.meta.env?.PUBLIC_CONTACT_API_URL || undefined;

/**
 * 表单接口 host 白名单（开发文档 6.2）。ADR-002 契约书面确认前为空数组：
 * resolveEndpoint 对任何已配置的接口都返回 null，表���安全降级为「未接入」。
 * 确认后把集团 API host 写入 data/site-config.json 的 contact_api.allowed_hosts。
 */
export const contactApiAllowedHosts: string[] =
  (siteConfig.contact_api?.allowed_hosts as string[] | undefined) ?? [];
export const ga4MeasurementId: string | undefined = import.meta.env?.PUBLIC_GA4_MEASUREMENT_ID || undefined;

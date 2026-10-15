import { isLivePage, siteConfig, xDefaultTarget, type LangCode } from './config';
import type { PageData } from './content';
import type { LanguageConfig } from './config';

const ORIGIN = `https://${siteConfig.primary_domain.value}`;

/** 开发文档 2.3：全站 URL 无尾斜杠（根路径除外），canonical、内链、重定向与 sitemap 同规范。 */
export function normalizePath(path: string): string {
  if (!path || path === '/') return '/';
  return path.replace(/\/+$/, '');
}

export function canonicalUrl(path: string): string {
  return `${ORIGIN}${normalizePath(path) === '/' ? '/' : normalizePath(path)}`;
}

export function isAbsoluteOrExternal(href: string): boolean {
  return /^(https?:|mailto:|tel:|#)/i.test(href);
}

/** OG locale 的规范格式是 语言_地区（OG 协议）；开发文档 7.1 的 OG metadata。 */
const OG_LOCALE: Record<string, string> = {
  'zh-hant': 'zh_TW',
  'zh-hans': 'zh_CN',
  en: 'en_US',
  ja: 'ja_JP',
  ko: 'ko_KR',
};

export function ogLocale(lang: string): string {
  return OG_LOCALE[lang] ?? 'en_US';
}

/** 只有真实存在且已上线的等价页才互相声明 hreflang；缺语言版本不虚构 URL。 */
export function hreflangAlternates(
  self: PageData,
  group: PageData[],
  languages: LanguageConfig[],
): { hreflang: string; href: string; lang: string }[] {
  const live = group.filter((page) => isLivePage(page.status));
  if (!live.some((page) => page.id === self.id)) return [];
  const enabled = new Set(languages.filter((lang) => lang.enabled).map((lang) => lang.code));
  const out: { hreflang: string; href: string; lang: string }[] = live
    .filter((page) => enabled.has(page.lang))
    .map((page) => {
      const meta = languages.find((lang) => lang.code === page.lang)!;
      return { hreflang: meta.hreflang, href: canonicalUrl(page.path), lang: page.lang };
    });
  const xDefaultPage = live.find((page) => page.lang === xDefaultTarget && enabled.has(page.lang));
  if (xDefaultPage) {
    out.push({ hreflang: 'x-default', href: canonicalUrl(xDefaultPage.path), lang: 'x-default' });
  }
  return out;
}

/**
 * 语言切换器目标：对应语言的同一 translation_key 页面；
 * 该语言没有同义页时回退到 homeFor 给出的落点（开发文档 2.3、13.8）。
 * homeFor 返回 null（该语言本次构建一页都没有）时不输出该语言，避免伪造链接。
 */
export function switcherTargets(
  self: Pick<PageData, 'lang' | 'path'>,
  group: PageData[],
  langs: LangCode[],
  homeFor: (lang: LangCode) => string | null = () => null,
): { lang: LangCode; path: string }[] {
  const out: { lang: LangCode; path: string }[] = [];
  for (const lang of langs) {
    const path = group.find((page) => page.lang === lang)?.path ?? homeFor(lang);
    if (path) out.push({ lang, path });
  }
  return out;
}

export interface SeoInput {
  page: PageData;
  alternates: { hreflang: string; href: string }[];
}

export function pageMeta(input: SeoInput) {
  return {
    title: input.page.title,
    description: input.page.description,
    canonical: canonicalUrl(input.page.path),
    ogType: 'website',
    ogUrl: canonicalUrl(input.page.path),
    ogTitle: input.page.title,
    ogDescription: input.page.description,
    ogImage: input.page.og_image ? new URL(input.page.og_image, ORIGIN).toString() : null,
    robots: input.page.noindex ? 'noindex,nofollow' : 'index,follow',
  };
}

/**
 * Organization 结构化数据：只用已核验信息（开发文档 7.1）。
 * 名称、地址、电话、logo 任一缺失时只输出可用字段；没有任何可核验字段时返回 null，不输出 JSON-LD。
 */
export function organizationJsonLd(): Record<string, unknown> | null {
  const name = siteConfig.brand.official_name as string | null;
  if (!name) return null;
  const address = siteConfig.contact.address as string | null;
  const phone = siteConfig.contact.phone as string | null;
  const logo = siteConfig.brand.logo_path as string | null;
  const graph: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'MedicalOrganization',
    name,
    url: ORIGIN,
    ...(address ? { address } : {}),
    ...(phone ? { telephone: phone } : {}),
    ...(logo ? { logo: new URL(logo, ORIGIN).toString() } : {}),
  };
  return graph;
}

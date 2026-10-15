import { canonicalUrl } from './seo';
import type { PageData } from './content';

const MAX_URLS_PER_SITEMAP = 50_000;

function escapeXml(value: string): string {
  return value.replace(/[<>&'"]/g, (char) =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[char] ?? char,
  );
}

/**
 * sitemap 更新频率与优先级（对标优化轮 5，分层策略）：
 * 语言首页 weekly/1.0；文章、科普与方案等业务页 weekly/0.8；
 * 费用、入境、工具等稳定页 monthly/0.7；法律、案例与医生页 monthly/0.6。
 * 映射只按模板类型，不含任何事实数据。
 */
export interface SitemapEntryPolicy {
  changefreq: 'weekly' | 'monthly';
  priority: string;
}

export function sitemapEntryPolicy(template: string): SitemapEntryPolicy {
  if (template === 'home') return { changefreq: 'weekly', priority: '1.0' };
  if (
    template === 'article' ||
    template === 'article_index' ||
    template === 'city' ||
    template === 'program' ||
    template === 'egg_donor_program'
  ) {
    return { changefreq: 'weekly', priority: '0.8' };
  }
  if (
    template === 'why_destination' ||
    template === 'entry_path' ||
    template === 'hospital_lab' ||
    template === 'pricing' ||
    template === 'success_data' ||
    template === 'faq' ||
    template === 'tools'
  ) {
    return { changefreq: 'monthly', priority: '0.7' };
  }
  return { changefreq: 'monthly', priority: '0.6' };
}

/**
 * 入参必须是调用方已过闸门的上线页（livePages）：
 * 本模块只导入类型，不导入 content.ts 的 astro:content，XML 生成才能被 tsx 单元测试直接覆盖。
 */
export function languageSitemap(live: PageData[], lang: string, includeRoot = false): string {
  const rows = live
    .filter((page) => page.lang === lang && !page.noindex)
    .slice(0, MAX_URLS_PER_SITEMAP)
    .map((page) => {
      const policy = sitemapEntryPolicy(page.template);
      return `  <url><loc>${escapeXml(canonicalUrl(page.path))}</loc>${page.last_verified ? `<lastmod>${page.last_verified}</lastmod>` : ''}<changefreq>${policy.changefreq}</changefreq><priority>${policy.priority}</priority></url>`;
    });
  // 根路径是构建出来的语言选择页（不是 MDX 内容页），由默认语言的 sitemap 负责提交，否则它会可索引却不在任何 sitemap 中。
  if (includeRoot) {
    rows.unshift(
      `  <url><loc>${escapeXml(canonicalUrl('/'))}</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>`,
    );
  }
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...rows,
    '</urlset>',
  ].join('\n');
}

export function sitemapIndex(langs: string[]): string {
  const origin = new URL(canonicalUrl('/')).origin;
  const entries = langs
    .map((lang) => `  <sitemap><loc>${origin}/sitemaps/${lang}.xml</loc></sitemap>`)
    .join('\n');
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    entries,
    '</sitemapindex>',
  ].join('\n');
}

/**
 * sitemap index 只列出本次构建有 URL 的语言分片（7.2）：该语言无已上线页时，
 * 其分片是空 urlset，不应被 index 引用。默认语言恒列入：根选择页由它提交。
 */
export function sitemapIndexLanguages(
  live: PageData[],
  enabled: { code: string }[],
  defaultLang: string,
): string[] {
  return enabled
    .filter((lang) => lang.code === defaultLang || live.some((page) => page.lang === lang.code))
    .map((lang) => lang.code);
}

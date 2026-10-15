import { defaultLanguage, enabledLanguages } from '../../lib/config';
import { livePages, loadAllPages } from '../../lib/content';
import { languageSitemap } from '../../lib/sitemap';

export const prerender = true;

export async function getStaticPaths() {
  return enabledLanguages.map((lang) => ({ params: { lang: lang.code } }));
}

/**
 * Astro 5 在端点 GET 里给的 context.props 是空对象（实测），路由参数只在 context.params 上。
 * 之前用 props.lang 取语言，导致 languageSitemap 过滤出 0 条，sitemap 恒为空。
 */
export async function GET(context: {
  params?: Record<string, string | undefined>;
  props?: { lang?: string };
}): Promise<Response> {
  const lang = context.params?.lang ?? context.props?.lang ?? '';
  const pages = await loadAllPages();
  return new Response(languageSitemap(livePages(pages), lang, lang === defaultLanguage), {
    headers: { 'content-type': 'application/xml; charset=utf-8' },
  });
}

import { defaultLanguage, enabledLanguages } from '../lib/config';
import { livePages, loadAllPages } from '../lib/content';
import { sitemapIndex, sitemapIndexLanguages } from '../lib/sitemap';

export const prerender = true;

/** 只收录 published 且允许索引的页面；草稿与 noindex 页不进入（开发文档 7.2、8.1 第 10 项）。 */
export async function GET(): Promise<Response> {
  const langs = sitemapIndexLanguages(livePages(await loadAllPages()), enabledLanguages, defaultLanguage);
  return new Response(sitemapIndex(langs), {
    headers: { 'content-type': 'application/xml; charset=utf-8' },
  });
}

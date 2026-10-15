import type { PageData } from './content';

export type PageView = 'home' | 'destination' | 'pricing' | 'landing' | 'content';
const landingTemplates = new Set([
  'why_destination',
  'city',
  'entry_path',
  'program',
  'pricing',
  'success_data',
  'hospital_lab',
  'doctor',
  'egg_donor_program',
]);

/** Preserve the existing content routes while selecting a reusable Astro layout. */
export function pageView(page: Pick<PageData, 'lang' | 'template' | 'translation_key'>): PageView {
  if (page.template === 'home') return 'home';
  if (
    page.translation_key === 'why_saipan' ||
    (page.lang === 'zh-hans' && page.translation_key === 'article_saipan_vs_us_mainland')
  )
    return 'destination';
  if (
    page.translation_key === 'pricing' ||
    (page.lang === 'zh-hans' && page.translation_key === 'article_price_ranges_and_addon_items')
  )
    return 'pricing';
  return landingTemplates.has(page.template) ? 'landing' : 'content';
}

import { getCollection, render, type CollectionEntry } from 'astro:content';
import { enabledLanguages, isLivePage, rendersInThisBuild, type LangCode } from './config';

export type PageStatus = 'draft' | 'review' | 'approved' | 'published' | 'retired';

export interface PageData {
  id: string;
  lang: LangCode;
  path: string;
  translation_key: string;
  title: string;
  description: string;
  template: string;
  status: PageStatus;
  owner: string;
  reviewed_by: string[];
  reviewed_at: string | null;
  last_verified: string | null;
  valid_until: string | null;
  fact_sources: { id: string; label: string; url: string | null; obtained_at: string | null; verified_by: string | null }[];
  required_sections: string[];
  primary_cta: string;
  secondary_cta: string | null;
  noindex: boolean;
  city: string | null;
  nationality_slots: string[];
  doctor_id: string | null;
  program_slug: string | null;
  blocked_reason: string | null;
  replacement?: string | null;
  og_image: string | null;
  hero?: {
    eyebrow: string | null;
    lede: string | null;
    trust_items: string[];
    image: string | null;
  } | null;
  /** MDX 正文渲染函数；由 layout 调用。 */
  render?: () => Promise<unknown>;
}

/** 生产构建中语言未启用（日/韩）时，其内容一律不参与路由与索引。 */
function langEnabled(lang: string): boolean {
  return enabledLanguages.some((entry) => entry.code === lang);
}

export async function loadAllPages(): Promise<PageData[]> {
  const entries = (await getCollection('page')) as CollectionEntry<'page'>[];
  return entries
    .map((entry) => normalize(entry))
    .sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
}

export function normalize(entry: CollectionEntry<'page'>): PageData {
  const data = entry.data as unknown as PageData;
  return {
    ...data,
    id: entry.id,
    lang: data.lang,
    fact_sources: data.fact_sources ?? [],
    required_sections: data.required_sections ?? [],
    nationality_slots: data.nationality_slots ?? [],
    render: () => render(entry),
  };
}

/** 本次构建可见的页面：已启语言 + 未被闸门排除。 */
export function buildVisible(pages: PageData[]): PageData[] {
  return pages.filter((page) => langEnabled(page.lang) && rendersInThisBuild(page.status));
}

/** 上线页（进入 sitemap、参与 hreflang 互指、可被生产页链接）。 */
export function livePages(pages: PageData[]): PageData[] {
  return pages.filter((page) => langEnabled(page.lang) && isLivePage(page.status));
}

/** 本次构建可见的路径集合：所有内链在渲染前先经它校验，避免造出 404。 */
export function buildVisiblePaths(pages: PageData[]): Set<string> {
  return new Set(buildVisible(pages).map((page) => page.path));
}

/** 本次构建中真的有页面的语言（日/韩未启用、或该语言一页未建时不出现在语言切换器与根选择页）。 */
export function visibleLangCodes(pages: PageData[]): Set<string> {
  return new Set(buildVisible(pages).map((page) => page.lang));
}

/** 该语言在本次构建中的落点：优先语言首页，其次路径序第一个可见页；一页都没有时为 null。 */
export function languageHomeIfBuilt(pages: PageData[], lang: string): string | null {
  const visible = buildVisible(pages).filter((page) => page.lang === lang);
  if (visible.length === 0) return null;
  return (visible.find((page) => page.template === 'home') ?? visible[0]).path;
}

export function pagesByLang(pages: PageData[], lang: string): PageData[] {
  return pages.filter((page) => page.lang === lang);
}

export function pathToRoute(path: string): string {
  return path.replace(/^\//, '') || '/';
}

/** 同一 translation_key 的五语组：只有已上线（本次构建为 live）的等价页才互相声明 hreflang。 */
export function groupByTranslationKey(pages: PageData[]): Map<string, PageData[]> {
  const groups = new Map<string, PageData[]>();
  for (const page of pages) {
    const list = groups.get(page.translation_key) ?? [];
    list.push(page);
    groups.set(page.translation_key, list);
  }
  for (const list of groups.values()) {
    list.sort((a, b) => a.lang.localeCompare(b.lang));
  }
  return groups;
}

/**
 * 主导航：按意图分组、只链接本次构建中真实存在的页面，避免制造 404。
 * 页面清单（content/page-manifest.csv）不含方案总览页，因此「方案」渲染为分组菜单，
 * 直接列出已建好的方案页；新增方案页后自动出现在导航里。
 */
const NAV_SPEC: {
  labelKey: string;
  translationKeys: string[];
  groupTemplate?: string;
  /** 入口页存在、但该语言本次构建没有这类内容页时不输出导航项（科普 hub 无文章时不留空入口）。 */
  requiresTemplate?: string;
  priority: number;
}[] = [
  { labelKey: 'nav.programs', translationKeys: [], groupTemplate: 'program', priority: 10 },
  { labelKey: 'nav.why_saipan', translationKeys: ['why_saipan'], priority: 20 },
  { labelKey: 'nav.entry_path', translationKeys: ['entry_path'], priority: 30 },
  { labelKey: 'nav.pricing', translationKeys: ['pricing'], priority: 40 },
  { labelKey: 'nav.hospital', translationKeys: ['hospital_lab'], priority: 50 },
  { labelKey: 'nav.success_data', translationKeys: ['success_data'], priority: 60 },
  { labelKey: 'nav.articles', translationKeys: ['articles'], requiresTemplate: 'article', priority: 65 },
  { labelKey: 'nav.patient_stories', translationKeys: ['patient_stories'], requiresTemplate: 'patient_story', priority: 68 },
  { labelKey: 'nav.faq', translationKeys: ['faq'], priority: 70 },
  { labelKey: 'nav.tools', translationKeys: ['tools'], priority: 75 },
];

export interface NavItem {
  labelKey: string;
  path: string;
  children?: { label: string; path: string }[];
}

export function navItemsForLang(pages: PageData[], lang: string): NavItem[] {
  const visible = buildVisible(pages);
  const items: NavItem[] = [];
  for (const spec of NAV_SPEC) {
    if (spec.groupTemplate) {
      const children = visible
        .filter((page) => page.lang === lang && page.template === spec.groupTemplate)
        .sort((a, b) => a.path.localeCompare(b.path))
        .map((page) => ({ label: page.title, path: page.path }));
      if (children.length > 0) items.push({ labelKey: spec.labelKey, path: children[0].path, children });
      continue;
    }
    const match = visible
      .filter((page) => page.lang === lang && spec.translationKeys.includes(page.translation_key))
      .sort((a, b) => b.status.localeCompare(a.status))[0];
    if (!match) continue;
    if (
      spec.requiresTemplate &&
      !visible.some((page) => page.lang === lang && page.template === spec.requiresTemplate)
    ) {
      continue;
    }
    items.push({ labelKey: spec.labelKey, path: match.path });
  }
  return items.sort((a, b) => {
    const pa = NAV_SPEC.find((s) => s.labelKey === a.labelKey)?.priority ?? 999;
    const pb = NAV_SPEC.find((s) => s.labelKey === b.labelKey)?.priority ?? 999;
    return pa - pb;
  });
}

/** 本次构建可见的科普文章（路径序）；hub 卡片列表与导航入口共用同一可见性口径，避免空入口。 */
export function visibleArticles(pages: PageData[], lang: string): PageData[] {
  return buildVisible(pages)
    .filter((page) => page.lang === lang && page.template === 'article')
    .sort((a, b) => a.path.localeCompare(b.path));
}

/** 麵包屑與導覽共用同一個短標籤：translation_key 對應到 NAV_SPEC 時用導覽詞，否則退回頁面標題。 */
export function navLabelKeyFor(translationKey: string): string | undefined {
  return NAV_SPEC.find((spec) => spec.translationKeys.includes(translationKey))?.labelKey;
}

/** 面包屑：按路径段回溯到真实存在的父级页面。 */
export function breadcrumbsFor(pages: PageData[], page: PageData): NavItem[] {
  const visible = buildVisible(pages);
  const segments = page.path.split('/').filter(Boolean);
  const trail: NavItem[] = [];
  for (let i = 1; i <= segments.length; i += 1) {
    const candidate = '/' + segments.slice(0, i).join('/');
    const found = visible.find((entry) => entry.lang === page.lang && entry.path === candidate);
    if (found && found.id !== page.id) trail.push({ labelKey: found.translation_key, path: found.path });
  }
  return trail;
}

export const TEMPLATE_PAGE_TYPE: Record<string, string> = {
  home: 'home',
  why_destination: 'destination',
  city: 'city',
  entry_path: 'entry',
  hospital_lab: 'facility',
  doctor: 'doctor',
  program: 'program',
  pricing: 'pricing',
  success_data: 'data',
  legal: 'legal',
  faq: 'faq',
  article: 'article',
  article_index: 'article_index',
  patient_story: 'story',
  egg_donor_program: 'donor',
  contact_success: 'success',
  tools: 'tools',
  generic: 'generic',
};

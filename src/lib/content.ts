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
  requiresTemplate?: string;
  priority: number;
}[] = [
  { labelKey: 'nav.why_saipan', translationKeys: ['why_saipan', 'article_saipan_vs_us_mainland'], priority: 10 },
  { labelKey: 'nav.programs', translationKeys: [], groupTemplate: 'program', priority: 20 },
  { labelKey: 'nav.hospital', translationKeys: ['hospital_lab', 'success_data', 'article_lab_own_or_outsourced', 'article_how_to_read_success_statistics'], priority: 30 },
  { labelKey: 'nav.pricing', translationKeys: ['pricing', 'article_price_ranges_and_addon_items', 'article_translation_and_support_arrangements'], priority: 40 },
  { labelKey: 'nav.travel', translationKeys: ['entry_path', 'article_flights_to_saipan_routes', 'article_stay_itinerary_planning', 'article_documents_before_first_visit', 'tools', 'articles', 'faq'], priority: 50 },
  { labelKey: 'nav.birth_documents', translationKeys: ['legal_parenthood_and_birth_registration', 'article_us_born_baby_advantages'], priority: 60 },
];

const NAV_CHILD_LABELS: Record<string, [string, string, string]> = {
  why_saipan: ['塞班优势', '塞班優勢', 'Why Saipan'],
  article_saipan_vs_us_mainland: ['塞班与美国本土', '塞班與美國本土', 'Saipan vs. mainland U.S.'],
  hospital_lab: ['医院与实验室', '醫院與實驗室', 'Clinic & laboratory'],
  success_data: ['临床数据', '臨床數據', 'Clinical outcomes'],
  article_lab_own_or_outsourced: ['实验室怎么选', '實驗室怎麼選', 'Choosing a laboratory'],
  article_how_to_read_success_statistics: ['成功率怎么看', '成功率怎麼看', 'Understanding success rates'],
  pricing: ['费用与服务', '費用與服務', 'Costs & services'],
  article_price_ranges_and_addon_items: ['费用构成', '費用構成', 'Budget breakdown'],
  article_translation_and_support_arrangements: ['语言与陪同', '語言與陪同', 'Language & support'],
  entry_path: ['入境与签证', '入境與簽證', 'Entry & visas'],
  article_flights_to_saipan_routes: ['航班与转机', '航班與轉機', 'Flights & connections'],
  article_stay_itinerary_planning: ['住宿与停留', '住宿與停留', 'Accommodation & stay'],
  article_documents_before_first_visit: ['就诊材料', '就診材料', 'Before your appointment'],
  tools: ['行前工具', '行前工具', 'Planning tools'],
  articles: ['实用指南', '實用指南', 'Guides'],
  faq: ['常见问题', '常見問題', 'FAQ'],
  article_us_born_baby_advantages: ['宝宝身份与证件', '寶寶身份與證件', 'Birth & citizenship guide'],
  legal_parenthood_and_birth_registration: ['亲权与出生登记', '親權與出生登記', 'Parenthood & registration'],
};

export interface NavItem {
  labelKey: string;
  path: string;
  children?: { label: string; path: string }[];
}

export function navItemsForLang(pages: PageData[], lang: string): NavItem[] {
  const visible = buildVisible(pages).filter(page => page.lang === lang);
  const localeIndex = lang === 'en' ? 2 : lang === 'zh-hant' ? 1 : 0;
  return [...NAV_SPEC].sort((a,b) => a.priority-b.priority).flatMap(spec => {
    const matches = spec.groupTemplate
      ? visible.filter(page => page.template === spec.groupTemplate).sort((a,b)=>a.path.localeCompare(b.path))
      : spec.translationKeys.flatMap(key => visible.filter(page => page.translation_key === key));
    const children = matches
      .filter(page => page.translation_key !== 'articles' || visible.some(p => p.template === 'article'))
      .map(page => ({label: NAV_CHILD_LABELS[page.translation_key]?.[localeIndex] ?? page.title, path:page.path}));
    if (!children.length && spec.labelKey === 'nav.birth_documents') {
      const home = visible.find(page => page.template === 'home');
      if (home) children.push({label: ['宝宝身份与证件', '寶寶身份與證件', 'Birth & document questions'][localeIndex], path: `${home.path}#birth-documents`});
    }
    return children.length ? [{labelKey:spec.labelKey,path:children[0].path,children}] : [];
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

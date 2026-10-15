/**
 * frontmatter 规则的单一来源：src/content.config.ts 与 scripts/validate-content.ts 都调用此处，
 * 避免构建期校验与离线校验各写一套规则（开发文档 8.1 第 3、4、5 项）。
 */

export const LANGUAGES = ['zh-hant', 'zh-hans', 'en', 'ja', 'ko'] as const;

export const TEMPLATES = [
  'home',
  'why_destination',
  'city',
  'entry_path',
  'hospital_lab',
  'doctor',
  'program',
  'pricing',
  'success_data',
  'legal',
  'faq',
  'article',
  'article_index',
  'patient_story',
  'egg_donor_program',
  'contact_success',
  'tools',
  'generic',
] as const;

/** 工具页必须回答的三件事：费用对照、停留试算、工具边界声明。 */
export const TOOLS_REQUIRED_SECTIONS = [
  'fee-comparison',
  'stay-estimator',
  'tool-disclaimer',
] as const;

/**
 * 案例旅程阶段（优化方案 v3 第 1 批第 5 项）：框架先行，内容待授权后按阶段填入。
 * 空阶段整项不输出入口、不写「敬请期待」；阶段名文案见 i18n story.stage.*。
 */
export const STORY_STAGES = [
  { key: 'consult', order: 10 },
  { key: 'travel', order: 20 },
  { key: 'in_treatment', order: 30 },
  { key: 'follow_up', order: 40 },
] as const;

export type StoryStageKey = (typeof STORY_STAGES)[number]['key'];

export interface StoryStageGroup<T> {
  key: StoryStageKey;
  order: number;
  items: T[];
}

/** 案例按阶段分组：空阶段整项被剔除（不输出入口、不写「敬请期待」）。 */
export function groupStoryStages<T extends { stage: string }>(stories: T[]): StoryStageGroup<T>[] {
  return STORY_STAGES.map((stage) => ({
    ...stage,
    items: stories.filter((story) => story.stage === stage.key),
  })).filter((group) => group.items.length > 0);
}

export const STATUSES = ['draft', 'review', 'approved', 'published', 'retired'] as const;

export const CTAS = [
  'assess_program',
  'request_itinerary',
  'request_price_guide',
  'book_consult',
  'contact_us',
  'contact_whatsapp',
  'view_programs',
  'donor_inquiry',
] as const;

/** 开发文档 4.7：方案页必须回答的六个问题。 */
export const PROGRAM_REQUIRED_SECTIONS = [
  'suitability',
  'exclusions',
  'process',
  'stay_duration',
  'risks',
  'price_range',
] as const;

export const FACTUAL_TEMPLATES = ['program', 'pricing', 'success_data', 'doctor', 'hospital_lab'] as const;

export interface RuleIssue {
  field: string;
  message: string;
  level: 'error' | 'warning';
}

export interface PageLike {
  file?: string;
  lang?: unknown;
  path?: unknown;
  translation_key?: unknown;
  title?: unknown;
  description?: unknown;
  template?: unknown;
  status?: unknown;
  reviewed_by?: unknown;
  reviewed_at?: unknown;
  last_verified?: unknown;
  valid_until?: unknown;
  fact_sources?: unknown;
  required_sections?: unknown;
  primary_cta?: unknown;
  secondary_cta?: unknown;
  noindex?: unknown;
  hero?: unknown;
  [key: string]: unknown;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

/** 结构性检查：必填字段、枚举、类型（开发文档 3.1）。 */
export function checkPageStructure(page: PageLike): RuleIssue[] {
  const issues: RuleIssue[] = [];
  const push = (field: string, message: string, level: RuleIssue['level'] = 'error') =>
    issues.push({ field, message, level });

  if (typeof page.lang !== 'string') push('lang', '缺少 lang');
  else if (!(LANGUAGES as readonly string[]).includes(page.lang)) push('lang', `lang 非法：${page.lang}`);

  if (typeof page.path !== 'string') push('path', '缺少 path');
  if (typeof page.translation_key !== 'string' || !page.translation_key) push('translation_key', '缺少 translation_key');
  if (typeof page.title !== 'string' || !page.title.trim()) push('title', '缺少 title');
  if (typeof page.description !== 'string' || !page.description.trim()) push('description', '缺少 description');

  if (typeof page.template !== 'string') push('template', '缺少 template');
  else if (!(TEMPLATES as readonly string[]).includes(page.template)) push('template', `template 非法：${page.template}`);

  if (page.status !== undefined) {
    if (typeof page.status !== 'string' || !(STATUSES as readonly string[]).includes(page.status)) {
      push('status', `status 非法：${String(page.status)}`);
    }
  }
  if (page.reviewed_by !== undefined && !isStringArray(page.reviewed_by)) push('reviewed_by', 'reviewed_by 必须是字符串数组');
  if (page.reviewed_at !== undefined && page.reviewed_at !== null && typeof page.reviewed_at !== 'string') {
    push('reviewed_at', 'reviewed_at 必须是日期字符串或 null');
  }
  if (page.last_verified !== undefined && page.last_verified !== null && typeof page.last_verified !== 'string') {
    push('last_verified', 'last_verified 必须是日期字符串或 null');
  }
  if (page.valid_until !== undefined && page.valid_until !== null && typeof page.valid_until !== 'string') {
    push('valid_until', 'valid_until 必须是日期字符串或 null');
  }
  if (page.fact_sources !== undefined) {
    if (!Array.isArray(page.fact_sources)) push('fact_sources', 'fact_sources 必须是数组');
    else {
      page.fact_sources.forEach((source, index) => {
        const item = source as { id?: unknown; label?: unknown };
        if (typeof item?.id !== 'string' || typeof item?.label !== 'string') {
          push(`fact_sources[${index}]`, '每个事实来源必须有 id 与 label');
        }
      });
    }
  }
  if (page.required_sections !== undefined && !isStringArray(page.required_sections)) {
    push('required_sections', 'required_sections 必须是字符串数组');
  }
  if (typeof page.primary_cta !== 'string') push('primary_cta', '缺少 primary_cta');
  else if (!(CTAS as readonly string[]).includes(page.primary_cta)) push('primary_cta', `primary_cta 非法：${page.primary_cta}`);
  if (page.secondary_cta !== undefined && page.secondary_cta !== null) {
    if (typeof page.secondary_cta !== 'string' || !(CTAS as readonly string[]).includes(page.secondary_cta)) {
      push('secondary_cta', `secondary_cta 非法：${String(page.secondary_cta)}`);
    }
  }
  if (page.noindex !== undefined && typeof page.noindex !== 'boolean') push('noindex', 'noindex 必须是布尔值');

  return issues;
}

/** 业务规则（开发文档 2.3、3.2、4.7、8.1）。 */
export function checkPageRules(page: PageLike): RuleIssue[] {
  const issues: RuleIssue[] = [];
  const push = (field: string, message: string, level: RuleIssue['level'] = 'error') =>
    issues.push({ field, message, level });

  const lang = typeof page.lang === 'string' ? page.lang : '';
  const path = typeof page.path === 'string' ? page.path : '';
  const status = typeof page.status === 'string' ? page.status : 'draft';
  const template = typeof page.template === 'string' ? page.template : '';
  const sections = isStringArray(page.required_sections) ? page.required_sections : [];
  const sources = Array.isArray(page.fact_sources) ? page.fact_sources : [];

  if (path && path !== `/${lang}` && path.endsWith('/')) push('path', `path 不得带尾斜杠：${path}`);
  if (path && lang && !path.startsWith(`/${lang}`)) push('path', `path 必须以 /${lang} 开头：${path}`);
  if (path && lang && path === `/${lang}` && template !== 'home') {
    push('template', `语言首页必须使用 home 模板：${path}`);
  }
  if (template === 'home' && path !== `/${lang}`) push('path', `home 页路径必须是 /${lang}：${path}`);

  if (page.secondary_cta !== null && page.secondary_cta === page.primary_cta) {
    push('secondary_cta', '同一页的主 CTA 与次级 CTA 不得重复');
  }

  if (template === 'program') {
    const missing = PROGRAM_REQUIRED_SECTIONS.filter((key) => !sections.includes(key));
    if (missing.length > 0) push('required_sections', `方案页缺少必填要素：${missing.join(', ')}`);
  }
  if (template === 'tools') {
    const missing = TOOLS_REQUIRED_SECTIONS.filter((key) => !sections.includes(key));
    if (missing.length > 0) push('required_sections', `工具页缺少必填要素：${missing.join(', ')}`);
  }
  if (template === 'legal') {
    if (sections.length === 0) push('required_sections', '法律页必须声明本页要素清单（4.10）', 'warning');
  }
  if (template === 'contact_success' && page.noindex === false) {
    push('noindex', '提交成功页必须保持 noindex，不得进入索引');
  }

  if (status === 'published') {
    if (page.noindex === true) push('noindex', 'published 页不得 noindex');
    if (sources.length === 0) push('fact_sources', 'published 页必须至少有一个事实来源条目');
    if (!isStringArray(page.reviewed_by) || page.reviewed_by.length === 0) push('reviewed_by', 'published 页必须有审核人');
    if (!page.reviewed_at) push('reviewed_at', 'published 页必须有审核日期');
    if (!page.last_verified && (template === 'legal' || template === 'entry_path' || template === 'city')) {
      push('last_verified', 'published 的政策/法律/城市页必须有 last_verified');
    }
    if (template === 'entry_path' && !Array.isArray(page.nationality_slots)) {
      push('nationality_slots', 'published 入境页必须声明 nationality_slots');
    }
  }
  if ((template === 'legal' || template === 'entry_path') && status !== 'draft' && !page.last_verified) {
    push('last_verified', '法律/入境页离开草稿前必须有 last_verified 与复核责任人');
  }
  if ((FACTUAL_TEMPLATES as readonly string[]).includes(template) && status === 'published' && sources.length === 0) {
    push('fact_sources', `事实型页面（${template}）发布前必须登记来源`);
  }
  if (status === 'approved' && sources.length === 0) {
    push('fact_sources', 'approved 页必须已有事实来源，否则退回 draft');
  }
  if (status === 'retired' && !page.blocked_reason && !page.replacement) {
    push('status', 'retired 页应记录替代页或原因（3.2 禁止静默删除）', 'warning');
  }

  // 时效性声明（对标优化轮 6）：valid_until 必须依附于已核对日期，过期只告警不阻断。
  const validUntil = typeof page.valid_until === 'string' ? page.valid_until : '';
  if (validUntil) {
    if (!page.last_verified) {
      push('valid_until', '声明有效期（valid_until）的页面必须同时有 last_verified', 'warning');
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(validUntil)) {
      push('valid_until', 'valid_until 应为 YYYY-MM-DD 日期字符串', 'warning');
    } else if (new Date(`${validUntil}T00:00:00Z`).getTime() < Date.now()) {
      push('valid_until', `valid_until 已过期（${validUntil}），建议复核后再展示`, 'warning');
    }
  }

  return issues;
}

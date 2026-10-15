import assert from 'node:assert/strict';
import { test } from 'node:test';
import { canonicalUrl, hreflangAlternates, normalizePath, ogLocale, organizationJsonLd, switcherTargets } from '../../src/lib/seo';
import { languageSitemap, sitemapEntryPolicy, sitemapIndexLanguages } from '../../src/lib/sitemap';
import { isLivePage, rendersInThisBuild } from '../../src/lib/config';
import type { PageData } from '../../src/lib/content';

const langs = [
  { code: 'zh-hant', hreflang: 'zh-Hant', enabled: true },
  { code: 'zh-hans', hreflang: 'zh-Hans', enabled: true },
  { code: 'en', hreflang: 'en', enabled: true },
  { code: 'ja', hreflang: 'ja', enabled: false },
] as unknown as import('../../src/lib/config').LanguageConfig[];

function page(overrides: Partial<PageData>): PageData {
  return {
    id: overrides.path ?? '/zh-hant',
    lang: 'zh-hant',
    path: '/zh-hant',
    translation_key: 'home',
    title: 't',
    description: 'd',
    template: 'home',
    status: 'published',
    owner: 'content-team',
    reviewed_by: [],
    reviewed_at: null,
    last_verified: null,
    fact_sources: [],
    required_sections: [],
    primary_cta: 'assess_program',
    secondary_cta: null,
    noindex: false,
    city: null,
    nationality_slots: [],
    doctor_id: null,
    program_slug: null,
    blocked_reason: null,
    og_image: null,
    ...overrides,
  } as PageData;
}

test('URL 规范化：无尾斜杠，根路径保留', () => {
  assert.equal(normalizePath('/zh-hant/pricing/'), '/zh-hant/pricing');
  assert.equal(normalizePath('/'), '/');
  assert.equal(normalizePath(''), '/');
  assert.equal(canonicalUrl('/zh-hant/why-saipan/'), 'https://saipanivf.org/zh-hant/why-saipan');
  assert.equal(canonicalUrl('/'), 'https://saipanivf.org/');
});

test('hreflang 只互指已上线且语言启用的等价页（2.3）', () => {
  const group = [
    page({ lang: 'zh-hant', path: '/zh-hant', status: 'published' }),
    page({ lang: 'zh-hans', path: '/zh-hans', status: 'published' }),
    page({ lang: 'en', path: '/en', status: 'published' }),
    page({ lang: 'ja', path: '/ja', status: 'published' }),
  ];
  const self = group[0];
  const out = hreflangAlternates(self, group, langs);
  assert.deepEqual(
    out.map((entry) => entry.hreflang),
    ['zh-Hant', 'zh-Hans', 'en', 'x-default'],
  );
  assert.ok(!out.some((entry) => entry.hreflang === 'ja'), '未启用语言不得输出 hreflang');
  assert.equal(out.at(-1)?.href, 'https://saipanivf.org/zh-hant', 'x-default 指向配置的默认语言');
});

test('草稿页不参与 hreflang 互指', () => {
  const draft = page({ lang: 'zh-hant', path: '/zh-hant', status: 'draft', noindex: true });
  assert.deepEqual(hreflangAlternates(draft, [draft], langs), []);
});

test('语言切换器缺译文时回退到该语言真实存在的首页；该语言一页未建则不输出', () => {
  const self = page({ lang: 'zh-hant', path: '/zh-hant/faq', translation_key: 'faq' });
  const enFaq = page({ lang: 'en', path: '/en/faq', translation_key: 'faq', template: 'faq' });
  const homes = [page({ lang: 'zh-hant', path: '/zh-hant' }), page({ lang: 'en', path: '/en' })];
  const homeFor = (lang: string) => homes.find((entry) => entry.lang === lang)?.path ?? null;
  const targets = switcherTargets(self, [self, enFaq], ['zh-hant', 'en', 'ja'], homeFor);
  assert.deepEqual(
    targets.map((entry) => `${entry.lang}:${entry.path}`),
    ['zh-hant:/zh-hant/faq', 'en:/en/faq'],
  );
  assert.ok(!targets.some((entry) => entry.lang === 'ja'), 'ja 没有已构建页面，不得伪造 /ja 链接');

  const noEnHome = switcherTargets(self, [self], ['en'], () => null);
  assert.deepEqual(noEnHome, [], '回退落点不存在时输出空列表');
});

test('发布闸门：只有 published 算上线页，草稿不进入生产构建', () => {
  assert.equal(isLivePage('published'), true);
  assert.equal(isLivePage('approved'), false);
  assert.equal(isLivePage('draft'), false);
  assert.equal(rendersInThisBuild('draft'), false, '生产构建中 draft 不渲染');
  assert.equal(rendersInThisBuild('published'), true);
  assert.equal(rendersInThisBuild('retired'), false);
});

test('结构化数据在品牌正式名称未核准时完全不输出（7.1）', () => {
  assert.equal(organizationJsonLd(), null);
});

test('分语言 sitemap 按 lang 正确分片（回归：端点取不到 lang 时曾整片为空）', () => {
  const live = [
    page({ lang: 'zh-hant', path: '/zh-hant' }),
    page({ lang: 'zh-hant', path: '/zh-hant/pricing', translation_key: 'pricing', template: 'pricing' }),
    page({ lang: 'zh-hans', path: '/zh-hans' }),
    page({ lang: 'zh-hant', path: '/zh-hant/faq', translation_key: 'faq', template: 'faq', noindex: true }),
  ];
  const zh = languageSitemap(live, 'zh-hant');
  assert.ok(zh.includes('<loc>https://saipanivf.org/zh-hant/pricing</loc>'), '已上线页必须进入本语言 sitemap');
  assert.ok(!zh.includes('/zh-hans'), '不得混入其他语言的页面');
  assert.ok(!zh.includes('/zh-hant/faq'), 'noindex 页不得进入 sitemap');
  assert.equal([...zh.matchAll(/<loc>/g)].length, 2);

  const en = languageSitemap(live, 'en');
  assert.equal([...en.matchAll(/<loc>/g)].length, 0, 'en 无上线页时 sitemap 为空');
  const missing = languageSitemap(live, undefined as unknown as string);
  assert.equal([...missing.matchAll(/<loc>/g)].length, 0, '语言参数缺失时不得输出任何页面');
});

test('根选择页只由默认语言的 sitemap 提交一次', () => {
  const live = [page({ lang: 'zh-hant', path: '/zh-hant' })];
  const withRoot = languageSitemap(live, 'zh-hant', true);
  assert.ok(withRoot.includes('<loc>https://saipanivf.org/</loc>'), '默认语言 sitemap 应包含根选择页');
  assert.ok(withRoot.includes('<changefreq>weekly</changefreq>'), '根选择页应为 weekly');
  assert.ok(withRoot.includes('<priority>1.0</priority>'), '根选择页 priority 应为 1.0');
  assert.equal([...withRoot.matchAll(/<loc>/g)].length, 2);
  assert.ok(
    !languageSitemap(live, 'zh-hans', false).includes('<loc>https://saipanivf.org/</loc>'),
    '其他语言不得重复提交根选择页',
  );
});

test('OG locale 使用 语言_地区 规范格式（7.1）', () => {
  assert.equal(ogLocale('zh-hant'), 'zh_TW');
  assert.equal(ogLocale('zh-hans'), 'zh_CN');
  assert.equal(ogLocale('en'), 'en_US');
  assert.equal(ogLocale('ja'), 'ja_JP');
  assert.equal(ogLocale('ko'), 'ko_KR');
  assert.equal(ogLocale('unknown-lang'), 'en_US', '未知语言回退 en_US');
});

test('sitemap index 只列出有 URL 的语言分片；默认语言恒含根页（7.2）', () => {
  const enabled = [{ code: 'zh-hant' }, { code: 'zh-hans' }, { code: 'en' }];
  const onlyHans = [page({ lang: 'zh-hans', path: '/zh-hans' })];
  assert.deepEqual(sitemapIndexLanguages(onlyHans, enabled, 'zh-hant'), ['zh-hant', 'zh-hans']);
  assert.deepEqual(
    sitemapIndexLanguages([], enabled, 'zh-hant'),
    ['zh-hant'],
    '无已上线页时只剩默认语言（根选择页由它提交），空分片不进 index',
  );
});

test('sitemap 条目按模板分层输出 changefreq 与 priority（对标优化轮 5）', () => {
  assert.deepEqual(sitemapEntryPolicy('home'), { changefreq: 'weekly', priority: '1.0' });
  assert.deepEqual(sitemapEntryPolicy('article'), { changefreq: 'weekly', priority: '0.8' });
  assert.deepEqual(sitemapEntryPolicy('article_index'), { changefreq: 'weekly', priority: '0.8' });
  assert.deepEqual(sitemapEntryPolicy('city'), { changefreq: 'weekly', priority: '0.8' });
  assert.deepEqual(sitemapEntryPolicy('program'), { changefreq: 'weekly', priority: '0.8' });
  assert.deepEqual(sitemapEntryPolicy('egg_donor_program'), { changefreq: 'weekly', priority: '0.8' });
  assert.deepEqual(sitemapEntryPolicy('pricing'), { changefreq: 'monthly', priority: '0.7' });
  assert.deepEqual(sitemapEntryPolicy('entry_path'), { changefreq: 'monthly', priority: '0.7' });
  assert.deepEqual(sitemapEntryPolicy('tools'), { changefreq: 'monthly', priority: '0.7' });
  assert.deepEqual(sitemapEntryPolicy('legal'), { changefreq: 'monthly', priority: '0.6' });
  assert.deepEqual(sitemapEntryPolicy('doctor'), { changefreq: 'monthly', priority: '0.6' });
  assert.deepEqual(sitemapEntryPolicy('patient_story'), { changefreq: 'monthly', priority: '0.6' });
  assert.deepEqual(sitemapEntryPolicy('unknown-template'), { changefreq: 'monthly', priority: '0.6' }, '未知模板回退 monthly/0.6');

  const xml = languageSitemap(
    [page({ path: '/zh-hant/pricing', translation_key: 'pricing', template: 'pricing' })],
    'zh-hant',
    true,
  );
  assert.ok(xml.includes('<changefreq>monthly</changefreq>'), '费用页应为 monthly');
  assert.ok(xml.includes('<priority>0.7</priority>'), '费用页 priority 应为 0.7');
  assert.ok(xml.includes('<changefreq>weekly</changefreq>'), '根选择页应为 weekly');
  assert.ok(xml.includes('<priority>1.0</priority>'), '根选择页 priority 应为 1.0');
});

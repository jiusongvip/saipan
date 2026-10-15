import assert from 'node:assert/strict';
import { test } from 'node:test';
import { checkPageRules, checkPageStructure, groupStoryStages, PROGRAM_REQUIRED_SECTIONS, STORY_STAGES, TOOLS_REQUIRED_SECTIONS } from '../../src/lib/page-rules';

const base = {
  lang: 'zh-hant',
  path: '/zh-hant/programs/ivf-icsi',
  translation_key: 'program_ivf_icsi',
  title: '方案',
  description: '说明',
  template: 'program',
  status: 'draft',
  reviewed_by: [],
  reviewed_at: null,
  last_verified: null,
  fact_sources: [],
  required_sections: [...PROGRAM_REQUIRED_SECTIONS],
  primary_cta: 'assess_program',
  secondary_cta: 'request_price_guide',
  noindex: true,
};

const fields = (issues: { field: string }[]) => issues.map((issue) => issue.field);

test('结构检查要求语言、路径、翻译组、模板与主 CTA', () => {
  const issues = checkPageStructure({});
  for (const field of ['lang', 'path', 'translation_key', 'title', 'description', 'template', 'primary_cta']) {
    assert.ok(fields(issues).includes(field), `应报告缺少 ${field}`);
  }
  assert.deepEqual(checkPageStructure(base), []);
});

test('非法枚举值被拒绝', () => {
  assert.ok(fields(checkPageStructure({ ...base, lang: 'zh-tw' })).includes('lang'));
  assert.ok(fields(checkPageStructure({ ...base, template: 'landing' })).includes('template'));
  assert.ok(fields(checkPageStructure({ ...base, status: 'live' })).includes('status'));
  assert.ok(fields(checkPageStructure({ ...base, primary_cta: 'buy_now' })).includes('primary_cta'));
});

test('路径必须以自身语言前缀开头且无尾斜杠', () => {
  assert.ok(fields(checkPageRules({ ...base, path: '/zh-hans/programs/ivf-icsi' })).includes('path'));
  assert.ok(fields(checkPageRules({ ...base, path: '/zh-hant/pricing/' })).includes('path'));
});

test('方案页缺少六问要素时报错（4.7）', () => {
  const issues = checkPageRules({ ...base, required_sections: ['suitability', 'process'] });
  assert.ok(fields(issues).includes('required_sections'));
  assert.match(issues[0].message, /exclusions/);
});

test('主 CTA 与次级 CTA 不得重复', () => {
  assert.ok(
    fields(checkPageRules({ ...base, secondary_cta: 'assess_program' })).includes('secondary_cta'),
  );
});

test('发布闸门：published 必须有来源、审核人、日期且不得 noindex（3.2）', () => {
  const issues = checkPageRules({ ...base, status: 'published' });
  const reported = fields(issues);
  for (const field of ['noindex', 'fact_sources', 'reviewed_by', 'reviewed_at']) {
    assert.ok(reported.includes(field), `应报告 ${field}`);
  }
  const ok = {
    ...base,
    status: 'published',
    noindex: false,
    reviewed_by: ['院方审核人'],
    reviewed_at: '2026-10-01',
    last_verified: '2026-10-01',
    fact_sources: [{ id: 'price-1', label: '院方价格表', url: null }],
  };
  assert.deepEqual(checkPageRules(ok), []);
});

test('approved 但没有事实来源时退回草稿（防止口头核准）', () => {
  assert.ok(fields(checkPageRules({ ...base, status: 'approved' })).includes('fact_sources'));
});

test('法律与入境页离开草稿必须有 last_verified（8.1 第 5 项）', () => {
  assert.ok(
    fields(checkPageRules({ ...base, template: 'legal', path: '/zh-hant/legal/privacy', required_sections: ['a'], status: 'review' })).includes(
      'last_verified',
    ),
  );
});

test('语言首页必须使用 home 模板', () => {
  assert.ok(fields(checkPageRules({ ...base, path: '/zh-hant', template: 'generic' })).includes('template'));
});

test('工具页缺少三要素时报错（对标优化轮：费用对照、停留试算、工具边界）', () => {
  const toolsBase = { ...base, template: 'tools', path: '/zh-hant/tools' };
  const issues = checkPageRules({ ...toolsBase, required_sections: ['fee-comparison'] });
  assert.ok(fields(issues).includes('required_sections'));
  assert.match(issues[0].message, /stay-estimator/);
  const complete = { ...toolsBase, required_sections: [...TOOLS_REQUIRED_SECTIONS] };
  assert.deepEqual(checkPageRules(complete), []);
});

test('valid_until 必须依附 last_verified、为日期格式且未过期（对标优化轮：时效性框架）', () => {
  const fresh = { ...base, valid_until: '2026-12-31', last_verified: '2026-10-01' };
  assert.deepEqual(checkPageRules(fresh), []);
  assert.ok(fields(checkPageRules({ ...base, valid_until: '2026-12-31' })).includes('valid_until'), '无 last_verified 时应告警');
  assert.ok(fields(checkPageRules({ ...base, valid_until: '2026/12/31', last_verified: '2026-10-01' })).includes('valid_until'), '非 YYYY-MM-DD 应告警');
  assert.ok(fields(checkPageRules({ ...base, valid_until: '2000-01-01', last_verified: '2000-01-01' })).includes('valid_until'), '已过期应告警');
  assert.ok(fields(checkPageStructure({ ...base, valid_until: 123 })).includes('valid_until'), '非字符串应报结构错误');
  assert.deepEqual(checkPageStructure({ ...base, valid_until: null }), [], 'valid_until 为 null 合法');
});

test('案例阶段为 4 段且 order 递增（优化方案 v3 第 1 批第 5 项：阶段分组框架先行）', () => {
  assert.equal(STORY_STAGES.length, 4, '默认阶段为 4 段：咨询与评估 → 出发与入境 → 周期进行中 → 返国与随访');
  assert.deepEqual(
    STORY_STAGES.map((s) => s.key),
    ['consult', 'travel', 'in_treatment', 'follow_up'],
  );
  const orders = STORY_STAGES.map((s) => s.order);
  for (let i = 1; i < orders.length; i += 1) {
    assert.ok(orders[i] > orders[i - 1], '阶段 order 必须严格递增以稳定排序');
  }
});

test('空阶段整项不输出：有内容的阶段保留、无内容的阶段被剔除、全空时返回空数组', () => {
  const stories = [
    { title: 'A', path: '/a', stage: 'travel' },
    { title: 'B', path: '/b', stage: 'travel' },
    { title: 'C', path: '/c', stage: 'follow_up' },
  ];
  const grouped = groupStoryStages(stories);
  assert.deepEqual(
    grouped.map((g) => g.key),
    ['travel', 'follow_up'],
    'consult 与 in_treatment 无内容应被剔除，不输出「敬请期待」入口',
  );
  assert.equal(grouped[0].items.length, 2);
  assert.equal(grouped[1].items.length, 1);
  // 顺序仍按 STORY_STAGES 的 order（travel 在 follow_up 之前）
  assert.ok(grouped[0].order < grouped[1].order);
  // 全空时整块不渲染（同源自洽）
  assert.deepEqual(groupStoryStages([]), [], '无任何故事时应返回空数组，组件整块不渲染');
  // 未知阶段不落入任何分组（防止脏数据输出空分组）
  assert.deepEqual(groupStoryStages([{ title: 'X', path: '/x', stage: 'unknown_stage' }]), [], '未知 stage 不应产生分组');
});

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { checkPageRules, checkPageStructure } from '../../src/lib/page-rules';
import { mixedScriptChars, findProhibited } from '../../src/lib/claims';
import { loadManifest, loadRawPages } from '../../scripts/lib/pages';

/**
 * 对仓库真实内容做断言：任何未经核准的事实、混用的字形或清单不一致都会在测试阶段失败，
 * 不依赖是否记得先跑校验脚本。
 */

const pages = loadRawPages();
const manifest = loadManifest();

test('内容页都存在且数量小于清单页数（不为凑页数造页）', () => {
  assert.ok(pages.length > 0, '应有代表页');
  // 开发文档冻结 165 行；科普 hub（zh-hant/zh-hans 各 1 行）、工具层（tools 5 行）与获客文章
  // /{zh-hant,zh-hans}/articles/us-born-baby-advantages 与 flights-to-saipan-routes、amh-low-ovarian-reserve、saipan-vs-us-mainland（各 2 行）均为经批准的清单新增（见 docs/handoff/STATUS.md），故为 180。
  assert.equal(manifest.length, 180, '清单必须冻结为 165 页 + 科普 hub 2 行 + 工具层 5 行 + 获客文章 8 行');
  assert.ok(pages.length < manifest.length, '首版框架阶段不应把所有页面都写完');
});

test('每个 MDX 通过结构校验与业务规则', () => {
  for (const page of pages) {
    const issues = [...checkPageStructure(page.data), ...checkPageRules(page.data)].filter((i) => i.level === 'error');
    assert.deepEqual(issues, [], `${page.file}: ${issues.map((i) => `${i.field} ${i.message}`).join(' | ')}`);
  }
});

test('路径与翻译组唯一，且语言目录与 lang 一致', () => {
  const paths = new Set<string>();
  const keys = new Set<string>();
  for (const page of pages) {
    const path = String(page.data.path);
    const key = `${page.data.lang}:${page.data.translation_key}`;
    assert.ok(!paths.has(path), `路径重复：${path}`);
    assert.ok(!keys.has(key), `翻译组重复：${key}`);
    paths.add(path);
    keys.add(key);
    assert.equal(page.file.split('/')[1], page.data.lang, `${page.file} 目录语言与 frontmatter 不一致`);
  }
});

test('每个 MDX 都在页面清单中登记，且路径与模板一致', () => {
  const index = new Map(manifest.map((row) => [`${row.lang}:${row.translation_key}`, row]));
  for (const page of pages) {
    const row = index.get(`${page.data.lang}:${page.data.translation_key}`);
    assert.ok(row, `${page.file} 未登记在 content/page-manifest.csv`);
    assert.equal(row?.path, page.data.path, `${page.file} 与清单路径不一致`);
    assert.equal(row?.template, page.data.template, `${page.file} 与清单模板不一致`);
    assert.equal(row?.primary_cta, page.data.primary_cta, `${page.file} 与清单主 CTA 不一致`);
  }
});

test('清单标记 blocked 的行绝不出现 approved/published 页面', () => {
  for (const page of pages) {
    const row = manifest.find((entry) => entry.lang === page.data.lang && entry.translation_key === page.data.translation_key);
    if (row?.status === 'blocked') {
      assert.ok(!['approved', 'published'].includes(String(page.data.status)), `${page.file} 事实未取得却已 ${page.data.status}`);
    }
  }
});

test('当前没有任何页面处于 published：生产构建内容为零是预期（3.2）', () => {
  const published = pages.filter((page) => page.data.status === 'published');
  assert.deepEqual(published.map((page) => page.file), [], '院方与法律核准材料到位前不得有 published 页');
});

test('繁体页不混用简化字，简体页不混用繁体字', () => {
  for (const page of pages) {
    const lang = String(page.data.lang);
    if (lang !== 'zh-hant' && lang !== 'zh-hans') continue;
    const chars = mixedScriptChars(page.body, lang);
    assert.deepEqual(chars, [], `${page.file} 混用字形：${chars.join('')}`);
  }
});

test('页面正文没有风险话术', () => {
  for (const page of pages) {
    assert.deepEqual(findProhibited(page.body), [], `${page.file} 含风险话术`);
  }
});

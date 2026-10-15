import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ctaAnchor, ctaHref } from '../../src/lib/cta';

test('CTA 落在本页真实存在的锚点上', () => {
  assert.equal(ctaAnchor('assess_program'), 'consult');
  assert.equal(ctaAnchor('contact_whatsapp'), 'messaging');
  assert.equal(ctaAnchor('view_programs'), null);
  assert.equal(ctaHref({ cta: 'book_consult', hasForm: true, currentPagePath: '/zh-hant', homePath: '/zh-hant' }), '#consult');
  assert.equal(ctaHref({ cta: 'contact_whatsapp', hasForm: true, currentPagePath: '/zh-hant', homePath: '/zh-hant' }), '#messaging');
});

test('本页没有表单时改指该语言首页，而不是留下空锚点', () => {
  assert.equal(
    ctaHref({ cta: 'book_consult', hasForm: false, currentPagePath: '/zh-hant/contact-success', homePath: '/zh-hant' }),
    '/zh-hant#consult',
  );
  assert.equal(ctaHref({ cta: 'view_programs', hasForm: false, currentPagePath: null, homePath: '/zh-hant' }), '/zh-hant');
});

test('生产构建内容未核准（该语言一页都没有）时不渲染任何 CTA', () => {
  // layouts 在无可落点时传 null，CTA 整体不出现。
  assert.equal(ctaHref({ cta: 'book_consult', hasForm: false, currentPagePath: null, homePath: null }), null);
  assert.equal(ctaHref({ cta: 'contact_whatsapp', hasForm: false, currentPagePath: '/zh-hant/contact-success', homePath: null }), null);
  // 页内锚点也不能凭空承诺：没有当前页就没有 #consult。
  assert.equal(ctaHref({ cta: 'book_consult', hasForm: true, currentPagePath: null, homePath: null }), null);
});

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isFresh, pendingEntryPolicySlots, programFeeRow, programStayOption, usableChannels, verifiedDoctors, verifiedEntryPolicies, verifiedFlightRoutes, verifiedProgramFact } from '../../src/lib/facts';
import { findProhibited, mixedScriptChars } from '../../src/lib/claims';
import { t, missingKeys, extraKeys } from '../../src/lib/i18n';

/* ---------- 事实闸门 ---------- */

test('入境政策：当前没有任何 verified 记录，因此不渲染任何结论（5.1）', () => {
  assert.deepEqual(verifiedEntryPolicies([]), []);
  assert.equal(verifiedFlightRoutes().length, 0);
  assert.equal(verifiedDoctors().length, 0);
  assert.ok(pendingEntryPolicySlots([]).length >= 6, '待审槽位应可列出，供内部评审');
});

test('页面引用的政策槽位都必须真实存在', () => {
  const slots = new Set(pendingEntryPolicySlots([]).map((slot) => slot.slot_id));
  for (const id of ['nationality-tw', 'nationality-hk', 'nationality-cn', 'nationality-jp', 'nationality-kr', 'nationality-ph']) {
    assert.ok(slots.has(id), `缺少槽位 ${id}`);
  }
});

test('复核窗口：过期或缺日期的事实一律不可用（4.4、5.1）', () => {
  assert.equal(isFresh(null), false);
  assert.equal(isFresh('not-a-date'), false);
  assert.equal(isFresh('2000-01-01'), false);
  assert.equal(isFresh(new Date().toISOString().slice(0, 10)), true);
  const future = new Date(Date.now() + 40 * 86_400_000).toISOString().slice(0, 10);
  assert.equal(isFresh(future), false, '未来日期不能算已核对');
});

test('客服渠道：账号与值班未确认时没有任何可用渠道（5.2）', () => {
  for (const lang of ['zh-hant', 'zh-hans', 'en', 'ja', 'ko']) {
    assert.deepEqual(usableChannels(lang), [], `${lang} 不应出现未确认的渠道`);
  }
  assert.deepEqual(usableChannels('zh-hant', 'donor'), [], '供者通道同样未启用');
});

test('方案事实：审核状态未完成时读出 null，模板改用索取入口（4.7、4.8）', () => {
  const program = { slug: 'ivf-icsi', price_range: '12,000', medical_review_status: 'pending', institution_fact_status: 'pending' };
  assert.equal(verifiedProgramFact(program, 'price_range'), null);
  const approved = { ...program, medical_review_status: 'approved', institution_fact_status: 'verified' };
  assert.equal(verifiedProgramFact(approved, 'price_range'), '12,000');
  assert.equal(verifiedProgramFact(null, 'price_range'), null);
});

test('工具层数据源：院方未书面确认时费用与停留记录均读出 null（对标优化轮 4）', () => {
  assert.equal(programFeeRow('ivf-icsi'), null, '当前登记全部字段为 null，费用行不得渲染');
  assert.equal(programStayOption('ivf-icsi'), null, '当前登记全部字段为 null，停留项不得渲染');
  assert.equal(programFeeRow('not-a-slug'), null, '不存在的方案不得渲染');
  assert.equal(programStayOption('not-a-slug'), null, '不存在的方案不得渲染');
});

/* ---------- 风险话术与简繁混用 ---------- */

test('承诺式话术被拦截', () => {
  for (const text of ['本院包成功', '成功率 68%', '保证生男孩', '可选性别', '全球领先的实验室', '先进设备', '落地即入籍', '供卵库存充足', '无需签证保证入境']) {
    assert.ok(findProhibited(text).length > 0, `应拦截：${text}`);
  }
});

test('中性框架表述不被误报', () => {
  for (const text of ['費用區間與包含項目', '本頁為首版框架，待院方核准', '風險與併發症說明待院方提供', 'Each program page must answer six questions']) {
    assert.deepEqual(findProhibited(text), [], `不应拦截：${text}`);
  }
});

test('繁体页出现简化字即报混用，简体页出现繁体字给警告', () => {
  assert.equal(mixedScriptChars('臨床上費用與數據', 'zh-hant').length, 0);
  assert.ok(mixedScriptChars('临床费用与数据', 'zh-hant').length > 0);
  assert.ok(mixedScriptChars('临床费用与数据', 'zh-hans').length === 0);
  assert.ok(mixedScriptChars('臨床費用與數據', 'zh-hans').length > 0);
});

/* ---------- UI 字典 ---------- */

test('三种已启用语言的 UI 字典键集合完全一致', () => {
  for (const lang of ['zh-hant', 'zh-hans', 'en']) {
    assert.deepEqual(missingKeys(lang as never), [], `${lang} 缺少键`);
    assert.deepEqual(extraKeys(lang as never), [], `${lang} 多余键`);
  }
});

test('t() 未知键返回键名本身，不静默显示空白', () => {
  assert.equal(t('zh-hant', 'definitely.not.a.key'), 'definitely.not.a.key');
  const label = t('zh-hant', 'cta.assess_program');
  assert.ok(label.length > 0 && label !== 'cta.assess_program', '主 CTA 必须有繁体文案');
});

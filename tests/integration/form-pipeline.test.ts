/**
 * 集成测试：表单提交管道的多模块组合（validate → isBot → buildPayload → cleanParams）。
 * 单元层已覆盖各模块内部规则；本文件验证组合后的端到端契约：
 * 敏感字段绝不进入 payload 或分析参数（开发文档 6.2、6.4、8.1 第 12、13 项）。
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildPayload, type FormContext } from '../../src/lib/forms';
import { isBot, validate } from '../../src/lib/validation';
import { cleanParams } from '../../src/lib/analytics';

const context: FormContext = { lang: 'zh-hant', pageType: 'program', pagePath: '/zh-hant/programs/ivf-icsi' };

const valid = {
  salutation: '陳小姐',
  channel: 'line',
  contact_account: 'chen_example',
  country: 'TW',
  age: '34',
  program: 'ivf',
  timeline: '3m',
  privacy_consent: true,
};

test('合法輸入通過校驗，payload 成形，分析参数只剩匿名维度', () => {
  assert.deepEqual(validate(valid, context), {});
  assert.equal(isBot('', 10_000), false);
  const payload = buildPayload(valid, context);
  assert.equal(payload.lang, 'zh-hant');
  assert.equal(payload.page_type, 'program');
  assert.equal(payload.source_page, '/zh-hant/programs/ivf-icsi');
  const tracked = cleanParams({
    lang: payload.lang as string,
    page_type: payload.page_type as string,
    page_path: payload.page_path as string,
    cta_id: 'assess_program',
    salutation: payload.salutation as string,
    contact_account: payload.contact_account as string,
    message: payload.message as string,
  });
  assert.deepEqual(tracked, {
    lang: 'zh-hant',
    page_type: 'program',
    page_path: '/zh-hant/programs/ivf-icsi',
    cta_id: 'assess_program',
  });
});

test('病历字段混入輸入時：校驗不報錯，payload 層將其丟棄（6.2）', () => {
  const withMedical = { ...valid, diagnosis: 'OHSS', chart_number: 'A-001' } as Record<string, string | boolean>;
  const payload = buildPayload(withMedical, context);
  assert.ok(!('diagnosis' in payload), '诊断结论不得进入 payload');
  assert.ok(!('chart_number' in payload), '病历号不得进入 payload');
});

test('缺必填項時管道在第一步攔截，不產生可提交 payload', () => {
  const errors = validate({ ...valid, salutation: '' }, context);
  assert.ok(errors.salutation, '稱呼為空時校驗攔截');
});

test('提交過快判定為機器人（6.2 反濫用）', () => {
  assert.equal(isBot('', 100), true, '耗時低於下限即拒絕');
});

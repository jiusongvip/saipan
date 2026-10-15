import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  HIDDEN_FIELDS,
  NEVER_COLLECTED,
  VISIBLE_FIELDS,
  allowedFieldsForLang,
  buildPayload,
  extraFieldsForLang,
  resolveEndpoint,
  utmFromSearch,
} from '../../src/lib/forms';
import { MIN_ELAPSED_MS, isBot, requiredFieldsFor, validate } from '../../src/lib/validation';
import { cleanParams } from '../../src/lib/analytics';

const values = {
  salutation: ' 陈小姐 ',
  channel: 'line',
  contact_account: 'chen_example',
  country: 'TW',
  age: '34',
  program: 'ivf',
  past_treatment: '',
  timeline: '3m',
  preferred_time: 'weekday-am',
  timezone: 'Asia/Taipei',
  message: '想了解流程',
  privacy_consent: true,
};

test('可见字段与隐藏字段符合表单契约（6.1）', () => {
  for (const field of ['salutation', 'channel', 'contact_account', 'country', 'age', 'program', 'timeline', 'privacy_consent']) {
    assert.ok(VISIBLE_FIELDS.includes(field as never), `${field} 应为可见字段`);
  }
  for (const field of ['lang', 'page_type', 'source_page', 'utm_source', 'submitted_at']) {
    assert.ok(HIDDEN_FIELDS.includes(field as never), `${field} 应为隐藏字段`);
  }
  assert.ok(!VISIBLE_FIELDS.includes('email' as never) && !VISIBLE_FIELDS.includes('phone' as never));
});

test('只有简体中文出现美国签证字段（6.1）', () => {
  assert.deepEqual(extraFieldsForLang('zh-hans'), ['us_visa_status']);
  assert.deepEqual(extraFieldsForLang('zh-hant'), []);
  assert.deepEqual(extraFieldsForLang('en'), []);
  assert.ok(allowedFieldsForLang('en').includes('salutation'));
  assert.ok(!allowedFieldsForLang('en').includes('us_visa_status'));
});

test('payload 只含白名单字段，敏感与病历字段绝不外发（6.2、6.4）', () => {
  const payload = buildPayload(
    { ...values, chart_number: 'A-001', diagnosis: 'WOHS', attachments: 'x.pdf', unknown_field: 'y' },
    { lang: 'zh-hant', pageType: 'program', pagePath: '/zh-hant/programs/ivf-icsi?token=secret', ctaLabel: 'assess_program' },
  );
  for (const forbidden of NEVER_COLLECTED) assert.ok(!(forbidden in payload), `${forbidden} 不应出现`);
  assert.ok(!('unknown_field' in payload));
  assert.equal(payload.source_page, '/zh-hant/programs/ivf-icsi', '来源页只保留路径，丢弃敏感 query');
  // node 测试环境无 window.location：UTM 为空；真实浏览器取自 location.search（见下条）。
  assert.equal(payload.utm_source, '');
  assert.equal(payload.lang, 'zh-hant');
  assert.equal(payload.page_type, 'program');
  assert.equal(payload.form_variant, 'consultation');
  assert.equal(payload.salutation, '陈小姐', '值应去除首尾空格');
});

test('UTM 只从 URL query 的白名单键采集且限长 80（6.1）', () => {
  const utm = utmFromSearch('?utm_source=google&utm_medium=cpc&utm_campaign=spring&utm_content=nav&utm_term=x&token=secret');
  assert.deepEqual(utm, {
    utm_source: 'google',
    utm_medium: 'cpc',
    utm_campaign: 'spring',
    utm_content: 'nav',
  });
  assert.equal(utmFromSearch('').utm_source, undefined);
  const long = utmFromSearch(`?utm_source=${'x'.repeat(200)}`);
  assert.equal(long.utm_source.length, 80);
});

test('自由文本按长度上限截断', () => {
  const payload = buildPayload({ ...values, message: 'x'.repeat(5000) }, {
    lang: 'en',
    pageType: 'home',
    pagePath: '/en',
  });
  assert.equal(String(payload.message).length, 1000);
});

test('必填项按语言计算，简中多了签证字段（6.1）', () => {
  assert.ok(requiredFieldsFor({ lang: 'zh-hans' }).includes('us_visa_status'));
  assert.ok(!requiredFieldsFor({ lang: 'zh-hant' }).includes('us_visa_status'));
  const errors = validate({ salutation: '', channel: 'line', privacy_consent: false }, { lang: 'en' });
  assert.ok(errors.salutation && errors.contact_account && errors.program && errors.timeline && errors.privacy_consent);
});

test('枚举值之外的意向方案与时间范围被拒绝', () => {
  const errors = validate({ ...values, program: 'gender_selection', timeline: 'yesterday' }, { lang: 'zh-hant' });
  assert.ok(errors.program && errors.timeline);
});

test('蜜罐与提交耗时判定机器人（6.2）', () => {
  assert.equal(isBot('spam', 10_000), true);
  assert.equal(isBot('', MIN_ELAPSED_MS - 1), true);
  assert.equal(isBot('', MIN_ELAPSED_MS + 1), false);
});

test('分析事件丢弃个人信息与自由文本（6.4）', () => {
  const cleaned = cleanParams({
    lang: 'zh-hant',
    page_type: 'program',
    page_path: '/zh-hant/programs/ivf-icsi',
    cta_id: 'assess_program',
    channel: 'line',
    device_category: 'desktop',
    salutation: '陈小姐',
    contact_account: 'chen_example',
    message: '我的诊断是……',
    diagnosis: 'OHSS',
    age: 34,
    email: 'a@b.com',
  });
  assert.deepEqual(cleaned, {
    lang: 'zh-hant',
    page_type: 'program',
    page_path: '/zh-hant/programs/ivf-icsi',
    cta_id: 'assess_program',
    channel: 'line',
    device_category: 'desktop',
  });
});

test('表单接口只允许批准过的 https host（ADR-002 未确认前不发起请求）', () => {
  assert.equal(resolveEndpoint(undefined, ['api.example集团.com']), null);
  assert.equal(resolveEndpoint('http://api.group.local/contact', ['api.group.local']), null);
  assert.equal(resolveEndpoint('https://other.local/contact', ['api.group.local']), null);
  assert.equal(resolveEndpoint('https://api.group.local/contact', ['api.group.local']), 'https://api.group.local/contact');
});

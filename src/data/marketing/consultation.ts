import type { LangCode } from '../../lib/config';

export function getConsultationCopy(lang: LangCode) {
  if (lang === 'en')
    return {
      label: 'Online consultation',
      title: 'Let’s talk about your plans',
      subtitle: 'A clearer next step starts here',
      minimize: 'Minimize consultation',
      hello: 'Hello, and welcome',
      message: 'Thinking about fertility care in Saipan? What would you like to know first?',
      prompt: 'Where would you like to start?',
      topics: ['Treatment options', 'Costs & budget', 'Travel planning'],
      action: 'Tell us what you need',
    };
  if (lang === 'zh-hant')
    return {
      label: '線上諮詢',
      title: '塞班 IVF · 線上諮詢',
      subtitle: '聊方案 · 問費用 · 做規劃',
      minimize: '收起諮詢窗口',
      hello: '您好，歡迎諮詢',
      message: '想去塞班做試管？先聊方案，再看預算。您的問題，從這裡開始。',
      prompt: '您想先了解哪方面？',
      topics: ['治療方案', '費用預算', '出行安排'],
      action: '聊聊您的需求',
    };
  return {
    label: '在线咨询',
    title: '塞班 IVF · 在线咨询',
    subtitle: '聊方案 · 问费用 · 做规划',
    minimize: '收起咨询窗口',
    hello: '您好，欢迎咨询',
    message: '想去塞班做试管？先聊方案，再看预算。您的问题，从这里开始。',
    prompt: '您想先了解哪方面？',
    topics: ['治疗方案', '费用预算', '出行安排'],
    action: '聊聊您的需求',
  };
}

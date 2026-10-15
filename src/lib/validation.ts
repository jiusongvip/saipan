import { MAX_LENGTHS, PROGRAM_VALUES, TIMELINE_VALUES, VISA_VALUES, extraFieldsForLang, type FormContext } from './forms';

/** 客户端校验；服务端必须再校验一次（开发文档 6.2）。错误信息只用 key，由 UI 字典翻译。 */

export const MIN_ELAPSED_MS = 4000;
export const REQUIRED_FIELDS = ['salutation', 'channel', 'contact_account', 'country', 'program', 'timeline', 'privacy_consent'];

export type FieldValues = Record<string, string | boolean>;

export function requiredFieldsFor(context: Pick<FormContext, 'lang'>): string[] {
  return [...REQUIRED_FIELDS, ...extraFieldsForLang(context.lang)];
}

export function validate(values: FieldValues, context: Pick<FormContext, 'lang'>): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of requiredFieldsFor(context)) {
    const value = values[field];
    if (field === 'privacy_consent') {
      if (value !== true) errors[field] = 'form.error_required';
      continue;
    }
    if (typeof value !== 'string' || value.trim() === '') errors[field] = 'form.error_required';
  }
  if (typeof values.program === 'string' && values.program && !PROGRAM_VALUES.includes(values.program as never)) {
    errors.program = 'form.error_required';
  }
  if (typeof values.timeline === 'string' && values.timeline && !TIMELINE_VALUES.includes(values.timeline as never)) {
    errors.timeline = 'form.error_required';
  }
  if (values.us_visa_status && !VISA_VALUES.includes(values.us_visa_status as never)) {
    errors.us_visa_status = 'form.error_required';
  }
  if (values.age !== undefined && values.age !== '') {
    const age = Number(values.age);
    if (!Number.isInteger(age) || age < 18 || age > 75) errors.age = 'form.error_length';
  }
  for (const [field, max] of Object.entries(MAX_LENGTHS)) {
    const value = values[field];
    if (typeof value === 'string' && value.length > max) errors[field] = 'form.error_length';
  }
  return errors;
}

/** 反滥用：蜜罐字段被填 = 机器人；提交过快 = 拒绝。错误提示不暴露内部原因。 */
export function isBot(honeypotValue: string | undefined, elapsedMs: number): boolean {
  return Boolean(honeypotValue && honeypotValue.trim() !== '') || elapsedMs < MIN_ELAPSED_MS;
}

export function sanitizeForLog(): never {
  // 表单内容一律不写日志、不写 sessionStorage、不进分析事件（6.3）。
  throw new Error('form values must never be logged');
}

/**
 * CTA 落点解析（开发文档 4.1、6.1）。纯函数、不引用 astro:content，
 * 这样 tsx 下的单元测试与构建期组件共用同一份规则。
 *
 * 规则：宁可不渲染链接，也不指向本次构建里不存在的页面或空锚点：
 * 生产构建在内容核准前可能一页都没有，此时站内不应留下任何咨询入口。
 */

/** 渠道类 CTA 指向联络方式区块，绝不硬指未确认的账号。 */
const CHANNEL_CTAS = new Set(['contact_us', 'contact_whatsapp']);
/** 浏览类 CTA 只要落到方案入口页，不带页内锚点。 */
const PROGRAMS_CTAS = new Set(['view_programs']);

export interface CtaContext {
  cta: string;
  /** 当前页是否渲染了咨询表单与联络方式区块。 */
  hasForm: boolean;
  /** 当前页路径；根选择页、404 为 null。 */
  currentPagePath?: string | null;
  /** 该语言在本次构建中的落点（首页或第一个已构建页）；一页都没有时为 null。 */
  homePath?: string | null;
}

/** 页内锚点 id，与 ContactForm / MessagingLinks 保持一致。 */
export function ctaAnchor(cta: string): 'consult' | 'messaging' | null {
  if (PROGRAMS_CTAS.has(cta)) return null;
  return CHANNEL_CTAS.has(cta) ? 'messaging' : 'consult';
}

export function ctaHref(ctx: CtaContext): string | null {
  const anchor = ctaAnchor(ctx.cta);
  if (anchor && ctx.hasForm && ctx.currentPagePath) return `#${anchor}`;
  if (!ctx.homePath) return null;
  return anchor ? `${ctx.homePath}#${anchor}` : ctx.homePath;
}

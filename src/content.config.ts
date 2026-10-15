import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { CTAS, LANGUAGES, STATUSES, TEMPLATES, checkPageRules } from './lib/page-rules';

/** 开发文档 3.1 的 frontmatter 模型。可扩字段，但语言、路径、翻译组、审核状态、事实来源、必填要素、最后核对日期不可缺。
 *  枚举与业务规则来自 src/lib/page-rules.ts，与 scripts/validate-content.ts 共用同一份定义。 */

const languages = LANGUAGES;

const templates = TEMPLATES;

const statuses = STATUSES;

const ctas = CTAS;

const factSource = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  url: z.string().nullable().default(null),
  obtained_at: z.string().nullable().default(null),
  verified_by: z.string().nullable().default(null),
});

const page = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './content' }),
  schema: z
    .object({
      lang: z.enum(languages),
      path: z.string().startsWith('/'),
      translation_key: z.string().min(1),
      title: z.string().min(1),
      description: z.string().min(1),
      template: z.enum(templates),
      status: z.enum(statuses).default('draft'),
      owner: z.string().min(1).default('content-team'),
      reviewed_by: z.array(z.string()).default([]),
      reviewed_at: z.string().nullable().default(null),
      last_verified: z.string().nullable().default(null),
      valid_until: z.string().nullable().default(null),
      fact_sources: z.array(factSource).default([]),
      required_sections: z.array(z.string()).default([]),
      primary_cta: z.enum(ctas),
      secondary_cta: z.enum(ctas).nullable().default(null),
      noindex: z.boolean().default(true),
      city: z.string().nullable().default(null),
      nationality_slots: z.array(z.string()).default([]),
      doctor_id: z.string().nullable().default(null),
      program_slug: z.string().nullable().default(null),
      blocked_reason: z.string().nullable().default(null),
      replacement: z.string().nullable().default(null),
      og_image: z.string().nullable().default(null),
      hero: z
        .object({
          eyebrow: z.string().nullable().default(null),
          lede: z.string().nullable().default(null),
          trust_items: z.array(z.string()).default([]),
          image: z.string().nullable().default(null),
        })
        .nullable()
        .default(null),
    })
    .superRefine((data, ctx) => {
      // 规则本体在 src/lib/page-rules.ts（构建期与离线校验共用）；warning 级只由脚本输出，不阻断构建。
      for (const issue of checkPageRules(data)) {
        if (issue.level !== 'error') continue;
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: issue.field.split('.'),
          message: issue.message,
        });
      }
    }),
});

export const collections = { page };

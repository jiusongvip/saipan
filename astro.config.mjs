import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// 站点唯一主域，见 docs/site-config 与开发文档 7.3。
// 变更需记录 ADR（docs/decisions/ADR-001-stack.md）。
export default defineConfig({
  site: 'https://saipanivf.org',
  output: 'static',
  trailingSlash: 'never',
  integrations: [mdx()],
  build: {
    inlineStylesheets: 'auto',
    format: 'directory',
  },
  devToolbar: { enabled: false },
});

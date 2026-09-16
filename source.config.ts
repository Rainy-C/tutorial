import { defineConfig } from 'fumadocs-mdx/config';
import { remarkDirectiveAdmonition, remarkMdxMermaid } from 'fumadocs-core/mdx-plugins';
import rehypeKatex from 'rehype-katex';
import remarkDirective from 'remark-directive';
import remarkMath from 'remark-math';

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [remarkDirective, remarkDirectiveAdmonition, remarkMath, remarkMdxMermaid],
    rehypePlugins: (plugins) => [rehypeKatex, ...plugins],
    rehypeCodeOptions: {
      langAlias: {
        gitignore: 'text',
        dataview: 'text',
      },
    },
  },
});

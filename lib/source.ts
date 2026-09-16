import { loader } from 'fumadocs-core/source';
import { defineDocs } from 'fumadocs-mdx/macro';

const docs = defineDocs({
  dir: 'content/docs',
});

export const source = loader({
  baseUrl: '/',
  source: docs.toFumadocsSource(),
  slugs(file) {
    const normalized = file.path
      .replace(/\\/g, '/')
      .replace(/^\.\//, '')
      .replace(/\.(md|mdx)$/i, '');

    return normalized.split('/').filter(Boolean);
  },
});

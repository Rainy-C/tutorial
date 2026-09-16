import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import type { ComponentProps, ComponentType } from 'react';
import { Mermaid } from '@/components/mdx/mermaid';

const DefaultAnchor = defaultMdxComponents.a as ComponentType<ComponentProps<'a'>>;

function MarkdownAnchor(props: ComponentProps<'a'>) {
  const href = props.href ?? '';
  const isAbsolute =
    !href ||
    href.startsWith('/') ||
    href.startsWith('#') ||
    /^[A-Za-z][A-Za-z\d+.-]*:/.test(href);

  const fixedHref = isAbsolute ? href : `../${href}`;
  return <DefaultAnchor {...props} href={fixedHref} />;
}

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    a: MarkdownAnchor,
    Mermaid,
    ...components,
  } satisfies MDXComponents;
}

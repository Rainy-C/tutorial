import { notFound } from 'next/navigation';
import { DocsBody, DocsPage } from 'fumadocs-ui/layouts/docs/page';
import { source } from '@/lib/source';
import { getMDXComponents } from '@/components/mdx';

export const dynamicParams = false;

export default async function Page({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsBody>
        <MDX components={getMDXComponents()} />
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() {
  const pages = source.getPages();

  if (pages.length !== 152) {
    throw new Error(`Expected 152 documentation pages, found ${pages.length}`);
  }

  return pages.map((page) => ({ slug: page.slugs }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}

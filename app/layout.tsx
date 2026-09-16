import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import 'katex/dist/katex.min.css';
import './global.css';
import { Provider } from '@/components/provider';

export const metadata: Metadata = {
  title: {
    default: '编程教程全集',
    template: '%s · 编程教程全集',
  },
  description: '从编程地基到 Android、系统底层、3D 数学、图形与引擎数据模型的完整教程知识库。',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link rel="icon" href={`${basePath}/favicon.svg`} type="image/svg+xml" />
      </head>
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}

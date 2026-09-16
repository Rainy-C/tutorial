import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: '编程教程全集',
    },
    links: [
      {
        text: '开始学习',
        url: '/00.开始之前/00.开始之前',
      },
      {
        text: '深挖专题',
        url: '/09.深挖专题/00.深挖索引',
      },
      {
        text: '英文词汇',
        url: '/10.英文词汇/00.词频词汇总览',
      }
    ],
    githubUrl: 'https://github.com/Rainy-C/tutorial',
  };
}

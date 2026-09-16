'use client';

import { useEffect, useId, useState } from 'react';
import { useTheme } from 'next-themes';

export function Mermaid({ chart }: { chart: string }) {
  const reactId = useId();
  const { resolvedTheme } = useTheme();
  const [svg, setSvg] = useState('');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const id = `mermaid-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
    const source = chart.replaceAll('\\n', '\n');

    setSvg('');
    setFailed(false);

    void import('mermaid')
      .then(async ({ default: mermaid }) => {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          fontFamily: 'inherit',
          theme: resolvedTheme === 'dark' ? 'dark' : 'default',
        });

        try {
          const result = await mermaid.render(id, source);
          if (!cancelled) setSvg(result.svg);
        } catch (error) {
          console.error('Mermaid render failed:', error);
          if (!cancelled) setFailed(true);
        }
      })
      .catch((error) => {
        console.error('Mermaid loader failed:', error);
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [chart, reactId, resolvedTheme]);

  if (failed) {
    return (
      <div className="my-5 overflow-x-auto rounded-xl border bg-fd-muted/40 p-4" role="note">
        <div className="mb-2 text-xs font-medium text-fd-muted-foreground">Mermaid 图表解析失败，已保留原始定义</div>
        <pre className="m-0 min-w-max bg-transparent p-0 text-xs"><code>{chart}</code></pre>
      </div>
    );
  }

  if (!svg) {
    return <div className="my-5 h-24 animate-pulse rounded-xl border bg-fd-muted/35" aria-label="正在渲染 Mermaid 图表" />;
  }

  return (
    <div
      className="mermaid-diagram my-5 overflow-x-auto rounded-xl border bg-fd-card p-4 [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

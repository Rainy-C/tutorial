const redirectScript = String.raw`
(() => {
  const { pathname, search, hash } = window.location;

  if (!pathname.startsWith('/tutorial/') || pathname.endsWith('/')) return;

  const lastSegment = pathname.slice(pathname.lastIndexOf('/') + 1);
  const assetExtension =
    /\.(?:js|mjs|cjs|css|map|json|xml|txt|webmanifest|png|jpe?g|gif|webp|avif|svg|ico|woff2?|ttf|otf|eot|pdf|zip|gz|br)$/i;

  if (assetExtension.test(lastSegment)) return;

  window.location.replace(pathname + '/' + search + hash);
})();
`;

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: '70vh',
        display: 'grid',
        placeItems: 'center',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <script dangerouslySetInnerHTML={{ __html: redirectScript }} />
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>404</h1>
        <p style={{ marginTop: '0.75rem', opacity: 0.7 }}>
          页面不存在，或旧链接正在尝试自动兼容。
        </p>
      </div>
    </main>
  );
}

import { Link, useOutletContext } from 'react-router-dom';
import { useEffect } from 'react';

export default function NotFound() {
  const { theme } = useOutletContext();
  const isLight = theme === 'light';

  // Tell search engines not to index 404 pages (SPA returns HTTP 200)
  useEffect(() => {
    const meta = document.querySelector('meta[name="robots"]');
    const prev = meta?.getAttribute('content');
    if (meta) meta.setAttribute('content', 'noindex, nofollow');
    return () => { if (meta && prev) meta.setAttribute('content', prev); };
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
      <h1 className="text-7xl font-bold mb-4" style={{ color: isLight ? '#0f172a' : '#f8fafc' }}>404</h1>
      <h2 className="text-xl font-semibold mb-3" style={{ color: isLight ? '#334155' : '#cbd5e1' }}>
        Page Not Found
      </h2>
      <p className="text-sm mb-8 max-w-md" style={{ color: isLight ? '#64748b' : '#94a3b8' }}>
        The page you're looking for doesn't exist or has been moved. Head back to the JSON formatter to get started.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors"
      >
        Go to PrettyJSON
      </Link>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import TopBar from './json/TopBar';

export default function Layout() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('prettyjson_theme');
    if (saved) return saved;
    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  });

  const location = useLocation();

  useEffect(() => {
    localStorage.setItem('prettyjson_theme', theme);
  }, [theme]);

  // Update page title, canonical, meta description and scroll to top on route change
  useEffect(() => {
    const pageMeta = {
      '/': {
        title: 'JSON Formatter Online — Free JSON Validator, Beautifier & Viewer | PrettyJSON',
        description: 'Free online JSON formatter, validator, and beautifier. Paste JSON to format, minify, diff, view as tree, edit, and export to CSV. 100% client-side — your data never leaves your browser.',
      },
      '/json-validator': {
        title: 'JSON Validator Online — Free JSON Lint & Syntax Checker | PrettyJSON',
        description: 'Free online JSON validator and lint checker. Paste JSON to find syntax errors instantly. Auto-repair trailing commas, single quotes, missing brackets, and more. 100% client-side.',
      },
      '/json-beautifier': {
        title: 'JSON Beautifier Online — Free JSON Pretty Printer | PrettyJSON',
        description: 'Free online JSON beautifier and pretty printer. Paste minified JSON to add clean indentation and line breaks. 2-space formatting, instant results. No data sent to servers.',
      },
      '/json-viewer': {
        title: 'JSON Viewer Online — Free JSON Tree Explorer | PrettyJSON',
        description: 'Free online JSON viewer with interactive tree and table views. Explore deeply nested JSON, search keys and values, filter with JSONPath. Works offline in your browser.',
      },
      '/json-diff': {
        title: 'JSON Diff Online — Free JSON Compare Tool | PrettyJSON',
        description: 'Free online JSON diff and compare tool. Paste two JSON documents side by side to see additions, deletions, and changes highlighted. Works with nested objects and arrays.',
      },
      '/json-to-csv': {
        title: 'JSON to CSV Converter Online — Free JSON Export | PrettyJSON',
        description: 'Free online JSON to CSV converter. Convert JSON arrays to spreadsheet-friendly CSV for Excel and Google Sheets. Handles nested objects with dot-notation flattening.',
      },
      '/json-minifier': {
        title: 'JSON Minifier Online — Free JSON Compressor | PrettyJSON',
        description: 'Free online JSON minifier and compressor. Strip whitespace to reduce file size for production. One-click minification with instant results. No data leaves your browser.',
      },
      '/json-editor': {
        title: 'JSON Editor Online — Free Browser-Based JSON Editor | PrettyJSON',
        description: 'Free online JSON editor with syntax highlighting, auto-repair, tree editing, search & replace, and undo/redo. Edit JSON directly in your browser — no installation or sign-up.',
      },
      '/privacy': {
        title: 'Privacy Policy — PrettyJSON',
        description: 'PrettyJSON privacy policy. Learn how we handle your data, cookies, and third-party services like Google AdSense.',
      },
      '/terms': {
        title: 'Terms of Service — PrettyJSON',
        description: 'PrettyJSON terms of service. Read our usage terms, disclaimers, and limitations of liability.',
      },
      '/about': {
        title: 'About — PrettyJSON',
        description: 'Learn about PrettyJSON, a free browser-based JSON formatter built for developers. All processing happens locally in your browser.',
      },
      '/contact': {
        title: 'Contact Us — PrettyJSON',
        description: 'Get in touch with the PrettyJSON team. Reach us for support, feedback, or partnership inquiries.',
      },
      '/help': {
        title: 'Documentation & Help — PrettyJSON',
        description: 'PrettyJSON documentation and help. Guides for formatting, tree view, diff, search, query languages, export, and keyboard shortcuts.',
      },
    };
    const meta = pageMeta[location.pathname] || {
      title: 'JSON Formatter Online — Free JSON Validator & Beautifier | PrettyJSON',
      description: 'Free online JSON formatter, validator, and beautifier. Paste JSON to format, minify, diff, view as tree, edit, and export to CSV.',
    };
    document.title = meta.title;
    const descTag = document.querySelector('meta[name="description"]');
    if (descTag) descTag.setAttribute('content', meta.description);
    const canonical = document.querySelector('link[rel="canonical"]');
    const url = 'https://prettyjson.org' + (location.pathname === '/' ? '/' : location.pathname);
    if (canonical) canonical.setAttribute('href', url);
    // Update OG and Twitter meta tags for social sharing crawlers
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', meta.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', meta.description);
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', url);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', meta.title);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', meta.description);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const isLight = theme === 'light';
  const bg0 = isLight ? '#f8fafc' : '#0f172a';

  return (
    <div className="flex flex-col min-h-screen" style={{ background: bg0, color: isLight ? '#334155' : '#cbd5e1' }} data-theme={theme}>
      <TopBar theme={theme} onThemeToggle={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} />
      
      <main className="flex-1 flex flex-col w-full">
        <Outlet context={{ theme }} />
      </main>

      {/* Shared Footer */}
      <div className="w-full border-t font-sans mt-auto" style={{ background: isLight ? '#ffffff' : '#0f172a', borderColor: isLight ? '#e2e8f0' : '#334155' }}>
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="max-w-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg font-bold" style={{ color: isLight ? '#0f172a' : '#ffffff' }}>PrettyJSON</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: isLight ? '#64748b' : '#94a3b8' }}>
                Free online JSON formatter to prettify, validate, and edit JSON data. Features tree view, table view, diff, and auto-repair.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: isLight ? '#0f172a' : '#f8fafc' }}>Legal & Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/privacy" className="hover:underline text-blue-500">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:underline text-blue-500">Terms of Service</Link></li>
                <li><Link to="/about" className="hover:underline text-blue-500">About PrettyJSON</Link></li>
                <li><Link to="/contact" className="hover:underline text-blue-500">Contact Us</Link></li>
                <li><Link to="/help" className="hover:underline text-blue-500">Documentation & Help</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-6 border-t text-center text-sm" style={{ borderColor: isLight ? '#e2e8f0' : '#334155', color: isLight ? '#64748b' : '#94a3b8' }}>
            <p>&copy; {new Date().getFullYear()} PrettyJSON. All rights reserved.</p>
            <button
              onClick={() => { localStorage.removeItem('prettyjson_cookie_consent'); window.location.reload(); }}
              className="mt-2 text-xs hover:underline cursor-pointer"
              style={{ color: isLight ? '#94a3b8' : '#64748b' }}
            >
              Cookie Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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

  // Update page title and scroll to top on route change
  useEffect(() => {
    const titles = {
      '/': 'PrettyJSON — Online JSON Formatter, Pretty Print & Validator',
      '/privacy': 'Privacy Policy — PrettyJSON',
      '/terms': 'Terms of Service — PrettyJSON',
      '/about': 'About — PrettyJSON',
      '/contact': 'Contact Us — PrettyJSON',
      '/help': 'Documentation & Help — PrettyJSON',
    };
    document.title = titles[location.pathname] || 'PrettyJSON — Online JSON Formatter';
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
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Braces, Sun, Moon, Github } from 'lucide-react';

export default function TopBar({ theme, onThemeToggle }) {
  const isLight = theme === 'light';
  return (
    <header className="flex items-center justify-between px-4 sm:px-6 h-12 sm:h-14 border-b flex-shrink-0"
      style={{ background: isLight ? '#ffffff' : '#080910', borderColor: isLight ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.05)' }}
    >
      <div className="flex items-center gap-3">
        {/* Logo */}
        <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center glow-blue">
          <Braces size={18} className="text-blue-400" />
        </div>
        <div>
          <span className="text-[15px] font-semibold tracking-tight" style={{ color: isLight ? '#0f172a' : '#ffffff' }}>Pretty</span>
          <span className="text-[15px] font-light text-blue-500 tracking-tight ml-0.5">JSON</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onThemeToggle}
          title="Toggle light/dark mode"
          className="w-9 h-9 flex items-center justify-center rounded-lg border transition-all"
          style={{
            background: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.04)',
            borderColor: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.07)',
          }}
        >
          {theme === 'dark'
            ? <Sun size={15} className="text-amber-400" />
            : <Moon size={15} className="text-blue-500" />}
        </button>
      </div>
    </header>
  );
}
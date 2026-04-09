import React from 'react';
import { Braces, Keyboard, Sun, Moon } from 'lucide-react';

export default function TopBar({ theme, onThemeToggle }) {
  const isLight = theme === 'light';
  return (
    <header className="flex items-center justify-between px-6 h-14 border-b flex-shrink-0"
      style={{ background: isLight ? '#ffffff' : '#080910', borderColor: isLight ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.05)' }}
    >
      <div className="flex items-center gap-3">
        {/* Logo */}
        <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center glow-blue">
          <Braces size={16} className="text-blue-400" />
        </div>
        <div>
          <span className="text-[13px] font-semibold tracking-tight" style={{ color: isLight ? '#1e293b' : '#ffffff' }}>JSON</span>
          <span className="text-[13px] font-light text-blue-400 tracking-tight ml-0.5">Forge</span>
        </div>
        <div className="w-px h-5 mx-1" style={{ background: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)' }} />
        <span className="text-[10px] font-mono tracking-[0.15em] uppercase" style={{ color: isLight ? '#94a3b8' : '#475569' }}>Optical Workbench</span>
      </div>

      <div className="flex items-center gap-3">
        {/* Keyboard shortcuts hint */}
        {/* <div className="hidden md:flex items-center gap-1 text-[10px] font-mono" style={{ color: isLight ? '#94a3b8' : '#374151' }}>
          <Keyboard size={10} />
          <span>Tab to indent</span>
          <span className="mx-2 text-slate-800">·</span>
          <span>Ctrl+Shift+F to format</span>
        </div> */}
        <button
          onClick={onThemeToggle}
          title="Toggle light/dark mode"
          className="w-8 h-8 flex items-center justify-center rounded-lg border transition-all"
          style={{
            background: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.04)',
            borderColor: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.07)',
          }}
        >
          {theme === 'dark'
            ? <Sun size={13} className="text-amber-400" />
            : <Moon size={13} className="text-blue-400" />}
        </button>
      </div>
    </header>
  );
}
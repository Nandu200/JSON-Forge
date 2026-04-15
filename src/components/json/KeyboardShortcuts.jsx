import React from 'react';
import { X, Keyboard } from 'lucide-react';

const SHORTCUTS = [
  { keys: ['⌘/Ctrl', 'Shift', 'F'], action: 'Format JSON' },
  { keys: ['⌘/Ctrl', 'M'], action: 'Minify JSON' },
  { keys: ['⌘/Ctrl', 'S'], action: 'Download JSON' },
  { keys: ['⌘/Ctrl', 'Z'], action: 'Undo' },
  { keys: ['⌘/Ctrl', 'Shift', 'Z'], action: 'Redo' },
  { keys: ['⌘/Ctrl', 'D'], action: 'Toggle Diff Mode' },
  { keys: ['⌘/Ctrl', 'K'], action: 'Show/hide shortcuts' },
  { keys: ['Tab'], action: 'Insert indent (in editor)' },
  { keys: ['Enter'], action: 'Next search match' },
  { keys: ['Shift', 'Enter'], action: 'Previous search match' },
];

export default function KeyboardShortcuts({ open, onClose, theme = 'light' }) {
  if (!open) return null;
  const isLight = theme === 'light';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-md rounded-2xl border shadow-2xl panel-enter overflow-hidden"
        style={{
          background: isLight ? '#ffffff' : '#0f172a',
          borderColor: isLight ? '#e2e8f0' : '#334155',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: isLight ? '#e2e8f0' : '#334155' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: isLight ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.15)' }}>
              <Keyboard size={16} className="text-blue-500" />
            </div>
            <div>
              <h2 className="text-[14px] font-semibold" style={{ color: isLight ? '#0f172a' : '#f1f5f9' }}>
                Keyboard Shortcuts
              </h2>
              <p className="text-[11px] font-mono" style={{ color: isLight ? '#94a3b8' : '#64748b' }}>
                Accelerate your workflow
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
            style={{
              background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)',
              color: isLight ? '#64748b' : '#94a3b8',
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Shortcuts list */}
        <div className="px-5 py-3 space-y-0.5 max-h-[400px] overflow-y-auto">
          {SHORTCUTS.map((shortcut, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 px-2 rounded-lg transition-colors"
              style={{
                background: 'transparent',
              }}
              onMouseEnter={e => e.currentTarget.style.background = isLight ? 'rgba(59,130,246,0.04)' : 'rgba(59,130,246,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span className="text-[12px]" style={{ color: isLight ? '#475569' : '#cbd5e1' }}>
                {shortcut.action}
              </span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, j) => (
                  <React.Fragment key={j}>
                    {j > 0 && <span className="text-[10px] mx-0.5" style={{ color: isLight ? '#cbd5e1' : '#475569' }}>+</span>}
                    <kbd
                      className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border"
                      style={{
                        background: isLight ? '#f8fafc' : 'rgba(255,255,255,0.06)',
                        borderColor: isLight ? '#e2e8f0' : '#334155',
                        color: isLight ? '#334155' : '#e2e8f0',
                        boxShadow: isLight
                          ? '0 1px 2px rgba(0,0,0,0.06)'
                          : '0 1px 2px rgba(0,0,0,0.3)',
                      }}
                    >
                      {key}
                    </kbd>
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t flex items-center justify-between"
          style={{ borderColor: isLight ? '#e2e8f0' : '#334155' }}>
          <span className="text-[10px] font-mono" style={{ color: isLight ? '#94a3b8' : '#64748b' }}>
            Press <kbd className="px-1 py-0.5 rounded text-[9px] border mx-0.5"
              style={{
                background: isLight ? '#f8fafc' : 'rgba(255,255,255,0.06)',
                borderColor: isLight ? '#e2e8f0' : '#334155',
                color: isLight ? '#334155' : '#e2e8f0',
              }}>Esc</kbd> or <kbd className="px-1 py-0.5 rounded text-[9px] border mx-0.5"
              style={{
                background: isLight ? '#f8fafc' : 'rgba(255,255,255,0.06)',
                borderColor: isLight ? '#e2e8f0' : '#334155',
                color: isLight ? '#334155' : '#e2e8f0',
              }}>⌘K</kbd> to close
          </span>
        </div>
      </div>
    </div>
  );
}

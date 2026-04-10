import React from 'react';
import { FileText, GitBranch, Table2 } from 'lucide-react';

const TABS = [
  { id: 'raw', label: 'Text', icon: FileText },
  { id: 'tree', label: 'Tree', icon: GitBranch },
  { id: 'table', label: 'Table', icon: Table2 },
];

export default function ViewTabs({ active, onChange, theme = 'light' }) {
  const isLight = theme === 'light';
  return (
    <div className="flex items-center gap-0.5 rounded-lg p-0.5 border"
      style={{
        background: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(0,0,0,0.3)',
        borderColor: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)',
      }}>
      {TABS.map(tab => {
        const Icon = tab.icon;
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className="flex items-center gap-1.5 px-3 h-7 rounded text-[12px] font-mono transition-all"
            style={{
              background: isActive ? (isLight ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.2)') : 'transparent',
              color: isActive ? '#3b82f6' : (isLight ? '#475569' : '#94a3b8'),
              border: isActive ? (isLight ? '1px solid rgba(59,130,246,0.2)' : '1px solid rgba(59,130,246,0.2)') : '1px solid transparent',
            }}
          >
            <Icon size={13} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
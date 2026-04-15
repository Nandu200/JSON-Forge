import React, { useState } from 'react';
import { flattenForTable, getType } from '@/utils/jsonUtils';
import { ChevronRight } from 'lucide-react';

function ValueCell({ value, isLight }) {
  const type = getType(value);
  const colors = isLight
    ? { string: '#059669', number: '#d97706', boolean: '#db2777', null: '#db2777', object: '#3b82f6', array: '#3b82f6' }
    : { string: '#10B981', number: '#F59E0B', boolean: '#EC4899', null: '#EC4899', object: '#60a5fa', array: '#60a5fa' };
  const color = colors[type] || (isLight ? '#1e293b' : '#f8fafc');

  if (type === 'object' || type === 'array') {
    return (
      <span className="font-mono text-[11px]" style={{ color }}>
        {Array.isArray(value) ? `[ ${value.length} items ]` : `{ ${Object.keys(value).length} keys }`}
      </span>
    );
  }
  if (value === null) return <span className="font-mono text-[11px]" style={{ color: colors.null, opacity: 0.6 }}>null</span>;

  return <span className="font-mono text-[11px]" style={{ color }}>{String(value)}</span>;
}

function NestedTable({ data, path = 'root', depth = 0, isLight }) {
  const [expanded, setExpanded] = useState(depth === 0);
  const { headers, rows } = flattenForTable(data);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState('');

  if (!headers.length) {
    return <span className="font-mono text-[11px]" style={{ color: isLight ? '#94a3b8' : '#64748b' }}>empty</span>;
  }

  return (
    <div>
      {depth > 0 && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex items-center gap-1 text-[10px] font-mono transition-colors mb-1"
          style={{ color: isLight ? 'rgba(59,130,246,0.6)' : 'rgba(59,130,246,0.7)' }}
        >
          <ChevronRight size={10} className={`transition-transform ${expanded ? 'rotate-90' : ''}`} />
          {path}
        </button>
      )}
      {expanded && (
        <div className="overflow-x-auto rounded border" style={{ borderColor: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.05)' }}>
          {breadcrumb && (
            <div className="px-3 py-1 border-b"
              style={{
                background: isLight ? 'rgba(59,130,246,0.04)' : 'rgba(59,130,246,0.05)',
                borderColor: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.03)',
              }}>
              <span className="breadcrumb-path" style={{ color: isLight ? 'rgba(59,130,246,0.5)' : 'rgba(59,130,246,0.6)' }}>{breadcrumb}</span>
            </div>
          )}
          <table className="data-table w-full">
            <thead>
              <tr>
                {headers.map(h => (
                  <th key={h} className="text-left whitespace-nowrap"
                    style={{
                      background: isLight ? '#f0f2f7' : '#0D0E12',
                      color: isLight ? '#64748b' : '#475569',
                      borderColor: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)',
                    }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={i}
                  onMouseEnter={() => {
                    setHoveredRow(i);
                    setBreadcrumb(`${path} › [${i}]`);
                  }}
                  onMouseLeave={() => {
                    setHoveredRow(null);
                    setBreadcrumb('');
                  }}
                  className="cursor-default"
                  style={{
                    background: hoveredRow === i
                      ? (isLight ? 'rgba(59,130,246,0.04)' : 'rgba(59,130,246,0.04)')
                      : 'transparent',
                  }}
                >
                  {headers.map(h => (
                    <td key={h} style={{
                      borderColor: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.03)',
                    }}>
                      <ValueCell value={row[h]} isLight={isLight} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function TableView({ data, theme = 'dark' }) {
  const isLight = theme === 'light';

  if (data === null || data === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-[11px] font-mono tracking-widest uppercase"
          style={{ color: isLight ? '#94a3b8' : '#64748b' }}>No valid JSON</span>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-4">
      <NestedTable data={data} path="root" depth={0} isLight={isLight} />
    </div>
  );
}
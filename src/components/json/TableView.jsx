import React, { useState } from 'react';
import { flattenForTable, getType } from '@/utils/jsonUtils';
import { ChevronRight } from 'lucide-react';

function ValueCell({ value }) {
  const type = getType(value);
  const colors = {
    string: 'text-emerald-400',
    number: 'text-amber-400',
    boolean: 'text-pink-400',
    null: 'text-pink-400/60',
    object: 'text-blue-400',
    array: 'text-blue-400',
  };

  if (type === 'object' || type === 'array') {
    return (
      <span className={`${colors[type]} font-mono text-[11px]`}>
        {Array.isArray(value) ? `[ ${value.length} items ]` : `{ ${Object.keys(value).length} keys }`}
      </span>
    );
  }
  if (value === null) return <span className="text-pink-400/60 font-mono text-[11px]">null</span>;

  return <span className={`${colors[type]} font-mono text-[11px]`}>{String(value)}</span>;
}

function NestedTable({ data, path = 'root', depth = 0 }) {
  const [expanded, setExpanded] = useState(depth === 0);
  const { headers, rows } = flattenForTable(data);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState('');

  if (!headers.length) {
    return <span className="text-slate-600 font-mono text-[11px]">empty</span>;
  }

  return (
    <div>
      {depth > 0 && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex items-center gap-1 text-[10px] font-mono text-blue-400/70 hover:text-blue-400 transition-colors mb-1"
        >
          <ChevronRight size={10} className={`transition-transform ${expanded ? 'rotate-90' : ''}`} />
          {path}
        </button>
      )}
      {expanded && (
        <div className="overflow-x-auto rounded border border-white/[0.05]">
          {breadcrumb && (
            <div className="px-3 py-1 bg-blue-500/5 border-b border-white/[0.03]">
              <span className="breadcrumb-path text-blue-400/60">{breadcrumb}</span>
            </div>
          )}
          <table className="data-table w-full">
            <thead>
              <tr>
                {headers.map(h => (
                  <th key={h} className="text-left whitespace-nowrap">{h}</th>
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
                >
                  {headers.map(h => (
                    <td key={h}>
                      <ValueCell value={row[h]} />
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

export default function TableView({ data }) {
  if (data === null || data === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-[11px] font-mono text-slate-600 tracking-widest uppercase">No valid JSON</span>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-4">
      <NestedTable data={data} path="root" depth={0} />
    </div>
  );
}
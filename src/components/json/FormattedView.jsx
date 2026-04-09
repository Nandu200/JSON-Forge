import React, { useRef, useEffect } from 'react';
import { syntaxHighlight } from '@/utils/jsonUtils';

export default function FormattedView({ value }) {
  const ref = useRef(null);

  if (!value) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-[11px] font-mono text-slate-600 tracking-widest uppercase">No content</span>
      </div>
    );
  }

  const highlighted = syntaxHighlight(value);
  const lines = value.split('\n');

  return (
    <div className="h-full flex overflow-hidden">
      {/* Line numbers */}
      <div className="line-numbers pt-3 pb-3 overflow-hidden flex-shrink-0" style={{ background: '#080910' }}>
        {lines.map((_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      {/* Content */}
      <div className="flex-1 overflow-auto p-3">
        <pre
          ref={ref}
          className="code-editor text-slate-300"
          style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </div>
    </div>
  );
}
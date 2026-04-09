import React, { useState } from 'react';
import JsonEditor from './JsonEditor';
import FormattedView from './FormattedView';
import TreeView from './TreeView';
import TableView from './TableView';
import DiffView from './DiffView';
import ViewTabs from './ViewTabs';

export default function PanelView({ label, value, onChange, parsedData, otherParsedData, showDiff }) {
  const [view, setView] = useState('raw');

  return (
    <div className="flex flex-col h-full overflow-hidden rounded-xl border border-white/[0.06] surface-1">
      {/* Tab bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.05] flex-shrink-0 bg-black/20">
        <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-slate-600">{label}</span>
        <ViewTabs active={view} onChange={setView} showDiff={showDiff} />
      </div>

      {/* View area */}
      <div className="flex-1 overflow-hidden">
        {view === 'raw' && (
          <JsonEditor
            value={value}
            onChange={onChange}
            label=""
            onParsed={() => {}}
          />
        )}
        {view === 'formatted' && (
          <FormattedView value={value} />
        )}
        {view === 'tree' && (
          <TreeView data={parsedData} />
        )}
        {view === 'table' && (
          <TableView data={parsedData} />
        )}
        {view === 'diff' && showDiff && (
          <DiffView leftData={parsedData} rightData={otherParsedData} />
        )}
      </div>
    </div>
  );
}
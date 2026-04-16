import React, { useState, useCallback } from 'react';
import { Search, X, ChevronLeft, ChevronRight, Replace, Filter, ArrowDownAZ, ArrowUpAZ, ArrowUpDown } from 'lucide-react';
import { getQueryPlaceholder, getQueryLabel } from '@/utils/jsonQuery';

export default function FilterBar({ 
  filter, 
  onFilterChange, 
  sort, 
  onSortChange,
  onSearchNext,
  onSearchPrev,
  onReplace,
  onReplaceAll,
  searchMatchCount = 0,
  currentMatchIndex = 0,
  caseSensitive = false,
  onCaseSensitiveChange,
  view = 'raw',
  onPathFilter,
  pathFilter = '',
  queryMode = 'path',
  onQueryModeChange,
  theme = 'dark'
}) {
  const isLight = theme === 'light';
  const [showReplace, setShowReplace] = useState(false);
  const [replaceText, setReplaceText] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.shiftKey ? onSearchPrev?.() : onSearchNext?.();
    }
  }, [onSearchNext, onSearchPrev]);

  const handleReplace = useCallback(() => {
    if (onReplace && filter) {
      onReplace(filter, replaceText);
    }
  }, [onReplace, filter, replaceText]);

  const handleReplaceAll = useCallback(() => {
    if (onReplaceAll && filter) {
      onReplaceAll(filter, replaceText);
    }
  }, [onReplaceAll, filter, replaceText]);

  // Only show replace in raw view
  const showReplaceButton = view === 'raw';
  // Show sort options in tree view
  const showSortOptions = view === 'tree';
  // Show JSON path filter in tree/table view
  const showPathFilter = view === 'tree' || view === 'table';

  return (
    <div className={`flex flex-col border-b flex-shrink-0 ${
      isLight ? 'bg-slate-50 border-slate-200' : 'bg-[rgba(5,5,8,0.8)] border-white/[0.04]'
    }`}>
      
      {/* Main Search Bar */}
      <div className="flex items-center gap-2 px-3 py-1.5">
        {/* Search Input */}
        <div className={`flex items-center gap-1.5 border rounded px-2 h-7 flex-1 max-w-[300px] ${
          isLight 
            ? 'bg-white border-slate-200' 
            : 'bg-white/[0.04] border-white/[0.06]'
        }`}>
          <Search size={14} className={`flex-shrink-0 ${isLight ? 'text-slate-400' : 'text-slate-400'}`} />
          <input
            type="text"
            value={filter}
            onChange={e => onFilterChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={showPathFilter ? "Search keys & values..." : "Search..."}
            className={`bg-transparent text-[12px] font-mono outline-none w-full ${
              isLight 
                ? 'text-slate-700 placeholder-slate-400' 
                : 'text-slate-300 placeholder-slate-600'
            }`}
          />
          {filter && (
            <button onClick={() => onFilterChange('')} className={isLight ? 'text-slate-400 hover:text-slate-600' : 'text-slate-400 hover:text-slate-200'}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Search Navigation */}
        {filter && (
          <>
            <div className="flex items-center gap-0.5">
              <button 
                onClick={onSearchPrev}
                disabled={searchMatchCount === 0}
                className={`p-1.5 rounded transition-colors disabled:opacity-30 ${
                  isLight 
                    ? 'hover:bg-slate-200 text-slate-500 hover:text-slate-700' 
                    : 'hover:bg-white/[0.08] text-slate-400 hover:text-slate-200'
                }`}
                title="Previous match (Shift+Enter)"
              >
                <ChevronLeft size={16} />
              </button>
              <span className={`text-[11px] font-mono min-w-[40px] text-center ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}>
                {searchMatchCount > 0 ? `${currentMatchIndex + 1}/${searchMatchCount}` : '0/0'}
              </span>
              <button 
                onClick={onSearchNext}
                disabled={searchMatchCount === 0}
                className={`p-1.5 rounded transition-colors disabled:opacity-30 ${
                  isLight 
                    ? 'hover:bg-slate-200 text-slate-500 hover:text-slate-700' 
                    : 'hover:bg-white/[0.08] text-slate-400 hover:text-slate-200'
                }`}
                title="Next match (Enter)"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Replace Toggle - Only in raw view */}
            {showReplaceButton && (
              <button 
                onClick={() => setShowReplace(!showReplace)}
                className={`flex items-center gap-1 px-2 h-6 text-[11px] font-mono rounded transition-all ${
                  showReplace 
                    ? (isLight ? 'bg-blue-100 text-blue-600' : 'bg-blue-600/20 text-blue-400')
                    : (isLight ? 'text-slate-500 hover:text-slate-700' : 'text-slate-400 hover:text-slate-200')
                }`}
              >
                <Replace size={13} />
                Replace
              </button>
            )}
          </>
        )}

        {/* Sort toggles - tree view */}
        {showSortOptions && (
          <div className="flex items-center gap-0.5 ml-1">
            {[
              { id: 'none', icon: ArrowUpDown, label: 'Default' },
              { id: 'asc', icon: ArrowDownAZ, label: 'A-Z' },
              { id: 'desc', icon: ArrowUpAZ, label: 'Z-A' },
            ].map(s => (
              <button 
                key={s.id}
                onClick={() => onSortChange?.(s.id)}
                title={`Sort: ${s.label}`}
                className={`p-1.5 rounded transition-all ${
                  sort === s.id 
                    ? (isLight ? 'bg-blue-100 text-blue-600' : 'bg-blue-600/20 text-blue-400')
                    : (isLight ? 'text-slate-500 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]')
                }`}
              >
                <s.icon size={14} />
              </button>
            ))}
          </div>
        )}

        {/* Case Sensitive Toggle */}
        <label className={`flex items-center gap-1.5 text-[11px] font-mono cursor-pointer ml-auto ${
          isLight ? 'text-slate-500 hover:text-slate-700' : 'text-slate-400 hover:text-slate-200'
        }`}>
          <input
            type="checkbox"
            checked={caseSensitive}
            onChange={(e) => onCaseSensitiveChange?.(e.target.checked)}
            className={`rounded bg-transparent ${isLight ? 'border-slate-300' : 'border-slate-600'}`}
          />
          Match case
        </label>

        {/* Advanced filter toggle for tree/table */}
        {showPathFilter && (
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-1 px-2 h-6 text-[10px] font-mono rounded transition-all ${
              showAdvanced 
                ? (isLight ? 'bg-blue-100 text-blue-600' : 'bg-blue-600/20 text-blue-400')
                : (isLight ? 'text-slate-500 hover:text-slate-700' : 'text-slate-400 hover:text-slate-200')
            }`}
          >
            <Filter size={13} />
            Path
          </button>
        )}
      </div>

      {/* JSON Path Filter */}
      {showAdvanced && showPathFilter && (
        <div className={`flex items-center gap-2 px-3 py-1.5 border-t ${
          isLight ? 'border-slate-200' : 'border-white/[0.04]'
        }`}>
          {/* Query Mode Selector */}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            {['path', 'jsonpath', 'jmespath'].map(mode => (
              <button
                key={mode}
                onClick={() => onQueryModeChange?.(mode)}
                className={`px-2 h-6 text-[10px] font-mono rounded transition-all ${
                  queryMode === mode
                    ? (isLight ? 'bg-blue-100 text-blue-600 border border-blue-200' : 'bg-blue-600/20 text-blue-400 border border-blue-500/30')
                    : (isLight ? 'text-slate-500 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]')
                }`}
              >
                {getQueryLabel(mode)}
              </button>
            ))}
          </div>

          <div className={`flex items-center gap-1.5 border rounded px-2 h-7 flex-1 max-w-[350px] ${
            isLight 
              ? 'bg-white border-slate-200' 
              : 'bg-white/[0.04] border-white/[0.06]'
          }`}>
            <Filter size={11} className={isLight ? 'text-slate-400 flex-shrink-0' : 'text-slate-400 flex-shrink-0'} />
            <input
              type="text"
              value={pathFilter}
              onChange={e => onPathFilter?.(e.target.value)}
              placeholder={getQueryPlaceholder(queryMode)}
              className={`bg-transparent text-[11px] font-mono outline-none w-full ${
                isLight 
                  ? 'text-slate-700 placeholder-slate-400' 
                  : 'text-slate-300 placeholder-slate-600'
              }`}
            />
            {pathFilter && (
              <button onClick={() => onPathFilter?.('')} className={isLight ? 'text-slate-400 hover:text-slate-600' : 'text-slate-400 hover:text-slate-200'}>
                <X size={12} />
              </button>
            )}
          </div>
          <span className={`text-[9px] font-mono ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
            {getQueryLabel(queryMode)} query
          </span>
        </div>
      )}

      {/* Replace Bar - Only in raw view */}
      {showReplace && showReplaceButton && filter && (
        <div className={`flex items-center gap-2 px-3 py-1.5 border-t ${
          isLight ? 'border-slate-200' : 'border-white/[0.04]'
        }`}>
          <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>Replace:</span>
          <div className={`flex items-center gap-1.5 border rounded px-2 h-7 flex-1 max-w-[200px] ${
            isLight 
              ? 'bg-white border-slate-200' 
              : 'bg-white/[0.04] border-white/[0.06]'
          }`}>
            <input
              type="text"
              value={replaceText}
              onChange={e => setReplaceText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleReplace()}
              placeholder="Replace with..."
              className={`bg-transparent text-[11px] font-mono outline-none w-full ${
                isLight 
                  ? 'text-slate-700 placeholder-slate-400' 
                  : 'text-slate-300 placeholder-slate-600'
              }`}
            />
          </div>
          <button 
            onClick={handleReplace}
            disabled={!replaceText}
            className={`px-3 h-6 text-[10px] font-mono rounded transition-colors disabled:opacity-30 ${
              isLight 
                ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' 
                : 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30'
            }`}
          >
            Replace
          </button>
          <button 
            onClick={handleReplaceAll}
            disabled={!replaceText}
            className={`px-3 h-6 text-[10px] font-mono rounded transition-colors disabled:opacity-30 ${
              isLight 
                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                : 'bg-white/[0.06] text-slate-400 hover:bg-white/10'
            }`}
          >
            Replace All
          </button>
        </div>
      )}
    </div>
  );
}

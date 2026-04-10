import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { formatJSON, minifyJSON } from '@/utils/jsonUtils';
import { parseJSONSafe, getDepthSafe, countKeysSafe, SIZE_LIMITS } from '@/utils/optimizedJsonUtils';
import { autoFixJSON } from '@/utils/schemaValidation';
import TopBar from '@/components/json/TopBar';
import TreeView from '@/components/json/TreeView';
import TableView from '@/components/json/TableView';
import DiffView from '@/components/json/DiffView';
import { GitCompare } from 'lucide-react';
import ViewTabs from '@/components/json/ViewTabs';
import FilterBar from '@/components/json/FilterBar';
import ExportDialog from '@/components/json/ExportDialog';
import ErrorBoundary from '@/components/ErrorBoundary';
import GoogleAd from '@/components/GoogleAd';
import { LayoutPanelLeft, Columns2, Copy, Check, Trash2, Minimize2, AlertCircle, CheckCircle2, Wrench, Eye, Upload, Undo2, Redo2, X, ClipboardPaste } from 'lucide-react';

function Panel({ label, value, onChange: onChangeProp, parsedData, otherParsedData, theme, validationErrors = [], onValidationErrorsChange }) {
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState('none');
  const [view, setView] = useState('raw');
  const [copied, setCopied] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [cursorPos, setCursorPos] = useState({ line: 1, column: 1 });
  const [searchMatches, setSearchMatches] = useState([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [pathFilter, setPathFilter] = useState('');
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Undo/redo history
  const historyRef = useRef([value]);
  const historyIndexRef = useRef(0);
  const skipHistoryRef = useRef(false);
  const lastChangeTimeRef = useRef(0);
  const [, forceRender] = useState(0);

  const onChange = useCallback((newValue) => {
    if (!skipHistoryRef.current) {
      const now = Date.now();
      const elapsed = now - lastChangeTimeRef.current;
      const prev = historyRef.current[historyIndexRef.current] || '';
      const isSmallEdit = Math.abs(newValue.length - prev.length) <= 5;
      if (elapsed < 300 && isSmallEdit && historyRef.current.length > 1) {
        historyRef.current[historyIndexRef.current] = newValue;
      } else {
        historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
        historyRef.current.push(newValue);
        if (historyRef.current.length > 100) historyRef.current = historyRef.current.slice(-100);
        historyIndexRef.current = historyRef.current.length - 1;
      }
      lastChangeTimeRef.current = now;
    }
    skipHistoryRef.current = false;
    onChangeProp(newValue);
    forceRender(n => n + 1);
  }, [onChangeProp]);

  const handleUndo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--;
      skipHistoryRef.current = true;
      const prevState = historyRef.current[historyIndexRef.current];
      console.log('[PrettyJSON] Undo', { index: historyIndexRef.current, chars: prevState.length });
      onChange(prevState);
    }
  }, [onChange]);

  const handleRedo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current++;
      skipHistoryRef.current = true;
      const nextState = historyRef.current[historyIndexRef.current];
      console.log('[PrettyJSON] Redo', { index: historyIndexRef.current, chars: nextState.length });
      onChange(nextState);
    }
  }, [onChange]);

  const canUndo = historyIndexRef.current > 0;
  const canRedo = historyIndexRef.current < historyRef.current.length - 1;

  // Calculate cursor position
  const updateCursorPos = useCallback(() => {
    if (!textareaRef.current) return;
    const pos = textareaRef.current.selectionStart;
    const textBefore = value.substring(0, pos);
    const lines = textBefore.split('\n');
    setCursorPos({
      line: lines.length,
      column: lines[lines.length - 1].length + 1
    });
  }, [value]);

  // Find all search matches - limit for performance
  useEffect(() => {
    if (!filter || !value || value.length > SIZE_LIMITS.MAX_STRING_LENGTH) {
      setSearchMatches([]);
      setCurrentMatchIndex(0);
      return;
    }
    const matches = [];
    const maxMatches = 1000; // Limit matches for performance
    const searchValue = caseSensitive ? value : value.toLowerCase();
    const searchFilter = caseSensitive ? filter : filter.toLowerCase();
    let index = searchValue.indexOf(searchFilter);
    while (index !== -1 && matches.length < maxMatches) {
      matches.push(index);
      index = searchValue.indexOf(searchFilter, index + 1);
    }
    setSearchMatches(matches);
    setCurrentMatchIndex(0);
  }, [filter, value, caseSensitive]);

  const handleSearchNext = useCallback(() => {
    if (searchMatches.length === 0 || !textareaRef.current) return;
    const nextIndex = (currentMatchIndex + 1) % searchMatches.length;
    setCurrentMatchIndex(nextIndex);
    const pos = searchMatches[nextIndex];
    textareaRef.current.focus();
    textareaRef.current.setSelectionRange(pos, pos + filter.length);
    updateCursorPos();
  }, [searchMatches, currentMatchIndex, filter, updateCursorPos]);

  const handleSearchPrev = useCallback(() => {
    if (searchMatches.length === 0 || !textareaRef.current) return;
    const prevIndex = currentMatchIndex === 0 ? searchMatches.length - 1 : currentMatchIndex - 1;
    setCurrentMatchIndex(prevIndex);
    const pos = searchMatches[prevIndex];
    textareaRef.current.focus();
    textareaRef.current.setSelectionRange(pos, pos + filter.length);
    updateCursorPos();
  }, [searchMatches, currentMatchIndex, filter, updateCursorPos]);

  // Handle replace single occurrence
  const handleReplace = useCallback((searchText, replaceText) => {
    if (!textareaRef.current || !searchText) return;
    const currentMatch = searchMatches[currentMatchIndex];
    
    if (currentMatch !== undefined) {
      // Check if cursor is at a match
      const matchEnd = currentMatch + searchText.length;
      const newValue = value.substring(0, currentMatch) + replaceText + value.substring(matchEnd);
      onChange(newValue);
      
      // Move to next match after replace
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          const newPos = currentMatch + replaceText.length;
          textareaRef.current.setSelectionRange(newPos, newPos);
        }
      }, 0);
    }
  }, [value, onChange, searchMatches, currentMatchIndex]);

  // Handle replace all occurrences
  const handleReplaceAll = useCallback((searchText, replaceText) => {
    if (!searchText) return;
    let newValue = value;
    const searchValue = caseSensitive ? value : value.toLowerCase();
    const searchFilter = caseSensitive ? searchText : searchText.toLowerCase();
    
    let index = searchValue.lastIndexOf(searchFilter);
    while (index !== -1) {
      newValue = newValue.substring(0, index) + replaceText + newValue.substring(index + searchText.length);
      index = searchValue.lastIndexOf(searchFilter, index - 1);
    }
    onChange(newValue);
    setFilter('');
  }, [value, onChange, caseSensitive]);

  const isLight = theme === 'light';

  const { data, error } = parseJSONSafe(value);
  const isEmpty = !value.trim();
  const lineCount = value ? value.split('\n').length : 1;

  // Stats footer - use safe functions for large data
  const stats = useMemo(() => {
    if (!parsedData) return null;
    const keyCount = countKeysSafe(parsedData);
    const depth = getDepthSafe(parsedData);
    const bytes = new TextEncoder().encode(value).length;
    return { 
      keys: keyCount.total >= SIZE_LIMITS.MAX_KEYS ? `${SIZE_LIMITS.MAX_KEYS}+` : keyCount.total, 
      depth, 
      bytes 
    };
  }, [parsedData, value]);

  const handleFormat = useCallback(() => {
    const { formatted: f, error: e } = formatJSON(value);
    if (!e) { 
      console.log('[PrettyJSON] Format applied', { chars: f.length, lines: f.split('\n').length });
      onChange(f); 
      setScanning(true); 
      setTimeout(() => setScanning(false), 900); 
    } else {
      console.warn('[PrettyJSON] Format failed:', e);
    }
  }, [value, onChange]);

  const handleMinify = useCallback(() => {
    const { minified, error: e } = minifyJSON(value);
    if (!e) {
      console.log('[PrettyJSON] Minify applied', { chars: minified.length, reduction: `${(100 - (minified.length / value.length * 100)).toFixed(1)}%` });
      onChange(minified);
    } else {
      console.warn('[PrettyJSON] Minify failed:', e);
    }
  }, [value, onChange]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      console.log('[PrettyJSON] JSON copied to clipboard', { chars: value.length });
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.warn('[PrettyJSON] Clipboard copy failed:', err);
    }
  }, [value]);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      const { formatted: f } = formatJSON(text);
      console.log('[PrettyJSON] JSON pasted from clipboard', { chars: text.length });
      onChange(f || text);
      setScanning(true);
      setTimeout(() => setScanning(false), 900);
    } catch (err) {
      console.warn('[PrettyJSON] Clipboard paste failed:', err);
    }
  }, [onChange]);

  const handleFileUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File too large. Maximum size is 10MB.');
      e.target.value = '';
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result;
      if (typeof text === 'string') {
        onChange(text);
        setScanning(true);
        setTimeout(() => setScanning(false), 900);
      }
    };
    reader.onerror = () => {
      alert('Error reading file');
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [onChange]);

  const handleKeyDown = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      if (e.shiftKey) handleRedo(); else handleUndo();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
      e.preventDefault();
      handleRedo();
      return;
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newVal = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newVal);
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      });
    }
  }, [value, onChange, handleUndo, handleRedo]);

  // Theme-aware colors with improved contrast
  const statColor = isLight ? '#475569' : '#94a3b8';
  const dotColor = isLight ? '#94a3b8' : '#475569';
  const headerBg = isLight ? '#f8fafc' : '#1e293b';
  const headerBorder = isLight ? '#e2e8f0' : '#334155';
  const lineNumBg = isLight ? '#f1f5f9' : '#0f172a';
  const footerBg = isLight ? '#f8fafc' : '#1e293b';
  const footerBorder = isLight ? '#e2e8f0' : '#334155';

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Panel header */}
      <div className="flex items-center justify-between px-2 sm:px-3 py-2 border-b flex-shrink-0 gap-1 sm:gap-2 flex-wrap"
        style={{ background: headerBg, borderColor: headerBorder }}>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[11px] sm:text-[12px] font-mono uppercase tracking-[0.15em]"
            style={{ color: isLight ? '#475569' : '#94a3b8' }}>{label}</span>
          {data !== null && !error && <CheckCircle2 size={13} className="text-emerald-500" />}
          {error && value && <AlertCircle size={13} className="text-red-500" />}
        </div>

        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button onClick={handleUndo} disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className={`w-7 h-7 flex items-center justify-center rounded transition-all disabled:opacity-30 ${
              isLight
                ? 'hover:bg-slate-100 text-slate-500 border border-transparent hover:border-slate-200'
                : 'hover:bg-white/[0.06] text-slate-400 border border-transparent hover:border-white/[0.08]'
            }`}>
            <Undo2 size={14} />
          </button>
          <button onClick={handleRedo} disabled={!canRedo}
            title="Redo (Ctrl+Shift+Z)"
            className={`w-7 h-7 flex items-center justify-center rounded transition-all disabled:opacity-30 ${
              isLight
                ? 'hover:bg-slate-100 text-slate-500 border border-transparent hover:border-slate-200'
                : 'hover:bg-white/[0.06] text-slate-400 border border-transparent hover:border-white/[0.08]'
            }`}>
            <Redo2 size={14} />
          </button>
        </div>

        {view === 'raw' && (
          <div className="flex items-center gap-1 flex-wrap">
            <button onClick={handleFormat} disabled={!value}
              className={`px-2.5 h-7 text-[12px] font-mono rounded transition-all disabled:opacity-30 ${
                isLight 
                  ? 'bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200' 
                  : 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/20'
              }`}>
              Format
            </button>
            <button onClick={handleMinify} disabled={!value}
              className={`px-2 h-7 text-[12px] font-mono rounded transition-all disabled:opacity-30 flex items-center gap-1 ${
                isLight 
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200' 
                  : 'bg-black/[0.05] hover:bg-black/[0.08] text-slate-400 border border-black/[0.07]'
              }`}>
              <Minimize2 size={11} /> Min
            </button>
            <button onClick={handlePaste}
              className={`px-2 h-7 text-[12px] font-mono rounded transition-all hidden sm:flex items-center gap-1 ${
                isLight 
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200' 
                  : 'bg-black/[0.05] hover:bg-black/[0.08] text-slate-400 border border-black/[0.07]'
              }`}>
              <ClipboardPaste size={11} /> Paste
            </button>
            <button onClick={() => fileInputRef.current?.click()}
              className={`px-2 h-7 text-[12px] font-mono rounded transition-all flex items-center gap-1 hidden sm:flex ${
                isLight 
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200' 
                  : 'bg-black/[0.05] hover:bg-black/[0.08] text-slate-400 border border-black/[0.07]'
              }`}>
              <Upload size={11} /> Load
            </button>
            <input 
              ref={fileInputRef} 
              type="file" 
              accept=".json,application/json" 
              className="hidden" 
              onChange={handleFileUpload} 
            />
            <button onClick={handleCopy} disabled={!value}
              className={`w-7 h-7 flex items-center justify-center rounded transition-all disabled:opacity-30 ${
                isLight 
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200' 
                  : 'bg-black/[0.05] hover:bg-black/[0.08] text-slate-400 border border-black/[0.07]'
              }`}>
              {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
            </button>
            <button onClick={() => onChange('')} disabled={!value}
              className={`w-7 h-7 flex items-center justify-center rounded transition-all disabled:opacity-30 ${
                isLight 
                  ? 'bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-500 border border-slate-200 hover:border-red-200' 
                  : 'bg-black/[0.05] hover:bg-black/[0.08] text-slate-400 hover:text-red-400 border border-black/[0.07]'
              }`}>
              <Trash2 size={12} />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 ml-auto">
          {/* Schema validation removed - using inline validation instead */}
          <ExportDialog
            jsonData={parsedData}
            jsonValue={value}
            currentView={view}
            theme={theme}
          />
          <ViewTabs active={view} onChange={setView} theme={theme} />
        </div>
      </div>

      {/* Search bar - shown in all views for consistency */}
      <FilterBar 
        filter={filter} 
        onFilterChange={setFilter}
        sort={sort} 
        onSortChange={setSort}
        onSearchNext={handleSearchNext}
        onSearchPrev={handleSearchPrev}
        onReplace={handleReplace}
        onReplaceAll={handleReplaceAll}
        searchMatchCount={searchMatches.length}
        currentMatchIndex={currentMatchIndex}
        caseSensitive={caseSensitive}
        onCaseSensitiveChange={setCaseSensitive}
        view={view}
        pathFilter={pathFilter}
        onPathFilter={setPathFilter}
        theme={theme}
      />

      {/* Content area */}
      <div className="flex-1 overflow-hidden relative">
        {view === 'raw' && (
          <>
            {scanning && <div className="scan-line" style={{ top: 0 }} />}
            {isEmpty && (
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <div className="flex flex-col items-center gap-3">
                  <svg width="200" height="100">
                    <rect x="2" y="2" width="196" height="96" rx="10" fill="none"
                      stroke={isLight ? 'rgba(59,130,246,0.3)' : 'rgba(59,130,246,0.4)'} strokeWidth="1.5" strokeDasharray="8 4"
                      className="drop-zone-dash" />
                  </svg>
                  <div className="absolute flex flex-col items-center gap-2">
                    <span className="text-[13px] font-mono tracking-wider uppercase"
                      style={{ color: isLight ? 'rgba(59,130,246,0.5)' : 'rgba(59,130,246,0.6)' }}>Paste JSON here</span>
                    <span className="text-[11px] font-mono"
                      style={{ color: isLight ? '#94a3b8' : '#475569' }}>or</span>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className={`pointer-events-auto flex items-center gap-2 px-4 py-1.5 rounded-lg text-[12px] font-mono transition-all ${
                        isLight
                          ? 'bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200'
                          : 'bg-blue-600/15 hover:bg-blue-600/25 text-blue-400 border border-blue-500/20'
                      }`}
                    >
                      <Upload size={13} />
                      Upload .json file
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div className="flex h-full overflow-hidden" style={{ paddingBottom: error ? '100px' : (value ? '28px' : 0) }}>
              {/* Line Numbers */}
              <div className="flex flex-shrink-0 overflow-hidden" style={{ background: lineNumBg }}>
                <div className="line-numbers pt-3 pb-3 overflow-hidden">
                  {Array.from({ length: Math.max(lineCount, 1) }).map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
              </div>
              {/* Plain text editor - shows exactly what user typed/pasted */}
              <div className="relative flex-1 overflow-hidden">
                <textarea
                  ref={textareaRef}
                  value={value}
                  onChange={e => onChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onClick={updateCursorPos}
                  onKeyUp={updateCursorPos}
                  spellCheck={false}
                  autoComplete="off"
                  className="code-editor absolute inset-0 w-full h-full p-3 resize-none overflow-auto font-mono text-[14px] leading-[23px]"
                  style={{
                    background: 'transparent',
                    color: isLight ? '#0f172a' : '#f1f5f9',
                    caretColor: '#3B82F6',
                    tabSize: 2,
                  }}
                />
              </div>
            </div>
            {/* Stats footer */}
            {value && !error && (
              <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 px-4 h-7 border-t"
                style={{ background: footerBg, borderColor: footerBorder }}>
                <span className="text-[11px] font-mono" style={{ color: statColor }}>
                  Ln {cursorPos.line}, Col {cursorPos.column}
                </span>
                <span style={{ color: dotColor }}>·</span>
                {stats ? (
                  <>
                    <span className="text-[11px] font-mono" style={{ color: statColor }}>{stats.keys} keys</span>
                    <span style={{ color: dotColor }}>·</span>
                    <span className="text-[11px] font-mono" style={{ color: statColor }}>depth {stats.depth}</span>
                    <span style={{ color: dotColor }}>·</span>
                    <span className="text-[11px] font-mono" style={{ color: statColor }}>
                      {stats.bytes < 1024 ? `${stats.bytes} B` : `${(stats.bytes / 1024).toFixed(1)} KB`}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[11px] font-mono" style={{ color: statColor }}>{value.length} chars</span>
                  </>
                )}
                {data !== null && <span className="text-[11px] font-mono text-emerald-500 ml-auto">✓ Valid</span>}
              </div>
            )}

            {/* Error Bar */}
            {error && value && (
              <div className="absolute bottom-0 left-0 right-0 flex flex-col border-t"
                style={{ background: '#dc2626', borderColor: '#b91c1c' }}>
                <div className="flex items-center gap-3 px-4 py-2">
                  <AlertCircle size={18} className="text-white flex-shrink-0" />
                  <span className="text-[13px] font-mono text-white flex-1">{error}</span>
                </div>
                <div className="flex items-center gap-3 px-4 pb-3">
                  <button 
                    onClick={() => {
                      const result = autoFixJSON(value);
                      if (result.fixed) {
                        // Try to format after fixing, push only the final result to undo history
                        const { formatted } = formatJSON(result.value);
                        onChange(formatted || result.value);
                      }
                      // Silently do nothing if can't fix - error is already shown above
                    }}
                    disabled={value.length > 5 * 1024 * 1024}
                    className="flex items-center gap-2 px-4 py-1.5 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed rounded text-[12px] font-mono text-white transition-colors"
                  >
                    <Wrench size={15} />
                    Auto repair
                  </button>
                  <button 
                    onClick={() => {
                      if (!textareaRef.current) return;
                      // Try multiple error message formats to extract line number
                      let lineNum = -1;
                      const lineMatch = error.match(/line\s+(\d+)/i) || error.match(/position\s+(\d+)/i);
                      if (lineMatch) {
                        // Check if it's a "position" (character offset) or "line" number
                        if (/position/i.test(lineMatch[0])) {
                          // Convert character position to line number
                          const pos = parseInt(lineMatch[1]);
                          const textBefore = value.substring(0, pos);
                          lineNum = textBefore.split('\n').length - 1;
                        } else {
                          lineNum = parseInt(lineMatch[1]) - 1;
                        }
                      }
                      
                      if (lineNum >= 0) {
                        const lines = value.split('\n');
                        let charPos = 0;
                        for (let i = 0; i < lineNum && i < lines.length; i++) {
                          charPos += lines[i].length + 1;
                        }
                        // Select the entire error line to highlight it
                        const lineEnd = charPos + (lines[lineNum]?.length || 0);
                        textareaRef.current.focus();
                        textareaRef.current.setSelectionRange(charPos, lineEnd);
                        // Scroll the textarea to show the error line
                        const lineHeight = 20;
                        const scrollTarget = lineNum * lineHeight - textareaRef.current.clientHeight / 2;
                        textareaRef.current.scrollTop = Math.max(0, scrollTarget);
                      } else {
                        // Fallback: try to find the error by character position from JSON.parse
                        textareaRef.current.focus();
                        const colMatch = error.match(/column\s+(\d+)/i);
                        if (colMatch) {
                          const col = parseInt(colMatch[1]);
                          textareaRef.current.setSelectionRange(col, col + 1);
                        }
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded text-[12px] font-mono text-white transition-colors"
                  >
                    <Eye size={15} />
                    Show me
                  </button>
                </div>
              </div>
            )}
          </>
        )}
        {view === 'tree' && (
          <ErrorBoundary>
            <TreeView 
              data={parsedData} 
              filter={filter}
              pathFilter={pathFilter}
              sort={sort}
              validationErrors={validationErrors}
              onDataChange={(newData) => {
                onChange(JSON.stringify(newData, null, 2));
              }}
            />
          </ErrorBoundary>
        )}
        {view === 'table' && (
          <ErrorBoundary>
            <TableView data={parsedData} />
          </ErrorBoundary>
        )}
      </div>
    </div>
  );
}

export default function JsonFormatter() {
  const [leftValue, setLeftValue] = useState('');
  const [rightValue, setRightValue] = useState('');
  const [leftData, setLeftData] = useState(null);
  const [rightData, setRightData] = useState(null);
  const [leftValidationErrors, setLeftValidationErrors] = useState([]);
  const [rightValidationErrors, setRightValidationErrors] = useState([]);
  const [layout, setLayout] = useState('single');
  const [theme, setTheme] = useState('light');
  const [showAd, setShowAd] = useState(true);

  const isLight = theme === 'light';
  // Improved color palette with better contrast
  const bg0 = isLight ? '#f8fafc' : '#0f172a';  // Page background
  const bg1 = isLight ? '#ffffff' : '#1e293b';  // Panel background
  const bgBar = isLight ? '#f1f5f9' : '#1e293b'; // Toolbar background
  const borderColor = isLight ? '#e2e8f0' : '#334155'; // Borders

  useEffect(() => {
    const { data } = parseJSONSafe(leftValue);
    setLeftData(data);
  }, [leftValue]);

  useEffect(() => {
    const data = parseJSONSafe(rightValue).data;
    setRightData(data);
  }, [rightValue]);

  // Initialize and log app state
  useEffect(() => {
    console.log('[PrettyJSON] App initialized', { theme, layout });
  }, []);

  // Log theme changes
  useEffect(() => {
    console.log(`[PrettyJSON] Theme changed to: ${theme}`);
  }, [theme]);

  // Log layout changes
  useEffect(() => {
    console.log(`[PrettyJSON] Layout changed to: ${layout}`);
  }, [layout]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        const { formatted } = formatJSON(leftValue);
        if (formatted) setLeftValue(formatted);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [leftValue]);

  return (
    <div className="flex flex-col h-screen overflow-hidden mono-grid"
      style={{ background: bg0 }} data-theme={theme}>
      <TopBar theme={theme} onThemeToggle={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} />

      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 sm:px-6 h-10 border-b flex-shrink-0"
        style={{ background: bgBar, borderColor }}>
        <div className="flex items-center gap-1">
          {['single', 'split', 'diff'].map(l => (
            <button key={l} onClick={() => setLayout(l)}
              className={`flex items-center gap-1.5 px-2 sm:px-3 h-7 rounded text-[12px] font-mono transition-all ${
                layout === l 
                  ? (isLight ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-blue-600/15 text-blue-400 border border-blue-500/20')
                  : isLight ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                  : 'text-slate-600 hover:text-slate-400 hover:bg-white/[0.03]'}`}>
              {l === 'single' && <LayoutPanelLeft size={13} />}
              {l === 'split' && <Columns2 size={13} />}
              {l === 'diff' && <GitCompare size={13} />}
              <span className="hidden sm:inline">{l === 'single' ? 'Single' : l === 'split' ? 'Compare' : 'Diff'}</span>
            </button>
          ))}
        </div>
        <span className="text-[11px] font-mono hidden sm:block" style={{ color: isLight ? '#64748b' : '#64748b' }}>
          {layout === 'diff' ? 'Diff view - comparing left and right' : layout === 'split' ? 'Side-by-side comparison mode' : 'Single panel mode'}
        </span>
      </div>

      {/* Panels + right sidebar ad */}
      <div className="flex-1 overflow-hidden flex">
        <div className="flex-1 overflow-hidden p-2 sm:p-3 gap-2 sm:gap-3 flex flex-col sm:flex-row">
          {layout === 'diff' ? (
            /* Full-width diff view spanning both panels */
            <div className="flex-1 min-w-0 overflow-hidden rounded-xl border" style={{ background: bg1, borderColor }}>
              <DiffView 
                leftData={leftData} 
                rightData={rightData}
                leftValue={leftValue}
                rightValue={rightValue}
                theme={theme}
              />
            </div>
          ) : (
            <>
              <div className="flex-1 min-w-0 overflow-hidden rounded-xl border" style={{ background: bg1, borderColor }}>
                <Panel label={layout === 'split' ? 'Panel A' : 'Editor'}
                  value={leftValue} onChange={setLeftValue}
                  parsedData={leftData} otherParsedData={rightData}
                  theme={theme}
                  validationErrors={leftValidationErrors}
                  onValidationErrorsChange={setLeftValidationErrors} />
              </div>

              {layout === 'split' && (
                <>
                  <div className="flex-shrink-0 w-px relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/10 to-transparent" />
                  </div>
                  <div className="flex-1 min-w-0 overflow-hidden rounded-xl border" style={{ background: bg1, borderColor }}>
                    <Panel label="Panel B"
                      value={rightValue} onChange={setRightValue}
                      parsedData={rightData} otherParsedData={leftData}
                      theme={theme}
                      validationErrors={rightValidationErrors}
                      onValidationErrorsChange={setRightValidationErrors} />
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Right sidebar ad — desktop only */}
        <div className="hidden lg:flex flex-shrink-0 w-[300px] p-3 pl-0 items-start">
          <div className="w-full rounded-xl overflow-hidden border" style={{ borderColor }}>
            <GoogleAd
              adSlot={import.meta.env.VITE_AD_SLOT_TOP}
              style={{ display: 'block', width: '300px', height: '250px' }}
              adFormat="rectangle"
              fullWidthResponsive={false}
            />
          </div>
        </div>
      </div>

      {/* Dismissible bottom ad — all screen sizes */}
      {showAd && (
        <div className="flex-shrink-0 border-t relative"
          style={{ borderColor, background: isLight ? '#f1f5f9' : '#0f172a' }}>
          <button
            onClick={() => setShowAd(false)}
            title="Close ad"
            className={`absolute top-1 right-2 z-10 w-6 h-6 flex items-center justify-center rounded-full transition-all ${
              isLight
                ? 'bg-slate-200 hover:bg-slate-300 text-slate-500 hover:text-slate-700'
                : 'bg-white/10 hover:bg-white/20 text-slate-400 hover:text-slate-200'
            }`}
          >
            <X size={12} />
          </button>
          <div className="flex justify-center px-4 py-2">
            <GoogleAd
              adSlot={import.meta.env.VITE_AD_SLOT_BOTTOM}
              style={{ display: 'block', width: '100%', maxWidth: '728px', height: '60px' }}
              adFormat="horizontal"
            />
          </div>
        </div>
      )}

      {/* Status bar */}
      <div className="flex items-center justify-between px-3 sm:px-6 h-7 border-t flex-shrink-0"
        style={{ background: bg0, borderColor }}>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono" style={{ color: isLight ? '#64748b' : '#64748b' }}>PrettyJSON v1.0</span>
        </div>
        <div className="flex items-center gap-4">
          {leftData && (
            <span className="text-[11px] font-mono text-emerald-500/80 hidden sm:block">
              Left: {Array.isArray(leftData) ? `${leftData.length} items` : `${Object.keys(leftData).length} keys`}
            </span>
          )}
          {rightData && layout === 'split' && (
            <span className="text-[11px] font-mono text-emerald-500/80 hidden sm:block">
              Right: {Array.isArray(rightData) ? `${rightData.length} items` : `${Object.keys(rightData).length} keys`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

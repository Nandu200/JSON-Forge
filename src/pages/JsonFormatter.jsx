import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { formatJSON, minifyJSON, syntaxHighlight } from '@/utils/jsonUtils';
import { parseJSONSafe, getDepthSafe, countKeysSafe, SIZE_LIMITS } from '@/utils/optimizedJsonUtils';
import { autoFixJSON } from '@/utils/schemaValidation';
import LZString from 'lz-string';
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
import PrivacyPolicy from '@/components/PrivacyPolicy';
import TermsOfService from '@/components/TermsOfService';
import AboutUs from '@/components/AboutUs';
import KeyboardShortcuts from '@/components/json/KeyboardShortcuts';
import { LayoutPanelLeft, Columns2, Copy, Check, Trash2, Minimize2, AlertCircle, CheckCircle2, Wrench, Eye, Upload, Undo2, Redo2, X, ClipboardPaste, Keyboard, Share2 } from 'lucide-react';

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
  const [queryMode, setQueryMode] = useState('path');
  const textareaRef = useRef(null);
  const overlayRef = useRef(null);
  const lineNumRef = useRef(null);
  const fileInputRef = useRef(null);
  const [treeMatchCount, setTreeMatchCount] = useState(0);
  const [treeMatchIndex, setTreeMatchIndex] = useState(0);
  const treeMatchNavRef = useRef({ next: () => {}, prev: () => {} });

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
      if (import.meta.env.DEV) console.log('[PrettyJSON] Undo', { index: historyIndexRef.current, chars: prevState.length });
      onChange(prevState);
    }
  }, [onChange]);

  const handleRedo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current++;
      skipHistoryRef.current = true;
      const nextState = historyRef.current[historyIndexRef.current];
      if (import.meta.env.DEV) console.log('[PrettyJSON] Redo', { index: historyIndexRef.current, chars: nextState.length });
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

  const handleScroll = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    if (overlayRef.current) {
      overlayRef.current.scrollTop = ta.scrollTop;
      overlayRef.current.scrollLeft = ta.scrollLeft;
    }
    if (lineNumRef.current) {
      lineNumRef.current.scrollTop = ta.scrollTop;
    }
  }, []);

  const handleSearchNext = useCallback(() => {
    if (searchMatches.length === 0 || !textareaRef.current) return;
    const nextIndex = (currentMatchIndex + 1) % searchMatches.length;
    setCurrentMatchIndex(nextIndex);
    const pos = searchMatches[nextIndex];
    requestAnimationFrame(() => {
      if (!textareaRef.current) return;
      textareaRef.current.focus({ preventScroll: true });
      textareaRef.current.setSelectionRange(pos, pos + filter.length);
      // Scroll textarea to show the match without moving the page
      const lines = value.substring(0, pos).split('\n');
      const lineHeight = 23;
      const targetScroll = (lines.length - 1) * lineHeight - textareaRef.current.clientHeight / 2;
      textareaRef.current.scrollTop = Math.max(0, targetScroll);
      handleScroll();
      updateCursorPos();
    });
  }, [searchMatches, currentMatchIndex, filter, value, updateCursorPos, handleScroll]);

  const handleSearchPrev = useCallback(() => {
    if (searchMatches.length === 0 || !textareaRef.current) return;
    const prevIndex = currentMatchIndex === 0 ? searchMatches.length - 1 : currentMatchIndex - 1;
    setCurrentMatchIndex(prevIndex);
    const pos = searchMatches[prevIndex];
    requestAnimationFrame(() => {
      if (!textareaRef.current) return;
      textareaRef.current.focus({ preventScroll: true });
      textareaRef.current.setSelectionRange(pos, pos + filter.length);
      const lines = value.substring(0, pos).split('\n');
      const lineHeight = 23;
      const targetScroll = (lines.length - 1) * lineHeight - textareaRef.current.clientHeight / 2;
      textareaRef.current.scrollTop = Math.max(0, targetScroll);
      handleScroll();
      updateCursorPos();
    });
  }, [searchMatches, currentMatchIndex, filter, value, updateCursorPos, handleScroll]);

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
    // Build a regex for correct case-insensitive replacement
    const flags = caseSensitive ? 'g' : 'gi';
    const escaped = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    newValue = newValue.replace(new RegExp(escaped, flags), replaceText);
    onChange(newValue);
    setFilter('');
  }, [value, onChange, caseSensitive]);

  const isLight = theme === 'light';

  // Tree view match info callback
  const handleTreeMatchInfo = useCallback((info) => {
    setTreeMatchCount(info.count);
    setTreeMatchIndex(info.currentIndex);
    treeMatchNavRef.current = { next: info.next, prev: info.prev };
  }, []);

  // Effective search match info depends on active view
  const effectiveMatchCount = view === 'tree' ? treeMatchCount : searchMatches.length;
  const effectiveMatchIndex = view === 'tree' ? treeMatchIndex : currentMatchIndex;
  const effectiveSearchNext = useCallback(() => {
    if (view === 'tree') treeMatchNavRef.current.next();
    else handleSearchNext();
  }, [view, handleSearchNext]);
  const effectiveSearchPrev = useCallback(() => {
    if (view === 'tree') treeMatchNavRef.current.prev();
    else handleSearchPrev();
  }, [view, handleSearchPrev]);

  // Use parsedData from parent — avoids redundant parseJSONSafe call
  const data = parsedData;
  const error = (!value || !value.trim()) ? null : (parsedData === null ? parseJSONSafe(value).error : null);
  const isEmpty = !value || !value.trim();
  const lineCount = value ? value.split('\n').length : 1;

  // Optimized line numbers — single pre element instead of thousands of DIVs
  const lineNumbersText = useMemo(() => {
    return Array.from({ length: Math.max(lineCount, 1) }, (_, i) => i + 1).join('\n');
  }, [lineCount]);

  // Build overlay HTML with search highlights baked in
  const overlayHTML = useMemo(() => {
    if (!value || !data) return '';
    const highlighted = syntaxHighlight(value);
    if (!filter || searchMatches.length === 0) return highlighted;

    // Insert highlight markers into the raw text, then syntax-highlight, then replace with <mark> tags
    const OPEN = '\x00MARK_OPEN\x00';
    const OPEN_CURRENT = '\x00MARK_CURRENT\x00';
    const CLOSE = '\x00MARK_CLOSE\x00';

    let marked = value;
    const sortedMatches = [...searchMatches].sort((a, b) => b - a);
    for (const pos of sortedMatches) {
      const isCurrent = pos === searchMatches[currentMatchIndex];
      const before = marked.substring(0, pos);
      const match = marked.substring(pos, pos + filter.length);
      const after = marked.substring(pos + filter.length);
      marked = before + (isCurrent ? OPEN_CURRENT : OPEN) + match + CLOSE + after;
    }

    let html = syntaxHighlight(marked);
    html = html.replace(/\x00MARK_CURRENT\x00/g, '<mark class="search-current">');
    html = html.replace(/\x00MARK_OPEN\x00/g, '<mark class="search-match">');
    html = html.replace(/\x00MARK_CLOSE\x00/g, '</mark>');

    return html;
  }, [value, data, filter, searchMatches, currentMatchIndex]);

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
      if (import.meta.env.DEV) console.log('[PrettyJSON] Format applied', { chars: f.length, lines: f.split('\n').length });
      onChange(f); 
      setScanning(true); 
      setTimeout(() => setScanning(false), 900); 
    }
  }, [value, onChange]);

  const handleMinify = useCallback(() => {
    const { minified, error: e } = minifyJSON(value);
    if (!e) {
      if (import.meta.env.DEV) console.log('[PrettyJSON] Minify applied', { chars: minified.length });
      onChange(minified);
    }
  }, [value, onChange]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      // Silently fail - clipboard API may not be available
    }
  }, [value]);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      const { formatted: f } = formatJSON(text);
      onChange(f || text);
      setScanning(true);
      setTimeout(() => setScanning(false), 900);
    } catch (err) {
      // Silently fail - clipboard API may not be available
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
    // When search is active, Enter/Shift+Enter navigates matches instead of editing
    if (e.key === 'Enter' && filter && searchMatches.length > 0) {
      e.preventDefault();
      if (e.shiftKey) handleSearchPrev(); else handleSearchNext();
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
  }, [value, onChange, handleUndo, handleRedo, filter, searchMatches, handleSearchNext, handleSearchPrev]);

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
                ? 'hover:bg-slate-100 text-slate-600 border border-transparent hover:border-slate-200'
                : 'hover:bg-white/[0.08] text-slate-300 border border-transparent hover:border-white/[0.1]'
            }`}>
            <Undo2 size={14} />
          </button>
          <button onClick={handleRedo} disabled={!canRedo}
            title="Redo (Ctrl+Shift+Z)"
            className={`w-7 h-7 flex items-center justify-center rounded transition-all disabled:opacity-30 ${
              isLight
                ? 'hover:bg-slate-100 text-slate-600 border border-transparent hover:border-slate-200'
                : 'hover:bg-white/[0.08] text-slate-300 border border-transparent hover:border-white/[0.1]'
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
                  : 'bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 border border-white/[0.1]'
              }`}>
              <Minimize2 size={11} /> Min
            </button>
            <button onClick={handlePaste}
              className={`px-2 h-7 text-[12px] font-mono rounded transition-all hidden sm:flex items-center gap-1 ${
                isLight 
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200' 
                  : 'bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 border border-white/[0.1]'
              }`}>
              <ClipboardPaste size={11} /> Paste
            </button>
            <button onClick={() => fileInputRef.current?.click()}
              className={`px-2 h-7 text-[12px] font-mono rounded transition-all flex items-center gap-1 hidden sm:flex ${
                isLight 
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200' 
                  : 'bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 border border-white/[0.1]'
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
                  : 'bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 border border-white/[0.1]'
              }`}>
              {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
            </button>
            <button onClick={() => onChange('')} disabled={!value}
              className={`w-7 h-7 flex items-center justify-center rounded transition-all disabled:opacity-30 ${
                isLight 
                  ? 'bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-500 border border-slate-200 hover:border-red-200' 
                  : 'bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-red-400 border border-white/[0.1]'
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
        onSearchNext={effectiveSearchNext}
        onSearchPrev={effectiveSearchPrev}
        onReplace={handleReplace}
        onReplaceAll={handleReplaceAll}
        searchMatchCount={effectiveMatchCount}
        currentMatchIndex={effectiveMatchIndex}
        caseSensitive={caseSensitive}
        onCaseSensitiveChange={setCaseSensitive}
        view={view}
        pathFilter={pathFilter}
        onPathFilter={setPathFilter}
        queryMode={queryMode}
        onQueryModeChange={setQueryMode}
        theme={theme}
      />

      {/* Content area */}
      <div className="flex-1 overflow-hidden relative">
        {view === 'raw' && (
          <>
            {scanning && <div className="scan-line" style={{ top: 0 }} />}
            {isEmpty && (
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: isLight ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.12)' }}>
                      <ClipboardPaste size={20} style={{ color: isLight ? '#3b82f6' : '#60a5fa' }} />
                    </div>
                  </div>
                  <span className="text-[14px] font-medium"
                    style={{ color: isLight ? '#334155' : '#e2e8f0' }}>Paste or drop your JSON</span>
                  <div className="flex items-center gap-3 pointer-events-auto">
                    <button
                      onClick={handlePaste}
                      className={`flex items-center gap-2 px-5 py-2 rounded-lg text-[13px] font-mono font-medium transition-all shadow-sm ${
                        isLight
                          ? 'bg-blue-500 hover:bg-blue-600 text-white'
                          : 'bg-blue-600 hover:bg-blue-500 text-white'
                      }`}
                    >
                      <ClipboardPaste size={14} />
                      Paste & Format
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-mono transition-all ${
                        isLight
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200'
                          : 'bg-white/[0.06] hover:bg-white/[0.1] text-slate-400 border border-white/[0.08]'
                      }`}
                    >
                      <Upload size={14} />
                      Upload File
                    </button>
                  </div>
                  <span className="text-[11px] font-mono mt-1"
                    style={{ color: isLight ? '#94a3b8' : '#475569' }}>or just start typing · Ctrl+V to paste</span>
                </div>
              </div>
            )}
            <div className="flex h-full overflow-hidden" style={{ paddingBottom: error ? '100px' : (value ? '28px' : 0) }}>
              {/* Line Numbers */}
              <div ref={lineNumRef} className="flex flex-shrink-0 overflow-hidden" style={{ background: lineNumBg }}>
                <pre className="line-numbers pt-3 pb-3 whitespace-pre">{lineNumbersText}</pre>
              </div>
              {/* Editor with syntax-highlighted overlay */}
              <div className="relative flex-1 overflow-hidden">
                {/* Syntax highlighted layer (read-only, behind textarea) */}
                {value && data && (
                  <pre
                    ref={overlayRef}
                    className="code-editor absolute inset-0 w-full h-full p-3 overflow-hidden font-mono text-[14px] leading-[23px] pointer-events-none"
                    style={{ background: 'transparent', tabSize: 2 }}
                    aria-hidden="true"
                    dangerouslySetInnerHTML={{ __html: overlayHTML }}
                  />
                )}
                <textarea
                  ref={textareaRef}
                  value={value}
                  onChange={e => onChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onScroll={handleScroll}
                  onClick={updateCursorPos}
                  onKeyUp={updateCursorPos}
                  spellCheck={false}
                  autoComplete="off"
                  className="code-editor absolute inset-0 w-full h-full p-3 resize-none overflow-auto font-mono text-[14px] leading-[23px]"
                  style={{
                    background: 'transparent',
                    color: (value && data) ? 'transparent' : (isLight ? '#0f172a' : '#f1f5f9'),
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
              queryMode={queryMode}
              sort={sort}
              theme={theme}
              validationErrors={validationErrors}
              onDataChange={(newData) => {
                onChange(JSON.stringify(newData, null, 2));
              }}
              onMatchInfo={handleTreeMatchInfo}
            />
          </ErrorBoundary>
        )}
        {view === 'table' && (
          <ErrorBoundary>
            <TableView data={parsedData} theme={theme} />
          </ErrorBoundary>
        )}
      </div>
    </div>
  );
}

export default function JsonFormatter() {
  const [leftValue, setLeftValue] = useState(() => sessionStorage.getItem('prettyjson_left') || '');
  const [rightValue, setRightValue] = useState(() => sessionStorage.getItem('prettyjson_right') || '');
  const [leftData, setLeftData] = useState(null);
  const [rightData, setRightData] = useState(null);
  const [leftValidationErrors, setLeftValidationErrors] = useState([]);
  const [rightValidationErrors, setRightValidationErrors] = useState([]);
  const [layout, setLayout] = useState(() => localStorage.getItem('prettyjson_layout') || 'single');
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('prettyjson_theme');
    if (saved) return saved;
    // System theme detection for first-time visitors
    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  });
  const [showAd, setShowAd] = useState(true);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Load JSON from URL hash on mount (share via URL)
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash && hash.startsWith('json=')) {
      try {
        const compressed = hash.slice(5);
        const json = LZString.decompressFromEncodedURIComponent(compressed);
        if (json) {
          const { formatted } = formatJSON(json);
          setLeftValue(formatted || json);
          // Clear hash after loading
          window.history.replaceState(null, '', window.location.pathname);
        }
      } catch {}
    }
  }, []);

  // Debounced sessionStorage writes for JSON values (avoid blocking on every keystroke)
  const storageTimerRef = useRef(null);
  useEffect(() => {
    clearTimeout(storageTimerRef.current);
    storageTimerRef.current = setTimeout(() => {
      try { sessionStorage.setItem('prettyjson_left', leftValue); } catch {}
    }, 300);
    return () => clearTimeout(storageTimerRef.current);
  }, [leftValue]);
  const storageTimerRef2 = useRef(null);
  useEffect(() => {
    clearTimeout(storageTimerRef2.current);
    storageTimerRef2.current = setTimeout(() => {
      try { sessionStorage.setItem('prettyjson_right', rightValue); } catch {}
    }, 300);
    return () => clearTimeout(storageTimerRef2.current);
  }, [rightValue]);
  useEffect(() => {
    localStorage.setItem('prettyjson_layout', layout);
  }, [layout]);
  useEffect(() => {
    localStorage.setItem('prettyjson_theme', theme);
  }, [theme]);

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

  // Initialize
  useEffect(() => {
    if (import.meta.env.DEV) console.log('[PrettyJSON] App initialized', { theme, layout });
  }, []);

  // Share JSON via URL (compressed, max ~5KB input)
  const handleShare = useCallback(() => {
    if (!leftValue || !leftValue.trim()) return;
    // Limit shareable size to ~5KB
    if (leftValue.length > 5120) {
      alert('JSON is too large to share via URL. Maximum size is 5KB.');
      return;
    }
    const compressed = LZString.compressToEncodedURIComponent(leftValue);
    const url = `${window.location.origin}${window.location.pathname}#json=${compressed}`;
    try {
      navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {}
  }, [leftValue]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      const mod = e.ctrlKey || e.metaKey;
      // Ctrl+Shift+F — Format
      if (mod && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        const { formatted } = formatJSON(leftValue);
        if (formatted) setLeftValue(formatted);
        return;
      }
      // Ctrl+K — Shortcuts overlay
      if (mod && e.key === 'k') {
        e.preventDefault();
        setShowShortcuts(s => !s);
        return;
      }
      // Ctrl+M — Minify
      if (mod && e.key === 'm') {
        e.preventDefault();
        const { minified } = minifyJSON(leftValue);
        if (minified) setLeftValue(minified);
        return;
      }
      // Ctrl+D — Toggle diff
      if (mod && e.key === 'd' && !e.shiftKey) {
        e.preventDefault();
        setLayout(l => l === 'diff' ? 'single' : 'diff');
        return;
      }
      // Ctrl+S — Quick download JSON
      if (mod && e.key === 's') {
        e.preventDefault();
        if (leftValue && leftValue.trim()) {
          const blob = new Blob([leftValue], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'prettyjson-export.json';
          a.click();
          URL.revokeObjectURL(url);
        }
        return;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [leftValue]);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: bg0, color: isLight ? '#334155' : '#cbd5e1' }} data-theme={theme}>
      <div className="flex flex-col h-[100dvh] overflow-hidden mono-grid flex-shrink-0">
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
                  : isLight ? 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'}`}>
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
        <button
          onClick={() => setShowShortcuts(true)}
          title="Keyboard shortcuts (Ctrl+K)"
          className={`flex items-center gap-1.5 px-2 h-7 rounded text-[11px] font-mono transition-all ${
            isLight ? 'text-slate-500 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
          }`}
        >
          <Keyboard size={13} />
          <span className="hidden sm:inline">Shortcuts</span>
        </button>
        <button
          onClick={handleShare}
          disabled={!leftValue || !leftValue.trim()}
          title="Share JSON via URL (copies link)"
          className={`flex items-center gap-1.5 px-2 h-7 rounded text-[11px] font-mono transition-all disabled:opacity-30 ${
            shareCopied
              ? 'text-emerald-500'
              : isLight ? 'text-slate-500 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
          }`}
        >
          {shareCopied ? <Check size={13} /> : <Share2 size={13} />}
          <span className="hidden sm:inline">{shareCopied ? 'Link Copied!' : 'Share'}</span>
        </button>
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
        <div className="hidden lg:flex flex-col flex-shrink-0 w-[300px] p-3 pl-0 gap-3 items-start">
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
          <span style={{ color: isLight ? '#cbd5e1' : '#334155' }}>·</span>
          <button
            onClick={() => setShowPrivacy(true)}
            className="text-[11px] font-mono hover:underline"
            style={{ color: isLight ? '#64748b' : '#64748b' }}
          >
            Privacy Policy
          </button>
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

      {/* Privacy Policy Modal inside the app container is fine but lets put it outside so it covers everything */}

      </div> {/* End of app container */}

      {/* SEO and Footer Section for AdSense/Search Engines */}
      <div className="w-full border-t flex-1 font-sans" style={{ background: isLight ? '#ffffff' : '#0f172a', borderColor }}>
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="md:col-span-2 space-y-8">
              <section>
                <h1 className="text-3xl font-bold mb-4" style={{ color: isLight ? '#0f172a' : '#f8fafc' }}>Free Online JSON Formatter to Prettify JSON</h1>
                <p className="leading-relaxed mb-4">
                  PrettyJSON is a powerful, secure, and free online tool designed for developers to format, validate, parse, and <strong>pretty print JSON</strong> data. 
                  Whether you are debugging API responses, formatting configuration files, or simply need a fast <strong>JSON pretty formatter</strong> to clean up messy payloads, our tool provides an intuitive interface to make your work easier.
                </p>
                <p className="leading-relaxed">
                  Unlike other tools, PrettyJSON processes all your data locally in your browser. Your JSON data is never sent to our servers, ensuring complete privacy and security for your sensitive information.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-3" style={{ color: isLight ? '#0f172a' : '#f8fafc' }}>Key Features</h2>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Format & Prettify:</strong> Instantly convert minified or messy strings into beautifully indented, readable syntax with our <strong>pretty print JSON</strong> engine.</li>
                  <li><strong>Validate & Auto-Repair:</strong> Detect syntax errors instantly. Our auto-repair feature can fix common mistakes like missing quotes, trailing commas, and unescaped characters.</li>
                  <li><strong>Tree & Table Views:</strong> Visualize complex nested objects and arrays with our interactive Tree viewer, or flatten your data into a Table.</li>
                  <li><strong>JSON Diff:</strong> Compare two JSON files side-by-side to highlight additions, deletions, and modifications.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-3" style={{ color: isLight ? '#0f172a' : '#f8fafc' }}>What is JSON?</h2>
                <p className="leading-relaxed">
                  JSON (JavaScript Object Notation) is a lightweight data-interchange format that is easy for humans to read and write and easy for machines to parse and generate. It is widely used in APIs, configuration files, and data storage.
                </p>
              </section>
            </div>

            <div>
              <div className="p-6 rounded-xl border" style={{ background: isLight ? '#f8fafc' : '#1e293b', borderColor }}>
                <h3 className="text-lg font-bold mb-4" style={{ color: isLight ? '#0f172a' : '#f8fafc' }}>Legal & Resources</h3>
                <ul className="space-y-3">
                  <li>
                    <button onClick={() => setShowPrivacy(true)} className="hover:underline text-blue-500">Privacy Policy</button>
                  </li>
                  <li>
                    <button onClick={() => setShowTerms(true)} className="hover:underline text-blue-500">Terms of Service</button>
                  </li>
                  <li>
                    <button onClick={() => setShowAbout(true)} className="hover:underline text-blue-500">About PrettyJSON</button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-16 pt-8 border-t text-center text-sm" style={{ borderColor, color: isLight ? '#64748b' : '#94a3b8' }}>
            <p>&copy; {new Date().getFullYear()} PrettyJSON. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <PrivacyPolicy open={showPrivacy} onClose={() => setShowPrivacy(false)} theme={theme} />
      <TermsOfService open={showTerms} onClose={() => setShowTerms(false)} theme={theme} />
      <AboutUs open={showAbout} onClose={() => setShowAbout(false)} theme={theme} />

      {/* Keyboard Shortcuts Overlay */}
      <KeyboardShortcuts open={showShortcuts} onClose={() => setShowShortcuts(false)} theme={theme} />
    </div>
  );
}

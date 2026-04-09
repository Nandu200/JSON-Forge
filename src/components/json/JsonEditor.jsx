import React, { useState, useRef, useEffect, useCallback } from 'react';
import { formatJSON, minifyJSON, parseJSON, syntaxHighlight } from '@/utils/jsonUtils';
import { Copy, Check, Trash2, Minimize2, AlertCircle, CheckCircle2 } from 'lucide-react';

const PLACEHOLDER = `{
  "paste": "your JSON here",
  "or": "start typing...",
  "supports": ["arrays", "objects", "nested"],
  "version": 1
}`;

export default function JsonEditor({ value, onChange, label, onParsed, hideHeader = false }) {
  const [copied, setCopied] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [formatted, setFormatted] = useState(false);
  const textareaRef = useRef(null);
  const overlayRef = useRef(null);

  const { data, error } = parseJSON(value);

  useEffect(() => {
    if (onParsed) onParsed(data);
  }, [data]);

  // Sync scroll between textarea and overlay
  const syncScroll = useCallback(() => {
    if (overlayRef.current && textareaRef.current) {
      overlayRef.current.scrollTop = textareaRef.current.scrollTop;
      overlayRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  const handleFormat = useCallback(() => {
    const { formatted: f, error: e } = formatJSON(value);
    if (!e) {
      onChange(f);
      setScanning(true);
      setFormatted(true);
      setTimeout(() => setScanning(false), 900);
      setTimeout(() => setFormatted(false), 2000);
    }
  }, [value, onChange]);

  const handleMinify = useCallback(() => {
    const { minified, error: e } = minifyJSON(value);
    if (!e) onChange(minified);
  }, [value, onChange]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [value]);

  const handleClear = useCallback(() => onChange(''), [onChange]);

  const handlePaste = useCallback(async () => {
    const text = await navigator.clipboard.readText();
    onChange(text);
    const { formatted: f } = formatJSON(text);
    if (f) {
      onChange(f);
      setScanning(true);
      setTimeout(() => setScanning(false), 900);
    }
  }, [onChange]);

  const handleKeyDown = useCallback((e) => {
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
  }, [value, onChange]);

  const isEmpty = !value.trim();
  const highlighted = value ? syntaxHighlight(value) : '';
  const lineCount = value ? value.split('\n').length : 1;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-11 border-b border-white/[0.05] flex-shrink-0 bg-black/20">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-slate-500">{label}</span>
          {data !== null && !error && (
            <CheckCircle2 size={12} className="text-emerald-400" />
          )}
          {error && value && (
            <div className="flex items-center gap-1">
              <AlertCircle size={12} className="text-red-400" />
              <span className="text-[10px] text-red-400/80 font-mono truncate max-w-[200px]">{error}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleFormat}
            disabled={!value}
            className="px-3 h-7 text-[11px] font-mono rounded bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/20 hover:border-blue-500/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Format
          </button>
          <button
            onClick={handleMinify}
            disabled={!value}
            className="px-3 h-7 text-[11px] font-mono rounded bg-white/[0.03] hover:bg-white/[0.06] text-slate-400 border border-white/[0.05] hover:border-white/[0.1] transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <Minimize2 size={10} />
            Min
          </button>
          <button
            onClick={handlePaste}
            className="px-3 h-7 text-[11px] font-mono rounded bg-white/[0.03] hover:bg-white/[0.06] text-slate-400 border border-white/[0.05] hover:border-white/[0.1] transition-all flex items-center gap-1"
          >
            Paste
          </button>
          <button
            onClick={handleCopy}
            disabled={!value}
            className="w-7 h-7 flex items-center justify-center rounded bg-white/[0.03] hover:bg-white/[0.06] text-slate-400 border border-white/[0.05] hover:border-white/[0.1] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          </button>
          <button
            onClick={handleClear}
            disabled={!value}
            className="w-7 h-7 flex items-center justify-center rounded bg-white/[0.03] hover:bg-white/[0.06] text-slate-400 hover:text-red-400 border border-white/[0.05] hover:border-red-500/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 overflow-hidden relative">
        {scanning && <div className="scan-line" style={{ top: 0 }} />}

        {/* Empty Drop Zone */}
        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="flex flex-col items-center gap-3">
              <svg width="180" height="100" className="opacity-40">
                <rect
                  x="2" y="2" width="176" height="96" rx="8" ry="8"
                  fill="none"
                  stroke="rgba(59,130,246,0.5)"
                  strokeWidth="1.5"
                  strokeDasharray="8 4"
                  className="drop-zone-dash"
                />
              </svg>
              <div className="absolute flex flex-col items-center gap-2">
                <span className="text-[11px] font-mono text-blue-400/60 tracking-widest uppercase">Paste JSON here</span>
                <span className="text-[9px] font-mono text-slate-600 tracking-widest">or click Paste button</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex h-full overflow-hidden">
          {/* Line Numbers */}
          <div className="line-numbers pt-3 pb-3 overflow-hidden flex-shrink-0" style={{ background: '#080910' }}>
            {Array.from({ length: Math.max(lineCount, 1) }).map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>

          {/* Editor + Overlay Container */}
          <div className="relative flex-1 overflow-hidden">
            {/* Syntax highlighted overlay */}
            <div
              ref={overlayRef}
              className="absolute inset-0 overflow-auto pointer-events-none"
              aria-hidden="true"
            >
              <pre
                className="code-editor p-3 text-transparent"
                dangerouslySetInnerHTML={{ __html: highlighted }}
                style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
              />
            </div>

            {/* Raw textarea */}
            <textarea
              ref={textareaRef}
              value={value}
              onChange={e => onChange(e.target.value)}
              onScroll={syncScroll}
              onKeyDown={handleKeyDown}
              placeholder=""
              spellCheck={false}
              autoComplete="off"
              className="code-editor absolute inset-0 w-full h-full p-3 text-transparent caret-blue-400 selection:bg-blue-500/20 resize-none overflow-auto"
              style={{
                background: 'transparent',
                color: 'transparent',
                caretColor: '#3B82F6',
              }}
            />
          </div>
        </div>
      </div>

      {/* Footer status */}
      {value && (
        <div className="flex items-center gap-4 px-4 h-8 border-t border-white/[0.04] flex-shrink-0">
          <span className="text-[10px] font-mono text-slate-600">{lineCount} lines</span>
          <span className="text-[10px] font-mono text-slate-600">{value.length} chars</span>
          {data !== null && (
            <span className="text-[10px] font-mono text-emerald-500/60">✓ Valid JSON</span>
          )}
          {formatted && (
            <span className="text-[10px] font-mono text-blue-400/60 panel-enter">Formatted</span>
          )}
        </div>
      )}
    </div>
  );
}
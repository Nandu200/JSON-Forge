import React, { useMemo, useRef, useCallback, useEffect } from 'react';
import { diffJSON } from '@/utils/jsonUtils';
import { GitCompare } from 'lucide-react';

/**
 * Compute line-level diff using LCS-based approach for accurate line matching
 */
function computeLineDiff(leftLines, rightLines) {
  const m = leftLines.length;
  const n = rightLines.length;

  // For very large files, fall back to simple comparison
  if (m * n > 1000000) {
    return simpleLineDiff(leftLines, rightLines);
  }

  // LCS DP table
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (leftLines[i - 1] === rightLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to build aligned lines
  const alignedLeft = [];
  const alignedRight = [];
  const lineTypes = [];
  let i = m, j = n;

  const result = [];
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && leftLines[i - 1] === rightLines[j - 1]) {
      result.push({ left: leftLines[i - 1], right: rightLines[j - 1], type: 'equal', leftNum: i, rightNum: j });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.push({ left: null, right: rightLines[j - 1], type: 'added', leftNum: null, rightNum: j });
      j--;
    } else {
      result.push({ left: leftLines[i - 1], right: null, type: 'removed', leftNum: i, rightNum: null });
      i--;
    }
  }

  result.reverse();

  // Detect modified lines (adjacent remove+add with similar content)
  for (let k = 0; k < result.length - 1; k++) {
    if (result[k].type === 'removed' && result[k + 1].type === 'added') {
      result[k].type = 'modified';
      result[k].right = result[k + 1].right;
      result[k].rightNum = result[k + 1].rightNum;
      result.splice(k + 1, 1);
    }
  }

  return result;
}

function simpleLineDiff(leftLines, rightLines) {
  const maxLen = Math.max(leftLines.length, rightLines.length);
  const result = [];
  for (let i = 0; i < maxLen; i++) {
    const left = i < leftLines.length ? leftLines[i] : null;
    const right = i < rightLines.length ? rightLines[i] : null;
    if (left === right) {
      result.push({ left, right, type: 'equal', leftNum: i + 1, rightNum: i + 1 });
    } else if (left === null) {
      result.push({ left: null, right, type: 'added', leftNum: null, rightNum: i + 1 });
    } else if (right === null) {
      result.push({ left, right: null, type: 'removed', leftNum: i + 1, rightNum: null });
    } else {
      result.push({ left, right, type: 'modified', leftNum: i + 1, rightNum: i + 1 });
    }
  }
  return result;
}

function DiffPanel({ label, lines, diffLines, side, scrollRef, onScroll, isLight }) {
  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b flex-shrink-0"
        style={{ background: isLight ? '#f8fafc' : '#161b22', borderColor: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.05)' }}>
        <span className="text-[11px] font-mono font-medium" style={{ color: isLight ? '#334155' : '#cbd5e1' }}>{label}</span>
        <span className="text-[10px] font-mono" style={{ color: isLight ? '#94a3b8' : '#64748b' }}>{lines.length} lines</span>
      </div>
      {/* Panel Content */}
      <div className="flex-1 overflow-auto" ref={scrollRef} onScroll={onScroll}>
        {diffLines.map((dl, idx) => {
          const line = side === 'left' ? dl.left : dl.right;
          const lineNum = side === 'left' ? dl.leftNum : dl.rightNum;
          const isEmpty = line === null;

          let bg = '';
          let textColor = isLight ? '#334155' : '#cbd5e1';
          let gutterColor = isLight ? '#94a3b8' : '#64748b';
          let gutterBg = '';
          let marker = ' ';

          if (dl.type === 'modified') {
            bg = side === 'left'
              ? (isLight ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.12)')
              : (isLight ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.12)');
            textColor = side === 'left'
              ? (isLight ? '#dc2626' : '#fca5a5')
              : (isLight ? '#059669' : '#6ee7b7');
            gutterBg = side === 'left'
              ? (isLight ? 'rgba(239,68,68,0.06)' : 'rgba(239,68,68,0.08)')
              : (isLight ? 'rgba(16,185,129,0.06)' : 'rgba(16,185,129,0.08)');
            marker = side === 'left' ? '−' : '+';
          } else if (dl.type === 'removed') {
            bg = side === 'left' ? (isLight ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.12)') : '';
            textColor = side === 'left' ? (isLight ? '#dc2626' : '#fca5a5') : (isLight ? '#94a3b8' : '#475569');
            gutterBg = side === 'left' ? (isLight ? 'rgba(239,68,68,0.06)' : 'rgba(239,68,68,0.08)') : '';
            marker = side === 'left' ? '−' : ' ';
          } else if (dl.type === 'added') {
            bg = side === 'right' ? (isLight ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.12)') : '';
            textColor = side === 'right' ? (isLight ? '#059669' : '#6ee7b7') : (isLight ? '#94a3b8' : '#475569');
            gutterBg = side === 'right' ? (isLight ? 'rgba(16,185,129,0.06)' : 'rgba(16,185,129,0.08)') : '';
            marker = side === 'right' ? '+' : ' ';
          }

          return (
            <div key={idx} className="flex font-mono text-[12px] leading-[20px]" style={{ background: bg }}>
              <span className="w-10 text-right pr-2 select-none flex-shrink-0" style={{ background: gutterBg, color: gutterColor }}>
                {lineNum ?? ''}
              </span>
              <span className="w-4 text-center select-none flex-shrink-0" style={{
                color: marker === '−' ? (isLight ? '#dc2626' : '#f87171') : marker === '+' ? (isLight ? '#059669' : '#34d399') : 'transparent'
              }}>
                {marker}
              </span>
              <span className="flex-1 whitespace-pre" style={{ color: textColor, opacity: isEmpty ? 0 : 1 }}>
                {isEmpty ? ' ' : line}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DiffView({ leftData, rightData, leftValue = '', rightValue = '', theme = 'light' }) {
  const isLight = theme === 'light';
  const leftScrollRef = useRef(null);
  const rightScrollRef = useRef(null);
  const isSyncing = useRef(false);

  const syncScroll = useCallback((source) => {
    if (isSyncing.current) return;
    isSyncing.current = true;
    const sourceEl = source === 'left' ? leftScrollRef.current : rightScrollRef.current;
    const targetEl = source === 'left' ? rightScrollRef.current : leftScrollRef.current;
    if (sourceEl && targetEl) {
      targetEl.scrollTop = sourceEl.scrollTop;
    }
    requestAnimationFrame(() => { isSyncing.current = false; });
  }, []);

  const diffResult = useMemo(() => {
    if (!leftData || !rightData) return { diffLines: [], stats: { added: 0, removed: 0, modified: 0 } };

    const leftLines = leftValue ? leftValue.split('\n') : JSON.stringify(leftData, null, 2).split('\n');
    const rightLines = rightValue ? rightValue.split('\n') : JSON.stringify(rightData, null, 2).split('\n');
    const diffLines = computeLineDiff(leftLines, rightLines);

    const stats = {
      added: diffLines.filter(d => d.type === 'added').length,
      removed: diffLines.filter(d => d.type === 'removed').length,
      modified: diffLines.filter(d => d.type === 'modified').length,
    };

    return { leftLines, rightLines, diffLines, stats };
  }, [leftData, rightData, leftValue, rightValue]);

  const { leftLines = [], rightLines = [], diffLines, stats } = diffResult;

  if (!leftData || !rightData) {
    return (
      <div className="flex items-center justify-center h-full flex-col gap-3">
        <GitCompare size={28} style={{ color: isLight ? '#94a3b8' : '#475569' }} />
        <span className="text-[11px] font-mono tracking-widest uppercase" style={{ color: isLight ? '#64748b' : '#64748b' }}>
          Provide valid JSON in both panels
        </span>
      </div>
    );
  }

  if (stats.added === 0 && stats.removed === 0 && stats.modified === 0) {
    return (
      <div className="flex items-center justify-center h-full flex-col gap-3">
        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: isLight ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.1)' }}>
          <GitCompare size={20} style={{ color: isLight ? '#059669' : '#34d399' }} />
        </div>
        <span className="text-[12px] font-mono" style={{ color: isLight ? '#059669' : '#34d399' }}>Identical JSON</span>
        <span className="text-[10px] font-mono" style={{ color: isLight ? '#94a3b8' : '#64748b' }}>No differences found</span>
      </div>
    );
  }

  const totalChanges = stats.added + stats.removed + stats.modified;

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: isLight ? '#ffffff' : '#0d1117' }}>
      {/* Stats Bar */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-1.5 border-b"
        style={{ background: isLight ? '#f8fafc' : '#161b22', borderColor: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-3">
          <GitCompare size={13} style={{ color: isLight ? '#94a3b8' : '#64748b' }} />
          <span className="text-[11px] font-mono" style={{ color: isLight ? '#475569' : '#94a3b8' }}>{totalChanges} change{totalChanges !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-3">
          {stats.removed > 0 && (
            <span className="text-[10px] font-mono" style={{ color: isLight ? '#dc2626' : '#f87171' }}>−{stats.removed} removed</span>
          )}
          {stats.added > 0 && (
            <span className="text-[10px] font-mono" style={{ color: isLight ? '#059669' : '#34d399' }}>+{stats.added} added</span>
          )}
          {stats.modified > 0 && (
            <span className="text-[10px] font-mono" style={{ color: isLight ? '#d97706' : '#fbbf24' }}>~{stats.modified} modified</span>
          )}
        </div>
      </div>

      {/* Two-Panel Diff */}
      <div className="flex-1 flex overflow-hidden">
        <DiffPanel
          label="Left (Original)"
          lines={leftLines}
          diffLines={diffLines}
          side="left"
          scrollRef={leftScrollRef}
          onScroll={() => syncScroll('left')}
          isLight={isLight}
        />
        <div className="w-px flex-shrink-0" style={{ background: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.08)' }} />
        <DiffPanel
          label="Right (Modified)"
          lines={rightLines}
          diffLines={diffLines}
          side="right"
          scrollRef={rightScrollRef}
          onScroll={() => syncScroll('right')}
          isLight={isLight}
        />
      </div>
    </div>
  );
}

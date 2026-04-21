import React, { useMemo, useRef, useCallback, useEffect, useState } from 'react';
import { GitCompare, FileText, GitBranch } from 'lucide-react';
import { diffArrays } from 'diff';

/**
 * Compute line-level diff using Myers algorithm (via jsdiff).
 * O(nd) time/space — handles large files without OOM.
 */
function computeLineDiff(leftLines, rightLines) {
  const changes = diffArrays(leftLines, rightLines);
  const result = [];
  let leftNum = 1;
  let rightNum = 1;

  for (let ci = 0; ci < changes.length; ci++) {
    const change = changes[ci];

    if (!change.added && !change.removed) {
      for (const line of change.value) {
        result.push({ left: line, right: line, type: 'equal', leftNum: leftNum++, rightNum: rightNum++ });
      }
    } else if (change.removed) {
      const next = changes[ci + 1];
      if (next && next.added) {
        // Pair removed + added as modifications
        const maxLen = Math.max(change.value.length, next.value.length);
        for (let i = 0; i < maxLen; i++) {
          const left = i < change.value.length ? change.value[i] : null;
          const right = i < next.value.length ? next.value[i] : null;
          if (left !== null && right !== null) {
            result.push({ left, right, type: 'modified', leftNum: leftNum++, rightNum: rightNum++ });
          } else if (left !== null) {
            result.push({ left, right: null, type: 'removed', leftNum: leftNum++, rightNum: null });
          } else {
            result.push({ left: null, right, type: 'added', leftNum: null, rightNum: rightNum++ });
          }
        }
        ci++; // Skip the consumed 'added' block
      } else {
        for (const line of change.value) {
          result.push({ left: line, right: null, type: 'removed', leftNum: leftNum++, rightNum: null });
        }
      }
    } else if (change.added) {
      for (const line of change.value) {
        result.push({ left: null, right: line, type: 'added', leftNum: null, rightNum: rightNum++ });
      }
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
        <span className="text-[12px] font-mono font-medium" style={{ color: isLight ? '#1e293b' : '#e2e8f0' }}>{label}</span>
        <span className="text-[11px] font-mono" style={{ color: isLight ? '#64748b' : '#94a3b8' }}>{lines.length} lines</span>
      </div>
      {/* Panel Content */}
      <div className="flex-1 overflow-auto" ref={scrollRef} onScroll={onScroll}>
        {diffLines.map((dl, idx) => {
          const line = side === 'left' ? dl.left : dl.right;
          const lineNum = side === 'left' ? dl.leftNum : dl.rightNum;
          const isEmpty = line === null;

          let bg = '';
          let textColor = isLight ? '#1e293b' : '#e2e8f0';
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
            <div key={idx} className="flex font-mono text-[11px] md:text-[13px] leading-[20px] md:leading-[22px]" style={{ background: bg }}>
              <span className="w-8 md:w-10 text-right pr-2 select-none flex-shrink-0" style={{ background: gutterBg, color: gutterColor }}>
                {lineNum ?? ''}
              </span>
              <span className="w-3 md:w-4 text-center select-none flex-shrink-0" style={{
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

/**
 * Deep-sort object keys recursively for consistent comparison.
 * Arrays preserve element order; only object key order is normalized.
 */
function deepSortKeys(value) {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(deepSortKeys);
  return Object.keys(value).sort().reduce((sorted, key) => {
    sorted[key] = deepSortKeys(value[key]);
    return sorted;
  }, {});
}

/**
 * Compute structural diff between two JSON values.
 * Returns a tree of diff entries with type annotations.
 */
function computeTreeDiff(left, right, path = '') {
  const leftType = left === null ? 'null' : Array.isArray(left) ? 'array' : typeof left;
  const rightType = right === null ? 'null' : Array.isArray(right) ? 'array' : typeof right;

  // Both undefined/missing
  if (left === undefined && right === undefined) return null;

  // Added
  if (left === undefined) return { path, type: 'added', value: right, valueType: rightType };
  // Removed
  if (right === undefined) return { path, type: 'removed', value: left, valueType: leftType };

  // Type mismatch
  if (leftType !== rightType) {
    return { path, type: 'modified', oldValue: left, newValue: right, oldType: leftType, newType: rightType };
  }

  // Primitives
  if (leftType !== 'object' || left === null) {
    if (left === right) return { path, type: 'equal', value: left, valueType: leftType };
    return { path, type: 'modified', oldValue: left, newValue: right, oldType: leftType, newType: rightType };
  }

  // Arrays
  if (Array.isArray(left)) {
    const children = [];
    const maxLen = Math.max(left.length, right.length);
    let hasChanges = false;
    for (let i = 0; i < maxLen; i++) {
      const child = computeTreeDiff(left[i], right[i], `${path}[${i}]`);
      if (child) {
        children.push({ ...child, key: i });
        if (child.type !== 'equal') hasChanges = true;
      }
    }
    return { path, type: hasChanges ? 'modified-children' : 'equal', valueType: 'array', children, count: maxLen };
  }

  // Objects
  const allKeys = new Set([...Object.keys(left), ...Object.keys(right)]);
  const children = [];
  let hasChanges = false;
  for (const key of [...allKeys].sort()) {
    const child = computeTreeDiff(left[key], right[key], path ? `${path}.${key}` : key);
    if (child) {
      children.push({ ...child, key });
      if (child.type !== 'equal') hasChanges = true;
    }
  }
  return { path, type: hasChanges ? 'modified-children' : 'equal', valueType: 'object', children, count: allKeys.size };
}

function DiffTreeNode({ node, depth = 0, isLight, defaultExpanded = true }) {
  const [collapsed, setCollapsed] = useState(depth > 4 && node.type === 'equal');
  const indent = depth * 20;

  const hasChildren = node.children && node.children.length > 0;
  const isContainer = node.valueType === 'object' || node.valueType === 'array';

  // Colors based on diff type
  let bgColor = 'transparent';
  let keyColor = isLight ? '#1e293b' : '#93c5fd';
  let badge = null;

  if (node.type === 'added') {
    bgColor = isLight ? 'rgba(16,185,129,0.06)' : 'rgba(16,185,129,0.08)';
    keyColor = isLight ? '#059669' : '#6ee7b7';
    badge = { text: 'added', color: isLight ? '#059669' : '#34d399', bg: isLight ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.15)' };
  } else if (node.type === 'removed') {
    bgColor = isLight ? 'rgba(239,68,68,0.05)' : 'rgba(239,68,68,0.08)';
    keyColor = isLight ? '#dc2626' : '#fca5a5';
    badge = { text: 'removed', color: isLight ? '#dc2626' : '#f87171', bg: isLight ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.12)' };
  } else if (node.type === 'modified') {
    bgColor = isLight ? 'rgba(245,158,11,0.05)' : 'rgba(245,158,11,0.08)';
    keyColor = isLight ? '#d97706' : '#fbbf24';
    badge = { text: 'changed', color: isLight ? '#d97706' : '#fbbf24', bg: isLight ? 'rgba(245,158,11,0.1)' : 'rgba(245,158,11,0.12)' };
  } else if (node.type === 'modified-children') {
    keyColor = isLight ? '#1e293b' : '#e2e8f0';
  }

  const formatValue = (val) => {
    if (val === null) return 'null';
    if (typeof val === 'string') return `"${val.length > 60 ? val.slice(0, 60) + '…' : val}"`;
    if (typeof val === 'boolean') return String(val);
    if (typeof val === 'number') return String(val);
    if (Array.isArray(val)) return `[${val.length} items]`;
    if (typeof val === 'object') return `{${Object.keys(val).length} keys}`;
    return String(val);
  };

  const typeColor = (t) => {
    const colors = isLight
      ? { string: '#059669', number: '#d97706', boolean: '#db2777', null: '#db2777' }
      : { string: '#10B981', number: '#F59E0B', boolean: '#EC4899', null: '#EC4899' };
    return colors[t] || (isLight ? '#64748b' : '#94a3b8');
  };

  return (
    <div>
      <div
        className="flex items-center min-h-[28px] px-2 rounded-md transition-colors font-mono text-xs"
        style={{ paddingLeft: indent + 8, background: bgColor }}
      >
        {/* Expand/collapse for containers */}
        {isContainer && hasChildren ? (
          <button onClick={() => setCollapsed(c => !c)}
            className="flex-shrink-0 w-4 h-4 mr-1 transition-colors"
            style={{ color: isLight ? '#94a3b8' : 'rgba(96,165,250,0.6)' }}>
            {collapsed
              ? <span style={{ fontSize: 10 }}>▶</span>
              : <span style={{ fontSize: 10 }}>▼</span>}
          </button>
        ) : (
          <span className="w-4 mr-1 flex-shrink-0" />
        )}

        {/* Key */}
        {node.key !== undefined && (
          <>
            <span className="font-medium mr-1" style={{ color: keyColor }}>
              {typeof node.key === 'number' ? `[${node.key}]` : String(node.key)}
            </span>
            <span style={{ color: isLight ? '#94a3b8' : '#475569' }} className="mr-1">:</span>
          </>
        )}

        {/* Value display */}
        {node.type === 'modified' && !isContainer ? (
          <span className="flex items-center gap-1.5 flex-wrap">
            <span style={{ color: isLight ? '#dc2626' : '#fca5a5', textDecoration: 'line-through', opacity: 0.7 }}>
              {formatValue(node.oldValue)}
            </span>
            <span style={{ color: isLight ? '#94a3b8' : '#475569' }}>→</span>
            <span style={{ color: isLight ? '#059669' : '#6ee7b7' }}>
              {formatValue(node.newValue)}
            </span>
          </span>
        ) : node.type === 'added' ? (
          <span style={{ color: typeColor(node.valueType) }}>
            {isContainer ? (node.valueType === 'array' ? `[${node.count || 0}]` : `{${node.count || 0}}`) : formatValue(node.value)}
          </span>
        ) : node.type === 'removed' ? (
          <span style={{ color: typeColor(node.valueType), opacity: 0.7 }}>
            {isContainer ? (node.valueType === 'array' ? `[${node.count || 0}]` : `{${node.count || 0}}`) : formatValue(node.value)}
          </span>
        ) : node.type === 'equal' && !isContainer ? (
          <span style={{ color: typeColor(node.valueType), opacity: 0.6 }}>
            {formatValue(node.value)}
          </span>
        ) : isContainer && collapsed ? (
          <span style={{ color: isLight ? '#94a3b8' : '#64748b' }}>
            {node.valueType === 'array' ? `[${node.count}]` : `{${node.count}}`}
          </span>
        ) : isContainer ? (
          <span style={{ color: isLight ? '#94a3b8' : '#64748b' }}>
            {node.valueType === 'array' ? '[' : '{'}
          </span>
        ) : null}

        {/* Badge */}
        {badge && (
          <span className="ml-2 text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-full flex-shrink-0"
            style={{ color: badge.color, background: badge.bg }}>
            {badge.text}
          </span>
        )}

        {/* Count for modified-children containers */}
        {node.type === 'modified-children' && isContainer && !collapsed && (
          <span className="ml-1.5 text-[10px]" style={{ color: isLight ? '#d97706' : '#fbbf24', opacity: 0.6 }}>
            {node.children.filter(c => c.type !== 'equal').length} change{node.children.filter(c => c.type !== 'equal').length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Children */}
      {isContainer && hasChildren && !collapsed && (
        <div className="relative">
          <div className="absolute pointer-events-none"
            style={{
              left: indent + 12, top: 0, bottom: 0, width: '1px',
              background: isLight
                ? 'linear-gradient(to bottom, rgba(59,130,246,0.15), rgba(59,130,246,0.05))'
                : 'linear-gradient(to bottom, rgba(59,130,246,0.2), rgba(59,130,246,0.05))',
            }} />
          {node.children.map((child, idx) => (
            <DiffTreeNode key={child.key ?? idx} node={child} depth={depth + 1} isLight={isLight} />
          ))}
          <div className="font-mono text-xs min-h-[22px] flex items-center px-2"
            style={{ paddingLeft: indent + 8 + 20, color: isLight ? '#64748b' : '#94a3b8' }}>
            {node.valueType === 'array' ? ']' : '}'}
          </div>
        </div>
      )}
    </div>
  );
}

function DiffTreeView({ leftData, rightData, isLight }) {
  const treeDiff = useMemo(() => {
    if (!leftData || !rightData) return null;
    return computeTreeDiff(deepSortKeys(leftData), deepSortKeys(rightData));
  }, [leftData, rightData]);

  if (!treeDiff) return null;

  // Count changes
  const countChanges = (node) => {
    let count = 0;
    if (node.type === 'added' || node.type === 'removed' || node.type === 'modified') count++;
    if (node.children) node.children.forEach(c => count += countChanges(c));
    return count;
  };
  const totalChanges = countChanges(treeDiff);

  if (totalChanges === 0) {
    return (
      <div className="flex items-center justify-center h-full flex-col gap-3">
        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: isLight ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.1)' }}>
          <GitCompare size={20} style={{ color: isLight ? '#059669' : '#34d399' }} />
        </div>
        <span className="text-[13px] font-mono" style={{ color: isLight ? '#059669' : '#34d399' }}>Identical JSON</span>
        <span className="text-[11px] font-mono" style={{ color: isLight ? '#64748b' : '#94a3b8' }}>No structural differences found</span>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-2">
      {treeDiff.children ? (
        treeDiff.children.map((child, idx) => (
          <DiffTreeNode key={child.key ?? idx} node={child} depth={0} isLight={isLight} />
        ))
      ) : (
        <DiffTreeNode node={treeDiff} depth={0} isLight={isLight} />
      )}
    </div>
  );
}

export default function DiffView({ leftData, rightData, leftValue = '', rightValue = '', theme = 'light' }) {
  const isLight = theme === 'light';
  const [diffViewMode, setDiffViewMode] = useState('line');
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

    // Normalize key order so only actual value differences show up
    const leftLines = JSON.stringify(deepSortKeys(leftData), null, 2).split('\n');
    const rightLines = JSON.stringify(deepSortKeys(rightData), null, 2).split('\n');
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
          <span className="text-[12px] font-mono tracking-widest uppercase" style={{ color: isLight ? '#64748b' : '#64748b' }}>
          Provide valid JSON in both panels
        </span>
      </div>
    );
  }

  const isIdentical = stats.added === 0 && stats.removed === 0 && stats.modified === 0;
  const totalChanges = stats.added + stats.removed + stats.modified;

  const VIEW_MODES = [
    { id: 'line', label: 'Line', icon: FileText },
    { id: 'tree', label: 'Tree', icon: GitBranch },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: isLight ? '#ffffff' : '#0d1117' }}>
      {/* Stats Bar with View Toggle */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-1.5 border-b"
        style={{ background: isLight ? '#f8fafc' : '#161b22', borderColor: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-3">
          <GitCompare size={14} style={{ color: isLight ? '#64748b' : '#94a3b8' }} />
          {isIdentical ? (
            <span className="text-[12px] font-mono" style={{ color: isLight ? '#059669' : '#34d399' }}>Identical</span>
          ) : (
            <>
              <span className="text-[12px] font-mono" style={{ color: isLight ? '#334155' : '#cbd5e1' }}>{totalChanges} change{totalChanges !== 1 ? 's' : ''}</span>
              <span style={{ color: isLight ? '#e2e8f0' : '#334155' }}>|</span>
              {stats.removed > 0 && (
                <span className="text-[11px] font-mono" style={{ color: isLight ? '#dc2626' : '#f87171' }}>−{stats.removed}</span>
              )}
              {stats.added > 0 && (
                <span className="text-[11px] font-mono" style={{ color: isLight ? '#059669' : '#34d399' }}>+{stats.added}</span>
              )}
              {stats.modified > 0 && (
                <span className="text-[11px] font-mono" style={{ color: isLight ? '#d97706' : '#fbbf24' }}>~{stats.modified}</span>
              )}
            </>
          )}
        </div>
        {/* View Toggle */}
        <div className="flex items-center gap-0.5 rounded-lg p-0.5 border"
          style={{
            background: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(0,0,0,0.3)',
            borderColor: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)',
          }}>
          {VIEW_MODES.map(mode => {
            const Icon = mode.icon;
            const isActive = diffViewMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setDiffViewMode(mode.id)}
                className="flex items-center gap-1.5 px-2.5 h-6 rounded text-[11px] font-mono transition-all"
                style={{
                  background: isActive ? (isLight ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.2)') : 'transparent',
                  color: isActive ? '#3b82f6' : (isLight ? '#94a3b8' : '#64748b'),
                  border: isActive ? (isLight ? '1px solid rgba(59,130,246,0.2)' : '1px solid rgba(59,130,246,0.2)') : '1px solid transparent',
                }}
              >
                <Icon size={12} />
                {mode.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      {isIdentical ? (
        <div className="flex-1 flex items-center justify-center flex-col gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: isLight ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.1)' }}>
            <GitCompare size={20} style={{ color: isLight ? '#059669' : '#34d399' }} />
          </div>
          <span className="text-[13px] font-mono" style={{ color: isLight ? '#059669' : '#34d399' }}>Identical JSON</span>
          <span className="text-[11px] font-mono" style={{ color: isLight ? '#64748b' : '#94a3b8' }}>No differences found</span>
        </div>
      ) : diffViewMode === 'tree' ? (
        <DiffTreeView leftData={leftData} rightData={rightData} isLight={isLight} />
      ) : (
        /* Two-Panel Line Diff */
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          <DiffPanel
            label="Left (Original)"
            lines={leftLines}
            diffLines={diffLines}
            side="left"
            scrollRef={leftScrollRef}
            onScroll={() => syncScroll('left')}
            isLight={isLight}
          />
          <div className="h-px md:h-auto md:w-px flex-shrink-0" style={{ background: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.08)' }} />
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
      )}
    </div>
  );
}

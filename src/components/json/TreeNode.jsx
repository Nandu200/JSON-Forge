import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ChevronRight, ChevronDown, Copy, Check, AlertCircle, Edit2 } from 'lucide-react';
import { getType, countItems } from '@/utils/jsonUtils';

const TYPE_COLORS_DARK = {
  string: '#10B981',
  number: '#F59E0B',
  boolean: '#EC4899',
  null: '#EC4899',
  object: '#94a3b8',
  array: '#94a3b8',
};

const TYPE_COLORS_LIGHT = {
  string: '#059669',
  number: '#d97706',
  boolean: '#db2777',
  null: '#db2777',
  object: '#64748b',
  array: '#64748b',
};

function HighlightText({ text, filter, isLight }) {
  const str = String(text);
  if (!filter) return <>{str}</>;
  const idx = str.toLowerCase().indexOf(filter.toLowerCase());
  if (idx === -1) return <>{str}</>;
  return (
    <>
      {str.slice(0, idx)}
      <mark style={{ background: isLight ? 'rgba(250,204,21,0.3)' : 'rgba(250,204,21,0.25)', color: isLight ? '#92400e' : '#fde68a', borderRadius: '2px', padding: '0 2px' }}>
        {str.slice(idx, idx + filter.length)}
      </mark>
      {str.slice(idx + filter.length)}
    </>
  );
}

function EditableValue({ value, type, onChange, onCancel }) {
  const [editValue, setEditValue] = useState(type === 'string' ? value : String(value));
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  const handleSave = () => {
    let newValue = editValue;
    if (type === 'number') {
      newValue = Number(editValue);
      if (isNaN(newValue)) newValue = 0;
    } else if (type === 'boolean') {
      newValue = editValue.toLowerCase() === 'true';
    } else if (type === 'null') {
      newValue = null;
    }
    onChange(newValue);
  };

  const handleBlur = () => {
    handleSave();
  };

  if (type === 'boolean') {
    return (
      <select
        value={String(editValue)}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        ref={inputRef}
        className="bg-blue-500/20 border border-blue-500/40 rounded px-1 text-[11px] font-mono text-pink-400 outline-none"
      >
        <option value="true">true</option>
        <option value="false">false</option>
      </select>
    );
  }

  if (type === 'null') {
    return (
      <select
        value="null"
        onChange={(e) => {
          if (e.target.value === 'null') {
            onChange(null);
          }
        }}
        onBlur={handleBlur}
        ref={inputRef}
        className="bg-blue-500/20 border border-blue-500/40 rounded px-1 text-[11px] font-mono text-pink-400 outline-none"
      >
        <option value="null">null</option>
      </select>
    );
  }

  return (
    <input
      ref={inputRef}
      type={type === 'number' ? 'number' : 'text'}
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className="bg-blue-500/20 border border-blue-500/40 rounded px-1 text-[11px] font-mono outline-none min-w-[60px]"
      style={{ color: TYPE_COLORS_DARK[type] }}
    />
  );
}

function ValueDisplay({ value, type, isEditing, onEdit, onChange, onCancel, isLight }) {
  if (isEditing) {
    return <EditableValue value={value} type={type} onChange={onChange} onCancel={onCancel} />;
  }

  if (type === 'object' || type === 'array') return null;
  const colors = isLight ? TYPE_COLORS_LIGHT : TYPE_COLORS_DARK;
  const color = colors[type] || (isLight ? '#1e293b' : '#F8FAFC');
  const display = type === 'string' ? `"${value}"` : String(value);
  
  return (
    <span 
      style={{ color }} 
      className="font-mono text-xs ml-1 select-text cursor-pointer hover:underline hover:opacity-80"
      onClick={onEdit}
      title="Click to edit"
    >
      {display}
    </span>
  );
}

function TreeNode({ 
  nodeKey, 
  value, 
  depth = 0, 
  path = '', 
  isLast = true, 
  onPathHover, 
  filter = '', 
  theme = 'light',
  validationError = null,
  onValueChange = null,
  parentData = null,
  dataKey = null,
  matchPathSet,
  forceExpandedPaths,
  currentMatchPath,
  treePath = 'root'
}) {
  const isLight = theme === 'light';
  const type = getType(value);
  const isExpandable = type === 'object' || type === 'array';
  const isMatch = matchPathSet && matchPathSet.has(treePath);
  const isCurrentMatch = currentMatchPath === treePath;
  const shouldForceExpand = forceExpandedPaths && forceExpandedPaths.has(treePath);
  const [collapsed, setCollapsed] = useState(depth > 3);
  const [copied, setCopied] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-expand when a descendant matches the search
  useEffect(() => {
    if (shouldForceExpand && collapsed) {
      setCollapsed(false);
    }
  }, [shouldForceExpand]);

  // Auto-collapse back when filter is cleared
  useEffect(() => {
    if (!filter && depth > 3) {
      setCollapsed(true);
    }
  }, [filter]);

  const count = isExpandable ? countItems(value) : 0;
  const indent = depth * 20;
  const currentPath = path ? `${path} > ${nodeKey}` : String(nodeKey);

  const lineColor = isLight ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.2)';
  const lineColorHover = isLight ? 'rgba(59,130,246,0.25)' : 'rgba(59,130,246,0.1)';

  const handleCopy = useCallback((e) => {
    e.stopPropagation();
    const text = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
    try { navigator.clipboard.writeText(text); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [value]);

  const handleValueChange = (newValue) => {
    setIsEditing(false);
    if (onValueChange && parentData !== null && dataKey !== null) {
      onValueChange(parentData, dataKey, newValue);
    }
  };

  const bracketOpen = type === 'array' ? '[' : '{';
  const bracketClose = type === 'array' ? ']' : '}';

  return (
    <div className="relative tree-node group/node">
      {depth > 0 && (
        <div className="tree-connector absolute top-0 pointer-events-none"
          style={{ left: indent - 12, width: '1px',
            background: `linear-gradient(to bottom, ${lineColor}, ${lineColorHover})`,
            bottom: isLast ? '50%' : 0, top: 0 }} />
      )}
      {depth > 0 && (
        <div className="absolute pointer-events-none"
          style={{ left: indent - 12, top: '50%', width: 10, height: '1px',
            background: lineColor, transform: 'translateY(-50%)' }} />
      )}

      <div 
        className="flex items-center min-h-[28px] px-2 rounded-md transition-colors cursor-default select-none"
        data-current-match={isCurrentMatch ? 'true' : undefined}
        style={{
          paddingLeft: indent + 8,
          background: isCurrentMatch
            ? (isLight ? 'rgba(250,204,21,0.25)' : 'rgba(250,204,21,0.18)')
            : isMatch
              ? (isLight ? 'rgba(250,204,21,0.10)' : 'rgba(250,204,21,0.08)')
              : validationError
                ? (isLight ? 'rgba(239,68,68,0.04)' : 'rgba(239,68,68,0.06)')
                : isHovered
                  ? (isLight ? 'rgba(59,130,246,0.04)' : 'rgba(255,255,255,0.03)')
                  : 'transparent',
          outline: isCurrentMatch ? `2px solid ${isLight ? 'rgba(250,204,21,0.5)' : 'rgba(250,204,21,0.4)'}` : 'none',
          outlineOffset: '-2px',
          borderRadius: '6px',
        }}
        onMouseEnter={() => {
          setIsHovered(true);
          onPathHover && onPathHover(currentPath);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          onPathHover && onPathHover('');
        }}
      >

        {isExpandable ? (
          <button onClick={() => setCollapsed(c => !c)}
            className="flex-shrink-0 w-4 h-4 mr-1 transition-colors"
            style={{ color: isLight ? '#94a3b8' : 'rgba(96,165,250,0.6)' }}>
            {collapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
          </button>
        ) : (
          <span className="w-4 mr-1 flex-shrink-0" />
        )}

        {nodeKey !== undefined && nodeKey !== null && (
          <span className="text-xs font-mono font-medium mr-1"
            style={{ color: validationError ? '#ef4444' : (isLight ? '#1e293b' : '#93c5fd') }}>
            <HighlightText text={String(nodeKey)} filter={filter} isLight={isLight} />
          </span>
        )}
        {nodeKey !== undefined && nodeKey !== null && (
          <span className="text-xs font-mono mr-1"
            style={{ color: isLight ? '#94a3b8' : '#475569' }}>:</span>
        )}

        {isExpandable ? (
          <>
            <span className="text-xs font-mono" style={{ color: isLight ? '#64748b' : '#94a3b8' }}>{bracketOpen}</span>
            {collapsed ? (
              <button onClick={() => setCollapsed(false)}
                className="ml-1.5 transition-colors cursor-pointer"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '11px',
                  padding: '1px 8px',
                  borderRadius: '999px',
                  background: isLight ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.15)',
                  border: isLight ? '1px solid rgba(59,130,246,0.15)' : '1px solid rgba(59,130,246,0.3)',
                  color: isLight ? '#3b82f6' : '#60a5fa',
                }}>
                {count} {type === 'array' ? 'items' : 'keys'}
              </button>
            ) : (
              count > 0 && (
                <span className="ml-1.5 text-[10px] font-mono"
                  style={{ color: isLight ? 'rgba(59,130,246,0.4)' : 'rgba(59,130,246,0.35)' }}>
                  {count} {type === 'array' ? 'items' : 'keys'}
                </span>
              )
            )}
          </>
        ) : (
          <ValueDisplay 
            value={value} 
            type={type} 
            isLight={isLight}
            isEditing={isEditing}
            onEdit={() => onValueChange && setIsEditing(true)}
            onChange={handleValueChange}
            onCancel={() => setIsEditing(false)}
          />
        )}

        {!isExpandable && !isEditing && (
          <span className="ml-2 text-[9px] font-mono uppercase tracking-widest"
            style={{ color: isLight ? '#cbd5e1' : '#334155' }}>{type}</span>
        )}

        {/* Validation Error Indicator */}
        {validationError && (
          <button
            onClick={() => setShowError(!showError)}
            className="ml-2 flex-shrink-0 transition-colors"
            style={{ color: isLight ? '#ef4444' : '#f87171' }}
            title={validationError.message}
          >
            <AlertCircle size={12} />
          </button>
        )}

        {/* Edit button on hover */}
        {!isExpandable && !isEditing && onValueChange && isHovered && (
          <button
            onClick={() => setIsEditing(true)}
            className="ml-2 flex-shrink-0 transition-colors"
            style={{ color: isLight ? '#94a3b8' : '#64748b' }}
            title="Edit value"
          >
            <Edit2 size={10} />
          </button>
        )}

        <button onClick={handleCopy}
          className="ml-auto opacity-0 group-hover/node:opacity-100 flex-shrink-0 w-5 h-5 flex items-center justify-center transition-all"
          style={{ color: isLight ? '#94a3b8' : '#64748b' }}>
          {copied ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
        </button>
      </div>

      {/* Validation Error Tooltip */}
      {validationError && showError && (
        <div className="mx-2 mb-1 px-2 py-1.5 rounded border"
          style={{
            marginLeft: indent + 28,
            background: isLight ? 'rgba(239,68,68,0.05)' : 'rgba(239,68,68,0.1)',
            borderColor: isLight ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.2)',
          }}>
          <div className="flex items-start gap-1.5">
            <AlertCircle size={10} className="text-red-400 mt-0.5 flex-shrink-0" />
            <span className="text-[10px] text-red-400 font-mono">{validationError.message}</span>
          </div>
        </div>
      )}

      {isExpandable && !collapsed && (
        <div className="relative">
          <div className="absolute pointer-events-none"
            style={{ left: indent + 12, top: 0, bottom: 0, width: '1px',
              background: isLight
                ? 'linear-gradient(to bottom, rgba(59,130,246,0.2) 0%, rgba(59,130,246,0.08) 100%)'
                : 'linear-gradient(to bottom, rgba(59,130,246,0.3) 0%, rgba(59,130,246,0.05) 100%)' }} />
          {Object.entries(value).map(([k, v], idx, arr) => (
            <TreeNode key={k}
              nodeKey={type === 'array' ? Number(k) : k}
              value={v} 
              depth={depth + 1} 
              path={currentPath}
              isLast={idx === arr.length - 1}
              onPathHover={onPathHover} 
              filter={filter}
              theme={theme}
              onValueChange={onValueChange}
              parentData={value}
              dataKey={k}
              matchPathSet={matchPathSet}
              forceExpandedPaths={forceExpandedPaths}
              currentMatchPath={currentMatchPath}
              treePath={`${treePath} > ${k}`}
            />
          ))}
          <div className="flex items-center min-h-[22px] px-2 font-mono"
            style={{ paddingLeft: indent + 8 + 20 }}>
            <span className="text-xs" style={{ color: isLight ? '#64748b' : '#94a3b8' }}>{bracketClose}</span>
          </div>
        </div>
      )}

      {isExpandable && collapsed && (
        <span className="text-xs font-mono ml-1" style={{ color: isLight ? '#64748b' : '#94a3b8' }}>{bracketClose}</span>
      )}
    </div>
  );
}

export default React.memo(TreeNode);

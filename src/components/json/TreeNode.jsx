import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ChevronRight, ChevronDown, Copy, Check, AlertCircle, Edit2, Minimize2, Maximize2 } from 'lucide-react';
import { getType, countItems } from '@/utils/jsonUtils';

const TYPE_COLORS = {
  string: '#10B981',
  number: '#F59E0B',
  boolean: '#EC4899',
  null: '#EC4899',
  object: '#6B7280',
  array: '#6B7280',
};

function HighlightText({ text, filter }) {
  const str = String(text);
  if (!filter) return <>{str}</>;
  const idx = str.toLowerCase().indexOf(filter.toLowerCase());
  if (idx === -1) return <>{str}</>;
  return (
    <>
      {str.slice(0, idx)}
      <mark className="bg-yellow-400/30 text-yellow-300 rounded px-0.5">{str.slice(idx, idx + filter.length)}</mark>
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
      style={{ color: TYPE_COLORS[type] }}
    />
  );
}

function ValueDisplay({ value, type, isEditing, onEdit, onChange, onCancel }) {
  if (isEditing) {
    return <EditableValue value={value} type={type} onChange={onChange} onCancel={onCancel} />;
  }

  if (type === 'object' || type === 'array') return null;
  const color = TYPE_COLORS[type] || '#F8FAFC';
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
  validationError = null,
  onValueChange = null,
  parentData = null,
  dataKey = null
}) {
  const type = getType(value);
  const isExpandable = type === 'object' || type === 'array';
  const [collapsed, setCollapsed] = useState(depth > 3);
  const [copied, setCopied] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const count = isExpandable ? countItems(value) : 0;
  const indent = depth * 20;
  const currentPath = path ? `${path} > ${nodeKey}` : String(nodeKey);

  const handleCopy = useCallback((e) => {
    e.stopPropagation();
    const text = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
    navigator.clipboard.writeText(text);
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
        <div className="tree-connector absolute top-0 bottom-0 pointer-events-none"
          style={{ left: indent - 12, width: '1px',
            background: 'linear-gradient(to bottom, rgba(59,130,246,0.2), rgba(59,130,246,0.1))',
            bottom: isLast ? '50%' : 0 }} />
      )}
      {depth > 0 && (
        <div className="absolute pointer-events-none"
          style={{ left: indent - 12, top: '50%', width: 10, height: '1px',
            background: 'rgba(59,130,246,0.2)', transform: 'translateY(-50%)' }} />
      )}

      <div 
        className={`flex items-center min-h-[26px] px-2 rounded transition-colors cursor-default select-none ${
          validationError ? 'bg-red-500/5 hover:bg-red-500/10' : 'hover:bg-white/[0.03]'
        }`}
        style={{ paddingLeft: indent + 8 }}
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
            className="flex-shrink-0 w-4 h-4 mr-1 text-blue-500/60 hover:text-blue-400 transition-colors">
            {collapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
          </button>
        ) : (
          <span className="w-4 mr-1" />
        )}

        {nodeKey !== undefined && nodeKey !== null && (
          <span className={`json-key text-xs font-mono mr-1 ${validationError ? 'text-red-400' : ''}`}>
            <HighlightText text={String(nodeKey)} filter={filter} />
          </span>
        )}
        {nodeKey !== undefined && nodeKey !== null && (
          <span className="json-punctuation text-xs font-mono mr-1">:</span>
        )}

        {isExpandable ? (
          <>
            <span className="json-bracket text-xs font-mono">{bracketOpen}</span>
            {collapsed ? (
              <button onClick={() => setCollapsed(false)}
                className="node-pill ml-2 hover:bg-blue-500/25 transition-colors cursor-pointer">
                {type === 'array' ? `[ ${count} items ]` : `{ ${count} keys }`}
              </button>
            ) : (
              count > 0 && (
                <span className="ml-2 text-[10px] text-blue-500/40 font-mono">
                  {count} {type === 'array' ? 'items' : 'keys'}
                </span>
              )
            )}
          </>
        ) : (
          <ValueDisplay 
            value={value} 
            type={type} 
            isEditing={isEditing}
            onEdit={() => onValueChange && setIsEditing(true)}
            onChange={handleValueChange}
            onCancel={() => setIsEditing(false)}
          />
        )}

        {!isExpandable && !isEditing && (
          <span className="ml-2 text-[9px] font-mono uppercase tracking-widest opacity-20 text-slate-400">{type}</span>
        )}

        {/* Validation Error Indicator */}
        {validationError && (
          <button
            onClick={() => setShowError(!showError)}
            className="ml-2 flex-shrink-0 text-red-400 hover:text-red-300 transition-colors"
            title={validationError.message}
          >
            <AlertCircle size={12} />
          </button>
        )}

        {/* Edit button on hover */}
        {!isExpandable && !isEditing && onValueChange && isHovered && (
          <button
            onClick={() => setIsEditing(true)}
            className="ml-2 flex-shrink-0 text-slate-500 hover:text-blue-400 transition-colors"
            title="Edit value"
          >
            <Edit2 size={10} />
          </button>
        )}

        <button onClick={handleCopy}
          className="ml-auto opacity-0 group-hover/node:opacity-100 flex-shrink-0 w-5 h-5 flex items-center justify-center text-slate-500 hover:text-blue-400 transition-all">
          {copied ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
        </button>
      </div>

      {/* Validation Error Tooltip */}
      {validationError && showError && (
        <div className="mx-2 mb-1 px-2 py-1.5 rounded bg-red-500/10 border border-red-500/20"
          style={{ marginLeft: indent + 28 }}>
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
              background: 'linear-gradient(to bottom, rgba(59,130,246,0.3) 0%, rgba(59,130,246,0.15) 50%, rgba(59,130,246,0.05) 100%)' }} />
          {Object.entries(value).map(([k, v], idx, arr) => (
            <TreeNode key={k}
              nodeKey={type === 'array' ? Number(k) : k}
              value={v} 
              depth={depth + 1} 
              path={currentPath}
              isLast={idx === arr.length - 1}
              onPathHover={onPathHover} 
              filter={filter}
              onValueChange={onValueChange}
              parentData={value}
              dataKey={k}
            />
          ))}
          <div className="flex items-center min-h-[22px] px-2 font-mono"
            style={{ paddingLeft: indent + 8 + 20 }}>
            <span className="json-bracket text-xs">{bracketClose}</span>
          </div>
        </div>
      )}

      {isExpandable && collapsed && (
        <span className="json-bracket text-xs font-mono ml-1">{bracketClose}</span>
      )}
    </div>
  );
}

export default React.memo(TreeNode);

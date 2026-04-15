import React, { useState, useMemo, useCallback } from 'react';
import { getType } from '@/utils/jsonUtils';
import TreeNode from './TreeNode';

/**
 * Navigate a JSON object by a dot-notation path like "user.settings" or "data[0].name"
 * Returns the subtree at that path, or null if not found
 */
function getByPath(obj, path) {
  if (!path || !obj) return obj;
  const parts = path
    .replace(/\[(\d+)\]/g, '.$1') // convert array notation to dots
    .split('.')
    .filter(Boolean);
  
  let current = obj;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') return undefined;
    if (Array.isArray(current)) {
      const idx = parseInt(part);
      if (isNaN(idx) || idx < 0 || idx >= current.length) return undefined;
      current = current[idx];
    } else {
      if (!(part in current)) return undefined;
      current = current[part];
    }
  }
  return current;
}

function getEntries(obj, filter, sort) {
  if (!obj || typeof obj !== 'object') return [];
  let entries = Object.entries(obj);
  if (filter) {
    const f = filter.toLowerCase();
    entries = entries.filter(([k, v]) => {
      // Check key first (cheap)
      if (String(k).toLowerCase().includes(f)) return true;
      // For primitives, check value directly (avoid JSON.stringify)
      if (v === null || v === undefined) return String(v).includes(f);
      if (typeof v !== 'object') return String(v).toLowerCase().includes(f);
      // Only stringify objects/arrays as a last resort
      try { return JSON.stringify(v).toLowerCase().includes(f); } catch { return false; }
    });
  }
  if (sort === 'asc') entries.sort((a, b) => String(a[0]).localeCompare(String(b[0])));
  else if (sort === 'desc') entries.sort((a, b) => String(b[0]).localeCompare(String(a[0])));
  else if (sort === 'type') entries.sort((a, b) => getType(a[1]).localeCompare(getType(b[1])));
  return entries;
}

export default function TreeView({ data, filter = '', pathFilter = '', sort = 'none', theme = 'light', validationErrors = [], onDataChange }) {
  const [hoveredPath, setHoveredPath] = useState('');
  const [localData, setLocalData] = useState(data);
  const handlePathHover = useCallback((p) => setHoveredPath(p), []);
  const isLight = theme === 'light';

  // Update local data when prop changes
  React.useEffect(() => {
    setLocalData(data);
  }, [data]);

  // Build a set of paths with errors for quick lookup
  const errorPaths = useMemo(() => {
    const paths = new Set();
    validationErrors.forEach(error => {
      paths.add(error.path);
    });
    return paths;
  }, [validationErrors]);

  // Get error message for a specific path
  const getPathError = useCallback((path) => {
    return validationErrors.find(error => error.path === path);
  }, [validationErrors]);

  // Handle value changes from tree nodes
  const handleValueChange = useCallback((parentObj, key, newValue) => {
    // Create a deep copy of the data
    const newData = JSON.parse(JSON.stringify(localData || data));
    
    // Navigate to the parent and update the value
    const updateValue = (obj, targetKey, value) => {
      if (Array.isArray(obj)) {
        const idx = parseInt(targetKey);
        if (!isNaN(idx) && idx >= 0 && idx < obj.length) {
          obj[idx] = value;
          return true;
        }
      } else if (obj && typeof obj === 'object') {
        if (targetKey in obj) {
          obj[targetKey] = value;
          return true;
        }
      }
      return false;
    };

    // Find and update the value in the data structure
    const findAndUpdate = (current, parentRef, parentKey) => {
      if (current === parentObj) {
        return updateValue(parentRef || newData, parentKey, newValue);
      }
      
      if (Array.isArray(current)) {
        for (let i = 0; i < current.length; i++) {
          if (findAndUpdate(current[i], current, i)) return true;
        }
      } else if (current && typeof current === 'object') {
        for (const k of Object.keys(current)) {
          if (findAndUpdate(current[k], current, k)) return true;
        }
      }
      return false;
    };

    findAndUpdate(newData, null, null);
    setLocalData(newData);
    
    if (onDataChange) {
      onDataChange(newData);
    }
  }, [localData, data, onDataChange]);

  const displayData = localData !== undefined ? localData : data;

  // Apply path filter to get subtree
  const filteredData = useMemo(() => {
    if (!pathFilter || !displayData) return displayData;
    const result = getByPath(displayData, pathFilter);
    return result !== undefined ? result : displayData;
  }, [displayData, pathFilter]);

  const rootEntries = useMemo(() => {
    if (!filteredData || typeof filteredData !== 'object') return null;
    return getEntries(filteredData, filter, sort);
  }, [filteredData, filter, sort]);

  if (filteredData === null || filteredData === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-[12px] font-mono tracking-widest uppercase"
          style={{ color: isLight ? '#94a3b8' : '#64748b' }}>No valid JSON</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Path breadcrumb */}
      <div className="flex-shrink-0 h-9 flex items-center px-4 border-b"
        style={{ borderColor: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.04)' }}>
        <span className="breadcrumb-path">
          {pathFilter && (
            <span className="text-[11px] font-mono mr-2"
              style={{ color: isLight ? '#3b82f6' : '#60a5fa' }}>
              {pathFilter} ›
            </span>
          )}
          {hoveredPath
            ? hoveredPath.split(' > ').map((part, i, arr) => (
                <span key={i}>
                  <span className={i === arr.length - 1 ? 'active' : ''}>{part}</span>
                  {i < arr.length - 1 && <span className="mx-1" style={{ color: isLight ? '#cbd5e1' : '#334155' }}> › </span>}
                </span>
              ))
            : <span style={{ color: isLight ? '#94a3b8' : '#64748b' }}>Hover a node to see path</span>
          }
        </span>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-auto p-2">
        {rootEntries !== null ? (
          rootEntries.map(([key, value], idx, arr) => {
            const nodePath = `root.${key}`;
            const error = getPathError(nodePath);
            return (
              <TreeNode
                key={key}
                nodeKey={Array.isArray(filteredData) ? Number(key) : key}
                value={value}
                depth={0}
                path="root"
                isLast={idx === arr.length - 1}
                onPathHover={handlePathHover}
                filter={filter}
                theme={theme}
                validationError={error}
                onValueChange={onDataChange ? handleValueChange : null}
                parentData={filteredData}
                dataKey={key}
              />
            );
          })
        ) : (
          <TreeNode
            nodeKey={null}
            value={filteredData}
            depth={0}
            path="root"
            isLast={true}
            onPathHover={handlePathHover}
            filter={filter}
            theme={theme}
            onValueChange={onDataChange ? handleValueChange : null}
            parentData={null}
            dataKey={null}
          />
        )}
      </div>
    </div>
  );
}

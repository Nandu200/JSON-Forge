/**
 * Optimized JSON Utilities with performance safeguards
 * Handles large JSON files without crashing the browser
 */

// Size limits
export const SIZE_LIMITS = {
  MAX_STRING_LENGTH: 10 * 1024 * 1024, // 10MB
  MAX_DEPTH: 100,
  MAX_KEYS: 100000,
  CHUNK_SIZE: 1000,
  MAX_DISPLAY_ITEMS: 10000, // For tree view virtualization
};

/**
 * Check if data size is within safe limits
 */
export function checkSizeLimits(data, path = '', stats = { depth: 0, keys: 0, maxDepth: 0 }) {
  if (stats.keys > SIZE_LIMITS.MAX_KEYS) {
    return { valid: false, error: `Too many keys (>${SIZE_LIMITS.MAX_KEYS}). Consider using a specialized tool for very large files.` };
  }
  
  if (stats.depth > SIZE_LIMITS.MAX_DEPTH) {
    return { valid: false, error: `Nesting too deep (>${SIZE_LIMITS.MAX_DEPTH}). Maximum supported depth exceeded.` };
  }

  stats.maxDepth = Math.max(stats.maxDepth, stats.depth);
  stats.keys++;

  if (data !== null && typeof data === 'object') {
    stats.depth++;
    for (const key of Object.keys(data)) {
      const result = checkSizeLimits(data[key], `${path}.${key}`, stats);
      if (!result.valid) return result;
    }
    stats.depth--;
  }

  return { valid: true, stats };
}

/**
 * Parse JSON with size validation
 */
export function parseJSONSafe(str) {
  // Handle empty/whitespace input gracefully
  if (!str || !str.trim()) {
    return { data: null, error: null };
  }

  // Check string length first
  if (str.length > SIZE_LIMITS.MAX_STRING_LENGTH) {
    return { 
      data: null, 
      error: `JSON string too large (${(str.length / 1024 / 1024).toFixed(1)}MB). Maximum is ${SIZE_LIMITS.MAX_STRING_LENGTH / 1024 / 1024}MB.` 
    };
  }

  try {
    const data = JSON.parse(str);
    
    // Check parsed data size
    const sizeCheck = checkSizeLimits(data);
    if (!sizeCheck.valid) {
      return { data: null, error: sizeCheck.error };
    }

    return { data, error: null, stats: sizeCheck.stats };
  } catch (e) {
    // Enhance error message with line/column info if only position is given
    let errorMsg = e.message;
    const posMatch = errorMsg.match(/position\s+(\d+)/i);
    if (posMatch && !/line\s+\d+/i.test(errorMsg)) {
      const pos = parseInt(posMatch[1]);
      const textBefore = str.substring(0, pos);
      const lines = textBefore.split('\n');
      const line = lines.length;
      const col = lines[lines.length - 1].length + 1;
      errorMsg = `${errorMsg} (line ${line}, column ${col})`;
    }
    return { data: null, error: errorMsg };
  }
}

/**
 * Get depth with early termination
 */
export function getDepthSafe(value, current = 0, maxDepth = SIZE_LIMITS.MAX_DEPTH) {
  if (current > maxDepth) return maxDepth;
  if (value === null || typeof value !== 'object') return current;
  const keys = Object.keys(value);
  if (!keys.length) return current;
  
  let max = current;
  for (const k of keys) {
    max = Math.max(max, getDepthSafe(value[k], current + 1, maxDepth));
    if (max >= maxDepth) return maxDepth;
  }
  return max;
}

/**
 * Count keys with early termination
 */
export function countKeysSafe(value, count = { total: 0, max: SIZE_LIMITS.MAX_KEYS }) {
  if (count.total >= count.max) return count;
  if (value === null || typeof value !== 'object') return count;
  
  const keys = Object.keys(value);
  count.total += keys.length;
  
  if (count.total >= count.max) return count;
  
  for (const k of keys) {
    countKeysSafe(value[k], count);
    if (count.total >= count.max) return count;
  }
  return count;
}

/**
 * Chunked syntax highlighting for large files
 */
export function syntaxHighlightChunked(json, onProgress, chunkSize = SIZE_LIMITS.CHUNK_SIZE) {
  if (typeof json !== 'string') {
    json = JSON.stringify(json, null, 2);
  }

  // For small files, use regular highlighting
  if (json.length < 50000) {
    return { html: syntaxHighlightSync(json), complete: true };
  }

  // For large files, return simplified highlighting
  return { 
    html: syntaxHighlightSimplified(json), 
    complete: true,
    simplified: true 
  };
}

/**
 * Synchronous syntax highlight (for small files)
 */
function syntaxHighlightSync(json) {
  return json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let cls = 'json-number';
        if (/^"/.test(match)) {
          cls = /:$/.test(match) ? 'json-key' : 'json-string';
          if (/:$/.test(match)) {
            return `<span class="${cls}">${match.slice(0, -1)}</span><span class="json-punctuation">:</span>`;
          }
        } else if (/true|false/.test(match)) {
          cls = 'json-boolean';
        } else if (/null/.test(match)) {
          cls = 'json-null';
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
}

/**
 * Simplified syntax highlighting for large files (faster)
 */
function syntaxHighlightSimplified(json) {
  // Only highlight keys and strings, skip complex regex
  return json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"([^"]*)"(\s*:)?/g, (match, content, colon) => {
      if (colon) {
        return `<span class="json-key">"${content}"</span><span class="json-punctuation">:</span>`;
      }
      return `<span class="json-string">"${content}"</span>`;
    });
}

/**
 * Debounce with cancel support
 */
export function debounceWithCancel(fn, delay) {
  let timeoutId;
  
  const debounced = (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
  
  debounced.cancel = () => clearTimeout(timeoutId);
  
  return debounced;
}

/**
 * Memoize expensive functions
 */
export function memoize(fn, keyFn = JSON.stringify) {
  const cache = new Map();
  const MAX_CACHE_SIZE = 100;
  
  return (...args) => {
    const key = keyFn(args);
    if (cache.has(key)) return cache.get(key);
    
    const result = fn(...args);
    
    // Limit cache size
    if (cache.size >= MAX_CACHE_SIZE) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    cache.set(key, result);
    return result;
  };
}

/**
 * Virtualized tree data - only return visible items
 */
export function getVirtualizedTreeData(data, filter, sort, startIndex, endIndex) {
  if (!data || typeof data !== 'object') return { items: [], total: 0 };
  
  let entries = Object.entries(data);
  const total = entries.length;
  
  // Apply filter
  if (filter) {
    const f = filter.toLowerCase();
    entries = entries.filter(([k, v]) =>
      String(k).toLowerCase().includes(f) ||
      JSON.stringify(v).toLowerCase().includes(f)
    );
  }
  
  // Apply sort
  if (sort === 'asc') entries.sort((a, b) => String(a[0]).localeCompare(String(b[0])));
  else if (sort === 'desc') entries.sort((a, b) => String(b[0]).localeCompare(String(a[0])));
  
  // Return only visible slice
  const sliced = entries.slice(startIndex, endIndex);
  
  return { items: sliced, total: entries.length };
}

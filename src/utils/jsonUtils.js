/**
 * Parse JSON safely, returning {data, error}
 */
export function parseJSON(str) {
  try {
    const data = JSON.parse(str);
    return { data, error: null };
  } catch (e) {
    return { data: null, error: e.message };
  }
}

/**
 * Format JSON with indentation
 */
export function formatJSON(str, spaces = 2) {
  const { data, error } = parseJSON(str);
  if (error) return { formatted: null, error };
  return { formatted: JSON.stringify(data, null, spaces), error: null };
}

/**
 * Minify JSON
 */
export function minifyJSON(str) {
  const { data, error } = parseJSON(str);
  if (error) return { minified: null, error };
  return { minified: JSON.stringify(data), error: null };
}

/**
 * Get type of a value
 */
export function getType(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

/**
 * Count total keys/items in an object or array
 */
export function countItems(value) {
  if (value === null || typeof value !== 'object') return 0;
  return Object.keys(value).length;
}

/**
 * Deep diff two JSON objects
 * Returns an array of differences
 */
export function diffJSON(a, b, path = '') {
  const diffs = [];

  if (typeof a !== typeof b || (a === null) !== (b === null)) {
    diffs.push({ path, type: 'modified', left: a, right: b });
    return diffs;
  }

  if (a === null || typeof a !== 'object') {
    if (a !== b) diffs.push({ path, type: 'modified', left: a, right: b });
    return diffs;
  }

  if (Array.isArray(a) !== Array.isArray(b)) {
    diffs.push({ path, type: 'modified', left: a, right: b });
    return diffs;
  }

  const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of allKeys) {
    const childPath = path ? `${path}.${key}` : key;
    if (!(key in a)) {
      diffs.push({ path: childPath, type: 'added', left: undefined, right: b[key] });
    } else if (!(key in b)) {
      diffs.push({ path: childPath, type: 'removed', left: a[key], right: undefined });
    } else {
      diffs.push(...diffJSON(a[key], b[key], childPath));
    }
  }

  return diffs;
}

/**
 * Build a flat path map for a JSON object
 */
export function buildPathMap(obj, prefix = 'root') {
  const map = {};
  function traverse(value, path) {
    map[path] = value;
    if (value && typeof value === 'object') {
      Object.entries(value).forEach(([key, val]) => {
        traverse(val, `${path} > ${key}`);
      });
    }
  }
  traverse(obj, prefix);
  return map;
}

/**
 * Flatten object arrays for table view
 */
export function flattenForTable(data) {
  if (!data) return { headers: [], rows: [] };

  // If it's an array of objects, extract headers from first item
  if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
    const headers = [...new Set(data.flatMap(item => Object.keys(item || {})))];
    const rows = data.map((item, idx) => ({ _index: idx, ...item }));
    return { headers, rows };
  }

  // If it's an object, convert to key-value rows
  if (typeof data === 'object' && !Array.isArray(data)) {
    const rows = Object.entries(data).map(([key, value]) => ({
      key,
      value: typeof value === 'object' ? JSON.stringify(value) : String(value),
      type: getType(value),
    }));
    return { headers: ['key', 'value', 'type'], rows };
  }

  return { headers: [], rows: [] };
}

/**
 * Get max depth of a JSON object
 */
export function getDepth(value, current = 0) {
  if (value === null || typeof value !== 'object') return current;
  const keys = Object.keys(value);
  if (!keys.length) return current;
  return Math.max(...keys.map(k => getDepth(value[k], current + 1)));
}

/**
 * Count all keys/values recursively
 */
export function countAllKeys(value) {
  if (value === null || typeof value !== 'object') return 0;
  const keys = Object.keys(value);
  return keys.length + keys.reduce((acc, k) => acc + countAllKeys(value[k]), 0);
}

/**
 * Syntax highlight JSON string -> HTML
 */
export function syntaxHighlight(json) {
  if (typeof json !== 'string') {
    json = JSON.stringify(json, null, 2);
  }
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
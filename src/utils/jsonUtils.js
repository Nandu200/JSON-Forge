/**
 * Parse JSON safely, returning {data, error}
 */
function parseJSON(str) {
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
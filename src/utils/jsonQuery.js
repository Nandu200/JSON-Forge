import { JSONPath } from 'jsonpath-plus';
import jmespath from 'jmespath';

/**
 * Execute a query against JSON data using the specified query mode.
 * Returns { result, error } where result is the queried data.
 */
export function executeQuery(data, query, mode = 'path') {
  if (!query || !data) return { result: data, error: null };

  try {
    switch (mode) {
      case 'jsonpath': {
        const result = JSONPath({ path: query, json: data, wrap: true });
        if (result.length === 0) return { result: undefined, error: 'No matches found' };
        return { result: result.length === 1 ? result[0] : result, error: null };
      }

      case 'jmespath': {
        const result = jmespath.search(data, query);
        if (result === null) return { result: undefined, error: 'No matches found' };
        return { result, error: null };
      }

      case 'path':
      default:
        // Dot-notation path (handled by existing getByPath in TreeView)
        return { result: data, error: null };
    }
  } catch (e) {
    return { result: data, error: e.message };
  }
}

/**
 * Get placeholder text for the query input based on mode.
 */
export function getQueryPlaceholder(mode) {
  switch (mode) {
    case 'jsonpath': return '$.store.book[*].author';
    case 'jmespath': return 'people[?age > `20`].name';
    case 'path':
    default: return 'user.settings or data[0].name';
  }
}

/**
 * Get label for the query mode.
 */
export function getQueryLabel(mode) {
  switch (mode) {
    case 'jsonpath': return 'JSONPath';
    case 'jmespath': return 'JMESPath';
    case 'path':
    default: return 'Path';
  }
}

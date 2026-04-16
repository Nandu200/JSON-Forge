import { jsonrepair } from 'jsonrepair';
import Papa from 'papaparse';

/**
 * Auto-fix common JSON issues using jsonrepair.
 * Returns { fixed: boolean, value: string, fixes: string[] }
 */
export function autoFixJSON(jsonStr) {
  const MAX_AUTO_FIX_SIZE = 5 * 1024 * 1024;
  if (jsonStr.length > MAX_AUTO_FIX_SIZE) {
    return {
      fixed: false,
      value: jsonStr,
      fixes: [],
      error: 'File too large for auto-fix. Please fix manually.'
    };
  }

  try {
    // Already valid — nothing to fix
    JSON.parse(jsonStr);
    return { fixed: false, value: jsonStr, fixes: [] };
  } catch (_) {
    // Needs repair
  }

  try {
    const repaired = jsonrepair(jsonStr);
    if (repaired !== jsonStr) {
      return { fixed: true, value: repaired, fixes: ['Auto-repaired JSON'] };
    }
    return { fixed: false, value: jsonStr, fixes: [] };
  } catch (e) {
    return { fixed: false, value: jsonStr, fixes: [], error: e.message };
  }
}

/**
 * Export data to JSON file
 */
export function exportToJSON(data, filename = 'data.json') {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Convert data to CSV format using papaparse
 */
export function convertToCSV(data) {
  if (!data) return '';

  // Array of objects → use as rows directly
  if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
    const rows = data.map(item => {
      const row = {};
      for (const [k, v] of Object.entries(item || {})) {
        row[k] = v === null || v === undefined ? '' : typeof v === 'object' ? JSON.stringify(v) : v;
      }
      return row;
    });
    return Papa.unparse(rows);
  }

  // Single object → key/value pairs
  if (typeof data === 'object' && !Array.isArray(data)) {
    const rows = Object.entries(data).map(([key, value]) => ({
      key,
      value: value === null || value === undefined ? '' : typeof value === 'object' ? JSON.stringify(value) : value
    }));
    return Papa.unparse(rows);
  }

  // Primitive
  return Papa.unparse([{ value: data }]);
}

/**
 * Export data to CSV file
 */
export function exportToCSV(data, filename = 'data.csv') {
  const csv = convertToCSV(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

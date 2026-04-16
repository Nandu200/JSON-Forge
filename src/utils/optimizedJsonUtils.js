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
function checkSizeLimits(data, path = '', stats = { depth: 0, keys: 0, maxDepth: 0 }) {
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



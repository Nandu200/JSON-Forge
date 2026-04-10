/**
 * JSON Schema Validation Utilities
 * Validates JSON data against a JSON Schema
 */

/**
 * Parse JSON Schema safely
 */
export function parseJSONSchema(schemaStr) {
  try {
    const schema = JSON.parse(schemaStr);
    return { schema, error: null };
  } catch (e) {
    return { schema: null, error: `Invalid JSON Schema: ${e.message}` };
  }
}

/**
 * Validate a value against a JSON Schema
 * Returns an array of validation errors
 */
export function validateAgainstSchema(data, schema, path = 'root') {
  const errors = [];

  if (!schema || typeof schema !== 'object') {
    return errors;
  }

  // Check type
  if (schema.type) {
    const actualType = getJSONType(data);
    if (!matchesType(actualType, schema.type)) {
      errors.push({
        path,
        message: `Expected type "${schema.type}" but got "${actualType}"`,
        value: data,
        schemaPath: `${path}.type`
      });
    }
  }

  // Check enum
  if (schema.enum && !schema.enum.includes(data)) {
    errors.push({
      path,
      message: `Value must be one of: ${schema.enum.join(', ')}`,
      value: data,
      schemaPath: `${path}.enum`
    });
  }

  // Type-specific validations
  if (typeof data === 'string') {
    if (schema.minLength !== undefined && data.length < schema.minLength) {
      errors.push({
        path,
        message: `String length ${data.length} is less than minimum ${schema.minLength}`,
        value: data,
        schemaPath: `${path}.minLength`
      });
    }
    if (schema.maxLength !== undefined && data.length > schema.maxLength) {
      errors.push({
        path,
        message: `String length ${data.length} exceeds maximum ${schema.maxLength}`,
        value: data,
        schemaPath: `${path}.maxLength`
      });
    }
    if (schema.pattern) {
      try {
        const regex = new RegExp(schema.pattern);
        if (!regex.test(data)) {
          errors.push({
            path,
            message: `String does not match pattern "${schema.pattern}"`,
            value: data,
            schemaPath: `${path}.pattern`
          });
        }
      } catch (e) {
        errors.push({
          path,
          message: `Invalid regex pattern "${schema.pattern}": ${e.message}`,
          value: data,
          schemaPath: `${path}.pattern`
        });
      }
    }
  }

  if (typeof data === 'number') {
    if (schema.minimum !== undefined && data < schema.minimum) {
      errors.push({
        path,
        message: `Value ${data} is less than minimum ${schema.minimum}`,
        value: data,
        schemaPath: `${path}.minimum`
      });
    }
    if (schema.maximum !== undefined && data > schema.maximum) {
      errors.push({
        path,
        message: `Value ${data} exceeds maximum ${schema.maximum}`,
        value: data,
        schemaPath: `${path}.maximum`
      });
    }
    if (schema.exclusiveMinimum !== undefined && data <= schema.exclusiveMinimum) {
      errors.push({
        path,
        message: `Value ${data} must be greater than ${schema.exclusiveMinimum}`,
        value: data,
        schemaPath: `${path}.exclusiveMinimum`
      });
    }
    if (schema.exclusiveMaximum !== undefined && data >= schema.exclusiveMaximum) {
      errors.push({
        path,
        message: `Value ${data} must be less than ${schema.exclusiveMaximum}`,
        value: data,
        schemaPath: `${path}.exclusiveMaximum`
      });
    }
    if (schema.multipleOf !== undefined && data % schema.multipleOf !== 0) {
      errors.push({
        path,
        message: `Value ${data} must be a multiple of ${schema.multipleOf}`,
        value: data,
        schemaPath: `${path}.multipleOf`
      });
    }
  }

  if (Array.isArray(data)) {
    if (schema.minItems !== undefined && data.length < schema.minItems) {
      errors.push({
        path,
        message: `Array length ${data.length} is less than minimum ${schema.minItems}`,
        value: data,
        schemaPath: `${path}.minItems`
      });
    }
    if (schema.maxItems !== undefined && data.length > schema.maxItems) {
      errors.push({
        path,
        message: `Array length ${data.length} exceeds maximum ${schema.maxItems}`,
        value: data,
        schemaPath: `${path}.maxItems`
      });
    }
    if (schema.uniqueItems) {
      const seen = new Set();
      for (let i = 0; i < data.length; i++) {
        const str = JSON.stringify(data[i]);
        if (seen.has(str)) {
          errors.push({
            path: `${path}[${i}]`,
            message: `Duplicate items found in array`,
            value: data[i],
            schemaPath: `${path}.uniqueItems`
          });
        }
        seen.add(str);
      }
    }
    // Validate array items
    if (schema.items) {
      data.forEach((item, idx) => {
        const itemPath = `${path}[${idx}]`;
        if (schema.items.type || schema.items.properties) {
          errors.push(...validateAgainstSchema(item, schema.items, itemPath));
        }
      });
    }
  }

  if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
    // Check required properties
    if (schema.required) {
      schema.required.forEach(prop => {
        if (!(prop in data)) {
          errors.push({
            path,
            message: `Missing required property "${prop}"`,
            value: undefined,
            schemaPath: `${path}.required`,
            missingProperty: prop
          });
        }
      });
    }

    // Validate properties
    if (schema.properties) {
      Object.entries(schema.properties).forEach(([prop, propSchema]) => {
        if (prop in data) {
          const propPath = `${path}.${prop}`;
          errors.push(...validateAgainstSchema(data[prop], propSchema, propPath));
        }
      });
    }

    // Check additionalProperties
    if (schema.additionalProperties === false) {
      const allowedProps = new Set(Object.keys(schema.properties || {}));
      Object.keys(data).forEach(prop => {
        if (!allowedProps.has(prop)) {
          errors.push({
            path: `${path}.${prop}`,
            message: `Additional property "${prop}" is not allowed`,
            value: data[prop],
            schemaPath: `${path}.additionalProperties`
          });
        }
      });
    }

    // Check minProperties/maxProperties
    const propCount = Object.keys(data).length;
    if (schema.minProperties !== undefined && propCount < schema.minProperties) {
      errors.push({
        path,
        message: `Object has ${propCount} properties, minimum is ${schema.minProperties}`,
        value: data,
        schemaPath: `${path}.minProperties`
      });
    }
    if (schema.maxProperties !== undefined && propCount > schema.maxProperties) {
      errors.push({
        path,
        message: `Object has ${propCount} properties, maximum is ${schema.maxProperties}`,
        value: data,
        schemaPath: `${path}.maxProperties`
      });
    }
  }

  // Check const
  if (schema.const !== undefined && JSON.stringify(data) !== JSON.stringify(schema.const)) {
    errors.push({
      path,
      message: `Value must be ${JSON.stringify(schema.const)}`,
      value: data,
      schemaPath: `${path}.const`
    });
  }

  // Check allOf (all schemas must match)
  if (schema.allOf) {
    schema.allOf.forEach((subSchema, idx) => {
      errors.push(...validateAgainstSchema(data, subSchema, path));
    });
  }

  // Check anyOf (at least one schema must match)
  if (schema.anyOf) {
    const anyValid = schema.anyOf.some(subSchema => {
      return validateAgainstSchema(data, subSchema, path).length === 0;
    });
    if (!anyValid) {
      errors.push({
        path,
        message: `Value does not match any of the allowed schemas`,
        value: data,
        schemaPath: `${path}.anyOf`
      });
    }
  }

  // Check oneOf (exactly one schema must match)
  if (schema.oneOf) {
    const validCount = schema.oneOf.filter(subSchema => {
      return validateAgainstSchema(data, subSchema, path).length === 0;
    }).length;
    if (validCount !== 1) {
      errors.push({
        path,
        message: `Value must match exactly one schema, but matched ${validCount}`,
        value: data,
        schemaPath: `${path}.oneOf`
      });
    }
  }

  return errors;
}

/**
 * Get the JSON type of a value
 */
function getJSONType(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

/**
 * Check if actual type matches expected type(s)
 */
function matchesType(actualType, expectedType) {
  if (Array.isArray(expectedType)) {
    return expectedType.includes(actualType);
  }
  return actualType === expectedType;
}

/**
 * Auto-fix common JSON issues
 * Returns { fixed: boolean, value: string, fixes: string[] }
 */
export function autoFixJSON(jsonStr) {
  // Size limit for auto-fix (5MB)
  const MAX_AUTO_FIX_SIZE = 5 * 1024 * 1024;
  if (jsonStr.length > MAX_AUTO_FIX_SIZE) {
    return {
      fixed: false,
      value: jsonStr,
      fixes: [],
      error: 'File too large for auto-fix. Please fix manually.'
    };
  }

  const fixes = [];
  let value = jsonStr.trim();

  // Fix 0: Remove BOM (Byte Order Mark) if present
  const beforeBOM = value;
  value = value.replace(/^\uFEFF/, '');
  if (value !== beforeBOM) {
    fixes.push('Removed BOM character');
  }

  // Fix 1: Replace single quotes with double quotes (but not within double-quoted strings)
  const originalValue = value;
  value = fixSingleQuotes(value);
  if (value !== originalValue) {
    fixes.push('Replaced single quotes with double quotes');
  }

  // Fix 2: Add missing quotes around property names
  const beforePropQuotes = value;
  value = fixMissingPropertyQuotes(value);
  if (value !== beforePropQuotes) {
    fixes.push('Added missing quotes around property names');
  }

  // Fix 3: Remove trailing commas
  const beforeTrailingCommas = value;
  value = removeTrailingCommas(value);
  if (value !== beforeTrailingCommas) {
    fixes.push('Removed trailing commas');
  }

  // Fix 3a: Fix numbers with embedded commas (e.g., 9,8.5 → 98.5, 1,000 → 1000)
  const beforeNumberCommas = value;
  value = fixNumbersWithCommas(value);
  if (value !== beforeNumberCommas) {
    fixes.push('Fixed numbers with embedded commas');
  }

  // Fix 4: Fix unquoted string values
  const beforeUnquotedStrings = value;
  value = fixUnquotedStrings(value);
  if (value !== beforeUnquotedStrings) {
    fixes.push('Fixed unquoted string values');
  }

  // Fix 5: Replace JavaScript undefined with null
  const beforeUndefined = value;
  value = replaceOutsideStrings(value, /\bundefined\b/g, 'null');
  if (value !== beforeUndefined) {
    fixes.push('Replaced undefined with null');
  }

  // Fix 6: Replace JavaScript NaN with null
  const beforeNaN = value;
  value = replaceOutsideStrings(value, /\bNaN\b/g, 'null');
  if (value !== beforeNaN) {
    fixes.push('Replaced NaN with null');
  }

  // Fix 7: Replace JavaScript Infinity with null
  const beforeInfinity = value;
  value = replaceOutsideStrings(value, /\b-?Infinity\b/g, 'null');
  if (value !== beforeInfinity) {
    fixes.push('Replaced Infinity with null');
  }

  // Fix 8: Fix missing commas between elements (context-aware)
  const beforeMissingCommas = value;
  value = fixMissingCommas(value);
  if (value !== beforeMissingCommas) {
    fixes.push('Added missing commas between elements');
  }

  // Fix 9: Fix escaped single quotes
  const beforeEscapedQuotes = value;
  value = value.replace(/\\'/g, "'");
  if (value !== beforeEscapedQuotes) {
    fixes.push('Fixed escaped quotes');
  }

  // Fix 10: Fix unbalanced brackets/braces
  const beforeBrackets = value;
  value = fixUnbalancedBrackets(value);
  if (value !== beforeBrackets) {
    fixes.push('Fixed unbalanced brackets/braces');
  }

  // Fix 11: Wrap bare values that look like multiple JSON objects/arrays
  const beforeWrap = value;
  value = wrapMultipleRootElements(value);
  if (value !== beforeWrap) {
    fixes.push('Wrapped multiple root elements into an array');
  }

  // Final attempt: if still invalid, do a deep token-level repair
  try {
    JSON.parse(value);
  } catch (e) {
    const beforeDeep = value;
    value = deepRepair(value);
    if (value !== beforeDeep) {
      fixes.push('Applied deep structural repair');
    }
  }

  return {
    fixed: fixes.length > 0,
    value,
    fixes
  };
}

/**
 * Fix numbers with embedded commas in value positions (after colon)
 * e.g., "score": 9,8.5 → "score": 98.5
 * e.g., "amount": 1,000,000 → "amount": 1000000
 */
function fixNumbersWithCommas(str) {
  const tokens = tokenizeString(str);
  return tokens.map(t => {
    if (t.type === 'code') {
      return t.value.replace(
        /(:\s*)(-?\d+(?:,\d+)+(?:\.\d+)?)\b/g,
        (match, prefix, number) => {
          return prefix + number.replace(/,/g, '');
        }
      );
    }
    return t.value;
  }).join('');
}

/**
 * Replace regex matches only outside of quoted strings
 */
function replaceOutsideStrings(str, regex, replacement) {
  const tokens = tokenizeString(str);
  return tokens.map(t => t.type === 'code' ? t.value.replace(regex, replacement) : t.value).join('');
}

/**
 * Tokenize a string into "string literal" and "code" segments
 */
function tokenizeString(str) {
  const tokens = [];
  let i = 0;
  let current = '';

  while (i < str.length) {
    if (str[i] === '"') {
      // Push any accumulated code
      if (current) { tokens.push({ type: 'code', value: current }); current = ''; }
      // Read the full string
      let s = '"';
      i++;
      while (i < str.length) {
        if (str[i] === '\\' && i + 1 < str.length) {
          s += str[i] + str[i + 1];
          i += 2;
        } else if (str[i] === '"') {
          s += '"';
          i++;
          break;
        } else {
          s += str[i];
          i++;
        }
      }
      tokens.push({ type: 'string', value: s });
    } else {
      current += str[i];
      i++;
    }
  }
  if (current) tokens.push({ type: 'code', value: current });
  return tokens;
}

/**
 * Replace single quotes with double quotes, handling nested quotes
 */
function fixSingleQuotes(str) {
  let result = '';
  let inDouble = false;
  let inSingle = false;
  let escaped = false;

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];

    if (escaped) {
      result += ch;
      escaped = false;
      continue;
    }

    if (ch === '\\') {
      result += ch;
      escaped = true;
      continue;
    }

    if (!inDouble && !inSingle && ch === "'") {
      inSingle = true;
      result += '"';
    } else if (inSingle && ch === "'") {
      inSingle = false;
      result += '"';
    } else if (!inSingle && !inDouble && ch === '"') {
      inDouble = true;
      result += '"';
    } else if (inDouble && ch === '"') {
      inDouble = false;
      result += '"';
    } else {
      result += ch;
    }
  }

  return result;
}

/**
 * Add missing quotes around property names
 */
function fixMissingPropertyQuotes(str) {
  // Match unquoted property names followed by colon, outside strings
  const tokens = tokenizeString(str);
  return tokens.map(t => {
    if (t.type === 'code') {
      return t.value.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":');
    }
    return t.value;
  }).join('');
}

/**
 * Remove trailing commas before } or ]
 */
function removeTrailingCommas(str) {
  const tokens = tokenizeString(str);
  return tokens.map(t => {
    if (t.type === 'code') {
      return t.value.replace(/,(\s*[}\]])/g, '$1');
    }
    return t.value;
  }).join('');
}

/**
 * Fix unquoted string values (basic implementation)
 */
function fixUnquotedStrings(str) {
  const tokens = tokenizeString(str);
  return tokens.map(t => {
    if (t.type === 'code') {
      return t.value.replace(/:\s*([a-zA-Z_$][a-zA-Z0-9_$\s]*?)(\s*[,}\]])/g, (match, word, end) => {
        const trimmed = word.trim();
        if (['true', 'false', 'null'].includes(trimmed)) return match;
        if (!isNaN(trimmed) && trimmed !== '') return match;
        return `: "${trimmed}"${end}`;
      });
    }
    return t.value;
  }).join('');
}

/**
 * Fix missing commas between elements - context-aware, handles all JSON structures
 * Works for: arrays of objects, arrays of arrays, nested structures, etc.
 * Consumes strings and numbers as whole tokens to avoid inserting commas within them.
 */
function fixMissingCommas(str) {
  let result = '';
  let i = 0;
  let lastSignificantChar = '';

  while (i < str.length) {
    const ch = str[i];

    // Handle strings: consume as a whole token
    if (ch === '"') {
      if (needsCommaBefore(lastSignificantChar)) {
        result += ',';
      }

      let s = '"';
      i++;
      while (i < str.length) {
        if (str[i] === '\\' && i + 1 < str.length) {
          s += str[i] + str[i + 1];
          i += 2;
        } else if (str[i] === '"') {
          s += '"';
          i++;
          break;
        } else {
          s += str[i];
          i++;
        }
      }
      result += s;
      lastSignificantChar = '"';
      continue;
    }

    // Skip whitespace
    if (/\s/.test(ch)) {
      result += ch;
      i++;
      continue;
    }

    // Handle numbers: consume the entire number as a single token
    // (digits, decimal point, exponent) to avoid inserting commas within them
    if (/\d/.test(ch) || (ch === '-' && i + 1 < str.length && /[\d.]/.test(str[i + 1]))) {
      if (needsCommaBefore(lastSignificantChar)) {
        result += ',';
      }
      // Optional negative sign
      if (ch === '-') {
        result += ch;
        i++;
      }
      // Integer part
      while (i < str.length && /\d/.test(str[i])) {
        result += str[i];
        i++;
      }
      // Decimal part
      if (i < str.length && str[i] === '.' && i + 1 < str.length && /\d/.test(str[i + 1])) {
        result += str[i];
        i++;
        while (i < str.length && /\d/.test(str[i])) {
          result += str[i];
          i++;
        }
      }
      // Exponent part (e.g., 1e5, 1.5E-3)
      if (i < str.length && (str[i] === 'e' || str[i] === 'E')) {
        result += str[i];
        i++;
        if (i < str.length && (str[i] === '+' || str[i] === '-')) {
          result += str[i];
          i++;
        }
        while (i < str.length && /\d/.test(str[i])) {
          result += str[i];
          i++;
        }
      }
      lastSignificantChar = result[result.length - 1];
      continue;
    }

    // Check for missing comma before value-starting tokens
    if ((ch === '{' || ch === '[') && needsCommaBefore(lastSignificantChar)) {
      result += ',';
    }
    // true/false/null starting after a value ender
    else if (/[tfn]/.test(ch) && needsCommaBefore(lastSignificantChar)) {
      const rest = str.substring(i);
      if (/^(true|false|null)\b/.test(rest)) {
        result += ',';
      }
    }

    result += ch;
    lastSignificantChar = ch;
    i++;
  }

  return result;
}

/**
 * Check if a comma should be inserted before the current value-starting token.
 * A comma is needed when the last significant character was a value-ending token.
 */
function needsCommaBefore(lastChar) {
  // Value-ending chars: " } ] and digits, also end of literals (handled by checking last char)
  const valueEnders = ['"', '}', ']'];
  // NOT after these (they expect a value to follow, not a comma)
  const noCommaAfter = [':', ',', '{', '[', ''];

  if (noCommaAfter.includes(lastChar)) return false;
  if (valueEnders.includes(lastChar)) return true;
  if (/\d/.test(lastChar)) return true;
  // 'e' at end could be true/false/null ending
  if (/[el]/.test(lastChar)) return true;
  return false;
}

/**
 * Fix unbalanced brackets and braces
 * Counts openers vs closers and appends or prepends as needed
 */
function fixUnbalancedBrackets(str) {
  let braceCount = 0; // { }
  let bracketCount = 0; // [ ]
  let inString = false;
  let escaped = false;
  const openerStack = []; // track order of unclosed openers

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];

    if (escaped) { escaped = false; continue; }
    if (ch === '\\' && inString) { escaped = true; continue; }

    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (ch === '{') { braceCount++; openerStack.push('{'); }
    else if (ch === '[') { bracketCount++; openerStack.push('['); }
    else if (ch === '}') {
      if (braceCount > 0) {
        braceCount--;
        // Remove last matching '{' from stack
        for (let j = openerStack.length - 1; j >= 0; j--) {
          if (openerStack[j] === '{') { openerStack.splice(j, 1); break; }
        }
      } else {
        // Extra } — we'll handle below
        braceCount--;
      }
    }
    else if (ch === ']') {
      if (bracketCount > 0) {
        bracketCount--;
        for (let j = openerStack.length - 1; j >= 0; j--) {
          if (openerStack[j] === '[') { openerStack.splice(j, 1); break; }
        }
      } else {
        bracketCount--;
      }
    }
  }

  let result = str;

  // Append missing closers in reverse order of unclosed openers
  for (let j = openerStack.length - 1; j >= 0; j--) {
    if (openerStack[j] === '{') result += '\n}';
    else if (openerStack[j] === '[') result += '\n]';
  }

  // Prepend missing openers for extra closers
  if (braceCount < 0) {
    for (let j = 0; j < Math.abs(braceCount); j++) result = '{\n' + result;
  }
  if (bracketCount < 0) {
    for (let j = 0; j < Math.abs(bracketCount); j++) result = '[\n' + result;
  }

  return result;
}

/**
 * If the string contains multiple root-level JSON values (e.g., multiple objects
 * or arrays separated by whitespace), wrap them in an array.
 */
function wrapMultipleRootElements(str) {
  const trimmed = str.trim();
  if (!trimmed) return str;

  // Already looks like a single valid root
  try { JSON.parse(trimmed); return trimmed; } catch (e) { /* continue */ }

  // Try to detect multiple root objects/arrays
  // e.g., `{...}{...}` or `{...}\n{...}` or `[...][...]`
  const roots = splitRootElements(trimmed);
  if (roots.length > 1) {
    // Verify each root parses
    const allValid = roots.every(r => { try { JSON.parse(r); return true; } catch (e) { return false; } });
    if (allValid) {
      return '[\n' + roots.join(',\n') + '\n]';
    }
  }

  return str;
}

/**
 * Split a string into separate root-level JSON elements
 */
function splitRootElements(str) {
  const roots = [];
  let i = 0;

  while (i < str.length) {
    // Skip whitespace
    while (i < str.length && /\s/.test(str[i])) i++;
    if (i >= str.length) break;

    const start = i;
    const ch = str[i];

    if (ch === '{' || ch === '[') {
      const closer = ch === '{' ? '}' : ']';
      let depth = 0;
      let inStr = false;
      let esc = false;

      while (i < str.length) {
        const c = str[i];
        if (esc) { esc = false; i++; continue; }
        if (c === '\\' && inStr) { esc = true; i++; continue; }
        if (c === '"') { inStr = !inStr; i++; continue; }
        if (inStr) { i++; continue; }
        if (c === ch) depth++;
        else if (c === closer) { depth--; if (depth === 0) { i++; break; } }
        i++;
      }

      // Skip optional comma between roots
      while (i < str.length && /[\s,]/.test(str[i])) i++;

      roots.push(str.substring(start, i).replace(/,\s*$/, '').trim());
    } else {
      // Not a structured root; bail
      return [str];
    }
  }

  return roots;
}

/**
 * Deep repair: tokenize and rebuild valid JSON structure
 * Handles complex cases like arrays of arrays, arrays of objects, nested structures
 */
function deepRepair(str) {
  let value = str.trim();

  // Try wrapping in array if it looks like comma-separated values
  if (!value.startsWith('[') && !value.startsWith('{')) {
    // Maybe it's bare values like: "a", "b", "c" or 1, 2, 3
    const asArray = '[' + value + ']';
    try { JSON.parse(asArray); return asArray; } catch (e) { /* continue */ }
  }

  // Try fixing common issues one more time after all other fixes
  // Re-scan for structural issues
  let result = '';
  let i = 0;
  let depth = 0;
  let inString = false;
  let escaped = false;
  let lastNonWS = '';

  while (i < value.length) {
    const ch = value[i];

    if (escaped) {
      result += ch;
      escaped = false;
      i++;
      continue;
    }

    if (ch === '\\' && inString) {
      result += ch;
      escaped = true;
      i++;
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      result += ch;
      if (!inString) lastNonWS = '"';
      i++;
      continue;
    }

    if (inString) {
      result += ch;
      i++;
      continue;
    }

    // Outside string
    if (/\s/.test(ch)) {
      result += ch;
      i++;
      continue;
    }

    // Fix: colon after colon (missing value) → insert null
    if (ch === ':' && lastNonWS === ':') {
      result += 'null,';
      // don't add ch yet, let next iteration handle it
      lastNonWS = ',';
      continue;
    }

    // Fix: comma after comma → skip duplicate
    if (ch === ',' && lastNonWS === ',') {
      i++;
      continue;
    }

    // Fix: comma right after { or [ → skip
    if (ch === ',' && (lastNonWS === '{' || lastNonWS === '[')) {
      i++;
      continue;
    }

    // Fix: closing bracket right after colon → insert null
    if ((ch === '}' || ch === ']') && lastNonWS === ':') {
      result += 'null';
      lastNonWS = 'l'; // pretend last was null
    }

    // Fix: colon right after { or [ → something wrong, skip the colon
    if (ch === ':' && (lastNonWS === '{' || lastNonWS === '[' || lastNonWS === ',')) {
      i++;
      continue;
    }

    result += ch;
    lastNonWS = ch;

    if (ch === '{' || ch === '[') depth++;
    else if (ch === '}' || ch === ']') depth--;

    i++;
  }

  // Close any unclosed strings
  if (inString) {
    result += '"';
  }

  // Close any unclosed brackets
  // (fixUnbalancedBrackets already ran, but deepRepair may have changed things)
  value = result;
  try {
    JSON.parse(value);
    return value;
  } catch (e) {
    // One more pass to fix brackets
    return fixUnbalancedBrackets(value);
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
 * Convert data to CSV format
 */
export function convertToCSV(data) {
  if (!data) return '';

  // Handle array of objects
  if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
    const headers = [...new Set(data.flatMap(item => Object.keys(item || {})))];
    const rows = data.map(item =>
      headers.map(header => {
        const value = item[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        const str = String(value);
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(',')
    );
    return [headers.join(','), ...rows].join('\n');
  }

  // Handle single object
  if (typeof data === 'object' && !Array.isArray(data)) {
    const entries = Object.entries(data);
    const headers = ['key', 'value'];
    const rows = entries.map(([key, value]) => {
      let strValue;
      if (value === null || value === undefined) strValue = '';
      else if (typeof value === 'object') strValue = JSON.stringify(value);
      else strValue = String(value);
      
      if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
        strValue = `"${strValue.replace(/"/g, '""')}"`;
      }
      return `${key},${strValue}`;
    });
    return [headers.join(','), ...rows].join('\n');
  }

  // Handle primitive
  return `value\n${data}`;
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

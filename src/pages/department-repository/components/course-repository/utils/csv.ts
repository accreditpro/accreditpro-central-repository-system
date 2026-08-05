/**
 * Parse a single CSV line respecting double-quoted fields.
 * Handles commas inside quoted strings correctly.
 */
export function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      // Toggle quote mode
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

/**
 * Split CSV text into lines, filtering out empty lines.
 */
export function splitCSVLines(text: string): string[] {
  return text.split('\n').filter((l) => l.trim().length > 0);
}

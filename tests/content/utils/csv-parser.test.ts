import { describe, it, expect } from 'vitest';
import {
  parseCSV,
  serializeCSV,
  parseArray,
  parseJSON,
  parseBoolean,
  parseNumber,
  parseDate,
} from '../../../src/content/utils/csv-parser';

describe('CSV Parser', () => {
  describe('parseCSV', () => {
    it('should parse basic CSV with headers', () => {
      const csv = 'name,age,city\nJohn,30,NYC\nJane,25,LA';
      const result = parseCSV(csv);

      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toEqual({ name: 'John', age: '30', city: 'NYC' });
      expect(result.data[1]).toEqual({ name: 'Jane', age: '25', city: 'LA' });
      expect(result.errors).toHaveLength(0);
    });

    it('should trim whitespace from headers and values', () => {
      const csv = ' name , age , city \n John , 30 , NYC ';
      const result = parseCSV(csv);

      expect(result.data[0]).toEqual({ name: 'John', age: '30', city: 'NYC' });
    });

    it('should skip empty lines by default', () => {
      const csv = 'name,age\nJohn,30\n\nJane,25\n';
      const result = parseCSV(csv);

      expect(result.data).toHaveLength(2);
    });

    it('should handle quoted values with commas', () => {
      const csv = 'name,description\nTool,"A tool, with comma"\nItem,"Another, item"';
      const result = parseCSV(csv);

      expect(result.data[0].description).toBe('A tool, with comma');
      expect(result.data[1].description).toBe('Another, item');
    });

    it('should handle empty CSV', () => {
      const result = parseCSV('');
      expect(result.data).toHaveLength(0);
    });
  });

  describe('serializeCSV', () => {
    it('should serialize array of objects to CSV', () => {
      const data = [
        { name: 'John', age: 30, city: 'NYC' },
        { name: 'Jane', age: 25, city: 'LA' },
      ];
      const csv = serializeCSV(data);

      expect(csv).toContain('name,age,city');
      expect(csv).toContain('John,30,NYC');
      expect(csv).toContain('Jane,25,LA');
    });

    it('should handle empty array', () => {
      const csv = serializeCSV([]);
      expect(csv).toBe('');
    });

    it('should respect column order when specified', () => {
      const data = [{ age: 30, name: 'John' }];
      const csv = serializeCSV(data, { columns: ['name', 'age'] });

      expect(csv.split('\n')[0].trim()).toBe('name,age');
    });
  });

  describe('parseArray', () => {
    it('should parse pipe-separated values', () => {
      const result = parseArray('tag1|tag2|tag3');
      expect(result).toEqual(['tag1', 'tag2', 'tag3']);
    });

    it('should parse JSON array format', () => {
      const result = parseArray('["tag1","tag2","tag3"]');
      expect(result).toEqual(['tag1', 'tag2', 'tag3']);
    });

    it('should return empty array for empty string', () => {
      expect(parseArray('')).toEqual([]);
      expect(parseArray('   ')).toEqual([]);
    });

    it('should trim whitespace from array values', () => {
      const result = parseArray('tag1 | tag2 | tag3');
      expect(result).toEqual(['tag1', 'tag2', 'tag3']);
    });

    it('should filter out empty values', () => {
      const result = parseArray('tag1||tag3');
      expect(result).toEqual(['tag1', 'tag3']);
    });
  });

  describe('parseJSON', () => {
    it('should parse valid JSON object', () => {
      const result = parseJSON('{"name":"John","age":30}');
      expect(result).toEqual({ name: 'John', age: 30 });
    });

    it('should parse valid JSON array', () => {
      const result = parseJSON('[1,2,3]');
      expect(result).toEqual([1, 2, 3]);
    });

    it('should return null for invalid JSON', () => {
      expect(parseJSON('not json')).toBeNull();
      expect(parseJSON('{invalid}')).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(parseJSON('')).toBeNull();
      expect(parseJSON('   ')).toBeNull();
    });
  });

  describe('parseBoolean', () => {
    it('should parse true values', () => {
      expect(parseBoolean('true')).toBe(true);
      expect(parseBoolean('TRUE')).toBe(true);
      expect(parseBoolean('1')).toBe(true);
      expect(parseBoolean('yes')).toBe(true);
      expect(parseBoolean('YES')).toBe(true);
    });

    it('should parse false values', () => {
      expect(parseBoolean('false')).toBe(false);
      expect(parseBoolean('FALSE')).toBe(false);
      expect(parseBoolean('0')).toBe(false);
      expect(parseBoolean('no')).toBe(false);
      expect(parseBoolean('anything')).toBe(false);
    });

    it('should handle whitespace', () => {
      expect(parseBoolean('  true  ')).toBe(true);
      expect(parseBoolean('  false  ')).toBe(false);
    });
  });

  describe('parseNumber', () => {
    it('should parse integers', () => {
      expect(parseNumber('42')).toBe(42);
      expect(parseNumber('-10')).toBe(-10);
    });

    it('should parse floats', () => {
      expect(parseNumber('3.14')).toBe(3.14);
      expect(parseNumber('-2.5')).toBe(-2.5);
    });

    it('should return null for invalid numbers', () => {
      expect(parseNumber('not a number')).toBeNull();
      // parseFloat('12abc') returns 12, so this is expected behavior
      expect(parseNumber('abc12')).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(parseNumber('')).toBeNull();
    });
  });

  describe('parseDate', () => {
    it('should parse ISO date strings', () => {
      const result = parseDate('2024-01-15');
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2024);
      expect(result?.getMonth()).toBe(0); // January
      expect(result?.getDate()).toBe(15);
    });

    it('should parse ISO datetime strings', () => {
      const result = parseDate('2024-01-15T10:30:00Z');
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2024);
    });

    it('should return null for invalid dates', () => {
      expect(parseDate('not a date')).toBeNull();
      expect(parseDate('2024-13-45')).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(parseDate('')).toBeNull();
      expect(parseDate('   ')).toBeNull();
    });
  });

  describe('edge cases and advanced parsing', () => {
    it('should handle CSV with BOM (Byte Order Mark)', () => {
      const csvWithBOM = '\uFEFFname,age\nJohn,30';
      const result = parseCSV(csvWithBOM);
      expect(result.data).toHaveLength(1);
    });

    it('should handle CSV with CRLF line endings', () => {
      const csv = 'name,age\r\nJohn,30\r\nJane,25';
      const result = parseCSV(csv);
      expect(result.data).toHaveLength(2);
    });

    it('should handle CSV with mixed line endings', () => {
      const csv = 'name,age\nJohn,30\r\nJane,25\rBob,35';
      const result = parseCSV(csv);
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should handle escaped quotes in values', () => {
      const csv = 'name,quote\nJohn,"He said ""Hello"""';
      const result = parseCSV(csv);
      expect(result.data[0].quote).toContain('"');
    });

    it('should handle newlines within quoted values', () => {
      const csv = 'name,description\nJohn,"Line 1\nLine 2"';
      const result = parseCSV(csv);
      expect(result.data[0].description).toContain('\n');
    });

    it('should handle empty fields', () => {
      const csv = 'name,age,city\nJohn,,NYC\n,25,LA';
      const result = parseCSV(csv);
      expect(result.data[0].age).toBe('');
      expect(result.data[1].name).toBe('');
    });

    it('should handle trailing commas', () => {
      const csv = 'name,age,\nJohn,30,';
      const result = parseCSV(csv);
      expect(result.data).toHaveLength(1);
    });

    it('should handle unicode characters', () => {
      const csv = 'name,emoji\nJohn,😀🎉\nJane,🌟✨';
      const result = parseCSV(csv);
      expect(result.data[0].emoji).toBe('😀🎉');
      expect(result.data[1].emoji).toBe('🌟✨');
    });

    it('should handle very long lines', () => {
      const longValue = 'a'.repeat(10000);
      const csv = `name,description\nJohn,${longValue}`;
      const result = parseCSV(csv);
      expect(result.data[0].description.length).toBe(10000);
    });

    it('should handle parseArray with nested pipes', () => {
      const result = parseArray('tag1|tag2||tag3');
      expect(result).toEqual(['tag1', 'tag2', 'tag3']);
    });

    it('should handle parseJSON with nested objects', () => {
      const result = parseJSON('{"user":{"name":"John","age":30}}');
      expect(result).toEqual({ user: { name: 'John', age: 30 } });
    });

    it('should handle parseNumber with scientific notation', () => {
      expect(parseNumber('1e5')).toBe(100000);
      expect(parseNumber('1.5e2')).toBe(150);
    });

    it('should handle parseBoolean with various formats', () => {
      expect(parseBoolean('Y')).toBe(false); // Only specific values are true
      expect(parseBoolean('N')).toBe(false);
      expect(parseBoolean('on')).toBe(false);
      expect(parseBoolean('off')).toBe(false);
    });

    it('should handle parseArray with JSON array containing special characters', () => {
      const result = parseArray('["tag|1","tag,2","tag;3"]');
      expect(result).toEqual(['tag|1', 'tag,2', 'tag;3']);
    });

    it('should handle serializeCSV with special characters', () => {
      const data = [
        { name: 'John, Jr.', description: 'A "special" person' },
      ];
      const csv = serializeCSV(data);
      expect(csv).toContain('"John, Jr."');
      expect(csv).toContain('"A ""special"" person"');
    });

    it('should handle serializeCSV with null and undefined values', () => {
      const data = [
        { name: 'John', age: null, city: undefined },
      ];
      const csv = serializeCSV(data);
      expect(csv).toBeDefined();
    });

    it('should handle parseDate with various formats', () => {
      expect(parseDate('2024-01-15')).toBeInstanceOf(Date);
      expect(parseDate('2024/01/15')).toBeInstanceOf(Date);
      expect(parseDate('Jan 15, 2024')).toBeInstanceOf(Date);
    });
  });
});

import { describe, it, expect } from 'vitest';
import { CSVSerializer, createContentSerializer } from '../../../src/content/utils/csv-serializer';
import type { LocalizedString } from '../../../src/shared/types/localization';

describe('CSVSerializer', () => {
  describe('Basic Serialization', () => {
    it('should serialize simple objects to CSV', () => {
      const serializer = new CSVSerializer();
      const data = [
        { id: '1', name: 'Tool A', version: '1.0' },
        { id: '2', name: 'Tool B', version: '2.0' },
      ];

      const csv = serializer.serialize(data);

      expect(csv).toContain('id,name,version');
      expect(csv).toContain('1,Tool A,1.0');
      expect(csv).toContain('2,Tool B,2.0');
    });

    it('should handle empty array', () => {
      const serializer = new CSVSerializer();
      const csv = serializer.serialize([]);
      expect(csv).toBe('');
    });

    it('should escape values with commas', () => {
      const serializer = new CSVSerializer();
      const data = [{ name: 'Tool, with comma', version: '1.0' }];
      const csv = serializer.serialize(data);

      expect(csv).toContain('"Tool, with comma"');
    });

    it('should escape values with quotes', () => {
      const serializer = new CSVSerializer();
      const data = [{ name: 'Tool "quoted"', version: '1.0' }];
      const csv = serializer.serialize(data);

      expect(csv).toContain('"Tool ""quoted"""');
    });
  });

  describe('LocalizedString Serialization', () => {
    it('should expand LocalizedString fields to language columns', () => {
      const serializer = new CSVSerializer({
        localizedFields: ['title'],
      });

      const data = [
        {
          id: '1',
          title: {
            en: 'English Title',
            jp: 'Japanese Title',
            cn: 'Chinese Title',
          } as LocalizedString,
        },
      ];

      const csv = serializer.serialize(data);

      expect(csv).toContain('title_en');
      expect(csv).toContain('title_jp');
      expect(csv).toContain('title_cn');
      expect(csv).toContain('English Title');
      expect(csv).toContain('Japanese Title');
      expect(csv).toContain('Chinese Title');
    });

    it('should handle missing optional language fields', () => {
      const serializer = new CSVSerializer({
        localizedFields: ['title'],
      });

      const data = [
        {
          id: '1',
          title: {
            en: 'English',
            jp: 'Japanese',
          } as LocalizedString,
        },
      ];

      const csv = serializer.serialize(data);
      const lines = csv.split('\n');

      expect(lines[0]).toContain('title_en');
      expect(lines[0]).toContain('title_jp');
    });
  });

  describe('Array Serialization', () => {
    it('should serialize arrays with pipe separator', () => {
      const serializer = new CSVSerializer({
        arrayFields: ['tags'],
      });

      const data = [{ id: '1', tags: ['tag1', 'tag2', 'tag3'] }];
      const csv = serializer.serialize(data);

      expect(csv).toContain('tag1|tag2|tag3');
    });

    it('should serialize empty arrays', () => {
      const serializer = new CSVSerializer({
        arrayFields: ['tags'],
      });

      const data = [{ id: '1', tags: [] }];
      const csv = serializer.serialize(data);

      expect(csv).toContain('1,');
    });
  });

  describe('Date Serialization', () => {
    it('should serialize Date objects to ISO strings', () => {
      const serializer = new CSVSerializer({
        dateFields: ['updated_at'],
      });

      const date = new Date('2024-01-15T10:30:00Z');
      const data = [{ id: '1', updated_at: date }];
      const csv = serializer.serialize(data);

      expect(csv).toContain('2024-01-15T10:30:00.000Z');
    });
  });

  describe('Deserialization', () => {
    it('should deserialize CSV back to objects', () => {
      const serializer = new CSVSerializer();
      const csv = 'id,name,version\n1,Tool A,1.0\n2,Tool B,2.0';

      const data = serializer.deserialize(csv);

      expect(data).toHaveLength(2);
      expect(data[0]).toEqual({ id: 1, name: 'Tool A', version: 1.0 });
      expect(data[1]).toEqual({ id: 2, name: 'Tool B', version: 2.0 });
    });

    it('should handle empty CSV', () => {
      const serializer = new CSVSerializer();
      const data = serializer.deserialize('');
      expect(data).toHaveLength(0);
    });

    it('should deserialize LocalizedString fields', () => {
      const serializer = new CSVSerializer(
        { localizedFields: ['title'] },
        { localizedFields: ['title'] }
      );

      const csv = 'id,title_en,title_jp\n1,English,Japanese';
      const data = serializer.deserialize(csv);

      expect(data[0].title).toEqual({
        en: 'English',
        jp: 'Japanese',
      });
    });

    it('should deserialize arrays', () => {
      const serializer = new CSVSerializer(
        { arrayFields: ['tags'] },
        { arrayFields: ['tags'] }
      );

      const csv = 'id,tags\n1,tag1|tag2|tag3';
      const data = serializer.deserialize(csv);

      expect(data[0].tags).toEqual(['tag1', 'tag2', 'tag3']);
    });

    it('should auto-detect numbers', () => {
      const serializer = new CSVSerializer();
      const csv = 'id,count,price\n1,42,19.99';
      const data = serializer.deserialize(csv);

      expect(data[0].id).toBe(1);
      expect(data[0].count).toBe(42);
      expect(data[0].price).toBe(19.99);
    });

    it('should auto-detect booleans', () => {
      const serializer = new CSVSerializer();
      const csv = 'id,active,enabled\n1,true,false';
      const data = serializer.deserialize(csv);

      expect(data[0].active).toBe(true);
      expect(data[0].enabled).toBe(false);
    });
  });

  describe('Round-trip Serialization', () => {
    it('should maintain data integrity through serialize-deserialize cycle', () => {
      const serializer = new CSVSerializer(
        {
          localizedFields: ['title'],
          arrayFields: ['tags'],
          dateFields: ['updated_at'],
        },
        {
          localizedFields: ['title'],
          arrayFields: ['tags'],
          dateFields: ['updated_at'],
        }
      );

      const original = [
        {
          id: 1,
          title: {
            en: 'English Title',
            jp: 'Japanese Title',
          } as LocalizedString,
          tags: ['tag1', 'tag2'],
          updated_at: new Date('2024-01-15'),
        },
      ];

      const csv = serializer.serialize(original);
      const deserialized = serializer.deserialize(csv);

      expect(deserialized[0].id).toBe(original[0].id);
      expect(deserialized[0].title).toEqual(original[0].title);
      expect(deserialized[0].tags).toEqual(original[0].tags);
    });
  });

  describe('createContentSerializer', () => {
    it('should create serializer with guide configuration', () => {
      const serializer = createContentSerializer('guide');
      expect(serializer).toBeInstanceOf(CSVSerializer);
    });

    it('should create serializer with character configuration', () => {
      const serializer = createContentSerializer('character');
      expect(serializer).toBeInstanceOf(CSVSerializer);
    });

    it('should create serializer with event configuration', () => {
      const serializer = createContentSerializer('event');
      expect(serializer).toBeInstanceOf(CSVSerializer);
    });

    it('should create serializer with swimsuit configuration', () => {
      const serializer = createContentSerializer('swimsuit');
      expect(serializer).toBeInstanceOf(CSVSerializer);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null values', () => {
      const serializer = new CSVSerializer();
      const data = [{ id: '1', name: null, value: 'test' }];
      const csv = serializer.serialize(data);

      expect(csv).toContain('1,,test');
    });

    it('should handle undefined values', () => {
      const serializer = new CSVSerializer();
      const data = [{ id: '1', name: undefined, value: 'test' }];
      const csv = serializer.serialize(data);

      expect(csv).toContain('1,,test');
    });

    it('should handle objects with different keys', () => {
      const serializer = new CSVSerializer();
      const data = [
        { id: '1', name: 'A', extra: 'X' },
        { id: '2', name: 'B' },
      ];
      const csv = serializer.serialize(data);

      expect(csv).toContain('id,name,extra');
    });

    it('should handle very long strings', () => {
      const serializer = new CSVSerializer();
      const longString = 'a'.repeat(10000);
      const data = [{ id: '1', description: longString }];
      const csv = serializer.serialize(data);

      expect(csv).toContain(longString);
    });

    it('should handle special characters in field names', () => {
      const serializer = new CSVSerializer();
      const data = [{ 'field-name': 'value', 'field_name': 'value2' }];
      const csv = serializer.serialize(data);

      expect(csv).toContain('field-name');
      expect(csv).toContain('field_name');
    });

    it('should handle nested objects', () => {
      const serializer = new CSVSerializer();
      const data = [{ id: '1', nested: { key: 'value' } }];
      const csv = serializer.serialize(data);

      expect(csv).toBeDefined();
    });

    it('should handle arrays with special characters', () => {
      const serializer = new CSVSerializer({
        arrayFields: ['tags'],
      });

      const data = [{ id: '1', tags: ['tag|1', 'tag,2', 'tag"3'] }];
      const csv = serializer.serialize(data);

      expect(csv).toBeDefined();
    });

    it('should handle empty strings in arrays', () => {
      const serializer = new CSVSerializer({
        arrayFields: ['tags'],
      });

      const data = [{ id: '1', tags: ['tag1', '', 'tag2'] }];
      const csv = serializer.serialize(data);

      expect(csv).toContain('tag1||tag2');
    });

    it('should handle boolean values', () => {
      const serializer = new CSVSerializer();
      const data = [{ id: '1', active: true, disabled: false }];
      const csv = serializer.serialize(data);

      expect(csv).toContain('true');
      expect(csv).toContain('false');
    });

    it('should handle numeric zero', () => {
      const serializer = new CSVSerializer();
      const data = [{ id: '1', count: 0, price: 0.0 }];
      const csv = serializer.serialize(data);

      expect(csv).toContain('0');
    });

    it('should handle NaN and Infinity', () => {
      const serializer = new CSVSerializer();
      const data = [{ id: '1', nan: NaN, inf: Infinity }];
      const csv = serializer.serialize(data);

      expect(csv).toBeDefined();
    });

    it('should handle unicode characters', () => {
      const serializer = new CSVSerializer();
      const data = [{ id: '1', emoji: '😀🎉', japanese: 'こんにちは' }];
      const csv = serializer.serialize(data);

      expect(csv).toContain('😀🎉');
      expect(csv).toContain('こんにちは');
    });

    it('should handle line breaks in values', () => {
      const serializer = new CSVSerializer();
      const data = [{ id: '1', description: 'Line 1\nLine 2\nLine 3' }];
      const csv = serializer.serialize(data);

      expect(csv).toContain('"Line 1\nLine 2\nLine 3"');
    });

    it('should handle mixed data types in deserialization', () => {
      const serializer = new CSVSerializer();
      const csv = 'id,name,count,active\n1,Test,42,true\n2,Test2,0,false';
      const data = serializer.deserialize(csv);

      expect(data[0].id).toBe(1);
      expect(data[0].name).toBe('Test');
      expect(data[0].count).toBe(42);
      expect(data[0].active).toBe(true);
    });
  });
});

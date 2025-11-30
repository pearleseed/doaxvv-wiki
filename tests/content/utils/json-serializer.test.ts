/**
 * Tests for JSON serializer
 */

import { describe, it, expect } from 'vitest';
import { serializeContent, deserializeContent } from '../../../src/content/utils/json-serializer';
import type { Character, Event, Gacha } from '../../../src/content/schemas/content.schema';

describe('JSON Serializer', () => {
  describe('serializeContent', () => {
    it('should serialize a character object to JSON string', () => {
      const character: Character = {
        id: 1,
        unique_key: 'char-1',
        title: 'Test Character',
        summary: 'A test character',
        category: 'Characters',
        tags: ['test', 'character'],
        updated_at: '2024-01-01',
        author: 'Test Author',
        status: 'published',
        type: 'SSR',
        image: '/images/test.jpg',
        stats: { POW: 100, TEC: 90, STM: 85 },
        name: { en: 'Test Character', jp: 'テストキャラクター' },
        birthday: { en: 'January 1', jp: '1月1日' },
        height: { en: '165cm', jp: '165cm' },
        hobby: { en: 'Reading', jp: '読書' },
      };

      const serialized = serializeContent(character);
      
      expect(typeof serialized).toBe('string');
      expect(serialized).toContain('char-1');
      expect(serialized).toContain('Test Character');
    });

    it('should serialize an event with Date objects', () => {
      const event: Event = {
        id: 1,
        unique_key: 'event-1',
        title: 'Test Event',
        summary: 'A test event',
        category: 'Events',
        tags: ['test', 'event'],
        updated_at: '2024-01-01',
        author: 'Test Author',
        status: 'published',
        type: 'Festival',
        event_status: 'Active',
        start_date: new Date('2024-01-01T00:00:00Z'),
        end_date: new Date('2024-01-31T23:59:59Z'),
        image: '/images/event.jpg',
        rewards: ['Reward 1', 'Reward 2'],
        how_to_participate: ['Step 1', 'Step 2'],
        tips: ['Tip 1', 'Tip 2'],
        name: { en: 'Test Event', jp: 'テストイベント' },
      };

      const serialized = serializeContent(event);
      
      expect(typeof serialized).toBe('string');
      expect(serialized).toContain('event-1');
    });

    it('should serialize an array of gachas', () => {
      const gachas: Gacha[] = [
        {
          id: 1,
          unique_key: 'gacha-1',
          image: '/images/gacha1.jpg',
          name: { en: 'Gacha 1', jp: 'ガチャ1' },
          start_date: new Date('2024-01-01T00:00:00Z'),
          end_date: new Date('2024-01-15T23:59:59Z'),
          gacha_status: 'Active',
          rates: { ssr: 3, sr: 17, r: 80 },
          pity_at: 100,
          step_up: true,
          featured_swimsuits: ['swimsuit-1', 'swimsuit-2'],
          featured_characters: ['char-1', 'char-2'],
        },
        {
          id: 2,
          unique_key: 'gacha-2',
          image: '/images/gacha2.jpg',
          name: { en: 'Gacha 2', jp: 'ガチャ2' },
          start_date: new Date('2024-02-01T00:00:00Z'),
          end_date: new Date('2024-02-15T23:59:59Z'),
          gacha_status: 'Coming Soon',
          rates: { ssr: 5, sr: 15, r: 80 },
          pity_at: 80,
          step_up: false,
          featured_swimsuits: ['swimsuit-3'],
          featured_characters: ['char-3'],
        },
      ];

      const serialized = serializeContent(gachas);
      
      expect(typeof serialized).toBe('string');
      expect(serialized).toContain('gacha-1');
      expect(serialized).toContain('gacha-2');
    });
  });

  describe('deserializeContent', () => {
    it('should deserialize a character JSON string back to object', () => {
      const character: Character = {
        id: 1,
        unique_key: 'char-1',
        title: 'Test Character',
        summary: 'A test character',
        category: 'Characters',
        tags: ['test', 'character'],
        updated_at: '2024-01-01',
        author: 'Test Author',
        status: 'published',
        type: 'SSR',
        image: '/images/test.jpg',
        stats: { POW: 100, TEC: 90, STM: 85 },
        name: { en: 'Test Character', jp: 'テストキャラクター' },
        birthday: { en: 'January 1', jp: '1月1日' },
        height: { en: '165cm', jp: '165cm' },
        hobby: { en: 'Reading', jp: '読書' },
      };

      const serialized = serializeContent(character);
      const deserialized = deserializeContent<Character>(serialized) as Character;

      expect(deserialized.id).toBe(character.id);
      expect(deserialized.name.en).toBe(character.name.en);
      expect(deserialized.name.jp).toBe(character.name.jp);
      expect(deserialized.stats).toEqual(character.stats);
    });

    it('should deserialize an event and restore Date objects', () => {
      const event: Event = {
        id: 1,
        unique_key: 'event-1',
        title: 'Test Event',
        summary: 'A test event',
        category: 'Events',
        tags: ['test', 'event'],
        updated_at: '2024-01-01',
        author: 'Test Author',
        status: 'published',
        type: 'Festival',
        event_status: 'Active',
        start_date: new Date('2024-01-01T00:00:00Z'),
        end_date: new Date('2024-01-31T23:59:59Z'),
        image: '/images/event.jpg',
        rewards: ['Reward 1', 'Reward 2'],
        how_to_participate: ['Step 1', 'Step 2'],
        tips: ['Tip 1', 'Tip 2'],
        name: { en: 'Test Event', jp: 'テストイベント' },
      };

      const serialized = serializeContent(event);
      const deserialized = deserializeContent<Event>(serialized) as Event;

      expect(deserialized.id).toBe(event.id);
      expect(deserialized.start_date).toBeInstanceOf(Date);
      expect(deserialized.end_date).toBeInstanceOf(Date);
      expect(deserialized.start_date.getTime()).toBe(event.start_date.getTime());
      expect(deserialized.end_date.getTime()).toBe(event.end_date.getTime());
    });

    it('should deserialize an array of gachas', () => {
      const gachas: Gacha[] = [
        {
          id: 1,
          unique_key: 'gacha-1',
          image: '/images/gacha1.jpg',
          name: { en: 'Gacha 1', jp: 'ガチャ1' },
          start_date: new Date('2024-01-01T00:00:00Z'),
          end_date: new Date('2024-01-15T23:59:59Z'),
          gacha_status: 'Active',
          rates: { ssr: 3, sr: 17, r: 80 },
          pity_at: 100,
          step_up: true,
          featured_swimsuits: ['swimsuit-1', 'swimsuit-2'],
          featured_characters: ['char-1', 'char-2'],
        },
        {
          id: 2,
          unique_key: 'gacha-2',
          image: '/images/gacha2.jpg',
          name: { en: 'Gacha 2', jp: 'ガチャ2' },
          start_date: new Date('2024-02-01T00:00:00Z'),
          end_date: new Date('2024-02-15T23:59:59Z'),
          gacha_status: 'Coming Soon',
          rates: { ssr: 5, sr: 15, r: 80 },
          pity_at: 80,
          step_up: false,
          featured_swimsuits: ['swimsuit-3'],
          featured_characters: ['char-3'],
        },
      ];

      const serialized = serializeContent(gachas as any);
      const deserialized = deserializeContent<Gacha>(serialized) as Gacha[];

      expect(deserialized.length).toBe(gachas.length);
      expect(deserialized[0].id).toBe(gachas[0].id);
      expect(deserialized[0].start_date).toBeInstanceOf(Date);
      expect(deserialized[1].step_up).toBe(gachas[1].step_up);
    });
  });

  describe('round-trip consistency', () => {
    it('should maintain data integrity through serialize/deserialize cycle', () => {
      const event: Event = {
        id: 1,
        unique_key: 'event-1',
        title: 'Test Event',
        summary: 'A test event',
        category: 'Events',
        tags: ['test', 'event'],
        updated_at: '2024-01-01',
        author: 'Test Author',
        status: 'published',
        type: 'Festival',
        event_status: 'Active',
        start_date: new Date('2024-01-01T00:00:00Z'),
        end_date: new Date('2024-01-31T23:59:59Z'),
        image: '/images/event.jpg',
        rewards: ['Reward 1', 'Reward 2'],
        how_to_participate: ['Step 1', 'Step 2'],
        tips: ['Tip 1', 'Tip 2'],
        name: { en: 'Test Event', jp: 'テストイベント' },
      };

      const roundTrip = deserializeContent<Event>(serializeContent(event)) as Event;

      expect(roundTrip.id).toBe(event.id);
      expect(roundTrip.title).toBe(event.title);
      expect(roundTrip.type).toBe(event.type);
      expect(roundTrip.start_date.getTime()).toBe(event.start_date.getTime());
      expect(roundTrip.end_date.getTime()).toBe(event.end_date.getTime());
      expect(roundTrip.rewards).toEqual(event.rewards);
      expect(roundTrip.name).toEqual(event.name);
    });
  });

  describe('Edge Cases', () => {
    it('should handle character with special characters in name', () => {
      const character: Character = {
        id: 1,
        unique_key: 'test-character',
        title: 'Test Character',
        summary: 'A test character with special chars: !@#$%^&*()',
        category: 'Characters',
        tags: ['test', 'special-chars'],
        updated_at: '2024-01-01',
        author: 'Test Author',
        status: 'published',
        type: 'SSR',
        image: '/images/test.jpg',
        stats: { POW: 100, TEC: 90, STM: 85 },
        name: { en: 'Test "Character"', jp: 'テスト・キャラクター' },
        birthday: { en: 'January 1', jp: '1月1日' },
        height: { en: '165cm', jp: '165cm' },
        hobby: { en: 'Reading & Writing', jp: '読書' },
      };

      const serialized = serializeContent(character);
      const deserialized = deserializeContent<Character>(serialized) as Character;

      expect(deserialized.summary).toContain('!@#$%^&*()');
      expect(deserialized.name.en).toBe('Test "Character"');
    });

    it('should handle character with unicode and emoji', () => {
      const character: Character = {
        id: 2,
        unique_key: 'unicode-character',
        title: 'Unicode Character',
        summary: 'Character with emoji 😀🎉🌟',
        category: 'Characters',
        tags: ['unicode', 'emoji'],
        updated_at: '2024-01-01',
        author: 'Test Author',
        status: 'published',
        type: 'SR',
        image: '/images/unicode.jpg',
        stats: { POW: 80, TEC: 70, STM: 75 },
        name: { en: 'Unicode 😀', jp: 'ユニコード', cn: '你好' },
        birthday: { en: 'February 2', jp: '2月2日' },
        height: { en: '160cm', jp: '160cm' },
        hobby: { en: 'Gaming', jp: 'ゲーム' },
      };

      const serialized = serializeContent(character);
      const deserialized = deserializeContent<Character>(serialized) as Character;

      expect(deserialized.summary).toContain('😀🎉🌟');
      expect(deserialized.name.cn).toBe('你好');
    });

    it('should handle event with empty arrays', () => {
      const event: Event = {
        id: 3,
        unique_key: 'empty-arrays-event',
        title: 'Empty Arrays Event',
        summary: 'Event with empty arrays',
        category: 'Events',
        tags: [],
        updated_at: '2024-01-01',
        author: 'Test Author',
        status: 'published',
        type: 'Festival',
        event_status: 'Active',
        start_date: new Date('2024-01-01T00:00:00Z'),
        end_date: new Date('2024-01-31T23:59:59Z'),
        image: '/images/event.jpg',
        rewards: [],
        how_to_participate: [],
        tips: [],
        name: { en: 'Empty Event', jp: '空のイベント' },
      };

      const serialized = serializeContent(event);
      const deserialized = deserializeContent<Event>(serialized) as Event;

      expect(deserialized.rewards).toEqual([]);
      expect(deserialized.tags).toEqual([]);
    });

    it('should handle gacha with numeric precision', () => {
      const gacha: Gacha = {
        id: 4,
        unique_key: 'precision-gacha',
        image: '/images/gacha.jpg',
        name: { en: 'Precision Gacha', jp: 'プレシジョンガチャ' },
        start_date: new Date('2024-01-01T00:00:00Z'),
        end_date: new Date('2024-01-15T23:59:59Z'),
        gacha_status: 'Active',
        rates: { ssr: 3.14159, sr: 17.5, r: 79.35841 },
        pity_at: 100,
        step_up: true,
        featured_swimsuits: [],
        featured_characters: [],
      };

      const serialized = serializeContent(gacha);
      const deserialized = deserializeContent<Gacha>(serialized) as Gacha;

      expect(deserialized.rates.ssr).toBe(3.14159);
      expect(deserialized.rates.r).toBe(79.35841);
    });

    it('should handle multiple events in array', () => {
      const events: Event[] = [
        {
          id: 5,
          unique_key: 'event-1',
          title: 'Event 1',
          summary: 'First event',
          category: 'Events',
          tags: ['tag1'],
          updated_at: '2024-01-01',
          author: 'Author 1',
          status: 'published',
          type: 'Festival',
          event_status: 'Active',
          start_date: new Date('2024-01-01T00:00:00Z'),
          end_date: new Date('2024-01-15T23:59:59Z'),
          image: '/images/event1.jpg',
          rewards: ['Reward 1'],
          how_to_participate: ['Step 1'],
          tips: ['Tip 1'],
          name: { en: 'Event 1', jp: 'イベント1' },
        },
        {
          id: 6,
          unique_key: 'event-2',
          title: 'Event 2',
          summary: 'Second event',
          category: 'Events',
          tags: ['tag2'],
          updated_at: '2024-02-01',
          author: 'Author 2',
          status: 'draft',
          type: 'Tournament',
          event_status: 'Upcoming',
          start_date: new Date('2024-02-01T00:00:00Z'),
          end_date: new Date('2024-02-15T23:59:59Z'),
          image: '/images/event2.jpg',
          rewards: ['Reward 2'],
          how_to_participate: ['Step 2'],
          tips: ['Tip 2'],
          name: { en: 'Event 2', jp: 'イベント2' },
        },
      ];

      const serialized = serializeContent(events);
      const deserialized = deserializeContent<Event>(serialized) as Event[];

      expect(deserialized).toHaveLength(2);
      expect(deserialized[0].id).toBe(5);
      expect(deserialized[1].id).toBe(6);
      expect(deserialized[0].start_date).toBeInstanceOf(Date);
      expect(deserialized[1].start_date).toBeInstanceOf(Date);
    });
  });
});

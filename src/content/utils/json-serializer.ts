/**
 * JSON Serializer Utility
 * Handles serialization and deserialization of content objects to/from JSON format
 * Supports round-trip conversion for Date objects and special types
 * Requirements: 5.3, 5.4
 */

import type {
  Guide,
  Character,
  Event,
  Swimsuit,
  Item,
  Gacha,
  Episode,
  Category,
  Tag,
} from '../schemas/content.schema';

/**
 * Content types that can be serialized
 */
export type SerializableContent =
  | Guide
  | Character
  | Event
  | Swimsuit
  | Item
  | Gacha
  | Episode
  | Category
  | Tag;

/**
 * Serialize content to JSON string
 * Handles Date objects by converting them to ISO strings
 * 
 * @param content - Content object or array to serialize
 * @returns JSON string representation
 */
export function serializeContent<T extends SerializableContent>(
  content: T | T[]
): string {
  return JSON.stringify(content, dateReplacer);
}

/**
 * Deserialize JSON string back to typed content objects
 * Handles Date objects by converting ISO strings back to Date instances
 * 
 * @param json - JSON string to deserialize
 * @returns Typed content object or array
 */
export function deserializeContent<T extends SerializableContent>(
  json: string
): T | T[] {
  return JSON.parse(json, dateReviver);
}

/**
 * JSON replacer function that converts Date objects to ISO strings
 * Used during serialization
 */
function dateReplacer(_key: string, value: any): any {
  if (value instanceof Date) {
    return value.toISOString();
  }
  return value;
}

/**
 * JSON reviver function that converts ISO date strings back to Date objects
 * Used during deserialization
 */
function dateReviver(_key: string, value: any): any {
  // Check if the value is a string that looks like an ISO date
  if (typeof value === 'string' && isISODateString(value)) {
    const date = new Date(value);
    // Only return Date if it's valid
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  return value;
}

/**
 * Check if a string looks like an ISO 8601 date
 */
function isISODateString(value: string): boolean {
  // Match ISO 8601 date formats (YYYY-MM-DD or full ISO with time)
  return /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/.test(value);
}

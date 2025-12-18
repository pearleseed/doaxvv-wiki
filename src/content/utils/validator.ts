/**
 * Content Validator
 * Validates content against schema definitions and business rules
 */

import {
  REQUIRED_FIELDS,
  VALID_STATUSES,
  VALID_RARITIES,
  VALID_EVENT_TYPES,
  VALID_EVENT_STATUSES,
  VALID_GACHA_STATUSES,
  VALID_QUIZ_DIFFICULTIES,
  VALID_ITEM_TYPES,
  VALID_EPISODE_TYPES,
  VALID_EPISODE_STATUSES,
  VALID_OBTAIN_METHODS,
  VALID_MISSION_TYPES,
} from '../schemas/content.schema';

/**
 * Validation error with field-level details
 */
export interface ValidationError {
  row: number;
  field: string;
  message: string;
  value?: unknown;
  expected?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: string[];
}

// ISO 8601 date format regex
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})?)?$/;
// Simple date format YYYY-MM-DD
const SIMPLE_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
// URL regex
const URL_REGEX = /^(https?:\/\/|data:|file:\/\/|[A-Za-z]:\\|\\\\|\/)/;
// unique_key format: lowercase, numbers, hyphens
const UNIQUE_KEY_REGEX = /^[a-z0-9-]+$/;

export class ContentValidator {
  /**
   * Main validation method for content data
   */
  validateContent(
    data: Record<string, any>[],
    contentType: keyof typeof REQUIRED_FIELDS,
    rowOffset: number = 2
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    // Get required fields based on content type
    const requiredFields = this.getRequiredFields(contentType);

    data.forEach((row, index) => {
      const rowNum = index + rowOffset;

      // Check required fields
      requiredFields.forEach((field) => {
        if (!this.hasValue(row[field])) {
          errors.push({
            row: rowNum,
            field,
            message: `Trường bắt buộc '${field}' bị thiếu hoặc rỗng`,
            value: row[field],
            expected: 'Giá trị không rỗng',
          });
        }
      });

      // Validate specific field types based on content type
      this.validateFieldTypes(row, contentType, rowNum, errors, warnings);
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Get required fields for a content type
   */
  private getRequiredFields(contentType: string): string[] {
    const baseFields =
      contentType !== 'category' &&
      contentType !== 'tag' &&
      contentType !== 'gacha'
        ? REQUIRED_FIELDS.base || []
        : [];
    return [...baseFields, ...(REQUIRED_FIELDS[contentType] || [])];
  }

  /**
   * Check if a value is present and not empty
   */
  private hasValue(value: any): boolean {
    if (value === undefined || value === null) return false;
    if (typeof value === 'string' && value.trim() === '') return false;
    return true;
  }

  /**
   * Validate field types based on content type
   */
  private validateFieldTypes(
    row: Record<string, any>,
    contentType: string,
    rowNum: number,
    errors: ValidationError[],
    warnings: string[]
  ): void {
    // Common validations
    this.validateCommonFields(row, rowNum, errors, warnings);

    // Content-type specific validations
    switch (contentType) {
      case 'character':
        this.validateCharacter(row, rowNum, errors, warnings);
        break;
      case 'swimsuit':
        this.validateSwimsuit(row, rowNum, errors, warnings);
        break;
      case 'event':
        this.validateEvent(row, rowNum, errors, warnings);
        break;
      case 'gacha':
        this.validateGacha(row, rowNum, errors, warnings);
        break;
      case 'episode':
        this.validateEpisode(row, rowNum, errors, warnings);
        break;
      case 'item':
        this.validateItem(row, rowNum, errors, warnings);
        break;
      case 'guide':
        this.validateGuide(row, rowNum, errors, warnings);
        break;
      case 'tool':
        this.validateTool(row, rowNum, errors, warnings);
        break;
      case 'accessory':
        this.validateAccessory(row, rowNum, errors, warnings);
        break;
      case 'mission':
        this.validateMission(row, rowNum, errors, warnings);
        break;
      case 'quiz':
        this.validateQuiz(row, rowNum, errors, warnings);
        break;
      case 'category':
        this.validateCategory(row, rowNum, errors, warnings);
        break;
      case 'tag':
        this.validateTag(row, rowNum, errors, warnings);
        break;
    }
  }

  /**
   * Validate common fields across all content types
   */
  private validateCommonFields(
    row: Record<string, any>,
    rowNum: number,
    errors: ValidationError[],
    warnings: string[]
  ): void {
    // Validate id (must be positive integer)
    if (row.id !== undefined) {
      const id = Number(row.id);
      if (!Number.isInteger(id) || id <= 0) {
        errors.push({
          row: rowNum,
          field: 'id',
          message: `ID phải là số nguyên dương, nhận được: '${row.id}'`,
          value: row.id,
          expected: 'Số nguyên dương (1, 2, 3, ...)',
        });
      }
    }

    // Validate unique_key format
    if (row.unique_key && !UNIQUE_KEY_REGEX.test(row.unique_key)) {
      errors.push({
        row: rowNum,
        field: 'unique_key',
        message: `unique_key '${row.unique_key}' không đúng format`,
        value: row.unique_key,
        expected: 'Chữ thường, số và dấu gạch ngang (vd: my-unique-key)',
      });
    }

    // Validate status
    if (row.status && !VALID_STATUSES.includes(row.status)) {
      errors.push({
        row: rowNum,
        field: 'status',
        message: `Status '${row.status}' không hợp lệ`,
        value: row.status,
        expected: VALID_STATUSES.join(', '),
      });
    }

    // Validate updated_at date format
    if (row.updated_at) {
      if (!SIMPLE_DATE_REGEX.test(row.updated_at) && !ISO_DATE_REGEX.test(row.updated_at)) {
        errors.push({
          row: rowNum,
          field: 'updated_at',
          message: `Ngày '${row.updated_at}' không đúng format`,
          value: row.updated_at,
          expected: 'YYYY-MM-DD hoặc YYYY-MM-DDTHH:mm:ssZ',
        });
      }
    }

    // Validate image URL format
    if (row.image && !URL_REGEX.test(row.image)) {
      warnings.push(
        `Row ${rowNum}: Trường 'image' có thể không phải URL hợp lệ: '${row.image}'`
      );
    }
  }

  /** Validate localized name fields exist */
  private validateLocalizedName(row: Record<string, any>, rowNum: number, errors: ValidationError[], label: string): void {
    if (!row.name_en && !row.name_jp) {
      errors.push({ row: rowNum, field: 'name_en/name_jp', message: 'Phải có ít nhất name_en hoặc name_jp', expected: label });
    }
  }

  /** Validate Character fields */
  private validateCharacter(row: Record<string, any>, rowNum: number, errors: ValidationError[], warnings: string[]): void {
    this.validateStatsJSON(row, rowNum, errors);
    this.validateLocalizedName(row, rowNum, errors, 'Tên nhân vật bằng tiếng Anh hoặc tiếng Nhật');
    if (row.birthday_en && !this.isValidBirthdayFormat(row.birthday_en)) {
      warnings.push(`Row ${rowNum}: birthday_en '${row.birthday_en}' nên theo format 'Month Day' (vd: July 7)`);
    }
    if (row.height_en && !/^\d+cm$/i.test(row.height_en)) {
      warnings.push(`Row ${rowNum}: height_en '${row.height_en}' nên theo format '###cm' (vd: 158cm)`);
    }
  }

  /** Validate enum field against valid values */
  private validateEnum(row: Record<string, any>, field: string, validValues: readonly string[], rowNum: number, errors: ValidationError[]): void {
    if (row[field] && !validValues.includes(row[field])) {
      errors.push({ row: rowNum, field, message: `${field} '${row[field]}' không hợp lệ`, value: row[field], expected: validValues.join(', ') });
    }
  }

  /** Validate numeric fields (non-negative integers) */
  private validateNumericFields(row: Record<string, any>, fields: string[], rowNum: number, errors: ValidationError[], allowDecimal = false): void {
    for (const field of fields) {
      if (row[field] !== undefined && row[field] !== '') {
        const num = Number(row[field]);
        if (isNaN(num) || (!allowDecimal && num < 0)) {
          errors.push({
            row: rowNum, field,
            message: `${field} phải là số ${allowDecimal ? 'thập phân' : 'không âm'}, nhận được: '${row[field]}'`,
            value: row[field],
            expected: allowDecimal ? 'Số thập phân (vd: 3.3, 2.8)' : 'Số không âm (0, 1, 2, ...)',
          });
        }
      }
    }
  }

  /** Validate Swimsuit fields */
  private validateSwimsuit(row: Record<string, any>, rowNum: number, errors: ValidationError[], warnings: string[]): void {
    this.validateEnum(row, 'rarity', VALID_RARITIES, rowNum, errors);
    if (!row.character_id) {
      errors.push({ row: rowNum, field: 'character_id', message: 'character_id là bắt buộc cho swimsuit', expected: 'unique_key của character (vd: misaki)' });
    }
    this.validateStatsJSON(row, rowNum, errors);
    this.validateNumericFields(row, ['max_level', 'base_pow', 'max_pow', 'base_tec', 'max_tec', 'base_stm', 'max_stm', 'base_apl', 'max_apl'], rowNum, errors);
    this.validateNumericFields(row, ['pow_growth', 'tec_growth', 'stm_growth', 'apl_growth'], rowNum, errors, true);
  }

  /** Validate date range (end > start) */
  private validateDateRange(row: Record<string, any>, rowNum: number, errors: ValidationError[]): void {
    this.validateDateTimeField(row, 'start_date', rowNum, errors);
    this.validateDateTimeField(row, 'end_date', rowNum, errors);
    if (row.start_date && row.end_date) {
      const start = new Date(row.start_date), end = new Date(row.end_date);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end <= start) {
        errors.push({ row: rowNum, field: 'end_date', message: 'end_date phải sau start_date', value: row.end_date, expected: `Ngày sau ${row.start_date}` });
      }
    }
  }

  /** Validate Event fields */
  private validateEvent(row: Record<string, any>, rowNum: number, errors: ValidationError[], warnings: string[]): void {
    this.validateEnum(row, 'type', VALID_EVENT_TYPES, rowNum, errors);
    this.validateEnum(row, 'event_status', VALID_EVENT_STATUSES, rowNum, errors);
    this.validateDateRange(row, rowNum, errors);
    this.validateArrayField(row, 'rewards_en', rowNum, warnings);
    this.validateArrayField(row, 'rewards_jp', rowNum, warnings);
  }

  /** Validate rate fields (0-100) */
  private validateRates(row: Record<string, any>, fields: string[], rowNum: number, errors: ValidationError[], warnings: string[]): void {
    let sum = 0, hasAll = true;
    for (const field of fields) {
      if (row[field] !== undefined && row[field] !== '') {
        const rate = Number(row[field]);
        if (isNaN(rate) || rate < 0 || rate > 100) {
          errors.push({ row: rowNum, field, message: `${field} phải là số từ 0-100, nhận được: '${row[field]}'`, value: row[field], expected: 'Số từ 0 đến 100 (vd: 3.3, 15.0)' });
        } else { sum += rate; }
      } else { hasAll = false; }
    }
    if (hasAll && Math.abs(sum - 100) > 0.5) {
      warnings.push(`Row ${rowNum}: Tổng rates (${sum.toFixed(1)}%) không bằng 100%`);
    }
  }

  /** Validate positive integer field */
  private validatePositiveInt(row: Record<string, any>, field: string, rowNum: number, errors: ValidationError[]): void {
    if (row[field] !== undefined && row[field] !== '') {
      const num = Number(row[field]);
      if (!Number.isInteger(num) || num <= 0) {
        errors.push({ row: rowNum, field, message: `${field} phải là số nguyên dương, nhận được: '${row[field]}'`, value: row[field], expected: 'Số nguyên dương (vd: 100, 200)' });
      }
    }
  }

  /** Validate boolean field */
  private validateBoolean(row: Record<string, any>, field: string, rowNum: number, errors: ValidationError[]): void {
    if (row[field] !== undefined && row[field] !== '' && !['true', 'false', true, false].includes(row[field])) {
      errors.push({ row: rowNum, field, message: `${field} phải là boolean, nhận được: '${row[field]}'`, value: row[field], expected: 'true hoặc false' });
    }
  }

  /** Validate Gacha fields */
  private validateGacha(row: Record<string, any>, rowNum: number, errors: ValidationError[], warnings: string[]): void {
    this.validateEnum(row, 'gacha_status', VALID_GACHA_STATUSES, rowNum, errors);
    this.validateDateTimeField(row, 'start_date', rowNum, errors);
    this.validateDateTimeField(row, 'end_date', rowNum, errors);
    this.validateRates(row, ['rates_ssr', 'rates_sr', 'rates_r'], rowNum, errors, warnings);
    this.validatePositiveInt(row, 'pity_at', rowNum, errors);
    this.validateBoolean(row, 'step_up', rowNum, errors);
  }

  /** Validate non-negative integer field */
  private validateNonNegativeInt(row: Record<string, any>, field: string, rowNum: number, errors: ValidationError[]): void {
    if (row[field] !== undefined && row[field] !== '') {
      const num = Number(row[field]);
      if (!Number.isInteger(num) || num < 0) {
        errors.push({ row: rowNum, field, message: `${field} phải là số nguyên không âm, nhận được: '${row[field]}'`, value: row[field], expected: 'Số nguyên không âm (vd: 0, 1, 2)' });
      }
    }
  }

  /** Validate content_ref is .md file */
  private validateContentRef(row: Record<string, any>, field: string, rowNum: number, warnings: string[]): void {
    if (row[field] && !row[field].endsWith('.md')) {
      warnings.push(`Row ${rowNum}: ${field} '${row[field]}' nên là file .md`);
    }
  }

  /** Validate required array field */
  private validateRequiredArray(row: Record<string, any>, field: string, rowNum: number, errors: ValidationError[], desc: string): void {
    if (!row[field] || row[field].trim() === '') {
      errors.push({ row: rowNum, field, message: `${field} là bắt buộc`, expected: desc });
    }
  }

  /** Validate Episode fields */
  private validateEpisode(row: Record<string, any>, rowNum: number, errors: ValidationError[], warnings: string[]): void {
    this.validateEnum(row, 'type', VALID_EPISODE_TYPES, rowNum, errors);
    this.validateEnum(row, 'episode_status', VALID_EPISODE_STATUSES, rowNum, errors);
    if (row.release_date) this.validateDateTimeField(row, 'release_date', rowNum, errors);
    this.validateArrayField(row, 'character_ids', rowNum, warnings);
  }

  /** Validate Item fields */
  private validateItem(row: Record<string, any>, rowNum: number, errors: ValidationError[], _warnings: string[]): void {
    this.validateEnum(row, 'type', VALID_ITEM_TYPES, rowNum, errors);
  }

  /** Validate Guide fields */
  private validateGuide(row: Record<string, any>, rowNum: number, _errors: ValidationError[], warnings: string[]): void {
    this.validateContentRef(row, 'content_ref', rowNum, warnings);
    if (row.read_time && !/^\d+\s*(min|minutes?|phút)$/i.test(row.read_time)) {
      warnings.push(`Row ${rowNum}: read_time '${row.read_time}' nên theo format '## min' (vd: 10 min)`);
    }
    this.validateArrayField(row, 'topics', rowNum, warnings);
  }

  /** Validate Tool fields */
  private validateTool(row: Record<string, any>, rowNum: number, _errors: ValidationError[], warnings: string[]): void {
    this.validateContentRef(row, 'content_ref', rowNum, warnings);
    if (row.version && !/^\d+(\.\d+)*$/.test(row.version)) {
      warnings.push(`Row ${rowNum}: version '${row.version}' nên theo format semver (vd: 1.0.0)`);
    }
  }

  /** Validate Accessory fields */
  private validateAccessory(row: Record<string, any>, rowNum: number, errors: ValidationError[], warnings: string[]): void {
    this.validateEnum(row, 'rarity', VALID_RARITIES, rowNum, errors);
    this.validateEnum(row, 'obtain_method', VALID_OBTAIN_METHODS, rowNum, errors);
    if (row.stats) this.validateStatsJSON(row, rowNum, errors, false);
    this.validateArrayField(row, 'character_ids', rowNum, warnings);
  }

  /** Validate Mission fields */
  private validateMission(row: Record<string, any>, rowNum: number, errors: ValidationError[], _warnings: string[]): void {
    this.validateEnum(row, 'type', VALID_MISSION_TYPES, rowNum, errors);
    this.validateRequiredArray(row, 'objectives', rowNum, errors, 'Danh sách mục tiêu phân cách bằng | (vd: Win 5 matches|Collect 100 tokens)');
    this.validateRequiredArray(row, 'rewards', rowNum, errors, 'Danh sách phần thưởng phân cách bằng | (vd: 1000 V-Stones|SSR Ticket)');
  }

  /** Validate Quiz fields */
  private validateQuiz(row: Record<string, any>, rowNum: number, errors: ValidationError[], warnings: string[]): void {
    this.validateEnum(row, 'difficulty', VALID_QUIZ_DIFFICULTIES, rowNum, errors);
    this.validateNonNegativeInt(row, 'time_limit', rowNum, errors);
    this.validatePositiveInt(row, 'question_count', rowNum, errors);
    this.validateContentRef(row, 'questions_ref', rowNum, warnings);
  }

  /** Validate Category fields */
  private validateCategory(row: Record<string, any>, rowNum: number, errors: ValidationError[], _warnings: string[]): void {
    this.validateNonNegativeInt(row, 'order', rowNum, errors);
    this.validateLocalizedName(row, rowNum, errors, 'Tên danh mục');
  }

  /** Validate Tag fields */
  private validateTag(row: Record<string, any>, rowNum: number, errors: ValidationError[], _warnings: string[]): void {
    this.validateNonNegativeInt(row, 'usage_count', rowNum, errors);
    this.validateLocalizedName(row, rowNum, errors, 'Tên tag');
  }

  // ============ Helper Methods ============

  /**
   * Validate stats JSON field
   */
  private validateStatsJSON(
    row: Record<string, any>,
    rowNum: number,
    errors: ValidationError[],
    requireAPL: boolean = false
  ): void {
    if (!row.stats) return;

    try {
      const stats = typeof row.stats === 'string' ? JSON.parse(row.stats) : row.stats;

      // Check required stat fields
      const requiredStats = ['POW', 'TEC', 'STM'];
      if (requireAPL) requiredStats.push('APL');

      requiredStats.forEach((stat) => {
        if (stats[stat] === undefined) {
          errors.push({
            row: rowNum,
            field: 'stats',
            message: `stats thiếu trường '${stat}'`,
            value: row.stats,
            expected: `JSON object với ${requiredStats.join(', ')} (vd: {"POW":450,"TEC":380,"STM":420})`,
          });
        } else if (typeof stats[stat] !== 'number' || stats[stat] < 0) {
          errors.push({
            row: rowNum,
            field: 'stats',
            message: `stats.${stat} phải là số không âm, nhận được: '${stats[stat]}'`,
            value: stats[stat],
            expected: 'Số không âm',
          });
        }
      });
    } catch {
      errors.push({
        row: rowNum,
        field: 'stats',
        message: `stats không phải JSON hợp lệ: '${row.stats}'`,
        value: row.stats,
        expected: 'JSON object (vd: {"POW":450,"TEC":380,"STM":420,"APL":48})',
      });
    }
  }

  /**
   * Validate datetime field (ISO 8601 format)
   */
  private validateDateTimeField(
    row: Record<string, any>,
    field: string,
    rowNum: number,
    errors: ValidationError[]
  ): void {
    if (!row[field]) return;

    if (!ISO_DATE_REGEX.test(row[field])) {
      errors.push({
        row: rowNum,
        field,
        message: `${field} '${row[field]}' không đúng format ISO 8601`,
        value: row[field],
        expected: 'YYYY-MM-DDTHH:mm:ssZ (vd: 2024-01-20T00:00:00Z)',
      });
    } else {
      const date = new Date(row[field]);
      if (isNaN(date.getTime())) {
        errors.push({
          row: rowNum,
          field,
          message: `${field} '${row[field]}' không phải ngày hợp lệ`,
          value: row[field],
          expected: 'Ngày hợp lệ theo format ISO 8601',
        });
      }
    }
  }

  /**
   * Validate array field (pipe-separated)
   */
  private validateArrayField(
    row: Record<string, any>,
    field: string,
    rowNum: number,
    warnings: string[]
  ): void {
    if (!row[field]) return;

    const value = String(row[field]);
    // Check for common mistakes
    if (value.includes(',') && !value.includes('|')) {
      warnings.push(
        `Row ${rowNum}: ${field} có thể dùng sai dấu phân cách. Dùng '|' thay vì ','`
      );
    }
  }

  /**
   * Check if birthday format is valid
   */
  private isValidBirthdayFormat(birthday: string): boolean {
    // Accept formats like "July 7", "7月7日", etc.
    const enFormat = /^[A-Z][a-z]+ \d{1,2}$/;
    const jpFormat = /^\d{1,2}月\d{1,2}日$/;
    return enFormat.test(birthday) || jpFormat.test(birthday);
  }

  // ============ Existing Methods ============

  /**
   * Validate related IDs exist in the dataset
   */
  validateRelatedIds(
    data: Record<string, any>[],
    allIds: Set<string>,
    rowOffset: number = 2
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    data.forEach((row, index) => {
      const rowNum = index + rowOffset;

      if (row.related_ids) {
        const relatedIds =
          typeof row.related_ids === 'string'
            ? row.related_ids.split('|').map((id: string) => id.trim())
            : row.related_ids;

        relatedIds.forEach((relatedId: string) => {
          if (relatedId && !allIds.has(relatedId)) {
            warnings.push(
              `Row ${rowNum}: Related ID '${relatedId}' không tìm thấy trong dataset`
            );
          }
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate unique IDs (no duplicates)
   */
  validateUniqueIds(
    data: Record<string, any>[],
    rowOffset: number = 2
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];
    const seenIds = new Map<string, number>();
    const seenUniqueKeys = new Map<string, number>();

    data.forEach((row, index) => {
      const rowNum = index + rowOffset;

      // Check duplicate id
      const id = String(row.id);
      if (seenIds.has(id)) {
        errors.push({
          row: rowNum,
          field: 'id',
          message: `ID '${id}' bị trùng lặp (đã xuất hiện ở row ${seenIds.get(id)})`,
          value: id,
          expected: 'ID duy nhất',
        });
      } else {
        seenIds.set(id, rowNum);
      }

      // Check duplicate unique_key
      if (row.unique_key) {
        const uniqueKey = String(row.unique_key);
        if (seenUniqueKeys.has(uniqueKey)) {
          errors.push({
            row: rowNum,
            field: 'unique_key',
            message: `unique_key '${uniqueKey}' bị trùng lặp (đã xuất hiện ở row ${seenUniqueKeys.get(uniqueKey)})`,
            value: uniqueKey,
            expected: 'unique_key duy nhất',
          });
        } else {
          seenUniqueKeys.set(uniqueKey, rowNum);
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

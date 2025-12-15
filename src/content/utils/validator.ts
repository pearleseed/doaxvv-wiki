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

  /**
   * Validate Character fields
   */
  private validateCharacter(
    row: Record<string, any>,
    rowNum: number,
    errors: ValidationError[],
    warnings: string[]
  ): void {
    // Validate stats JSON
    this.validateStatsJSON(row, rowNum, errors);

    // Validate localized name fields
    if (!row.name_en && !row.name_jp) {
      errors.push({
        row: rowNum,
        field: 'name_en/name_jp',
        message: 'Phải có ít nhất name_en hoặc name_jp',
        expected: 'Tên nhân vật bằng tiếng Anh hoặc tiếng Nhật',
      });
    }

    // Validate birthday format
    if (row.birthday_en && !this.isValidBirthdayFormat(row.birthday_en)) {
      warnings.push(
        `Row ${rowNum}: birthday_en '${row.birthday_en}' nên theo format 'Month Day' (vd: July 7)`
      );
    }

    // Validate height format
    if (row.height_en && !/^\d+cm$/i.test(row.height_en)) {
      warnings.push(
        `Row ${rowNum}: height_en '${row.height_en}' nên theo format '###cm' (vd: 158cm)`
      );
    }
  }

  /**
   * Validate Swimsuit fields
   */
  private validateSwimsuit(
    row: Record<string, any>,
    rowNum: number,
    errors: ValidationError[],
    warnings: string[]
  ): void {
    // Validate rarity
    if (row.rarity && !VALID_RARITIES.includes(row.rarity)) {
      errors.push({
        row: rowNum,
        field: 'rarity',
        message: `Rarity '${row.rarity}' không hợp lệ`,
        value: row.rarity,
        expected: VALID_RARITIES.join(', '),
      });
    }

    // Validate character_id
    if (!row.character_id) {
      errors.push({
        row: rowNum,
        field: 'character_id',
        message: 'character_id là bắt buộc cho swimsuit',
        expected: 'unique_key của character (vd: misaki)',
      });
    }

    // Validate stats JSON
    this.validateStatsJSON(row, rowNum, errors);

    // Validate numeric stat fields
    const numericFields = [
      'max_level', 'base_pow', 'max_pow', 'base_tec', 'max_tec',
      'base_stm', 'max_stm', 'base_apl', 'max_apl',
    ];
    numericFields.forEach((field) => {
      if (row[field] !== undefined && row[field] !== '') {
        const num = Number(row[field]);
        if (isNaN(num) || num < 0) {
          errors.push({
            row: rowNum,
            field,
            message: `${field} phải là số không âm, nhận được: '${row[field]}'`,
            value: row[field],
            expected: 'Số không âm (0, 1, 2, ...)',
          });
        }
      }
    });

    // Validate growth fields (decimal)
    const growthFields = ['pow_growth', 'tec_growth', 'stm_growth', 'apl_growth'];
    growthFields.forEach((field) => {
      if (row[field] !== undefined && row[field] !== '') {
        const num = Number(row[field]);
        if (isNaN(num)) {
          errors.push({
            row: rowNum,
            field,
            message: `${field} phải là số thập phân, nhận được: '${row[field]}'`,
            value: row[field],
            expected: 'Số thập phân (vd: 3.3, 2.8)',
          });
        }
      }
    });
  }

  /**
   * Validate Event fields
   */
  private validateEvent(
    row: Record<string, any>,
    rowNum: number,
    errors: ValidationError[],
    warnings: string[]
  ): void {
    // Validate event type
    if (row.type && !VALID_EVENT_TYPES.includes(row.type)) {
      errors.push({
        row: rowNum,
        field: 'type',
        message: `Event type '${row.type}' không hợp lệ`,
        value: row.type,
        expected: VALID_EVENT_TYPES.join(', '),
      });
    }

    // Validate event status
    if (row.event_status && !VALID_EVENT_STATUSES.includes(row.event_status)) {
      errors.push({
        row: rowNum,
        field: 'event_status',
        message: `Event status '${row.event_status}' không hợp lệ`,
        value: row.event_status,
        expected: VALID_EVENT_STATUSES.join(', '),
      });
    }

    // Validate date fields
    this.validateDateTimeField(row, 'start_date', rowNum, errors);
    this.validateDateTimeField(row, 'end_date', rowNum, errors);

    // Validate end_date > start_date
    if (row.start_date && row.end_date) {
      const start = new Date(row.start_date);
      const end = new Date(row.end_date);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end <= start) {
        errors.push({
          row: rowNum,
          field: 'end_date',
          message: 'end_date phải sau start_date',
          value: row.end_date,
          expected: `Ngày sau ${row.start_date}`,
        });
      }
    }

    // Validate array fields
    this.validateArrayField(row, 'rewards_en', rowNum, warnings);
    this.validateArrayField(row, 'rewards_jp', rowNum, warnings);
  }

  /**
   * Validate Gacha fields
   */
  private validateGacha(
    row: Record<string, any>,
    rowNum: number,
    errors: ValidationError[],
    warnings: string[]
  ): void {
    // Validate gacha status
    if (row.gacha_status && !VALID_GACHA_STATUSES.includes(row.gacha_status)) {
      errors.push({
        row: rowNum,
        field: 'gacha_status',
        message: `Gacha status '${row.gacha_status}' không hợp lệ`,
        value: row.gacha_status,
        expected: VALID_GACHA_STATUSES.join(', '),
      });
    }

    // Validate date fields
    this.validateDateTimeField(row, 'start_date', rowNum, errors);
    this.validateDateTimeField(row, 'end_date', rowNum, errors);

    // Validate rates (must be numbers between 0-100)
    const rateFields = ['rates_ssr', 'rates_sr', 'rates_r'];
    rateFields.forEach((field) => {
      if (row[field] !== undefined && row[field] !== '') {
        const rate = Number(row[field]);
        if (isNaN(rate) || rate < 0 || rate > 100) {
          errors.push({
            row: rowNum,
            field,
            message: `${field} phải là số từ 0-100, nhận được: '${row[field]}'`,
            value: row[field],
            expected: 'Số từ 0 đến 100 (vd: 3.3, 15.0)',
          });
        }
      }
    });

    // Validate rates sum approximately 100
    if (row.rates_ssr && row.rates_sr && row.rates_r) {
      const sum = Number(row.rates_ssr) + Number(row.rates_sr) + Number(row.rates_r);
      if (Math.abs(sum - 100) > 0.5) {
        warnings.push(
          `Row ${rowNum}: Tổng rates (${sum.toFixed(1)}%) không bằng 100%`
        );
      }
    }

    // Validate pity_at (positive integer)
    if (row.pity_at !== undefined && row.pity_at !== '') {
      const pity = Number(row.pity_at);
      if (!Number.isInteger(pity) || pity <= 0) {
        errors.push({
          row: rowNum,
          field: 'pity_at',
          message: `pity_at phải là số nguyên dương, nhận được: '${row.pity_at}'`,
          value: row.pity_at,
          expected: 'Số nguyên dương (vd: 100, 200)',
        });
      }
    }

    // Validate step_up (boolean)
    if (row.step_up !== undefined && row.step_up !== '') {
      if (!['true', 'false', true, false].includes(row.step_up)) {
        errors.push({
          row: rowNum,
          field: 'step_up',
          message: `step_up phải là boolean, nhận được: '${row.step_up}'`,
          value: row.step_up,
          expected: 'true hoặc false',
        });
      }
    }
  }

  /**
   * Validate Episode fields
   */
  private validateEpisode(
    row: Record<string, any>,
    rowNum: number,
    errors: ValidationError[],
    warnings: string[]
  ): void {
    // Validate episode type
    if (row.type && !VALID_EPISODE_TYPES.includes(row.type)) {
      errors.push({
        row: rowNum,
        field: 'type',
        message: `Episode type '${row.type}' không hợp lệ`,
        value: row.type,
        expected: VALID_EPISODE_TYPES.join(', '),
      });
    }

    // Validate episode status
    if (row.episode_status && !VALID_EPISODE_STATUSES.includes(row.episode_status)) {
      errors.push({
        row: rowNum,
        field: 'episode_status',
        message: `Episode status '${row.episode_status}' không hợp lệ`,
        value: row.episode_status,
        expected: VALID_EPISODE_STATUSES.join(', '),
      });
    }

    // Validate release_date if present
    if (row.release_date) {
      this.validateDateTimeField(row, 'release_date', rowNum, errors);
    }

    // Validate character_ids array
    this.validateArrayField(row, 'character_ids', rowNum, warnings);
  }

  /**
   * Validate Item fields
   */
  private validateItem(
    row: Record<string, any>,
    rowNum: number,
    errors: ValidationError[],
    warnings: string[]
  ): void {
    // Validate item type
    if (row.type && !VALID_ITEM_TYPES.includes(row.type)) {
      errors.push({
        row: rowNum,
        field: 'type',
        message: `Item type '${row.type}' không hợp lệ`,
        value: row.type,
        expected: VALID_ITEM_TYPES.join(', '),
      });
    }
  }

  /**
   * Validate Guide fields
   */
  private validateGuide(
    row: Record<string, any>,
    rowNum: number,
    errors: ValidationError[],
    warnings: string[]
  ): void {
    // Validate content_ref (should be .md file)
    if (row.content_ref && !row.content_ref.endsWith('.md')) {
      warnings.push(
        `Row ${rowNum}: content_ref '${row.content_ref}' nên là file .md`
      );
    }

    // Validate read_time format
    if (row.read_time && !/^\d+\s*(min|minutes?|phút)$/i.test(row.read_time)) {
      warnings.push(
        `Row ${rowNum}: read_time '${row.read_time}' nên theo format '## min' (vd: 10 min)`
      );
    }

    // Validate topics array
    this.validateArrayField(row, 'topics', rowNum, warnings);
  }

  /**
   * Validate Tool fields
   */
  private validateTool(
    row: Record<string, any>,
    rowNum: number,
    errors: ValidationError[],
    warnings: string[]
  ): void {
    // Validate content_ref
    if (row.content_ref && !row.content_ref.endsWith('.md')) {
      warnings.push(
        `Row ${rowNum}: content_ref '${row.content_ref}' nên là file .md`
      );
    }

    // Validate version format if present
    if (row.version && !/^\d+(\.\d+)*$/.test(row.version)) {
      warnings.push(
        `Row ${rowNum}: version '${row.version}' nên theo format semver (vd: 1.0.0)`
      );
    }
  }

  /**
   * Validate Accessory fields
   */
  private validateAccessory(
    row: Record<string, any>,
    rowNum: number,
    errors: ValidationError[],
    warnings: string[]
  ): void {
    // Validate rarity
    if (row.rarity && !VALID_RARITIES.includes(row.rarity)) {
      errors.push({
        row: rowNum,
        field: 'rarity',
        message: `Rarity '${row.rarity}' không hợp lệ`,
        value: row.rarity,
        expected: VALID_RARITIES.join(', '),
      });
    }

    // Validate obtain_method
    if (row.obtain_method && !VALID_OBTAIN_METHODS.includes(row.obtain_method)) {
      errors.push({
        row: rowNum,
        field: 'obtain_method',
        message: `Obtain method '${row.obtain_method}' không hợp lệ`,
        value: row.obtain_method,
        expected: VALID_OBTAIN_METHODS.join(', '),
      });
    }

    // Validate stats JSON if present
    if (row.stats) {
      this.validateStatsJSON(row, rowNum, errors, false); // APL optional for accessories
    }

    // Validate character_ids array
    this.validateArrayField(row, 'character_ids', rowNum, warnings);
  }

  /**
   * Validate Mission fields
   */
  private validateMission(
    row: Record<string, any>,
    rowNum: number,
    errors: ValidationError[],
    warnings: string[]
  ): void {
    // Validate mission type
    if (row.type && !VALID_MISSION_TYPES.includes(row.type)) {
      errors.push({
        row: rowNum,
        field: 'type',
        message: `Mission type '${row.type}' không hợp lệ`,
        value: row.type,
        expected: VALID_MISSION_TYPES.join(', '),
      });
    }

    // Validate objectives array (required)
    if (!row.objectives || row.objectives.trim() === '') {
      errors.push({
        row: rowNum,
        field: 'objectives',
        message: 'objectives là bắt buộc cho mission',
        expected: 'Danh sách mục tiêu phân cách bằng | (vd: Win 5 matches|Collect 100 tokens)',
      });
    }

    // Validate rewards array (required)
    if (!row.rewards || row.rewards.trim() === '') {
      errors.push({
        row: rowNum,
        field: 'rewards',
        message: 'rewards là bắt buộc cho mission',
        expected: 'Danh sách phần thưởng phân cách bằng | (vd: 1000 V-Stones|SSR Ticket)',
      });
    }
  }

  /**
   * Validate Quiz fields
   */
  private validateQuiz(
    row: Record<string, any>,
    rowNum: number,
    errors: ValidationError[],
    warnings: string[]
  ): void {
    // Validate difficulty
    if (row.difficulty && !VALID_QUIZ_DIFFICULTIES.includes(row.difficulty)) {
      errors.push({
        row: rowNum,
        field: 'difficulty',
        message: `Difficulty '${row.difficulty}' không hợp lệ`,
        value: row.difficulty,
        expected: VALID_QUIZ_DIFFICULTIES.join(', '),
      });
    }

    // Validate time_limit (positive integer or 0)
    if (row.time_limit !== undefined && row.time_limit !== '') {
      const time = Number(row.time_limit);
      if (!Number.isInteger(time) || time < 0) {
        errors.push({
          row: rowNum,
          field: 'time_limit',
          message: `time_limit phải là số nguyên không âm (giây), nhận được: '${row.time_limit}'`,
          value: row.time_limit,
          expected: 'Số nguyên không âm (vd: 300, 600)',
        });
      }
    }

    // Validate question_count (positive integer)
    if (row.question_count !== undefined && row.question_count !== '') {
      const count = Number(row.question_count);
      if (!Number.isInteger(count) || count <= 0) {
        errors.push({
          row: rowNum,
          field: 'question_count',
          message: `question_count phải là số nguyên dương, nhận được: '${row.question_count}'`,
          value: row.question_count,
          expected: 'Số nguyên dương (vd: 5, 10)',
        });
      }
    }

    // Validate questions_ref
    if (row.questions_ref && !row.questions_ref.endsWith('.md')) {
      warnings.push(
        `Row ${rowNum}: questions_ref '${row.questions_ref}' nên là file .md`
      );
    }
  }

  /**
   * Validate Category fields
   */
  private validateCategory(
    row: Record<string, any>,
    rowNum: number,
    errors: ValidationError[],
    warnings: string[]
  ): void {
    // Validate order (positive integer)
    if (row.order !== undefined && row.order !== '') {
      const order = Number(row.order);
      if (!Number.isInteger(order) || order < 0) {
        errors.push({
          row: rowNum,
          field: 'order',
          message: `order phải là số nguyên không âm, nhận được: '${row.order}'`,
          value: row.order,
          expected: 'Số nguyên không âm (vd: 1, 2, 3)',
        });
      }
    }

    // Validate localized name
    if (!row.name_en && !row.name_jp) {
      errors.push({
        row: rowNum,
        field: 'name_en/name_jp',
        message: 'Phải có ít nhất name_en hoặc name_jp',
        expected: 'Tên danh mục',
      });
    }
  }

  /**
   * Validate Tag fields
   */
  private validateTag(
    row: Record<string, any>,
    rowNum: number,
    errors: ValidationError[],
    warnings: string[]
  ): void {
    // Validate usage_count (non-negative integer)
    if (row.usage_count !== undefined && row.usage_count !== '') {
      const count = Number(row.usage_count);
      if (!Number.isInteger(count) || count < 0) {
        errors.push({
          row: rowNum,
          field: 'usage_count',
          message: `usage_count phải là số nguyên không âm, nhận được: '${row.usage_count}'`,
          value: row.usage_count,
          expected: 'Số nguyên không âm (vd: 0, 5, 12)',
        });
      }
    }

    // Validate localized name
    if (!row.name_en && !row.name_jp) {
      errors.push({
        row: rowNum,
        field: 'name_en/name_jp',
        message: 'Phải có ít nhất name_en hoặc name_jp',
        expected: 'Tên tag',
      });
    }
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

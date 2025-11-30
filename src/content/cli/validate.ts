#!/usr/bin/env node
/**
 * CSV Validation CLI Tool
 * Usage: npm run validate-content [file] [type]
 */

import { readFileSync } from 'fs';
import { parseCSV } from '../utils/csv-parser';
import { ContentValidator } from '../utils/validator';

const VALID_TYPES = ['guide', 'character', 'event', 'swimsuit', 'category', 'tag', 'item', 'gacha', 'episode'] as const;
type ContentType = typeof VALID_TYPES[number];

interface ValidationStats {
  totalRows: number;
  validRows: number;
  errorRows: number;
}

async function validateCSV(filePath: string, contentType: ContentType) {
  console.log(`\n📋 Validating ${contentType} CSV: ${filePath}\n`);

  try {
    // Read CSV file
    const csvContent = readFileSync(filePath, 'utf-8');
    
    // Parse CSV using PapaParse
    const parseResult = parseCSV(csvContent);
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Add parse errors
    if (parseResult.errors.length > 0) {
      parseResult.errors.forEach(err => {
        errors.push(`Parse Error (Row ${err.row}): ${err.message}`);
      });
    }
    
    // Validate content
    const validator = new ContentValidator();
    
    // Validate unique IDs
    const uniqueValidation = validator.validateUniqueIds(parseResult.data);
    uniqueValidation.errors.forEach(err => {
      const field = (err as any).field;
      errors.push(`Validation Error (Row ${err.row}${field ? `, Field: ${field}` : ''}): ${err.message}`);
    });
    warnings.push(...uniqueValidation.warnings);
    
    // Validate content structure
    const contentValidation = validator.validateContent(parseResult.data, contentType);
    contentValidation.errors.forEach(err => {
      const field = (err as any).field;
      errors.push(`Validation Error (Row ${err.row}${field ? `, Field: ${field}` : ''}): ${err.message}`);
    });
    warnings.push(...contentValidation.warnings);
    
    // Validate related IDs
    const allIds = new Set(parseResult.data.map((item: any) => item.id));
    const relatedValidation = validator.validateRelatedIds(parseResult.data, allIds);
    warnings.push(...relatedValidation.warnings);
    
    const stats: ValidationStats = {
      totalRows: parseResult.data.length,
      validRows: errors.length === 0 ? parseResult.data.length : 0,
      errorRows: errors.length > 0 ? parseResult.data.length : 0
    };

    // Display results
    console.log('📊 Validation Results:');
    console.log('─'.repeat(50));
    console.log(`Total Rows: ${stats.totalRows}`);
    console.log(`Valid Rows: ${stats.validRows}`);
    console.log(`Error Rows: ${stats.errorRows}`);
    console.log('─'.repeat(50));

    if (errors.length > 0) {
      console.log('\n❌ Errors:');
      errors.forEach(err => console.log(`  • ${err}`));
    }

    if (warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      warnings.forEach(warn => console.log(`  • ${warn}`));
    }

    if (errors.length === 0) {
      console.log('\n✅ Validation passed!\n');
      return 0;
    } else {
      console.log('\n❌ Validation failed!\n');
      return 1;
    }
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    return 1;
  }
}

// CLI entry point
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('Usage: npm run validate-content <file> <type>');
  console.log(`Valid types: ${VALID_TYPES.join(', ')}`);
  process.exit(1);
}

const [filePath, contentType] = args;

if (!VALID_TYPES.includes(contentType as ContentType)) {
  console.error(`Invalid content type: ${contentType}`);
  console.log(`Valid types: ${VALID_TYPES.join(', ')}`);
  process.exit(1);
}

validateCSV(filePath, contentType as ContentType)
  .then(code => process.exit(code))
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });

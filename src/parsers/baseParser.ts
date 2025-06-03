import { Parser, ParserOptions, DataAnalysisResult, FieldMetadata } from '../types';
import { detectDataType, detectPattern, calculateFieldLength, isFieldUnique, normalizeFieldName } from '../utils/dataAnalysis';

export abstract class BaseParser implements Parser {
  protected async analyzeFields(
    headers: string[],
    records: any[][],
    options: ParserOptions = {}
  ): Promise<FieldMetadata[]> {
    const fields: FieldMetadata[] = [];
    
    for (let i = 0; i < headers.length; i++) {
      const values = records.map(record => record[i]);
      const field: FieldMetadata = {
        normalizedName: normalizeFieldName(headers[i]),
        originalHeader: headers[i],
        dataType: detectDataType(values[0]),
        length: calculateFieldLength(values)
      };

      if (options.detectPatterns) {
        const pattern = detectPattern(values);
        if (pattern) {
          field.pattern = pattern;
        }
      }

      if (options.checkUniqueness) {
        field.isUnique = isFieldUnique(values);
      }

      field.examples = values
        .filter(v => v !== null && v !== undefined)
        .slice(0, 3);

      fields.push(field);
    }

    return fields;
  }

  abstract parse(input: string | Buffer, options?: ParserOptions): Promise<DataAnalysisResult>;
  abstract supports(fileName: string): boolean;
}

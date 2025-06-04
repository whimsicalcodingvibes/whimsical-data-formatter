import {
  Parser,
  ParserOptions,
  DataAnalysisResult,
  FieldMetadata,
} from "../types";
import {
  validateOptions,
  validateHeaders,
  validateRecords,
} from "../utils/validation";
import {
  detectDataType,
  detectPattern,
  calculateFieldLength,
  isFieldUnique,
  normalizeFieldName,
} from "../utils/dataAnalysis";

export abstract class BaseParser implements Parser {
  protected async validateAndAnalyzeFields(
    headers: string[],
    records: any[][],
    options: ParserOptions
  ): Promise<FieldMetadata[]> {
    // Validate inputs
    const errors = [
      ...validateOptions(options),
      ...validateHeaders(headers),
      ...validateRecords(records),
    ];

    if (errors.length > 0) {
      throw new Error(
        "Validation failed:\n" +
          errors.map((e) => `- ${e.field}: ${e.message}`).join("\n")
      );
    }

    const fields: FieldMetadata[] = [];
    for (let i = 0; i < headers.length; i++) {
      const values = records.map((record) => record[i]);
      const normalizedName = normalizeFieldName(headers[i]);
      const isIdField = normalizedName.includes("id");

      const field: FieldMetadata = {
        normalizedName,
        originalHeader: headers[i],
        dataType: isIdField ? "string" : detectDataType(values[0]),
        length: calculateFieldLength(values),
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
        .filter((v) => v !== null && v !== undefined)
        .slice(0, 3);

      fields.push(field);
    }

    return fields;
  }

  protected createMetadata(options: ParserOptions): {
    fileName?: string;
    dateAnalyzed: string;
    version: string;
  } {
    return {
      fileName: options.fileName || "Unknown",
      dateAnalyzed: new Date().toISOString(),
      version: "1.0.0",
    };
  }

  abstract parse(
    input: string | Buffer,
    options?: ParserOptions
  ): Promise<DataAnalysisResult>;
  abstract supports(fileName: string): boolean;
}

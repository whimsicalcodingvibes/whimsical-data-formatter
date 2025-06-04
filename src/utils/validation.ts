import { ParserOptions } from "../types";

export interface TxtParserOptions extends ParserOptions {
  delimiter?: string;
  fixedWidths?: number[];
  detectDelimiter?: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
}

export function validateOptions(options: ParserOptions): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate sampleSize
  if (options.sampleSize !== undefined) {
    if (!Number.isInteger(options.sampleSize)) {
      errors.push({
        field: "sampleSize",
        message: "Sample size must be an integer",
      });
    } else if (options.sampleSize <= 0) {
      errors.push({
        field: "sampleSize",
        message: "Sample size must be greater than 0",
      });
    }
  }

  // Validate encoding
  if (options.encoding !== undefined) {
    const validEncodings = [
      "utf8",
      "utf-8",
      "ascii",
      "utf16le",
      "ucs2",
      "base64",
      "latin1",
      "binary",
      "hex",
    ];
    if (!validEncodings.includes(options.encoding.toLowerCase())) {
      errors.push({
        field: "encoding",
        message: `Invalid encoding. Supported encodings: ${validEncodings.join(
          ", "
        )}`,
      });
    }
  }

  return errors;
}

export function validateHeaders(headers: string[]): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!Array.isArray(headers)) {
    errors.push({
      field: "headers",
      message: "Headers must be an array",
    });
    return errors;
  }

  if (headers.length === 0) {
    errors.push({
      field: "headers",
      message: "File must contain at least one header",
    });
  }

  // Check for duplicate headers
  const normalizedHeaders = headers.map((h) => h.toLowerCase());
  const duplicates = normalizedHeaders.filter(
    (header, index) => normalizedHeaders.indexOf(header) !== index
  );

  if (duplicates.length > 0) {
    errors.push({
      field: "headers",
      message: `Duplicate headers found: ${[...new Set(duplicates)].join(
        ", "
      )}`,
    });
  }

  // Check for empty or invalid headers
  headers.forEach((header, index) => {
    if (!header || header.trim() === "") {
      errors.push({
        field: `header[${index}]`,
        message: "Empty or whitespace-only header found",
      });
    }
  });

  return errors;
}

export function validateRecords(records: any[][]): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!Array.isArray(records)) {
    errors.push({
      field: "records",
      message: "Records must be an array",
    });
    return errors;
  }

  if (records.length === 0) {
    errors.push({
      field: "records",
      message: "File must contain at least one record",
    });
    return errors;
  }

  // Check if all records have the same number of fields
  const expectedLength = records[0].length;
  records.forEach((record, index) => {
    if (!Array.isArray(record)) {
      errors.push({
        field: `record[${index}]`,
        message: "Each record must be an array",
      });
    } else if (record.length !== expectedLength) {
      errors.push({
        field: `record[${index}]`,
        message: `Record has ${record.length} fields, expected ${expectedLength}`,
      });
    }
  });

  return errors;
}

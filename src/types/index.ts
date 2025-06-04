export interface FieldMetadata {
  normalizedName: string;
  originalHeader: string;
  dataType: string;
  length: number;
  pattern?: string;
  isUnique?: boolean;
  constraints?: string[];
  examples?: string[];
}

export interface DataAnalysisResult {
  sourceType: string;
  totalRecords: number;
  fields: FieldMetadata[];
  metadata: {
    fileName?: string;
    dateAnalyzed: string;
    version: string;
  };
}

export interface ParserOptions {
  detectPatterns?: boolean;
  checkUniqueness?: boolean;
  sampleSize?: number;
  encoding?: string;
  delimiter?: string;
  fixedWidths?: number[];
  detectDelimiter?: boolean;
  fileName?: string; // Add fileName to options
}

export interface Parser {
  parse(
    input: string | Buffer,
    options?: ParserOptions
  ): Promise<DataAnalysisResult>;
  supports(fileName: string): boolean;
}

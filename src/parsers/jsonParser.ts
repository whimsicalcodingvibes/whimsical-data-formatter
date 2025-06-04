import { BaseParser } from "./baseParser";
import { ParserOptions, DataAnalysisResult } from "../types";

export class JsonParser extends BaseParser {
  async parse(
    input: string | Buffer,
    options: ParserOptions = {}
  ): Promise<DataAnalysisResult> {
    try {
      const encoding = (options.encoding as BufferEncoding) || "utf-8";
      const content = input.toString(encoding);
      let data: any;

      try {
        data = JSON.parse(content);
      } catch (e) {
        throw new Error("Invalid JSON format");
      }

      // Handle both array of objects and single object
      const records = Array.isArray(data) ? data : [data];

      if (records.length === 0) {
        throw new Error("JSON file must contain at least one record");
      }

      // Extract headers from the first record
      const headers = Object.keys(records[0]);

      // Transform records into arrays of values
      const rows = records.map((record) =>
        headers.map((header) => record[header])
      );

      // If sample size is specified, limit the number of records
      const sampledRecords = options.sampleSize
        ? rows.slice(0, options.sampleSize)
        : rows;

      const fields = await this.validateAndAnalyzeFields(
        headers,
        sampledRecords,
        options
      );

      return {
        sourceType: "json",
        totalRecords: records.length,
        fields,
        metadata: this.createMetadata(options),
      };
    } catch (error) {
      throw new Error(`Failed to parse JSON: ${(error as Error).message}`);
    }
  }

  supports(fileName: string): boolean {
    return fileName.toLowerCase().endsWith(".json");
  }
}

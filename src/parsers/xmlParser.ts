import { parseStringPromise, ParserOptions as XmlParserOptions } from "xml2js";
import { BaseParser } from "./baseParser";
import { ParserOptions, DataAnalysisResult } from "../types";

export class XmlParser extends BaseParser {
  async parse(
    input: string | Buffer,
    options: ParserOptions = {}
  ): Promise<DataAnalysisResult> {
    try {
      const encoding = (options.encoding as BufferEncoding) || "utf-8";
      const content = input.toString(encoding); // Parse XML to JavaScript object
      const xmlOptions: XmlParserOptions = {
        explicitArray: true,
        explicitRoot: true,
        mergeAttrs: true,
      };
      const parsedXml = await parseStringPromise(content, xmlOptions);

      // Get the root element name and its children
      const rootKey = Object.keys(parsedXml)[0];
      const result = parsedXml[rootKey]; // Get the repeating element name by checking the first child of the root
      const recordKey = Object.keys(result).find((key) =>
        Array.isArray(result[key])
      );
      if (!recordKey) {
        throw new Error(
          "XML file must contain a repeating element for records"
        );
      }

      // Get the array of records
      const records = result[recordKey];

      if (records.length === 0) {
        throw new Error("XML file must contain at least one record");
      } // Extract headers from the first record and normalize them
      const headers = Object.keys(records[0]).map((header) =>
        header.toLowerCase()
      );

      // Transform records into arrays of values
      const rows = records.map((record: Record<string, unknown>) => {
        return headers.map((header) => {
          let value = record[header];

          // Convert array values to their first element since xml2js creates arrays
          if (Array.isArray(value)) {
            value = value[0];
          }

          // Keep IDs as strings
          if (header.includes("id") && /^\d+/.test(String(value))) {
            return String(value);
          }

          // Keep values with leading zeros as strings
          if (typeof value === "string" && /^0\d+/.test(value)) {
            return value;
          }

          // Try to convert numeric strings to numbers
          if (typeof value === "string" && /^-?\d+(\.\d+)?$/.test(value)) {
            const num = Number(value);
            return !isNaN(num) ? num : value;
          }

          return value;
        });
      });

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
        sourceType: "xml",
        totalRecords: records.length,
        fields,
        metadata: this.createMetadata(options),
      };
    } catch (error) {
      throw new Error(`Failed to parse XML: ${(error as Error).message}`);
    }
  }

  supports(fileName: string): boolean {
    return fileName.toLowerCase().endsWith(".xml");
  }
}

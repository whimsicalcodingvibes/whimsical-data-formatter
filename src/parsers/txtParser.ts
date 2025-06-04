import { BaseParser } from "./baseParser";
import { ParserOptions, DataAnalysisResult } from "../types";

interface TxtParserOptions extends ParserOptions {
  delimiter?: string;
  fixedWidths?: number[];
  detectDelimiter?: boolean;
}

export class TxtParser extends BaseParser {
  async parse(
    input: string | Buffer,
    options: TxtParserOptions = {}
  ): Promise<DataAnalysisResult> {
    try {
      const encoding = (options.encoding as BufferEncoding) || "utf-8";
      const content = input.toString(encoding);
      const lines = content.split("\n").filter((line) => line.trim());

      if (lines.length === 0) {
        throw new Error("TXT file must contain at least one line");
      }

      let headers: string[];
      let records: any[][];

      if (options.fixedWidths) {
        // Handle fixed-width format
        [headers, records] = this.parseFixedWidth(lines, options.fixedWidths);
      } else {
        // Handle delimited format
        const delimiter = this.getDelimiter(lines[0], options);
        [headers, records] = this.parseDelimited(lines, delimiter);
      }

      // If sample size is specified, limit the number of records
      const sampledRecords: any[][] = options.sampleSize
        ? records.slice(0, options.sampleSize)
        : records;

      // Ensure IDs are treated as strings
      const processedRecords: any[][] = sampledRecords.map((record: any[]) =>
        record.map((value: any, index: number) => {
          const isId = headers[index].toLowerCase().includes("id");
          const isLeadingZero = /^0\d+/.test(String(value));
          const isAlphanumericId = /^\d+[a-zA-Z0-9]*$/.test(String(value));
          return isId || isLeadingZero || isAlphanumericId
            ? String(value)
            : value;
        })
      );

      const fields = await this.validateAndAnalyzeFields(
        headers,
        sampledRecords,
        options
      );

      return {
        sourceType: "txt",
        totalRecords: records.length,
        fields,
        metadata: this.createMetadata(options),
      };
    } catch (error) {
      throw new Error(`Failed to parse TXT: ${(error as Error).message}`);
    }
  }
  private parseFixedWidth(
    lines: string[],
    widths: number[]
  ): [string[], any[][]] {
    const headers: string[] = [];
    const records: any[][] = [];

    // Calculate total width expected for each line
    const totalWidth = widths.reduce((sum, width) => sum + width, 0);

    // Generate default headers first
    for (let i = 0; i < widths.length; i++) {
      headers.push(`column${i + 1}`);
    }

    // Check if the first line looks like headers
    const firstLine = lines[0].trimEnd();
    const hasHeaders =
      /[a-zA-Z]/.test(firstLine.substring(0, totalWidth)) &&
      !/^\s*\d/.test(firstLine); // Ensure it doesn't start with a number
    const firstDataLine = hasHeaders ? 1 : 0;

    // If we have headers, parse them
    if (hasHeaders) {
      headers.length = 0; // Clear default headers
      let position = 0;
      for (const width of widths) {
        const header = firstLine.substr(position, width).trim().toLowerCase();
        headers.push(header || `column${headers.length + 1}`);
        position += width;
      }
    }

    // Parse data rows
    for (let i = firstDataLine; i < lines.length; i++) {
      const line = lines[i].trimEnd();
      if (!line) continue; // Skip empty lines

      const record: any[] = [];
      let position = 0;

      for (let j = 0; j < widths.length; j++) {
        const width = widths[j];
        const value = line.substr(position, width).trim();

        // Determine if value should stay as string
        const headerName = headers[j].toLowerCase();
        const isId = headerName.includes("id");
        const isLeadingZero = /^0\d+/.test(value);
        const isAlphanumericId = /^\d+[a-zA-Z0-9]*$/.test(value);

        if (isId || isLeadingZero || isAlphanumericId) {
          record.push(String(value));
        } else {
          // Try to convert to number if it looks like one
          const num = /^-?\d+(\.\d+)?$/.test(value) ? Number(value) : NaN;
          record.push(isNaN(num) ? value : num);
        }

        position += width;
      }

      records.push(record);
    }

    return [headers, records];
  }
  private parseDelimited(
    lines: string[],
    delimiter: string
  ): [string[], any[][]] {
    const headers = lines[0]
      .split(delimiter)
      .map((header) => header.trim().toLowerCase())
      .map((header, index) => header || `column${index + 1}`);

    const records = lines.slice(1).map((line) =>
      line.split(delimiter).map((field, index) => {
        const value = field.trim();
        const headerName = headers[index].toLowerCase();

        // Check for special types that should remain strings
        const isId = headerName.includes("id");
        const isLeadingZero = /^0\d+/.test(value);
        const isAlphanumericId = /^\d+[a-zA-Z0-9]*$/.test(value);

        if (isId || isLeadingZero || isAlphanumericId) {
          return String(value);
        }

        // Try to convert numbers
        if (/^-?\d+(\.\d+)?$/.test(value)) {
          const num = Number(value);
          return isNaN(num) ? value : num;
        }

        // Check for dates
        if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
          return value;
        }

        return value;
      })
    );

    return [headers, records];
  }
  private getDelimiter(firstLine: string, options: TxtParserOptions): string {
    if (options.delimiter) {
      return options.delimiter;
    }

    // Remove any trailing newlines or carriage returns
    const line = firstLine.replace(/[\r\n]+$/, "");

    if (options.detectDelimiter || !options.delimiter) {
      // Common delimiters to check
      const delimiters = ["|", "\t", ";", ","];

      // Count occurrences and check how many fields they would create
      const delimiterScores = delimiters.map((d) => {
        const count = line.split(d).length - 1;
        if (count <= 0) return 0;

        // Check if splitting creates meaningful fields (more than 1)
        const fields = line.split(d);
        // Prefer delimiters that create more than one field and are used multiple times
        return fields.length > 1 ? count : 0;
      });

      const maxScore = Math.max(...delimiterScores);
      if (maxScore > 0) {
        // Return the delimiter that scored highest
        return delimiters[delimiterScores.indexOf(maxScore)];
      }
    }

    // Default to tab if no clear delimiter is found
    return "\t";
  }

  supports(fileName: string): boolean {
    return fileName.toLowerCase().endsWith(".txt");
  }
}

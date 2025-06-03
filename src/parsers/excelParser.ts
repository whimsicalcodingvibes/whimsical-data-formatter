import * as XLSX from "xlsx-js-style";
import { BaseParser } from "./baseParser";
import { ParserOptions, DataAnalysisResult } from "../types";

export class ExcelParser extends BaseParser {
  async parse(
    input: Buffer,
    options: ParserOptions = {}
  ): Promise<DataAnalysisResult> {
    const workbook = XLSX.read(input, { type: "buffer" });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

    // Convert sheet to JSON array
    const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

    if (jsonData.length < 2) {
      throw new Error(
        "Excel file must contain at least headers and one row of data"
      );
    }

    const headers = jsonData[0] as string[];
    const records = jsonData.slice(1) as any[][];

    // If sample size is specified, limit the number of records
    const sampledRecords = options.sampleSize
      ? records.slice(0, options.sampleSize)
      : records;

    const fields = await this.analyzeFields(headers, sampledRecords, options);

    return {
      sourceType: "excel",
      totalRecords: records.length,
      fields,
      metadata: {
        fileName: "Unknown", // This will be set by the CLI
        dateAnalyzed: new Date().toISOString(),
        version: "1.0.0",
      },
    };
  }

  supports(fileName: string): boolean {
    return /\.(xlsx|xls|xlsm)$/i.test(fileName);
  }
}

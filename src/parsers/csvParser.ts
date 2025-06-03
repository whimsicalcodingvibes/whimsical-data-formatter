import { parse as csvParse } from 'csv-parse';
import { BaseParser } from './baseParser';
import { ParserOptions, DataAnalysisResult } from '../types';

export class CsvParser extends BaseParser {
  async parse(input: string | Buffer, options: ParserOptions = {}): Promise<DataAnalysisResult> {
    return new Promise((resolve, reject) => {
      const records: any[][] = [];
      let headers: string[] = [];

      csvParse(input, {
        delimiter: ',',
        columns: false,
        skip_empty_lines: true,
        // The encoding option should be handled separately if needed
        // The csv-parse package expects different option types
      })
        .on('data', (record: any[]) => {
          if (headers.length === 0) {
            headers = record;
          } else {
            records.push(record);
          }
        })
        .on('error', (error) => reject(error))
        .on('end', async () => {
          try {
            const fields = await this.analyzeFields(headers, records, options);
            
            resolve({
              sourceType: 'csv',
              totalRecords: records.length,
              fields,
              metadata: {
                dateAnalyzed: new Date().toISOString(),
                version: '1.0.0'
              }
            });
          } catch (error) {
            reject(error);
          }
        });
    });
  }

  supports(fileName: string): boolean {
    return fileName.toLowerCase().endsWith('.csv');
  }
}

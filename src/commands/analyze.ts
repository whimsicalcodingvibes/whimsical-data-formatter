import { Command } from "commander";
import { readFile, writeFile } from "fs/promises";
import { resolve } from "path";
import chalk from "chalk";
import { ParserOptions, Parser } from "../types";
import { CsvParser } from "../parsers/csvParser";
import { ExcelParser } from "../parsers/excelParser";
import { JsonParser } from "../parsers/jsonParser";
import { XmlParser } from "../parsers/xmlParser";
import { TxtParser } from "../parsers/txtParser";

const parsers: Parser[] = [
  new CsvParser(),
  new ExcelParser(),
  new JsonParser(),
  new XmlParser(),
  new TxtParser(),
];

export function createAnalyzeCommand(): Command {
  return new Command("analyze")
    .description("Analyze a data file and generate metadata")
    .argument("<file>", "Input file to analyze")
    .option("-p, --patterns", "Detect patterns in string fields")
    .option("-u, --unique", "Check for field uniqueness")
    .option("-s, --sample <number>", "Number of records to sample")
    .option("-e, --encoding <encoding>", "File encoding (default: utf-8)")
    .option("-o, --output <file>", "Output file (default: stdout)")
    .option("-d, --delimiter <char>", "Custom delimiter for TXT files")
    .option(
      "-w, --fixed-widths <numbers>",
      "Fixed-width column sizes for TXT files (comma-separated)"
    )
    .option("--detect-delimiter", "Auto-detect delimiter in TXT files")
    .action(async (file, options) => {
      try {
        const filePath = resolve(file);
        const input = await readFile(filePath);
        const parserOptions: ParserOptions = {
          detectPatterns: options.patterns,
          checkUniqueness: options.unique,
          sampleSize: options.sample ? parseInt(options.sample) : undefined,
          encoding: options.encoding,
          delimiter: options.delimiter,
          fixedWidths: options.fixedWidths
            ?.split(",")
            .map((n: string) => parseInt(n.trim())),
          detectDelimiter: options.detectDelimiter,
          fileName: require("path").basename(file),
        };

        const parser = parsers.find((p) => p.supports(file));

        if (!parser) {
          console.error(chalk.red("Unsupported file format"));
          process.exit(1);
        }

        const result = await parser.parse(input, parserOptions);

        if (options.output) {
          await writeFile(options.output, JSON.stringify(result, null, 2));
          console.log(chalk.green(`Analysis saved to ${options.output}`));
        } else {
          console.log(JSON.stringify(result, null, 2));
        }
      } catch (error) {
        console.error(chalk.red("Error:", (error as Error).message));
        process.exit(1);
      }
    });
}

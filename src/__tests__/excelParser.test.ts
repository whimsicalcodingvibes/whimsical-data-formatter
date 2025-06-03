import { ExcelParser } from "../parsers/excelParser";

describe("ExcelParser", () => {
  let parser: ExcelParser;

  beforeEach(() => {
    parser = new ExcelParser();
  });

  describe("supports", () => {
    it("should return true for Excel files", () => {
      expect(parser.supports("data.xlsx")).toBe(true);
      expect(parser.supports("DATA.XLSX")).toBe(true);
      expect(parser.supports("data.xls")).toBe(true);
      expect(parser.supports("data.xlsm")).toBe(true);
    });

    it("should return false for non-Excel files", () => {
      expect(parser.supports("data.csv")).toBe(false);
      expect(parser.supports("data.json")).toBe(false);
    });
  });

  describe("parse", () => {
    it("should parse Excel data correctly", async () => {
      // Create a simple Excel workbook in memory
      const XLSX = require("xlsx-js-style");
      const workbook = XLSX.utils.book_new();
      const wsData = [
        ["name", "age", "email"],
        ["John Doe", 30, "john@example.com"],
        ["Jane Smith", 25, "jane@example.com"],
      ];
      const worksheet = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

      // Convert workbook to buffer
      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

      const result = await parser.parse(buffer);

      expect(result.sourceType).toBe("excel");
      expect(result.totalRecords).toBe(2);
      expect(result.fields).toHaveLength(3);

      const [nameField, ageField, emailField] = result.fields;

      expect(nameField.normalizedName).toBe("name");
      expect(nameField.dataType).toBe("string");

      expect(ageField.normalizedName).toBe("age");
      expect(ageField.dataType).toBe("number.integer");

      expect(emailField.normalizedName).toBe("email");
      expect(emailField.dataType).toBe("string.email");
    });
  });
});

import {
  validateOptions,
  validateHeaders,
  validateRecords,
} from "../utils/validation";
import { ParserOptions } from "../types";

describe("Validation Utils", () => {
  describe("validateOptions", () => {
    it("should validate sample size", () => {
      const options: ParserOptions = { sampleSize: -1 };
      const errors = validateOptions(options);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain("must be greater than 0");
    });

    it("should validate encoding", () => {
      const options: ParserOptions = { encoding: "invalid-encoding" };
      const errors = validateOptions(options);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain("Invalid encoding");
    });

    it("should accept valid options", () => {
      const options: ParserOptions = {
        sampleSize: 100,
        encoding: "utf-8",
        detectPatterns: true,
        checkUniqueness: true,
      };
      const errors = validateOptions(options);
      expect(errors).toHaveLength(0);
    });
  });

  describe("validateHeaders", () => {
    it("should detect duplicate headers", () => {
      const headers = ["name", "age", "Name", "email"];
      const errors = validateHeaders(headers);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain("Duplicate headers");
    });

    it("should detect empty headers", () => {
      const headers = ["name", "", "email"];
      const errors = validateHeaders(headers);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain("Empty or whitespace-only header");
    });

    it("should accept valid headers", () => {
      const headers = ["id", "name", "email", "age"];
      const errors = validateHeaders(headers);
      expect(errors).toHaveLength(0);
    });
  });

  describe("validateRecords", () => {
    it("should detect inconsistent record lengths", () => {
      const records = [
        ["1", "John", "john@example.com"],
        ["2", "Jane"],
        ["3", "Bob", "bob@example.com", "extra"],
      ];
      const errors = validateRecords(records);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].message).toContain("expected 3");
    });

    it("should detect empty records", () => {
      const records: any[][] = [];
      const errors = validateRecords(records);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain("must contain at least one record");
    });

    it("should accept valid records", () => {
      const records = [
        ["1", "John", "john@example.com"],
        ["2", "Jane", "jane@example.com"],
        ["3", "Bob", "bob@example.com"],
      ];
      const errors = validateRecords(records);
      expect(errors).toHaveLength(0);
    });
  });
});

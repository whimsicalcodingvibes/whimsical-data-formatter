import { JsonParser } from "../parsers/jsonParser";

describe("JsonParser", () => {
  let parser: JsonParser;

  beforeEach(() => {
    parser = new JsonParser();
  });

  describe("supports", () => {
    it("should return true for JSON files", () => {
      expect(parser.supports("data.json")).toBe(true);
      expect(parser.supports("DATA.JSON")).toBe(true);
    });

    it("should return false for non-JSON files", () => {
      expect(parser.supports("data.csv")).toBe(false);
      expect(parser.supports("data.xlsx")).toBe(false);
    });
  });

  describe("parse", () => {
    it("should parse JSON array data correctly", async () => {
      const jsonData = JSON.stringify([
        {
          id: "USER001",
          name: "John Doe",
          age: 30,
          email: "john@example.com",
          isActive: true,
          lastLogin: "2025-01-15",
        },
        {
          id: "USER002",
          name: "Jane Smith",
          age: 25,
          email: "jane@example.com",
          isActive: false,
          lastLogin: "2025-02-20",
        },
      ]);

      const result = await parser.parse(jsonData, { detectPatterns: true });

      expect(result.sourceType).toBe("json");
      expect(result.totalRecords).toBe(2);
      expect(result.fields).toHaveLength(6);

      const [
        idField,
        nameField,
        ageField,
        emailField,
        isActiveField,
        lastLoginField,
      ] = result.fields;

      expect(idField.normalizedName).toBe("id");
      expect(idField.dataType).toBe("string");
      expect(idField.pattern).toBe("alphanumeric");

      expect(nameField.normalizedName).toBe("name");
      expect(nameField.dataType).toBe("string");

      expect(ageField.normalizedName).toBe("age");
      expect(ageField.dataType).toBe("number.integer");

      expect(emailField.normalizedName).toBe("email");
      expect(emailField.dataType).toBe("string.email");

      expect(isActiveField.normalizedName).toBe("isactive");
      expect(isActiveField.dataType).toBe("boolean");

      expect(lastLoginField.normalizedName).toBe("lastlogin");
      expect(lastLoginField.dataType).toBe("date");
    });

    it("should handle single object JSON", async () => {
      const jsonData = JSON.stringify({
        id: "PROD001",
        name: "Test Product",
        price: 99.99,
      });

      const result = await parser.parse(jsonData);

      expect(result.sourceType).toBe("json");
      expect(result.totalRecords).toBe(1);
      expect(result.fields).toHaveLength(3);
    });

    it("should throw error for invalid JSON", async () => {
      const invalidJson = '{ "name": "Test", invalid json }';
      await expect(parser.parse(invalidJson)).rejects.toThrow(
        "Invalid JSON format"
      );
    });

    it("should throw error for empty array", async () => {
      const emptyArray = "[]";
      await expect(parser.parse(emptyArray)).rejects.toThrow(
        "JSON file must contain at least one record"
      );
    });
  });
});

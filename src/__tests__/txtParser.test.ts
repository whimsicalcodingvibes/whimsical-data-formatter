import { TxtParser } from "../parsers/txtParser";

describe("TxtParser", () => {
  let parser: TxtParser;

  beforeEach(() => {
    parser = new TxtParser();
  });

  describe("supports", () => {
    it("should return true for TXT files", () => {
      expect(parser.supports("data.txt")).toBe(true);
      expect(parser.supports("DATA.TXT")).toBe(true);
    });

    it("should return false for non-TXT files", () => {
      expect(parser.supports("data.csv")).toBe(false);
      expect(parser.supports("data.json")).toBe(false);
    });
  });

  describe("parse", () => {
    it("should parse tab-delimited data correctly", async () => {
      const txtData = `name\tage\temail
John Doe\t30\tjohn@example.com
Jane Smith\t25\tjane@example.com`;

      const result = await parser.parse(txtData);

      expect(result.sourceType).toBe("txt");
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

    it("should parse fixed-width format correctly", async () => {
      const txtData = `ID  Name      Age Email          
001 John Doe  30  john@test.com
002 Jane Doe  25  jane@test.com`;

      const result = await parser.parse(txtData, {
        fixedWidths: [4, 10, 4, 14],
      });

      expect(result.sourceType).toBe("txt");
      expect(result.totalRecords).toBe(2);
      expect(result.fields).toHaveLength(4);

      const [idField, nameField, ageField, emailField] = result.fields;

      expect(idField.normalizedName).toBe("id");
      expect(idField.dataType).toBe("string");

      expect(nameField.normalizedName).toBe("name");
      expect(nameField.dataType).toBe("string");

      expect(ageField.normalizedName).toBe("age");
      expect(ageField.dataType).toBe("number.integer");

      expect(emailField.normalizedName).toBe("email");
      expect(emailField.dataType).toBe("string.email");
    });

    it("should parse custom delimited data correctly", async () => {
      const txtData = `name|age|email
John Doe|30|john@example.com
Jane Smith|25|jane@example.com`;

      const result = await parser.parse(txtData, {
        delimiter: "|",
      });

      expect(result.sourceType).toBe("txt");
      expect(result.totalRecords).toBe(2);
      expect(result.fields).toHaveLength(3);
    });

    it("should auto-detect delimiter when enabled", async () => {
      const txtData = `name|age|email
John Doe|30|john@example.com
Jane Smith|25|jane@example.com`;

      const result = await parser.parse(txtData, {
        detectDelimiter: true,
      });

      expect(result.sourceType).toBe("txt");
      expect(result.totalRecords).toBe(2);
      expect(result.fields).toHaveLength(3);
    });

    it("should generate column names for headerless fixed-width data", async () => {
      const txtData = `001 John Doe  30  john@test.com
002 Jane Doe  25  jane@test.com`;

      const result = await parser.parse(txtData, {
        fixedWidths: [4, 10, 4, 14],
      });

      expect(result.fields.map((f) => f.normalizedName)).toEqual([
        "column1",
        "column2",
        "column3",
        "column4",
      ]);
    });

    it("should throw error for empty file", async () => {
      const emptyTxt = "";
      await expect(parser.parse(emptyTxt)).rejects.toThrow(
        "TXT file must contain at least one line"
      );
    });
  });
});

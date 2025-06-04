import { XmlParser } from "../parsers/xmlParser";

describe("XmlParser", () => {
  let parser: XmlParser;

  beforeEach(() => {
    parser = new XmlParser();
  });

  describe("supports", () => {
    it("should return true for XML files", () => {
      expect(parser.supports("data.xml")).toBe(true);
      expect(parser.supports("DATA.XML")).toBe(true);
    });

    it("should return false for non-XML files", () => {
      expect(parser.supports("data.csv")).toBe(false);
      expect(parser.supports("data.json")).toBe(false);
    });
  });

  describe("parse", () => {
    it("should parse XML data correctly", async () => {
      const xmlData = `
        <?xml version="1.0" encoding="UTF-8"?>
        <records>
          <record>
            <name>John Doe</name>
            <age>30</age>
            <email>john@example.com</email>
          </record>
          <record>
            <name>Jane Smith</name>
            <age>25</age>
            <email>jane@example.com</email>
          </record>
        </records>
      `;

      const result = await parser.parse(xmlData);

      expect(result.sourceType).toBe("xml");
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

    it("should handle XML with attributes", async () => {
      const xmlData = `
        <?xml version="1.0" encoding="UTF-8"?>
        <products>
          <product id="1" category="electronics">
            <name>Laptop</name>
            <price currency="USD">999.99</price>
          </product>
          <product id="2" category="books">
            <name>TypeScript Guide</name>
            <price currency="USD">49.99</price>
          </product>
        </products>
      `;

      const result = await parser.parse(xmlData);

      expect(result.sourceType).toBe("xml");
      expect(result.totalRecords).toBe(2);
      // Should include both elements and attributes
      expect(result.fields.map((f) => f.normalizedName)).toContain("id");
      expect(result.fields.map((f) => f.normalizedName)).toContain("category");
      expect(result.fields.map((f) => f.normalizedName)).toContain("name");
      expect(result.fields.map((f) => f.normalizedName)).toContain("price");
    });

    it("should throw error for invalid XML", async () => {
      const invalidXml = "<record><name>Test</name></wrong>";
      await expect(parser.parse(invalidXml)).rejects.toThrow(
        "Failed to parse XML"
      );
    });
  });
});

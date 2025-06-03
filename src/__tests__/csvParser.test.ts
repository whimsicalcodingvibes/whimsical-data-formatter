import { CsvParser } from '../parsers/csvParser';

describe('CsvParser', () => {
  let parser: CsvParser;

  beforeEach(() => {
    parser = new CsvParser();
  });

  describe('supports', () => {
    it('should return true for CSV files', () => {
      expect(parser.supports('data.csv')).toBe(true);
      expect(parser.supports('DATA.CSV')).toBe(true);
    });

    it('should return false for non-CSV files', () => {
      expect(parser.supports('data.json')).toBe(false);
      expect(parser.supports('data.xml')).toBe(false);
    });
  });

  describe('parse', () => {
    it('should parse CSV data correctly', async () => {
      const csvData = `name,age,email
John Doe,30,john@example.com
Jane Smith,25,jane@example.com`;

      const result = await parser.parse(csvData);

      expect(result.sourceType).toBe('csv');
      expect(result.totalRecords).toBe(2);
      expect(result.fields).toHaveLength(3);

      const [nameField, ageField, emailField] = result.fields;

      expect(nameField.normalizedName).toBe('name');
      expect(nameField.dataType).toBe('string');

      expect(ageField.normalizedName).toBe('age');
      expect(ageField.dataType).toBe('number.integer');

      expect(emailField.normalizedName).toBe('email');
      expect(emailField.dataType).toBe('string.email');
    });
  });
});

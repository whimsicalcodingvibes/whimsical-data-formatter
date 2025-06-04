# Whimsical Data Formatter

A powerful CLI tool for analyzing data files and generating structured JSON output with detailed field metadata. This tool helps you understand your data structure by detecting field types, patterns, and constraints across various file formats.

## Features

- **Multiple Format Support**
  - CSV files
  - Excel files (xlsx, xls, xlsm)
  - JSON files
  - XML files (with attribute support)
  - TXT files (tab-delimited, custom delimiter, or fixed-width)

- **Intelligent Data Analysis**
  - Automatic data type detection
  - Pattern recognition in string fields
  - Field length calculation
  - Uniqueness validation
  - Sample-based analysis support
  - Leading zero preservation
  - ID field handling
  - Auto-delimiter detection for TXT files

- **Rich Field Metadata**
  - Normalized field names
  - Original headers
  - Detected data types
  - Field lengths
  - Pattern information
  - Uniqueness status
  - Example values

## Installation

```bash
npm install -g whimsical-data-formatter
```

## Usage

### Basic Analysis

Analyze a data file and output the results to console:

```bash
whimsical-data-formatter analyze data.csv
```

### Advanced Options

```bash
# Analyze with pattern detection and uniqueness checking
whimsical-data-formatter analyze --patterns --unique data.csv

# Analyze with a limited sample size
whimsical-data-formatter analyze --sample 1000 large-file.xlsx

# Save analysis results to a file
whimsical-data-formatter analyze --output analysis.json data.csv

# Specify file encoding
whimsical-data-formatter analyze --encoding utf-8 data.csv

# Analyze tab-delimited TXT file
whimsical-data-formatter analyze --detect-delimiter data.txt

# Analyze fixed-width TXT file
whimsical-data-formatter analyze --fixed-widths 4,10,4,14 fixed-width.txt

# Analyze XML file (includes attribute parsing)
whimsical-data-formatter analyze data.xml
```

### Command Line Options

- `-p, --patterns`: Enable pattern detection for string fields
- `-u, --unique`: Check for field uniqueness
- `-s, --sample <number>`: Number of records to sample
- `-e, --encoding <encoding>`: File encoding (default: utf-8)
- `-o, --output <file>`: Output file (default: stdout)
- `-d, --delimiter <char>`: Custom delimiter for TXT files
- `-w, --fixed-widths <numbers>`: Fixed-width column sizes for TXT files (comma-separated)
- `--detect-delimiter`: Auto-detect delimiter in TXT files

## Output Format

The tool generates a JSON output with the following structure:

```json
{
  "sourceType": "csv|excel|json|xml|txt",
  "totalRecords": 1000,
  "fields": [
    {
      "normalizedName": "user_id",
      "originalHeader": "User ID",
      "dataType": "string",
      "length": 8,
      "pattern": "alphanumeric",
      "isUnique": true,
      "examples": ["USER001", "USER002"]
    }
  ],
  "metadata": {
    "fileName": "data.csv",
    "dateAnalyzed": "2025-06-03T22:00:00.000Z",
    "version": "1.0.0"
  }
}
```

### Supported Data Types

- `string`: Basic string data
- `string.email`: Email addresses
- `string.phone`: Phone numbers
- `string.long`: Long text content
- `number.integer`: Whole numbers
- `number.float`: Decimal numbers
- `date`: Date values
- `boolean`: True/false values
- `null`: Empty or null values

### Pattern Types

- `alpha`: Alphabetic characters only
- `numeric`: Numbers only
- `alphanumeric`: Letters and numbers
- `alphanumeric+space`: Letters, numbers, and spaces

### Special Data Handling

- **IDs**: Fields containing "id" in their name are preserved as strings
- **Leading Zeros**: Numbers with leading zeros are preserved as strings
- **XML Attributes**: XML attributes are included as fields in the analysis
- **Fixed-Width TXT**: Supports both header and headerless fixed-width formats
- **Auto Headers**: Generates column names for headerless fixed-width files

## Development

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/whimsical-data-formatter.git

# Install dependencies
cd whimsical-data-formatter
npm install

# Build the project
npm run build

# Run tests
npm test
```

### Project Structure

```
src/
├── commands/        # CLI commands
├── parsers/        # File format parsers
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── __tests__/      # Test files
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Adding New File Formats

1. Create a new parser in `src/parsers/`
2. Extend the `BaseParser` class
3. Implement the `parse` and `supports` methods
4. Add tests in `src/__tests__/`
5. Update documentation to reflect new capabilities

## License

ISC

## Author

whimsicalcodingvibes

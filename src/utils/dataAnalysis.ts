export function detectDataType(value: any): string {
  if (value === null || value === undefined) return "null";
  if (typeof value === "boolean") return "boolean";
  const strValue = String(value);
  if (!isNaN(Date.parse(strValue)) && strValue.includes("-")) return "date";
  if (!isNaN(value) && typeof value !== "boolean") {
    return strValue.includes(".") ? "number.float" : "number.integer";
  }
  if (typeof value === "string") {
    if (/^\d{3}-\d{3}-\d{4}$/.test(value)) return "string.phone";
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "string.email";
    if (value.length > 100) return "string.long";
    return "string";
  }
  return "unknown";
}

export function detectPattern(values: any[]): string | undefined {
  if (values.length === 0) return undefined;

  const sample = values.slice(0, 10);
  const patterns = sample.map((value) => {
    if (typeof value !== "string") return undefined;

    if (/^\d+$/.test(value)) return "numeric";
    if (/^[A-Za-z]+$/.test(value)) return "alpha";
    if (/^[A-Za-z0-9]+$/.test(value)) return "alphanumeric";
    if (/^[A-Za-z0-9\s]+$/.test(value)) return "alphanumeric+space";
    return undefined;
  });

  const uniquePatterns = new Set(patterns);
  return uniquePatterns.size === 1 ? patterns[0] : undefined;
}

export function calculateFieldLength(values: any[]): number {
  if (values.length === 0) return 0;

  const lengths = values.map((value) => {
    if (value === null || value === undefined) return 0;
    return value.toString().length;
  });

  return Math.max(...lengths);
}

export function isFieldUnique(values: any[]): boolean {
  if (values.length === 0) return true;

  const uniqueValues = new Set(
    values.map((v) => (v === null || v === undefined ? "_NULL_" : v.toString()))
  );

  return uniqueValues.size === values.length;
}

export function normalizeFieldName(header: string): string {
  return header
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");
}

import { type ZodSchema, type ZodError } from "zod";

/**
 * Soft-validate data against a Zod schema.
 * In development, logs validation errors to console.
 * Always returns data as-is to avoid breaking production.
 */
export function safeValidate<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[safeValidate] Validation failed:", result.error.format());
    }
    return data as T;
  }
  return result.data;
}

/**
 * Strictly validate data against a Zod schema.
 * Throws on validation failure.
 */
export function strictValidate<T>(schema: ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Represents values that can be serialized by {@link serializeDates}.
 * Includes primitives, arrays, plain objects, and `Date` instances.
 */
type Serializable =
  | string
  | number
  | boolean
  | null
  | undefined
  | Date
  | Serializable[]
  | { [key: string]: Serializable };

/**
 * Recursively transforms all `Date` instances in a type `T` into ISO 8601 strings.
 *
 * @template T - The input type to transform.
 */
type Serialized<T> = T extends Date
  ? string
  : T extends (infer U)[]
    ? Serialized<U>[]
    : T extends object
      ? { [K in keyof T]: Serialized<T[K]> }
      : T;

/**
 * Recursively traverses the input and converts all `Date` instances to ISO 8601 strings.
 * Preserves the original structure of arrays and plain objects.
 *
 * Useful for preparing data to be serialized as JSON, especially for APIs or OpenAPI schemas
 * that expect dates as strings.
 *
 * @template T - The input type, which may contain nested `Date` objects.
 * @param input - The value to transform. Can be a primitive, array, or plain object.
 * @returns A new value with the same structure as `input`, but with all `Date` values converted to strings.
 *
 * @example
 * ```ts
 * const task = {
 *   id: 1,
 *   name: 'Test',
 *   createdAt: new Date(),
 *   tags: ['urgent', 'backend'],
 * };
 *
 * const serialized = serializeDates(task);
 * // {
 * //   id: 1,
 * //   name: 'Test',
 * //   createdAt: '2025-08-14T06:21:00.000Z',
 * //   tags: ['urgent', 'backend']
 * // }
 * ```
 */
export function serializeDates<T extends Serializable>(
  input: T,
): Serialized<T> {
  const transform = (obj: Serializable): Serializable => {
    if (obj instanceof Date) {
      return obj.toISOString();
    }

    if (Array.isArray(obj)) {
      return obj.map(transform);
    }

    if (obj && typeof obj === 'object' && obj.constructor === Object) {
      const result: Record<string, Serializable> = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = transform(value);
      }
      return result;
    }

    return obj;
  };

  return transform(input) as Serialized<T>;
}

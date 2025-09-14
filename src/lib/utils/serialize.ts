/**
 * Utility to serialize MongoDB documents for Next.js client components
 * Removes ObjectIds and toJSON methods that cause hydration issues
 */
export function serializeForClient<T>(data: T): T {
  return JSON.parse(JSON.stringify(data))
}

/**
 * Serialize an array of MongoDB documents
 */
export function serializeArrayForClient<T>(data: T[]): T[] {
  return JSON.parse(JSON.stringify(data))
}

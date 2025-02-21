import { AssertionError } from "assert";

/** This is factored rather than used from a library to support non-fatal prod assertions */
export function assert<T>(value: T|undefined|null): T {
  if (value === null || value === undefined) {
    // TODO: Graceful handling in Prod
    throw new AssertionError({
      expected: 'Something non-null and non-undefined',
      actual: value,
    });
  }
  return value;
}
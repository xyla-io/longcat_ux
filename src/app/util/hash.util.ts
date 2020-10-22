import * as stableStringify from 'json-stable-stringify';

export function computeHashForString(input: string): string {
  return String((() => {
    let hash = 0, i, chr;
    if (input.length === 0) { return hash; }
    for (i = 0; i < input.length; i++) {
      chr = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  })());
}

export function computeHashForObject(inputObject: object): string {
  const input = stableStringify(inputObject);
  return computeHashForString(input);
}

export function compareObjects(a: object, b: object): boolean {
  return (stableStringify(a) === stableStringify(b));
}

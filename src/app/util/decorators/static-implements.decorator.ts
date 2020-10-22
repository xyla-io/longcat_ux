/**
 * https://stackoverflow.com/a/43674389
 */
export function staticImplements<T>() {
  return <U extends T>(constructor: U) => {constructor};
}

/**
 * https://2ality.com/2020/04/classes-as-values-typescript.html
 */
export type Class<T> = new(...args: any[]) => T;
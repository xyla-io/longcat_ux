export class SetUtil {

  static union<T>(a: Set<T>, b: Set<T>): Set<T> {
    return new Set([...a, ...b]);
  }

  static intersection<T>(a: Set<T>, b: Set<T>): Set<T> {
    return new Set([...a].filter(x => b.has(x)));
  }

  static difference<T>(a: Set<T>, b: Set<T>): Set<T> {
    return new Set([...a].filter(x => !b.has(x)));
  }

}

export function Stopwatch() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value;
    descriptor.value = function (...args: any[]) {
      const t0 = performance.now();
      const result = original.apply(this, args);
      const t1 = performance.now();
      console.log(`Stopwatch: ${propertyKey}() took ${(t1 - t0).toFixed(2)} ms`);
      return result;
    };
    return descriptor;
  };
}
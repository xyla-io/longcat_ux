export function LogResult() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value;
    descriptor.value = function (...args: any[]) {
      const result = original.apply(this, args);
      console.log(`LogResult ${propertyKey}(): `, result);
      return result;
    };
    return descriptor;
  };
}
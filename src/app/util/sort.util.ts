export function sortByProp(items, prop) {
  return items.sort((a, b) => (a[prop] < b[prop]) ? -1 : 1);
}

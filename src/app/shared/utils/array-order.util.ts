export function moveItemInList<T extends { id: string }>(
  list: T[],
  id: string,
  direction: 'up' | 'down'
): T[] | null {
  const index = list.findIndex(item => item.id === id);
  if (index === -1) return null;
  const newIndex = direction === 'up' ? index - 1 : index + 1;
  if (newIndex < 0 || newIndex >= list.length) return null;
  const next = [...list];
  [next[index], next[newIndex]] = [next[newIndex], next[index]];
  return next;
}

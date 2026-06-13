export function formatSalary(value: string | number): string {
  if (!value) return '';
  const num = typeof value === 'string' ? Number(value.replace(/\D/g, '')) : value;
  if (isNaN(num)) return '';
  return num.toLocaleString('en-US');
}

export function normalizeSalary(value: string): string {
  return value.replace(/\D/g, '');
}
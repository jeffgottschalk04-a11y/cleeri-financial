// Small formatting utilities for monetary values
export const formatCurrency = (n: number, digits = 0): string => {
  const v = Number(n || 0);
  if (!Number.isFinite(v)) return formatCurrency(0, digits);
  return v.toLocaleString(undefined, { style: 'currency', currency: 'USD', minimumFractionDigits: digits, maximumFractionDigits: digits });
};

export const currency = (n: number) => formatCurrency(n, 0);

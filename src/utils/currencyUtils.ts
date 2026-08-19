/**
 * Utilidades para formateo de moneda estilo contabilidad mexicana ($1'000,000.00)
 * Millones separados por comilla simple (')
 * Millares separados por coma (,)
 * Centavos/decimales separados por punto (.)
 */

export function formatMXN(
  amount: number | string | null | undefined,
  includeSymbol: boolean = true,
  decimals: number = 2
): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : (amount ?? 0);
  if (isNaN(num)) {
    return includeSymbol ? '$0.00' : '0.00';
  }

  const isNegative = num < 0;
  const absNum = Math.abs(num);

  const fixedStr = absNum.toFixed(decimals);
  const parts = fixedStr.split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];

  let intResult = '';
  const len = integerPart.length;
  let count = 0;

  for (let i = len - 1; i >= 0; i--) {
    intResult = integerPart[i] + intResult;
    count++;
    if (count % 3 === 0 && i > 0) {
      if (count === 6 || count === 12) {
        intResult = "'" + intResult;
      } else {
        intResult = ',' + intResult;
      }
    }
  }

  const formattedDec = decimals > 0 && decimalPart !== undefined ? `.${decimalPart}` : '';
  const sign = isNegative ? '-' : '';
  const symbol = includeSymbol ? '$' : '';

  return `${sign}${symbol}${intResult}${formattedDec}`;
}

export function formatCurrencyMXN(
  amount: number | string | null | undefined,
  includeSymbol: boolean = true,
  decimals: number = 2
): string {
  return formatMXN(amount, includeSymbol, decimals);
}

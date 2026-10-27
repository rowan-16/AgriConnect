/**
 * Locale-aware internationalization formatters for Indian agricultural commerce.
 * Handles currency (₹ INR), localized calendar dates, and Indian numerical formatting.
 */

export const LOCALE_MAP: Record<string, string> = {
  en: 'en-IN',
  ta: 'ta-IN',
  hi: 'hi-IN',
  te: 'te-IN',
  ml: 'ml-IN',
  kn: 'kn-IN',
};

/**
 * Format numerical currency in Indian Rupees (₹) with appropriate locale digits and separators.
 */
export function formatCurrency(amount: number, language = 'en'): string {
  const locale = LOCALE_MAP[language] || 'en-IN';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `₹${amount.toLocaleString('en-IN')}`;
  }
}

/**
 * Format timestamp or date string into locale-aware localized dates.
 */
export function formatDate(
  dateValue: string | number | Date,
  language = 'en',
  options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }
): string {
  const locale = LOCALE_MAP[language] || 'en-IN';
  try {
    const d = typeof dateValue === 'string' || typeof dateValue === 'number' ? new Date(dateValue) : dateValue;
    if (isNaN(d.getTime())) return String(dateValue);
    return new Intl.DateTimeFormat(locale, options).format(d);
  } catch {
    return String(dateValue);
  }
}

/**
 * Format numbers with locale-appropriate grouping separators.
 */
export function formatNumber(value: number, language = 'en', options?: Intl.NumberFormatOptions): string {
  const locale = LOCALE_MAP[language] || 'en-IN';
  try {
    return new Intl.NumberFormat(locale, options).format(value);
  } catch {
    return value.toLocaleString('en-IN');
  }
}

/**
 * Shared helpers: formatPrice, formatClassTime, currency constants.
 * Change price/date formatting or currency here.
 */

export const CURRENCY_LABELS = { MXN: 'Mexican Peso (MXN)', CHF: 'Swiss Franc (CHF)', USD: 'US Dollar (USD)', COP: 'Colombian Peso (COP)' };
export const CURRENCY_SYMBOLS = { MXN: 'MX$', CHF: 'CHF ', USD: 'US$', COP: 'COP ' };

export const formatClassTime = (c) => (c && c.end_time ? `${c.time || ''} – ${c.end_time}` : (c && c.time) ? c.time : '');

export function formatPrice(price, currency) {
    const c = (currency || 'MXN').toUpperCase();
    const sym = CURRENCY_SYMBOLS[c] || 'MX$';
    const p = parseFloat(price);
    if (isNaN(p)) return sym + '0';
    const n = p;
    const formatted = Number.isInteger(n) ? n.toLocaleString() : parseFloat(n.toFixed(2)).toLocaleString();
    return sym + formatted;
}

/** Stub; overwritten by settings module when admin settings are loaded. */
export function getPlanExpiryUseFixedDate() {
    return false;
}

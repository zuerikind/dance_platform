/**
 * Central Stripe price ID resolver.
 *
 * Price IDs are stored as environment variables to keep them out of source code
 * and allow different IDs per environment (test vs. live).
 *
 * Naming convention: STRIPE_PRICE_{PLAN}_{CURRENCY}  (all uppercase)
 * Examples:
 *   STRIPE_PRICE_BASICO_MXN
 *   STRIPE_PRICE_INTERMEDIO_USD
 *   STRIPE_PRICE_AVANZADO_EUR
 */

export type PlanKey = 'basico' | 'intermedio' | 'avanzado';
export type Currency = 'MXN' | 'USD' | 'EUR' | 'COP' | 'CHF';

export const VALID_PLANS: readonly PlanKey[] = ['basico', 'intermedio', 'avanzado'] as const;
export const VALID_CURRENCIES: readonly Currency[] = ['MXN', 'USD', 'EUR', 'COP', 'CHF'] as const;

/**
 * Returns the Stripe price ID for the given plan/currency pair, or null if the
 * environment variable is not set.
 *
 * Never accepts a price ID from the frontend — the mapping is always resolved
 * server-side from trusted environment variables.
 */
export function getStripePriceId(plan: PlanKey, currency: Currency): string | null {
  const envKey = `STRIPE_PRICE_${plan.toUpperCase()}_${currency.toUpperCase()}`;
  return Deno.env.get(envKey) ?? null;
}

export function isValidPlan(value: unknown): value is PlanKey {
  return typeof value === 'string' && (VALID_PLANS as readonly string[]).includes(value);
}

export function isValidCurrency(value: unknown): value is Currency {
  return typeof value === 'string' && (VALID_CURRENCIES as readonly string[]).includes(value);
}


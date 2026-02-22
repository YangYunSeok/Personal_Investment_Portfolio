/**
 * Centralized calculation logic for transactions.
 */

/**
 * Calculates the amount in KRW based on trade amount and FX rate.
 * @param {number} tradeAmount Amount in trade currency
 * @param {string} currency Currency code (e.g., 'KRW', 'USD')
 * @param {number} fxRate Exchange rate (1 unit of currency = X KRW)
 * @returns {number} Amount in KRW
 */
function calculateAmountKrw(tradeAmount, currency, fxRate) {
  if (!tradeAmount) return 0;
  if (currency === "KRW") {
    return tradeAmount;
  }
  return tradeAmount * (fxRate || 0);
}

/**
 * Calculates trade amount from quantity and unit price if missing.
 * @param {object} transaction Transaction data
 * @returns {number|null} Calculated trade amount or original
 */
function resolveTradeAmount(transaction) {
  let { tradeAmount, quantity, unitPrice } = transaction;
  
  // If tradeAmount is not provided but quantity and unitPrice are, calculate it.
  if (!tradeAmount && quantity && unitPrice) {
    return quantity * unitPrice;
  }
  return tradeAmount;
}

module.exports = {
  calculateAmountKrw,
  resolveTradeAmount,
};

const pool = require("../db");

class PIPPOSHLDS01Service {
    async getPositions(filters) {
        let sql = `
      SELECT 
        TX_ID AS id,
        TX_DT AS tradeDate,
        ACCOUNT_ID AS accountId,
        ASSET_ID AS assetId,
        TX_TP_CD AS transactionType,
        ASSET_TP_CD AS assetType,
        EXPOSURE_REGION AS exposureRegion,
        QTY AS quantity,
        UNIT_PRC AS unitPrice,
        AMT AS tradeAmount,
        TX_CCY_CD AS tradeCurrency,
        FX_RATE AS fxRate,
        FROM_CCY_CD AS fromCurrency,
        TO_CCY_CD AS toCurrency
      FROM PIP_TRANSACTIONS
      WHERE DEL_YN = 'N'
    `;
        const params = [];

        // asOf Date filtering
        if (filters.asOf) {
            sql += " AND TX_DT <= ?";
            params.push(filters.asOf);
        }

        // Sort chronologically for correct cost basis calculation
        sql += " ORDER BY TX_DT ASC, TX_ID ASC";

        const [transactions] = await pool.query(sql, params);

        // Fetch master assets config if needed or we can join later
        const [assets] = await pool.query("SELECT ASSET_ID, ASSET_NM FROM PIP_ASSETS WHERE DEL_YN = 'N'");
        const assetNameMap = {};
        assets.forEach(a => assetNameMap[a.ASSET_ID] = a.ASSET_NM);

        // Aggregate positions
        const posMap = {};
        // Also track latest FX rates for each currency (up to asOf)
        const latestFxRates = {};

        transactions.forEach(tx => {
            // Track FX Rate
            if (tx.tradeCurrency && tx.tradeCurrency !== "KRW" && tx.fxRate) {
                latestFxRates[tx.tradeCurrency] = tx.fxRate;
            }

            // Handle Asset Positions (Stock, ETF, etc.)
            if (tx.assetId && !tx.assetId.startsWith("FX:") && tx.transactionType !== "FX" && tx.transactionType !== "DEPOSIT" && tx.transactionType !== "WITHDRAW" && tx.transactionType !== "FEE" && tx.transactionType !== "TAX" && tx.transactionType !== "DIVIDEND" && tx.transactionType !== "INTEREST") {
                const key = `${tx.accountId}_${tx.assetId}_${tx.tradeCurrency}`;
                if (!posMap[key]) {
                    let aType = tx.assetType || "Stock";
                    let exp = tx.exposureRegion || "GLOBAL";
                    posMap[key] = {
                        accountId: tx.accountId,
                        assetId: tx.assetId,
                        assetName: assetNameMap[tx.assetId] || tx.assetId,
                        assetType: aType,
                        exposure: exp,
                        currency: tx.tradeCurrency,
                        quantity: 0,
                        costBasis: 0,
                        avgUnitCost: 0
                    };
                }

                const p = posMap[key];

                switch (tx.transactionType) {
                    case 'BUY':
                        p.quantity += Number(tx.quantity || 0);
                        p.costBasis += Number(tx.tradeAmount || 0);
                        if (p.quantity > 0) {
                            p.avgUnitCost = p.costBasis / p.quantity;
                        }
                        break;
                    case 'SELL':
                        const sellQty = Number(tx.quantity || 0);
                        const proportionalCost = p.avgUnitCost * sellQty;
                        p.quantity -= sellQty;
                        p.costBasis -= proportionalCost;
                        if (p.quantity <= 0) {
                            p.quantity = 0;
                            p.costBasis = 0;
                            p.avgUnitCost = 0;
                        }
                        break;
                }
            }

            // Handle Cash Positions
            // Rules:
            // BUY -> -Cash in tradeCurrency
            // SELL -> +Cash in tradeCurrency
            // DIVIDEND/INTEREST -> +Cash in tradeCurrency
            // FEE/TAX -> -Cash in tradeCurrency
            // DEPOSIT -> +Cash in tradeCurrency
            // WITHDRAW -> -Cash in tradeCurrency
            // FX -> -fromCurrency amount, +toCurrency amount
            const applyCash = (accId, ccy, amount) => {
                if (!ccy || amount === 0) return;
                const ccyAssetId = ccy === "KRW" ? "KRW Cash" : "FX Cash";
                let ccyAssetType = ccy === "KRW" ? "KRW Cash" : "FX Cash";
                let ccyExp = ccy === "KRW" ? "KR" : "GLOBAL";

                // Distinguish specific currency to have distinct keys
                const key = `${accId}_${ccy}_CASH`;
                if (!posMap[key]) {
                    posMap[key] = {
                        accountId: accId,
                        assetId: ccyAssetId,
                        assetName: ccy,
                        assetType: ccyAssetType,
                        exposure: ccyExp,
                        currency: ccy,
                        quantity: 0,
                        costBasis: 0,
                        avgUnitCost: null
                    };
                }
                posMap[key].quantity += amount;
                posMap[key].costBasis += amount;
            };

            const amt = Number(tx.tradeAmount || 0);

            switch (tx.transactionType) {
                case 'BUY':
                    applyCash(tx.accountId, tx.tradeCurrency, -amt);
                    break;
                case 'SELL':
                case 'DIVIDEND':
                case 'INTEREST':
                case 'DEPOSIT':
                    applyCash(tx.accountId, tx.tradeCurrency, amt);
                    break;
                case 'FEE':
                case 'TAX':
                case 'WITHDRAW':
                    applyCash(tx.accountId, tx.tradeCurrency, -amt);
                    break;
                case 'FX':
                    applyCash(tx.accountId, tx.fromCurrency || tx.tradeCurrency, -amt);
                    let toAmt = 0;
                    if (tx.fromCurrency === "KRW") {
                        // KRW to FX -> tradeAmount is KRW, toAmt is FX qty. amt / fxRate
                        toAmt = tx.fxRate ? amt / Number(tx.fxRate) : amt;
                    } else if (tx.toCurrency === "KRW") {
                        // FX to KRW -> tradeAmount is FX, toAmt is KRW
                        toAmt = amt * Number(tx.fxRate || 1);
                    } else {
                        // FX to FX without KRW... maybe amt * fxRate
                        toAmt = amt * Number(tx.fxRate || 1);
                    }
                    applyCash(tx.accountId, tx.toCurrency, toAmt);
                    break;
            }
        });

        let results = Object.values(posMap)
            .filter(p => Math.abs(p.quantity) >= 0.0001); // Filter out zero positions due to floating point

        // Apply currency conversions
        results = results.map(p => {
            let fxRateToKRW = p.currency === "KRW" ? 1 : (latestFxRates[p.currency] || 1);
            return {
                ...p,
                fxRateToKRW: p.currency === "KRW" ? undefined : fxRateToKRW,
                costBasisKRW: p.costBasis * fxRateToKRW
            };
        });

        // Apply Post-Filters
        if (filters.accountId) {
            results = results.filter(p => p.accountId === filters.accountId);
        }
        if (filters.exposure) {
            results = results.filter(p => p.exposure === filters.exposure);
        }
        if (filters.assetType) {
            results = results.filter(p => p.assetType === filters.assetType);
        }
        if (filters.q) {
            const qLower = filters.q.toLowerCase();
            results = results.filter(p =>
                (p.assetName && p.assetName.toLowerCase().includes(qLower)) ||
                (p.assetId && p.assetId.toLowerCase().includes(qLower))
            );
        }

        return results;
    }
}

module.exports = PIPPOSHLDS01Service;

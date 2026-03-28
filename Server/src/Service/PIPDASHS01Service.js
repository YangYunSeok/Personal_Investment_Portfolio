/**
 * ──────────────────────────────────────────────
 * Screen ID : PIPDASHS01
 * Screen Name : Dashboard (대시보드)
 * Purpose : 포트폴리오 요약 정보 조회 (조회 전용)
 * API : GET /api/pip/dashboard
 * SSOT Docs : PIPDASHS01_API.md, PIPDASHS01_MODEL.md, PIP_DB_SNAPSHOT.md
 * Rules :
 *   - 계산 결과 저장 금지
 *   - Dashboard 전용 테이블 생성 금지
 *   - View / Query 조합만 허용
 * ──────────────────────────────────────────────
 */

const pool = require("../db");

class PIPDASHS01Service {
    /**
     * 대시보드 요약 데이터를 PIP_TRANSACTIONS 원장에서 집계하여 반환한다.
     * - portfolioSummary: 총 자산, 투자 원금, 평가 손익, 수익률
     * - assetAllocations: 자산 유형별 비중
     * - regionExposures: 지역별 비중
     */
    async getDashboard() {
        // 1) 원장 조회 (DEL_YN = 'N')
        const [transactions] = await pool.query(`
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
            ORDER BY TX_DT ASC, TX_ID ASC
        `);

        // 2) 자산 마스터 조회 (이름 매핑)
        const [assets] = await pool.query("SELECT ASSET_ID, ASSET_NM FROM PIP_ASSETS WHERE DEL_YN = 'N'");
        const assetNameMap = {};
        assets.forEach(a => assetNameMap[a.ASSET_ID] = a.ASSET_NM);

        // 3) 포지션 집계 (PIPPOSHLDS01Service와 동일한 계산 로직)
        const posMap = {};
        const latestFxRates = {};

        transactions.forEach(tx => {
            // 최신 환율 추적
            if (tx.tradeCurrency && tx.tradeCurrency !== "KRW" && tx.fxRate) {
                latestFxRates[tx.tradeCurrency] = Number(tx.fxRate);
            }

            // 자산 포지션 (BUY/SELL)
            if (tx.assetId && !tx.assetId.startsWith("FX:")
                && tx.transactionType !== "FX"
                && tx.transactionType !== "DEPOSIT"
                && tx.transactionType !== "WITHDRAW"
                && tx.transactionType !== "FEE"
                && tx.transactionType !== "TAX"
                && tx.transactionType !== "DIVIDEND"
                && tx.transactionType !== "INTEREST") {

                const key = `${tx.accountId}_${tx.assetId}_${tx.tradeCurrency}`;
                if (!posMap[key]) {
                    posMap[key] = {
                        accountId: tx.accountId,
                        assetId: tx.assetId,
                        assetType: tx.assetType || "Stock",
                        exposure: tx.exposureRegion || "GLOBAL",
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
                    case 'SELL': {
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
            }

            // 현금 포지션
            const applyCash = (accId, ccy, amount) => {
                if (!ccy || amount === 0) return;
                const ccyAssetType = ccy === "KRW" ? "Cash" : "Cash";
                const ccyExp = ccy === "KRW" ? "KR" : "GLOBAL";
                const key = `${accId}_${ccy}_CASH`;
                if (!posMap[key]) {
                    posMap[key] = {
                        accountId: accId,
                        assetId: `${ccy}_CASH`,
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
                    {
                        let toAmt = 0;
                        if (tx.fromCurrency === "KRW") {
                            toAmt = tx.fxRate ? amt / Number(tx.fxRate) : amt;
                        } else if (tx.toCurrency === "KRW") {
                            toAmt = amt * Number(tx.fxRate || 1);
                        } else {
                            toAmt = amt * Number(tx.fxRate || 1);
                        }
                        applyCash(tx.accountId, tx.toCurrency, toAmt);
                    }
                    break;
            }
        });

        // 4) 포지션을 KRW로 환산하고 집계
        const positions = Object.values(posMap)
            .filter(p => Math.abs(p.quantity) >= 0.0001);

        let totalAssetKrw = 0;
        let totalInvestedKrw = 0;

        // assetType별 집계
        const assetTypeMap = {};
        // region별 집계
        const regionMap = {};

        positions.forEach(p => {
            const fxRate = p.currency === "KRW" ? 1 : (latestFxRates[p.currency] || 1);
            const costBasisKRW = p.costBasis * fxRate;

            totalAssetKrw += costBasisKRW;

            // 투자 원금: BUY로 투입된 금액 기준 (costBasis가 양수인 것만)
            if (costBasisKRW > 0) {
                totalInvestedKrw += costBasisKRW;
            }

            // assetType 집계
            const aType = p.assetType || "기타";
            if (!assetTypeMap[aType]) {
                assetTypeMap[aType] = 0;
            }
            assetTypeMap[aType] += Math.abs(costBasisKRW);

            // region 집계
            const region = p.exposure || "GLOBAL";
            if (!regionMap[region]) {
                regionMap[region] = 0;
            }
            regionMap[region] += Math.abs(costBasisKRW);
        });

        // 5) 수익률 계산
        const totalPnLKrw = totalAssetKrw - totalInvestedKrw;
        const totalReturnRate = totalInvestedKrw !== 0
            ? (totalPnLKrw / Math.abs(totalInvestedKrw)) * 100
            : 0;

        // 6) assetAllocations 배열
        const assetTotal = Object.values(assetTypeMap).reduce((s, v) => s + v, 0);
        const assetAllocations = Object.entries(assetTypeMap).map(([assetType, valueKrw]) => ({
            assetType,
            valueKrw: Math.round(valueKrw * 100) / 100,
            ratio: assetTotal > 0
                ? Math.round((valueKrw / assetTotal) * 10000) / 100
                : 0
        }));

        // 7) regionExposures 배열
        const regionTotal = Object.values(regionMap).reduce((s, v) => s + v, 0);
        const regionExposures = Object.entries(regionMap).map(([region, valueKrw]) => ({
            region,
            valueKrw: Math.round(valueKrw * 100) / 100,
            ratio: regionTotal > 0
                ? Math.round((valueKrw / regionTotal) * 10000) / 100
                : 0
        }));

        return {
            portfolioSummary: {
                totalAssetKrw: Math.round(totalAssetKrw * 100) / 100,
                totalInvestedKrw: Math.round(totalInvestedKrw * 100) / 100,
                totalPnLKrw: Math.round(totalPnLKrw * 100) / 100,
                totalReturnRate: Math.round(totalReturnRate * 100) / 100
            },
            assetAllocations,
            regionExposures
        };
    }
}

module.exports = PIPDASHS01Service;

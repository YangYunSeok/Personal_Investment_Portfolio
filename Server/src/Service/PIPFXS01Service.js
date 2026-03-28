/**
 * Screen ID: PIPFXS01
 * Screen Name: 환전 (Exchange)
 * Purpose: 환전 활동 DB 처리 (단일 원장 저장 기반)
 * Related SSOT:
 *  - docs/design/model/PIPFXS01_MODEL.md
 *  - docs/design/db/PIP_DB_SNAPSHOT.md
 * Rules:
 *  - 환차손익, 기타 계산 잔액 등은 절대 저장하지 않음.
 *  - PIP_TRANSACTIONS의 transaction_type='FX'로만 기록
 */
const pool = require("../db");

class PIPFXS01Service {
    /**
     * List FX transactions with filters.
     */
    async list(filters) {
        let sql = `
      SELECT 
        TX_ID AS transactionId,
        TX_DT AS tradeDate,
        ACCOUNT_ID AS accountId,
        TX_TP_CD AS transactionType,
        AMT AS tradeAmount,
        TX_CCY_CD AS tradeCurrency,
        FX_RATE AS fxRate,
        FROM_CCY_CD AS fromCurrency,
        TO_CCY_CD AS toCurrency,
        MEMO AS memo,
        DEL_YN AS delYn,
        REG_DT AS regDt,
        MOD_DT AS modDt
      FROM PIP_TRANSACTIONS
      WHERE TX_TP_CD = 'FX'
    `;
        const params = [];

        if (filters.includeDeleted !== true) {
            sql += " AND DEL_YN = 'N'";
        }

        if (filters.fromDate) {
            sql += " AND TX_DT >= ?";
            params.push(filters.fromDate);
        }
        if (filters.toDate) {
            sql += " AND TX_DT <= ?";
            params.push(filters.toDate);
        }
        if (filters.accountId) {
            sql += " AND ACCOUNT_ID = ?";
            params.push(filters.accountId);
        }
        if (filters.fromCurrency) {
            sql += " AND FROM_CCY_CD = ?";
            params.push(filters.fromCurrency);
        }
        if (filters.toCurrency) {
            sql += " AND TO_CCY_CD = ?";
            params.push(filters.toCurrency);
        }

        sql += " ORDER BY TX_DT DESC, TX_ID DESC";

        const [rows] = await pool.query(sql, params);

        // DB의 값을 API Response 모델에 맞게 변환하여 리턴
        return rows.map(row => ({
            transactionId: row.transactionId,
            tradeDate: row.tradeDate,
            accountId: row.accountId,
            fromCurrency: row.fromCurrency,
            toCurrency: row.toCurrency,
            tradeAmount: Number(row.tradeAmount),
            tradeCurrency: row.tradeCurrency,
            fxRate: Number(row.fxRate),
            memo: row.memo
        }));
    }

    async getById(id) {
        const sql = `
      SELECT 
        TX_ID AS transactionId,
        TX_DT AS tradeDate,
        ACCOUNT_ID AS accountId,
        AMT AS tradeAmount,
        TX_CCY_CD AS tradeCurrency,
        FX_RATE AS fxRate,
        FROM_CCY_CD AS fromCurrency,
        TO_CCY_CD AS toCurrency,
        MEMO AS memo
      FROM PIP_TRANSACTIONS
      WHERE TX_ID = ? AND TX_TP_CD = 'FX'
    `;
        const [rows] = await pool.query(sql, [id]);
        if (rows.length === 0) return null;

        const row = rows[0];
        return {
            transactionId: row.transactionId,
            tradeDate: row.tradeDate,
            accountId: row.accountId,
            fromCurrency: row.fromCurrency,
            toCurrency: row.toCurrency,
            tradeAmount: Number(row.tradeAmount),
            tradeCurrency: row.tradeCurrency,
            fxRate: Number(row.fxRate),
            memo: row.memo
        };
    }

    async create(data) {
        const sql = `
      INSERT INTO PIP_TRANSACTIONS (
        TX_DT, ACCOUNT_ID, TX_TP_CD, 
        AMT, TX_CCY_CD, FX_RATE, FROM_CCY_CD, TO_CCY_CD, MEMO, DEL_YN
      ) VALUES (?, ?, 'FX', ?, ?, ?, ?, ?, ?, 'N')
    `;
        const params = [
            data.tradeDate,
            data.accountId,
            data.tradeAmount,
            data.tradeCurrency,
            data.fxRate,
            data.fromCurrency,
            data.toCurrency,
            data.memo || null
        ];

        const [result] = await pool.query(sql, params);
        return this.getById(result.insertId);
    }

    async getMetadata() {
        const [accounts] = await pool.query("SELECT ACCOUNT_ID AS accountId, ACCOUNT_NM AS accountName FROM PIP_ACCOUNTS WHERE DEL_YN = 'N'");
        const [currencyRows] = await pool.query(
            "SELECT CD_ID AS codeId, CD_NM AS codeName FROM PIP_CM_CD WHERE CD_GRP_ID = 'TX_CCY_CD' AND USE_YN = 'Y' AND DEL_YN = 'N' ORDER BY SORT_ORD ASC, CD_ID ASC"
        );
        const currencies = currencyRows.map(r => r.codeId);
        return { accounts, currencies };
    }
}

module.exports = PIPFXS01Service;

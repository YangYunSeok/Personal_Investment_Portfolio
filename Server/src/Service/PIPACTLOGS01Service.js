const pool = require("../db");
const { calculateAmountKrw, resolveTradeAmount } = require("../utils/transactionCalculator");

class PIPACTLOGS01Service {
  /**
   * List transactions with filters.
   */
  async list(filters) {
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
        TO_CCY_CD AS toCurrency,
        MEMO AS memo,
        DEL_YN AS delYn,
        REG_DT AS regDt,
        MOD_DT AS modDt
      FROM pip_transactions
      WHERE 1=1
    `;
    const params = [];

    if (filters.includeDeleted !== true) {
      sql += " AND DEL_YN = 'N'";
    }

    if (filters.from) {
      sql += " AND TX_DT >= ?";
      params.push(filters.from);
    }
    if (filters.to) {
      sql += " AND TX_DT <= ?";
      params.push(filters.to);
    }
    if (filters.accountId) {
      sql += " AND ACCOUNT_ID = ?";
      params.push(filters.accountId);
    }
    if (filters.assetType) {
      sql += " AND ASSET_TP_CD = ?";
      params.push(filters.assetType);
    }
    if (filters.exposureRegion) {
      sql += " AND EXPOSURE_REGION = ?";
      params.push(filters.exposureRegion);
    }
    if (filters.transactionType) {
      sql += " AND TX_TP_CD = ?";
      params.push(filters.transactionType);
    }
    if (filters.tradeCurrency) {
      sql += " AND TX_CCY_CD = ?";
      params.push(filters.tradeCurrency);
    }
    if (filters.keyword) {
      sql += " AND (MEMO LIKE ? OR ASSET_ID LIKE ?)";
      params.push(`%${filters.keyword}%`, `%${filters.keyword}%`);
    }

    sql += " ORDER BY TX_DT DESC, TX_ID DESC";

    const [rows] = await pool.query(sql, params);

    // Calculate amountKrw for response
    return rows.map(row => ({
      ...row,
      amountKrw: calculateAmountKrw(row.tradeAmount, row.tradeCurrency, row.fxRate)
    }));
  }

  async getById(id) {
    const sql = `
      SELECT 
        TX_ID AS id, TX_DT AS tradeDate, ACCOUNT_ID AS accountId, ASSET_ID AS assetId,
        TX_TP_CD AS transactionType, ASSET_TP_CD AS assetType, EXPOSURE_REGION AS exposureRegion,
        QTY AS quantity, UNIT_PRC AS unitPrice, AMT AS tradeAmount,
        TX_CCY_CD AS tradeCurrency, FX_RATE AS fxRate, FROM_CCY_CD AS fromCurrency,
        TO_CCY_CD AS toCurrency, MEMO AS memo, DEL_YN AS delYn
      FROM pip_transactions
      WHERE TX_ID = ?
    `;
    const [rows] = await pool.query(sql, [id]);
    if (rows.length === 0) return null;
    
    const row = rows[0];
    return {
      ...row,
      amountKrw: calculateAmountKrw(row.tradeAmount, row.tradeCurrency, row.fxRate)
    };
  }

  async create(data) {
    // Determine trade amount if missing
    const tradeAmount = resolveTradeAmount({
      tradeAmount: data.tradeAmount,
      quantity: data.quantity,
      unitPrice: data.unitPrice
    });

    const sql = `
      INSERT INTO pip_transactions (
        TX_DT, ACCOUNT_ID, ASSET_ID, TX_TP_CD, ASSET_TP_CD, EXPOSURE_REGION,
        QTY, UNIT_PRC, AMT, TX_CCY_CD, FX_RATE, FROM_CCY_CD, TO_CCY_CD, MEMO, DEL_YN
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'N')
    `;
    const params = [
      data.tradeDate, data.accountId, data.assetId || null, data.transactionType,
      data.assetType, data.exposureRegion, data.quantity || null, data.unitPrice || null,
      tradeAmount || 0, data.tradeCurrency, data.fxRate || null,
      data.fromCurrency || null, data.toCurrency || null, data.memo || null
    ];

    const [result] = await pool.query(sql, params);
    return this.getById(result.insertId);
  }

  async update(id, data) {
    const tradeAmount = resolveTradeAmount({
      tradeAmount: data.tradeAmount,
      quantity: data.quantity,
      unitPrice: data.unitPrice
    });

    const sql = `
      UPDATE pip_transactions SET
        TX_DT = ?, ACCOUNT_ID = ?, ASSET_ID = ?, TX_TP_CD = ?, ASSET_TP_CD = ?,
        EXPOSURE_REGION = ?, QTY = ?, UNIT_PRC = ?, AMT = ?, TX_CCY_CD = ?,
        FX_RATE = ?, FROM_CCY_CD = ?, TO_CCY_CD = ?, MEMO = ?,
        MOD_DT = CURRENT_TIMESTAMP(3)
      WHERE TX_ID = ?
    `;
    const params = [
      data.tradeDate, data.accountId, data.assetId || null, data.transactionType,
      data.assetType, data.exposureRegion, data.quantity || null, data.unitPrice || null,
      tradeAmount || 0, data.tradeCurrency, data.fxRate || null,
      data.fromCurrency || null, data.toCurrency || null, data.memo || null,
      id
    ];

    await pool.query(sql, params);
    return this.getById(id);
  }

  async softDelete(id) {
    const sql = `UPDATE pip_transactions SET DEL_YN = 'Y', MOD_DT = CURRENT_TIMESTAMP(3) WHERE TX_ID = ?`;
    await pool.query(sql, [id]);
    return true;
  }

  async getMetadata() {
    const [accounts] = await pool.query("SELECT ACCOUNT_ID AS id, ACCOUNT_NM AS name FROM pip_accounts WHERE DEL_YN = 'N'");
    const [assets] = await pool.query("SELECT ASSET_ID AS id, ASSET_NM AS name FROM pip_assets WHERE DEL_YN = 'N'");
    return { accounts, assets };
  }
}

module.exports = PIPACTLOGS01Service;

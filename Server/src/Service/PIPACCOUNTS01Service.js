const pool = require("../db");

class PIPACCOUNTS01Service {
  /**
   * List accounts.
   */
  async list(filters = {}) {
    let sql = `
      SELECT 
        ACCOUNT_ID AS id,
        ACCOUNT_NM AS name,
        BROKER_NM AS broker,
        BASE_CCY_CD AS currency,
        DEL_YN AS delYn,
        REG_DT AS regDt,
        MOD_DT AS modDt
      FROM PIP_ACCOUNTS
      WHERE 1=1
    `;
    const params = [];

    if (filters.includeDeleted !== true) {
      sql += " AND DEL_YN = 'N'";
    }

    if (filters.keyword) {
      sql += " AND (ACCOUNT_NM LIKE ? OR BROKER_NM LIKE ?)";
      params.push(`%${filters.keyword}%`, `%${filters.keyword}%`);
    }

    sql += " ORDER BY REG_DT DESC";

    const [rows] = await pool.query(sql, params);
    return rows;
  }

  async getById(id) {
    const sql = `
      SELECT 
        ACCOUNT_ID AS id, ACCOUNT_NM AS name, BROKER_NM AS broker,
        BASE_CCY_CD AS currency, DEL_YN AS delYn
      FROM PIP_ACCOUNTS
      WHERE ACCOUNT_ID = ?
    `;
    const [rows] = await pool.query(sql, [id]);
    if (rows.length === 0) return null;
    return rows[0];
  }

  async create(data) {
    const sql = `
      INSERT INTO PIP_ACCOUNTS (
        ACCOUNT_ID, ACCOUNT_NM, BROKER_NM, BASE_CCY_CD, DEL_YN
      ) VALUES (?, ?, ?, ?, 'N')
    `;
    const params = [
      data.id, data.name, data.broker || null, data.currency || "KRW"
    ];

    await pool.query(sql, params);
    return this.getById(data.id);
  }

  async update(id, data) {
    const sql = `
      UPDATE PIP_ACCOUNTS SET
        ACCOUNT_NM = ?, BROKER_NM = ?, BASE_CCY_CD = ?,
        MOD_DT = CURRENT_TIMESTAMP(3)
      WHERE ACCOUNT_ID = ?
    `;
    const params = [
      data.name, data.broker || null, data.currency || "KRW", id
    ];

    await pool.query(sql, params);
    return this.getById(id);
  }

  async softDelete(id) {
    const sql = `UPDATE PIP_ACCOUNTS SET DEL_YN = 'Y', MOD_DT = CURRENT_TIMESTAMP(3) WHERE ACCOUNT_ID = ?`;
    await pool.query(sql, [id]);
    return true;
  }

  async restore(id) {
    const sql = `UPDATE PIP_ACCOUNTS SET DEL_YN = 'N', MOD_DT = CURRENT_TIMESTAMP(3) WHERE ACCOUNT_ID = ?`;
    await pool.query(sql, [id]);
    return true;
  }
}

module.exports = PIPACCOUNTS01Service;

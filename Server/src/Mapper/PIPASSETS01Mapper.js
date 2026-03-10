const pool = require("../db");

class PIPASSETS01Mapper {
  async list({ assetType, exposureRegion, keyword, includeDeleted }) {
    let query = `
      SELECT 
        ASSET_ID AS assetId,
        ASSET_NM AS assetName,
        ASSET_TP_CD AS assetType,
        EXPOSURE_REGION AS exposureRegion,
        TRADE_CCY_CD AS currency,
        DEL_YN AS deleted,
        REG_DT AS createdAt,
        MOD_DT AS updatedAt
      FROM PIP_ASSETS
      WHERE 1=1
    `;
    const params = [];

    if (!includeDeleted) {
      query += ` AND DEL_YN = 'N'`;
    }

    if (assetType) {
      query += ` AND ASSET_TP_CD = ?`;
      params.push(assetType);
    }

    if (exposureRegion) {
      query += ` AND EXPOSURE_REGION = ?`;
      params.push(exposureRegion);
    }

    if (keyword) {
      query += ` AND ASSET_NM LIKE ?`;
      params.push(`%${keyword}%`);
    }

    query += ` ORDER BY ASSET_ID ASC`;

    const [rows] = await pool.query(query, params);
    return rows.map((r) => ({ ...r, deleted: r.deleted === "Y" }));
  }

  async findById(assetId) {
    const query = `
      SELECT 
        ASSET_ID AS assetId,
        ASSET_NM AS assetName,
        ASSET_TP_CD AS assetType,
        EXPOSURE_REGION AS exposureRegion,
        TRADE_CCY_CD AS currency,
        DEL_YN AS deleted,
        REG_DT AS createdAt,
        MOD_DT AS updatedAt
      FROM PIP_ASSETS
      WHERE ASSET_ID = ?
    `;
    const [rows] = await pool.query(query, [assetId]);
    if (rows.length === 0) return null;
    const r = rows[0];
    return { ...r, deleted: r.deleted === "Y" };
  }

  async create(payload) {
    const query = `
      INSERT INTO PIP_ASSETS 
        (ASSET_ID, ASSET_NM, ASSET_TP_CD, EXPOSURE_REGION, TRADE_CCY_CD, DEL_YN)
      VALUES (?, ?, ?, ?, ?, 'N')
    `;
    await pool.query(query, [
      payload.assetId,
      payload.assetName,
      payload.assetType,
      payload.exposureRegion,
      payload.currency,
    ]);
    return this.findById(payload.assetId);
  }

  async update(assetId, payload) {
    const query = `
      UPDATE PIP_ASSETS
      SET 
        ASSET_NM = ?,
        ASSET_TP_CD = ?,
        EXPOSURE_REGION = ?,
        TRADE_CCY_CD = ?,
        MOD_DT = CURRENT_TIMESTAMP(3)
      WHERE ASSET_ID = ?
    `;
    await pool.query(query, [
      payload.assetName,
      payload.assetType,
      payload.exposureRegion,
      payload.currency,
      assetId,
    ]);
    return this.findById(assetId);
  }

  async softDelete(assetId) {
    const query = `
      UPDATE PIP_ASSETS
      SET DEL_YN = 'Y', MOD_DT = CURRENT_TIMESTAMP(3)
      WHERE ASSET_ID = ?
    `;
    await pool.query(query, [assetId]);
    return this.findById(assetId);
  }

  async restore(assetId) {
    const query = `
      UPDATE PIP_ASSETS
      SET DEL_YN = 'N', MOD_DT = CURRENT_TIMESTAMP(3)
      WHERE ASSET_ID = ?
    `;
    await pool.query(query, [assetId]);
    return this.findById(assetId);
  }
}

module.exports = PIPASSETS01Mapper;

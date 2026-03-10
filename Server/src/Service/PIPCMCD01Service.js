/**
 * 공통코드 서비스
 * Purpose: PIP_CM_CD 테이블 기반 공통코드 조회/관리
 * 테이블: PIP_CM_CD
 */
const pool = require("../db");

function mapCodeRow(row) {
  if (!row) return null;

  return {
    ...row,
    sortOrder: row.sortOrder == null ? 0 : Number(row.sortOrder),
  };
}

class PIPCMCD01Service {
  getCodeSelectSql() {
    return `
      SELECT
          CD_GRP_ID   AS codeGroupId
        , CD_ID       AS codeId
        , CD_NM       AS codeName
        , CD_DESC     AS codeDesc
        , SORT_ORD    AS sortOrder
        , USE_YN      AS useYn
        , DEL_YN      AS delYn
        , ATTR_VAL1   AS attrVal1
        , ATTR_VAL2   AS attrVal2
        , ATTR_VAL3   AS attrVal3
        , REG_DT      AS regDt
        , MOD_DT      AS modDt
      FROM PIP_CM_CD
    `;
  }

  /**
   * 코드그룹 목록 조회
   * @param {{ includeDeleted?: boolean }} options
   * @returns {Promise<Array>}
   */
  async getGroupSummaries(options = {}) {
    const { includeDeleted = false } = options;
    const sql = `
      SELECT
          CD_GRP_ID AS codeGroupId
        , COUNT(*) AS totalCount
        , SUM(CASE WHEN USE_YN = 'Y' AND DEL_YN = 'N' THEN 1 ELSE 0 END) AS activeCount
        , MAX(MOD_DT) AS modDt
      FROM PIP_CM_CD
      ${includeDeleted ? "" : "WHERE DEL_YN = 'N'"}
      GROUP BY CD_GRP_ID
      ORDER BY CD_GRP_ID ASC
    `;

    const [rows] = await pool.query(sql);
    return rows.map(row => ({
      codeGroupId: row.codeGroupId,
      totalCount: Number(row.totalCount || 0),
      activeCount: Number(row.activeCount || 0),
      modDt: row.modDt,
    }));
  }

  /**
   * 단일 코드그룹 조회
   * @param {string} cdGrpId - 코드그룹ID (예: ASSET_TYPE)
   * @param {{ activeOnly?: boolean, includeDeleted?: boolean }} options
   * @returns {Promise<Array>}
   */
  async getCodesByGroup(cdGrpId, options = {}) {
    const { activeOnly = true, includeDeleted = false } = options;
    const conditions = ["CD_GRP_ID = ?"];
    const params = [cdGrpId];

    if (activeOnly) {
      conditions.push("USE_YN = 'Y'");
    }
    if (!includeDeleted) {
      conditions.push("DEL_YN = 'N'");
    }

    const sql = `
      ${this.getCodeSelectSql()}
      WHERE ${conditions.join(" AND ")}
      ORDER BY SORT_ORD ASC, CD_ID ASC
    `;
    const [rows] = await pool.query(sql, params);
    return rows.map(mapCodeRow);
  }

  /**
   * 다건 코드그룹 조회
   * @param {string[]} cdGrpIds - 코드그룹ID 배열 (예: ['ASSET_TYPE', 'EXPOSURE_REGION', 'TX_CCY_CD'])
   * @param {{ activeOnly?: boolean, includeDeleted?: boolean }} options
   * @returns {Promise<Object>} { ASSET_TYPE: [...], EXPOSURE_REGION: [...], ... }
   */
  async getCodesByGroups(cdGrpIds, options = {}) {
    if (!Array.isArray(cdGrpIds) || cdGrpIds.length === 0) {
      return {};
    }

    const { activeOnly = true, includeDeleted = false } = options;

    const placeholders = cdGrpIds.map(() => "?").join(", ");
    const conditions = [`CD_GRP_ID IN (${placeholders})`];
    if (activeOnly) {
      conditions.push("USE_YN = 'Y'");
    }
    if (!includeDeleted) {
      conditions.push("DEL_YN = 'N'");
    }

    const sql = `
      ${this.getCodeSelectSql()}
      WHERE ${conditions.join(" AND ")}
      ORDER BY CD_GRP_ID ASC, SORT_ORD ASC, CD_ID ASC
    `;
    const [rows] = await pool.query(sql, cdGrpIds);

    const result = {};
    cdGrpIds.forEach(id => { result[id] = []; });
    rows.forEach(row => {
      if (result[row.codeGroupId]) {
        result[row.codeGroupId].push(mapCodeRow(row));
      }
    });
    return result;
  }

  /**
   * 단일 코드 조회
   * @param {string} cdGrpId
   * @param {string} cdId
   * @returns {Promise<Object|null>}
   */
  async getCodeById(cdGrpId, cdId) {
    const sql = `
      ${this.getCodeSelectSql()}
      WHERE CD_GRP_ID = ?
        AND CD_ID = ?
      LIMIT 1
    `;
    const [rows] = await pool.query(sql, [cdGrpId, cdId]);
    return mapCodeRow(rows[0] || null);
  }

  /**
   * 신규 코드 등록
   * @param {Object} payload
   * @returns {Promise<Object>}
   */
  async createCode(payload) {
    const sql = `
      INSERT INTO PIP_CM_CD (
          CD_GRP_ID
        , CD_ID
        , CD_NM
        , CD_DESC
        , SORT_ORD
        , USE_YN
        , DEL_YN
        , REG_DT
        , MOD_DT
      ) VALUES (
          ?
        , ?
        , ?
        , ?
        , ?
        , ?
        , ?
        , NOW()
        , NOW()
      )
    `;

    await pool.query(sql, [
      payload.codeGroupId,
      payload.codeId,
      payload.codeName,
      payload.codeDesc,
      payload.sortOrder,
      payload.useYn,
      payload.delYn,
    ]);

    return this.getCodeById(payload.codeGroupId, payload.codeId);
  }

  /**
   * 코드 수정
   * @param {string} cdGrpId
   * @param {string} cdId
   * @param {Object} payload
   * @returns {Promise<Object|null>}
   */
  async updateCode(cdGrpId, cdId, payload) {
    const sql = `
      UPDATE PIP_CM_CD
      SET
          CD_NM = ?
        , CD_DESC = ?
        , SORT_ORD = ?
        , USE_YN = ?
        , DEL_YN = ?
        , MOD_DT = NOW()
      WHERE CD_GRP_ID = ?
        AND CD_ID = ?
    `;

    const [result] = await pool.query(sql, [
      payload.codeName,
      payload.codeDesc,
      payload.sortOrder,
      payload.useYn,
      payload.delYn,
      cdGrpId,
      cdId,
    ]);

    if (result.affectedRows === 0) {
      return null;
    }

    return this.getCodeById(cdGrpId, cdId);
  }

  /**
   * 코드 상태 변경
   * @param {string} cdGrpId
   * @param {string} cdId
   * @param {{ useYn?: string, delYn?: string }} payload
   * @returns {Promise<Object|null>}
   */
  async updateCodeStatus(cdGrpId, cdId, payload) {
    const setClauses = [];
    const params = [];

    if (payload.useYn) {
      setClauses.push("USE_YN = ?");
      params.push(payload.useYn);
    }

    if (payload.delYn) {
      setClauses.push("DEL_YN = ?");
      params.push(payload.delYn);
    }

    if (setClauses.length === 0) {
      return this.getCodeById(cdGrpId, cdId);
    }

    const sql = `
      UPDATE PIP_CM_CD
      SET
          ${setClauses.join("\n        , ")}
        , MOD_DT = NOW()
      WHERE CD_GRP_ID = ?
        AND CD_ID = ?
    `;

    params.push(cdGrpId, cdId);
    const [result] = await pool.query(sql, params);

    if (result.affectedRows === 0) {
      return null;
    }

    return this.getCodeById(cdGrpId, cdId);
  }
}

module.exports = PIPCMCD01Service;

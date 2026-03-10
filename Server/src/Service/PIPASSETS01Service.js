const pool = require("../db");

const CURRENCY_PATTERN = /^[A-Z]{3}$/;

function toStringTrim(value) {
  return (value ?? "").toString().trim();
}

// 공통코드 조회 캐시 (프로세스 생애주기 내)
let assetTypesCache = null;
let exposureRegionsCache = null;

async function getValidAssetTypes() {
  if (assetTypesCache) return assetTypesCache;
  const [rows] = await pool.query(
    "SELECT CD_ID FROM PIP_CM_CD WHERE CD_GRP_ID = 'ASSET_TYPE' AND USE_YN = 'Y' AND DEL_YN = 'N'"
  );
  assetTypesCache = rows.map(r => r.CD_ID);
  // 5분 후 캐시 만료
  setTimeout(() => { assetTypesCache = null; }, 5 * 60 * 1000);
  return assetTypesCache;
}

async function getValidExposureRegions() {
  if (exposureRegionsCache) return exposureRegionsCache;
  const [rows] = await pool.query(
    "SELECT CD_ID FROM PIP_CM_CD WHERE CD_GRP_ID = 'EXPOSURE_REGION' AND USE_YN = 'Y' AND DEL_YN = 'N'"
  );
  exposureRegionsCache = rows.map(r => r.CD_ID);
  setTimeout(() => { exposureRegionsCache = null; }, 5 * 60 * 1000);
  return exposureRegionsCache;
}

class PIPASSETS01Service {
  constructor(mapper) {
    this.mapper = mapper;
  }

  async list(query) {
    return this.mapper.list({
      assetType: toStringTrim(query.assetType),
      exposureRegion: toStringTrim(query.exposureRegion),
      keyword: toStringTrim(query.keyword),
      includeDeleted: query.includeDeleted === true,
    });
  }

  async getById(assetId) {
    return this.mapper.findById(assetId);
  }

  async validate(payload, mode) {
    const errors = {};

    const assetId = toStringTrim(payload.assetId);
    const assetName = toStringTrim(payload.assetName);
    const assetType = toStringTrim(payload.assetType);
    const exposureRegion = toStringTrim(payload.exposureRegion);
    const currency = toStringTrim(payload.currency).toUpperCase();

    if (mode === "create" && !assetId) {
      errors.assetId = "assetId is required";
    }

    if (!assetName) {
      errors.assetName = "assetName is required";
    }

    if (!assetType) {
      errors.assetType = "assetType is required";
    } else {
      const validTypes = await getValidAssetTypes();
      if (!validTypes.includes(assetType)) {
        errors.assetType = "assetType is invalid";
      }
    }

    if (!exposureRegion) {
      errors.exposureRegion = "exposureRegion is required";
    } else {
      const validRegions = await getValidExposureRegions();
      if (!validRegions.includes(exposureRegion)) {
        errors.exposureRegion = "exposureRegion is invalid";
      }
    }

    if (!currency) {
      errors.currency = "currency is required";
    } else if (!CURRENCY_PATTERN.test(currency)) {
      errors.currency = "currency must be ISO 4217 format";
    }

    return {
      errors,
      payload: {
        assetId,
        assetName,
        assetType,
        exposureRegion,
        currency,
      },
    };
  }

  async create(payload) {
    const { errors, payload: normalized } = await this.validate(payload, "create");
    if (Object.keys(errors).length > 0) {
      return { errors, item: null };
    }

    const existing = await this.mapper.findById(normalized.assetId);
    if (existing) {
      return {
        errors: { assetId: "assetId already exists" },
        item: null,
      };
    }

    const item = await this.mapper.create(normalized);
    return { errors: {}, item };
  }

  async update(assetId, payload) {
    const current = await this.mapper.findById(assetId);
    if (!current) {
      return { notFound: true, errors: {}, item: null };
    }

    const { errors, payload: normalized } = await this.validate(payload, "update");
    if (Object.keys(errors).length > 0) {
      return { errors, item: null, notFound: false };
    }

    const item = await this.mapper.update(assetId, normalized);
    return { errors: {}, item, notFound: false };
  }

  async softDelete(assetId) {
    const current = await this.mapper.findById(assetId);
    if (!current) return null;
    return this.mapper.softDelete(assetId);
  }

  async restore(assetId) {
    const current = await this.mapper.findById(assetId);
    if (!current) return null;
    return this.mapper.restore(assetId);
  }
}

module.exports = PIPASSETS01Service;

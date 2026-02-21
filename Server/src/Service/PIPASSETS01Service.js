const ASSET_TYPES = [
  "Stock",
  "ETF",
  "Bond",
  "Crypto",
  "Commodity",
  "FX Cash",
  "KRW Cash",
];
const EXPOSURE_REGIONS = ["KR", "US", "JP", "CH", "GLOBAL"];
const CURRENCY_PATTERN = /^[A-Z]{3}$/;

function toStringTrim(value) {
  return (value ?? "").toString().trim();
}

class PIPASSETS01Service {
  constructor(mapper) {
    this.mapper = mapper;
  }

  list(query) {
    return this.mapper.list({
      assetType: toStringTrim(query.assetType),
      exposureRegion: toStringTrim(query.exposureRegion),
      keyword: toStringTrim(query.keyword),
      includeDeleted: query.includeDeleted === true,
    });
  }

  getById(assetId) {
    return this.mapper.findById(assetId);
  }

  validate(payload, mode) {
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
    } else if (!ASSET_TYPES.includes(assetType)) {
      errors.assetType = "assetType is invalid";
    }

    if (!exposureRegion) {
      errors.exposureRegion = "exposureRegion is required";
    } else if (!EXPOSURE_REGIONS.includes(exposureRegion)) {
      errors.exposureRegion = "exposureRegion is invalid";
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

  create(payload) {
    const { errors, payload: normalized } = this.validate(payload, "create");
    if (Object.keys(errors).length > 0) {
      return { errors, item: null };
    }

    if (this.mapper.findById(normalized.assetId)) {
      return {
        errors: { assetId: "assetId already exists" },
        item: null,
      };
    }

    const item = this.mapper.create(normalized);
    return { errors: {}, item };
  }

  update(assetId, payload) {
    const current = this.mapper.findById(assetId);
    if (!current) {
      return { notFound: true, errors: {}, item: null };
    }

    const { errors, payload: normalized } = this.validate(payload, "update");
    if (Object.keys(errors).length > 0) {
      return { errors, item: null, notFound: false };
    }

    const item = this.mapper.update(assetId, normalized);
    return { errors: {}, item, notFound: false };
  }

  softDelete(assetId) {
    const current = this.mapper.findById(assetId);
    if (!current) return null;
    return this.mapper.softDelete(assetId);
  }
}

module.exports = PIPASSETS01Service;

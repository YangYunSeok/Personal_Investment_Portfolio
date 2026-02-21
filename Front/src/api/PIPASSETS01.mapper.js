/**
 * ScreenID: PIPASSETS01
 * Screen Name: 전체 종목 확인 화면
 * Purpose: 자산 마스터 조회 및 관리
 * 주요 동작: 조회
 * File Role: PIPASSETS01 화면 데이터 매핑/검증 모듈
 * 연관 SSOT 문서:
 * - docs/design/_index.md
 * - docs/design/model/PIPASSETS01_MODEL.md
 * - docs/design/ui/PIPASSETS01_UI.md
 * 금지 규칙:
 * - 계산값 저장 금지
 * - 단일 원장 원칙 위반 금지
 * - SSOT 미정의 필드/흐름 임의 추가 금지
 */
export const ASSET_TYPE_OPTIONS = [
  "Stock",
  "ETF",
  "Bond",
  "Crypto",
  "Commodity",
  "FX Cash",
  "KRW Cash",
];

export const ASSET_TYPE_LABEL = {
  Stock: "주식",
  ETF: "ETF",
  Bond: "채권",
  Crypto: "가상자산",
  Commodity: "원자재",
  "FX Cash": "외화 현금",
  "KRW Cash": "원화 현금",
};

export const EXPOSURE_REGION_OPTIONS = ["KR", "US", "JP", "CH", "GLOBAL"];

export const EXPOSURE_REGION_LABEL = {
  KR: "국내",
  US: "미국",
  JP: "일본",
  CH: "중국",
  GLOBAL: "글로벌",
};

export const CURRENCY_OPTIONS = ["KRW", "USD", "JPY", "CNY", "EUR", "GBP", "HKD"];

const CURRENCY_PATTERN = /^[A-Z]{3}$/;

function normalizeString(value) {
  return (value ?? "").toString().trim();
}

export function normalizeKeyword(value) {
  return normalizeString(value);
}

export function normalizeIncludeDeleted(value) {
  return Boolean(value);
}

export function buildAssetsListQuery(filters) {
  const assetType = normalizeString(filters.assetType);
  const exposureRegion = normalizeString(filters.exposureRegion);
  const keyword = normalizeKeyword(filters.keyword);
  const includeDeleted = normalizeIncludeDeleted(filters.includeDeleted);

  const query = { includeDeleted };

  if (assetType) query.assetType = assetType;
  if (exposureRegion) query.exposureRegion = exposureRegion;
  if (keyword) query.keyword = keyword;

  return query;
}

export function formatDateTimeDisplay(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function mapAssetListResponse(data) {
  const items = Array.isArray(data?.items) ? data.items : [];
  const normalizedItems = items.map((item) => ({
    assetId: item.assetId ?? "",
    assetName: item.assetName ?? "",
    assetType: item.assetType ?? "",
    exposureRegion: item.exposureRegion ?? "",
    currency: item.currency ?? "",
    deleted: Boolean(item.deleted),
    updatedAt: item.updatedAt ?? "",
    updatedAtDisplay: formatDateTimeDisplay(item.updatedAt),
  }));

  return {
    items: normalizedItems,
    total: Number.isFinite(data?.total) ? data.total : normalizedItems.length,
  };
}

export function mapAssetDetailToForm(asset) {
  return {
    assetId: normalizeString(asset?.assetId),
    assetName: normalizeString(asset?.assetName),
    assetType: normalizeString(asset?.assetType),
    exposureRegion: normalizeString(asset?.exposureRegion),
    currency: normalizeString(asset?.currency).toUpperCase(),
    deleted: Boolean(asset?.deleted),
  };
}

export function createEmptyAssetForm() {
  return {
    assetId: "",
    assetName: "",
    assetType: "",
    exposureRegion: "",
    currency: "",
    deleted: false,
  };
}

export function validateAssetForm(form, mode) {
  const errors = {};

  const assetId = normalizeString(form.assetId);
  const assetName = normalizeString(form.assetName);
  const assetType = normalizeString(form.assetType);
  const exposureRegion = normalizeString(form.exposureRegion);
  const currency = normalizeString(form.currency).toUpperCase();

  if (mode === "create" && !assetId) {
    errors.assetId = "자산 식별자(assetId)는 필수입니다.";
  }

  if (!assetName) {
    errors.assetName = "자산명(assetName)은 필수입니다.";
  }

  if (!assetType) {
    errors.assetType = "자산 유형(assetType)은 필수입니다.";
  } else if (!ASSET_TYPE_OPTIONS.includes(assetType)) {
    errors.assetType = "허용되지 않은 자산 유형입니다.";
  }

  if (!exposureRegion) {
    errors.exposureRegion = "노출 지역(exposureRegion)은 필수입니다.";
  } else if (!EXPOSURE_REGION_OPTIONS.includes(exposureRegion)) {
    errors.exposureRegion = "허용되지 않은 노출 지역입니다.";
  }

  if (!currency) {
    errors.currency = "통화(currency)는 필수입니다.";
  } else if (!CURRENCY_PATTERN.test(currency)) {
    errors.currency = "통화는 ISO 4217 형식(예: USD, KRW)이어야 합니다.";
  }

  return errors;
}

export function buildAssetUpsertPayload(form, mode) {
  const errors = validateAssetForm(form, mode);
  const hasErrors = Object.keys(errors).length > 0;

  if (hasErrors) {
    return { payload: null, errors };
  }

  const payload = {
    assetName: normalizeString(form.assetName),
    assetType: normalizeString(form.assetType),
    exposureRegion: normalizeString(form.exposureRegion),
    currency: normalizeString(form.currency).toUpperCase(),
  };

  if (mode === "create") {
    payload.assetId = normalizeString(form.assetId);
  }

  return { payload, errors: {} };
}

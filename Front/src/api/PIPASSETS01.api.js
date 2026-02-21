/**
 * ScreenID: PIPASSETS01
 * Screen Name: 전체 종목 확인 화면
 * Purpose: 자산 마스터 조회 및 관리
 * 주요 동작: 조회
 * File Role: PIPASSETS01 화면 API 호출 모듈
 * 연관 SSOT 문서:
 * - docs/design/_index.md
 * - docs/design/api/PIPASSETS01_API.md
 * - docs/design/ui/PIPASSETS01_UI.md
 * 금지 규칙:
 * - 계산값 저장 금지
 * - 단일 원장 원칙 위반 금지
 * - SSOT 미정의 필드/흐름 임의 추가 금지
 */
const ASSETS_BASE_PATH = "/api/pip/assets";

function buildQueryString(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const body = isJson ? await response.json() : null;

  if (!response.ok) {
    const message = body?.message ?? "요청 처리에 실패했습니다.";
    throw new Error(message);
  }

  return body;
}

export function fetchAssetsList(query) {
  return request(`${ASSETS_BASE_PATH}${buildQueryString(query)}`, {
    method: "GET",
  });
}

export function fetchAssetById(assetId) {
  return request(`${ASSETS_BASE_PATH}/${encodeURIComponent(assetId)}`, {
    method: "GET",
  });
}

export function createAsset(payload) {
  return request(ASSETS_BASE_PATH, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAsset(assetId, payload) {
  return request(`${ASSETS_BASE_PATH}/${encodeURIComponent(assetId)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteAsset(assetId) {
  return request(`${ASSETS_BASE_PATH}/${encodeURIComponent(assetId)}`, {
    method: "DELETE",
  });
}

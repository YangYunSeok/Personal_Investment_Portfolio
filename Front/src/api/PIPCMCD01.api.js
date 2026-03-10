/**
 * 공통코드 API 호출 모듈
 * Purpose: PIP_CM_CD 기반 공통코드 조회/관리
 */
import { API_BASE } from "../config/api";

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "공통코드 요청에 실패했습니다.");
  }

  return data;
}

export async function fetchCommonCodeGroups(options = {}) {
  const params = new URLSearchParams();
  if (options.includeDeleted) {
    params.set("includeDeleted", "true");
  }

  const query = params.toString();
  const url = `${API_BASE}/api/pip/common-code-groups${query ? `?${query}` : ""}`;
  return request(url);
}

/**
 * 공통코드 다건 그룹 조회
 * @param {string[]} grpIds - 코드그룹ID 배열
 * @param {{ includeInactive?: boolean, includeDeleted?: boolean }} options
 * @returns {Promise<Object>} { ASSET_TYPE: [...], EXPOSURE_REGION: [...], TX_CCY_CD: [...] }
 */
export async function fetchCommonCodes(grpIds, options = {}) {
  if (!Array.isArray(grpIds) || grpIds.length === 0) return {};

  const params = new URLSearchParams();
  params.set("grpId", grpIds.join(","));
  if (options.includeInactive) {
    params.set("includeInactive", "true");
  }
  if (options.includeDeleted) {
    params.set("includeDeleted", "true");
  }

  return request(`${API_BASE}/api/pip/common-codes?${params.toString()}`);
}

export async function createCommonCode(payload) {
  return request(`${API_BASE}/api/pip/common-codes`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateCommonCode(codeGroupId, codeId, payload) {
  return request(`${API_BASE}/api/pip/common-codes/${encodeURIComponent(codeGroupId)}/${encodeURIComponent(codeId)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function updateCommonCodeStatus(codeGroupId, codeId, payload) {
  return request(`${API_BASE}/api/pip/common-codes/${encodeURIComponent(codeGroupId)}/${encodeURIComponent(codeId)}/status`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

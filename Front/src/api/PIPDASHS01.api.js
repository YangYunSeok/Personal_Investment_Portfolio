/**
 * ──────────────────────────────────────────────
 * Screen ID : PIPDASHS01
 * Screen Name : Dashboard (대시보드)
 * Purpose : 대시보드 API 호출 모듈
 * API : GET /api/pip/dashboard
 * SSOT Docs : PIPDASHS01_API.md
 * Rules :
 *   - 조회 전용
 *   - 계산 결과 저장 금지
 * ──────────────────────────────────────────────
 */

import { API_BASE } from "../config/api";

const BASE_URL = `${API_BASE}/api/pip/dashboard`;

/**
 * 대시보드 요약 데이터를 조회한다.
 * @returns {Promise<{portfolioSummary, assetAllocations, regionExposures}>}
 */
export async function fetchDashboard() {
    const res = await fetch(BASE_URL);
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || "대시보드 조회에 실패했습니다.");
    }
    return res.json();
}

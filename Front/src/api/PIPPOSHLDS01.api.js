/**
 * API module for PIPPOSHLDS01 (Position Holdings)
 */

import { API_BASE } from "../config/api";

const BASE_URL = `${API_BASE}/api/pip/positions`;

export async function fetchPositions(query = {}) {
    // Clean empty query parameters
    const validQuery = Object.fromEntries(
        Object.entries(query).filter(([_, v]) => v != null && v !== "" && v !== "전체")
    );

    const params = new URLSearchParams(validQuery).toString();
    const url = params ? `${BASE_URL}?${params}` : BASE_URL;

    const res = await fetch(url);
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || "포지션 조회에 실패했습니다.");
    }
    return res.json();
}

/**
 * Screen ID: PIPFXS01
 * Screen Name: 환전 (Exchange)
 * Purpose: 환전 관련 API 호출 캡슐화
 * Related SSOT: docs/design/api/PIPFXS01_API.md
 */
import axios from "axios";
import { API_BASE } from "../config/api";

export const getFxActivities = async (filters) => {
    const { data } = await axios.get(`${API_BASE}/api/pip/fx-activities`, {
        params: filters
    });
    return data;
};

export const createFxActivity = async (payload) => {
    const { data } = await axios.post(`${API_BASE}/api/pip/fx-activities`, payload);
    return data;
};

export const getFxMeta = async () => {
    const { data } = await axios.get(`${API_BASE}/api/pip/fx/meta`);
    return data;
};

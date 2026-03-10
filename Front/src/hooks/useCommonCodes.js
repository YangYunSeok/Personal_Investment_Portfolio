/**
 * 공통코드 React Hook
 * Purpose: PIP_CM_CD 기반 공통코드를 조회하여 화면에서 사용할 수 있도록 제공
 *
 * Usage:
 *   const { codes, codeMap, loading, error } = useCommonCodes(["ASSET_TYPE", "EXPOSURE_REGION", "TX_CCY_CD"]);
 *   // codes.ASSET_TYPE = [{ codeId, codeName, ... }, ...]
 *   // codeMap.ASSET_TYPE = { STOCK: "주식", ETF: "ETF", ... }
 */
import { useState, useEffect } from "react";
import { fetchCommonCodes } from "../api/PIPCMCD01.api.js";

// 모듈 수준 캐시 (동일 세션 내 중복 API 호출 방지)
const codeCache = {};

export function invalidateCommonCodeCache(grpIds) {
  if (!Array.isArray(grpIds) || grpIds.length === 0) {
    Object.keys(codeCache).forEach(key => delete codeCache[key]);
    return;
  }

  grpIds.forEach(id => {
    delete codeCache[id];
  });
}

/**
 * 코드 배열을 { codeId: codeName } 맵으로 변환
 */
function buildCodeMap(codeList) {
  const map = {};
  if (Array.isArray(codeList)) {
    codeList.forEach(item => {
      map[item.codeId] = item.codeName;
    });
  }
  return map;
}

/**
 * 코드 배열을 [{ value, label }] 옵션 배열로 변환 (드롭다운용)
 */
export function toSelectOptions(codeList) {
  if (!Array.isArray(codeList)) return [];
  return codeList.map(item => ({
    value: item.codeId,
    label: item.codeName,
  }));
}

/**
 * codeMap에서 codeId에 해당하는 codeName을 반환 (없으면 codeId 자체를 fallback)
 */
export function getCodeName(codeMap, codeId) {
  if (!codeMap || !codeId) return codeId || "";
  return codeMap[codeId] || codeId;
}

/**
 * 공통코드 조회 Hook
 * @param {string[]} grpIds - 코드그룹ID 배열
 * @returns {{ codes: Object, codeMap: Object, loading: boolean, error: string }}
 */
export default function useCommonCodes(grpIds) {
  const [codes, setCodes] = useState({});
  const [codeMap, setCodeMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!Array.isArray(grpIds) || grpIds.length === 0) return;

    // 캐시에 모든 그룹이 있으면 캐시 사용
    const allCached = grpIds.every(id => codeCache[id]);
    if (allCached) {
      const cachedCodes = {};
      const cachedMap = {};
      grpIds.forEach(id => {
        cachedCodes[id] = codeCache[id];
        cachedMap[id] = buildCodeMap(codeCache[id]);
      });
      setCodes(cachedCodes);
      setCodeMap(cachedMap);
      return;
    }

    let cancelled = false;

    const loadCodes = async () => {
      setLoading(true);
      setError("");
      try {
        const result = await fetchCommonCodes(grpIds);
        if (cancelled) return;

        const newCodes = {};
        const newMap = {};
        grpIds.forEach(id => {
          const list = result[id] || [];
          newCodes[id] = list;
          newMap[id] = buildCodeMap(list);
          // 캐시 업데이트
          codeCache[id] = list;
        });
        setCodes(newCodes);
        setCodeMap(newMap);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "공통코드 조회 실패");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadCodes();

    return () => { cancelled = true; };
  }, [JSON.stringify(grpIds)]);

  return { codes, codeMap, loading, error };
}

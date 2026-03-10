import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchPositions } from "../../api/PIPPOSHLDS01.api.js";
import { fetchAccountsList } from "../../api/PIPACCOUNTS01.api.js";
import useCommonCodes, { getCodeName } from "../../hooks/useCommonCodes.js";
import styles from "./PIPPOSHLDS01.module.css";

const getToday = () => {
    const today = new Date();
    // Use local time zone format YYYY-MM-DD
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

export default function PIPPOSHLDS01() {
    const navigate = useNavigate();
    const { codes, codeMap } = useCommonCodes(["ASSET_TYPE", "EXPOSURE_REGION"]);
    const assetTypeOptions = codes.ASSET_TYPE || [];
    const exposureRegionOptions = codes.EXPOSURE_REGION || [];
    const assetTypeMap = codeMap.ASSET_TYPE || {};
    const exposureRegionMap = codeMap.EXPOSURE_REGION || {};

    // Header
    const [asOfDate, setAsOfDate] = useState(getToday());

    // Filters
    const [filterForm, setFilterForm] = useState({
        accountId: "",
        exposure: "",
        assetType: "",
        q: ""
    });

    // Options
    const [accounts, setAccounts] = useState([]);

    // List State
    const [positions, setPositions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        loadAccounts();
    }, []);

    const loadAccounts = async () => {
        try {
            const accs = await fetchAccountsList({});
            setAccounts(accs.items || []);
        } catch (err) {
            console.error("Failed to load accounts:", err);
        }
    };

    const handleSearch = async () => {
        setIsLoading(true);
        setError("");
        try {
            const data = await fetchPositions({
                asOf: asOfDate,
                accountId: filterForm.accountId,
                exposure: filterForm.exposure,
                assetType: filterForm.assetType,
                q: filterForm.q
            });
            setPositions(data.rows || []);
        } catch (err) {
            setError(err.message || "포지션 조회에 실패했습니다.");
            setPositions([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate Summary Strip
    const summary = useMemo(() => {
        let totalCostBasisKRW = 0;
        let krwCash = 0;
        const fxCash = {}; // currency -> amount

        positions.forEach(p => {
            totalCostBasisKRW += Number(p.costBasisKRW || 0);

            if (p.assetType === "KRW Cash") {
                krwCash += Number(p.quantity || 0);
            } else if (p.assetType === "FX Cash") {
                if (!fxCash[p.currency]) fxCash[p.currency] = 0;
                fxCash[p.currency] += Number(p.quantity || 0);
            }
        });

        return { totalCostBasisKRW, krwCash, fxCash };
    }, [positions]);

    const handleRowClick = (accountId, assetId) => {
        // Deep link params: accountId, assetId, asOf
        // Current PIPASSETS01 handles general assets but is mostly found inside /meta-master
        // Based on UI directions, navigate to asset master or somewhere equivalent
        navigate(`/assets?accountId=${accountId}&assetId=${assetId}&asOf=${asOfDate}`);
    };

    const formatNumber = (num, decimals = 2) => {
        if (num == null) return "";
        return Number(num).toLocaleString(undefined, { maximumFractionDigits: decimals });
    };

    return (
        <div className={styles.page}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h1 className={styles.pageTitle} style={{ margin: 0 }}>Position (보유 자산)</h1>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>기준시점(asOf)</span>
                    <input
                        type="date"
                        className={styles.input}
                        style={{ width: 140 }}
                        value={asOfDate}
                        onChange={(e) => setAsOfDate(e.target.value)}
                    />
                </div>
            </div>

            {/* Filter Bar */}
            <section className={styles.card}>
                <div className={styles.filterBar}>
                    <div className={styles.filterItem}>
                        <span className={styles.filterLabel}>계좌</span>
                        <select
                            className={styles.select}
                            value={filterForm.accountId}
                            onChange={(e) => setFilterForm(prev => ({ ...prev, accountId: e.target.value }))}
                        >
                            <option value="">전체</option>
                            {accounts.map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.name} ({acc.id})</option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.filterItem}>
                        <span className={styles.filterLabel}>노출(Exposure)</span>
                        <select
                            className={styles.select}
                            value={filterForm.exposure}
                            onChange={(e) => setFilterForm(prev => ({ ...prev, exposure: e.target.value }))}
                        >
                            <option value="">전체</option>
                            {exposureRegionOptions.map(o => <option key={o.codeId} value={o.codeId}>{o.codeName}</option>)}
                        </select>
                    </div>
                    <div className={styles.filterItem}>
                        <span className={styles.filterLabel}>자산유형</span>
                        <select
                            className={styles.select}
                            value={filterForm.assetType}
                            onChange={(e) => setFilterForm(prev => ({ ...prev, assetType: e.target.value }))}
                        >
                            <option value="">전체</option>
                            {assetTypeOptions.map(o => <option key={o.codeId} value={o.codeId}>{o.codeName}</option>)}
                        </select>
                    </div>
                    <div className={styles.filterItem}>
                        <span className={styles.filterLabel}>검색어</span>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder="종목명/ID"
                            value={filterForm.q}
                            onChange={(e) => setFilterForm(prev => ({ ...prev, q: e.target.value }))}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSearch();
                            }}
                        />
                    </div>
                </div>
                <div className={styles.filterActions}>
                    <button
                        className={`${styles.btnPrimary} ${styles.btnSearch}`}
                        onClick={handleSearch}
                        disabled={isLoading}
                    >
                        {isLoading && <div className={styles.spinner}></div>}
                        조회
                    </button>
                </div>
            </section>

            {/* Summary Strip */}
            <section className={styles.card} style={{ backgroundColor: "#f8faff", border: "1px solid #dce9ff" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 32, alignItems: "center" }}>
                    <div>
                        <span style={{ fontSize: 13, color: "#666", display: "block", marginBottom: 4 }}>합계 원금 (KRW)</span>
                        <span style={{ fontSize: 20, fontWeight: 700, color: "#111" }}>{formatNumber(summary.totalCostBasisKRW, 0)} 원</span>
                    </div>
                    <div>
                        <span style={{ fontSize: 13, color: "#666", display: "block", marginBottom: 4 }}>KRW Cash</span>
                        <span style={{ fontSize: 18, fontWeight: 600, color: "#2f6fed" }}>{formatNumber(summary.krwCash, 0)} 원</span>
                    </div>
                    {Object.entries(summary.fxCash).map(([ccy, amt]) => (
                        <div key={ccy}>
                            <span style={{ fontSize: 13, color: "#666", display: "block", marginBottom: 4 }}>FX Cash ({ccy})</span>
                            <span style={{ fontSize: 18, fontWeight: 600, color: "#2559cc" }}>{formatNumber(amt)}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Main Grid */}
            <section className={`${styles.card} ${styles.gridCard}`}>
                <div className={styles.gridHeader}>
                    <span className={styles.gridCount}>조회 결과 ({positions.length}건)</span>
                </div>

                {error && (
                    <div className={styles.noticeError} style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>{error}</span>
                        <button className={styles.btnOutline} style={{ height: 28, padding: "0 12px" }} onClick={handleSearch}>재시도</button>
                    </div>
                )}

                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>계좌</th>
                            <th>노출</th>
                            <th>자산유형</th>
                            <th>종목명</th>
                            <th>통화</th>
                            <th style={{ textAlign: "right" }}>수량</th>
                            <th style={{ textAlign: "right" }}>평균단가</th>
                            <th style={{ textAlign: "right" }}>원금(외화)</th>
                            <th style={{ textAlign: "right" }}>원금(KRW환산)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {positions.length > 0 ? positions.map((row, idx) => (
                            <tr
                                key={`${row.accountId}-${row.assetId}-${row.currency}-${idx}`}
                                className={styles.tableRow}
                                style={{ cursor: "pointer" }}
                                onClick={() => handleRowClick(row.accountId, row.assetId)}
                            >
                                <td>{row.accountId}</td>
                                <td>{getCodeName(exposureRegionMap, row.exposure)}</td>
                                <td>{getCodeName(assetTypeMap, row.assetType)}</td>
                                <td style={{ fontWeight: 500 }}>{row.assetName}</td>
                                <td>{row.currency}</td>
                                <td style={{ textAlign: "right" }}>{formatNumber(row.quantity, 4)}</td>
                                <td style={{ textAlign: "right" }}>{row.avgUnitCost ? formatNumber(row.avgUnitCost, 4) : ""}</td>
                                <td style={{ textAlign: "right" }}>{formatNumber(row.costBasis, 2)}</td>
                                <td style={{ textAlign: "right" }}>{formatNumber(row.costBasisKRW, 0)}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="9" className={styles.tableEmpty}>
                                    해당 조건의 보유 자산이 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </section>
        </div>
    );
}

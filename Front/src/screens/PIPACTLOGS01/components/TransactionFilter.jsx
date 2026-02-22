import React from "react";
import {
    TRANSACTION_TYPE_OPTIONS,
    TRANSACTION_TYPE_LABEL,
    ASSET_TYPE_OPTIONS,
    ASSET_TYPE_LABEL,
    EXPOSURE_REGION_OPTIONS,
    EXPOSURE_REGION_LABEL,
    CURRENCY_OPTIONS,
    CURRENCY_LABEL
} from "../PIPACTLOGS01.constants";
import styles from "../PIPACTLOGS01.module.css";

export default function TransactionFilter({ filters, onChange, onSearch, accounts, isListLoading }) {
    const updateFilter = (key) => (e) => {
        const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
        onChange(key, value);
    };

    return (
        <section aria-label="필터" className={styles.card}>
            <div className={styles.filterBar}>
                <div className={styles.filterItem}>
                    <span className={styles.filterLabel}>기간</span>
                    <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                        <input
                            type="date"
                            className={styles.input}
                            value={filters.from || ""}
                            onChange={updateFilter("from")}
                            style={{ flex: 1, padding: "0 8px" }}
                        />
                        <span style={{ color: "#999" }}>~</span>
                        <input
                            type="date"
                            className={styles.input}
                            value={filters.to || ""}
                            onChange={updateFilter("to")}
                            style={{ flex: 1, padding: "0 8px" }}
                        />
                    </div>
                </div>
                <div className={styles.filterItem}>
                    <span className={styles.filterLabel}>계좌</span>
                    <select
                        className={styles.select}
                        value={filters.accountId || ""}
                        onChange={updateFilter("accountId")}
                    >
                        <option value="">전체</option>
                        {accounts.map(acc => (
                            <option key={acc.id} value={acc.id}>{acc.name}</option>
                        ))}
                    </select>
                </div>
                <div className={styles.filterItem}>
                    <span className={styles.filterLabel}>자산유형</span>
                    <select
                        className={styles.select}
                        value={filters.assetType || ""}
                        onChange={updateFilter("assetType")}
                    >
                        <option value="">전체</option>
                        {ASSET_TYPE_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{ASSET_TYPE_LABEL[opt]}</option>
                        ))}
                    </select>
                </div>
                <div className={styles.filterItem}>
                    <span className={styles.filterLabel}>노출지역</span>
                    <select
                        className={styles.select}
                        value={filters.exposureRegion || ""}
                        onChange={updateFilter("exposureRegion")}
                    >
                        <option value="">전체</option>
                        {EXPOSURE_REGION_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{EXPOSURE_REGION_LABEL[opt]}</option>
                        ))}
                    </select>
                </div>
                <div className={styles.filterItem}>
                    <span className={styles.filterLabel}>거래유형</span>
                    <select
                        className={styles.select}
                        value={filters.transactionType || ""}
                        onChange={updateFilter("transactionType")}
                    >
                        <option value="">전체</option>
                        {TRANSACTION_TYPE_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{TRANSACTION_TYPE_LABEL[opt]}</option>
                        ))}
                    </select>
                </div>
                <div className={styles.filterItem}>
                    <span className={styles.filterLabel}>통화</span>
                    <select
                        className={styles.select}
                        value={filters.tradeCurrency || ""}
                        onChange={updateFilter("tradeCurrency")}
                    >
                        <option value="">전체</option>
                        {CURRENCY_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{CURRENCY_LABEL[opt]}</option>
                        ))}
                    </select>
                </div>
                <div className={styles.filterItem}>
                    <span className={styles.filterLabel}>검색어</span>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder="자산ID/메모"
                        value={filters.keyword || ""}
                        onChange={updateFilter("keyword")}
                    />
                </div>
                <div className={styles.filterItem}>
                    <span className={styles.filterLabel}>기타</span>
                    <label style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        height: "40px",
                        fontSize: "14px",
                        cursor: "pointer"
                    }}>
                        <input
                            type="checkbox"
                            checked={filters.includeDeleted || false}
                            onChange={updateFilter("includeDeleted")}
                            style={{ width: "16px", height: "16px" }}
                        />
                        삭제 포함
                    </label>
                </div>
            </div>
            <div className={styles.filterActions}>
                <button
                    type="button"
                    className={`${styles.btnPrimary} ${styles.btnSearch}`}
                    onClick={onSearch}
                    disabled={isListLoading}
                >
                    {isListLoading ? (
                        <>
                            <div className={styles.spinner} style={{ marginRight: 8, borderTopColor: "#fff" }} />
                            조회 중...
                        </>
                    ) : (
                        "조회"
                    )}
                </button>
            </div>
        </section>
    );
}

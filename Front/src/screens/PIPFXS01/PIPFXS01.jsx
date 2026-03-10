/**
 * Screen ID: PIPFXS01
 * Screen Name: 환전 (Exchange)
 * Purpose: 메인 환전 관리 화면 UI 구현
 * Related SSOT: docs/design/ui/PIPFXS01_UI.md
 */
import React, { useState, useEffect } from "react";
import { getFxActivities, createFxActivity, getFxMeta } from "../../api/PIPFXS01.api";
import { INITIAL_FORM_STATE, GRID_COLUMNS } from "./PIPFXS01.constants";
import styles from "./PIPFXS01.module.css";

export default function PIPFXS01() {
    const [meta, setMeta] = useState({ accounts: [], currencies: [] });

    // 폼 상태
    const [form, setForm] = useState(INITIAL_FORM_STATE);
    const [formErrors, setFormErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [saveSuccess, setSaveSuccess] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // 리스트/필터 상태
    const [filters, setFilters] = useState({
        fromDate: "",
        toDate: "",
        accountId: "",
        fromCurrency: "",
        toCurrency: ""
    });
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // 화면 진입 시 메타 데이터 1회 로드
    useEffect(() => {
        loadMeta();
    }, []);

    const loadMeta = async () => {
        try {
            const data = await getFxMeta();
            // Ensure data is an object and has required arrays
            if (data && typeof data === 'object') {
                setMeta({
                    accounts: Array.isArray(data.accounts) ? data.accounts : [],
                    currencies: Array.isArray(data.currencies) ? data.currencies : []
                });
            }
        } catch (err) {
            console.error("Failed to load meta data", err);
        }
    };

    const loadList = async () => {
        setIsLoading(true);
        setServerError("");
        setSaveSuccess("");
        try {
            const data = await getFxActivities(filters);
            setItems(data.items || []);
            setTotal(data.total || 0);
        } catch (err) {
            console.error("Failed to load FX list", err);
        } finally {
            setIsLoading(false);
        }
    };

    // 입력 폼 핸들러
    const handleFormChange = (field, value) => {
        setForm((prev) => {
            const next = { ...prev, [field]: value };

            // tradeCurrency는 fromCurrency와 항상 동일하게 동기화
            if (field === "fromCurrency") {
                next.tradeCurrency = value;
            }

            return next;
        });

        // 에러 상태 클리어
        if (formErrors[field]) {
            setFormErrors((prev) => {
                const nextErrors = { ...prev };
                delete nextErrors[field];
                return nextErrors;
            });
        }
    };

    // 프론트엔드 자체 검증
    const validateForm = () => {
        const errors = {};
        if (!form.tradeDate) errors.tradeDate = "필수값입니다.";
        if (!form.accountId) errors.accountId = "필수값입니다.";
        if (!form.fromCurrency) errors.fromCurrency = "필수값입니다.";
        if (!form.toCurrency) errors.toCurrency = "필수값입니다.";
        if (!form.tradeAmount || form.tradeAmount <= 0) errors.tradeAmount = "0보다 큰 값을 입력하세요.";
        if (!form.fxRate || form.fxRate <= 0) errors.fxRate = "0보다 큰 값을 입력하세요.";

        if (form.fromCurrency && form.toCurrency && form.fromCurrency === form.toCurrency) {
            errors.toCurrency = "출금 통화와 입금 통화는 달라야 합니다.";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSave = async () => {
        setServerError("");
        setSaveSuccess("");

        if (!validateForm()) return;

        setIsSaving(true);
        try {
            // 숫자형 필드 변환
            const payload = {
                ...form,
                tradeAmount: Number(form.tradeAmount),
                fxRate: Number(form.fxRate)
            };

            await createFxActivity(payload);

            // 저장 성공 로직
            setSaveSuccess("환전 내역이 성공적으로 저장되었습니다.");

            // 폼 초기화 (일부 필드 유지할 수 있으나 기본적으로 초기화)
            setForm((prev) => ({
                ...INITIAL_FORM_STATE,
                tradeDate: prev.tradeDate // 날짜 필드는 유지하는 UX
            }));

            // 리스트 재조회
            await loadList();

        } catch (err) {
            if (err.response && err.response.data && err.response.data.error) {
                setServerError(err.response.data.error);
            } else {
                setServerError("서버 저장 중 오류가 발생했습니다.");
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={styles.page}>
            <h1 className={styles.pageTitle}>Exchange (환전)</h1>

            {serverError && <div className={styles.noticeError}>{serverError}</div>}
            {saveSuccess && <div className={styles.noticeSuccess}>{saveSuccess}</div>}

            {/* 1. 입력 폼 영역 */}
            <section className={styles.card}>
                <h2 style={{ fontSize: "16px", marginBottom: "16px" }}>환전 정보 입력</h2>
                <div className={styles.formGrid}>

                    <div className={styles.formField}>
                        <label className={styles.filterLabel}>거래일</label>
                        <input
                            type="date"
                            className={styles.input}
                            value={form.tradeDate}
                            onChange={(e) => handleFormChange("tradeDate", e.target.value)}
                        />
                        {formErrors.tradeDate && <div className={styles.errorText}>{formErrors.tradeDate}</div>}
                    </div>

                    <div className={styles.formField}>
                        <label className={styles.filterLabel}>계좌</label>
                        <select
                            className={styles.select}
                            value={form.accountId}
                            onChange={(e) => handleFormChange("accountId", e.target.value)}
                        >
                            <option value="">선택</option>
                            {meta.accounts.map(acc => (
                                <option key={acc.accountId} value={acc.accountId}>{acc.accountName}</option>
                            ))}
                        </select>
                        {formErrors.accountId && <div className={styles.errorText}>{formErrors.accountId}</div>}
                    </div>

                    <div className={styles.formField}>
                        <label className={styles.filterLabel}>출금 통화 (From)</label>
                        <select
                            className={styles.select}
                            value={form.fromCurrency}
                            onChange={(e) => handleFormChange("fromCurrency", e.target.value)}
                        >
                            <option value="">선택</option>
                            {meta.currencies.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        {formErrors.fromCurrency && <div className={styles.errorText}>{formErrors.fromCurrency}</div>}
                    </div>

                    <div className={styles.formField}>
                        <label className={styles.filterLabel}>입금 통화 (To)</label>
                        <select
                            className={styles.select}
                            value={form.toCurrency}
                            onChange={(e) => handleFormChange("toCurrency", e.target.value)}
                        >
                            <option value="">선택</option>
                            {meta.currencies.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        {formErrors.toCurrency && <div className={styles.errorText}>{formErrors.toCurrency}</div>}
                    </div>

                    <div className={styles.formField}>
                        <label className={styles.filterLabel}>거래 금액</label>
                        <input
                            type="number"
                            className={styles.input}
                            value={form.tradeAmount}
                            onChange={(e) => handleFormChange("tradeAmount", e.target.value)}
                            placeholder="출금 통화 기준 금액"
                        />
                        {formErrors.tradeAmount && <div className={styles.errorText}>{formErrors.tradeAmount}</div>}
                    </div>

                    <div className={styles.formField}>
                        <label className={styles.filterLabel}>거래 통화</label>
                        <input
                            type="text"
                            className={styles.input}
                            value={form.tradeCurrency}
                            disabled
                            placeholder="출금 통화와 동일"
                        />
                    </div>

                    <div className={styles.formField}>
                        <label className={styles.filterLabel}>환율</label>
                        <input
                            type="number"
                            className={styles.input}
                            value={form.fxRate}
                            onChange={(e) => handleFormChange("fxRate", e.target.value)}
                            placeholder="적용 환율 입력"
                        />
                        {formErrors.fxRate && <div className={styles.errorText}>{formErrors.fxRate}</div>}
                    </div>

                    <div className={styles.formField} style={{ gridColumn: "span 2" }}>
                        <label className={styles.filterLabel}>메모 (옵션)</label>
                        <input
                            className={styles.input}
                            value={form.memo}
                            onChange={(e) => handleFormChange("memo", e.target.value)}
                            placeholder="환전 사유 등 메모"
                        />
                    </div>

                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
                    <button
                        className={styles.btnPrimary}
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? "저장 중..." : "환전 저장"}
                    </button>
                </div>
            </section>

            {/* 2. 조회 영역 (필터 + 목록) */}
            <section className={`${styles.card} ${styles.gridCard}`}>
                <h2 style={{ fontSize: "16px", marginBottom: "16px" }}>환전 내역 조회</h2>

                {/* 필터 */}
                <div className={styles.filterBar} style={{ marginBottom: "24px", gridTemplateColumns: "repeat(5, 1fr)" }}>
                    <div className={styles.filterItem}>
                        <span className={styles.filterLabel}>시작일</span>
                        <input type="date" className={styles.input} value={filters.fromDate} onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })} />
                    </div>
                    <div className={styles.filterItem}>
                        <span className={styles.filterLabel}>종료일</span>
                        <input type="date" className={styles.input} value={filters.toDate} onChange={(e) => setFilters({ ...filters, toDate: e.target.value })} />
                    </div>
                    <div className={styles.filterItem}>
                        <span className={styles.filterLabel}>계좌</span>
                        <select className={styles.select} value={filters.accountId} onChange={(e) => setFilters({ ...filters, accountId: e.target.value })}>
                            <option value="">전체</option>
                            {meta.accounts.map(acc => <option key={acc.accountId} value={acc.accountId}>{acc.accountName}</option>)}
                        </select>
                    </div>
                    <div className={styles.filterItem}>
                        <span className={styles.filterLabel}>출금 통화</span>
                        <select className={styles.select} value={filters.fromCurrency} onChange={(e) => setFilters({ ...filters, fromCurrency: e.target.value })}>
                            <option value="">전체</option>
                            {meta.currencies.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className={styles.filterItem}>
                        <span className={styles.filterLabel}>입금 통화</span>
                        <select className={styles.select} value={filters.toCurrency} onChange={(e) => setFilters({ ...filters, toCurrency: e.target.value })}>
                            <option value="">전체</option>
                            {meta.currencies.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
                    <button className={styles.btnPrimary} onClick={loadList} disabled={isLoading}>
                        {isLoading ? "조회 중..." : "조회"}
                    </button>
                </div>

                {/* 그리드 */}
                <div className={styles.gridHeader}>
                    <span style={{ fontWeight: 600, fontSize: "14px" }}>조회 결과 ({total}건)</span>
                </div>

                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                {GRID_COLUMNS.map((col) => (
                                    <th key={col.field} style={{ width: col.width }}>{col.headerName}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {items.length === 0 ? (
                                <tr>
                                    <td colSpan={GRID_COLUMNS.length} style={{ textAlign: "center", padding: "40px", color: "#999" }}>
                                        조회된 내역이 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={item.transactionId}>
                                        {GRID_COLUMNS.map((col) => (
                                            <td key={col.field}>
                                                {col.valueFormatter ? col.valueFormatter({ value: item[col.field] }) : item[col.field]}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

        </div>
    );
}

import React, { useState, useMemo, useEffect } from "react";
import {
    createAsset,
    deleteAsset,
    fetchAssetsList,
    updateAsset,
    restoreAsset,
} from "../api/PIPASSETS01.api.js";
import {
    createAccount,
    deleteAccount,
    fetchAccountsList,
    updateAccount,
    restoreAccount,
} from "../api/PIPACCOUNTS01.api.js";
import {
    ASSET_TYPE_LABEL,
    ASSET_TYPE_OPTIONS,
    CURRENCY_LABEL,
    CURRENCY_OPTIONS,
    EXPOSURE_REGION_LABEL,
    EXPOSURE_REGION_OPTIONS,
    buildAssetUpsertPayload,
    buildAssetsListQuery,
    createEmptyAssetForm,
    mapAssetListResponse,
} from "../api/PIPASSETS01.mapper.js";
import styles from "./PIPASSETS01.module.css";

const initialAssetFilterForm = {
    assetType: "",
    exposureRegion: "",
    keyword: "",
    includeDeleted: false,
};

const initialAccountFilterForm = {
    keyword: "",
    includeDeleted: false,
};

export default function PIPMETAMST01() {
    const [activeTab, setActiveTab] = useState("assets"); // 'assets' | 'accounts'

    // ================== Common States ==================
    const [isListLoading, setIsListLoading] = useState(false);
    const [listError, setListError] = useState("");
    const [noticeMessage, setNoticeMessage] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [total, setTotal] = useState(0);

    // ================== Assets States ==================
    const [assetFilterForm, setAssetFilterForm] = useState(initialAssetFilterForm);
    const [assetItems, setAssetItems] = useState([]);
    const [assetDrafts, setAssetDrafts] = useState({});
    const [selectedAssetRows, setSelectedAssetRows] = useState([]);
    const [assetRowErrors, setAssetRowErrors] = useState({});
    const [showAssetModal, setShowAssetModal] = useState(false);
    const [assetForm, setAssetForm] = useState(createEmptyAssetForm);
    const [assetFieldErrors, setAssetFieldErrors] = useState({});

    // ================== Accounts States ==================
    const [accountFilterForm, setAccountFilterForm] = useState(initialAccountFilterForm);
    const [accountItems, setAccountItems] = useState([]);
    const [accountDrafts, setAccountDrafts] = useState({});
    const [selectedAccountRows, setSelectedAccountRows] = useState([]);
    const [accountRowErrors, setAccountRowErrors] = useState({});
    const [showAccountModal, setShowAccountModal] = useState(false);
    const [accountForm, setAccountForm] = useState({ id: "", name: "", broker: "", currency: "KRW" });
    const [accountFieldErrors, setAccountFieldErrors] = useState({});

    // ================== Initialization ==================
    useEffect(() => {
        handleSearch();
    }, [activeTab]);

    const handleSearch = async () => {
        setNoticeMessage("");
        setListError("");
        if (activeTab === "assets") {
            await loadAssets();
        } else {
            await loadAccounts();
        }
    };

    const loadAssets = async () => {
        setIsListLoading(true);
        setListError(""); // Clear previous errors
        try {
            const query = buildAssetsListQuery(assetFilterForm);
            const response = await fetchAssetsList(query);
            const mapped = mapAssetListResponse(response);
            setAssetItems(mapped.items);
            setTotal(mapped.total);
            // Reset inline editing state
            setAssetDrafts({});
            setSelectedAssetRows([]);
            setAssetRowErrors({});
        } catch (error) {
            setListError(error.message || "자산 목록 조회 실패");
            setTotal(0); // Reset total on failure
            setAssetItems([]);
        } finally {
            setIsListLoading(false);
        }
    };

    const loadAccounts = async () => {
        setIsListLoading(true);
        setListError(""); // Clear previous errors
        try {
            const response = await fetchAccountsList({
                keyword: accountFilterForm.keyword,
                includeDeleted: accountFilterForm.includeDeleted,
            });
            const items = response.items || [];
            setAccountItems(items);
            setTotal(items.length);
            setAccountDrafts({});
            setSelectedAccountRows([]);
            setAccountRowErrors({});
        } catch (error) {
            setListError(error.message || "계좌 목록 조회 실패");
            setTotal(0); // Reset total on failure
            setAccountItems([]);
        } finally {
            setIsListLoading(false);
        }
    };

    // ================== Assets Handlers ==================
    const updateAssetDraft = (id, field, value) => {
        setAssetDrafts(prev => ({
            ...prev,
            [id]: { ...(prev[id] || {}), [field]: value }
        }));
    };

    const saveAssets = async () => {
        const dirtyItems = assetItems.filter(i => {
            const draft = assetDrafts[i.assetId];
            if (!draft) return false;
            return Object.keys(draft).some(k => draft[k] !== i[k]);
        });
        if (dirtyItems.length === 0) return;

        setIsSaving(true);
        let successCount = 0;
        for (const item of dirtyItems) {
            try {
                const payload = { ...item, ...assetDrafts[item.assetId] };
                const { payload: finalPayload, errors } = buildAssetUpsertPayload(payload, "edit");
                if (!finalPayload) {
                    const firstErr = Object.values(errors)[0];
                    setAssetRowErrors(prev => ({ ...prev, [item.assetId]: firstErr }));
                    continue;
                }
                await updateAsset(item.assetId, finalPayload);
                successCount++;
            } catch (err) {
                setAssetRowErrors(prev => ({ ...prev, [item.assetId]: err.message }));
            }
        }
        if (successCount > 0) {
            setNoticeMessage(`${successCount}건이 저장되었습니다.`);
            await loadAssets();
        }
        setIsSaving(false);
    };

    // ================== Accounts Handlers ==================
    const updateAccountDraft = (id, field, value) => {
        setAccountDrafts(prev => ({
            ...prev,
            [id]: { ...(prev[id] || {}), [field]: value }
        }));
    };

    const saveAccounts = async () => {
        const dirtyItems = accountItems.filter(i => {
            const draft = accountDrafts[i.id];
            if (!draft) return false;
            return Object.keys(draft).some(k => draft[k] !== i[k]);
        });
        if (dirtyItems.length === 0) return;

        setIsSaving(true);
        let successCount = 0;
        for (const item of dirtyItems) {
            try {
                const payload = { ...item, ...accountDrafts[item.id] };
                await updateAccount(item.id, payload);
                successCount++;
            } catch (err) {
                setAccountRowErrors(prev => ({ ...prev, [item.id]: err.message }));
            }
        }
        if (successCount > 0) {
            setNoticeMessage(`${successCount}건이 저장되었습니다.`);
            await loadAccounts();
        }
        setIsSaving(false);
    };

    const handleAccountCreateSave = async () => {
        if (!accountForm.id || !accountForm.name) {
            setAccountFieldErrors({ id: !accountForm.id ? "ID 필수" : "", name: !accountForm.name ? "명칭 필수" : "" });
            return;
        }
        setIsSaving(true);
        try {
            await createAccount(accountForm);
            setShowAccountModal(false);
            await loadAccounts();
            setNoticeMessage("계좌가 등록되었습니다.");
        } catch (err) {
            setListError(err.message);
        } finally {
            setIsSaving(false);
        }
    };



    // ================== Utils ==================
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

    return (
        <div className={styles.page}>
            <h1 className={styles.pageTitle}>메타 마스터 관리</h1>

            <div className={styles.tabsContainer}>
                <button
                    className={`${styles.tab} ${activeTab === "assets" ? styles.activeTab : ""}`}
                    onClick={() => setActiveTab("assets")}
                >
                    자산(종목) 마스터
                </button>
                <button
                    className={`${styles.tab} ${activeTab === "accounts" ? styles.activeTab : ""}`}
                    onClick={() => setActiveTab("accounts")}
                >
                    계좌 마스터
                </button>
            </div>

            {activeTab === "assets" ? (
                <>
                    {/* Asset Filter Section (simplified for brevity) */}
                    <section className={styles.card}>
                        <div className={styles.filterBar}>
                            <div className={styles.filterItem}>
                                <span className={styles.filterLabel}>자산유형</span>
                                <select
                                    className={styles.select}
                                    value={assetFilterForm.assetType}
                                    onChange={e => setAssetFilterForm({ ...assetFilterForm, assetType: e.target.value })}
                                >
                                    <option value="">전체</option>
                                    {ASSET_TYPE_OPTIONS.map(o => <option key={o} value={o}>{ASSET_TYPE_LABEL[o]}</option>)}
                                </select>
                            </div>
                            <div className={styles.filterItem}>
                                <span className={styles.filterLabel}>검색어</span>
                                <input
                                    className={styles.input}
                                    value={assetFilterForm.keyword}
                                    onChange={e => setAssetFilterForm({ ...assetFilterForm, keyword: e.target.value })}
                                    placeholder="자산명"
                                />
                            </div>
                            <div className={styles.filterItem}>
                                <span className={styles.filterLabel}>기타</span>
                                <label className={styles.filterCheckboxWrapper}>
                                    <input
                                        type="checkbox"
                                        checked={assetFilterForm.includeDeleted}
                                        onChange={e => setAssetFilterForm({ ...assetFilterForm, includeDeleted: e.target.checked })}
                                    />
                                    삭제 포함
                                </label>
                            </div>
                        </div>
                        <div className={styles.filterActions}>
                            <button className={`${styles.btnPrimary} ${styles.btnSearch}`} onClick={handleSearch}>조회</button>
                        </div>
                    </section>

                    <section className={`${styles.card} ${styles.gridCard}`}>
                        <div className={styles.gridHeader}>
                            <span className={styles.gridCount}>자산 목록 ({total})</span>
                            <div className={styles.toolbar}>
                                {selectedAssetRows.length > 0 && (
                                    <button className={styles.btnOutline} onClick={async () => {
                                        setIsDeleting(true);
                                        for (const id of selectedAssetRows) {
                                            const item = assetItems.find(i => i.assetId === id);
                                            if (item.deleted) await restoreAsset(id);
                                            else await deleteAsset(id);
                                        }
                                        await loadAssets();
                                        setIsDeleting(false);
                                    }}>
                                        {assetItems.find(i => selectedAssetRows.includes(i.assetId))?.deleted ? "선택 복원" : "선택 삭제"}
                                    </button>
                                )}
                                <button className={styles.btnPrimary} onClick={() => {
                                    setAssetForm(createEmptyAssetForm());
                                    setAssetFieldErrors({});
                                    setShowAssetModal(true);
                                }}>신규 등록</button>
                                {Object.keys(assetDrafts).length > 0 && <button className={styles.btnPrimary} onClick={saveAssets}>변경 저장</button>}
                            </div>
                        </div>

                        {noticeMessage && <div className={styles.noticeSuccess}>{noticeMessage}</div>}
                        {listError && <div className={styles.noticeError}>{listError}</div>}

                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th><input type="checkbox" checked={selectedAssetRows.length === assetItems.length && assetItems.length > 0} onChange={e => setSelectedAssetRows(e.target.checked ? assetItems.map(i => i.assetId) : [])} /></th>
                                    <th>코드</th>
                                    <th>명칭</th>
                                    <th>유형</th>
                                    <th>지역</th>
                                    <th>통화</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assetItems.map(item => (
                                    <tr key={item.assetId} className={`${styles.tableRow} ${item.deleted ? styles.tableRowDeleted : ""}`}>
                                        <td><input type="checkbox" checked={selectedAssetRows.includes(item.assetId)} onChange={e => setSelectedAssetRows(prev => e.target.checked ? [...prev, item.assetId] : prev.filter(x => x !== item.assetId))} /></td>
                                        <td>{item.assetId}</td>
                                        <td>
                                            <input className={styles.gridInput} value={assetDrafts[item.assetId]?.assetName ?? item.assetName} onChange={e => updateAssetDraft(item.assetId, "assetName", e.target.value)} />
                                            {assetRowErrors[item.assetId] && <div className={styles.rowError}>{assetRowErrors[item.assetId]}</div>}
                                        </td>
                                        <td>
                                            <select className={styles.gridSelect} value={assetDrafts[item.assetId]?.assetType ?? item.assetType} onChange={e => updateAssetDraft(item.assetId, "assetType", e.target.value)}>
                                                {ASSET_TYPE_OPTIONS.map(o => <option key={o} value={o}>{ASSET_TYPE_LABEL[o]}</option>)}
                                            </select>
                                        </td>
                                        <td>
                                            <select className={styles.gridSelect} value={assetDrafts[item.assetId]?.exposureRegion ?? item.exposureRegion} onChange={e => updateAssetDraft(item.assetId, "exposureRegion", e.target.value)}>
                                                {EXPOSURE_REGION_OPTIONS.map(o => <option key={o} value={o}>{EXPOSURE_REGION_LABEL[o]}</option>)}
                                            </select>
                                        </td>
                                        <td>{item.currency}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                </>
            ) : (
                <>
                    {/* Account Tab View */}
                    <section className={styles.card}>
                        <div className={styles.filterBar}>
                            <div className={styles.filterItem}>
                                <span className={styles.filterLabel}>검색어</span>
                                <input
                                    className={styles.input}
                                    value={accountFilterForm.keyword}
                                    onChange={e => setAccountFilterForm({ ...accountFilterForm, keyword: e.target.value })}
                                    placeholder="계좌명/증권사"
                                />
                            </div>
                            <div className={styles.filterItem}>
                                <span className={styles.filterLabel}>기타</span>
                                <label className={styles.filterCheckboxWrapper}>
                                    <input
                                        type="checkbox"
                                        checked={accountFilterForm.includeDeleted}
                                        onChange={e => setAccountFilterForm({ ...accountFilterForm, includeDeleted: e.target.checked })}
                                    />
                                    삭제 포함
                                </label>
                            </div>
                        </div>
                        <div className={styles.filterActions}>
                            <button className={`${styles.btnPrimary} ${styles.btnSearch}`} onClick={handleSearch}>조회</button>
                        </div>
                    </section>

                    <section className={`${styles.card} ${styles.gridCard}`}>
                        <div className={styles.gridHeader}>
                            <span className={styles.gridCount}>계좌 목록 ({total})</span>
                            <div className={styles.toolbar}>
                                {selectedAccountRows.length > 0 && (
                                    <button className={styles.btnOutline} onClick={async () => {
                                        setIsDeleting(true);
                                        setListError("");
                                        try {
                                            for (const id of selectedAccountRows) {
                                                const item = accountItems.find(i => i.id === id);
                                                if (item?.delYn === 'Y') await restoreAccount(id);
                                                else await deleteAccount(id);
                                            }
                                            setNoticeMessage("작업이 완료되었습니다.");
                                            await loadAccounts();
                                        } catch (err) {
                                            setListError(err.message || "삭제/복원 처리 중 오류 발생");
                                        } finally {
                                            setIsDeleting(false);
                                        }
                                    }}>
                                        {accountItems.find(i => selectedAccountRows.includes(i.id))?.delYn === 'Y' ? "선택 복원" : "선택 삭제"}
                                    </button>
                                )}
                                <button className={styles.btnPrimary} onClick={() => {
                                    setAccountForm({ id: "", name: "", broker: "", currency: "KRW" });
                                    setShowAccountModal(true);
                                }}>신규 등록</button>
                                {Object.keys(accountDrafts).length > 0 && <button className={styles.btnPrimary} onClick={saveAccounts}>변경 저장</button>}
                            </div>
                        </div>

                        {noticeMessage && <div className={styles.noticeSuccess}>{noticeMessage}</div>}
                        {listError && <div className={styles.noticeError}>{listError}</div>}

                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th><input type="checkbox" checked={selectedAccountRows.length === accountItems.length && accountItems.length > 0} onChange={e => setSelectedAccountRows(e.target.checked ? accountItems.map(i => i.id) : [])} /></th>
                                    <th>계좌ID</th>
                                    <th>계좌명</th>
                                    <th>증권사</th>
                                    <th>통화</th>
                                </tr>
                            </thead>
                            <tbody>
                                {accountItems.map(item => (
                                    <tr key={item.id} className={`${styles.tableRow} ${item.delYn === 'Y' ? styles.tableRowDeleted : ""}`}>
                                        <td><input type="checkbox" checked={selectedAccountRows.includes(item.id)} onChange={e => setSelectedAccountRows(prev => e.target.checked ? [...prev, item.id] : prev.filter(x => x !== item.id))} /></td>
                                        <td>{item.id}</td>
                                        <td>
                                            <input className={styles.gridInput} value={accountDrafts[item.id]?.name ?? item.name} onChange={e => updateAccountDraft(item.id, "name", e.target.value)} />
                                            {accountRowErrors[item.id] && <div className={styles.rowError}>{accountRowErrors[item.id]}</div>}
                                        </td>
                                        <td>
                                            <input className={styles.gridInput} value={accountDrafts[item.id]?.broker ?? item.broker ?? ""} onChange={e => updateAccountDraft(item.id, "broker", e.target.value)} />
                                        </td>
                                        <td>
                                            <select className={styles.gridSelect} value={accountDrafts[item.id]?.currency ?? item.currency} onChange={e => updateAccountDraft(item.id, "currency", e.target.value)}>
                                                {CURRENCY_OPTIONS.map(c => <option key={c} value={c}>{CURRENCY_LABEL[c]}</option>)}
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                </>
            )}

            {/* Asset Create Modal (Simplified version of PIPASSETS01 modal) */}
            {showAssetModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalBox} style={{ width: 500 }}>
                        <p className={styles.modalTitle}>자산 신규 등록</p>
                        <div className={styles.formGrid}>
                            <div className={styles.formField}>
                                <label className={styles.formFieldLabel}>자산코드</label>
                                <input className={styles.input} value={assetForm.assetId} onChange={e => setAssetForm({ ...assetForm, assetId: e.target.value.toUpperCase() })} />
                                {assetFieldErrors.assetId && <span className={styles.fieldError}>{assetFieldErrors.assetId}</span>}
                            </div>
                            <div className={styles.formField}>
                                <label className={styles.formFieldLabel}>자산명</label>
                                <input className={styles.input} value={assetForm.assetName} onChange={e => setAssetForm({ ...assetForm, assetName: e.target.value })} />
                                {assetFieldErrors.assetName && <span className={styles.fieldError}>{assetFieldErrors.assetName}</span>}
                            </div>
                            <div className={styles.formField}>
                                <label className={styles.formFieldLabel}>자산유형</label>
                                <select className={styles.select} value={assetForm.assetType} onChange={e => setAssetForm({ ...assetForm, assetType: e.target.value })}>
                                    <option value="">선택</option>
                                    {ASSET_TYPE_OPTIONS.map(o => <option key={o} value={o}>{ASSET_TYPE_LABEL[o]}</option>)}
                                </select>
                                {assetFieldErrors.assetType && <span className={styles.fieldError}>{assetFieldErrors.assetType}</span>}
                            </div>
                            <div className={styles.formField}>
                                <label className={styles.formFieldLabel}>지역</label>
                                <select className={styles.select} value={assetForm.exposureRegion} onChange={e => setAssetForm({ ...assetForm, exposureRegion: e.target.value })}>
                                    <option value="">선택</option>
                                    {EXPOSURE_REGION_OPTIONS.map(o => <option key={o} value={o}>{EXPOSURE_REGION_LABEL[o]}</option>)}
                                </select>
                                {assetFieldErrors.exposureRegion && <span className={styles.fieldError}>{assetFieldErrors.exposureRegion}</span>}
                            </div>
                            <div className={styles.formField}>
                                <label className={styles.formFieldLabel}>통화</label>
                                <select className={styles.select} value={assetForm.currency} onChange={e => setAssetForm({ ...assetForm, currency: e.target.value })}>
                                    <option value="">선택</option>
                                    {CURRENCY_OPTIONS.map(c => <option key={c} value={c}>{CURRENCY_LABEL[c]}</option>)}
                                </select>
                                {assetFieldErrors.currency && <span className={styles.fieldError}>{assetFieldErrors.currency}</span>}
                            </div>
                        </div>
                        <div className={styles.modalActions} style={{ marginTop: 20 }}>
                            <button className={styles.btnSecondary} onClick={() => setShowAssetModal(false)}>취소</button>
                            <button className={styles.btnPrimary} onClick={async () => {
                                const { payload, errors } = buildAssetUpsertPayload(assetForm, "create");
                                if (Object.keys(errors).length > 0) {
                                    setAssetFieldErrors(errors);
                                    return;
                                }
                                setIsSaving(true);
                                try {
                                    await createAsset(payload);
                                    setShowAssetModal(false);
                                    await loadAssets();
                                    setNoticeMessage("자산이 등록되었습니다.");
                                } catch (err) {
                                    setListError(err.message);
                                } finally {
                                    setIsSaving(false);
                                }
                            }}>저장</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Account Create Modal */}
            {showAccountModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalBox} style={{ width: 400 }}>
                        <p className={styles.modalTitle}>계좌 신규 등록</p>
                        <div className={styles.formField} style={{ marginBottom: 12 }}>
                            <label className={styles.formFieldLabel}>계좌ID (영문 대문자/숫자/_)</label>
                            <input
                                className={styles.input}
                                value={accountForm.id}
                                onChange={e => {
                                    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "");
                                    setAccountForm({ ...accountForm, id: val });
                                }}
                                placeholder="예: NH_YANG_01"
                            />
                        </div>
                        <div className={styles.formField} style={{ marginBottom: 12 }}>
                            <label className={styles.formFieldLabel}>계좌명</label>
                            <input className={styles.input} value={accountForm.name} onChange={e => setAccountForm({ ...accountForm, name: e.target.value })} />
                        </div>
                        <div className={styles.formField} style={{ marginBottom: 12 }}>
                            <label className={styles.formFieldLabel}>증권사</label>
                            <input className={styles.input} value={accountForm.broker} onChange={e => setAccountForm({ ...accountForm, broker: e.target.value })} />
                        </div>
                        <div className={styles.formField}>
                            <label className={styles.formFieldLabel}>기준 통화 (기본 KRW)</label>
                            <select className={styles.select} value={accountForm.currency} onChange={e => setAccountForm({ ...accountForm, currency: e.target.value })}>
                                {CURRENCY_OPTIONS.map(c => <option key={c} value={c}>{CURRENCY_LABEL[c]}</option>)}
                            </select>
                        </div>
                        <div className={styles.modalActions} style={{ marginTop: 20 }}>
                            <button className={styles.btnSecondary} onClick={() => setShowAccountModal(false)}>취소</button>
                            <button className={styles.btnPrimary} onClick={handleAccountCreateSave}>저장</button>
                        </div>
                    </div>
                </div>
            )}

            <button className={styles.scrollTopBtn} onClick={scrollToTop}>↑</button>
        </div>
    );
}

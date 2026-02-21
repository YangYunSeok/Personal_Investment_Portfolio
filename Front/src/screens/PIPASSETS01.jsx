import React, { useState, useMemo } from "react";
import {
  createAsset,
  deleteAsset,
  fetchAssetsList,
  updateAsset,
} from "../api/PIPASSETS01.api.js";
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

const initialFilterForm = {
  assetType: "",
  exposureRegion: "",
  keyword: "",
  includeDeleted: false,
};

export default function PIPASSETS01() {
  const [filterForm, setFilterForm] = useState(initialFilterForm);
  const [lastSearchQuery, setLastSearchQuery] = useState(null);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [isListLoading, setIsListLoading] = useState(false);
  const [listError, setListError] = useState("");

  // ================== Inline Edit States ==================
  const [drafts, setDrafts] = useState({}); // { [assetId]: { assetName, assetType, exposureRegion, currency } }
  const [selectedRows, setSelectedRows] = useState([]); // Array of assetId
  const [rowErrors, setRowErrors] = useState({}); // { [assetId]: error message }

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ================== Create Modal States ==================
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [assetForm, setAssetForm] = useState(createEmptyAssetForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [saveError, setSaveError] = useState("");

  const [noticeMessage, setNoticeMessage] = useState("");

  const updateFilter = (key) => (event) => {
    const value =
      key === "includeDeleted" ? event.target.checked : event.target.value;

    setFilterForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const loadList = async (query) => {
    setIsListLoading(true);
    setListError("");

    try {
      const response = await fetchAssetsList(query);
      const mapped = mapAssetListResponse(response);
      setItems(mapped.items);
      setTotal(mapped.total);

      // Reset inline editing state
      setDrafts({});
      setSelectedRows([]);
      setRowErrors({});

      return mapped.items;
    } catch (error) {
      setListError(error.message || "자산 목록 조회에 실패했습니다.");
      setItems([]);
      setTotal(0);
      return [];
    } finally {
      setIsListLoading(false);
    }
  };

  const handleSearch = async () => {
    setNoticeMessage("");
    const query = buildAssetsListQuery(filterForm);
    setLastSearchQuery(query);
    await loadList(query);
  };

  // ================== Inline Edit Logic ==================
  const updateDraft = (assetId, field, value) => {
    setNoticeMessage("");
    setDrafts(prev => {
      const currentDraft = prev[assetId] || {};
      return {
        ...prev,
        [assetId]: {
          ...currentDraft,
          [field]: value
        }
      };
    });

    // Clear error for this row when changed
    if (rowErrors[assetId]) {
      setRowErrors(prev => {
        const next = { ...prev };
        delete next[assetId];
        return next;
      });
    }
  };

  const isRowDirty = (assetId) => {
    const draft = drafts[assetId];
    if (!draft) return false;
    const original = items.find(i => i.assetId === assetId);
    if (!original) return false;

    return Object.keys(draft).some(key => draft[key] !== original[key]);
  };

  const dirtyItems = useMemo(() => {
    return items.filter(i => isRowDirty(i.assetId));
  }, [items, drafts]);

  const dirtyCount = dirtyItems.length;

  const handleSaveAll = async () => {
    if (dirtyCount === 0) return;

    setIsSaving(true);
    setNoticeMessage("");
    setListError("");
    setSaveError("");

    let successCount = 0;
    let failCount = 0;
    const newErrors = { ...rowErrors };

    // Parallel processing with allSettled
    const promises = dirtyItems.map(async (item) => {
      const draft = drafts[item.assetId];
      const mergedForm = { ...item, ...draft };

      const { payload, errors } = buildAssetUpsertPayload(mergedForm, "edit");
      if (Object.keys(errors).length > 0) {
        throw new Error(Object.values(errors).join(", "));
      }

      await updateAsset(item.assetId, payload);
      return item.assetId;
    });

    const results = await Promise.allSettled(promises);

    results.forEach((res, index) => {
      const assetId = dirtyItems[index].assetId;
      if (res.status === "fulfilled") {
        successCount++;
        delete newErrors[assetId];
      } else {
        failCount++;
        newErrors[assetId] = res.reason.message || "저장 실패";
      }
    });

    setRowErrors(newErrors);

    if (successCount > 0) {
      setNoticeMessage(`${successCount}건이 성공적으로 저장되었습니다.` + (failCount > 0 ? ` (${failCount}건 실패)` : ""));

      // Cleanup successful drafts
      setDrafts(prev => {
        const next = { ...prev };
        results.forEach((res, idx) => {
          if (res.status === "fulfilled") {
            delete next[dirtyItems[idx].assetId];
          }
        });
        return next;
      });

      // Refresh list
      const query = lastSearchQuery ?? buildAssetsListQuery(filterForm);
      try {
        const refreshedItems = await fetchAssetsList(query);
        const mapped = mapAssetListResponse(refreshedItems);
        // Do not use setDrafts({}) here because we want to preserve failures
        setItems(mapped.items);
        setTotal(mapped.total);
      } catch (e) {
        setListError("저장 후 재조회에 실패했습니다.");
      }
    } else {
      setListError("저장에 실패했습니다.");
    }

    setIsSaving(false);
  };

  const handleCancelAll = () => {
    setDrafts({});
    setRowErrors({});
    setNoticeMessage("");
    setListError("");
  };

  const handleSelectDelete = async () => {
    if (selectedRows.length === 0) return;
    if (!window.confirm(`선택한 ${selectedRows.length}건을 삭제(비활성) 처리하시겠습니까?`)) return;

    setIsDeleting(true);
    setNoticeMessage("");
    setListError("");

    let successCount = 0;
    let failCount = 0;

    for (const assetId of selectedRows) {
      try {
        await deleteAsset(assetId);
        successCount++;
      } catch (e) {
        failCount++;
      }
    }

    setNoticeMessage(`${successCount}건이 삭제 처리되었습니다.` + (failCount > 0 ? ` (${failCount}건 실패)` : ""));
    setSelectedRows([]);

    // Refresh list
    const query = lastSearchQuery ?? buildAssetsListQuery(filterForm);
    try {
      const refreshedItems = await fetchAssetsList(query);
      const mapped = mapAssetListResponse(refreshedItems);
      setItems(mapped.items);
      setTotal(mapped.total);
    } catch (e) {
      setListError("삭제 후 재조회에 실패했습니다.");
    }

    setIsDeleting(false);
  };

  // ================== Create Logic ==================
  const handleNewAsset = () => {
    setAssetForm(createEmptyAssetForm());
    setFieldErrors({});
    setSaveError("");
    setNoticeMessage("");
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
  };

  const updateForm = (key) => (event) => {
    const value = event.target.value;
    setAssetForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleCreateSave = async () => {
    setSaveError("");
    setNoticeMessage("");

    const { payload, errors } = buildAssetUpsertPayload(assetForm, "create");
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsSaving(true);

    try {
      await createAsset(payload);
      setNoticeMessage("자산이 정상적으로 등록되었습니다.");
      setShowCreateModal(false);

      const query = lastSearchQuery ?? buildAssetsListQuery(filterForm);
      await loadList(query);
    } catch (error) {
      setSaveError(error.message || "자산 마스터 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderCreateFormFields = () => (
    <div className={styles.formGrid}>
      <div className={styles.formField}>
        <label className={styles.formFieldLabel}>자산코드</label>
        <input
          type="text"
          className={styles.input}
          value={assetForm.assetId}
          onChange={(e) => {
            const upperValue = e.target.value.toUpperCase().replace(/[^A-Z]/g, "");
            setAssetForm((prev) => ({ ...prev, assetId: upperValue }));
            setFieldErrors((prev) => ({ ...prev, assetId: "" }));
          }}
          placeholder="예: AAPL"
        />
        {fieldErrors.assetId ? (
          <span className={styles.fieldError}>{fieldErrors.assetId}</span>
        ) : null}
      </div>

      <div className={styles.formField}>
        <label className={styles.formFieldLabel}>자산명</label>
        <input
          type="text"
          className={styles.input}
          value={assetForm.assetName}
          onChange={updateForm("assetName")}
          placeholder="예: Apple Inc."
        />
        {fieldErrors.assetName ? (
          <span className={styles.fieldError}>{fieldErrors.assetName}</span>
        ) : null}
      </div>

      <div className={styles.formField}>
        <label className={styles.formFieldLabel}>자산유형</label>
        <select
          className={styles.select}
          value={assetForm.assetType}
          onChange={updateForm("assetType")}
        >
          <option value="">선택</option>
          {ASSET_TYPE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {ASSET_TYPE_LABEL[option] ?? option}
            </option>
          ))}
        </select>
        {fieldErrors.assetType ? (
          <span className={styles.fieldError}>{fieldErrors.assetType}</span>
        ) : null}
      </div>

      <div className={styles.formField}>
        <label className={styles.formFieldLabel}>노출지역</label>
        <select
          className={styles.select}
          value={assetForm.exposureRegion}
          onChange={updateForm("exposureRegion")}
        >
          <option value="">선택</option>
          {EXPOSURE_REGION_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {EXPOSURE_REGION_LABEL[option] ?? option}
            </option>
          ))}
        </select>
        {fieldErrors.exposureRegion ? (
          <span className={styles.fieldError}>{fieldErrors.exposureRegion}</span>
        ) : null}
      </div>

      <div className={styles.formField}>
        <label className={styles.formFieldLabel}>통화</label>
        <select
          className={styles.select}
          value={assetForm.currency}
          onChange={updateForm("currency")}
        >
          <option value="">선택</option>
          {CURRENCY_OPTIONS.map((c) => (
            <option key={c} value={c}>
              {CURRENCY_LABEL[c] ?? c}
            </option>
          ))}
        </select>
        {fieldErrors.currency ? (
          <span className={styles.fieldError}>{fieldErrors.currency}</span>
        ) : null}
      </div>
    </div>
  );

  return (
    <div className={styles.page}>
      {/* ── 상단: 화면 타이틀 ──────────────────────── */}
      <h1 className={styles.pageTitle}>자산 메타 마스터</h1>

      {/* ── 중단: 필터 카드 ────────────────────────── */}
      <section aria-label="필터" className={styles.card}>
        <div className={styles.filterBar}>
          <div className={styles.filterItem}>
            <span className={styles.filterLabel}>자산유형</span>
            <select
              className={styles.select}
              value={filterForm.assetType}
              onChange={updateFilter("assetType")}
            >
              <option value="">전체</option>
              {ASSET_TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {ASSET_TYPE_LABEL[option] ?? option}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterItem}>
            <span className={styles.filterLabel}>노출지역</span>
            <select
              className={styles.select}
              value={filterForm.exposureRegion}
              onChange={updateFilter("exposureRegion")}
            >
              <option value="">전체</option>
              {EXPOSURE_REGION_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {EXPOSURE_REGION_LABEL[option] ?? option}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterItem}>
            <span className={styles.filterLabel}>검색어</span>
            <input
              type="text"
              className={styles.input}
              value={filterForm.keyword}
              onChange={updateFilter("keyword")}
              placeholder="자산코드 / 자산명"
            />
          </div>

          <label className={styles.filterCheckboxWrapper}>
            <input
              type="checkbox"
              checked={filterForm.includeDeleted}
              onChange={updateFilter("includeDeleted")}
            />
            삭제 포함
          </label>

          <button
            type="button"
            className={styles.btnPrimary}
            onClick={handleSearch}
            disabled={isListLoading}
          >
            {isListLoading ? "조회 중..." : "조회"}
          </button>
        </div>
      </section>

      {/* ── 하단: Master Grid (Inline Edit) ──────────── */}
      <section aria-label="마스터 그리드" className={styles.card}>
        <div className={styles.gridHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className={styles.gridCount}>목록 ({total})</span>
            {dirtyCount > 0 && (
              <span className={styles.dirtyBadge}>변경사항 {dirtyCount}건</span>
            )}
          </div>
          <div className={styles.toolbar}>
            {selectedRows.length > 0 && (
              <button
                type="button"
                className={styles.btnOutline}
                onClick={handleSelectDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "삭제 중..." : "선택 삭제"}
              </button>
            )}
            {dirtyCount > 0 && (
              <>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={handleCancelAll}
                  disabled={isSaving}
                >
                  취소
                </button>
                <button
                  type="button"
                  className={styles.btnPrimary}
                  onClick={handleSaveAll}
                  disabled={isSaving}
                >
                  {isSaving ? "저장 중..." : "저장"}
                </button>
              </>
            )}
            <button
              type="button"
              className={dirtyCount > 0 ? styles.btnSecondary : styles.btnPrimary}
              onClick={handleNewAsset}
            >
              신규 등록
            </button>
          </div>
        </div>

        {noticeMessage ? (
          <div className={styles.noticeSuccess}>{noticeMessage}</div>
        ) : null}
        {listError ? (
          <div className={styles.noticeError}>{listError}</div>
        ) : null}

        <div style={{ overflowX: "auto" }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: 40, textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={items.length > 0 && selectedRows.length === items.length}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedRows(items.map((i) => i.assetId));
                      else setSelectedRows([]);
                    }}
                  />
                </th>
                <th>자산코드</th>
                <th>자산명</th>
                <th>자산유형</th>
                <th>노출지역</th>
                <th>통화</th>
                <th>수정일시</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.tableEmpty}>
                    조회 조건에 맞는 자산이 없습니다.
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const isDirty = isRowDirty(item.assetId);
                  const rowError = rowErrors[item.assetId];
                  const draft = drafts[item.assetId] || {};

                  return (
                    <tr
                      key={item.assetId}
                      className={`${styles.tableRow} ${isDirty ? styles.tableRowDirty : ""}`}
                    >
                      <td style={{ textAlign: "center" }}>
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(item.assetId)}
                          onChange={(e) => {
                            if (e.target.checked)
                              setSelectedRows((prev) => [...prev, item.assetId]);
                            else
                              setSelectedRows((prev) =>
                                prev.filter((id) => id !== item.assetId)
                              );
                          }}
                        />
                      </td>
                      <td>{item.assetId}</td>
                      <td>
                        <input
                          type="text"
                          className={styles.gridInput}
                          value={draft.assetName ?? item.assetName}
                          onChange={(e) =>
                            updateDraft(item.assetId, "assetName", e.target.value)
                          }
                        />
                        {rowError && <span className={styles.rowError}>{rowError}</span>}
                      </td>
                      <td>
                        <select
                          className={styles.gridSelect}
                          value={draft.assetType ?? item.assetType}
                          onChange={(e) =>
                            updateDraft(item.assetId, "assetType", e.target.value)
                          }
                        >
                          {ASSET_TYPE_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {ASSET_TYPE_LABEL[opt]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select
                          className={styles.gridSelect}
                          value={draft.exposureRegion ?? item.exposureRegion}
                          onChange={(e) =>
                            updateDraft(item.assetId, "exposureRegion", e.target.value)
                          }
                        >
                          {EXPOSURE_REGION_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {EXPOSURE_REGION_LABEL[opt]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select
                          className={styles.gridSelect}
                          value={draft.currency ?? item.currency}
                          onChange={(e) =>
                            updateDraft(item.assetId, "currency", e.target.value)
                          }
                        >
                          {CURRENCY_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {CURRENCY_LABEL[opt]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>{item.updatedAtDisplay}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 신규 등록 모달 ──────────────────────────── */}
      {showCreateModal ? (
        <div role="dialog" aria-modal="true" className={styles.modalOverlay}>
          <div
            className={styles.modalBox}
            style={{ width: "500px", maxWidth: "90%" }}
          >
            <p className={styles.modalTitle}>자산 신규 등록</p>
            {saveError ? (
              <div className={styles.noticeError}>{saveError}</div>
            ) : null}

            {renderCreateFormFields()}

            <div className={styles.modalActions} style={{ marginTop: 24 }}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={closeCreateModal}
                disabled={isSaving}
              >
                취소
              </button>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={handleCreateSave}
                disabled={isSaving}
              >
                {isSaving ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

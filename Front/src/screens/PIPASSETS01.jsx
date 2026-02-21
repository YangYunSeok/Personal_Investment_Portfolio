/**
 * ScreenID: PIPASSETS01
 * Screen Name: 전체 종목 확인 화면
 * Purpose: 자산 마스터 조회 및 관리
 * 주요 동작: 조회
 * 연관 SSOT 문서:
 * - docs/design/_index.md
 * - docs/design/ui/PIPASSETS01_UI.md
 * - docs/design/api/PIPASSETS01_API.md
 * - docs/design/model/PIPASSETS01_MODEL.md
 * - docs/design/db/PIPASSETS01_DB.md
 * 금지 규칙:
 * - 계산값 저장 금지
 * - 단일 원장 원칙 위반 금지
 * - SSOT 미정의 필드/흐름 임의 추가 금지
 */
import React, { useState } from "react";
import {
  createAsset,
  deleteAsset,
  fetchAssetById,
  fetchAssetsList,
  updateAsset,
} from "../api/PIPASSETS01.api.js";
import {
  ASSET_TYPE_LABEL,
  ASSET_TYPE_OPTIONS,
  CURRENCY_OPTIONS,
  EXPOSURE_REGION_LABEL,
  EXPOSURE_REGION_OPTIONS,
  buildAssetUpsertPayload,
  buildAssetsListQuery,
  createEmptyAssetForm,
  mapAssetDetailToForm,
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

  const [mode, setMode] = useState("create");
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [assetForm, setAssetForm] = useState(createEmptyAssetForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState("");

  const updateFilter = (key) => (event) => {
    const value =
      key === "includeDeleted" ? event.target.checked : event.target.value;

    setFilterForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateForm = (key) => (event) => {
    const value = event.target.value;
    setAssetForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const loadList = async (query) => {
    setIsListLoading(true);
    setListError("");

    try {
      const response = await fetchAssetsList(query);
      const mapped = mapAssetListResponse(response);
      setItems(mapped.items);
      setTotal(mapped.total);
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

  const handleNewAsset = () => {
    setMode("create");
    setSelectedAssetId("");
    setAssetForm(createEmptyAssetForm());
    setFieldErrors({});
    setSaveError("");
    setNoticeMessage("");
  };

  const handleSelectRow = async (assetId) => {
    setMode("edit");
    setSelectedAssetId(assetId);
    setFieldErrors({});
    setSaveError("");
    setNoticeMessage("");

    try {
      const detail = await fetchAssetById(assetId);
      setAssetForm(mapAssetDetailToForm(detail));
    } catch (error) {
      setSaveError(error.message || "자산 상세 조회에 실패했습니다.");
    }
  };

  const reloadAfterMutation = async (assetIdForSelection) => {
    const query = lastSearchQuery ?? buildAssetsListQuery(filterForm);
    setLastSearchQuery(query);
    const refreshedItems = await loadList(query);

    if (!assetIdForSelection) return;

    const exists = refreshedItems.some(
      (item) => item.assetId === assetIdForSelection
    );
    if (!exists) {
      setMode("create");
      setSelectedAssetId("");
      return;
    }

    await handleSelectRow(assetIdForSelection);
  };

  const handleSave = async () => {
    setSaveError("");
    setNoticeMessage("");

    const { payload, errors } = buildAssetUpsertPayload(assetForm, mode);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsSaving(true);

    try {
      if (mode === "create") {
        const created = await createAsset(payload);
        setNoticeMessage("자산이 등록되었습니다.");
        await reloadAfterMutation(created.assetId);
      } else {
        await updateAsset(selectedAssetId, payload);
        setNoticeMessage("자산이 수정되었습니다.");
        await reloadAfterMutation(selectedAssetId);
      }
    } catch (error) {
      setSaveError(error.message || "자산 마스터 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const requestDelete = () => {
    setSaveError("");
    setNoticeMessage("");
    setShowDeleteConfirm(true);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    setSaveError("");
    setNoticeMessage("");

    try {
      await deleteAsset(selectedAssetId);
      setShowDeleteConfirm(false);
      setNoticeMessage("자산이 삭제(비활성) 처리되었습니다.");
      await reloadAfterMutation("");
      setMode("create");
      setSelectedAssetId("");
      setAssetForm(createEmptyAssetForm());
    } catch (error) {
      setSaveError(error.message || "자산 삭제 처리에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

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
              placeholder="종목ID / 종목명"
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

      {/* ── 하단: 좌우 2단 레이아웃 ─────────────────── */}
      <div className={styles.contentRow}>
        {/* ── 좌측 60%: Master Grid ──────────────────── */}
        <section aria-label="마스터 그리드" className={`${styles.card} ${styles.gridPanel}`} style={{ minWidth: 0, overflow: "hidden" }}>
          <div className={styles.gridHeader}>
            <span className={styles.gridCount}>목록 ({total})</span>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={handleNewAsset}
            >
              신규 등록
            </button>
          </div>

          {listError ? (
            <div className={styles.noticeError}>{listError}</div>
          ) : null}

          <table className={styles.table}>
            <thead>
              <tr>
                {["종목ID", "종목명", "자산유형", "노출지역", "통화", "삭제여부", "수정일시"].map(
                  (col) => (
                    <th key={col}>{col}</th>
                  )
                )}
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
                  const isSelected = selectedAssetId === item.assetId;
                  return (
                    <tr
                      key={item.assetId}
                      onClick={() => handleSelectRow(item.assetId)}
                      className={`${styles.tableRow} ${isSelected ? styles.tableRowSelected : ""}`}
                    >
                      <td>{item.assetId}</td>
                      <td>{item.assetName}</td>
                      <td>{item.assetType}</td>
                      <td>{item.exposureRegion}</td>
                      <td>{item.currency}</td>
                      <td>{String(item.deleted)}</td>
                      <td>{item.updatedAtDisplay}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </section>

        {/* ── 우측 40%: 등록/수정 Form 카드 ──────────── */}
        <section aria-label="등록 수정 패널" className={`${styles.card} ${styles.formPanel}`} style={{ minWidth: 0, overflow: "hidden" }}>
          <h2 className={styles.cardTitle}>
            {mode === "create" ? "신규 등록" : `수정: ${selectedAssetId}`}
          </h2>

          {noticeMessage ? (
            <div className={styles.noticeSuccess}>{noticeMessage}</div>
          ) : null}
          {saveError ? (
            <div className={styles.noticeError}>{saveError}</div>
          ) : null}

          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label className={styles.formFieldLabel}>종목ID</label>
              <input
                type="text"
                className={styles.input}
                value={assetForm.assetId}
                onChange={updateForm("assetId")}
                disabled={mode === "edit"}
                placeholder="예: AAPL"
              />
              {fieldErrors.assetId ? (
                <span className={styles.fieldError}>{fieldErrors.assetId}</span>
              ) : null}
            </div>

            <div className={styles.formField}>
              <label className={styles.formFieldLabel}>종목명</label>
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
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {fieldErrors.currency ? (
                <span className={styles.fieldError}>{fieldErrors.currency}</span>
              ) : null}
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "저장 중..." : "저장"}
            </button>
            <button
              type="button"
              className={styles.btnOutline}
              onClick={requestDelete}
              disabled={mode !== "edit" || isDeleting}
            >
              삭제
            </button>
          </div>
        </section>
      </div>

      {/* ── 삭제 확인 모달 ──────────────────────────── */}
      {showDeleteConfirm ? (
        <div role="dialog" aria-modal="true" className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <p className={styles.modalTitle}>삭제 확인</p>
            <p className={styles.modalDesc}>
              선택한 자산을 삭제(비활성) 처리하시겠습니까?
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={cancelDelete}
                disabled={isDeleting}
              >
                취소
              </button>
              <button
                type="button"
                className={styles.btnOutline}
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "처리 중..." : "확인"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

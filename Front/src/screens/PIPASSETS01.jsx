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
  ASSET_TYPE_OPTIONS,
  EXPOSURE_REGION_OPTIONS,
  buildAssetUpsertPayload,
  buildAssetsListQuery,
  createEmptyAssetForm,
  mapAssetDetailToForm,
  mapAssetListResponse,
} from "../api/PIPASSETS01.mapper.js";

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
    <div style={{ padding: 16 }}>
      <h1 style={{ margin: 0, marginBottom: 12 }}>PIPASSETS01 · Asset Master</h1>

      <section
        aria-label="필터"
        style={{
          border: "1px solid #ddd",
          borderRadius: 6,
          padding: 12,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(140px, 1fr))",
            gap: 12,
            alignItems: "end",
          }}
        >
          <label>
            <div style={{ fontSize: 12, marginBottom: 4 }}>assetType</div>
            <select value={filterForm.assetType} onChange={updateFilter("assetType")}>
              <option value="">전체</option>
              {ASSET_TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label>
            <div style={{ fontSize: 12, marginBottom: 4 }}>exposureRegion</div>
            <select
              value={filterForm.exposureRegion}
              onChange={updateFilter("exposureRegion")}
            >
              <option value="">전체</option>
              {EXPOSURE_REGION_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label>
            <div style={{ fontSize: 12, marginBottom: 4 }}>keyword</div>
            <input
              type="text"
              value={filterForm.keyword}
              onChange={updateFilter("keyword")}
              placeholder="assetId / assetName"
            />
          </label>

          <label style={{ display: "flex", gap: 8, alignItems: "center", height: 32 }}>
            <input
              type="checkbox"
              checked={filterForm.includeDeleted}
              onChange={updateFilter("includeDeleted")}
            />
            <span>includeDeleted</span>
          </label>

          <button type="button" onClick={handleSearch} disabled={isListLoading}>
            {isListLoading ? "조회 중..." : "조회"}
          </button>
        </div>
      </section>

      <section
        aria-label="마스터 그리드"
        style={{
          border: "1px solid #ddd",
          borderRadius: 6,
          padding: 12,
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <strong>목록 ({total})</strong>
          <button type="button" onClick={handleNewAsset}>
            신규 등록
          </button>
        </div>

        {listError ? (
          <div style={{ color: "#b00020", marginBottom: 8 }}>{listError}</div>
        ) : null}

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {[
                "assetId",
                "assetName",
                "assetType",
                "exposureRegion",
                "currency",
                "deleted",
                "updatedAt",
              ].map((col) => (
                <th
                  key={col}
                  style={{
                    borderBottom: "1px solid #ddd",
                    textAlign: "left",
                    padding: "8px 6px",
                    fontSize: 13,
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: 14, color: "#666" }}>
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
                    style={{
                      backgroundColor: isSelected ? "#f2f6ff" : "transparent",
                      cursor: "pointer",
                    }}
                  >
                    <td style={{ borderBottom: "1px solid #eee", padding: "8px 6px" }}>
                      {item.assetId}
                    </td>
                    <td style={{ borderBottom: "1px solid #eee", padding: "8px 6px" }}>
                      {item.assetName}
                    </td>
                    <td style={{ borderBottom: "1px solid #eee", padding: "8px 6px" }}>
                      {item.assetType}
                    </td>
                    <td style={{ borderBottom: "1px solid #eee", padding: "8px 6px" }}>
                      {item.exposureRegion}
                    </td>
                    <td style={{ borderBottom: "1px solid #eee", padding: "8px 6px" }}>
                      {item.currency}
                    </td>
                    <td style={{ borderBottom: "1px solid #eee", padding: "8px 6px" }}>
                      {String(item.deleted)}
                    </td>
                    <td style={{ borderBottom: "1px solid #eee", padding: "8px 6px" }}>
                      {item.updatedAtDisplay}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </section>

      <section
        aria-label="등록 수정 패널"
        style={{
          border: "1px solid #ddd",
          borderRadius: 6,
          padding: 12,
        }}
      >
        <h2 style={{ margin: "0 0 12px" }}>
          {mode === "create" ? "신규 등록" : `수정: ${selectedAssetId}`}
        </h2>

        {noticeMessage ? (
          <div style={{ color: "#136f2d", marginBottom: 8 }}>{noticeMessage}</div>
        ) : null}
        {saveError ? (
          <div style={{ color: "#b00020", marginBottom: 8 }}>{saveError}</div>
        ) : null}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(220px, 1fr))",
            gap: 12,
          }}
        >
          <label>
            <div style={{ fontSize: 12, marginBottom: 4 }}>assetId</div>
            <input
              type="text"
              value={assetForm.assetId}
              onChange={updateForm("assetId")}
              disabled={mode === "edit"}
              placeholder="예: AAPL"
            />
            {fieldErrors.assetId ? (
              <div style={{ color: "#b00020", fontSize: 12 }}>{fieldErrors.assetId}</div>
            ) : null}
          </label>

          <label>
            <div style={{ fontSize: 12, marginBottom: 4 }}>assetName</div>
            <input
              type="text"
              value={assetForm.assetName}
              onChange={updateForm("assetName")}
              placeholder="예: Apple Inc."
            />
            {fieldErrors.assetName ? (
              <div style={{ color: "#b00020", fontSize: 12 }}>{fieldErrors.assetName}</div>
            ) : null}
          </label>

          <label>
            <div style={{ fontSize: 12, marginBottom: 4 }}>assetType</div>
            <select value={assetForm.assetType} onChange={updateForm("assetType")}>
              <option value="">선택</option>
              {ASSET_TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {fieldErrors.assetType ? (
              <div style={{ color: "#b00020", fontSize: 12 }}>{fieldErrors.assetType}</div>
            ) : null}
          </label>

          <label>
            <div style={{ fontSize: 12, marginBottom: 4 }}>exposureRegion</div>
            <select
              value={assetForm.exposureRegion}
              onChange={updateForm("exposureRegion")}
            >
              <option value="">선택</option>
              {EXPOSURE_REGION_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {fieldErrors.exposureRegion ? (
              <div style={{ color: "#b00020", fontSize: 12 }}>
                {fieldErrors.exposureRegion}
              </div>
            ) : null}
          </label>

          <label>
            <div style={{ fontSize: 12, marginBottom: 4 }}>currency</div>
            <input
              type="text"
              value={assetForm.currency}
              onChange={updateForm("currency")}
              placeholder="예: USD"
            />
            {fieldErrors.currency ? (
              <div style={{ color: "#b00020", fontSize: 12 }}>{fieldErrors.currency}</div>
            ) : null}
          </label>
        </div>

        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          <button type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "저장 중..." : "저장"}
          </button>
          <button
            type="button"
            onClick={requestDelete}
            disabled={mode !== "edit" || isDeleting}
          >
            삭제
          </button>
        </div>
      </section>

      {showDeleteConfirm ? (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.3)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: 360,
              background: "white",
              borderRadius: 8,
              padding: 16,
              border: "1px solid #ddd",
            }}
          >
            <p style={{ marginTop: 0 }}>
              선택한 자산을 삭제(비활성) 처리하시겠습니까?
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button type="button" onClick={cancelDelete} disabled={isDeleting}>
                취소
              </button>
              <button type="button" onClick={confirmDelete} disabled={isDeleting}>
                {isDeleting ? "처리 중..." : "확인"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

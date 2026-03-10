import React, { useEffect, useState } from "react";
import {
  createCommonCode,
  fetchCommonCodeGroups,
  fetchCommonCodes,
  updateCommonCode,
  updateCommonCodeStatus,
} from "../../api/PIPCMCD01.api.js";
import { invalidateCommonCodeCache } from "../../hooks/useCommonCodes.js";
import styles from "./PIPSETTINGS01.module.css";

const PINNED_GROUPS = ["ASSET_TYPE", "EXPOSURE_REGION", "TX_CCY_CD"];

function sortGroups(groups) {
  return [...groups].sort((left, right) => {
    const leftIndex = PINNED_GROUPS.indexOf(left.codeGroupId);
    const rightIndex = PINNED_GROUPS.indexOf(right.codeGroupId);
    const leftRank = leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex;
    const rightRank = rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex;

    if (leftRank !== rightRank) {
      return leftRank - rightRank;
    }

    return left.codeGroupId.localeCompare(right.codeGroupId);
  });
}

function createEmptyForm(selectedGroupId = "") {
  return {
    codeGroupId: selectedGroupId,
    codeId: "",
    codeName: "",
    codeDesc: "",
    sortOrder: 999,
    useYn: "Y",
    delYn: "N",
  };
}

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ko-KR");
}

function normalizeForm(form) {
  return {
    codeGroupId: String(form.codeGroupId || "").trim().toUpperCase(),
    codeId: String(form.codeId || "").trim().toUpperCase(),
    codeName: String(form.codeName || "").trim(),
    codeDesc: String(form.codeDesc || "").trim(),
    sortOrder: Number(form.sortOrder),
    useYn: form.useYn === "N" ? "N" : "Y",
    delYn: form.delYn === "Y" ? "Y" : "N",
  };
}

function validateForm(form, mode) {
  const normalized = normalizeForm(form);
  const errors = {};

  if (!normalized.codeGroupId) {
    errors.codeGroupId = "코드그룹은 필수입니다.";
  } else if (!/^[A-Z0-9_]+$/.test(normalized.codeGroupId)) {
    errors.codeGroupId = "코드그룹은 영문 대문자, 숫자, _ 만 가능합니다.";
  }

  if (!normalized.codeId) {
    errors.codeId = "코드는 필수입니다.";
  } else if (!/^[A-Z0-9_]+$/.test(normalized.codeId)) {
    errors.codeId = "코드는 영문 대문자, 숫자, _ 만 가능합니다.";
  }

  if (!normalized.codeName) {
    errors.codeName = "코드명은 필수입니다.";
  }

  if (!Number.isFinite(normalized.sortOrder)) {
    errors.sortOrder = "정렬순서는 숫자여야 합니다.";
  }

  if (mode === "edit") {
    normalized.codeGroupId = form.codeGroupId;
    normalized.codeId = form.codeId;
  }

  return { normalized, errors };
}

export default function PIPSETTINGS01() {
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [items, setItems] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(createEmptyForm());
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadGroups();
  }, [includeDeleted]);

  useEffect(() => {
    if (!selectedGroupId) {
      setItems([]);
      return;
    }

    loadCodes(selectedGroupId);
  }, [selectedGroupId, includeDeleted]);

  const loadGroups = async (preferredGroupId) => {
    setGroupsLoading(true);
    setError("");

    try {
      const response = await fetchCommonCodeGroups({ includeDeleted });
      const nextGroups = sortGroups(response.items || []);
      setGroups(nextGroups);
      setSelectedGroupId(prev => {
        const candidate = preferredGroupId || prev;
        if (candidate && nextGroups.some(item => item.codeGroupId === candidate)) {
          return candidate;
        }
        return nextGroups[0]?.codeGroupId || "";
      });
    } catch (err) {
      setError(err.message || "코드그룹 조회에 실패했습니다.");
    } finally {
      setGroupsLoading(false);
    }
  };

  const loadCodes = async (groupId) => {
    setItemsLoading(true);
    setError("");

    try {
      const response = await fetchCommonCodes([groupId], {
        includeInactive: true,
        includeDeleted,
      });
      setItems(response[groupId] || []);
    } catch (err) {
      setError(err.message || "공통코드 조회에 실패했습니다.");
    } finally {
      setItemsLoading(false);
    }
  };

  const selectedGroup = groups.find(group => group.codeGroupId === selectedGroupId) || null;

  const openCreateModal = () => {
    setModalMode("create");
    setForm(createEmptyForm(selectedGroupId));
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setModalMode("edit");
    setForm({
      codeGroupId: item.codeGroupId,
      codeId: item.codeId,
      codeName: item.codeName,
      codeDesc: item.codeDesc || "",
      sortOrder: item.sortOrder,
      useYn: item.useYn,
      delYn: item.delYn,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setFormErrors({});
  };

  const refreshCurrentGroup = async (groupId = selectedGroupId) => {
    invalidateCommonCodeCache(groupId ? [groupId] : undefined);
    await loadGroups(groupId);
    if (groupId) {
      await loadCodes(groupId);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const { normalized, errors } = validateForm(form, modalMode);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      if (modalMode === "create") {
        await createCommonCode(normalized);
        setNotice("공통코드가 등록되었습니다.");
      } else {
        await updateCommonCode(form.codeGroupId, form.codeId, normalized);
        setNotice("공통코드가 수정되었습니다.");
      }

      setModalOpen(false);
      await refreshCurrentGroup(normalized.codeGroupId);
      setSelectedGroupId(normalized.codeGroupId);
    } catch (err) {
      setError(err.message || "공통코드 저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleUse = async (item) => {
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const nextUseYn = item.useYn === "Y" ? "N" : "Y";
      await updateCommonCodeStatus(item.codeGroupId, item.codeId, { useYn: nextUseYn });
      setNotice(nextUseYn === "Y" ? "코드가 활성화되었습니다." : "코드가 비활성화되었습니다.");
      await refreshCurrentGroup(item.codeGroupId);
    } catch (err) {
      setError(err.message || "상태 변경에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleDelete = async (item) => {
    const nextDelYn = item.delYn === "Y" ? "N" : "Y";
    const confirmed = nextDelYn === "Y"
      ? window.confirm(`${item.codeId} 코드를 삭제표시하시겠습니까? 실제 삭제가 아니라 숨김 처리됩니다.`)
      : true;

    if (!confirmed) {
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      await updateCommonCodeStatus(item.codeGroupId, item.codeId, {
        delYn: nextDelYn,
        useYn: nextDelYn === "Y" ? "N" : item.useYn,
      });
      setNotice(nextDelYn === "Y" ? "코드가 삭제표시되었습니다." : "코드가 복구되었습니다.");
      await refreshCurrentGroup(item.codeGroupId);
    } catch (err) {
      setError(err.message || "삭제표시 처리에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Settings</h1>
          <p className={styles.pageDescription}>공통코드 그룹과 상세 코드를 관리합니다. 자산유형, 노출지역, 통화는 여기서 등록하고 업무 화면은 이 값을 그대로 사용합니다.</p>
        </div>
        <div className={styles.headerActions}>
          <label className={styles.toggleLabel}>
            <input
              type="checkbox"
              checked={includeDeleted}
              onChange={(event) => setIncludeDeleted(event.target.checked)}
            />
            삭제표시 포함
          </label>
          <button type="button" className={styles.secondaryButton} onClick={() => refreshCurrentGroup()} disabled={groupsLoading || itemsLoading || saving}>
            새로고침
          </button>
          <button type="button" className={styles.primaryButton} onClick={openCreateModal} disabled={saving}>
            신규 코드
          </button>
        </div>
      </div>

      {notice ? <div className={styles.noticeSuccess}>{notice}</div> : null}
      {error ? <div className={styles.noticeError}>{error}</div> : null}

      <div className={styles.layout}>
        <section className={styles.groupPanel}>
          <div className={styles.panelHeader}>
            <h2>코드그룹</h2>
            <span>{groups.length}개</span>
          </div>

          {groupsLoading ? (
            <div className={styles.emptyState}>코드그룹을 불러오는 중입니다.</div>
          ) : groups.length === 0 ? (
            <div className={styles.emptyState}>등록된 코드그룹이 없습니다. 신규 코드를 등록해 첫 그룹을 생성할 수 있습니다.</div>
          ) : (
            <div className={styles.groupList}>
              {groups.map(group => {
                const isActive = group.codeGroupId === selectedGroupId;
                return (
                  <button
                    key={group.codeGroupId}
                    type="button"
                    className={`${styles.groupItem} ${isActive ? styles.groupItemActive : ""}`}
                    onClick={() => setSelectedGroupId(group.codeGroupId)}
                  >
                    <div className={styles.groupTitleRow}>
                      <strong>{group.codeGroupId}</strong>
                      <span className={styles.groupBadge}>{group.activeCount}/{group.totalCount}</span>
                    </div>
                    <span className={styles.groupMeta}>최근 수정 {formatDateTime(group.modDt)}</span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className={styles.detailPanel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>{selectedGroupId || "코드 상세"}</h2>
              <span>{selectedGroup ? `활성 ${selectedGroup.activeCount}건 / 전체 ${selectedGroup.totalCount}건` : "코드그룹을 선택하세요."}</span>
            </div>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>CD_GRP_ID</th>
                  <th>CD_ID</th>
                  <th>CD_NM</th>
                  <th>CD_DESC</th>
                  <th>SORT_ORD</th>
                  <th>USE_YN</th>
                  <th>DEL_YN</th>
                  <th>REG_DT</th>
                  <th>MOD_DT</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {!selectedGroupId ? (
                  <tr>
                    <td colSpan="10" className={styles.emptyCell}>코드그룹을 선택하세요.</td>
                  </tr>
                ) : itemsLoading ? (
                  <tr>
                    <td colSpan="10" className={styles.emptyCell}>코드 목록을 불러오는 중입니다.</td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan="10" className={styles.emptyCell}>조회된 코드가 없습니다.</td>
                  </tr>
                ) : (
                  items.map(item => (
                    <tr key={`${item.codeGroupId}-${item.codeId}`} className={item.delYn === "Y" ? styles.deletedRow : ""}>
                      <td>{item.codeGroupId}</td>
                      <td>{item.codeId}</td>
                      <td>{item.codeName}</td>
                      <td>{item.codeDesc || "-"}</td>
                      <td>{item.sortOrder}</td>
                      <td>{item.useYn}</td>
                      <td>{item.delYn}</td>
                      <td>{formatDateTime(item.regDt)}</td>
                      <td>{formatDateTime(item.modDt)}</td>
                      <td>
                        <div className={styles.rowActions}>
                          <button type="button" className={styles.linkButton} onClick={() => openEditModal(item)} disabled={saving}>
                            수정
                          </button>
                          <button type="button" className={styles.linkButton} onClick={() => handleToggleUse(item)} disabled={saving || item.delYn === "Y"}>
                            {item.useYn === "Y" ? "비활성화" : "활성화"}
                          </button>
                          <button type="button" className={styles.linkButtonDanger} onClick={() => handleToggleDelete(item)} disabled={saving}>
                            {item.delYn === "Y" ? "복구" : "삭제표시"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {modalOpen ? (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>{modalMode === "create" ? "신규 공통코드 등록" : "공통코드 수정"}</h3>
              <button type="button" className={styles.closeButton} onClick={closeModal}>닫기</button>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.formGrid}>
                <label className={styles.field}>
                  <span>코드그룹</span>
                  <input
                    value={form.codeGroupId}
                    onChange={(event) => setForm(prev => ({ ...prev, codeGroupId: event.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "") }))}
                    disabled={modalMode === "edit"}
                  />
                  {formErrors.codeGroupId ? <em>{formErrors.codeGroupId}</em> : null}
                </label>

                <label className={styles.field}>
                  <span>코드</span>
                  <input
                    value={form.codeId}
                    onChange={(event) => setForm(prev => ({ ...prev, codeId: event.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "") }))}
                    disabled={modalMode === "edit"}
                  />
                  {formErrors.codeId ? <em>{formErrors.codeId}</em> : null}
                </label>

                <label className={styles.field}>
                  <span>코드명</span>
                  <input
                    value={form.codeName}
                    onChange={(event) => setForm(prev => ({ ...prev, codeName: event.target.value }))}
                  />
                  {formErrors.codeName ? <em>{formErrors.codeName}</em> : null}
                </label>

                <label className={styles.field}>
                  <span>정렬순서</span>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(event) => setForm(prev => ({ ...prev, sortOrder: event.target.value }))}
                  />
                  {formErrors.sortOrder ? <em>{formErrors.sortOrder}</em> : null}
                </label>

                <label className={`${styles.field} ${styles.fieldWide}`}>
                  <span>설명</span>
                  <textarea
                    rows="4"
                    value={form.codeDesc}
                    onChange={(event) => setForm(prev => ({ ...prev, codeDesc: event.target.value }))}
                  />
                </label>

                <label className={styles.field}>
                  <span>사용여부</span>
                  <select value={form.useYn} onChange={(event) => setForm(prev => ({ ...prev, useYn: event.target.value }))}>
                    <option value="Y">Y</option>
                    <option value="N">N</option>
                  </select>
                </label>

                <label className={styles.field}>
                  <span>삭제여부</span>
                  <select value={form.delYn} onChange={(event) => setForm(prev => ({ ...prev, delYn: event.target.value }))}>
                    <option value="N">N</option>
                    <option value="Y">Y</option>
                  </select>
                </label>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.secondaryButton} onClick={closeModal} disabled={saving}>
                  취소
                </button>
                <button type="submit" className={styles.primaryButton} disabled={saving}>
                  {saving ? "저장 중..." : modalMode === "create" ? "등록" : "저장"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
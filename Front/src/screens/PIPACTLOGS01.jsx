import React, { useMemo, useState } from "react";

/**
 * PIPACTLOGS01 (Activity Log)
 * - 검색 영역 + 목록(Grid) 구성
 * - API 연동 없이 mock data만 사용
 * - SSOT 우선 필드 사용
 * - 불명확한 필드는 TODO로 표시
 */

const ASSET_TYPES = [
  "STOCK",
  "ETF",
  "BOND",
  "CRYPTO",
  "COMMODITY",
  "FX",
  "CASH",
];

const EXPOSURE_REGIONS = ["KR", "US", "JP", "CH", "GLOBAL"];

const TRANSACTION_TYPES = [
  "BUY",
  "SELL",
  "DIVIDEND",
  "INTEREST",
  "FX",
  "DEPOSIT",
  "WITHDRAW",
  "FEE",
  "TAX",
];

/**
 * SSOT 모델 기반 mock data
 * - transactionId, tradeDate, accountId, assetId, assetType, exposureRegion, transactionType
 * - quantity, unitPrice, tradeAmount
 * - tradeCurrency, fxRate
 * - fromCurrency, toCurrency (FX 전용)
 * - memo, deleted, createdAt, updatedAt
 */
const MOCK_TRANSACTIONS = [
  {
    transactionId: "TXN_001",
    tradeDate: "2026-02-01",
    accountId: "ACC_001",
    assetId: "MSTY",
    assetType: "ETF",
    exposureRegion: "US",
    transactionType: "BUY",
    quantity: 10,
    unitPrice: 20.5,
    tradeAmount: 205,
    tradeCurrency: "USD",
    fxRate: 1447.7,
    fromCurrency: null,
    toCurrency: null,
    memo: "첫 매수",
    deleted: false,
    createdAt: "2026-02-01T10:00:00",
    updatedAt: "2026-02-01T10:00:00",
  },
  {
    transactionId: "TXN_002",
    tradeDate: "2026-02-03",
    accountId: "ACC_001",
    assetId: "MSTY",
    assetType: "ETF",
    exposureRegion: "US",
    transactionType: "DIVIDEND",
    quantity: null,
    unitPrice: null,
    tradeAmount: 12.34,
    tradeCurrency: "USD",
    fxRate: 1450.2,
    fromCurrency: null,
    toCurrency: null,
    memo: "배당 입금",
    deleted: false,
    createdAt: "2026-02-03T09:00:00",
    updatedAt: "2026-02-03T09:00:00",
  },
  {
    transactionId: "TXN_003",
    tradeDate: "2026-02-05",
    accountId: "ACC_002",
    assetId: "069500",
    assetType: "ETF",
    exposureRegion: "KR",
    transactionType: "BUY",
    quantity: 5,
    unitPrice: 54000,
    tradeAmount: 270000,
    tradeCurrency: "KRW",
    fxRate: null,
    fromCurrency: null,
    toCurrency: null,
    memo: "국내 ETF 매수",
    deleted: false,
    createdAt: "2026-02-05T11:30:00",
    updatedAt: "2026-02-05T11:30:00",
  },
  {
    transactionId: "TXN_004",
    tradeDate: "2026-02-06",
    accountId: "ACC_001",
    assetId: "FX:USD->KRW",
    assetType: "FX",
    exposureRegion: "GLOBAL",
    transactionType: "FX",
    quantity: null,
    unitPrice: null,
    tradeAmount: 1000,
    tradeCurrency: "USD",
    fxRate: 1449.1,
    fromCurrency: "USD",
    toCurrency: "KRW",
    memo: "환전",
    deleted: false,
    createdAt: "2026-02-06T18:10:00",
    updatedAt: "2026-02-06T18:10:00",
  },
  {
    transactionId: "TXN_005",
    tradeDate: "2026-02-07",
    accountId: "ACC_002",
    assetId: "CASH:KRW",
    assetType: "CASH",
    exposureRegion: "KR",
    transactionType: "DEPOSIT",
    quantity: null,
    unitPrice: null,
    tradeAmount: 500000,
    tradeCurrency: "KRW",
    fxRate: null,
    fromCurrency: null,
    toCurrency: null,
    memo: "원화 입금",
    deleted: false,
    createdAt: "2026-02-07T08:00:00",
    updatedAt: "2026-02-07T08:00:00",
  },
];

function formatNumber(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "";
  const num = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(num)) return "";
  return num.toLocaleString(undefined, { maximumFractionDigits: 8 });
}

function formatAmountWithCurrency(amount, currency) {
  if (amount === null || amount === undefined) return "";
  const formatted = formatNumber(amount);
  if (!currency) return formatted;
  return `${formatted} ${currency}`;
}

function safeUpper(value) {
  return (value ?? "").toString().toUpperCase();
}

export default function PIPACTLOGS01() {
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    accountId: "",
    assetType: "",
    exposureRegion: "",
    transactionType: "",
    tradeCurrency: "",
    keyword: "",
  });

  const accountOptions = useMemo(() => {
    const set = new Set(
      MOCK_TRANSACTIONS.map((t) => t.accountId).filter(Boolean)
    );
    return Array.from(set).sort();
  }, []);

  const currencyOptions = useMemo(() => {
    const set = new Set(
      MOCK_TRANSACTIONS.map((t) => t.tradeCurrency).filter(Boolean)
    );
    return Array.from(set).sort();
  }, []);

  const filteredItems = useMemo(() => {
    // 검색/필터는 화면 렌더링을 위한 최소 UI 로직(서버/API 없음)
    const fromDate = filters.from ? new Date(filters.from) : null;
    const toDate = filters.to ? new Date(filters.to) : null;
    const kw = filters.keyword.trim().toLowerCase();

    return MOCK_TRANSACTIONS.filter((t) => {
      if (t.deleted) return false;

      if (fromDate) {
        const d = new Date(t.tradeDate);
        if (d < fromDate) return false;
      }
      if (toDate) {
        const d = new Date(t.tradeDate);
        if (d > toDate) return false;
      }

      if (filters.accountId && t.accountId !== filters.accountId) return false;
      if (filters.assetType && t.assetType !== filters.assetType) return false;
      if (filters.exposureRegion && t.exposureRegion !== filters.exposureRegion)
        return false;
      if (
        filters.transactionType &&
        t.transactionType !== filters.transactionType
      )
        return false;
      if (filters.tradeCurrency && t.tradeCurrency !== filters.tradeCurrency)
        return false;

      if (kw) {
        const hay = [t.assetId, t.memo].filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(kw)) return false;
      }

      return true;
    });
  }, [filters]);

  const onChange = (key) => (e) => {
    setFilters((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const onReset = () => {
    setFilters({
      from: "",
      to: "",
      accountId: "",
      assetType: "",
      exposureRegion: "",
      transactionType: "",
      tradeCurrency: "",
      keyword: "",
    });
  };

  const renderAssetCell = (t) => {
    if (t.transactionType === "FX") {
      // SSOT: FX는 assetId 대신 from→to 표시 가능
      // TODO: FX 표시 규칙을 디자인/공통 컴포넌트로 표준화 필요
      const from = t.fromCurrency ?? "";
      const to = t.toCurrency ?? "";
      return from && to ? `${from} → ${to}` : t.assetId;
    }

    // TODO: assetName(표시명) 필드가 별도로 있는지 SSOT/자산 마스터에서 확인
    return t.assetId;
  };

  const handleEdit = (t) => {
    // 금지: 비즈니스 로직/모달 구현 확장
    // TODO: PIPACTLOGP01(입력/수정 팝업) 연결
    // eslint-disable-next-line no-console
    console.log("edit", t);
  };

  const handleDelete = (t) => {
    // 금지: API 호출/삭제 로직 구현
    // TODO: 삭제 확인 모달 + soft delete API 연동
    // eslint-disable-next-line no-console
    console.log("delete", t);
  };

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ margin: 0, marginBottom: 12 }}>
        PIPACTLOGS01 · Activity Log
      </h1>

      {/* 검색 영역 */}
      <section
        aria-label="검색"
        style={{
          border: "1px solid #ddd",
          padding: 12,
          marginBottom: 16,
          borderRadius: 6,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(180px, 1fr))",
            gap: 12,
            alignItems: "end",
          }}
        >
          <label>
            <div style={{ fontSize: 12, marginBottom: 4 }}>기간 From</div>
            <input
              type="date"
              value={filters.from}
              onChange={onChange("from")}
            />
          </label>

          <label>
            <div style={{ fontSize: 12, marginBottom: 4 }}>기간 To</div>
            <input
              type="date"
              value={filters.to}
              onChange={onChange("to")}
            />
          </label>

          <label>
            <div style={{ fontSize: 12, marginBottom: 4 }}>계좌</div>
            <select value={filters.accountId} onChange={onChange("accountId")}>
              <option value="">전체</option>
              {accountOptions.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
            {/* TODO: accountName 표시(계좌 마스터 연동) */}
          </label>

          <label>
            <div style={{ fontSize: 12, marginBottom: 4 }}>자산유형</div>
            <select value={filters.assetType} onChange={onChange("assetType")}>
              <option value="">전체</option>
              {ASSET_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          <label>
            <div style={{ fontSize: 12, marginBottom: 4 }}>노출지역</div>
            <select
              value={filters.exposureRegion}
              onChange={onChange("exposureRegion")}
            >
              <option value="">전체</option>
              {EXPOSURE_REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>

          <label>
            <div style={{ fontSize: 12, marginBottom: 4 }}>거래유형</div>
            <select
              value={filters.transactionType}
              onChange={onChange("transactionType")}
            >
              <option value="">전체</option>
              {TRANSACTION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          <label>
            <div style={{ fontSize: 12, marginBottom: 4 }}>통화</div>
            <select
              value={filters.tradeCurrency}
              onChange={onChange("tradeCurrency")}
            >
              <option value="">전체</option>
              {currencyOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label>
            <div style={{ fontSize: 12, marginBottom: 4 }}>키워드(자산/메모)</div>
            <input
              type="text"
              placeholder="예: AAPL, 배당"
              value={filters.keyword}
              onChange={onChange("keyword")}
            />
          </label>
        </div>

        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          {/* NOTE: 검색 버튼은 UI 의도 전달용(실제 필터는 즉시 반영됨) */}
          <button type="button" onClick={() => {}}>
            검색
          </button>
          <button type="button" onClick={onReset}>
            초기화
          </button>
          {/* TODO: 신규 입력 버튼/입력 모달(PIPACTLOGP01) 연결 */}
        </div>
      </section>

      {/* 목록(Grid) */}
      <section aria-label="목록">
        <div style={{ marginBottom: 8, fontSize: 12, color: "#555" }}>
          총 {filteredItems.length}건
        </div>

        <div
          style={{
            overflowX: "auto",
            border: "1px solid #ddd",
            borderRadius: 6,
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f7f7f7" }}>
                <th style={thStyle}>거래일</th>
                <th style={thStyle}>유형</th>
                <th style={thStyle}>자산</th>
                <th style={thStyle}>자산유형</th>
                <th style={thStyle}>노출</th>
                <th style={thStyleRight}>수량</th>
                <th style={thStyleRight}>단가</th>
                <th style={thStyleRight}>금액</th>
                <th style={thStyleRight}>환율</th>
                <th style={thStyle}>메모</th>
                <th style={thStyle}>작업</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((t) => (
                <tr key={t.transactionId}>
                  <td style={tdStyle}>{t.tradeDate}</td>
                  <td style={tdStyle}>{safeUpper(t.transactionType)}</td>
                  <td style={tdStyle}>{renderAssetCell(t)}</td>
                  <td style={tdStyle}>{safeUpper(t.assetType)}</td>
                  <td style={tdStyle}>{safeUpper(t.exposureRegion)}</td>
                  <td style={tdStyleRight}>{formatNumber(t.quantity) || "-"}</td>
                  <td style={tdStyleRight}>{formatNumber(t.unitPrice) || "-"}</td>
                  <td style={tdStyleRight}>
                    {formatAmountWithCurrency(t.tradeAmount, t.tradeCurrency) ||
                      "-"}
                  </td>
                  <td style={tdStyleRight}>{formatNumber(t.fxRate) || "-"}</td>
                  <td style={tdStyle}>{t.memo ?? ""}</td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button type="button" onClick={() => handleEdit(t)}>
                        수정
                      </button>
                      <button type="button" onClick={() => handleDelete(t)}>
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredItems.length === 0 && (
                <tr>
                  <td style={{ ...tdStyle, padding: 16 }} colSpan={11}>
                    결과가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

const thStyle = {
  textAlign: "left",
  padding: "10px 8px",
  borderBottom: "1px solid #ddd",
  fontSize: 12,
  whiteSpace: "nowrap",
};

const thStyleRight = {
  ...thStyle,
  textAlign: "right",
};

const tdStyle = {
  padding: "10px 8px",
  borderBottom: "1px solid #eee",
  fontSize: 13,
  whiteSpace: "nowrap",
};

const tdStyleRight = {
  ...tdStyle,
  textAlign: "right",
};

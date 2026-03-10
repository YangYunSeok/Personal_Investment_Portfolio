/**
 * Screen ID: PIPFXS01
 * Screen Name: 환전 (Exchange)
 * Purpose: 환전 화면 공통 상수 (초기상태, 컬럼 등)
 */

export const INITIAL_FORM_STATE = {
    tradeDate: new Date().toISOString().split("T")[0],
    accountId: "",
    fromCurrency: "",
    toCurrency: "",
    tradeAmount: "",
    tradeCurrency: "",
    fxRate: "",
    memo: ""
};

export const GRID_COLUMNS = [
    { field: "tradeDate", headerName: "거래일", width: 120 },
    { field: "accountId", headerName: "계좌", width: 150 },
    { field: "fromCurrency", headerName: "출금통화", width: 100 },
    { field: "toCurrency", headerName: "입금통화", width: 100 },
    {
        field: "tradeAmount",
        headerName: "거래금액",
        width: 150,
        valueFormatter: (params) => {
            if (params.value == null) return "";
            return Number(params.value).toLocaleString();
        }
    },
    { field: "tradeCurrency", headerName: "거래통화", width: 100 },
    {
        field: "fxRate",
        headerName: "환율",
        width: 120,
        valueFormatter: (params) => {
            if (params.value == null) return "";
            return Number(params.value).toLocaleString(undefined, { maximumFractionDigits: 4 });
        }
    },
    { field: "memo", headerName: "메모", width: 200 }
];

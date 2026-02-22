/**
 * Constants for PIPACTLOGS01 (Activity Log)
 */

export const TRANSACTION_TYPE_OPTIONS = [
  "BUY", "SELL", "DIVIDEND", "INTEREST", "DEPOSIT", "WITHDRAW", "FEE", "TAX", "FX"
];

export const TRANSACTION_TYPE_LABEL = {
  BUY: "매수",
  SELL: "매도",
  DIVIDEND: "배당",
  INTEREST: "이자",
  DEPOSIT: "입금",
  WITHDRAW: "출금",
  FEE: "수수료",
  TAX: "세금",
  FX: "환전"
};

export const ASSET_TYPE_OPTIONS = [
  "Stock", "ETF", "Bond", "Crypto", "Commodity", "FX Cash", "KRW Cash"
];

export const ASSET_TYPE_LABEL = {
  Stock: "주식",
  ETF: "ETF",
  Bond: "채권",
  Crypto: "가상자산",
  Commodity: "원자재",
  "FX Cash": "외화 현금",
  "KRW Cash": "원화 현금",
};

export const EXPOSURE_REGION_OPTIONS = ["KR", "US", "JP", "CH", "GLOBAL"];

export const EXPOSURE_REGION_LABEL = {
  KR: "국내",
  US: "미국",
  JP: "일본",
  CH: "중국",
  GLOBAL: "글로벌",
};

export const CURRENCY_OPTIONS = ["KRW", "USD", "JPY", "CNY", "EUR", "GBP", "HKD"];

export const CURRENCY_LABEL = {
  KRW: "KRW(원)",
  USD: "USD(달러)",
  JPY: "JPY(엔)",
  CNY: "CNY(위안)",
  EUR: "EUR(유로)",
  GBP: "GBP(파운드)",
  HKD: "HKD(홍콩달러)",
};

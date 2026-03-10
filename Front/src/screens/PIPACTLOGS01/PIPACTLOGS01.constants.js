/**
 * Constants for PIPACTLOGS01 (Activity Log)
 *
 * [공통코드 전환 완료]
 * - ASSET_TYPE, EXPOSURE_REGION, CURRENCY 상수는 PIP_CM_CD 공통코드로 전환됨
 * - 화면에서는 useCommonCodes() Hook을 통해 코드 목록/맵을 사용
 * - TRANSACTION_TYPE은 거래유형으로 별도 유지 (향후 공통코드화 가능)
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

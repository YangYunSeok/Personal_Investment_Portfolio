# PIPPOSHLDS01_MODEL (Position Holdings Model)

## 0. Purpose
- Activity Log(원장) 데이터를 **집계/계산**하여 “현재 보유(포지션)”를 조회/표시한다.
- 본 화면에서 보여주는 값은 **계산 결과**이며, **저장하지 않는다**.

## 1. Domain Definitions

### 1.1 Position (계산 결과)
- 특정 기준시점(asOf)에서의 자산 보유 현황(수량/원가 기반)을 의미한다.
- 포지션은 **Activity(Transaction)** 들을 누적 집계하여 계산한다.

### 1.2 Cash Position
- KRW Cash / FX Cash(외화 현금)도 포지션으로 취급한다.
- 외화 자산 매도 → 해당 결제 통화 Cash 증가.
- KRW 사용은 반드시 FX(Activity)로 전환한다.

## 2. Core Keys & Dimensions

### 2.1 Dimensions
- `accountId`: 계좌 단위
- `assetId`: 종목 식별자(Stock/ETF/Bond/Crypto/Commodity/FX Cash/KRW Cash)
- `exposure`: 노출 (KR / US / JP / CH / GLOBAL)
- `assetType`: Stock / ETF / Bond / Crypto / Commodity / FX Cash / KRW Cash
- `currency`: KRW 또는 외화(예: USD, JPY 등)

### 2.2 Position Identity
- `positionKey = (accountId, assetId, currency)`
  - 동일 종목이라도 **계좌/통화/구분값**에 의해 별도 포지션이 될 수 있다.

## 3. Computed Fields (NOT STORED)

### 3.1 Quantity & Cost
- `quantity`: 기준시점 보유 수량(현금은 “잔액”)
- `avgUnitCost`: 평균단가(원장 기반 계산)
- `costBasis`:
  - asset currency 기준 원금(= 누적 매수금액 - 누적 원금회수 등 원장 규칙에 따름)
  - **표시 목적**이며 저장 금지

### 3.2 KRW Normalization
- `fxRateToKRW`(asOf 기준): 외화 → KRW 환산에 사용 (입력/Activity 기반)
- `costBasisKRW = costBasis * fxRateToKRW`

> ⚠️ 평가금액/수익률/시세 기반 계산은 “가격 입력/가격 소스” 규칙이 SSOT에 아직 확정되지 않았으므로  
> PIPPOSHLDS01 기본 모델은 **원가 기반(cost-based)** 중심으로 정의한다.  
> (향후 시세/평가 확장은 별도 ScreenID로 SSOT 추가 후 반영)

## 4. Position DTO (View Model)

```ts
type PositionRow = {
  accountId: string
  assetId: string
  assetName: string
  assetType: "Stock"|"ETF"|"Bond"|"Crypto"|"Commodity"|"FX Cash"|"KRW Cash"
  exposure: "KR"|"US"|"JP"|"CH"|"GLOBAL"
  currency: string              // e.g. "KRW", "USD"
  quantity: number              // cash = balance
  avgUnitCost?: number          // cash는 불필요(omit 가능)
  costBasis: number
  fxRateToKRW?: number          // KRW는 omit 가능
  costBasisKRW: number
}
```

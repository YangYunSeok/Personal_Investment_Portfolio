# PIPACTLOGS01_MODEL.md
(Activity Log · Model SSOT)

- ScreenID: **PIPACTLOGS01**
- Type: **S (Screen)**
- Purpose: Activity Log 화면에서 입력/관리하는 **단일 원장 데이터 모델** 정의
- Domain Concept: **Transaction**

> 상위 문서: `기본_화면_설계_V0.2.1.md`  
> 연관 문서: `PIPACTLOGS01_UI.md`, `PIPACTLOGS01_API.md`, `PIPACTLOGS01_DB.md`

---

## 1. 핵심 원칙

1) **Single Ledger**
- 모든 투자 활동(매수/매도/배당/이자/환전/입출금/수수료/세금)은 **Transaction**으로 기록한다.

2) **Input vs Calculated**
- Transaction은 **입력값만 저장**한다.
- 평가금액, 평균단가, 수익률, 환차손익, 원금회수율 등은 **계산값**이며 저장하지 않는다.

3) **KRW as Reporting Base**
- 기준 통화(리포팅/집계 기준)는 KRW다.
- 외화 거래는 `tradeCurrency` + `fxRate`로 환산 가능해야 한다.

---

## 2. 용어/식별자

- **Activity**: 사용자가 화면에서 입력/관리하는 “투자 활동”의 사용자 용어
- **Transaction**: Activity의 내부 도메인/저장 개념
- **Exposure Region**: 자산의 “노출” 기준 지역 (KR/US/JP/CH/GLOBAL)
- **Trade Currency**: 거래가 실제로 체결/정산되는 통화 (KRW/USD/JPY/CHF …)

---

## 3. Enum 정의

### 3.1 AssetType
- `STOCK`
- `ETF`
- `BOND`
- `CRYPTO`
- `COMMODITY` (Gold/Silver)
- `FX` (외화 현금)
- `CASH` (KRW 현금)

### 3.2 ExposureRegion
- `KR`, `US`, `JP`, `CH`, `GLOBAL`

### 3.3 TransactionType
- `BUY` : 매수
- `SELL` : 매도
- `DIVIDEND` : 배당
- `INTEREST` : 이자
- `FX` : 환전
- `DEPOSIT` : 입금
- `WITHDRAW` : 출금
- `FEE` : 수수료
- `TAX` : 세금

---

## 4. Transaction 논리 모델

### 4.1 공통 필드 (모든 거래 공통)
- `transactionId` : string (서버 생성, unique)
- `tradeDate` : date (YYYY-MM-DD)
- `accountId` : string (계좌 식별)
- `assetId` : string (종목/자산 식별. 예: AAPL, 069500, BTC)
- `assetType` : AssetType
- `exposureRegion` : ExposureRegion
- `transactionType` : TransactionType
- `memo` : string? (optional)
- `deleted` : boolean (soft delete)
- `createdAt` : datetime
- `updatedAt` : datetime

### 4.2 가격/수량/금액
- `quantity` : number? (거래유형에 따라 필수/금지)
- `unitPrice` : number? (거래유형에 따라 필수/금지)
- `tradeAmount` : number?  
  - 의미: **tradeCurrency 기준 금액**
  - BUY/SELL의 경우 `quantity * unitPrice`로 산출 가능(입력 생략 가능)

### 4.3 통화/환율
- `tradeCurrency` : string (ISO 4217, 예: KRW/USD/JPY/CHF)
- `fxRate` : number?  
  - 의미: **1 단위 tradeCurrency = KRW 얼마**
  - 규칙: `tradeCurrency != KRW`면 필수

### 4.4 FX 전용 필드
- `fromCurrency` : string? (ISO 4217)
- `toCurrency` : string? (ISO 4217)

---

## 5. 거래유형별 입력 규칙 (Validation Matrix)

### 5.1 BUY / SELL
필수:
- `tradeDate, accountId, assetId, assetType, exposureRegion, transactionType`
- `quantity`
- `unitPrice`
- `tradeCurrency`
조건부:
- `fxRate` (tradeCurrency != KRW)

선택:
- `tradeAmount` (미입력 시 서버 계산 가능)

금지:
- `fromCurrency`, `toCurrency`

---

### 5.2 DIVIDEND / INTEREST
필수:
- `tradeAmount`
- `tradeCurrency`
조건부:
- `fxRate` (tradeCurrency != KRW)

금지(권장):
- `quantity`, `unitPrice` (있으면 400 validation)

---

### 5.3 FX
필수:
- `fromCurrency`, `toCurrency`
- `tradeAmount` (fromCurrency 기준 금액)
- `fxRate`
권장:
- `assetId`는 `FX:{from}->{to}`처럼 가상 식별자를 써도 됨(선택)

금지:
- `quantity`, `unitPrice`

---

### 5.4 DEPOSIT / WITHDRAW / FEE / TAX
필수:
- `tradeAmount`
- `tradeCurrency`
조건부:
- `fxRate` (tradeCurrency != KRW)

금지(권장):
- `quantity`, `unitPrice`, `fromCurrency`, `toCurrency`

---

## 6. 커버드콜/배당 관련 규칙

- 커버드콜 여부/분류는 **자산(ETF) 메타 속성**에 가깝다.
- 배당/이자는 각각 `DIVIDEND`, `INTEREST` Transaction으로 기록한다.
- “원금 회수율(배당으로 회수한 비율)”은 **계산값**이며 저장하지 않는다.

---

## 7. 데이터 품질 규칙

- 소수점 정밀도: `quantity`, `unitPrice`, `tradeAmount`, `fxRate`는 소수 허용 (물리 설계에서 DECIMAL로 고정)
- `tradeDate` 미래 날짜 허용 여부는 정책으로 남김 (v0.1: 허용)
- soft delete는 `deleted=true`로 표시하며 기본 조회에서 제외

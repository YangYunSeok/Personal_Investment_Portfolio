# PIPACTLOGS01_DB.md
(Activity Log · DB SSOT)

- ScreenID: **PIPACTLOGS01**
- Purpose: Transaction 저장을 위한 DB 설계(논리→물리 가이드)

> 상위 문서: `기본_화면_설계_V0.2.1.md`  
> 연관 문서: `PIPACTLOGS01_MODEL.md`, `PIPACTLOGS01_API.md`

---

## 1. 테이블 후보 (v0.1)

- PIP_ACCOUNTS (계좌)
- PIP_ASSETS (자산 마스터)
- PIP_TRANSACTIONS (원장)

---

## 2. PIP_TRANSACTIONS 컬럼(권장)

- transaction_id (PK)
- trade_date, account_id, asset_id
- asset_type, exposure_region, transaction_type
- quantity, unit_price, trade_amount
- trade_currency, fx_rate
- from_currency, to_currency
- memo
- deleted
- created_at, updated_at

---

## 3. 제약/인덱스 권장

제약:
- trade_currency != 'KRW' → fx_rate not null
- FX → from_currency/to_currency not null

인덱스:
- (account_id, trade_date desc)
- (asset_id, trade_date desc)
- (transaction_type, trade_date desc)
- (deleted)

---

## 4. 저장 금지(계산값)

- 평균단가, 평가금액, 수익률, 환차손익, 원금회수율

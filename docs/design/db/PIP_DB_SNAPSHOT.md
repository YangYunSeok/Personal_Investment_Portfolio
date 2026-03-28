# 📘 PIP_DB_SNAPSHOT.md  
(PIP 통합 DB SSOT)

## 0. 문서 목적
본 문서는 PIP 프로젝트의 DB 단일 SSOT(Single Source of Truth)이다.
- 모든 테이블 구조는 본 문서를 기준으로 한다.
- 컬럼, 제약조건, 인덱스는 DDL 기준으로 관리한다.
- 화면별 DB 문서는 본 문서를 참조한다.

## 1. 핵심 설계 원칙

### 1.1 단일 원장 (Single Ledger)
- 모든 투자 활동은 PIP_TRANSACTIONS에 저장한다.
- 별도 거래 테이블 생성 금지

### 1.2 입력값 vs 계산값 분리
- 저장: 거래일, 수량, 단가, 금액, 통화, 환율
- 미저장: 평균단가, 평가금액, 수익률, 환차손익
👉 계산 결과 저장 금지

### 1.3 FX 처리 원칙
- FX는 별도 테이블 없음
- PIP_TRANSACTIONS.TX_TP_CD = 'FX'로 처리

### 1.4 Soft Delete 정책
- DEL_YN: N(활성), Y(삭제)

---

## 2. 테이블 정의

### 2.1 PIP_ACCOUNTS
- 목적: 투자 계좌 관리

컬럼:
- ACCOUNT_ID (PK)
- ACCOUNT_NM
- BROKER_NM
- BASE_CCY_CD
- DEL_YN
- REG_DT
- MOD_DT

---

### 2.2 PIP_ASSETS
- 목적: 자산 마스터

컬럼:
- ASSET_ID (PK)
- ASSET_NM
- ASSET_TP_CD
- EXPOSURE_REGION
- LISTING_REGION
- TRADE_CCY_CD
- DEL_YN
- REG_DT
- MOD_DT

---

### 2.3 PIP_TRANSACTIONS
- 목적: 단일 원장

컬럼:
- TX_ID (PK)
- ACCOUNT_ID
- ASSET_ID
- TX_TP_CD
- TX_DT
- ASSET_TP_CD
- EXPOSURE_REGION
- QTY
- UNIT_PRC
- AMT
- TX_CCY_CD
- FX_RATE
- FROM_CCY_CD
- TO_CCY_CD
- MEMO
- REF_NO
- DEL_YN
- REG_DT
- MOD_DT

핵심 규칙:
- AMT ≠ 0
- 외화 거래 시 FX_RATE 필수
- FX 거래 시 FROM/TO 통화 필수

---

### 2.4 PIP_CM_CD
- 목적: 공통코드

컬럼:
- CD_GRP_ID
- CD_ID
- CD_NM
- CD_DESC
- SORT_ORD
- USE_YN
- DEL_YN
- ATTR_VAL1~3
- REG_DT
- MOD_DT

---

## 3. 거래유형

- BUY
- SELL
- DIVIDEND
- INTEREST
- FX
- DEPOSIT
- WITHDRAW
- FEE
- TAX

---

## 4. 관계

PIP_ACCOUNTS → PIP_TRANSACTIONS  
PIP_ASSETS → PIP_TRANSACTIONS

---

## 5. 금지 사항

- positions 테이블 생성 금지
- dashboard 테이블 생성 금지
- FX 전용 테이블 생성 금지
- 계산 결과 저장 금지

---

## 6. 화면별 사용 테이블

- Activity → PIP_TRANSACTIONS
- FX → PIP_TRANSACTIONS
- Position → 없음 (집계)
- Dashboard → 없음 (집계)
- Assets → PIP_ASSETS

---

## 7. 최종 기준

이 문서를 DB SSOT 기준으로 사용한다.

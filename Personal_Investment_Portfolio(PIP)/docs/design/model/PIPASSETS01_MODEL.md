# PIPASSETS01_MODEL
Asset Detail Screen – Model SSOT

## 0. 문서 목적
본 문서는 PIPASSETS01(Asset Detail) 화면의 **도메인 모델 기준 SSOT**이다.
본 문서에 정의되지 않은 필드, 계산, 개념은 구현할 수 없다.

---

## 1. 화면 정의
- Screen ID: PIPASSETS01
- Screen Name: Asset Detail
- 화면 성격: 조회 전용 (Read Only)
- 입력 위치: ❌ (모든 입력은 PIPACTLOGS01에서만 발생)

---

## 2. 핵심 책임
- 단일 자산(asset_id)에 대한 **집계 결과 시각화**
- Activity(Transaction) 기반 계산 결과 제공
- Position 화면의 계산 로직을 재사용하거나 위임

---

## 3. 도메인 엔티티

### 3.1 Asset
| 필드 | 설명 |
|---|---|
| asset_id | 자산 고유 식별자 |
| asset_name | 자산명 |
| asset_type | Stock / ETF / Bond / Crypto / Cash |
| exposure_region | KR / US / JP / CH / GLOBAL |
| currency | 거래 통화 |

### 3.2 Activity (Transaction)
| 필드 | 설명 |
|---|---|
| activity_id | 거래 ID |
| asset_id | 대상 자산 |
| activity_type | BUY / SELL / DIVIDEND / FEE / FX |
| trade_date | 거래일 |
| quantity | 수량 |
| price | 단가 |
| amount | 금액 |
| currency | 통화 |
| fx_rate | 환율 |

---

## 4. 입력값 vs 계산값

### 4.1 입력값 (DB 저장)
- trade_date
- quantity
- price
- amount
- currency
- fx_rate

### 4.2 계산값 (저장 금지)
- total_buy_quantity
- total_sell_quantity
- holding_quantity
- avg_buy_price
- invested_amount
- realized_profit_loss
- unrealized_profit_loss
- current_value
- profit_rate
- principal_recovery_rate

---

## 5. 계산 책임 규칙
- 계산은 Activity 집계로만 수행한다.
- 계산 결과를 테이블/컬럼으로 저장하는 행위는 금지한다.
- 계산 로직 중복 시 Position 계산을 단일 SSOT로 본다.

---

## 6. 금지 사항
- asset_summary 테이블 생성 ❌
- snapshot / cache 컬럼 생성 ❌
- Activity 외 데이터 소스로 계산 ❌

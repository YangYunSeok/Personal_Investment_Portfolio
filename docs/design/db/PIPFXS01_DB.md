# PIPFXS01_DB (v0.2.1)

## 1. 저장 원칙
- FX는 별도 전용 테이블/스냅샷을 만들지 않고, 단일 원장(Activity/Transaction)으로 관리한다.
- FX 입력은 `PIP_TRANSACTIONS`의 `transaction_type = FX` 레코드로 저장한다.
- 계산값은 저장하지 않는다.

## 2. FX 저장 컬럼 매핑(원장 기준)
| 컬럼 | 설명 |
|---|---|
| transaction_id | PK |
| transaction_type | `FX` |
| trade_date | 거래일 |
| account_id | 계좌 |
| from_currency | 출금 통화 |
| to_currency | 입금 통화 |
| trade_amount | 거래 금액(fromCurrency 기준) |
| trade_currency | 거래 통화(= fromCurrency) |
| fx_rate | 사용자 입력 환율 |
| memo | 메모 |
| deleted | Soft Delete 상태 |
| created_at / updated_at | 생성/수정시각 |

## 3. 집계 책임 분리
- 잔액/보유액 집계는 Position/대시보드 계산 레이어 책임이다.
- FX 화면 DB는 입력값 저장 책임만 가진다.

## 4. 금지 사항
- FX 전용 물리 테이블 신규 생성 금지
- FX 스냅샷 테이블 생성 금지
- 환차손익/평균단가 등 계산 결과 저장 금지

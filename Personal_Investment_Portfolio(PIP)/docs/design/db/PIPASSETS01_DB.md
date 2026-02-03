# PIPASSETS01_DB
Asset Detail Screen – DB SSOT

## 0. 문서 목적
PIPASSETS01 화면이 **참조하는 DB 범위와 금지 규칙**을 명확히 한다.

---

## 1. 참조 테이블

### 1.1 ASSETS
| 컬럼 | 설명 |
|---|---|
| asset_id | PK |
| asset_name | 자산명 |
| asset_type | 자산 유형 |
| exposure_region | 노출 지역 |
| currency | 거래 통화 |

### 1.2 ACTIVITIES
| 컬럼 | 설명 |
|---|---|
| activity_id | PK |
| asset_id | FK |
| activity_type | 거래 유형 |
| trade_date | 거래일 |
| quantity | 수량 |
| price | 단가 |
| amount | 금액 |
| currency | 통화 |
| fx_rate | 환율 |

---

## 2. 계산 방식
- ASSETS + ACTIVITIES 조합
- GROUP BY asset_id 기반 집계
- View / SQL 계산 허용
- 결과 저장 금지

---

## 3. 절대 금지
- 요약 테이블 생성 ❌
- 스냅샷 테이블 생성 ❌
- 계산 컬럼 추가 ❌

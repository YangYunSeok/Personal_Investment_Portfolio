# PIPASSETS01_DB
Asset Master Screen – DB SSOT

## 0. 문서 목적
PIPASSETS01 화면의 **자산(종목) 마스터 저장 범위와 제약**을 명확히 한다.

---

## 1. 저장 테이블

### 1.1 PIP_ASSETS
| 컬럼 | 설명 |
|---|---|
| asset_id | PK |
| asset_name | 자산명 |
| asset_type | 자산 유형 |
| exposure_region | 노출 지역 |
| currency | 거래 통화 |
| deleted | Soft Delete 상태 |
| created_at | 생성 시각 |
| updated_at | 수정 시각 |

---

## 2. 조회/저장 규칙
- 기본 조회 조건: `deleted = false`
- 삭제는 물리 삭제가 아니라 `deleted = true` 처리
- 원장(Transaction)은 `asset_id`를 FK로 참조

---

## 3. 절대 금지
- 자산 평가/수익률 요약 테이블 생성 금지
- 계산 결과 컬럼 저장 금지
- Asset Master를 원장 대체 저장소로 사용하는 설계 금지

# PIPPOSHLDS01_DB (Read Model / Query Rules)

## 0. Storage Rule
- **positions 테이블을 만들지 않는다.**
- 본 화면 데이터는 **Activity Log(원장)**에서 집계/계산하여 조회한다.
- 계산값(평균단가/원금KRW 등)은 저장 금지.

## 1. Data Source (Upstream)
- Source of Truth: Activity Log(= Transaction ledger)
- PIPPOSHLDS01은 Activity를 **asOf 기준으로 누적 집계**한다.

## 2. Optional Performance Artifacts (Allowed, Not Mandatory)
데이터량이 커질 경우 다음 중 하나를 고려할 수 있다(도입 시 SSOT 업데이트 필요):
1) DB View: `v_positions_asof` (asOf 파라미터는 애플리케이션에서 조건으로)
2) Materialized read model은 **원칙상 지양**(“계산값 저장 금지”와 충돌 가능)  
   → 도입하려면 “저장”이 아니라 “캐시/스냅샷”의 정의 및 무결성 규칙을 SSOT에 먼저 추가해야 함.

## 3. Query Output Contract
- DB 레벨 출력은 API의 `PositionRow` 스키마를 충족해야 한다.
- 환율(`fxRateToKRW`)은 Activity(환전) 입력을 기반으로 asOf 적용 규칙을 따른다.

# PIPPOSHLDS01_UI (Position Holdings Screen)

## 0. Screen Goal
- 기준시점(asOf) 기준으로 **계좌별 보유 자산(Position)**을 조회/정렬/필터하여 보여준다.
- 입력은 하지 않는다(입력은 PIPACTLOGS01에서만).

## 1. Layout

### 1.1 Header Area
- 화면명: Position (보유 자산)
- 기준시점(asOf) 선택:
  - 기본값: “오늘”
  - 선택 변경 시 목록 재조회

### 1.2 Filter Bar
- `accountId` 선택: “전체” 또는 특정 계좌
- `exposure` 필터: 전체 / KR / US / JP / CH / GLOBAL
- `assetType` 필터: 전체 / Stock / ETF / Bond / Crypto / Commodity / FX Cash / KRW Cash
- 검색: `assetName` 또는 `assetId`

### 1.3 Summary Strip (원가 기반)
- 합계 원금(`costBasisKRW`) : 필터 결과 합
- 통화별 현금 요약:
  - KRW Cash 합계
  - FX Cash(예: USD/JPY 등)는 통화별로 표시(해당 통화 존재 시)

### 1.4 Main Grid
- 컬럼(기본):
  - 계좌
  - 노출(exposure)
  - 자산유형(assetType)
  - 종목명(assetName)
  - 통화(currency)
  - 수량(quantity)
  - 평균단가(avgUnitCost) *(현금은 공란)*
  - 원금(costBasis)
  - 원금(KRW 환산)(costBasisKRW)

### 1.5 Row Action
- 행 클릭 → 종목 상세 화면(PIPASSETS01)로 이동(딥링크)
  - 전달 파라미터: `accountId`, `assetId`, `asOf`

## 2. UX Rules
- 계산값은 화면에서 수정 불가(읽기 전용).
- 정렬/필터는 프론트에서 처리 가능.
  - 데이터량이 커지면 서버 페이징/정렬로 전환(SSOT 업데이트 후 확장)

## 3. Error/Empty State
- 조회 실패: “포지션 조회에 실패했습니다.” + 재시도 버튼
- 결과 0건: “해당 조건의 보유 자산이 없습니다.”

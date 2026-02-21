# PIPASSETS01_UI
Asset Master Screen – UI SSOT

## 0. 문서 목적
PIPASSETS01 화면의 **자산(종목) 마스터 관리 UI**를 정의한다.

---

## 1. 진입 경로
- 메뉴/네비게이션에서 `Asset Master` 선택
- 필요 시 원장 입력 화면(PIPACTLOGS01)에서 마스터 관리로 이동

---

## 2. 전체 레이아웃

### 2.1 Filter Bar
- assetType 필터
- exposureRegion 필터
- keyword 검색(assetId/assetName)
- includeDeleted 토글(기본: 해제)
- 조회 버튼

공통 조회 UX 규칙:
- **필터 변경 시 자동 조회 금지(조회 버튼으로만 조회).**

---

### 2.2 Master Grid
| 컬럼 | 설명 |
|---|---|
| assetId | 자산 식별자 |
| assetName | 자산명 |
| assetType | 자산 유형 |
| exposureRegion | 노출 지역 |
| currency | 거래 통화 |
| deleted | Soft Delete 상태 |
| updatedAt | 수정 시각 |

---

### 2.3 등록/수정 패널
- 신규 등록 버튼
- 행 선택 시 상세/수정 폼 표시
- 저장 버튼
- 삭제(Soft Delete) 버튼

---

## 3. 인터랙션
- 조회: 조회 버튼 클릭 시 목록 갱신
- 등록/수정: 입력 검증 후 저장
- 삭제: 확인 모달 후 `deleted=true` 처리
- 계산값(평가금액/수익률) 표시 없음

---

## 4. 예외 / Empty State
- 결과 없음: “조회 조건에 맞는 자산이 없습니다.”
- 저장 실패: “자산 마스터 저장에 실패했습니다.”

# PIPDASHS01_UI.md
## Dashboard UI SSOT

### 1. Layout
- 상단: KPI 카드 영역 (4칸)
- 중단: 자산 유형 비중 차트
- 하단: 지역 노출 비중 차트

### 2. KPI Cards
1. 총 자산
2. 총 투자 원금
3. 평가 손익
4. 총 수익률

### 3. Charts
- Asset Allocation: Pie / Donut
- Region Exposure: Pie / Donut

### 4. Interaction
- 차트 Hover 시 금액 + 비중 표시
- 클릭 시 상세 화면 이동 없음 (Dashboard는 요약 전용)
- 계산 결과 표시만 수행하며 입력/저장은 제공하지 않음
- **계산 결과 저장 금지**

### 5. 공통 조회 UX 규칙
- **필터 변경 시 자동 조회 금지(조회 버튼으로만 조회).**
- 예외: `PIPDASHS01_UI.md / 1. Layout`에 필터 입력 영역이 정의되지 않았으므로 적용 대상이 없다.

### 6. UX Rules
- 모든 금액은 KRW 기준
- 소수점 2자리 고정

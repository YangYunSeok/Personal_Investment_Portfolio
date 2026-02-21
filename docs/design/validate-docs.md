# Validate Docs Checklist

## 1. 우선순위 검증
- 우선순위 문구가 아래와 동일한가?
- **(헌법) basic > API > MODEL > UI > DB > _index**

## 2. 역할 검증
- PIPACTLOGS01: 단일 원장 입력/관리
- PIPASSETS01: 자산(종목) 마스터(참조 데이터) 관리
- PIPDASHS01: 요약/시각화, 조회 중심
- PIPFXS01: 환전(FX) 관리/입력/조회
- PIPPOSHLDS01: 원장 기반 계산 조회

## 3. 공통 규칙 검증
- UI 문서에 `필터 변경 시 자동 조회 금지(조회 버튼으로만 조회)` 문구가 있는가?
- Position/Dashboard 관련 문서(API/MODEL/UI/DB)에 `계산 결과 저장 금지` 문구가 있는가?
- Soft delete 의미(`deleted`)가 명확한가?
- FX 원칙(`별도 전용 테이블/스냅샷 금지, 단일 원장 관리`)이 일관적인가?

## 4. 변경 로그 검증
- 변경 시 충돌 위치/기준 문서/전후 요약이 기록되었는가?

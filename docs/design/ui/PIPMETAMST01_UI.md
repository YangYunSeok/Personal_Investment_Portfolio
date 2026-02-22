# PIPMETAMST01_UI.md
(Meta Master · UI SSOT)

- ScreenID: **PIPMETAMST01**
- Purpose: 자산 및 계좌의 메타 정보를 통합 관리하는 화면
- Layout: 탭 인터페이스 (Tab-based)

## 1. 탭 구성
- **자산(종목) 마스터**: 기존 PIPASSETS01 기능 승계
- **계좌 마스터**: 신규 추가 (계좌ID, 계좌명, 증권사, 통화 관리)

## 2. 공통 UI 규칙
- 상단 탭으로 모드 전환
- 그리드 내 인라인 편집(Dirty Tracking) 지원
- 신규 등록은 팝업 모달 사용
- 삭제는 Soft Delete (DEL_YN)

## 3. 계좌 마스터 필드
- 계좌ID (PK): 고유 식별자 (입력 필수)
- 계좌명: 표시용 명칭 (필수)
- 증권사: 소속 금융기관 (선택)
- 기준통화: 계좌의 기본 통화 (KRW/USD 등)

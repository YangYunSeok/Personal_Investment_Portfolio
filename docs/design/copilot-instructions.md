# Copilot Instructions (SSOT Aligned)

## 1. Scope
- 대상: `Personal_Investment_Portfolio` 저장소
- Copilot은 구현 보조이며, 요구사항/기능을 새로 창작하지 않는다.

## 2. SSOT 우선순위 (고정)
- **(헌법) basic > API > MODEL > UI > DB > _index**
- 문서 충돌 시 상위 우선순위 문서를 기준으로 하위 문서를 수정한다.

## 3. 구현 원칙
- SSOT에 없는 필드/상태/흐름은 구현하지 않는다.
- 계산값은 저장하지 않는다.
- FX는 별도 전용 테이블/스냅샷을 만들지 않고, 단일 원장(Activity/Transaction)으로 관리한다.
- Soft delete는 문서에 명시된 `deleted` 규칙을 따른다.

## 4. 산출 전 확인
- 적용 문서 경로를 명시한다.
- 변경 범위를 요청 범위로 제한한다.
- SSOT 충돌이 있으면 먼저 문서 정합성을 맞춘다.

## 5. 구현 파일 네이밍 & 헤더 체크리스트
- 새 파일 생성 시 화면 전용 파일인지 먼저 판별한다.
- 화면 전용 파일이면 파일명에 ScreenID 포함 여부를 확인한다.
- 공용 파일이면 파일명에서 ScreenID를 제외한다.
- 화면 전용 파일 최상단에 표준 헤더 주석 템플릿을 작성한다.
- 헤더 주석에는 최소 항목(ScreenID, Screen Name, Purpose, 주요 동작, 연관 SSOT 문서 경로, 금지 규칙)을 포함한다.

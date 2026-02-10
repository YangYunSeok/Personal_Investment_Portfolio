# PIP SSOT Hub — docs/design/_index.md

이 문서는 **PIP (Personal Investment Portfolio)** 프로젝트의 **SSOT(Single Source of Truth) 허브 문서**다.  
모든 설계·개발·리뷰·확장은 **본 문서를 기준점(entry point)** 으로 삼는다.

> ⚠️ 코드보다 문서가 우선이며  
> SSOT에 없는 개념·필드·규칙은 **구현할 수 없다**.

---

## 0. 전역 메타 규칙 (우선순위 / 네이밍 / API 경로 / 책임 경계)

### 0.1 SSOT 최종 결정권
SSOT의 최종 결정권은 docs/design 내부 문서에만 있다.
최상위는 기본_화면_설계(헌법)이며, 그 다음이 본 문서(_index.md)에 정의된 전역 메타 규칙이다.
화면별 SSOT 간 충돌은 본 문서에 정의된 우선순위로만 판정한다.
docs/copilot-instructions.md는 SSOT를 준수하기 위한 운영 규칙이며,
SSOT의 우선순위나 내용을 재정의할 수 없다.
instructions와 SSOT가 충돌할 경우, 항상 SSOT가 우선한다.

### 0.2 화면 식별자(ScreenID) / 화면 파일명 전역 공식
PIP 프로젝트의 화면 식별자 및 화면 파일명 전역 공식은 다음과 같다.

공식: PIP{DOMAIN}{S|P}{SEQ}

- DOMAIN: ACTLOG, POSHLD, DASH, ASSETS, FX 등 SSOT에 정의된 도메인
- S: Screen, P: Popup
- SEQ: 01, 02, 03 …

본 공식은 PIP 프로젝트의 유일한 ScreenID 규칙이다.
본 공식과 다른 형식은 비표준으로 간주한다.

### 0.3 API 경로 전역 컨벤션
전역 API base path는 `/api/pip` 로 단일화한다.
API path는 소문자만 사용한다.
API path에 ScreenID를 직접 포함하는 표기는 비표준으로 간주한다.

### 0.4 문서 책임 경계
- API 문서(api/*): endpoint / request / response / auth / validation 계약만 포함한다.
- Model 문서(model/*): 필드 의미 / 상태 의미 / 계산·집계 규칙만 포함한다.
- DB 문서(db/*): 테이블 / 조인 / 제약 / 인덱스 / 저장 원칙만 포함한다.
- UI 문서(ui/*): 레이아웃 / UX / 사용자 동작 / 표시 규칙만 포함한다.

SSOT 문서에 구현 파일, 클래스, 패키지, 디렉터리, 프레임워크 규칙을 포함하는 것을 금지한다.


## 1. SSOT 계층 구조 및 우선순위 (NON-NEGOTIABLE)

SSOT 해석이 필요할 경우, **아래 우선순위를 절대적으로 따른다.**

1. **최상위 설계(헌법)**
   - 📜 [기본_화면_설계_V0.2.1.md](./basic/기본_화면_설계_V0.2.1.md)
   - 프로젝트 전체 규칙, 용어, 원칙 정의

2. **화면별 SSOT (ScreenID 단위)**
   - `{SCREENID}_MODEL.md` : 도메인 모델, 입력값/계산값 구분, 규칙
   - `{SCREENID}_UI.md` : 화면 레이아웃, UX, 사용자 동작
   - `{SCREENID}_API.md` : API 계약 (Endpoint / Request / Response)
   - `{SCREENID}_DB.md` : 테이블, 조회 규칙, 저장 원칙

3. **_index.md (본 문서)**
   - SSOT 탐색 허브
   - 문서 간 연결, 상태, 진행 기준 제공

---

## 2. 프로젝트 핵심 설계 원칙 요약

### 2.1 단일 원장 (Single Ledger)

- 모든 자산 이벤트는 **Activity(Transaction)** 로 기록한다.
- 포지션, 평가, 수익률은 **Activity를 기반으로 계산**한다.

### 2.2 입력값 vs 계산값 분리

- **입력값**
  - 거래일, 수량, 단가, 금액, 통화, 환율
- **계산값**
  - 평균단가, 평가금액, 수익률, 환차손익, 원금회수율
- ❌ 계산값은 **저장하지 않는다**

### 2.3 통화 원칙

- 기준 통화: **KRW**
- 외화 자산 매도 → 해당 통화 CASH 증가
- KRW 사용은 **FX(Activity)** 로만 처리

---

## 3. 화면 식별자(ScreenID) 규칙

```
[PROJECT][DOMAIN][TYPE][SEQ]
```

- PROJECT: `PIP`
- DOMAIN: ACTLOG, POSHLD, DASH, ASSETS, FX
- TYPE
  - `S` : Screen
  - `P` : Popup
- SEQ: `01`, `02`, `03` ...

---

## 4. 전체 화면 SSOT 링크 맵 (Single Entry Point)

| ScreenID | MODEL | UI | API | DB | 역할 |
|---|---|---|---|---|---|
| **PIPACTLOGS01** | [MODEL](./model/PIPACTLOGS01_MODEL.md) | [UI](./ui/PIPACTLOGS01_UI.md) | [API](./api/PIPACTLOGS01_API.md) | [DB](./db/PIPACTLOGS01_DB.md) | 모든 입력의 시작점 |
| **PIPPOSHLDS01** | [MODEL](./model/PIPPOSHLDS01_MODEL.md) | [UI](./ui/PIPPOSHLDS01_UI.md) | [API](./api/PIPPOSHLDS01_API.md) | [DB](./db/PIPPOSHLDS01_DB.md) | 계산/집계 전담 |
| **PIPDASHS01** | [MODEL](./model/PIPDASHS01_MODEL.md) | [UI](./ui/PIPDASHS01_UI.md) | [API](./api/PIPDASHS01_API.md) | [DB](./db/PIPDASHS01_DB.md) | 요약/시각화 |
| **PIPASSETS01** | [MODEL](./model/PIPASSETS01_MODEL.md) | [UI](./ui/PIPASSETS01_UI.md) | [API](./api/PIPASSETS01_API.md) | [DB](./db/PIPASSETS01_DB.md) | 종목 상세 |
| **PIPFXS01** | [MODEL](./model/PIPFXS01_MODEL.md) | [UI](./ui/PIPFXS01_UI.md) | [API](./api/PIPFXS01_API.md) | [DB](./db/PIPFXS01_DB.md) | 환전 입력 |

---

## 5. 화면 간 데이터 흐름

```
PIPACTLOGS01 → PIPPOSHLDS01 → PIPDASHS01 / PIPASSETS01
```

---

## 6. 계약(Contract) 고정 기준

- MODEL / API / DB 문서가 모두 존재해야 구현 가능
- 계산값은 저장하지 않는다
- Activity(Transaction)는 단일 원장이다

---

## 7. Copilot / MCP 사용 규칙

```
(A) 목표
(B) 근거 SSOT
(C) 변경 범위
(D) 완료 조건
(E) 금지사항
```

---

## 8. SSOT 운영 원칙

- SSOT 수정 → 계약 고정 → 구현 순서 고수
- 코드로 규칙을 덮지 않는다

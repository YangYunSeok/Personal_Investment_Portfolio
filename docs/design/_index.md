# PIP SSOT Hub — docs/design/_index.md

이 문서는 **PIP (Personal Investment Portfolio)** 프로젝트의 **SSOT(Single Source of Truth) 허브 문서**다.  
모든 설계·개발·리뷰·확장은 **본 문서를 기준점(entry point)** 으로 삼는다.

> ⚠️ 코드보다 문서가 우선이며  
> SSOT에 없는 개념·필드·규칙은 **구현할 수 없다**.

---

## 0. 전역 메타 규칙 (우선순위 / 네이밍 / API 경로 / 책임 경계)

### 0.1 SSOT 최종 결정권
SSOT의 최종 결정권은 docs/design 내부 문서에만 있다.
최상위는 기본_화면_설계(헌법)이며, 문서 충돌 판정은 본 문서의 우선순위 문구를 따른다.
운영 문서는 SSOT 준수를 위한 절차 문서이며 SSOT 내용을 재정의할 수 없다.

### 0.2 화면 식별자(ScreenID) / 화면 파일명 전역 공식
PIP 프로젝트의 화면 식별자 및 화면 파일명 전역 공식은 다음과 같다.

공식: PIP{DOMAIN}{S|P}{SEQ}

- DOMAIN: ACTLOG, POSHLD, DASH, ASSETS, FX 등 SSOT에 정의된 도메인
- S: Screen, P: Popup
- SEQ: 01, 02, 03 …

### 0.3 API 경로 전역 컨벤션
전역 API base path는 `/api/pip` 로 단일화한다.
API path는 소문자만 사용한다.
API path에 ScreenID를 직접 포함하는 표기는 비표준으로 간주한다.

### 0.4 문서 책임 경계
- API 문서(api/*): endpoint / request / response / auth / validation 계약만 포함한다.
- Model 문서(model/*): 필드 의미 / 상태 의미 / 계산·집계 규칙만 포함한다.
- DB 문서(db/*): 테이블 / 조인 / 제약 / 인덱스 / 저장 원칙만 포함한다.
- UI 문서(ui/*): 레이아웃 / UX / 사용자 동작 / 표시 규칙만 포함한다.

---

## 1. SSOT 계층 구조 및 우선순위 (NON-NEGOTIABLE)

SSOT 해석이 필요할 경우, 아래 우선순위를 절대적으로 따른다.

- **(헌법) basic > API > MODEL > UI > DB > _index**

---

## 2. 프로젝트 핵심 설계 원칙 요약

### 2.1 단일 원장 (Single Ledger)
- 모든 투자 활동은 Activity(Transaction)로 기록한다.
- FX는 별도 전용 테이블/스냅샷을 만들지 않고, 단일 원장(Activity/Transaction)으로 관리한다.

### 2.2 입력값 vs 계산값 분리
- 입력값: 거래일, 수량, 단가, 금액, 통화, 환율
- 계산값: 평균단가, 평가금액, 수익률, 환차손익, 원금회수율
- **계산 결과 저장 금지**

### 2.3 Soft Delete 정책
- 원장(Transaction) 삭제 상태는 `deleted` 필드로 정의한다.
- `deleted = false`: 활성 데이터(기본 조회 대상)
- `deleted = true`: 소프트 삭제 데이터(기본 조회 제외)

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
| **PIPACTLOGS01** | [MODEL](./model/PIPACTLOGS01_MODEL.md) | [UI](./ui/PIPACTLOGS01_UI.md) | [API](./api/PIPACTLOGS01_API.md) | [DB](./db/PIPACTLOGS01_DB.md) | 모든 투자 활동의 단일 원장 입력/관리(매수/매도/배당/이자/입출금/세금/수수료/환전 포함) |
| **PIPASSETS01** | [MODEL](./model/PIPASSETS01_MODEL.md) | [UI](./ui/PIPASSETS01_UI.md) | [API](./api/PIPASSETS01_API.md) | [DB](./db/PIPASSETS01_DB.md) | 자산(종목) 마스터(참조 데이터) 관리 |
| **PIPPOSHLDS01** | [MODEL](./model/PIPPOSHLDS01_MODEL.md) | [UI](./ui/PIPPOSHLDS01_UI.md) | [API](./api/PIPPOSHLDS01_API.md) | [DB](./db/PIPPOSHLDS01_DB.md) | 포지션(계좌/자산/현금) 조회 – 원장 기반 계산 결과, 계산값 저장 금지 |
| **PIPDASHS01** | [MODEL](./model/PIPDASHS01_MODEL.md) | [UI](./ui/PIPDASHS01_UI.md) | [API](./api/PIPDASHS01_API.md) | [DB](./db/PIPDASHS01_DB.md) | 대시보드(요약/시각화) – 계산값 저장 금지, 조회 중심 |
| **PIPFXS01** | [MODEL](./model/PIPFXS01_MODEL.md) | [UI](./ui/PIPFXS01_UI.md) | [API](./api/PIPFXS01_API.md) | [DB](./db/PIPFXS01_DB.md) | 환전(FX) 관리/입력/조회 |

---

## 5. 화면 간 데이터 흐름

```
PIPASSETS01 → PIPACTLOGS01 / PIPFXS01 → PIPPOSHLDS01 → PIPDASHS01
```

---

## 6. 계약(Contract) 고정 기준

- MODEL / API / DB 문서가 모두 존재해야 구현 가능
- 계산 결과 저장 금지
- Activity(Transaction)는 단일 원장

---

## 7. 운영 문서

- [copilot-instructions.md](./copilot-instructions.md)
- [ssot-mcp-workflow.md](./ssot-mcp-workflow.md)
- [validate-docs.md](./validate-docs.md)

---

## 8. SSOT 운영 원칙

- SSOT 수정 → 계약 고정 → 구현 순서 고수
- 코드로 규칙을 덮지 않는다

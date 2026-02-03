# PIP SSOT Hub — docs/design/_index.md

이 문서는 **PIP (Personal Investment Portfolio)** 프로젝트의 **SSOT(Single Source of Truth) 허브 문서**다.  
모든 설계·개발·리뷰·확장은 **본 문서를 기준점(entry point)** 으로 삼는다.

> ⚠️ 코드보다 문서가 우선이며  
> SSOT에 없는 개념·필드·규칙은 **구현할 수 없다**.

---

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

## 7. 백엔드 생성 규칙

- `{SCREENID}Controller`
- `{SCREENID}Service`
- `{SCREENID}Mapper`
- ScreenID 없는 컴포넌트 생성 금지

---

## 8. Copilot / MCP 사용 규칙

```
(A) 목표
(B) 근거 SSOT
(C) 변경 범위
(D) 완료 조건
(E) 금지사항
```

---

## 9. SSOT 운영 원칙

- SSOT 수정 → 계약 고정 → 구현 순서 고수
- 코드로 규칙을 덮지 않는다

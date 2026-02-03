# PIP SSOT Hub — docs/design/_index.md

이 문서는 **PIP (Personal Investment Portfolio)** 프로젝트의 SSOT(단일 진실 소스) 허브 문서다.  
모든 화면/모델/API/DB 설계 문서는 본 문서를 기준으로 연결되며, **문서가 코드보다 우선**한다.

---

## 1. SSOT 우선순위 (NON-NEGOTIABLE)

1) **최상위 설계(헌법)**  
- `기본_화면_설계_V0.2.1.md`

2) **화면별 SSOT (ScreenID 단위)**  
- `{SCREENID}_MODEL.md` : 도메인/타입/규칙(입력값 vs 계산값 포함)
- `{SCREENID}_UI.md` : 화면 동작/레이아웃/UX
- `{SCREENID}_API.md` : API 계약(Endpoint, Req/Res)
- `{SCREENID}_DB.md` : 저장/조회 규칙(계산값 저장 금지 등)

> ⚠️ SSOT에 없는 규칙/필드는 **추측 구현 금지**  
> 필요하면 **SSOT 문서부터 수정 → 계약 고정 → 구현** 순서로 진행한다.

---

## 2. 프로젝트 핵심 원칙 요약

- **단일 원장(Single Ledger)**: 모든 자산 이벤트는 Activity(Transaction)로 기록
- **입력값 vs 계산값 분리**
  - 입력값: 거래일, 수량, 단가, 금액, 통화, 환율
  - 계산값: 평균단가, 평가금액, 수익률, 환차손익, 원금회수율 (**저장 금지**)
- **통화 원칙**
  - 기준 통화: KRW
  - 외화 자산 매도 → 해당 결제 통화 CASH 증가
  - KRW 사용은 FX(Activity)로 전환

---

## 3. 화면 식별자 규칙

`[PROJECT][DOMAIN][TYPE][SEQ]`

- PROJECT: `PIP`
- DOMAIN: ACTLOG, POSHLD, DASH, ASSETS, FX
- TYPE: `S`(Screen), `P`(Popup)
- SEQ: `01`, `02` …

예시:
- `PIPACTLOGS01` : Activity Log 메인 화면
- `PIPACTLOGP01` : Activity 입력 팝업
- `PIPPOSHLDS01` : Position 목록 화면

---

## 4. 전체 화면 목록 (Screen Map)

> 아래 “문서 파일명”은 **파일명 규칙(식별 가능성)**을 위한 표준이다.  
> 실제 리포지토리 경로 구조는 자유지만, 파일명은 반드시 동일해야 한다.

| 화면 | ScreenID | 책임(역할) | 화면별 SSOT 문서 파일명(표준) |
|---|---|---|---|
| Activity Log | PIPACTLOGS01 | 모든 입력의 시작점 | `PIPACTLOGS01_MODEL.md` / `PIPACTLOGS01_UI.md` / `PIPACTLOGS01_API.md` / `PIPACTLOGS01_DB.md` |
| Position | PIPPOSHLDS01 | 보유 자산 집계 | `PIPPOSHLDS01_MODEL.md` / `PIPPOSHLDS01_UI.md` / `PIPPOSHLDS01_API.md` / `PIPPOSHLDS01_DB.md` |
| Dashboard | PIPDASHS01 | 요약/비중 시각화 | `PIPDASHS01_MODEL.md` / `PIPDASHS01_UI.md` / `PIPDASHS01_API.md` / `PIPDASHS01_DB.md` |
| Asset Detail | PIPASSETS01 | 종목별 상세 | `PIPASSETS01_MODEL.md` / `PIPASSETS01_UI.md` / `PIPASSETS01_API.md` / `PIPASSETS01_DB.md` |
| Exchange | PIPFXS01 | 환전 입력 | `PIPFXS01_MODEL.md` / `PIPFXS01_UI.md` / `PIPFXS01_API.md` / `PIPFXS01_DB.md` |

---

## 5. 화면 간 흐름 (Data Flow)

```
PIPACTLOGS01 (입력)
        ↓
PIPPOSHLDS01 (집계/계산)
        ↓
PIPDASHS01 / PIPASSETS01 (시각화)
```

---

## 6. 백엔드 설계 원칙 (ScreenID 중심)

- 모든 백엔드 컴포넌트는 **ScreenID 단위**로 생성한다.
- ScreenID 없는 Controller/Service/Mapper 생성 금지
- 표준 구성:
  - `{SCREENID}Controller`
  - `{SCREENID}Service`
  - `{SCREENID}Mapper` (또는 `{SCREENID}Mapper.xml`)

---

## 7. 작업 진행 순서 (강제)

1) 범위 확정: 대상 ScreenID 명확화  
2) SSOT 확인/수정: 규칙/필드/흐름을 SSOT에 먼저 반영  
3) 계약 고정: Model/API 확정  
4) 구현: 화면/백엔드 구현  
5) 검증: SSOT ↔ 구현 정합성 점검

---

## 8. 현재 상태 메모

- `PIPPOSHLDS01` SSOT가 먼저 생성되어 있음(초기 버전).
- 나머지 화면은 본 _index.md를 기준으로 SSOT를 순차 생성한다.

# PIP — Personal Investment Portfolio

엑셀로 관리하던 개인 투자 포트폴리오를 웹 기반으로 전환한 프로젝트입니다.  
**단일 원장(Single Ledger)** 구조를 핵심 설계 원칙으로 삼으며, 모든 투자 활동은 하나의 원장(Activity/Transaction)에 기록됩니다.

---

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [핵심 설계 원칙](#2-핵심-설계-원칙)
3. [화면 구성](#3-화면-구성)
4. [디렉토리 구조](#4-디렉토리-구조)
5. [기술 스택](#5-기술-스택)
6. [실행 방법](#6-실행-방법)
7. [API 구조](#7-api-구조)
8. [DB / 데이터 규칙](#8-db--데이터-규칙)
9. [개발 규칙 및 주의사항](#9-개발-규칙-및-주의사항)
10. [참고 문서](#10-참고-문서)

---

## 1. 프로젝트 개요

| 구성 | 역할 |
|---|---|
| **Frontend** (React + Vite) | 화면 렌더링, 사용자 입력, 조회 UI 제공 |
| **Backend** (Node.js + Express) | REST API 제공, DB 쿼리 실행, 비즈니스 로직 처리 |
| **DB** (MariaDB) | 원장 데이터(거래/자산/계좌/공통코드) 영구 저장 |

데이터 흐름:
```
PIPMETAMST01 (자산/계좌 입력)
    ↓
PIPACTLOGS01 (투자 활동 원장 입력)
PIPFXS01     (환전 원장 입력)
    ↓
PIPPOSHLDS01 (원장 기반 포지션 계산 조회)
    ↓
PIPDASHS01   (대시보드 요약/시각화)
```

---

## 2. 핵심 설계 원칙

> 출처: `docs/design/basic/기본_화면_설계_V0.2.1.md` (SSOT 최상위 헌법)

### 2.1 단일 원장 (Single Ledger)
- 모든 투자 활동(매수/매도/배당/이자/입출금/세금/수수료/환전)은 하나의 원장 테이블(`PIP_TRANSACTIONS`)에 기록한다.
- 자산별 개별 시트/스냅샷 구조는 사용하지 않는다.

### 2.2 계산 결과 저장 금지
- **입력값**: 거래일, 수량, 단가, 금액, 통화, 환율
- **계산값(저장 불가)**: 평균단가, 평가금액, 수익률, 환차손익, 원금회수율
- 계산값은 조회 시점에 원장 데이터를 집계하여 계산하며 DB에 저장하지 않는다.

### 2.3 FX 처리 원칙
- 환전(FX)은 별도 전용 테이블이나 스냅샷을 만들지 않는다.
- FX도 동일하게 `PIP_TRANSACTIONS`(단일 원장)에 `TX_TP_CD = 'FX'`로 기록한다.

### 2.4 Soft Delete 정책
- 논리 삭제만 사용한다. 물리 삭제 금지.
- DB 컬럼: `DEL_YN` (`'N'` = 활성, `'Y'` = 삭제)
- 기본 조회 조건: `DEL_YN = 'N'`
- API 레이어: `deleted` (boolean) 로 매핑

### 2.5 SSOT 우선순위 (절대 고정)
```
(헌법) basic > API > MODEL > UI > DB > _index
```

---

## 3. 화면 구성

| ScreenID | 사이드바 메뉴 | URL 경로 | 책임 | 계산 저장 |
|---|---|---|---|---|
| **PIPDASHS01** | 대시보드 | `/dashboard` | 포트폴리오 요약/시각화 (조회 전용) | 금지 |
| **PIPMETAMST01** | 메타 마스터 관리 | `/meta-master` | 자산(종목) 및 계좌 마스터 입력/관리 | 해당 없음 |
| **PIPACTLOGS01** | 투자 원장 | `/activity-log` | 모든 투자 활동 단일 원장 입력/관리 | 금지 |
| **PIPPOSHLDS01** | 보유 자산 | `/positions` | 원장 기반 포지션/보유 자산 계산 조회 | 금지 |
| **PIPFXS01** | 환전(FX) | `/fx` | 환전 활동 입력/조회 | 금지 |
| **PIPSETTINGS01** | Settings | `/settings` | 공통코드(PIP_CM_CD) 관리 | 해당 없음 |

> `/assets` 경로는 `/meta-master`로 리다이렉트 처리됩니다 (`App.jsx` 기준).

---

## 4. 디렉토리 구조

```
Personal_Investment_Portfolio/
├── package.json              # 루트 (axios 의존성)
├── README.md
│
├── Front/                    # React 프론트엔드 (Vite)
│   ├── package.json
│   ├── vite.config.js        # /api → http://localhost:3001 프록시 설정
│   ├── index.html
│   └── src/
│       ├── App.jsx           # 라우팅 정의 (react-router-dom)
│       ├── main.jsx
│       ├── api/              # 화면별 API 호출 함수
│       │   ├── PIPACCOUNTS01.api.js
│       │   ├── PIPACTLOGS01.api.js
│       │   ├── PIPASSETS01.api.js
│       │   ├── PIPASSETS01.mapper.js
│       │   ├── PIPCMCD01.api.js
│       │   ├── PIPDASHS01.api.js
│       │   ├── PIPFXS01.api.js
│       │   └── PIPPOSHLDS01.api.js
│       ├── components/
│       │   └── layout/       # MainLayout, Sidebar
│       ├── config/
│       │   └── api.js        # API_BASE URL 환경 분기
│       ├── hooks/
│       │   └── useCommonCodes.js  # 공통코드 조회 Hook (캐싱 포함)
│       └── screens/          # 화면 컴포넌트
│           ├── PIPMETAMST01.jsx          # 메타(자산+계좌) 관리 (구 PIPASSETS01)
│           ├── PIPACTLOGS01/
│           ├── PIPDASHS01/
│           ├── PIPFXS01/
│           ├── PIPPOSHLDS01/
│           └── PIPSETTINGS01/            # 공통코드 설정 화면
│
├── Server/                   # Node.js + Express 백엔드
│   ├── package.json
│   └── src/
│       ├── server.js         # 서버 진입점, CORS 설정, 라우터 등록
│       ├── db.js             # MariaDB 커넥션 풀 (mysql2/promise)
│       ├── Controller/       # HTTP 요청 수신 및 라우트 정의
│       │   ├── PIPACCOUNTS01Controller.js
│       │   ├── PIPACTLOGS01Controller.js
│       │   ├── PIPASSETS01Controller.js
│       │   ├── PIPCMCD01Controller.js
│       │   ├── PIPDASHS01Controller.js
│       │   ├── PIPFXS01Controller.js
│       │   └── PIPPOSHLDS01Controller.js
│       ├── Service/          # 비즈니스 로직 처리
│       ├── Mapper/           # DB 직접 쿼리 실행 (PIPASSETS01 등)
│       └── utils/
│           └── transactionCalculator.js
│
└── docs/
    └── design/               # SSOT 설계 문서
        ├── _index.md         # SSOT 허브 (진입점)
        ├── copilot-instructions.md
        ├── ssot-mcp-workflow.md
        ├── validate-docs.md
        ├── basic/
        │   └── 기본_화면_설계_V0.2.1.md  ← SSOT 헌법
        ├── api/              # 화면별 API 계약 문서
        ├── model/            # 필드/상태/계산 규칙 문서
        ├── ui/               # 레이아웃/UX 문서
        └── db/               # 테이블/인덱스/제약 문서
```

---

## 5. 기술 스택

| 영역 | 기술 | 버전 (package.json 기준) |
|---|---|---|
| Frontend 프레임워크 | React | ^19.2.4 |
| Frontend 빌드 | Vite | ^7.3.1 |
| 라우팅 | react-router-dom | ^7.13.0 |
| 차트 | chart.js + react-chartjs-2 | ^4.5.1 / ^5.3.1 |
| 아이콘 | lucide-react | ^0.575.0 |
| 스타일 | CSS Modules (Vanilla CSS) | — |
| Backend 런타임 | Node.js | LTS 권장 |
| Backend 프레임워크 | Express | ^4.21.2 |
| DB 드라이버 | mysql2 | ^3.17.4 |
| 환경변수 | dotenv | ^17.3.1 |
| CORS | cors | ^2.8.6 |
| HTTP 클라이언트 (루트) | axios | ^1.13.6 |
| DB | MariaDB | 10.5+ (Linux 환경 기준) |

> **참고**: 백엔드에 별도 ORM은 사용하지 않으며, 순수 SQL을 사용합니다.

---

## 6. 실행 방법

### 사전 조건
- Node.js (LTS 버전 권장)
- MariaDB 10.5+ 실행 중 및 `pip` 데이터베이스 생성 완료

### 6.1 의존성 설치

```bash
# 프론트엔드
cd Front
npm install

# 백엔드
cd ../Server
npm install
```

### 6.2 환경변수 설정

`Server/` 디렉토리에 `.env` 파일을 생성합니다.  
`.env` 파일이 없을 경우 `src/db.js`의 하드코딩 기본값이 사용됩니다.

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=비밀번호
DB_NAME=pip
PORT=3001
```

> `.env` 파일이 저장소에 존재하지 않습니다 (`.gitignore` 처리 권장).

### 6.3 백엔드 실행

```bash
cd Server
npm start
# 또는
npm run dev
```

- 기본 포트: **3001** (`PORT` 환경변수로 변경 가능)
- 헬스체크: `GET http://localhost:3001/health`

### 6.4 프론트엔드 실행

```bash
cd Front
npm run dev
```

- 기본 포트: **5173** (Vite 기본값)
- `/api` 요청은 `vite.config.js`의 프록시 설정에 의해 `http://localhost:3001`로 전달됩니다.

### 6.5 프론트엔드 빌드

```bash
cd Front
npm run build   # dist/ 생성
npm run preview # 빌드 결과 로컬 미리보기
```

---

## 7. API 구조

모든 API는 `/api/pip` base path를 사용합니다.

| 도메인 | 메서드 | 경로 | 설명 |
|---|---|---|---|
| 자산(Assets) | GET | `/api/pip/assets` | 자산 목록 조회 |
| | POST | `/api/pip/assets` | 자산 등록 |
| | PUT | `/api/pip/assets/:assetId` | 자산 수정 |
| 계좌(Accounts) | GET | `/api/pip/accounts` | 계좌 목록 조회 |
| | POST | `/api/pip/accounts` | 계좌 등록 |
| | PUT | `/api/pip/accounts/:id` | 계좌 수정 |
| | DELETE | `/api/pip/accounts/:id` | 계좌 소프트 삭제 |
| | POST | `/api/pip/accounts/:id/restore` | 계좌 복원 |
| 원장(Transactions) | GET | `/api/pip/transactions` | 원장 목록 조회 (필터 지원) |
| | GET | `/api/pip/transactions/metadata` | 원장 메타데이터 조회 |
| | POST | `/api/pip/transactions` | 원장 등록 |
| | PUT | `/api/pip/transactions/:id` | 원장 수정 |
| 환전(FX) | GET | `/api/pip/fx-activities` | FX 원장 목록 조회 |
| | POST | `/api/pip/fx-activities` | FX 원장 등록 |
| | GET | `/api/pip/fx/meta` | FX 메타 조회 |
| 포지션 | GET | `/api/pip/positions` | 원장 기반 포지션 계산 조회 |
| 대시보드 | GET | `/api/pip/dashboard` | 대시보드 요약 데이터 조회 |
| 공통코드 | GET | `/api/pip/common-codes?grpId={ID}` | 공통코드 조회 |
| | GET | `/api/pip/common-code-groups` | 코드그룹 목록 조회 |
| | POST | `/api/pip/common-codes` | 공통코드 등록 |
| | PUT | `/api/pip/common-codes/:grpId/:cdId` | 공통코드 수정 |

> API 경로에 ScreenID를 직접 포함하는 표기 (예: `/api/pip/PIPACTLOGS01/...`)는 비표준입니다.

---

## 8. DB / 데이터 규칙

### 주요 테이블

| 테이블명 | 역할 |
|---|---|
| `PIP_TRANSACTIONS` | 단일 원장 (모든 투자 활동 기록) |
| `PIP_ASSETS` | 자산(종목) 마스터 |
| `PIP_ACCOUNTS` | 계좌 마스터 (확인 필요: 별도 테이블 여부) |
| `PIP_CM_CD` | 공통코드 (자산유형/노출지역/통화 등) |

### 공통코드 그룹

| CD_GRP_ID | 용도 |
|---|---|
| `ASSET_TYPE` | 자산유형 (STOCK, ETF, BOND, CRYPTO 등) |
| `EXPOSURE_REGION` | 노출지역 (KR, US 등) |
| `TX_CCY_CD` | 거래통화 (KRW, USD 등) |

### DB 작성 원칙
- SQL 작성 시 테이블명은 **반드시 대문자** 사용 (`PIP_TRANSACTIONS`, `PIP_ASSETS` 등)
- MariaDB 10.5 + Linux 환경 기준 (대소문자 구분 주의)
- `DEFINER` 구문 포함 DDL은 환경 이식성 문제를 유발할 수 있으므로 지양
- 비호환 collation 혼용 금지
- 계산 결과 컬럼(평균단가, 평가금액 등) DB 저장 금지

---

## 9. 개발 규칙 및 주의사항

### SSOT 준수
- **SSOT에 없는 필드/상태/흐름은 구현하지 않는다.**
- 문서 충돌 시 상위 우선순위 문서(`basic > API > MODEL > UI > DB > _index`)를 기준으로 하위 문서를 수정한다.
- 코드로 SSOT 규칙을 덮어쓰지 않는다.

### 화면 책임 분리
- **입력 화면** (PIPACTLOGS01, PIPFXS01, PIPMETAMST01): 데이터 입력/수정 전담
- **조회/계산 화면** (PIPPOSHLDS01, PIPDASHS01): 원장 집계/계산 전담, 쓰기 API 제공 금지
- 입력 화면과 조회 화면의 책임을 혼합하지 않는다.

### 파일 네이밍 규칙
- 화면 전용 구현 파일 이름에는 ScreenID를 포함한다. (예: `PIPACTLOGS01.api.js`, `PIPFXS01Controller.js`)
- 공용 파일(여러 화면 재사용)에는 ScreenID를 포함하지 않는다. (예: `useCommonCodes.js`, `db.js`)
- 화면 전용 파일 최상단에는 표준 헤더 주석(ScreenID, Purpose, SSOT 경로, 금지 규칙)을 작성한다.

### 공통코드 사용
- 자산유형, 노출지역, 통화 등은 소스 코드에 하드코딩하지 않는다.
- 프론트엔드에서는 `useCommonCodes()` Hook을 통해 조회하여 사용한다.
- DB 데이터 추가만으로 화면에 반영되어야 한다.

### 금지 사항
- 계산값(평균단가, 평가금액, 수익률 등) DB 저장 금지
- FX 전용 테이블/스냅샷 별도 생성 금지
- 물리 삭제(DELETE) 금지 — Soft Delete만 사용
- 조회 화면(PIPPOSHLDS01, PIPDASHS01)에서 쓰기 API 제공 금지
- 필터 변경 시 자동 조회 금지 — 조회 버튼으로만 조회

---

## 10. 참고 문서

| 문서 | 경로 | 용도 |
|---|---|---|
| SSOT 허브 (진입점) | [docs/design/_index.md](docs/design/_index.md) | 전체 화면 SSOT 링크 맵, 전역 규칙 |
| SSOT 헌법 | [docs/design/basic/기본_화면_설계_V0.2.1.md](docs/design/basic/기본_화면_설계_V0.2.1.md) | 최상위 설계 원칙 |
| Copilot 지침 | [docs/design/copilot-instructions.md](docs/design/copilot-instructions.md) | AI 보조 개발 지침 |
| SSOT MCP 워크플로 | [docs/design/ssot-mcp-workflow.md](docs/design/ssot-mcp-workflow.md) | 작업 절차 및 충돌 판정 기준 |
| 문서 검증 체크리스트 | [docs/design/validate-docs.md](docs/design/validate-docs.md) | 문서 정합성 검증 항목 |

### 화면별 설계 문서

| ScreenID | API | MODEL | UI | DB |
|---|---|---|---|---|
| PIPACTLOGS01 | [API](docs/design/api/PIPACTLOGS01_API.md) | [MODEL](docs/design/model/PIPACTLOGS01_MODEL.md) | [UI](docs/design/ui/PIPACTLOGS01_UI.md) | [DB](docs/design/db/PIPACTLOGS01_DB.md) |
| PIPASSETS01 | [API](docs/design/api/PIPASSETS01_API.md) | [MODEL](docs/design/model/PIPASSETS01_MODEL.md) | [UI](docs/design/ui/PIPASSETS01_UI.md) | [DB](docs/design/db/PIPASSETS01_DB.md) |
| PIPPOSHLDS01 | [API](docs/design/api/PIPPOSHLDS01_API.md) | [MODEL](docs/design/model/PIPPOSHLDS01_MODEL.md) | [UI](docs/design/ui/PIPPOSHLDS01_UI.md) | [DB](docs/design/db/PIPPOSHLDS01_DB.md) |
| PIPDASHS01 | [API](docs/design/api/PIPDASHS01_API.md) | [MODEL](docs/design/model/PIPDASHS01_MODEL.md) | [UI](docs/design/ui/PIPDASHS01_UI.md) | [DB](docs/design/db/PIPDASHS01_DB.md) |
| PIPFXS01 | [API](docs/design/api/PIPFXS01_API.md) | [MODEL](docs/design/model/PIPFXS01_MODEL.md) | [UI](docs/design/ui/PIPFXS01_UI.md) | [DB](docs/design/db/PIPFXS01_DB.md) |

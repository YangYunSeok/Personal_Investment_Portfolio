# PIPFXS01_API (v0.1.0)

> 기준 문서: 기본_화면_설계_V0.2.1.md fileciteturn0file0  
> 작성일: 2026-02-03 (Asia/Seoul)

## 0. 원칙
- 본 화면의 입력은 **FX Activity(Transaction)** 로 기록된다. fileciteturn0file0
- 계산값(평균단가/손익 등)은 API 응답에 포함하지 않는 것을 기본으로 한다. fileciteturn0file0

## 1. API 목록 (화면 전용)
### 1.1 환전 저장 (FX Activity 생성)
- Method: `POST`
- Path: `/api/PIPFXS01/fx-activities`

#### Request Body
```json
{
  "tradeDate": "2026-02-03",
  "accountId": "ACC001",
  "fromCurrency": "KRW",
  "fromAmount": 1000000,
  "toCurrency": "USD",
  "toAmount": 750,
  "fxRate": 1333.33,
  "feeCurrency": "KRW",
  "feeAmount": 1000,
  "memo": "환전"
}
```

#### Response 201
```json
{
  "activityId": "ACT_... (server-generated)",
  "screenId": "PIPFXS01"
}
```

#### Error (공통)
- 400: validation error (필수값/제약 위반)
- 500: server error

> **SSOT 갭:** 공통 에러 포맷/코드는 프로젝트 공통 API SSOT 확정 후 동기화한다.

### 1.2 (선택) 환전 입력 보조 데이터
- Method: `GET`
- Path: `/api/PIPFXS01/meta`

#### Response 200
```json
{
  "currencies": ["KRW","USD","JPY"],
  "accounts": [
    { "accountId": "ACC001", "accountName": "증권사A" }
  ]
}
```

> 이 API는 화면 구동 편의용이며, 계좌/통화가 이미 전역 상태로 공급되면 생략 가능.

## 2. 백엔드 파일/클래스 규칙
- `PIPFXS01Controller.java`
- `PIPFXS01Service.java`
- `PIPFXS01Mapper.xml` fileciteturn0file0

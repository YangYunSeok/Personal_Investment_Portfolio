# PIPACTLOGS01_API.md
(Activity Log · API SSOT)

- ScreenID: **PIPACTLOGS01**
- Base URL: `/api`
- Primary Resource: `/transactions`

> 상위 문서: `기본_화면_설계_V0.2.1.md`  
> 연관 문서: `PIPACTLOGS01_MODEL.md`, `PIPACTLOGS01_UI.md`

---

## 0. API 책임 범위 (SSOT 고정)

본 API는 **Activity(Transaction) 단일 원장**의 입력/조회만을 책임한다.

- 입력값(Input)만을 저장한다.
- 계산값(Derived)은 **응답 시 계산하여 제공할 수 있으나 저장하지 않는다.**
- 포지션/평균단가/수익률 등은 **PIPPOSHLDS01 이후 화면의 책임**이다.

---

## 1. 공통 규칙

- Content-Type: `application/json`
- CSV 업로드: `multipart/form-data`
- `tradeDate`: `YYYY-MM-DD`
- 기준 통화: **KRW**
- `fxRate`: **1 단위 외화 = KRW 얼마**
- `tradeCurrency != KRW` 인 경우 `fxRate` 필수
- 삭제는 **Soft Delete**
  - 기본 조회 조건: `deleted = false`

---

## 2. DTO 계약

### 2.1 Transaction (Response)

> ⚠️ Response에는 **입력값 + 표시용 파생값**만 포함한다.  
> 평균단가/수익률/평가금액 등 포지션 계산값은 포함하지 않는다.

```json
{
  "transactionId": "TXN_001",
  "tradeDate": "2026-02-01",
  "accountId": "ACC_001",
  "assetId": "MSTY",
  "assetType": "ETF",
  "exposureRegion": "US",
  "transactionType": "BUY",
  "quantity": 10.0,
  "unitPrice": 20.5,
  "tradeAmount": 205.0,
  "tradeCurrency": "USD",
  "fxRate": 1447.7,
  "amountKrw": 296778.5,
  "fromCurrency": null,
  "toCurrency": null,
  "memo": "첫 매수",
  "deleted": false,
  "createdAt": "2026-02-01T10:00:00",
  "updatedAt": "2026-02-01T10:00:00"
}
```

- `amountKrw` 는 **응답 전용 계산값**이며 저장하지 않는다.

---

### 2.2 Create / Update Request (Input Only)

```json
{
  "tradeDate": "2026-02-01",
  "accountId": "ACC_001",
  "assetId": "MSTY",
  "assetType": "ETF",
  "exposureRegion": "US",
  "transactionType": "BUY",
  "quantity": 10.0,
  "unitPrice": 20.5,
  "tradeAmount": 205.0,
  "tradeCurrency": "USD",
  "fxRate": 1447.7,
  "fromCurrency": null,
  "toCurrency": null,
  "memo": "첫 매수"
}
```

- ❌ 계산값(평균단가, 평가금액, 수익률 등)은 Request에 포함할 수 없다.

---

## 3. Validation Rules (TransactionType 기준)

### 3.1 BUY / SELL
- 필수: `quantity`, `unitPrice`, `tradeCurrency`
- 외화 거래 시: `fxRate` 필수
- 금지: `fromCurrency`, `toCurrency`

### 3.2 DIVIDEND / INTEREST
- 필수: `tradeAmount`, `tradeCurrency`
- 외화 거래 시: `fxRate` 필수
- 금지: `quantity`, `unitPrice`

### 3.3 FX
- 필수: `fromCurrency`, `toCurrency`, `tradeAmount`, `fxRate`
- 금지: `quantity`, `unitPrice`
- FX 거래는 **KRW 사용을 위한 유일한 경로**이다.

### 3.4 DEPOSIT / WITHDRAW / FEE / TAX
- 필수: `tradeAmount`, `tradeCurrency`
- 외화 거래 시: `fxRate` 필수
- 금지: `quantity`, `unitPrice`

---

## 4. Endpoints

### 4.1 목록 조회
`GET /api/transactions`

Query (모두 optional):
- `from`, `to`
- `accountId`, `assetId`
- `assetType`, `exposureRegion`
- `transactionType`, `tradeCurrency`
- `includeDeleted` (default: false)
- `page` (default: 1)
- `size` (default: 50)
- `sort` (default: tradeDate,desc)

Response 200:
```json
{
  "items": [],
  "page": 1,
  "size": 50,
  "total": 0
}
```

---

### 4.2 단건 조회
`GET /api/transactions/{transactionId}`

---

### 4.3 생성
`POST /api/transactions` → **201 Created**

---

### 4.4 수정
`PUT /api/transactions/{transactionId}` → **200 OK**

> ⚠️ 수정은 **입력 오류 정정 목적**으로만 허용한다.  
> 거래 의미 변경은 **반대 거래(Activity) 추가**로 처리하는 것을 권장한다.

---

### 4.5 삭제 (Soft Delete)
`DELETE /api/transactions/{transactionId}` → **204 No Content**

---

## 5. CSV 업로드

`POST /api/transactions/upload`

Response 200:
```json
{
  "successCount": 120,
  "failCount": 3,
  "errors": [
    { "row": 15, "message": "tradeDate is required" }
  ]
}
```

### CSV 최소 컬럼
- `tradeDate`
- `accountId`
- `transactionType`
- `tradeAmount`
- `tradeCurrency`

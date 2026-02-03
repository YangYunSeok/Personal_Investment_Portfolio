# PIPACTLOGS01_API.md
(Activity Log · API SSOT)

- ScreenID: **PIPACTLOGS01**
- Base URL: `/api`
- Primary Resource: `/transactions`

> 상위 문서: `기본_화면_설계_V0.2.1.md`  
> 연관 문서: `PIPACTLOGS01_MODEL.md`, `PIPACTLOGS01_UI.md`

---

## 1. 공통 규칙
- JSON: `application/json`
- CSV 업로드: `multipart/form-data`
- `tradeDate`: `YYYY-MM-DD`
- `fxRate`: **1 단위 외화 = KRW 얼마**
- `tradeCurrency != KRW`이면 `fxRate` 필수
- 삭제는 soft delete (기본 조회는 deleted=false)

---

## 2. DTO

### 2.1 Transaction (Response)
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
  "fromCurrency": null,
  "toCurrency": null,
  "memo": "첫 매수",
  "deleted": false,
  "createdAt": "2026-02-01T10:00:00",
  "updatedAt": "2026-02-01T10:00:00"
}
```

### 2.2 Create/Update Request
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

---

## 3. Validation Rules

- BUY/SELL: quantity, unitPrice, tradeCurrency 필수 / 외화면 fxRate 필수
- DIVIDEND/INTEREST: tradeAmount, tradeCurrency 필수 / 외화면 fxRate 필수 / quantity·unitPrice 금지
- FX: fromCurrency, toCurrency, tradeAmount, fxRate 필수 / quantity·unitPrice 금지
- DEPOSIT/WITHDRAW/FEE/TAX: tradeAmount, tradeCurrency 필수 / 외화면 fxRate 필수 / quantity·unitPrice 금지

---

## 4. Endpoints

### 4.1 목록 조회
`GET /api/transactions`

Query(모두 optional):
- from, to
- accountId, assetId
- assetType, exposureRegion
- transactionType, tradeCurrency
- includeDeleted=false
- page=1, size=50, sort=tradeDate,desc

Response 200:
```json
{ "items": [], "page": 1, "size": 50, "total": 0 }
```

### 4.2 단건 조회
`GET /api/transactions/{transactionId}`

### 4.3 생성
`POST /api/transactions` → 201

### 4.4 수정
`PUT /api/transactions/{transactionId}` → 200

### 4.5 삭제(soft delete)
`DELETE /api/transactions/{transactionId}` → 204

---

## 5. CSV 업로드
`POST /api/transactions/upload`

Response 200:
```json
{
  "successCount": 120,
  "failCount": 3,
  "errors": [ { "row": 15, "message": "tradeDate is required" } ]
}
```

CSV 최소 컬럼:
- tradeDate, assetId, transactionType, tradeAmount, tradeCurrency

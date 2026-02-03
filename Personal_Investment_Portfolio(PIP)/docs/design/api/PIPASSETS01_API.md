# PIPASSETS01_API
Asset Detail Screen – API SSOT

## 0. 원칙
- 모든 API는 조회 전용
- 계산 결과는 실시간 산출

---

## 1. 자산 상세 요약 조회
GET /api/pip/assets/{assetId}

### Response
```json
{
  "assetId": "AST001",
  "assetName": "AAPL",
  "assetType": "Stock",
  "exposureRegion": "US",
  "currency": "USD",
  "summary": {
    "investedAmount": 10000000,
    "currentValue": 12500000,
    "realizedProfitLoss": 1000000,
    "unrealizedProfitLoss": 1500000,
    "profitRate": 25.0
  },
  "holding": {
    "quantity": 10,
    "avgBuyPrice": 150.0
  }
}
```

---

## 2. Activity 목록 조회
GET /api/pip/assets/{assetId}/activities

### Query Params
- fromDate (optional)
- toDate (optional)
- type (optional)

### Response
```json
[
  {
    "tradeDate": "2025-01-10",
    "type": "BUY",
    "quantity": 5,
    "price": 140,
    "amount": 700,
    "currency": "USD",
    "fxRate": 1320
  }
]
```

---

## 3. 금지 사항
- 계산 결과 저장 API ❌
- 입력/수정 API ❌

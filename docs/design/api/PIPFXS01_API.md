# PIPFXS01_API (v0.2.1)

## 0. 원칙
- PIPFXS01은 **환전(FX) 관리/입력/조회 API**다.
- FX는 별도 전용 테이블/스냅샷을 만들지 않고, 단일 원장(Activity/Transaction)으로 관리한다.
- 계산값(평균단가/손익/평가금액)은 API 계약에 포함하지 않으며 저장하지 않는다.

## 1. 환전 입력 (FX Activity 생성)
- Method: `POST`
- Path: `/api/pip/fx-activities`

### Request Body
```json
{
  "tradeDate": "2026-02-03",
  "accountId": "ACC001",
  "fromCurrency": "KRW",
  "toCurrency": "USD",
  "tradeAmount": 1000000,
  "tradeCurrency": "KRW",
  "fxRate": 1333.33,
  "memo": "환전"
}
```

### Response 201
```json
{
  "transactionId": "TXN_0001",
  "transactionType": "FX"
}
```

## 2. 환전 내역 조회
- Method: `GET`
- Path: `/api/pip/fx-activities`

### Query Params
- fromDate (optional)
- toDate (optional)
- accountId (optional)
- fromCurrency (optional)
- toCurrency (optional)

### Response 200
```json
{
  "items": [
    {
      "transactionId": "TXN_0001",
      "tradeDate": "2026-02-03",
      "accountId": "ACC001",
      "fromCurrency": "KRW",
      "toCurrency": "USD",
      "tradeAmount": 1000000,
      "tradeCurrency": "KRW",
      "fxRate": 1333.33,
      "memo": "환전"
    }
  ],
  "total": 1
}
```

## 3. 환전 입력 보조 데이터 (선택)
- Method: `GET`
- Path: `/api/pip/fx/meta`

### Response 200
```json
{
  "currencies": ["KRW", "USD", "JPY"],
  "accounts": [
    { "accountId": "ACC001", "accountName": "증권사A" }
  ]
}
```

## 4. Error (공통)
- 400: validation error (필수값/제약 위반)
- 500: server error

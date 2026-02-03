# PIPPOSHLDS01_API (Position Query API)

## 0. Principles
- PIPPOSHLDS01은 **원장(Activity)**에서 계산된 결과를 제공한다.
- 계산 결과를 저장하지 않는다.
- 기준 통화 KRW 환산은 Activity에 기록된 환율/통화 규칙을 따른다.

## 1. GET Positions

### Endpoint
- `GET /api/pip/poshlds01/positions`

### Query Params
- `asOf` (string, optional): 기준시점(YYYY-MM-DD). 기본=오늘
- `accountId` (string, optional): 미지정 시 전체 계좌
- `exposure` (string, optional): KR|US|JP|CH|GLOBAL
- `assetType` (string, optional): Stock|ETF|Bond|Crypto|Commodity|FX Cash|KRW Cash
- `q` (string, optional): assetName/assetId 검색어

### Response 200
```json
{
  "asOf": "2026-02-03",
  "rows": [
    {
      "accountId": "ACC001",
      "assetId": "AAPL",
      "assetName": "Apple Inc.",
      "assetType": "Stock",
      "exposure": "US",
      "currency": "USD",
      "quantity": 10,
      "avgUnitCost": 150,
      "costBasis": 1500,
      "fxRateToKRW": 1320.5,
      "costBasisKRW": 1980750
    }
  ]
}
```

### Error
- 400: 파라미터 형식 오류(asOf 포맷 등)
- 500: 집계 실패/서버 오류

## 2. Notes (Future Extension)
- 페이징이 필요해지면(대량 계좌/종목):
  - `page`, `size`, `sort` 파라미터를 추가한다.
  - (추가 시 SSOT에 먼저 반영 후 구현)

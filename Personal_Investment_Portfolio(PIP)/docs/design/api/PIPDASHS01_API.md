# PIPDASHS01_API.md
## Dashboard API Contract

### 1. Endpoint
GET /api/pip/dashboard

### 2. Request
- 없음

### 3. Response
```json
{
  "portfolioSummary": {
    "totalAssetKrw": 0,
    "totalInvestedKrw": 0,
    "totalPnLKrw": 0,
    "totalReturnRate": 0
  },
  "assetAllocations": [],
  "regionExposures": []
}
```

### 4. Rule
- 계산 결과는 Position 기반 집계 결과만 사용
- Activity 직접 조회 금지

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
- Dashboard는 조회 중심 화면이며 쓰기 API를 제공하지 않는다.
- **계산 결과 저장 금지**
- 집계 결과는 원장(Activity) 기반 계산 결과만 사용한다.

# PIPASSETS01_API
Asset Master Screen – API SSOT

## 0. 원칙
- PIPASSETS01은 **자산(종목) 마스터(참조 데이터) 관리 API**다.
- 집계/평가/수익률 계산 API를 제공하지 않는다.
- Soft Delete 정책은 `deleted` 필드를 사용한다.

---

## 1. 자산 마스터 목록 조회
GET /api/pip/assets

### Query Params
- assetType (optional)
- exposureRegion (optional)
- keyword (optional: assetId/assetName)
- includeDeleted (optional, default: false)

### Response
```json
{
  "items": [
    {
      "assetId": "AAPL",
      "assetName": "Apple Inc.",
      "assetType": "Stock",
      "exposureRegion": "US",
      "currency": "USD",
      "deleted": false
    }
  ],
  "total": 1
}
```

---

## 2. 자산 마스터 단건 조회
GET /api/pip/assets/{assetId}

### Response
```json
{
  "assetId": "AAPL",
  "assetName": "Apple Inc.",
  "assetType": "Stock",
  "exposureRegion": "US",
  "currency": "USD",
  "deleted": false
}
```

---

## 3. 자산 마스터 등록
POST /api/pip/assets

### Request
```json
{
  "assetId": "AAPL",
  "assetName": "Apple Inc.",
  "assetType": "Stock",
  "exposureRegion": "US",
  "currency": "USD"
}
```

---

## 4. 자산 마스터 수정
PUT /api/pip/assets/{assetId}

### Request
```json
{
  "assetName": "Apple Inc.",
  "assetType": "Stock",
  "exposureRegion": "US",
  "currency": "USD"
}
```

---

## 5. 자산 마스터 삭제 (Soft Delete)
DELETE /api/pip/assets/{assetId}

### Rule
- 물리 삭제 대신 `deleted = true`로 처리한다.
- 기본 조회는 `deleted = false`만 포함한다.

---

## 6. 금지 사항
- 자산 상세 집계(평가금액/수익률) API 제공 금지
- 계산 결과 저장 API 제공 금지

# PIPDASHS01_DB.md
## Dashboard DB Rule

### 1. Table Usage
- READ ONLY

### 2. Referenced Data
- PIP_TRANSACTIONS (원장)
- Position 집계 쿼리 결과(저장 테이블 아님)
- 환율 적용 규칙(Activity의 fxRate 기준)

### 3. DB Rule
- Dashboard 전용 저장 테이블 생성 금지
- **계산 결과 저장 금지**
- View / Query 조합만 허용

# PIPDASHS01_DB.md
## Dashboard DB Rule

### 1. Table Usage
- READ ONLY

### 2. Referenced Tables
- ACTIVITY_LOG (조회 금지, 간접 참조만 허용)
- POSITION_HOLDING (집계 기준)
- FX_RATE (환율 반영)

### 3. DB Rule
- Dashboard 전용 테이블 생성 금지
- View / Query 조합만 허용

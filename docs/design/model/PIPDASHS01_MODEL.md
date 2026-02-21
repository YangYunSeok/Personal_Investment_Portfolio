# PIPDASHS01_MODEL.md
## Dashboard Domain Model (SSOT)

### 1. Screen ID
- PIPDASHS01

### 2. Responsibility
- 포트폴리오 전체 요약 정보 제공
- 비중 / 분산 / 성과를 **조회 결과로만 표현**

### 3. Input Rule
- 본 화면은 입력을 받지 않는다.
- 모든 데이터는 Activity / Position 결과 조회 전용이다.

### 4. Core View Models

#### 4.1 PortfolioSummary
| Field | Type | Description |
|---|---|---|
| totalAssetKrw | number | 총 자산 (KRW 기준) |
| totalInvestedKrw | number | 총 투자 원금 |
| totalPnLKrw | number | 평가 손익 |
| totalReturnRate | number | 총 수익률 (%) |

#### 4.2 AssetAllocation
| Field | Type | Description |
|---|---|---|
| assetType | enum | Stock / ETF / Bond / Crypto / Cash |
| valueKrw | number | 평가 금액 |
| ratio | number | 비중 (%) |

#### 4.3 RegionExposure
| Field | Type | Description |
|---|---|---|
| region | enum | KR / US / JP / CH / GLOBAL |
| valueKrw | number | 평가 금액 |
| ratio | number | 비중 (%) |

### 5. Calculation Rule
- 본 화면은 **계산 로직을 가지지 않는다**
- 모든 수치는 Service 계층에서 조합된 결과만 사용한다.
- **계산 결과 저장 금지**

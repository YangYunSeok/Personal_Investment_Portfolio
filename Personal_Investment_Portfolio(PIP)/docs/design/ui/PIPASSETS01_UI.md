# PIPASSETS01_UI
Asset Detail Screen – UI SSOT

## 0. 문서 목적
PIPASSETS01 화면의 **UI 구조 및 사용자 인지 흐름**을 정의한다.

---

## 1. 진입 경로
- PIPPOSHLDS01 (Position 목록) → 자산 행 클릭

---

## 2. 전체 레이아웃

### 2.1 Header 영역
- 자산명
- 자산 유형
- 노출 지역
- 거래 통화

---

### 2.2 KPI 요약 영역
| 항목 | 설명 |
|---|---|
| 현재 평가 금액 | KRW 기준 |
| 총 투자 원금 | 누적 매수 기준 |
| 평가 손익 | 금액 |
| 수익률 | % |

---

### 2.3 보유 현황 영역
- 현재 보유 수량
- 평균 매입 단가
- 현재가 (옵션, 외부 연동 가능)

---

### 2.4 Activity 타임라인
| 컬럼 | 설명 |
|---|---|
| 거래일 | trade_date |
| 유형 | BUY / SELL / DIVIDEND / FEE / FX |
| 수량 | quantity |
| 단가 | price |
| 금액 | amount |
| 통화 | currency |
| 환율 | fx_rate |

---

## 3. 인터랙션
- 읽기 전용
- 거래일 기준 정렬
- 기간 필터
- Activity 유형 필터

---

## 4. 예외 / Empty State
- Activity 없음: “거래 이력이 없습니다.”
- 계산 불가: “데이터가 부족하여 계산할 수 없습니다.”

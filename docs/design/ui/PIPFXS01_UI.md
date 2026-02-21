# PIPFXS01_UI (v0.2.1)

## 1. 화면 구성
### 1.1 레이아웃
- 상단: 화면 타이틀 `Exchange (환전)`
- 중단: FX 입력 폼 카드
- 하단: FX 내역 조회 영역(필터 + 목록)

### 1.2 입력 폼 필드
| 구역 | 필드 | UI 컴포넌트 | 비고 |
|---|---|---|---|
| 기본 | 거래일(tradeDate) | DatePicker | 기본값: 오늘 |
| 기본 | 계좌(accountId) | Select |  |
| 출금 | 출금통화(fromCurrency) | Select |  |
| 입금 | 입금통화(toCurrency) | Select | from과 동일 선택 불가 |
| 금액 | 거래금액(tradeAmount) | Number | fromCurrency 기준 |
| 금액 | 거래통화(tradeCurrency) | Readonly | fromCurrency와 동일 |
| 환율 | 환율(fxRate) | Number | 사용자 입력값 저장 |
| 메모(옵션) | memo | Textarea |  |

### 1.3 내역 조회 필터
- 기간(fromDate ~ toDate)
- 계좌(accountId)
- 출금/입금 통화(fromCurrency, toCurrency)
- 조회 버튼

공통 조회 UX 규칙:
- **필터 변경 시 자동 조회 금지(조회 버튼으로만 조회).**

## 2. 사용자 흐름
### 2.1 저장
1) 사용자가 입력 후 `저장` 클릭
2) 클라이언트 1차 검증
3) 서버 API 호출 후 성공 시 내역 재조회

### 2.2 조회
1) 필터 입력
2) `조회` 버튼 클릭
3) FX 내역 목록 갱신

## 3. 에러/검증 메시지
- 필수값 누락: 각 필드 하단 인라인 메시지
- 통화 동일 선택: `출금 통화와 입금 통화는 달라야 합니다.`
- 금액/환율 0 이하: `0보다 큰 값을 입력하세요.`
- 서버 오류: 폼 상단 공통 에러 영역

## 4. 비기능(UI 규칙)
- 입력값만 저장하며 계산값(환차손익 등)을 확정값처럼 보여주지 않는다.
- FX는 별도 전용 테이블/스냅샷을 만들지 않고, 단일 원장(Activity/Transaction)으로 관리한다.

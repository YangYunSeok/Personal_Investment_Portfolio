# PIPACTLOGS01_UI.md
(Activity Log · UI SSOT)

- ScreenID: **PIPACTLOGS01**
- Type: **S (Screen)**
- Purpose: 모든 투자 활동의 **유일한 입력/관리 화면**

> 상위 문서: `기본_화면_설계_V0.2.1.md`  
> 연관 문서: `PIPACTLOGS01_MODEL.md`, `PIPACTLOGS01_API.md`

---

## 1. 화면 역할

- 엑셀 기반 “입력 시트들”을 웹 UI로 완전 대체한다.
- 매수/매도뿐 아니라 배당, 환전, 입출금, 수수료/세금까지 **단일 목록(Activity)** 에서 관리한다.
- 평가/수익률/집계는 이 화면의 책임이 아니다(표시만 가능).

---

## 2. 화면 구성

### 2.1 상단 필터 영역
- 기간: from ~ to
- 계좌(account)
- 자산유형(assetType)
- 노출지역(exposureRegion)
- 거래유형(transactionType)
- 통화(tradeCurrency)
- 키워드(자산/메모)

### 2.2 목록 테이블 (Activity Table)
권장 기본 컬럼:
- 거래일(tradeDate)
- 유형(transactionType)
- 자산(assetId) / 자산유형(assetType) / 노출(exposureRegion)
- 수량(quantity)
- 단가(unitPrice)
- 금액(tradeAmount) + 통화(tradeCurrency)
- 환율(fxRate) (외화인 경우 표시)
- 메모(memo)
- 작업: 수정 / 삭제

표시 규칙:
- 거래유형별로 의미 없는 컬럼은 `-` 또는 공란
  - DIVIDEND는 quantity/unitPrice를 비움
  - FX는 assetId 대신 `from→to` 표시 가능

### 2.3 입력/수정 모달 (Popup: PIPACTLOGP01 권장)
- “신규 입력” 버튼 → 모달 오픈
- 목록 행의 “수정” → 동일 모달에 값 채워서 오픈

---

## 3. 입력 폼 필드 정의

### 3.1 공통 입력
- 거래일(tradeDate) *필수*
- 계좌(accountId) *필수*
- 거래유형(transactionType) *필수*
- 자산유형(assetType) *필수* (FX/현금 이벤트 포함)
- 노출지역(exposureRegion) *필수*
- 자산(assetId) *거래유형별 조건부*
- 메모(memo) 선택

### 3.2 BUY / SELL
- 수량(quantity) *필수*
- 단가(unitPrice) *필수*
- 통화(tradeCurrency) *필수*
- 환율(fxRate) *(tradeCurrency != KRW인 경우 필수)*
- 금액(tradeAmount)
  - 입력 허용(선택)
  - 미입력 시 “수량×단가”로 자동 계산하여 저장 요청

### 3.3 DIVIDEND / INTEREST
- 금액(tradeAmount) *필수*
- 통화(tradeCurrency) *필수*
- 환율(fxRate) *(tradeCurrency != KRW인 경우 필수)*
- 수량/단가 필드는 UI에서 비활성화/숨김

### 3.4 FX
- From 통화(fromCurrency) *필수*
- To 통화(toCurrency) *필수*
- 금액(tradeAmount) *필수* (from 기준)
- 환율(fxRate) *필수*
- 자산 선택은 optional:
  - 기본은 자동으로 `FX:{from}->{to}`로 처리(사용자 입력 X)

### 3.5 DEPOSIT / WITHDRAW / FEE / TAX
- 금액(tradeAmount) *필수*
- 통화(tradeCurrency) *필수*
- 환율(fxRate) *(tradeCurrency != KRW인 경우 필수)*
- 수량/단가 비활성화/숨김

---

## 4. 해외 상품/환율 UX 규칙

- `tradeCurrency != KRW`이면:
  - 환율(fxRate) 입력을 **필수**로 표시한다.
  - 안내 문구: “1 {tradeCurrency} = KRW ?”
- 환율 입력을 빠뜨리면 저장 불가(프론트 선검증 + 서버 검증)

---

## 5. 커버드콜(배당 기반 원금회수) 표시 규칙

- “원금 회수율”은 **계산값**이므로 입력하지 않는다.
- 목록에 표시할 경우 Position/집계 결과를 참조해 읽기전용으로 표시한다.

---

## 6. CSV 업로드

### 6.1 UI 흐름
- “업로드” 버튼 → 파일 선택 → 업로드 실행
- 결과 요약(성공/실패) + 실패 행 에러 목록 표시

### 6.2 CSV 최소 컬럼(권장)
- tradeDate, assetId, transactionType, tradeAmount, tradeCurrency

권장 추가:
- accountId, assetType, exposureRegion, quantity, unitPrice, fxRate, memo, fromCurrency, toCurrency

---

## 7. 삭제/수정 UX
- 삭제 전 확인 모달 필수
- 삭제는 soft delete
- 수정은 v1.0에서 직접 수정 허용(향후 역거래 방식 확장 가능)

# PIPFXS01_MODEL (v0.2.1)

## 1. 화면 책임
PIPFXS01은 **환전(FX) 관리/입력/조회** 화면의 모델이다.
환전 입력은 단일 원장(Activity/Transaction)에 기록된다.

- 기준 통화는 KRW
- KRW 사용/전환은 FX(Activity)로만 기록
- 계산값(환차손익/평균단가/평가금액)은 저장하지 않음

## 2. 원장 원칙
- FX는 별도 전용 테이블/스냅샷을 만들지 않고, 단일 원장(Activity/Transaction)으로 관리한다.
- FX 입력은 TransactionType=`FX`인 원장 레코드로 표현한다.

## 3. 입력값(Stored Inputs) 스키마

### 3.1 FXActivityInput
| 필드 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| tradeDate | date | Y | 거래일 |
| accountId | string | Y | 계좌 식별자 |
| fromCurrency | string | Y | 출금 통화 |
| toCurrency | string | Y | 입금 통화 |
| tradeAmount | decimal | Y | 거래 금액(fromCurrency 기준) |
| tradeCurrency | string | Y | 거래 통화(= fromCurrency) |
| fxRate | decimal | Y | 사용자 입력 환율 |
| memo | string | N | 메모 |
| deleted | boolean | Y | Soft Delete 상태 |

### 3.2 제약(Validation)
- `fromCurrency != toCurrency`
- `tradeAmount > 0`
- `tradeCurrency = fromCurrency`
- `fxRate > 0`

## 4. 산출(Computed, Not Stored)
- 환전 단가(표시값)
- 환전 전/후 평가금액
- 환차손익
- **계산 결과 저장 금지**

## 5. 상태/수명주기
- 저장 성공 시 FX Activity 1건 생성
- 삭제는 Soft Delete(`deleted=true`)로 처리
- 수정 정책은 Activity Log SSOT를 따른다

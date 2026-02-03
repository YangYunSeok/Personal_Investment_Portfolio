# PIPFXS01_MODEL (v0.1.0)

> 기준 문서: 기본_화면_설계_V0.2.1.md fileciteturn0file0  
> 작성일: 2026-02-03 (Asia/Seoul)

## 1. 화면 책임 (What)
**환전 입력(Exchange)** 전용 화면.  
사용자가 수행한 환전/통화전환을 **단일 원장(Activity/Transaction)** 에 기록하기 위한 *가이드 입력 UI*를 제공한다.

- 기준 통화는 **KRW**
- **KRW 사용/전환은 반드시 FX(Activity)로 기록**한다. (원칙) fileciteturn0file0
- 계산값(평균단가/평가손익 등)은 저장하지 않는다. fileciteturn0file0

## 2. 도메인 개념 (SSOT)
### 2.1 Activity (Transaction)
- 모든 입력은 Activity Log에서 시작한다는 원칙을 유지하되,  
  본 화면은 **FX 전용 입력 폼**으로 Activity 생성 과정을 단순화한다. fileciteturn0file0

### 2.2 FX Activity 정의
FX Activity는 **통화 A를 감소**시키고 **통화 B를 증가**시키는 이벤트다.

- 예: `KRW → USD 환전`
  - KRW Cash 감소
  - USD Cash 증가

## 3. 입력값(Stored Inputs) 스키마
> 아래 필드는 “입력값 vs 계산값 분리” 원칙에 따라 **입력값만** 정의한다. fileciteturn0file0

### 3.1 FXActivityInput
| 필드 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| tradeDate | date | Y | 거래일 |
| accountId | string | Y | 계좌 식별자 (계좌 단위 관리 원칙의 훅) |
| fromCurrency | string | Y | 출금 통화 (예: KRW, USD) |
| fromAmount | decimal | Y | 출금 금액 |
| toCurrency | string | Y | 입금 통화 |
| toAmount | decimal | Y | 입금 금액 |
| fxRate | decimal | Y | 환율(사용자 입력). 일반적으로 `fromAmount / toAmount` 또는 반대. **저장값은 입력값 그대로** |
| feeCurrency | string | N | 수수료 통화 |
| feeAmount | decimal | N | 수수료 금액 |
| memo | string | N | 메모 |

### 3.2 제약(Validation)
- `fromCurrency != toCurrency`
- `fromAmount > 0`, `toAmount > 0`
- `fxRate > 0`
- `feeAmount`가 있으면 `feeAmount >= 0` 및 `feeCurrency` 필수
- 통화 코드는 시스템 공통코드(예: ISO 4217)로 관리하는 것을 권장 (구현은 공통 SSOT에 종속)

## 4. 산출(Computed, Not Stored)
다음 값은 **계산값**이며 저장하지 않는다. fileciteturn0file0

- 환전 단가(내부 표현)
- 환전 전/후 평가금액
- 환차손익

## 5. 이벤트/상태
본 화면 자체는 독립 상태머신을 두지 않는다.

- 저장 성공 시: FX Activity 1건이 생성됨
- 삭제/수정은 Activity Log 정책(별도 화면 SSOT)에 종속

## 6. SSOT 갭(명시)
- Activity/Account/통화 공통코드의 **정확한 테이블/필드명**은 `PIPACTLOGS01_DB` 및 공통 SSOT 확정 후 본 문서를 동기화한다.

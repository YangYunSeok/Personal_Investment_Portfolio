# PIPFXS01_DB (v0.1.0)

> 기준 문서: 기본_화면_설계_V0.2.1.md fileciteturn0file0  
> 작성일: 2026-02-03 (Asia/Seoul)

## 1. 저장 원칙
- 단일 원장(Activity=Transaction) 기반으로 저장한다. fileciteturn0file0
- 입력값과 계산값을 분리하며, **계산값은 저장하지 않는다.** fileciteturn0file0

## 2. 논리 모델 (테이블/컬럼명은 공통 SSOT에 종속)
본 화면 저장은 “FX Activity 1건”을 생성하는 것으로 정의한다.

### 2.1 FX Activity가 표현해야 하는 최소 데이터(논리 컬럼)
| 논리 컬럼 | 설명 |
|---|---|
| activity_id | Activity 식별자(서버 생성) |
| activity_type | 고정값: `FX` |
| trade_date | 거래일 |
| account_id | 계좌 식별자 |
| from_currency / from_amount | 출금 통화/금액 |
| to_currency / to_amount | 입금 통화/금액 |
| fx_rate | 사용자 입력 환율(입력값 그대로) |
| fee_currency / fee_amount | 수수료(옵션) |
| memo | 메모 |
| created_at / updated_at | 생성/수정시각 |

## 3. 잔액 반영(계산) 책임
- 잔액/보유액 집계는 Position/대시보드 계산 레이어의 책임이다. fileciteturn0file0
- DB에는 FX Activity 입력값만 저장하고,
  잔액 스냅샷/평균단가/손익을 저장하지 않는다.

## 4. SSOT 갭(명시)
현재 최상위 설계문서는 Activity 테이블 구조를 정의하지 않는다. fileciteturn0file0  
따라서 본 DB 문서는 다음 문서가 확정되면 **정확한 물리 스키마로 치환**한다.

- `PIPACTLOGS01_DB.md` (Activity 저장 테이블 정의)
- 공통코드(통화) / 계좌(Account) DB 정의 문서

치환 시 원칙:
- 화면은 FX 전용이지만, 저장은 반드시 Activity(원장) 테이블 패턴을 따른다.

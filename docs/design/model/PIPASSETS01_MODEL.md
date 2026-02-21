# PIPASSETS01_MODEL
Asset Master Screen – Model SSOT

## 0. 문서 목적
본 문서는 PIPASSETS01 화면의 **자산(종목) 마스터(참조 데이터) 모델 SSOT**다.
본 문서에 정의되지 않은 필드/상태는 구현할 수 없다.

---

## 1. 화면 정의
- Screen ID: PIPASSETS01
- Screen Name: Asset Master
- 화면 성격: 마스터 관리(등록/수정/비활성)
- 역할: 원장 입력 화면(PIPACTLOGS01)과 조회 화면에서 공통 참조하는 자산 기준 데이터 관리

---

## 2. 핵심 책임
- 자산 식별자/명칭/유형/노출/통화 관리
- 원장 입력에서 사용하는 참조 데이터 무결성 보장
- 계산/집계 책임은 갖지 않음

---

## 3. 도메인 엔티티

### 3.1 AssetMaster
| 필드 | 설명 |
|---|---|
| assetId | 자산 고유 식별자 (PK) |
| assetName | 자산명 |
| assetType | Stock / ETF / Bond / Crypto / Commodity / FX Cash / KRW Cash |
| exposureRegion | KR / US / JP / CH / GLOBAL |
| currency | 거래 통화 (ISO 4217) |
| deleted | Soft Delete 상태 (`false`: 활성, `true`: 비활성) |
| createdAt | 생성 시각 |
| updatedAt | 수정 시각 |

---

## 4. 입력값 vs 계산값

### 4.1 입력값 (DB 저장)
- assetId
- assetName
- assetType
- exposureRegion
- currency
- deleted

### 4.2 계산값
- 해당 화면은 계산값을 생성하지 않는다.

---

## 5. 상태 규칙
- 기본 조회 대상은 `deleted = false` 자산이다.
- 삭제는 물리 삭제가 아니라 `deleted = true`로 처리한다.
- 원장에서 사용 이력이 있는 자산도 Soft Delete만 허용한다.

---

## 6. 금지 사항
- 자산별 평가/수익률 계산 책임 포함 금지
- 계산 결과 저장 컬럼 추가 금지
- 원장(Activity) 의미를 대체하는 상태 필드 추가 금지

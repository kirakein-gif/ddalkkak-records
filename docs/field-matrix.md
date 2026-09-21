# 표준 필드 책임 매트릭스

이 문서는 **문서등록대장 → 이관신청 자동화 → 기록물관리 자동화 → 표준 기록물관리대장** 흐름에서 각 필드의 출처와 책임 프로그램을 한눈에 정리한다.

상태 표기:

- **직접**: 원천자료에서 직접 확보
- **산출**: 여러 원천값을 계산/집계해 생성
- **참조**: 표준 기준표로 변환/보완
- **입력**: 사용자가 확인 또는 입력
- **관리**: 기록관 인수·관리 단계에서 새로 생성
- **보존**: 기존 마이그레이션 값이 있으면 그대로 유지
- **공란허용**: 신규자료에서 근거 없으면 만들지 않음

## 1. 공통 핵심 필드

| Canonical 의미 | 표준 코드 | 문서등록대장 | 이관신청 | 기록물관리 | Migration | 비고 |
|---|---|---:|---:|---:|---:|---|
| 순번 | sno | - | - | - | 보존 가능 | 최종 Excel에서 행 기준 자동 산출 |
| 기록물철ID | folderId | - | 공란허용 | 공란허용 | 보존 | 신규자료에 임의 생성하지 않음 |
| 현 관리기관명 | keepOrgNm | 기관 추정 가능 | 기관 컨텍스트 | 참조/확정 | 변환 | 기관코드표 대상. 내부 '행정실'과 구분 |
| 현 관리기관코드 | keepOrgCd | - | - | 참조 | 참조 | keepOrgNm으로 기관코드표 조회 |
| 생산기관명 | creatOrgNm | 문서번호 기관명 추정 | 기관 컨텍스트 | 참조/확정 | 변환 | 기관코드표 대상 |
| 생산기관코드 | creatOrgCd | - | - | 참조 | 참조 | creatOrgNm으로 기관코드표 조회 |
| 내부 처리부서 | 표준 직접필드 없음 | - | 입력 | 유지 | 지역필드 보존 가능 | 예: 행정실. 표준 기관명 필드에 넣지 않음 |
| 생산연도 시작 | creatYyyyFrom | 등록일자 | **산출** | 유지 | 변환 | 권 전체 문서의 최소 연도 |
| 생산연도 종료 | creatYyyyTo | 등록일자 | **산출** | 유지 | 변환 | 권 전체 문서의 최대 연도 |
| 관리번호 | mngNo | - | - | **관리 생성** | 보존 | 기관별 자체 관리번호. 기존 최대번호 다음 번호 |
| 기록물명 | title | 제목·과제카드명 | **산출+입력** | 유지 | 변환 | 편철된 권 단위 제목 |
| 단위과제 | clssNm | 과제카드명·과제명 | **참조** | 검증 | 변환 | 과제카드명 1차, 과제명 보조 |
| 보존기간 | presvTermNm | 보존기한 | **참조+검증** | 유지 | 변환 | 표준 단위과제표 값 우선, 원본과 교차검증 |
| 기록유형 | typeDivNm | 제목/전자비전자 정보 | 추천+입력 | 유지 | 변환 | 문서류 / 시청각류 |
| 세부유형 | detailTypeNm | 제목 정보 | 추천+입력 | 유지 | 변환 | 일반문서/대장/카드/도면/사진/영상/음성 |
| 매체유형 | mediaTypeNm | 전자비전자+제목만으로 제한적 | 추천+입력 | 유지 | 변환 | 종이/DVD/필름 등. 무리한 자동확정 금지 |
| 수량(권) | hoCnt | - | **산출** | 유지 | 변환 | 현재 구조는 1권=1행이므로 기본 1 |
| 쪽수/매수 | 표준 직접필드 없음 | 쪽수 | **산출** | 상자구성에 사용 | 변환 가능 | 권 전체 쪽수. 내부 메타데이터로 유지 |
| 공개구분 | openDivNm | 공개구분 | **산출** | 유지 | 변환 | 공개/부분공개/비공개 |
| 비공개호수 | openGrade | 공개제한근거 | **산출** | 유지 | 변환 | 권 전체 제한근거 중복제거·정렬 |
| 보존장소 | presvLocNm | - | - | 관리/정책 | 변환 | 학교 표준은 제목 존재 시 기본 처리과 수식 |
| 열람구분 | operReadRangeNm | 직접대응 없음 | 입력/정책 | 확정 | 변환 | 목록공개여부와 동일 개념으로 보지 않음 |
| 비고 | descInfo | - | 선택 | 관리 | 변환 | 중복 등 검증메시지와 업무 비고 분리 권장 |
| 등록자 | regUser | - | 인계자 정보는 있음 | 정책/입력 | 변환 | 인계자와 대장 등록자의 의미 구분 필요 |
| 이관연도 | takeYyyy | 등록일자로 추정 가능 | 컨텍스트 | 확정 | 변환 | 이관 작업연도 |
| 기록물상태 | docuConditionNm | - | - | **실물검수 후** | 변환 | 양호/보통/불량 |
| DB등록여부 | rmsRegFlagNm | - | - | **등록 후** | 변환 | O/X |

## 2. 위치정보

위치정보는 원천 문서등록대장이나 이관신청서의 결손항목이 아니다. **실물 인수·배치 이후 생성되는 관리 데이터**다.

### Canonical 위치모델

```text
location.processing
  stack
  rack
  row
  column
  positionNo
  boxNo

location.archive
  stack
  rack
  row
  column
  preservationBoxName
```

### 표준서식별 출력 코드

| Canonical | 학교 | 직속 | 기록관 |
|---|---|---|---|
| processing.stack | stackNm | stackNm | - |
| processing.rack | rackNm | rackNm | - |
| processing.row | rowNm | rowNm | - |
| processing.column | colNm | colNm | - |
| processing.positionNo | excelBoxNo | orgPresvLoc | orgPresvLoc |
| processing.boxNo | excelPresvBoxNm | orgBoxNum | orgBoxNum |
| archive.stack | - | - | stackNm |
| archive.rack | - | - | rackNm |
| archive.row | - | - | rowNo |
| archive.column | - | - | colNo |
| archive.preservationBoxName | - | - | presvBoxNm |

## 3. 이관신청 자동화가 반드시 넘겨야 할 최소 데이터

관리대장으로 안정적으로 이어지려면 기존 이관신청서의 표시열만 믿지 않고 내부적으로 다음 값을 함께 보존해야 한다.

```text
institution
transferDepartmentName
productionYearFrom
productionYearTo
title
unitTask
retentionPeriod
recordType
detailType
mediaType
volumeCount
sheetCount
disclosure
restrictionNos
transferYear
sourceDocumentNos[]
sourceTaskCard
sourceTaskName
```

특히 `sheetCount`와 `sourceDocumentNos[]`는 최종 표준관리대장 열은 아니지만 이후 상자 구성·중복검증·추적성에 중요하다.

## 4. 기존 자동화에서 바로잡아야 하는 매핑

### 기존
```text
생산학교 → keepOrgNm
생산부서(행정실 등) → creatOrgNm
```

### 신규
```text
기관명 → keepOrgNm / creatOrgNm (업무 의미 확정 후)
내부 처리부서명 → transferDepartmentName
```

표준 기관명 필드는 기관코드표 조회가 가능한 **전체기관명**이어야 한다.

## 5. 편철 이후 한 행의 의미

웹버전에서 표준 이관자료의 한 행은:

> **한 기관의 한 단위과제(과제카드)에서 편철된 한 권의 기록물철**

을 기본 단위로 한다.

따라서 문서등록대장 여러 행이 하나의 RecordFolder로 합쳐진다.

```text
문서등록대장 N행
  ↓ 편철
RecordFolder 1개
  ↓ 이관
표준 이관자료 1행
  ↓ 관리번호/상자/위치 추가
표준 관리대장 1행
```

## 6. 현재 정책 확인이 필요한 필드

- keepOrgNm / creatOrgNm의 기록관 인수 전후 정확한 의미
- operReadRangeNm의 결정 규칙
- regUser의 업무상 정의
- 기록유형/세부유형/매체유형 자동추천 범위
- 처리과 위치정보가 신규 이관분에서 언제 필요한지

나머지 값은 현재 기존 VBA와 표준서식으로 생성 시점과 책임 프로그램을 상당 부분 확정할 수 있다.

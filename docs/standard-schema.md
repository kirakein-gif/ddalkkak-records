# 표준 데이터 스키마 — v0.1 설계안

## 1. 원칙

공통 Core는 Excel의 열 위치나 학교/직속/기록관 파일의 원본 시스템 코드에 직접 종속되지 않는다.

세 표준서식은 대부분 같은 필드를 사용하지만 **위치정보 코드명이 일부 다르다.** 따라서 내부에서는 하나의 canonical model을 사용하고, 내보낼 때 각 표준양식의 코드로 변환한다.

---

## 2. 표준서식 3종 비교

공통 기본필드:

- sno
- folderId
- keepOrgCd / keepOrgNm
- creatOrgCd / creatOrgNm
- creatYyyyFrom / creatYyyyTo
- mngNo
- title
- clssNm
- presvTermNm
- typeDivNm
- detailTypeNm
- mediaTypeNm
- hoCnt
- openDivNm
- openGrade
- presvLocNm
- operReadRangeNm
- descInfo
- regUser
- takeYyyy
- docuConditionNm
- rmsRegFlagNm

### 위치정보 차이

| 의미 | 학교 | 직속 | 기록관 |
|---|---|---|---|
| 처리과 서고 | stackNm | stackNm | - |
| 처리과 서가 | rackNm | rackNm | - |
| 처리과 열 | rowNm | rowNm | - |
| 처리과 층 | colNm | colNm | - |
| 처리과 위치번호 | excelBoxNo | orgPresvLoc | orgPresvLoc |
| 처리과 상자번호 | excelPresvBoxNm | orgBoxNum | orgBoxNum |
| 기록관 서고 | - | - | stackNm |
| 기록관 서가 | - | - | rackNm |
| 기록관 열 | - | - | rowNo |
| 기록관 층 | - | - | colNo |
| 기록관 보존상자 | - | - | presvBoxNm |

즉 `rowNm/colNm`과 `rowNo/colNo`, `excelBoxNo/excelPresvBoxNm`과 `orgPresvLoc/orgBoxNum`은 Core에서 별도 의미모델로 흡수해야 한다.

---

## 3. Canonical Record Folder Model

```text
RecordFolder
  identity
    folderId?
    managementNo?
    sequence?

  organization
    currentInstitution
      name
      code
    creatorInstitution
      name
      code
    transferDepartmentName?   # 행정실 등 내부 처리과. 표준 기관코드 필드와 분리

  production
    yearFrom
    yearTo

  classification
    title
    unitTask
    retentionPeriod

  format
    recordType       # 문서류 / 시청각류
    detailType       # 일반문서 / 대장 / 카드 / 도면 / 사진 / 영상 / 음성
    mediaType

  quantity
    volumeCount
    sheetCount?      # 상자 구성용 내부값. 표준대장 필드는 아님

  access
    disclosure       # 공개 / 부분공개 / 비공개
    restrictionNos[]
    readRange        # 전체열람 / 목록열람 / 열람불가

  management
    preservationPlace
    description?
    registrar?
    transferYear?
    condition?
    dbRegistered?

  location
    processing
      stack?
      rack?
      row?
      column?
      positionNo?
      boxNo?
    archive
      stack?
      rack?
      row?
      column?
      preservationBoxName?

  provenance
    sourceDocumentNos[]
    sourceTaskCard?
    sourceTaskName?
    sourceRows[]
```

`provenance`는 웹 내부 추적용이며 최종 표준 Excel에 반드시 출력할 필요는 없다.

---

## 4. 표준 허용값

### 기록유형

- 문서류
- 시청각류

### 세부유형

문서류:
- 일반문서
- 대장
- 카드
- 도면

시청각류:
- 사진
- 영상
- 음성

### 매체유형

문서류:
- 종이
- 사진
- 필름
- 자기매체
- 광매체
- 기타

사진:
- 인화사진
- 슬라이드필름
- 필름
- 사진CD
- 사진DVD
- 기타

영상:
- 영화필름
- 비디오디스크
- 비디오테이프
- 비디오릴
- 녹음테이프
- 녹음테이프릴
- DVD
- 기타

음성:
- 오디오CD
- DAT
- 마이크로카세트
- 기타

### 공개구분
- 공개
- 부분공개
- 비공개

### 열람구분
- 전체열람
- 목록열람
- 열람불가

### 보존장소
- 처리과
- 기록관

### 기록물상태
- 양호
- 보통
- 불량

### DB등록여부
- O
- X

---

## 5. 필드별 생성 시점

| Canonical 필드 | 표준 코드 | 생성 시점 |
|---|---|---|
| sequence | sno | 출력 시 자동 |
| folderId | folderId | 기존값 보존, 신규는 출처가 없으면 빈값 |
| currentInstitution | keepOrgNm/Cd | 기관 컨텍스트/표준 기관코드표 |
| creatorInstitution | creatOrgNm/Cd | 기관 컨텍스트/표준 기관코드표 |
| transferDepartmentName | 표준 직접필드 없음 | 이관업무 내부정보 |
| yearFrom/yearTo | creatYyyyFrom/To | 편철된 문서의 최소/최대 등록연도 |
| managementNo | mngNo | 관리대장 통합 단계 |
| title | title | 편철 단계 |
| unitTask | clssNm | 과제카드명 + 과제명 → 표준단위과제 |
| retentionPeriod | presvTermNm | 표준 단위과제표 우선, 원본과 교차검증 |
| recordType/detail/media | typeDivNm/detailTypeNm/mediaTypeNm | 이관단계 자동추천 + 사용자 확인 |
| volumeCount | hoCnt | 편철 결과. 현재 1권=1행이면 기본 1 |
| sheetCount | 표준 직접필드 없음 | 문서등록대장 쪽수 집계, 상자구성에 사용 |
| disclosure/restrictionNos | openDivNm/openGrade | 편철 문서 공개정보 집계 |
| readRange | operReadRangeNm | 정책/사용자확인 필요 |
| preservationPlace | presvLocNm | 관리단계. 학교는 기본 처리과 |
| description | descInfo | 선택/관리단계 |
| registrar | regUser | 관리대장 등록자 의미로 정책 확인 필요 |
| transferYear | takeYyyy | 이관 컨텍스트 |
| condition | docuConditionNm | 실물 확인 후 |
| dbRegistered | rmsRegFlagNm | DB 등록 후 |
| processing/archive location | 양식별 코드 상이 | 관리단계 물리배치 후 |

---

## 6. 자동 생성하지 않을 필드

### folderId

세 표준서식의 예시 데이터에서도 빈 값이 존재한다.

따라서 신규 기록물에 대해 근거 없이 임의 ID를 만들지 않는다.

- 마이그레이션 원본에 값이 있으면 보존
- 외부 시스템에서 값이 제공되면 사용
- 그 외에는 빈값 허용

### 물리적 위치

이관신청 단계에서는 존재하지 않는 데이터다.

상자·서고·서가·열·층 등은 관리단계에서 생성한다.

---

## 7. 기관명 주의사항

표준 `keepOrgNm`과 `creatOrgNm`은 기관코드 수식을 통해 코드로 변환되는 값이다.

따라서:

- 천안버들유치원 → 기관명 필드 가능
- 행정실 → 학교 내부 부서명으로서 기관코드 대상이 아님

기존 이관신청서의 '생산부서/처리과'와 표준 '생산부서명'은 명칭이 비슷하지만 동일한 의미로 취급하지 않는다.

---

## 8. 프로그램별 책임

### transfer
원천 문서 → RecordFolder의 내용 메타데이터 생성

### management
관리번호·상자·위치·상태 등 관리 메타데이터 추가

### migration
지역별 기존 열을 Canonical Model로 변환

### exporter
Canonical Model을 학교/직속/기록관 표준 Excel 코드로 변환

---

## 9. 아직 정책 확인이 필요한 항목

- keepOrgNm / creatOrgNm의 기관유형별 정확한 업무 의미
- operReadRangeNm 결정 규칙
- regUser를 인계자/대장등록자 중 누구로 볼지
- 시청각류의 세부유형·매체유형 자동판정 수준
- 기록관/직속에서 보존장소 변경 시 위치 필드 처리 규칙

이 항목들은 임의 추정하지 않고 기록연구사 기준 또는 사용자 확정 후 고정한다.

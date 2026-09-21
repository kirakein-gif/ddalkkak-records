# 이관신청서 수기수정 동기화 정책 v0.1

## 문제

웹에서 생성한 이관신청서.xlsx를 사용자가 결재 전 또는 결재 과정에서 수기로 수정할 수 있다.

만약 `_handoff`가 생성 당시 값을 그대로 저장한 독립 복사본이면,
사람이 보는 이관신청서와 기록물관리 프로그램이 읽는 값이 달라질 수 있다.

따라서 표시시트 수정과 handoff 연계정책을 명확히 한다.

## 기본 원칙

**사람이 보는 이관신청서의 최종값을 업무상 최종값으로 본다.**

`_handoff`는 독립된 값 복사본이 아니라
표시시트의 현재값과 원본 추적정보를 함께 보존하는 연계층으로 구성한다.

## handoff 필드 구성

각 기록물철마다 다음 3종을 구분한다.

### 1. stable fields

웹 생성 후 사용자가 수정하면 안 되는 식별/추적정보.

- schemaVersion
- transferPackageId
- rowId
- sourceDocumentNos
- sourceRowRefs
- sourceTaskCard
- sourceTaskName
- originalGeneratedAt

이 값은 정적값으로 보존한다.

### 2. current fields

사람이 보는 이관신청서에서 최종적으로 보이는 값.

가능하면 handoff가 표시시트 셀을 참조하도록 한다.

- yearFrom
- yearTo
- title
- unitTask
- retentionPeriod
- recordType
- detailType
- mediaType
- volumeCount
- disclosure
- restrictionNos
- documentCount
- sheetCount
- note
- transferDepartmentName

기록물관리 자동화는 이 current 값을 읽는다.

### 3. original fields

웹이 최초 생성한 값을 별도로 정적 보존한다.

예:
- originalTitle
- originalRetentionPeriod
- originalRecordType
- originalDetailType
- originalMediaType
- originalDisclosure
- originalRestrictionNos
- originalSheetCount

current와 original이 다르면 `userModified=true`로 판단할 수 있다.

## Excel 구현

### 표시 시트

사용자가 업무상 수정할 수 있는 셀:
- 기록물철 제목
- 생산연도
- 단위과제
- 보존기간
- 기록유형
- 세부유형
- 매체유형
- 공개구분
- 비공개호수
- 쪽수/문서수(필요 시)
- 비고
- 처리부서/인계자 등 상단 정보

행마다 보이지 않는 안정 식별자 `rowId`를 유지한다.
가능하면 숨김열 또는 정의된 이름으로 관리한다.

### _handoff

보이는 업무값은 표시시트의 해당 셀을 참조한다.

예:
- currentTitle = `='이관신청서'!D15`
- currentRetention = `='이관신청서'!G15`

원본 추적정보와 original 값은 정적 데이터로 둔다.

## 수정 종류별 처리

### 값만 수정

정상 지원.

표시시트 수정 → handoff current 값 자동반영 → 기록물관리 프로그램은 수정된 최종값 사용.

관리단계에서는 original과 비교하여 "사용자 수정됨"을 표시할 수 있다.

### 행 순서 변경

rowId가 각 기록물철과 함께 유지되는 범위에서는 지원.

관리프로그램은 행번호가 아니라 rowId로 동일 기록물철을 식별한다.

### 기존 행 삭제

관리프로그램에서 original rowId 목록과 current 목록을 비교해
"이관신청서에서 삭제된 기록물철"로 경고한다.

삭제를 허용하되 자동으로 조용히 무시하지 않는다.

### 새 행 추가

새 행에는 웹이 발급한 rowId와 source trace가 없다.

따라서 자동으로 정상 자료로 취급하지 않고
"수기 추가 기록물철"로 표시해 사용자 확인을 요구한다.

관리단계에서 수기추가로 승인할 수는 있으나
원본문서 추적정보가 없다는 점을 명시한다.

### 열 삭제/시트명 변경/구조 훼손

handoff 링크 또는 필수 구조가 깨진 경우
기록물관리 자동화가 가져오기를 중단하고
"이관신청서 구조가 변경되었습니다"라고 안내한다.

## 보호 정책

사용자 수정 자체를 막는 것이 목적이 아니다.

- 제목/유형/보존기간 등 업무값: 수정 허용
- 서식/헤더/숨김 식별자/수식: 보호
- `_handoff`: 숨김 + 시트보호

즉 "수정 금지"가 아니라 "업무값은 수정 가능, 연계구조는 보호"가 원칙이다.

## 기록물관리 프로그램의 가져오기 순서

1. schemaVersion 확인
2. transferPackageId 확인
3. rowId 무결성 확인
4. handoff current 값 읽기
5. original 값과 비교하여 수정 여부 표시
6. 삭제/수기추가/구조변경 여부 검사
7. 이상이 없거나 사용자가 확인한 후 관리대장 편입

## 핵심

결재 전 사용자의 정당한 수정은 최종 관리대장에도 반영되어야 한다.

따라서:

```text
웹 생성값
  ↓
이관신청서에서 사용자 수정
  ↓
_handoff current 값 자동동기화
  ↓
기록물관리 자동화
  ↓
표준 기록물관리대장
```

으로 연결한다.

단, 원래 웹 생성값과 원본문서 추적정보도 함께 보존하여
무엇이 수정되었는지 확인할 수 있게 한다.

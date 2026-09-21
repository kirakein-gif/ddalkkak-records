# 이관신청서 → 표준 기록물관리대장 연계 규격 v0.1

## 1. 목표

핵심 흐름: 문서등록대장 → 편철 자동화 → 이관신청서.xlsx → 기록물관리 자동화 → 표준 기록물관리대장.xlsx

이관신청서는 내부결재에 첨부되는 사람이 읽는 문서이면서, 기록물관리 자동화가 다시 해석하지 않고 정확하게 읽을 수 있는 입력파일이어야 한다.

따라서 하나의 Excel 파일 안에 두 층을 둔다.

- 이관신청서: 사람용 / 결재용
- 세부색인: 사람용 / 근거 확인용
- _handoff: 시스템용 / 숨김 시트

검토요약·검토사항은 선택 보조기능이며 핵심 연계규격에는 포함하지 않는다.

## 2. 가장 중요한 원칙

### 2.1 보이는 이관신청서 표를 기록물관리 프로그램이 다시 파싱하지 않는다

화면용 표는 병합셀, 제목행, 서명란, 비고 등 사람이 보기 좋은 형식을 자유롭게 가질 수 있다. 기록물관리 자동화는 이 표의 열 위치를 해석하지 않고 숨김 시트 _handoff만 읽는다.

### 2.2 사람이 보는 값과 시스템이 읽는 값은 같은 RecordFolder 데이터에서 동시에 생성한다

RecordFolder[]에서 결재용 이관신청서와 _handoff 시트를 함께 생성한다. 두 출력을 별도로 계산하지 않는다.

### 2.3 결재받은 이관신청서 파일 그 자체가 기록물관리 자동화의 입력파일이다

일반 사용자에게 별도 JSON을 요구하지 않는다. JSON은 개발·프로필 용도로만 사용한다.

## 3. _handoff 시트 구조

한 행 = 이관신청서의 기록물철 1권

| 필드 | 의미 | 생성단계 |
|---|---|---|
| schemaVersion | 연계규격 버전 | 시스템 |
| transferPackageId | 이관묶음 식별자 | 시스템 |
| rowId | 묶음 내부 권 식별자 | 시스템 |
| institutionName | 이관기관명 | 이관신청 |
| institutionCode | 기관코드 | 표준기관표 참조 |
| transferDepartmentName | 내부 처리부서명 | 사용자 입력 |
| transferYear | 이관연도 | 이관신청 |
| handoverUser | 인계자/작성자 | 사용자 입력 |
| recordsManager | 학교 기록물관리자 | 사용자 입력 |
| yearFrom | 생산연도 시작 | 편철 산출 |
| yearTo | 생산연도 종료 | 편철 산출 |
| title | 기록물철 제목 | 편철 산출 |
| unitTask | 표준 단위과제 | 기준표 참조 |
| retentionPeriod | 보존기간 | 기준표 참조 |
| recordType | 기록유형 | 자동추천+확인 |
| detailType | 세부유형 | 자동추천+확인 |
| mediaType | 매체유형 | 자동추천+확인 |
| volumeCount | 권수 | 편철 산출 |
| sheetCount | 총 쪽수 | 편철 산출 |
| disclosure | 공개구분 | 편철 집계 |
| restrictionNos | 비공개호수 | 편철 집계 |
| sourceDocumentNos | 원본문서번호 목록 | 추적용 |
| sourceTaskCard | 원본 과제카드명 | 추적용 |
| sourceTaskName | 원본 과제명 | 추적용 |
| sourceRowRefs | 원본 행 참조 | 추적용 |
| userAdjusted | 사용자 수정 여부 | 검증용 |
| validationState | 최종 검증상태 | 검증용 |

### 기록물관리 단계에서 아직 비어 있어야 하는 값

- managementNo
- preservationBoxName / boxNo
- archive stack / rack / row / column
- recordCondition
- dbRegistered

이 값들은 기록물관리 자동화가 생성한다.

## 4. 기록물관리 자동화의 입력 절차

1. 이관신청서.xlsx 업로드
2. _handoff 시트 탐지
3. schemaVersion 확인
4. transferPackageId 중복 확인
5. 필수필드 검증
6. 신규 이관목록 생성
7. 상자 자동 집계·배정
8. 관리번호 부여
9. 위치·상태 등 관리정보 추가
10. 표준 기록물관리대장 통합

## 5. 왜 이 방식이 이상적인가

- 결재자가 승인한 Excel과 실제 관리단계 입력자료가 동일하다.
- 화면용 이관신청서 서식이 바뀌어도 _handoff 규격만 유지하면 연계가 깨지지 않는다.
- 사용자는 결재받은 이관신청서.xlsx 하나만 전달하면 된다.
- sourceDocumentNos, transferPackageId, rowId로 최종 관리대장 행까지 역추적할 수 있다.

## 6. 이관신청서 표시 시트 권장 구조

상단: 기관명, 내부 처리부서, 작성자(인계자), 학교 기록물관리자, 이관연도, 작성일, 전체 권수

본문 목록 최소항목: 순번, 기록물철 제목, 생산연도, 단위과제, 보존기간, 기록유형/세부유형, 수량(권), 공개구분, 비공개호수, 비고

하단 또는 별도 영역: 인계자, 기록물관리자, 필요 시 확인·인수 관련 서명정보

시스템 추적값은 숨김 시트에 둔다.

## 7. 중복·재입수 방지

파일명으로 중복을 판단하지 않는다. transferPackageId를 최종 생성 시 1회 발급하고 파일 안 모든 권이 같은 ID를 공유한다. 각 권은 별도의 rowId를 가진다.

이미 반입된 transferPackageId가 다시 업로드되면 중복 편입을 막고 경고한다.

## 8. 버전관리

_handoff 메타영역에 schemaVersion, generatedAt, generatorVersion, transferPackageId, institutionName, transferYear, rowCount를 기록한다.

## 9. 사용자 업무 흐름

학교: 문서등록대장 업로드 → 자동 편철 → 필요한 부분만 수정 → 이관신청서.xlsx 생성 → 내부결재 → 결재된 이관신청서.xlsx 전달

교육지원청/기록관: 이관신청서.xlsx 업로드 → 신규기록 자동취합 → 상자 자동집계 → 관리번호 부여 → 위치/상태 보완 → 표준 기록물관리대장 통합

사용자는 _handoff 시트의 존재를 몰라도 된다.

## 10. 프로젝트 핵심

- 이관신청 자동화의 핵심 = 편철 자동화
- 기록물관리 자동화의 핵심 = 상자 자동 집계
- 두 프로그램의 접점 = 이관신청서.xlsx 내부의 구조화된 _handoff 데이터

이 구조를 기본 연계규격으로 삼는다.

## 색인 재생성을 위한 문서단위 연계정보

관리단계에서 철제목 권차가 최종 재번호되면 기록물철 표지뿐 아니라 색인도 같은 최종 철 기준으로 다시 생성해야 한다.
따라서 권 단위 `_handoff`만으로는 부족하고, 각 권에 포함된 원본문서의 색인정보도 함께 넘겨야 한다.

표시시트는 늘리지 않고 기술용 숨김시트를 하나 추가한다.

```text
기록물이관신청서.xlsx
├─ 이관신청서
├─ _handoff       # 기록물철 1행 = 1권
└─ _handoff_docs  # 원본문서 1행 = 1건
```

`_handoff_docs` 권장 필드:
- transferPackageId
- rowId (상위 기록물철 식별자)
- docSeq
- documentNo
- registrationDate
- documentTitle
- approvalType
- senderReceiver
- pageCount
- startPage
- sourceRowRef

관리프로그램은 `rowId`로 `_handoff`와 `_handoff_docs`를 연결한다.
최종 철제목 재번호 후 색인 템플릿을 생성할 때 문서단위 값을 사용한다.

기존 사용자 경험은 변하지 않는다. 두 시트는 모두 숨김 기술시트이며 결재 첨부물에서 사용자가 볼 필요가 없다.


### 구현 상태 — 이관신청서 v3

`_handoff_docs` 구조를 실제 시제품에 구현했다.

- 기록물철: 222권
- 원본문서 연계: 307건
- `transferPackageId + rowId`로 권 단위 `_handoff`와 문서 단위 `_handoff_docs` 연결
- 문서별 `docSeq`, 문서번호, 등록일자, 제목, 결재유형, 수신(발신)자, 쪽수, 권 내 시작쪽/끝쪽, 전자·비전자 구분, 원본행을 보존
- 관리단계에서 최종 철제목을 재번호해도 문서단위 색인을 다시 생성할 수 있음

실제 배포본에서는 `_handoff`와 `_handoff_docs` 모두 사용자에게 노출하지 않는 기술용 숨김시트로 취급한다.

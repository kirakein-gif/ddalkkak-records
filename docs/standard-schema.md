# 표준 데이터 스키마 — 작업 초안

## 원칙

공통 로직은 Excel의 A열/B열 같은 물리적 위치가 아니라 표준 시스템 코드에 대해 동작한다.

현재 마이그레이션 프로토타입과 표준서식에서 확인된 주요 필드 예시는 다음과 같다.

| 코드 | 의미 |
|---|---|
| sno | 순번 |
| folderId | 기록물철 ID |
| keepOrgNm | 처리/관리 부서명 |
| creatOrgNm | 생산부서명 |
| creatYyyyFrom | 생산연도(시작) |
| creatYyyyTo | 생산연도(끝) |
| mngNo | 관리번호 |
| title | 기록물명/기록물철 제목 |
| clssNm | 단위과제 |
| typeDivNm | 기록유형 |
| detailTypeNm | 세부유형 |
| mediaTypeNm | 매체유형 |
| hoCnt | 수량(권) |
| openDivNm | 공개구분 |
| openGrade | 비공개호수 |
| presvLocNm | 보존장소 |
| descInfo | 비고 |
| regUser | 등록자 |
| orgPresvLoc | 위치번호 |
| orgBoxNum | 상자번호 |
| stackNm | 서고 |
| rackNm | 서가 |
| takeYyyy | 이관연도 |
| docuConditionNm | 기록물상태 |
| rmsRegFlagNm | DB등록여부 |

## 다음 확인사항

- 학교/직속/기록관 표준서식 3종의 필드 전체 목록
- 공통 필드와 기관유형별 전용 필드 구분
- 필수/선택 여부
- 데이터 형식(문자/숫자/연도/코드)
- 허용값 및 변환 규칙
- 수식으로 계산되는 필드와 사용자 입력 필드 구분

최종 스키마 확정 전까지 이 문서는 **작업 초안**으로 취급한다.

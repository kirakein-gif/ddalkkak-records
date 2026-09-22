# 마이그레이션 프로필(JSON) — 설계 초안

## 목적

지역별로 파편화된 기존 기록물관리대장을 프로그램 코드 수정 없이 표준양식으로 변환하기 위한 규칙 파일이다.

관리자 흐름은 다음을 목표로 한다.

```text
기존 지역 대장 업로드
→ 자동 헤더/구조 분석
→ 표준필드 자동매핑
→ 관리자가 수정
→ 미리보기/검증
→ 지역 프로필 JSON 저장
→ 학교에 프로필 배포
→ 이후 자동 변환
```

## 프로필이 담아야 할 정보

단순한 '원본 헤더 → 표준필드' 관계를 넘어 다음 규칙을 담을 수 있어야 한다.

- 원본 양식 식별 정보
- 대상 표준서식 유형(학교/직속/기록관)
- 원본 헤더 → 표준 필드 매핑
- 기본값
- 값 치환(value map)
- 여러 열 결합
- 한 열 분해
- 기관명 표준화 등 변환 함수
- 무시할 열
- 검증 규칙
- 프로필 버전

## 예시

```json
{
  "profileId": "cheonan-school",
  "profileVersion": "1.0.0",
  "targetTemplate": "school",
  "columns": {
    "기록물철제목": "title",
    "관리번호": "mngNo",
    "시작연도": "creatYyyyFrom",
    "종료연도": "creatYyyyTo"
  },
  "defaults": {},
  "valueMaps": {},
  "transforms": []
}
```

이 구조는 확정본이 아니며 실제 지역별 자료를 비교하면서 확장한다.


## 헤더 서명 기반 마이그레이션 프로필

같은 지역/기관 서식은 매년 헤더 구성이 반복되므로 헤더 정규화 결과로 서명(signature)을 만들고 확정 매핑을 재사용한다.

프로필 권장 구조:
- version
- name
- signature
- targetType (school/direct/archive)
- sourceSheetHint
- headers
- mapping[{header,en}]
- defaults.keepOrg
- defaults.creatOrg
- normalization.retention
- normalization.disclosure
- normalization.type

프로필은 실제 기록물 행 데이터를 저장하지 않는다. 헤더 매핑과 기관 공통 설정만 저장한다.

# core

세 웹 앱이 공동으로 사용하는 기록물 처리 엔진.

예정 모듈:
- `schema/` — 표준 필드 정의
- `parser/` — Excel/CSV 구조 분석
- `validator/` — 데이터 검증
- `transform/` — 기관명/값/지역규칙 변환
- `exporter/` — 표준 Excel 생성

앱별 화면과 무관하게 동일한 데이터 규칙을 사용하도록 한다.

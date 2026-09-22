# Excel 출력 템플릿 내부요소 점검

점검 대상:
- templates/표지(서식).xlsx
- templates/색인목록(서식).xlsx
- templates/관리번호스티커(서식).xlsx
- templates/상자라벨(서식).xlsx

## 결과 요약

### 표지(서식).xlsx
일반 셀/서식 외에 다음 패키지 요소가 존재한다.
- xl/externalLinks/externalLink1.xml
- xl/externalLinks/_rels/externalLink1.xml.rels
- xl/printerSettings/printerSettings1.bin

즉 외부 통합문서 참조 1개와 프린터별 인쇄설정 바이너리가 포함되어 있다.

### 색인목록(서식).xlsx
일반 셀/서식 외에:
- xl/printerSettings/printerSettings1.bin

외부 통합문서 링크는 확인되지 않았다.

### 관리번호스티커(서식).xlsx
일반 셀/서식 외에:
- externalLink1
- externalLink2
- 각 externalLink 관계파일
- printerSettings1.bin

외부 통합문서 참조 2개와 프린터별 인쇄설정이 포함되어 있다.

### 상자라벨(서식).xlsx
일반 셀/서식 외에:
- externalLink1
- externalLink2
- 각 externalLink 관계파일
- printerSettings1.bin

외부 통합문서 참조 2개와 프린터별 인쇄설정이 포함되어 있다.

## 없는 것으로 확인된 요소

위 4개 .xlsx 패키지에는 다음 파일이 확인되지 않았다.
- VBA 매크로(vbaProject.bin)
- ActiveX
- customXml
- 데이터 연결(connections)
- 피벗 캐시
- 쿼리 테이블
- 도형/그림 drawing 파트
- 댓글/메모 파트
- calcChain

따라서 매크로나 액티브X가 숨어 있는 형태는 아니다.

## 원본 관리자동화의 기존 외부링크

기록물관리대장 자동화_v19(리디자인).xlsb 자체에는 외부 링크가 있으며, 관계파일에서 다음 경로가 확인되었다.

- file:///C:\엑셀매크로\나)기록물관리시스템%20및%20이관신청서자동화\금산\학교_기록물관리대장%20서식.xlsx
- 금산/학교_기록물관리대장%20서식.xlsx

따라서 관리번호스티커/상자라벨을 독립 xlsx로 떼어낼 때 기존 외부링크와 원본 통합문서 참조가 함께 남았을 가능성이 높다.

## 구현 원칙

- printerSettings1.bin은 실제 라벨/표지 출력 규격에 도움이 되는 인쇄설정이므로 우선 보존한다.
- externalLinks는 출력 템플릿에서는 불필요한 과거 참조이므로 정리 대상으로 본다.
- 최종 출력 엔진은 템플릿 전체를 ExcelJS로 재작성하기보다 XLSX 패키지를 직접 패치하여 원본 서식/프린터설정을 유지하고 외부링크만 제거하는 방향을 우선 검토한다.
- Excel의 '내용에 문제가 있습니다. 복구하시겠습니까?' 경고는 최종 배포판에서 허용하지 않는다.

## 청소 완료 상태 — 2026-09-22

GitHub 저장소의 canonical 템플릿을 직접 청소했다.

변경된 파일:
- `templates/표지(서식).xlsx`
- `templates/관리번호스티커(서식).xlsx`
- `templates/상자라벨(서식).xlsx`

`색인목록(서식).xlsx`는 외부링크가 없어서 원본을 그대로 유지했다.

최종 패키지 검사 결과 4개 파일 모두:
- `xl/externalLinks/` 없음
- `xl/printerSettings/printerSettings1.bin` 유지
- ZIP 구조 검사 통과

청소 커밋: `16ac9125b3420c4d202cd81d84443bb9fe3c5427`

따라서 이후 프로그램은 별도의 외부링크 제거 전처리 없이 GitHub `templates/`의 현행 파일을 기준 원본으로 사용할 수 있다.

# 마이그레이션 마스터 / 중앙 작업방식 저장소

## 목적

- 일반 사용자는 JSON 파일을 주고받지 않고 게시된 작업방식을 목록에서 선택한다.
- 기록물관리자는 `/migration/master/`에서 지역별 작업방식을 저장·수정·게시한다.
- 실제 기록물 대장 내용은 서버에 저장하지 않는다. D1에는 매핑·변환·검증 규칙만 저장한다.
- 이관신청서 / 기록물대장관리 / 마이그레이션의 직접 진입 경로는 그대로 유지한다.

## Cloudflare 구성

### 1. D1 생성

Cloudflare Dashboard에서 D1 데이터베이스를 하나 만들고 Pages 프로젝트 `ddalkkak-records`에 바인딩한다.

바인딩 변수명:

```
DB
```

스키마는 저장소의 다음 파일을 실행한다.

```
cloudflare/d1-schema.sql
```

### 2. 관리자 비밀번호 환경변수

Pages 프로젝트의 Variables and Secrets에 다음 두 값을 Secret으로 등록한다.

```
MASTER_PASSWORD
ADMIN_SESSION_SECRET
```

- `MASTER_PASSWORD`: 마스터 페이지 로그인 비밀번호
- `ADMIN_SESSION_SECRET`: 충분히 긴 임의 문자열. 관리자 세션 쿠키 서명에 사용한다.

관리자 세션은 HttpOnly / Secure / SameSite=Strict 쿠키로 최대 8시간 유지한다.

### 3. 주소

일반 사용자:

```
/migration/
```

마스터:

```
/migration/master/
```

일반 공개 API:

```
GET /api/migration-profiles
```

관리 API:

```
POST /api/admin/login
GET|POST /api/admin/migration-profiles
PUT|DELETE /api/admin/migration-profiles/:id
POST /api/admin/logout
```

## 숨은 관리자 진입

마이그레이션 상단 설명의 `지역별` 글자를 4초 안에 7회 누르면 `/migration/master/`로 이동한다.

이 동작은 주소를 감추기 위한 편의 기능일 뿐 보안장치가 아니다. 실제 저장·수정·삭제는 서버 비밀번호 인증을 통과해야 한다.

## 작업 흐름

1. 기록물관리자가 일반 마이그레이션 화면에서 대장을 분석하고 매핑·변환·검증 규칙을 확정한다.
2. 보정·검토 화면의 `현재 작업방식 브라우저 저장`을 누른다.
3. 마스터 페이지로 들어간다.
4. `현재 브라우저에서 만든 작업방식`에서 해당 규칙을 가져온다.
5. 이름을 `천안 학교`처럼 입력하고 지역·적용대상·버전·게시상태를 지정한다.
6. `게시중`으로 저장하면 일반 사용자 마이그레이션 화면의 `배포 작업방식` 목록에 표시된다.

JSON 가져오기는 백업·이전 호환용으로만 마스터 페이지와 사용자 화면에 보조 기능으로 남긴다.

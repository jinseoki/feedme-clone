# 02 — 복사하기 / .md 다운로드

## Outcome

결과 화면에서 사용자는 제목·저자(확인 가능한 경우) 헤더와 원문 출처, Markdown 본문을 클립보드에 복사하거나 `.md` 파일로 다운로드할 수 있다.

## Blockers

01(URL→Markdown 핵심 변환 흐름) — 내보낼 변환 결과가 있어야 한다.

## Acceptance criteria

- [x] "복사하기"를 누르면 헤더+Markdown 본문이 클립보드에 복사되고, 성공 여부를 확인할 수 있는 피드백을 본다.
- [x] ".md 다운로드"를 누르면 헤더+Markdown 본문이 담긴 `.md` 파일이 다운로드된다.

## Constraints

None.

## Verification

- 변환 결과 화면에서 "복사하기"를 실행해 클립보드 내용이 헤더+본문과 일치하는지 확인한다.
- ".md 다운로드"를 실행해 받아진 파일 내용이 헤더+본문과 일치하는지 확인한다.

## Review checkpoint

None.

## Status

completed

## Execution

- Verification: `components/feedme/converter.tsx`의 복사하기/.md 다운로드 버튼으로 구현, `lib/feedme/export-text.ts`(`buildHeader`/`buildExportBody`)를 공유. 실행 중인 앱에서 다운로드 버튼 클릭 시 생성되는 blob 내용을 직접 읽어 헤더("Web scraping\nWikipedia\n출처: ...")+Markdown 본문과 일치함을 확인, 파일명이 제목 기반(`Web-scraping.md`)으로 생성됨을 확인. 복사하기는 이 브라우저 자동화 환경의 clipboard-write 권한이 `denied`로 고정되어 있어(navigator.permissions.query 확인) 실제 클립보드 반영은 확인 불가했지만, 실패 시 한국어 피드백 토스트("클립보드 복사에 실패했어요…")가 정확히 표시됨을 확인 — 이는 "남은 위험"에서 요구한 실패 피드백 경로. 성공 경로는 일반 브라우저에서 사용자가 직접 재확인 필요(아래 남은 사항 참고). 단위 테스트로 `buildExportBody`가 프롬프트 없이 헤더+본문만 반환함을 확인.
- Blocker: —
- Revision: —

## 남은 사항

- 이 세션의 자동화 브라우저는 clipboard-write 권한이 항상 거부되어 "복사하기" 성공 경로(성공 토스트 노출)를 실제로 재현하지 못했다. 일반 브라우저에서 한 번 더 클릭해 성공 토스트를 확인하는 것을 권장.

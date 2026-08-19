# 04 — 다크모드 토글

## Outcome

사용자는 라이트/다크 모드를 수동으로 전환할 수 있고, 선택값은 다음 방문에도 유지된다.

## Blockers

None. 나머지 작업과 완전히 독립적이다.

## Acceptance criteria

- [x] 토글을 누르면 즉시 화면 전체 테마가 바뀐다.
- [x] 페이지를 새로고침해도 마지막으로 선택한 테마가 유지된다.

## Constraints

None.

## Verification

- 토글을 눌러 테마가 즉시 바뀌는지 확인한다.
- 토글 후 새로고침해 선택한 테마가 유지되는지 확인한다.

## Review checkpoint

None.

## Status

completed

## Execution

- Verification: `next-themes`(`ThemeProvider attribute="class" defaultTheme="system" enableSystem`)를 `app/layout.tsx`에 적용하고 `components/feedme/theme-toggle.tsx`로 토글 구현. 실행 중인 앱에서 토글 클릭 시 `<html>` 클래스가 즉시 `light`→`dark`로 바뀌고 `localStorage.theme`이 `dark`로 저장됨을 확인. 페이지를 새로고침한 뒤에도 `<html>` 클래스가 `dark`로 유지됨을 확인(next-themes가 페인트 전에 인라인 스크립트로 클래스를 적용해 깜빡임 없음). 확인 후 라이트로 되돌려 둠.
- Blocker: —
- Revision: —

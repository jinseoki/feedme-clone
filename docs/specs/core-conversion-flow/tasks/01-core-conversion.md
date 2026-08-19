# 01 — URL→Markdown 핵심 변환 흐름

## Outcome

사용자가 URL을 붙여넣고 변환을 실행하면, 서버가 `defuddle`로 본문을 추출해 제목·저자(확인 가능한 경우) 헤더와 렌더링된 Markdown을 보여준다. 변환 중에는 진행 상태가 보이고, 접근 실패나 추출 실패 시에는 실패 메시지와 재시도·지우기 경로가 있으며, 지우기는 입력과 결과를 모두 초기 상태로 되돌린다.

## Blockers

None.

## Acceptance criteria

- [x] 유효한 URL을 변환하면 제목(있으면)·저자(있으면) 헤더와 렌더링된 Markdown이 화면에 나타난다.
- [x] 변환이 진행되는 동안 사용자는 진행 중임을 알 수 있는 상태를 본다.
- [x] 대상 사이트 접근 실패나 본문 추출 실패 시, 실패했음을 알리는 메시지와 재시도·지우기 경로를 볼 수 있다.
- [x] 지우기 버튼을 누르면 입력값과 결과 화면이 모두 초기 상태로 돌아간다.

## Constraints

변환 라이브러리는 `defuddle`(npm 패키지)을 자체 서버(Node.js)에서 직접 실행한다 — `defuddle.md` 호스팅 서비스는 사용하지 않는다. 근거는 `docs/decisions/markdown-conversion-approach.md` 참조.

## Verification

- 정상적으로 접근 가능한 URL을 변환해 헤더(제목·저자)와 렌더링된 Markdown이 스펙대로 나오는지 확인한다.
- 접근이 차단되거나 존재하지 않는 URL을 변환해 실패 메시지와 재시도·지우기 경로가 나오는지 확인한다.
- 지우기 버튼이 입력값과 결과 화면을 모두 초기화하는지 확인한다.

## Review checkpoint

One review pass after this task. 누적 범위: 사용자가 임의로 입력한 URL을 서버가 그대로 fetch하는 지점(URL 검증, 서버의 외부 요청 처리) 전체. 구체적 위험: 내부망 주소나 자격정보가 노출되는 요청으로 흐르지 않는지, 서버가 임의 대상으로 보내는 요청이 안전하게 제한되어 있는지 확인이 필요함.

## Status

completed

## Execution

- Verification: `app/api/convert/route.ts` + `lib/feedme/convert.ts`, `lib/feedme/url-safety.ts`로 구현. 실행 중인 `next dev`에 실제 URL(`https://en.wikipedia.org/wiki/Web_scraping`)을 변환해 제목·저자·Markdown이 화면에 나타남을 확인(`POST /api/convert 200`). 로딩 상태("본문을 추출하는 중이에요…")가 요청 중 렌더링됨을 확인. 존재하지 않는 도메인으로 변환해 실패 메시지("이 주소를 찾을 수 없어요.")와 다시 시도·지우기 버튼을 확인. 지우기 버튼이 입력값·결과 화면을 초기 상태로 되돌림을 확인. 단위 테스트: `lib/feedme/export-text.test.ts`, `lib/feedme/url-safety.test.ts`, `app/page.test.tsx`(19개 통과). `bun run typecheck`/`bun run lint` 통과.
- Blocker: —
- Revision: 리뷰 체크포인트(SSRF)에 대응해 `lib/feedme/url-safety.ts`에서 스킴 검증(http/https만 허용) + DNS 조회 기반 사설/루프백/링크로컬 대역 차단을 구현하고, `lib/feedme/convert.ts`에서 리다이렉트를 수동 처리하며 각 hop마다 동일한 검증을 재적용(최대 5회)하도록 함. `curl`로 `127.0.0.1`, `169.254.169.254`, `192.168.1.1`, 잘못된 스킴, 잘못된 형식 URL에 대해 모두 차단됨을 확인.

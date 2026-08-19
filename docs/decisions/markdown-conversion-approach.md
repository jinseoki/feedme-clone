# Markdown 변환 방식 (defuddle)

## Decisions

- 웹 페이지 본문의 Markdown 변환은 npm 패키지 `defuddle`을 자체 서버(Node.js)에서 직접 실행하는 방식으로 한다. Node 환경에서는 `defuddle/node` API와 `linkedom` 또는 `jsdom` 같은 DOM 구현체를 함께 사용한다.

## Boundaries

- `defuddle.md`(같은 프로젝트가 운영하는 호스팅 변환 API, URL 앞에 접두사를 붙여 사용하는 방식)는 사용하지 않는다.
- 이 결정은 "URL → Markdown 본문 추출" 단계에만 적용된다. 다른 종류의 콘텐츠 처리(예: 향후 헤드리스 브라우저 렌더링 도입)에는 별도로 재검토한다.

## Why

사용자 요구사항이 "defuddle 라이브러리 필수"로 명시했고, 사용자가 입력하는 임의의 URL(비공개이거나 민감할 수 있음)을 제3자 호스팅 서비스로 그대로 전달하지 않기 위해 자체 서버에서 라이브러리를 직접 실행하는 방식을 확정했다.

## Reconsider when

- 자체 서버에서 대상 사이트 접근이 광범위하게 차단되어(anti-bot 등) 변환 성공률이 유의미하게 떨어지는 경우, 호스팅 서비스 경유 여부를 재검토할 수 있다.

## Still-rejected alternatives

- `defuddle.md` 호스팅 API 경유 — 사용자 URL을 제3자에게 전달하게 되어 기각; 위 "Reconsider when" 조건이 충족되면 재검토.

## Evidence worth preserving

- 공식 문서(https://defuddle.md/docs)로 확인: npm 패키지명 `defuddle`, 브라우저는 순수 DOM, Node.js는 `defuddle/node` + `linkedom`/`jsdom` 필요, `Defuddle(document, url, options)` 형태의 비동기 API, 반환 객체에 `content`, `contentMarkdown`, `title`, `author` 등 포함.
- GitHub(`kepano/defuddle`) 확인: 호스팅 서비스(`defuddle.md`)는 저장소 내 `website/src/convert.ts`(Cloudflare Worker)로 별도 구현되어 있으며, npm 라이브러리와는 별개의 배포 형태임.

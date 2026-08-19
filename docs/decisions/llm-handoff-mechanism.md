# LLM 핸드오프 방식 (ChatGPT·Claude로 열기)

## Decisions

- "ChatGPT·Claude로 열기"는 (선택된 프롬프트 + 헤더 + Markdown 본문)을 클립보드에 자동 복사한 뒤, ChatGPT/Claude의 새 대화 페이지를 새 탭으로 여는 방식으로 구현한다. 사용자는 붙여넣기(Ctrl+V)만 하면 된다.

## Boundaries

- URL 쿼리 파라미터(`?q=` 등)로 프롬프트나 본문을 프리필하는 방식은 사용하지 않는다.
- 이 결정은 ChatGPT(chatgpt.com)와 Claude(claude.ai) 두 서비스에 한정된다. 다른 LLM 서비스를 추가할 때도 같은 근거가 적용될 가능성이 높다.

## Why

두 서비스 모두 일반 대화창에 대한 `?q=` 프리필을 공식적으로 보장하지 않는다: ChatGPT는 브라우저 확장 없이는 비공식 동작이고, Claude 웹은 공식 문서 어디에도 해당 기능이 없다. 설사 동작하더라도 실질적인 URL 길이 제한이 있어 일반적인 웹 기사 분량의 Markdown 전체를 담을 수 없다. 클립보드 복사는 두 서비스 모두에서 동일하게, 길이 제한 없이 동작한다.

## Reconsider when

- ChatGPT 또는 Claude가 새 대화 프리필을 공식적으로 문서화하고 실용적인 길이 제한을 넘어서는 콘텐츠를 지원한다고 발표하는 경우.

## Still-rejected alternatives

- URL 쿼리 파라미터 프리필 — 공식 미보장 + 길이 제한으로 기각; 위 "Reconsider when" 조건이 충족되면 재검토.

## Evidence worth preserving

- ChatGPT: https://community.openai.com/t/url-query-param-to-open-chat-with-initial-message/64167 — 브라우저 확장 없이는 `?q=` 프리필이 비공식/미보장이라는 커뮤니티 확인.
- Claude: 공식 지원 문서(support.claude.com)에는 모바일 앱의 `claude://` 딥링크와 Claude Code 관련 프리필만 있고, 일반 웹 대화(`claude.ai`)에 대한 `?q=` 프리필은 문서화되어 있지 않음.

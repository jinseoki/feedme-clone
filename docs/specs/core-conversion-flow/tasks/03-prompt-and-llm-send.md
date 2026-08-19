# 03 — 프롬프트 선택 + LLM(ChatGPT/Claude)으로 보내기

## Outcome

사용자는 프리셋 프롬프트 3종(요약해줘 / 한국어로 번역해줘 / 쉽게 설명해줘) 또는 직접 입력(비저장, 1회용) 중 하나를 고르고, 대상(ChatGPT 또는 Claude)을 드롭다운으로 선택해 하나의 버튼("OOO로 보내기", 대상 이름이 즉시 반영됨)을 눌러, 선택된 프롬프트+헤더+Markdown 본문을 클립보드에 복사하고 해당 서비스의 새 대화 페이지를 새 탭으로 연다.

## Blockers

01(URL→Markdown 핵심 변환 흐름) — 내보낼 변환 결과가 있어야 한다. 02와는 서로 독립적이다.

## Acceptance criteria

- [x] 프리셋 프롬프트 중 하나를 선택하고 대상을 고른 뒤 전송 버튼을 누르면, 프롬프트+헤더+Markdown 본문이 클립보드에 복사되고 선택한 서비스의 새 대화 페이지가 새 탭에서 열린다.
- [x] "직접 입력"을 선택하면 텍스트 입력창이 나타난다. 다른 프롬프트로 바꾸거나 페이지를 새로고침하면 직접 입력한 텍스트는 남아있지 않다.
- [x] 대상 드롭다운에서 ChatGPT/Claude를 바꾸면 전송 버튼의 문구도 즉시 바뀐다.

## Constraints

프롬프트는 이 전송 동작에만 적용되며, 복사하기/`.md` 다운로드(작업 02)는 프롬프트 없이 헤더+본문만 내보낸다. URL 쿼리 파라미터로 프롬프트나 본문을 프리필하는 방식은 사용하지 않는다 — 근거는 `docs/decisions/llm-handoff-mechanism.md` 참조.

## Verification

- 프리셋 3종 각각에 대해 대상을 ChatGPT/Claude로 바꿔가며 전송을 실행해, 클립보드 내용(프롬프트+헤더+본문)과 실제로 열리는 서비스가 선택과 일치하는지 확인한다.
- 직접 입력으로 프롬프트를 넣고 전송해 클립보드 내용에 반영되는지, 이후 새로고침하면 입력값이 남아있지 않은지 확인한다.

## Review checkpoint

None.

## Status

completed

## Execution

- Verification: `components/feedme/converter.tsx`의 프롬프트 pill 그룹 + LLM 대상 Select + 전송 버튼으로 구현. 실행 중인 앱에서: (1) "ChatGPT로 보내기" 클릭 시 `window.open`이 `https://chatgpt.com/`으로 호출됨을 확인, 대상을 Claude로 바꾼 뒤 버튼 문구가 즉시 "Claude로 보내기"로 바뀌고 클릭 시 `https://claude.ai/new`가 열림을 확인. (2) "직접 입력" 선택 시 textarea가 나타나고, 입력한 텍스트("반론을 3가지 제시해줘")가 전송 시 클립보드 페이로드 맨 앞에 포함됨을 `navigator.clipboard.writeText`를 가로채 확인. (3) 다른 프리셋으로 전환하면 textarea가 사라지고, 다시 "직접 입력"으로 돌아오면 입력값이 비어 있음을 확인(새로고침 시에도 세션에 저장하지 않으므로 동일하게 비워짐). 클립보드 쓰기 자체는 02와 동일한 이유로 이 자동화 브라우저에서 성공 경로를 직접 재현하지 못했다(권한 거부 환경, 실패 피드백은 정상 동작).
- Blocker: —
- Revision: —

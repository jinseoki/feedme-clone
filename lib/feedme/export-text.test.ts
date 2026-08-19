import { expect, test } from "vitest";

import {
  buildDownloadFilename,
  buildExportBody,
  buildExportWithPrompt,
  buildHeader,
  type ConversionResult,
} from "./export-text";

const result: ConversionResult = {
  title: "모놀리스로 돌아온 이유",
  author: "박서연",
  site: "velog.io/@seoyeon-park",
  published: "2026-07-14",
  wordCount: 1842,
  markdown: "본문 내용입니다.",
  sourceUrl: "https://velog.io/@seoyeon-park/monolith-return",
};

test("헤더는 제목, 저자·사이트, 출처 URL을 포함한다", () => {
  const header = buildHeader(result);
  expect(header).toContain(result.title);
  expect(header).toContain(result.author);
  expect(header).toContain(result.site);
  expect(header).toContain(result.sourceUrl);
});

test("제목/저자가 없으면 헤더에서 해당 줄이 빠진다", () => {
  const header = buildHeader({ ...result, title: null, author: null, site: null });
  expect(header).not.toContain("undefined");
  expect(header).toContain(result.sourceUrl);
});

test("복사/다운로드용 본문은 프롬프트 없이 헤더+마크다운만 포함한다", () => {
  const body = buildExportBody(result);
  expect(body).toContain(result.title);
  expect(body).toContain(result.markdown);
  expect(body).not.toContain("요약해줘");
});

test("LLM 전송용 본문은 프롬프트가 맨 앞에 붙는다", () => {
  const withPrompt = buildExportWithPrompt(result, "요약해줘");
  expect(withPrompt.startsWith("요약해줘")).toBe(true);
  expect(withPrompt).toContain(result.markdown);
});

test("프롬프트가 없으면 헤더+본문만 반환한다(복사와 동일)", () => {
  expect(buildExportWithPrompt(result, null)).toBe(buildExportBody(result));
});

test("다운로드 파일명은 제목 기반 slug + .md", () => {
  expect(buildDownloadFilename("모놀리스로 돌아온 이유")).toBe("모놀리스로-돌아온-이유.md");
});

test("제목이 없으면 기본 파일명을 사용한다", () => {
  expect(buildDownloadFilename(null)).toBe("feedme-article.md");
});

import { JSDOM } from "jsdom";
import { Defuddle } from "defuddle/node";

import { assertHttpUrl, assertPublicHost, UnsafeUrlError } from "./url-safety";
import type { ConversionResult } from "./export-text";

export class ConversionError extends Error {}

const FETCH_TIMEOUT_MS = 15_000;
const MAX_REDIRECTS = 5;
const MAX_BODY_BYTES = 8 * 1024 * 1024; // 8MB of HTML is far more than any article needs
const USER_AGENT =
  "Mozilla/5.0 (compatible; FeedmeBot/1.0; +https://example.com/feedme)";

async function fetchHtml(startUrl: URL): Promise<{ html: string; finalUrl: URL }> {
  let currentUrl = startUrl;

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount++) {
    await assertPublicHost(currentUrl);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    let response: Response;
    try {
      response = await fetch(currentUrl, {
        redirect: "manual",
        signal: controller.signal,
        headers: { "User-Agent": USER_AGENT, Accept: "text/html,application/xhtml+xml" },
      });
    } catch {
      throw new ConversionError("페이지에 접속할 수 없어요.");
    } finally {
      clearTimeout(timeout);
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) throw new ConversionError("페이지에 접속할 수 없어요.");
      currentUrl = new URL(location, currentUrl);
      if (currentUrl.protocol !== "http:" && currentUrl.protocol !== "https:") {
        throw new ConversionError("페이지에 접속할 수 없어요.");
      }
      continue;
    }

    if (!response.ok) {
      throw new ConversionError(`페이지에 접속할 수 없어요. (HTTP ${response.status})`);
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("html")) {
      throw new ConversionError("이 페이지는 HTML 문서가 아니라 변환할 수 없어요.");
    }

    const contentLength = Number(response.headers.get("content-length") ?? "0");
    if (contentLength > MAX_BODY_BYTES) {
      throw new ConversionError("페이지 용량이 너무 커서 변환할 수 없어요.");
    }

    const html = await response.text();
    if (html.length > MAX_BODY_BYTES) {
      throw new ConversionError("페이지 용량이 너무 커서 변환할 수 없어요.");
    }

    return { html, finalUrl: currentUrl };
  }

  throw new ConversionError("페이지에 접속할 수 없어요. (리다이렉트가 너무 많음)");
}

export async function convertUrlToMarkdown(rawUrl: string): Promise<ConversionResult> {
  let requestedUrl: URL;
  try {
    requestedUrl = assertHttpUrl(rawUrl);
  } catch (error) {
    if (error instanceof UnsafeUrlError) throw new ConversionError(error.message);
    throw error;
  }

  let html: string;
  let finalUrl: URL;
  try {
    ({ html, finalUrl } = await fetchHtml(requestedUrl));
  } catch (error) {
    if (error instanceof UnsafeUrlError) throw new ConversionError(error.message);
    throw error;
  }

  const dom = new JSDOM(html, { url: finalUrl.toString() });
  const result = await Defuddle(dom.window.document, finalUrl.toString(), { markdown: true });

  if (!result.content || result.content.trim().length === 0) {
    throw new ConversionError("이 페이지에서 본문을 찾지 못했어요.");
  }

  return {
    title: result.title || null,
    author: result.author || null,
    site: result.site || null,
    published: result.published || null,
    wordCount: result.wordCount ?? null,
    markdown: result.content,
    sourceUrl: finalUrl.toString(),
  };
}

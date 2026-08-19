export type ConversionResult = {
  title: string | null;
  author: string | null;
  site: string | null;
  published: string | null;
  wordCount: number | null;
  markdown: string;
  sourceUrl: string;
};

/** Title/author/source header shown above the Markdown body and included in every export. */
export function buildHeader(result: ConversionResult): string {
  const lines: string[] = [];
  if (result.title) lines.push(result.title);
  const byline = [result.author, result.site !== result.author ? result.site : null]
    .filter(Boolean)
    .join(" · ");
  if (byline) lines.push(byline);
  lines.push(`출처: ${result.sourceUrl}`);
  return lines.join("\n");
}

/** Header + Markdown body, used by copy and .md download (no prompt). */
export function buildExportBody(result: ConversionResult): string {
  return `${buildHeader(result)}\n\n---\n\n${result.markdown}`;
}

/** Prompt (if any) + header + Markdown body, used only for the LLM handoff. */
export function buildExportWithPrompt(result: ConversionResult, prompt: string | null): string {
  const body = buildExportBody(result);
  return prompt ? `${prompt}\n\n${body}` : body;
}

const DEFAULT_FILENAME = "feedme-article";

/** Turns a title into a safe .md filename; falls back to a generic name. */
export function buildDownloadFilename(title: string | null): string {
  const slug = (title ?? "")
    .trim()
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 80)
    .replace(/^-+|-+$/g, "");
  return `${slug || DEFAULT_FILENAME}.md`;
}

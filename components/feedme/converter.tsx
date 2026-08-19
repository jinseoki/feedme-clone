"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ThemeToggle } from "@/components/feedme/theme-toggle";
import { MarkdownView } from "@/components/feedme/markdown-view";
import {
  buildDownloadFilename,
  buildExportBody,
  buildExportWithPrompt,
  type ConversionResult,
} from "@/lib/feedme/export-text";
import { cn } from "@/lib/utils";

type Status = "idle" | "loading" | "error" | "result";

type PromptKey = "summarize" | "translate" | "explain" | "custom";

const PROMPT_PRESETS: { key: PromptKey; label: string; text: string | null }[] = [
  { key: "summarize", label: "요약해줘", text: "요약해줘" },
  { key: "translate", label: "한국어로 번역해줘", text: "한국어로 번역해줘" },
  { key: "explain", label: "쉽게 설명해줘", text: "쉽게 설명해줘" },
  { key: "custom", label: "직접 입력", text: null },
];

const LLM_TARGETS = {
  chatgpt: { label: "ChatGPT", url: "https://chatgpt.com/" },
  claude: { label: "Claude", url: "https://claude.ai/new" },
} as const;

type LlmTargetKey = keyof typeof LLM_TARGETS;

export function Converter() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<ConversionResult | null>(null);

  const [selectedPrompt, setSelectedPrompt] = useState<PromptKey>("summarize");
  const [customPrompt, setCustomPrompt] = useState("");
  const [llmTarget, setLlmTarget] = useState<LlmTargetKey>("chatgpt");

  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  function showToast(message: string) {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2000);
  }

  function reset() {
    setUrl("");
    setStatus("idle");
    setErrorMessage("");
    setResult(null);
    setSelectedPrompt("summarize");
    setCustomPrompt("");
  }

  async function runConversion(targetUrl: string) {
    setStatus("loading");
    setErrorMessage("");
    try {
      const response = await fetch("/api/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
      });
      const data = await response.json();
      if (!response.ok) {
        setErrorMessage(data.error || "변환에 실패했어요.");
        setStatus("error");
        return;
      }
      setResult(data as ConversionResult);
      setSelectedPrompt("summarize");
      setCustomPrompt("");
      setStatus("result");
    } catch {
      setErrorMessage("네트워크 오류로 변환에 실패했어요.");
      setStatus("error");
    }
  }

  function selectPrompt(key: PromptKey) {
    setSelectedPrompt(key);
    if (key !== "custom") setCustomPrompt("");
  }

  function currentPromptText(): string | null {
    if (selectedPrompt === "custom") return customPrompt.trim() || null;
    return PROMPT_PRESETS.find((p) => p.key === selectedPrompt)?.text ?? null;
  }

  async function handleCopy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(buildExportBody(result));
      showToast("클립보드에 복사했어요");
    } catch {
      showToast("클립보드 복사에 실패했어요. 브라우저 권한을 확인해 주세요.");
    }
  }

  function handleDownload() {
    if (!result) return;
    const blob = new Blob([buildExportBody(result)], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = buildDownloadFilename(result.title);
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    showToast(".md 파일을 다운로드했어요");
  }

  async function handleLlmSend() {
    if (!result) return;
    const target = LLM_TARGETS[llmTarget];
    const text = buildExportWithPrompt(result, currentPromptText());
    try {
      await navigator.clipboard.writeText(text);
      showToast(`클립보드에 복사했어요 · ${target.label}를 여는 중`);
    } catch {
      showToast("클립보드 복사에 실패했어요. 브라우저 권한을 확인해 주세요.");
    }
    window.open(target.url, "_blank", "noopener");
  }

  const canConvert = url.trim().length > 0 && status !== "loading";

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between pb-6">
        <div className="flex items-center gap-2 text-[15px] font-semibold">
          <span className="flex size-6 items-center justify-center rounded-md bg-primary text-[13px] font-bold text-primary-foreground">
            F
          </span>
          Feedme
        </div>
        <ThemeToggle />
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-1.5 pl-3.5">
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && canConvert) runConversion(url.trim());
          }}
          type="text"
          placeholder="https://example.com/article"
          autoComplete="off"
          className="border-none shadow-none focus-visible:ring-0"
        />
        <Button type="button" variant="ghost" onClick={reset}>
          지우기
        </Button>
        <Button
          type="button"
          disabled={!canConvert}
          onClick={() => runConversion(url.trim())}
        >
          변환
        </Button>
      </div>

      {status === "idle" && (
        <p className="mt-3.5 px-0.5 text-sm text-muted-foreground">
          웹 페이지 URL을 붙여넣고 변환을 눌러보세요. 본문만 정리된 Markdown으로 바꿔드려요.
        </p>
      )}

      {status === "loading" && (
        <div className="mt-7 flex items-center gap-2.5 px-0.5 text-[13.5px] text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          본문을 추출하는 중이에요…
        </div>
      )}

      {status === "error" && (
        <div className="mt-5 flex flex-col items-start gap-2.5 rounded-lg border border-border bg-card p-4.5">
          <div className="flex items-center gap-2 text-[14px] font-semibold text-destructive">
            <AlertCircle className="size-4" />
            본문을 가져오지 못했어요
          </div>
          <div className="text-[13.5px] leading-relaxed text-muted-foreground">
            {errorMessage}
          </div>
          <div className="mt-1 flex gap-2">
            <Button type="button" onClick={() => runConversion(url.trim())}>
              다시 시도
            </Button>
            <Button type="button" variant="outline" onClick={reset}>
              지우기
            </Button>
          </div>
        </div>
      )}

      {status === "result" && result && (
        <div className="mt-5 flex flex-col gap-4.5">
          <div className="px-0.5">
            <div className="text-xl font-bold tracking-tight">
              {result.title || "제목 없음"}
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px] text-muted-foreground">
              {result.author && <span>{result.author}</span>}
              {result.site && result.site !== result.author && <span>{result.site}</span>}
              <a href={result.sourceUrl} target="_blank" rel="noreferrer" className="underline">
                {result.sourceUrl}
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 rounded-lg border border-border bg-card p-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-0.5 text-xs text-muted-foreground">프롬프트</span>
              {PROMPT_PRESETS.map((preset) => (
                <button
                  key={preset.key}
                  type="button"
                  aria-pressed={selectedPrompt === preset.key}
                  onClick={() => selectPrompt(preset.key)}
                  className={cn(
                    "rounded-full border px-2.75 py-1.5 text-[12.5px]",
                    selectedPrompt === preset.key
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {selectedPrompt === "custom" && (
              <div className="border-t border-dashed border-border pt-2.5">
                <Textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="원하는 프롬프트를 입력하세요 (예: 이 글의 반론을 3가지 제시해줘)"
                  className="min-h-14"
                />
                <p className="mt-1.5 text-[11.5px] text-muted-foreground">
                  이 입력은 저장되지 않아요. 새로고침하거나 다른 프롬프트를 선택하면 사라져요.
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-2 border-t border-border pt-2.5">
              <Button type="button" variant="outline" onClick={handleCopy}>
                복사하기
              </Button>
              <Button type="button" variant="outline" onClick={handleDownload}>
                .md 다운로드
              </Button>
              <div className="inline-flex">
                <Select
                  value={llmTarget}
                  onValueChange={(value) => setLlmTarget(value as LlmTargetKey)}
                >
                  <SelectTrigger className="rounded-r-none border-r-0" aria-label="보낼 LLM 선택">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(LLM_TARGETS).map(([key, target]) => (
                      <SelectItem key={key} value={key}>
                        {target.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" className="rounded-l-none" onClick={handleLlmSend}>
                  {LLM_TARGETS[llmTarget].label}로 보내기
                </Button>
              </div>
            </div>
          </div>

          <MarkdownView markdown={result.markdown} />
        </div>
      )}

      <div
        role="status"
        className={cn(
          "fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-4 py-2 text-[13px] text-background transition-opacity",
          toast ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        {toast}
      </div>
    </div>
  );
}

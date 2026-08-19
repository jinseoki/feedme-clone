import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownView({ markdown }: { markdown: string }) {
  return (
    <article
      className="rounded-lg border border-border bg-card p-5 text-[14.5px] leading-[1.75]
        [&_h1]:text-[19px] [&_h1]:font-bold [&_h1]:mb-3
        [&_h2]:text-[16.5px] [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-2
        [&_h3]:text-[15px] [&_h3]:font-bold [&_h3]:mt-5 [&_h3]:mb-2
        [&_p]:mb-3.5 [&_ul]:mb-3.5 [&_ul]:pl-5 [&_ul]:list-disc [&_ol]:mb-3.5 [&_ol]:pl-5 [&_ol]:list-decimal
        [&_li]:mb-1.5 [&_a]:underline [&_a]:underline-offset-2
        [&_code]:font-mono [&_code]:text-[13px] [&_code]:bg-muted [&_code]:rounded [&_code]:px-1
        [&_pre]:bg-muted [&_pre]:rounded-md [&_pre]:p-3.5 [&_pre]:overflow-x-auto [&_pre]:mb-3.5
        [&_pre_code]:bg-transparent [&_pre_code]:px-0
        [&_blockquote]:border-l-[3px] [&_blockquote]:border-border [&_blockquote]:pl-3.5 [&_blockquote]:text-muted-foreground [&_blockquote]:mb-3.5
        [&_img]:max-w-full [&_img]:rounded-md
        [&_table]:w-full [&_table]:mb-3.5 [&_th]:border [&_th]:border-border [&_th]:p-1.5 [&_td]:border [&_td]:border-border [&_td]:p-1.5"
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </article>
  );
}

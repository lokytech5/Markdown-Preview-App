import { marked } from "marked";
import DOMPurify from "dompurify";


marked.setOptions({ gfm: true, breaks: true });

export function renderMarkdownSafe(src: string): string {
  const raw = src ? (marked.parse(src) as string) : "";
  return DOMPurify.sanitize(raw, { USE_PROFILES: { html: true } });
}

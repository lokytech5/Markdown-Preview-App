import { marked } from "marked";
import DOMPurify from "dompurify";

// Configure once, at import time
marked.setOptions({ gfm: true, breaks: true });

/** Parse markdown and sanitize to safe HTML */
export function renderMarkdownSafe(src: string): string {
  const raw = src ? (marked.parse(src) as string) : "";
  return DOMPurify.sanitize(raw, { USE_PROFILES: { html: true } });
}

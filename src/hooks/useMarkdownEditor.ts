import { useCallback, useEffect, useRef, useState } from "react";
import { renderMarkdownSafe } from "@/utils/markdown";
import { loadFromStorage, saveToStorage } from "@/utils/storage";
import { readFileAsText, downloadText } from "@/utils/files";
import { saveMarkdownAPI, loadMarkdownAPI } from "@/utils/api";
import { createEditor, syncEditor } from "@/utils/editor";
import { mdCommands } from "@/utils/editorCommands"; // ⬅️ NEW
import type { EditorView } from "@codemirror/view";

const DEFAULT_LS_KEY = "markdown-content";

export interface UseMarkdownEditorOptions {
  initial?: string;
  storageKey?: string;
}

export interface UseMarkdownEditor {
  editorRef: (el: HTMLDivElement | null) => void;
  markdownText: string;
  html: string;
  isLoading: boolean;
  showUploadDialog: boolean;
  setShowUploadDialog: (v: boolean) => void;

  // file/api
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDownload: () => void;
  handleSaveToAPI: () => Promise<void>;
  handleLoadFromAPI: () => Promise<void>;

  // toolbar commands
  cmd: {
    bold: () => void;
    italic: () => void;
    code: () => void;
    link: () => void;
    image: () => void;
    h1: () => void;
    h2: () => void;
    quote: () => void;
    ul: () => void;
    ol: () => void;
    codeBlock: () => void;
  };
}

export function useMarkdownEditor(
  opts: UseMarkdownEditorOptions = {}
): UseMarkdownEditor {
  const { initial = "# Welcome to Markdown Preview!\n", storageKey = DEFAULT_LS_KEY } = opts;

  const [markdownText, setMarkdownText] = useState("");
  const [html, setHtml] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  const viewRef = useRef<EditorView | null>(null);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const editorRef = useCallback((el: HTMLDivElement | null) => setContainer(el), []);

  // Load initial content
  useEffect(() => {
    setMarkdownText(loadFromStorage(storageKey, initial));
  }, [storageKey, initial]);

  // Update preview
  useEffect(() => {
    setHtml(renderMarkdownSafe(markdownText));
  }, [markdownText]);

  // Persist
  useEffect(() => {
    saveToStorage(storageKey, markdownText);
  }, [storageKey, markdownText]);

  // Mount editor
  useEffect(() => {
    if (!container || viewRef.current) return;
    const view = createEditor(container, markdownText, setMarkdownText);
    viewRef.current = view;
    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [container]);

  // Sync editor when text changes from external sources
  useEffect(() => {
    const view = viewRef.current;
    if (view) syncEditor(view, markdownText);
  }, [markdownText]);

  // Handlers
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.name.endsWith(".md")) return;
    const text = await readFileAsText(file);
    setMarkdownText(text);
    setShowUploadDialog(false);
  };

  const handleDownload = () => downloadText("markdown-note.md", markdownText);

  const handleSaveToAPI = async () => {
    setIsLoading(true);
    try {
      await saveMarkdownAPI(markdownText);
      alert("Saved to API! (Demo)");
    } catch (e) {
      console.error(e);
      alert("Error saving to API");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadFromAPI = async () => {
    setIsLoading(true);
    try {
      const text = await loadMarkdownAPI();
      setMarkdownText(text);
      alert("Loaded from API!");
    } catch (e) {
      console.error(e);
      alert("Error loading from API");
    } finally {
      setIsLoading(false);
    }
  };

  /** Safely run a CodeMirror command */
  const run = (fn: (v: EditorView) => void) => {
    const v = viewRef.current;
    if (v) fn(v);
  };

  const cmd = {
    bold:      () => run(mdCommands.bold),
    italic:    () => run(mdCommands.italic),
    code:      () => run(mdCommands.code),
    link:      () => run(mdCommands.link),
    image:     () => run(mdCommands.image),
    h1:        () => run(mdCommands.h1),
    h2:        () => run(mdCommands.h2),
    quote:     () => run(mdCommands.quote),
    ul:        () => run(mdCommands.ul),
    ol:        () => run(mdCommands.ol),
    codeBlock: () => run(mdCommands.codeBlock),
  };

  return {
    editorRef,
    markdownText,
    html,
    isLoading,
    showUploadDialog,
    setShowUploadDialog,
    handleFileUpload,
    handleDownload,
    handleSaveToAPI,
    handleLoadFromAPI,
    cmd,
  };
}

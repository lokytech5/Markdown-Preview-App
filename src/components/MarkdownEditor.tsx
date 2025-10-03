// MarkdownEditor: Presentational component for the Markdown app shell.
// Renders the toolbar, mobile tabs, editor pane container, and the preview pane.
// All business logic (markdown state, sanitizing, storage, CodeMirror, API, file ops)
// lives in the useMarkdownEditor hook to keep this component SRP-compliant.
import { useState } from "react";
import { Download, Upload, Save, CloudDownload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useMarkdownEditor } from "@/hooks/useMarkdownEditor";
import {
  Bold, Italic, Link as LinkIcon, Image as ImageIcon,
  Quote, List, ListOrdered, Heading1, Heading2, Code, Braces
} from "lucide-react";

// Props: none for now, but defined for future extensibility.
interface MarkdownEditorProps {}

// Component: UI-only (layout + small view state). Logic comes from the hook.
const MarkdownEditor: React.FC<MarkdownEditorProps> = () => {
  // Hook: provides editor mounting ref, sanitized HTML, loading state,
  // dialog state, and action handlers (upload/download/API).
  const {
    editorRef,
    html,
    isLoading,
    showUploadDialog,
    setShowUploadDialog,
    handleFileUpload,
    handleDownload,
    handleSaveToAPI,
    handleLoadFromAPI,
    cmd,
  } = useMarkdownEditor({
    // Initial sample shown on first load (used if localStorage is empty).
    initial: `# Welcome to Markdown Preview!

## Features
- **Real-time** editing
- *Italic* and **bold** text
- [Links](https://reactjs.org)
- Lists:
  - Item 1
  - Item 2
- \`Inline code\`
\`\`\`js
console.log('Hello World!');
\`\`\`

![Image](https://placehold.co/150x150/png)`,
  });

  // View state: which pane is visible on mobile (tabs). Desktop shows both.
  const [pane, setPane] = useState<"editor" | "preview">("editor");

  return (
    <main className="container mx-auto p-4 max-w-7xl" role="main" aria-label="Markdown Editor">
      {/* Header / Toolbar: sticky for quick access to actions */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur flex flex-wrap gap-2 justify-between items-center mb-4 py-2">
        <h1 className="text-3xl font-bold">Markdown Preview</h1>

        <div className="flex flex-wrap gap-2">
          {/* Upload .md dialog (Radix/shadcn handles focus & a11y) */}
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" aria-label="Upload Markdown file">
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </DialogTrigger>
            <DialogContent>
              <input
                className="block w-full"
                type="file"
                accept=".md"
                onChange={handleFileUpload}
                aria-label="Choose a Markdown (.md) file"
              />
            </DialogContent>
          </Dialog>

          {/* Download current content as .md */}
          <Button onClick={handleDownload} aria-label="Download Markdown file">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>

          {/* Demo API save/load (JSONPlaceholder) */}
          <Button onClick={handleSaveToAPI} disabled={isLoading} aria-label="Save to API">
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? "Saving..." : "Save"}
          </Button>

          <Button onClick={handleLoadFromAPI} disabled={isLoading} aria-label="Load from API">
            <CloudDownload className="w-4 h-4 mr-2" />
            {isLoading ? "Loading..." : "Load"}
          </Button>
        </div>
      </header>

      {/* Mobile-only tabs: switch between editor and preview */}
      <div className="md:hidden mb-3 inline-flex gap-2" role="tablist" aria-label="Editor/Preview">
        <Button
          variant={pane === "editor" ? "default" : "outline"}
          role="tab"
          aria-selected={pane === "editor"}
          onClick={() => setPane("editor")}
        >
          Editor
        </Button>
        <Button
          variant={pane === "preview" ? "default" : "outline"}
          role="tab"
          aria-selected={pane === "preview"}
          onClick={() => setPane("preview")}
        >
          Preview
        </Button>
      </div>

      {/* Layout: stacked on mobile (tabs), side-by-side on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:h-[70vh]">
        {/* Editor pane (CodeMirror mounts into this div via ref) */}
        <section
          className={`${pane === "editor" ? "block" : "hidden"} md:block space-y-2`}
          aria-labelledby="editor-heading"
        >
          {/* SR-only: improves screen reader nav */}
          <h2 id="editor-heading" className="sr-only">
            Editor
          </h2>

          {/* ✨ Markdown toolbar (editor only) */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-lg border bg-card p-2">
            <Button size="icon" variant="ghost" title="Bold"        aria-label="Bold"        onClick={cmd.bold}><Bold className="w-4 h-4" /></Button>
            <Button size="icon" variant="ghost" title="Italic"      aria-label="Italic"      onClick={cmd.italic}><Italic className="w-4 h-4" /></Button>
            <Button size="icon" variant="ghost" title="Inline code" aria-label="Inline code" onClick={cmd.code}><Code className="w-4 h-4" /></Button>
            <span className="mx-1 text-muted-foreground">|</span>
            <Button size="icon" variant="ghost" title="Heading 1" aria-label="Heading 1" onClick={cmd.h1}><Heading1 className="w-4 h-4" /></Button>
            <Button size="icon" variant="ghost" title="Heading 2" aria-label="Heading 2" onClick={cmd.h2}><Heading2 className="w-4 h-4" /></Button>
            <span className="mx-1 text-muted-foreground">|</span>
            <Button size="icon" variant="ghost" title="Bulleted list" aria-label="Bulleted list" onClick={cmd.ul}><List className="w-4 h-4" /></Button>
            <Button size="icon" variant="ghost" title="Numbered list" aria-label="Numbered list" onClick={cmd.ol}><ListOrdered className="w-4 h-4" /></Button>
            <Button size="icon" variant="ghost" title="Quote"         aria-label="Quote"         onClick={cmd.quote}><Quote className="w-4 h-4" /></Button>
            <Button size="icon" variant="ghost" title="Code block"    aria-label="Code block"    onClick={cmd.codeBlock}><Braces className="w-4 h-4" /></Button>
            <span className="mx-1 text-muted-foreground">|</span>
            <Button size="icon" variant="ghost" title="Link"  aria-label="Insert link"  onClick={cmd.link}><LinkIcon className="w-4 h-4" /></Button>
            <Button size="icon" variant="ghost" title="Image" aria-label="Insert image" onClick={cmd.image}><ImageIcon className="w-4 h-4" /></Button>
          </div>

          <div
            ref={editorRef}
            className="h-[45vh] md:h-full border rounded-lg overflow-hidden"
          />
        </section>

        {/* Preview pane (renders sanitized HTML) */}
        <section
          className={`${pane === "preview" ? "block" : "hidden"} md:block space-y-2`}
          aria-labelledby="preview-heading"
        >
          <h2 id="preview-heading" className="text-xl font-semibold">
            Preview
          </h2>

          {/* The preview styling is encapsulated in the `.preview-card` class
              (defined in index.css via @layer components) to keep JSX clean. */}
          <article
            className="preview-card"
            dangerouslySetInnerHTML={{ __html: html }}
            aria-label="Markdown preview"
            role="article"
            
          />

          {/* Simple feedback while API calls are pending */}
          {isLoading && <div className="text-center">Loading...</div>}
        </section>
      </div>
    </main>
  );
};

export default MarkdownEditor;

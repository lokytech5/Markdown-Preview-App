import { useState } from "react";
import { Download, Upload, Save, CloudDownload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useMarkdownEditor } from "@/hooks/useMarkdownEditor";

interface MarkdownEditorProps {}

const MarkdownEditor: React.FC<MarkdownEditorProps> = () => {
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
  } = useMarkdownEditor({
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

  // UI-only state: which pane is visible on mobile
  const [pane, setPane] = useState<"editor" | "preview">("editor");

  return (
    <main className="container mx-auto p-4 max-w-7xl" role="main" aria-label="Markdown Editor">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur flex flex-wrap gap-2 justify-between items-center mb-4 py-2">
        <h1 className="text-3xl font-bold">Markdown Preview</h1>

        <div className="flex flex-wrap gap-2">
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" aria-label="Upload Markdown file">
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </DialogTrigger>
            <DialogContent>
              <input className="block w-full" type="file" accept=".md" onChange={handleFileUpload} />
            </DialogContent>
          </Dialog>

          <Button onClick={handleDownload} aria-label="Download Markdown file">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>

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

      {/* Mobile tabs */}
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

      {/* Layout: stacked on mobile, split on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:h-[70vh]">
        {/* Editor */}
        <section
          className={`${pane === "editor" ? "block" : "hidden"} md:block space-y-2`}
          aria-labelledby="editor-heading"
        >
          <h2 id="editor-heading" className="sr-only">
            Editor
          </h2>

          <div
            ref={editorRef}
            className="h-[45vh] md:h-full border rounded-lg overflow-hidden"
            role="textbox"
            aria-multiline="true"
          />
        </section>

        {/* Preview */}
        <section
          className={`${pane === "preview" ? "block" : "hidden"} md:block space-y-2`}
          aria-labelledby="preview-heading"
        >
          <h2 id="preview-heading" className="text-xl font-semibold">
            Preview
          </h2>

         <article
            className="preview-card"
            dangerouslySetInnerHTML={{ __html: html }}
            aria-label="Markdown preview"
            role="article"
            aria-live="polite"
          />
          {isLoading && <div className="text-center">Loading...</div>}
        </section>
      </div>
    </main>
  );
};

export default MarkdownEditor;

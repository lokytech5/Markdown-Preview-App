import { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { basicSetup } from 'codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';

import { Download, Upload, Save, CloudDownload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

const SAMPLE_MARKDOWN = `# Welcome to Markdown Preview!

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

![Image](https://placehold.co/150x150/png)`;

interface MarkdownEditorProps {}

const MarkdownEditor: React.FC<MarkdownEditorProps> = () => {
  const [markdownText, setMarkdownText] = useState<string>('');
  const [html, setHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showUploadDialog, setShowUploadDialog] = useState<boolean>(false);
  const [pane, setPane] = useState<'editor' | 'preview'>('editor'); // mobile tabs

  const viewRef = useRef<EditorView | null>(null);

  // Configure marked once
  marked.setOptions({
    breaks: true,
    gfm: true,
  });

  // Generate safe HTML for preview
  useEffect(() => {
    const raw = markdownText ? (marked.parse(markdownText) as string) : '';
    const safe = DOMPurify.sanitize(raw, { USE_PROFILES: { html: true } });
    setHtml(safe);
  }, [markdownText]);

  // Load initial content
  useEffect(() => {
    const saved = localStorage.getItem('markdown-content');
    setMarkdownText(saved || SAMPLE_MARKDOWN);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('markdown-content', markdownText);
  }, [markdownText]);

  // Initialize CodeMirror once
  useEffect(() => {
    if (viewRef.current) return;

    const editorDiv = document.getElementById('editor');
    if (!editorDiv) return;

    const state = EditorState.create({
      doc: markdownText,
      extensions: [
        basicSetup,
        markdown({ base: markdownLanguage }),
        oneDark,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const value = update.state.doc.toString();
            setMarkdownText(value);
          }
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: editorDiv,
    });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  // Keep editor in sync if markdownText changes from outside editor
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== markdownText) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: markdownText },
      });
    }
  }, [markdownText]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setMarkdownText(String(e.target.result));
        }
      };
      reader.readAsText(file);
    }
    setShowUploadDialog(false);
  };

  const handleDownload = (): void => {
    const blob = new Blob([markdownText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'markdown-note.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveToAPI = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        body: JSON.stringify({ title: 'Markdown Note', body: markdownText, userId: 1 }),
        headers: { 'Content-type': 'application/json; charset=UTF-8' },
      });
      alert('Saved to API! (Demo)');
    } catch (error) {
      console.error(error);
      alert('Error saving to API');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadFromAPI = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts');
      const posts: any[] = await response.json();
      if (posts.length > 0) {
        setMarkdownText(posts[0].body || '');
        alert('Loaded from API!');
      }
    } catch (error) {
      console.error(error);
      alert('Error loading from API');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container mx-auto p-4 max-w-7xl" role="main" aria-label="Markdown Editor">
      {/* Header / Toolbar */}
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
              <input type="file" accept=".md" onChange={handleFileUpload} className="block w-full" />
            </DialogContent>
          </Dialog>

          <Button onClick={handleDownload} aria-label="Download Markdown file">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>

          <Button onClick={handleSaveToAPI} disabled={isLoading} aria-label="Save to API">
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
          <Button onClick={handleLoadFromAPI} disabled={isLoading} aria-label="Load from API">
            <CloudDownload className="w-4 h-4 mr-2" />
            {isLoading ? 'Loading...' : 'Load'}
          </Button>
        </div>
      </header>

      {/* Mobile tabs */}
      <div className="md:hidden mb-3 inline-flex gap-2" role="tablist" aria-label="Editor/Preview">
        <Button
          variant={pane === 'editor' ? 'default' : 'outline'}
          role="tab"
          aria-selected={pane === 'editor'}
          onClick={() => setPane('editor')}
        >
          Editor
        </Button>
        <Button
          variant={pane === 'preview' ? 'default' : 'outline'}
          role="tab"
          aria-selected={pane === 'preview'}
          onClick={() => setPane('preview')}
        >
          Preview
        </Button>
      </div>

      {/* Layout: stacked on mobile, split on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:h-[70vh]">
        {/* Editor */}
        <section
          className={`${pane === 'editor' ? 'block' : 'hidden'} md:block space-y-2`}
          aria-labelledby="editor-heading"
        >
          <h2 id="editor-heading" className="text-xl font-semibold sr-only">
            Editor
          </h2>
          <div
            id="editor"
            className="h-[45vh] md:h-full border rounded-lg overflow-hidden"
            role="textbox"
            aria-multiline="true"
          />
        </section>

        {/* Preview */}
        <section
          className={`${pane === 'preview' ? 'block' : 'hidden'} md:block space-y-2`}
          aria-labelledby="preview-heading"
        >
          <h2 id="preview-heading" className="text-xl font-semibold">
            Preview
          </h2>
         <div
    className="
      min-h-[45vh] md:h-full overflow-auto
      rounded-2xl border shadow-sm
      bg-card text-card-foreground
      p-5 md:p-6

      /* Typography */
      prose prose-base md:prose-lg max-w-none
      prose-headings:font-semibold
      prose-h1:mt-0 prose-h1:text-3xl md:prose-h1:text-4xl
      prose-h2:mt-6 prose-h2:text-2xl md:prose-h2:text-3xl
      prose-h3:mt-4
      prose-p:my-3
      prose-ul:my-3 prose-ol:my-3
      prose-li:my-1
      prose-hr:my-6

      /* Links */
      prose-a:underline prose-a:decoration-1
      prose-a:text-blue-600 dark:prose-a:text-blue-400 hover:prose-a:opacity-90

      /* Code */
      prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
      prose-code:bg-gray-100 dark:prose-code:bg-gray-800/70
      prose-code:text-inherit
      prose-pre:bg-gray-950/90 dark:prose-pre:bg-gray-900/90
      prose-pre:text-gray-100 prose-pre:rounded-xl prose-pre:p-4

      /* Images & tables */
      prose-img:rounded-xl prose-img:mx-auto
      prose-table:rounded-lg prose-table:overflow-hidden
    "
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

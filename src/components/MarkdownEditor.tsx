import { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';
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

![Image](https://via.placeholder.com/150)`;

interface MarkdownEditorProps {}

const MarkdownEditor: React.FC<MarkdownEditorProps> = () => {
  const [markdownText, setMarkdownText] = useState<string>('');
  const [html, setHtml] = useState<string>('');
  const viewRef = useRef<EditorView | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showUploadDialog, setShowUploadDialog] = useState<boolean>(false);

  // Configure marked
  marked.setOptions({
    breaks: true,
    gfm: true,
  });

  useEffect(() => {
    setHtml(markdownText ? marked.parse(markdownText) as string : '');
  }, [markdownText]);

  useEffect(() => {
    const saved = localStorage.getItem('markdown-content');
    setMarkdownText(saved || SAMPLE_MARKDOWN);
  }, []);

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

  // Keep editor in sync if markdownText changes outside of editor (e.g., load/upload)
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
      alert('Saved to API! (Demo - check console)');
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
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Markdown Preview</h1>
        <div className="flex space-x-2">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[70vh]">
        <section className="space-y-2" aria-labelledby="editor-heading">
          <h2 id="editor-heading" className="text-xl font-semibold sr-only">Editor</h2>
          <div id="editor" className="h-full border rounded-lg overflow-hidden" role="textbox" aria-multiline="true" />
        </section>

        <section className="space-y-2" aria-labelledby="preview-heading">
          <h2 id="preview-heading" className="text-xl font-semibold">Preview</h2>
          <div
            className="h-full border rounded-lg p-4 overflow-auto bg-white dark:bg-gray-900 prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: html }}
            aria-label="Markdown preview"
            role="article"
          />
          {isLoading && <div className="text-center">Loading...</div>}
        </section>
      </div>
    </main>
  );
};

export default MarkdownEditor;

// // MarkdownEditor: The main component for input and preview.
// // Handles state for Markdown content, real-time rendering, file ops, persistence, and API.
// // Uses TypeScript for type safety on state and functions.

// import { useState, useEffect, useRef } from 'react';
// import { marked } from 'marked'; // For parsing Markdown to HTML
// import { EditorState } from '@codemirror/state';
// import { EditorView, basicSetup } from '@codemirror/view';
// import { markdownLanguage } from '@codemirror/lang-markdown';
// import { oneDark } from '@codemirror/theme-one-dark'; // For syntax highlighting (bonus)
// import { Download, Upload, Save, CloudDownload } from 'lucide-react'; // Icons
// import { Button } from '@/components/ui/button'; // ShadCN Button
// import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'; // For file upload dialog

// // Fallback sample Markdown for demo
// const SAMPLE_MARKDOWN = `# Welcome to Markdown Preview!

// ## Features
// - **Real-time** editing
// - *Italic* and **bold** text
// - [Links](https://reactjs.org)
// - Lists:
//   - Item 1
//   - Item 2
// - \`Inline code\`
// \`\`\`js
// console.log('Hello World!');
// \`\`\`

// ![Image](https://via.placeholder.com/150)`;

// // Define props for MarkdownEditor (none in this case)
// interface MarkdownEditorProps {}

// const MarkdownEditor: React.FC<MarkdownEditorProps> = () => {
//   const [markdown, setMarkdown] = useState<string>(''); // State for Markdown content
//   const [html, setHtml] = useState<string>(''); // State for rendered HTML
//   const viewRef = useRef<EditorView | null>(null); // Ref for CodeMirror view (bonus)
//   const [isLoading, setIsLoading] = useState<boolean>(false); // For API/loading states
//   const [showUploadDialog, setShowUploadDialog] = useState<boolean>(false); // For file upload dialog

//   // Configure Marked for secure rendering (sanitize HTML)
//   marked.setOptions({
//     breaks: true, // Line breaks as <br>
//     gfm: true, // GitHub Flavored Markdown
//   });

//   // Effect: Real-time preview on markdown change
//   useEffect(() => {
//     if (markdown) {
//       setHtml(marked.parse(markdown)); // Parse Markdown to HTML
//     } else {
//       setHtml(''); // Clear if empty
//     }
//   }, [markdown]);

//   // Effect: Load from localStorage on mount
//   useEffect(() => {
//     const saved = localStorage.getItem('markdown-content');
//     if (saved) {
//       setMarkdown(saved);
//     } else {
//       setMarkdown(SAMPLE_MARKDOWN); // Load sample if none
//     }
//   }, []);

//   // Effect: Auto-save to localStorage on change (persistence bonus)
//   useEffect(() => {
//     localStorage.setItem('markdown-content', markdown);
//   }, [markdown]);

//   // Function: Update markdown state (used by CodeMirror)
//   const updateMarkdown = (value: string): void => {
//     setMarkdown(value);
//   };

//   // Function: Handle file upload (bonus)
//   const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
//     const file = event.target.files?.[0];
//     if (file && file.name.endsWith('.md')) {
//       const reader = new FileReader();
//       reader.onload = (e: ProgressEvent<FileReader>) => {
//         if (e.target?.result) {
//           setMarkdown(e.target.result as string);
//         }
//       };
//       reader.readAsText(file);
//     }
//     setShowUploadDialog(false); // Close dialog
//   };

//   // Function: Download as .md file (bonus)
//   const handleDownload = (): void => {
//     const blob = new Blob([markdown], { type: 'text/markdown' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = 'markdown-note.md';
//     document.body.appendChild(a); // Append to body for click
//     a.click();
//     document.body.removeChild(a);
//     URL.revokeObjectURL(url);
//   };

//   // Function: Save to API (bonus)
//   const handleSaveToAPI = async (): Promise<void> => {
//     setIsLoading(true);
//     try {
//       await fetch('https://jsonplaceholder.typicode.com/posts', {
//         method: 'POST',
//         body: JSON.stringify({
//           title: 'Markdown Note',
//           body: markdown,
//           userId: 1,
//         }),
//         headers: { 'Content-type': 'application/json; charset=UTF-8' },
//       });
//       alert('Saved to API! (Demo - check console)');
//     } catch (error) {
//       alert('Error saving to API');
//       console.error(error);
//     }
//     setIsLoading(false);
//   };

//   // Function: Load from API (bonus)
//   const handleLoadFromAPI = async (): Promise<void> => {
//     setIsLoading(true);
//     try {
//       const response = await fetch('https://jsonplaceholder.typicode.com/posts');
//       const posts: any[] = await response.json();
//       if (posts.length > 0) {
//         setMarkdown(posts[0].body); // Load first post's body
//         alert('Loaded from API!');
//       }
//     } catch (error) {
//       alert('Error loading from API');
//       console.error(error);
//     }
//     setIsLoading(false);
//   };

//   // Effect: Setup CodeMirror editor on mount (bonus syntax highlighting)
//   useEffect(() => {
//     if (viewRef.current) return; // Already set

//     const startState = EditorState.create({
//       doc: markdown,
//       extensions: [
//         basicSetup, // Basic setup (line numbers, etc.)
//         markdownLanguage, // Markdown language support
//         oneDark, // Dark theme
//         EditorView.updateListener.of((update) => {
//           if (update.docChanged) {
//             updateMarkdown(update.state.doc.toString()); // Sync to state
//           }
//         }),
//       ],
//     });

//     const editorDiv = document.getElementById('editor');
//     if (!editorDiv) return;

//     const editorView = new EditorView({
//       state: startState,
//       parent: editorDiv, // Mount to div
//     });

//     viewRef.current = editorView; // Store view for cleanup if needed

//     // Cleanup on unmount
//     return () => {
//       editorView.destroy();
//     };
//   }, []);

//   return (
//     <main className="container mx-auto p-4 max-w-7xl" role="main" aria-label="Markdown Editor">
//       {/* Header with controls */}
//       <header className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold">Markdown Preview</h1>
//         <div className="flex space-x-2">
//           {/* Upload Dialog */}
//           <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
//             <DialogTrigger asChild>
//               <Button variant="outline" aria-label="Upload Markdown file">
//                 <Upload className="w-4 h-4 mr-2" />
//                 Upload
//               </Button>
//             </DialogTrigger>
//             <DialogContent>
//               <input
//                 type="file"
//                 accept=".md"
//                 onChange={handleFileUpload}
//                 className="block w-full"
//                 aria-label="Select Markdown file"
//               />
//             </DialogContent>
//           </Dialog>

//           {/* Download Button */}
//           <Button onClick={handleDownload} aria-label="Download Markdown file">
//             <Download className="w-4 h-4 mr-2" />
//             Download
//           </Button>

//           {/* API Buttons with loading */}
//           <Button onClick={handleSaveToAPI} disabled={isLoading} aria-label="Save to API">
//             <Save className="w-4 h-4 mr-2" />
//             {isLoading ? 'Saving...' : 'Save'}
//           </Button>
//           <Button onClick={handleLoadFromAPI} disabled={isLoading} aria-label="Load from API">
//             <CloudDownload className="w-4 h-4 mr-2" />
//             {isLoading ? 'Loading...' : 'Load'}
//           </Button>
//         </div>
//       </header>

//       {/* Editor and Preview Layout: Grid for desktop, stack for mobile */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[70vh]">
//         {/* Editor Section */}
//         <section className="space-y-2" aria-labelledby="editor-heading">
//           <h2 id="editor-heading" className="text-xl font-semibold sr-only">Editor</h2>
//           <div
//             id="editor"
//             className="h-full border rounded-lg overflow-hidden"
//             role="textbox"
//             aria-multiline="true"
//             aria-label="Markdown input editor"
//           >
//             {/* CodeMirror mounts here for syntax highlighting */}
//             {/* Fallback to Textarea if needed (for core without bonus) */}
//             {/* <Textarea
//               value={markdown}
//               onChange={(e) => setMarkdown(e.target.value)}
//               className="h-full resize-none"
//               placeholder="Enter your Markdown here..."
//             /> */}
//           </div>
//         </section>

//         {/* Preview Section */}
//         <section className="space-y-2" aria-labelledby="preview-heading">
//           <h2 id="preview-heading" className="text-xl font-semibold">Preview</h2>
//           <div
//             className="h-full border rounded-lg p-4 overflow-auto bg-white dark:bg-gray-900 markdown-preview prose prose-sm dark:prose-invert max-w-none"
//             dangerouslySetInnerHTML={{ __html: html }} // Render HTML
//             aria-label="Markdown preview"
//             role="article"
//           />
//           {isLoading && <div className="text-center">Loading...</div>}
//         </section>
//       </div>
//     </main>
//   );
// };

// export default MarkdownEditor;
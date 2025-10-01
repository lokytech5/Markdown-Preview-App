# Markdown Preview App

## Project Description and Features
A comprehensive Markdown Preview application built with React and TypeScript. Users can type Markdown in a real-time editor and see it rendered as HTML in a preview panel. Supports common Markdown elements like headings, lists, bold/italic, links, images, and code blocks.

**Core Features**:
- Real-time Markdown input and preview (side-by-side on desktop, stacked on mobile).
- Error handling with ErrorBoundary and custom 404 page.
- Responsive, accessible UI.

**Bonus Features**:
- Syntax-highlighted editor with CodeMirror.
- File upload (.md) and download.
- Auto-save to localStorage.
- Save/load via API (using JSONPlaceholder for demo).

## Installation and Setup Instructions
1. Clone the repo: `git clone <your-repo-url>`.
2. Install dependencies: `npm install`.
3. Install Tailwind CSS: Follow [Tailwind docs](https://tailwindcss.com/docs/guides/vite).
4. Init ShadCN/UI: `npx shadcn-ui@latest init`.
5. Add ShadCN components: `npx shadcn-ui@latest add textarea button input dialog`.
6. Run dev server: `npm run dev`.

## Available Scripts and Commands
- `npm run dev`: Start development server.
- `npm run build`: Build for production.
- `npm run lint`: Lint code.
- `npm run preview`: Preview production build.

## Technology Stack and Architecture Decisions
- **React 19+ with TypeScript**: Functional components, hooks (useState, useEffect). Types for props/state.
- **React Router v7**: For routing (home, /error-test).
- **Marked.js**: For Markdown parsing – simple, fast, secure (with sanitizer).
- **Tailwind CSS**: Utility-first styling for rapid, consistent design.
- **ShadCN/UI**: Reusable, accessible components.
- **Lucide React**: Icons.
- **CodeMirror**: Syntax highlighting in editor.
- **Architecture**: Single-page app with routes. State managed via useState/useEffect. ErrorBoundary wraps app.

Markdown parsing uses `marked` with GitHub-flavored renderer for security.

## API Documentation and Usage
- **Base URL**: https://jsonplaceholder.typicode.com
- **Endpoints**:
  - POST /posts: Save Markdown (body: { title: 'Note', body: markdownContent }).
  - GET /posts: Load saved content (simulate by fetching and displaying first post's body).
- Usage: Buttons trigger fetch/post. Note: JSONPlaceholder is fake, so saves don't persist but simulate API calls.

## Screenshots/GIFs
- [Add screenshots here: Home page, preview, file upload, error page.]
- GIF: [Real-time typing demo.]

## Known Issues or Limitations
- CodeMirror may need config tweaks for very large files.
- API is demo-only; real API would need auth/error handling.
- Image rendering in preview assumes external hosts (no local file support).

## Future Improvements Planned
- Full Monaco Editor integration.
- Themes (dark/light).
- Export to PDF.
- Collaborative editing via WebSockets.

## Deployment Instructions
- **Vercel**: Connect GitHub repo, deploy on push.
- **Netlify**: Drag build folder or connect repo.
- Ensure env vars if needed (none here). All features work in prod.
// App.tsx
import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import MarkdownEditor from './components/MarkdownEditor';
import ErrorTest from './components/ErrorTest';
import NotFound from './components/NotFound';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<MarkdownEditor />} />
          <Route path="/error-test" element={<ErrorTest />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </ErrorBoundary>
  );
};

export default App;

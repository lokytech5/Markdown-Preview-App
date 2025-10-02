import { useState } from 'react';

const ErrorTest: React.FC = () => {
  const [shouldError, setShouldError] = useState<boolean>(true);

  if (shouldError) {
    // This will trigger the ErrorBoundary
    throw new Error('Test error from /error-test route!');
  }

  return (
    <div>
      <h1>Error Test Page</h1>
      <p>No error here.</p>
    </div>
  );
};

export default ErrorTest;
// ErrorTest: Simple component to trigger an error for testing ErrorBoundary.
// Throws an error on render when accessed via /error-test.
// Uses TypeScript for state.

import { useState } from 'react';

const ErrorTest: React.FC = () => {
  const [shouldError, setShouldError] = useState<boolean>(true); // Force error

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
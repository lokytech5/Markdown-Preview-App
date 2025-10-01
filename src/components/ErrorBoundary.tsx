// ErrorBoundary: Class component to catch JS errors in the child tree.
// Displays fallback UI and logs error. Includes test route trigger.
// Uses TypeScript for state and props typing.

import React from 'react';
import { AlertCircle } from 'lucide-react'; // Icon for error
import { Button } from '@/components/ui/button'; // ShadCN Button

// Define props for ErrorBoundary
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

// Define state for ErrorBoundary
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null }; // State for error status
  }

  // static getDerivedStateFromError: Update state to show fallback UI
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  // componentDidCatch: Log error for debugging
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({ error }); // Store error
    console.error('Error caught by boundary:', error, errorInfo); // Log
  }

  // Function: Reset error state
  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): React.ReactNode {
    // If no error, render children normally
    if (!this.state.hasError) {
      return this.props.children;
    }

    // Fallback UI for error
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 p-8 border rounded-lg max-w-md w-full">
          <AlertCircle className="w-12 h-12 mx-auto text-destructive" aria-hidden="true" />
          <h2 className="text-2xl font-bold">Something went wrong!</h2>
          <p className="text-muted-foreground">
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <Button onClick={this.handleReset} aria-label="Try again">
            Try Again
          </Button>
        </div>
      </div>
    );
  }
}
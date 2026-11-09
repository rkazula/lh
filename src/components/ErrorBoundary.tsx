import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <div className="glass max-w-md w-full p-8 rounded-2xl text-center space-y-4 border border-destructive/30">
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto text-destructive">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">Coś poszło nie tak</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Wystąpił nieoczekiwany błąd aplikacji. Przepraszamy za niedogodności.
            </p>
            <Button onClick={this.handleReload} className="w-full rounded-xl">
              <RotateCcw className="w-4 h-4 mr-2" />
              Odśwież stronę
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

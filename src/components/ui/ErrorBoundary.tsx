/**
 * @file ErrorBoundary.tsx
 * @description Accessible React Error Boundary component capturing runtime render crashes,
 * presenting an editorial bahi-khata styled fallback and state recovery options.
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw, RefreshCw } from 'lucide-react';
import { STORAGE_KEYS } from '../../constants/config';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log securely in production diagnostics without exposing sensitive telemetry
    console.error('Tyohar AI Render Crash Caught by ErrorBoundary:', error, errorInfo);
  }

  private handleResetDraft = () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_PLAN_DRAFT);
      }
    } catch {
      // Storage unavailable
    }
    window.location.reload();
  };

  private handleReload = () => {
    window.location.reload();
  };

  public override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <main
          role="alert"
          aria-live="assertive"
          className="min-h-screen bg-[#FAF7F2] text-[#161412] flex items-center justify-center p-6 font-sans"
        >
          <div className="max-w-lg w-full bg-white border border-[#E4DEC8] rounded-xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-lg bg-[#C23B22]/10 text-[#C23B22]">
                <AlertTriangle className="w-6 h-6" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-xl font-serif font-bold text-[#161412]">
                  Celebration Engine Interrupted
                </h1>
                <p className="text-xs text-[#5C584E]">
                  A unexpected runtime error occurred while rendering the studio.
                </p>
              </div>
            </div>

            <div className="bg-[#F3EFE6] rounded-lg p-3 text-xs font-mono text-[#5C584E] mb-6 overflow-x-auto border border-[#E4DEC8]">
              {this.state.error?.message || 'An unknown render anomaly occurred.'}
            </div>

            <p className="text-sm text-[#5C584E] mb-6 leading-relaxed">
              Your underlying celebration configuration is safe. You can attempt to refresh the workspace,
              or restore fresh preset defaults if an invalid state draft was detected.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#161412] text-white text-sm font-medium hover:bg-black transition-colors"
                aria-label="Reload current studio view"
              >
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
                Reload Studio
              </button>
              <button
                type="button"
                onClick={this.handleResetDraft}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[#C23B22]/30 text-[#C23B22] text-sm font-medium hover:bg-[#C23B22]/10 transition-colors"
                aria-label="Reset draft to factory presets and reload"
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                Reset Draft to Default
              </button>
            </div>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}


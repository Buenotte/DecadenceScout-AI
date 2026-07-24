import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('DecadenceScout ErrorBoundary captured error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 select-none font-sans">
          <div className="max-w-md w-full glass-panel p-6 rounded-2xl border border-red-500/30 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto text-red-400">
              <AlertTriangle className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-slate-100">Systemfehler abgefangen</h2>
              <p className="text-xs text-slate-400">
                Ein unerwarteter Fehler ist in der Anzeige aufgetreten. Das UI wurde geschützt.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-left overflow-x-auto text-[11px] text-red-300 font-mono">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 transition text-xs cursor-pointer shadow-lg shadow-amber-500/20"
              >
                <RefreshCw className="w-4 h-4" /> Anwendung neu laden
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

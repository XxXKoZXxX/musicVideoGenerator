import React from 'react';
import { ShieldAlert, RotateCcw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Cosmic Error Boundary Caught:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleResetStorage = () => {
    try {
      localStorage.clear();
    } catch (e) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 text-center">
          <div className="glass-panel p-8 rounded-2xl max-w-lg border border-rose-500/40 bg-slate-900/90 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/40 animate-pulse">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-serif font-bold text-white mb-2">Cosmic Alignment Interrupted</h2>
            <p className="text-xs text-silver mb-4 leading-relaxed">
              A temporary calculation error occurred. Tap below to reload the studio or reset your cache to restore full functionality.
            </p>

            {this.state.error && (
              <div className="p-3 bg-black/60 rounded-xl border border-white/10 text-left text-[11px] font-mono text-rose-300 overflow-x-auto mb-4 max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <button onClick={this.handleReset} className="btn-gold text-xs py-2.5 px-5 rounded-xl flex items-center justify-center gap-1.5">
                <RotateCcw className="w-4 h-4" /> Reload Studio
              </button>
              <button onClick={this.handleResetStorage} className="btn-secondary text-xs py-2.5 px-5 rounded-xl flex items-center justify-center gap-1.5 text-slate-300">
                <Home className="w-4 h-4" /> Reset Storage Cache
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

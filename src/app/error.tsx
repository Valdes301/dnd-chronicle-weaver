'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application Error Boundary Caught:', error);
  }, [error]);

  return (
    <div id="error-boundary-container" className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div id="error-card" className="bg-white rounded-xl shadow-md border border-slate-200 p-8 max-w-md w-full text-center">
        <div id="error-icon" className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 id="error-title" className="text-2xl font-bold text-slate-900 mb-2">Qualcosa è andato storto</h2>
        <p id="error-desc" className="text-slate-600 mb-6 text-sm">
          Si è verificato un errore imprevisto durante l'esecuzione dell'applicazione.
        </p>
        <button
          id="error-reset-button"
          onClick={() => reset()}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition duration-200 shadow-sm"
        >
          Riprova a caricare la pagina
        </button>
      </div>
    </div>
  );
}

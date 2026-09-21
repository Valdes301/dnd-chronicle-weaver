'use client';

import React, { useState } from 'react';
import { ShieldAlert, Lock, ArrowLeft, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PinPromptDialog } from './pin-prompt-dialog';
import { setPlayerMode } from '@/lib/pin-storage';

interface BlockedViewShieldProps {
  viewName?: string;
  onUnlock?: () => void;
  onGoBack?: () => void;
}

export function BlockedViewShield({
  viewName = "questa sezione",
  onUnlock,
  onGoBack,
}: BlockedViewShieldProps) {
  const [isPinOpen, setIsPinOpen] = useState(false);

  const handleUnlockSuccess = () => {
    setIsPinOpen(false);
    if (onUnlock) {
      onUnlock();
    } else {
      setPlayerMode(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center max-w-lg mx-auto">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-2xl bg-amber-950/40 border border-amber-600/40 flex items-center justify-center text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.15)]">
          <Lock className="w-10 h-10" />
        </div>
        <div className="absolute -bottom-2 -right-2 bg-stone-900 rounded-full p-1 border border-amber-500/50">
          <ShieldAlert className="w-5 h-5 text-amber-500" />
        </div>
      </div>

      <h2 className="font-serif text-2xl font-bold text-amber-200 tracking-wide mb-2">
        Scheda Riservata al Dungeon Master
      </h2>

      <p className="text-sm text-stone-400 mb-6 leading-relaxed">
        La visualizzazione di <span className="font-semibold text-stone-200">&ldquo;{viewName}&rdquo;</span> è bloccata in <span className="text-emerald-400 font-medium">Modalità Giocatore</span> per proteggere spoiler, note di trama e segreti del mondo.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        <Button
          type="button"
          onClick={() => setIsPinOpen(true)}
          className="w-full sm:w-auto bg-amber-600 hover:bg-amber-500 text-stone-950 font-serif font-bold text-xs uppercase tracking-wider gap-2 min-h-[44px] shadow-lg shadow-amber-950/40"
        >
          <KeyRound className="w-4 h-4" />
          Sblocca con PIN
        </Button>

        {onGoBack && (
          <Button
            type="button"
            variant="outline"
            onClick={onGoBack}
            className="w-full sm:w-auto border-stone-700 text-stone-300 hover:bg-stone-800 text-xs gap-2 min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" />
            Torna alla Bacheca
          </Button>
        )}
      </div>

      <PinPromptDialog
        open={isPinOpen}
        onOpenChange={setIsPinOpen}
        title="Accesso Sezione Riservata"
        description={`Inserisci il PIN del Dungeon Master per sbloccare la scheda "${viewName}".`}
        onSuccess={handleUnlockSuccess}
      />
    </div>
  );
}

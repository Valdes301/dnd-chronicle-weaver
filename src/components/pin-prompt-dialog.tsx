'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Key, ShieldAlert, CheckCircle2, Delete, Shield, KeyRound } from 'lucide-react';
import { verifyPin, verifyPassword, isPinConfigured, openPinConfigDialog } from '@/lib/pin-storage';

interface PinPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  onSuccess: () => void;
}

export function PinPromptDialog({
  open,
  onOpenChange,
  title = "Area Riservata al Dungeon Master",
  description = "Inserisci il PIN di sicurezza a 4 cifre per accedere a questa sezione protetta.",
  onSuccess,
}: PinPromptDialogProps) {
  const [pin, setPin] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [usePassword, setUsePassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [hasPin, setHasPin] = useState<boolean>(false);

  useEffect(() => {
    if (open) {
      setHasPin(isPinConfigured());
      setPin('');
      setPassword('');
      setUsePassword(false);
      setError('');
      setIsSuccess(false);
    }
  }, [open]);

  const handleDigit = (digit: string) => {
    if (pin.length >= 4) return;
    const next = pin + digit;
    setPin(next);
    setError('');

    if (next.length === 4) {
      submitPin(next);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  const submitPin = (valToTest: string) => {
    if (!isPinConfigured()) {
      openPinConfigDialog();
      onOpenChange(false);
      return;
    }

    if (verifyPin(valToTest)) {
      triggerSuccess();
    } else {
      setError('PIN non valido. Riprova.');
      setPin('');
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate?.(100);
      }
    }
  };

  const submitPassword = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (verifyPassword(password)) {
      triggerSuccess();
    } else {
      setError('Password di emergenza non corretta.');
    }
  };

  const triggerSuccess = () => {
    setIsSuccess(true);
    setError('');
    setTimeout(() => {
      onOpenChange(false);
      onSuccess();
    }, 400);
  };

  const handleOpenSetup = () => {
    onOpenChange(false);
    openPinConfigDialog();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[380px] bg-stone-950 border-amber-900/60 text-stone-100 shadow-2xl">
        <DialogHeader className="text-center items-center">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-2 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <Lock className="w-6 h-6" />
          </div>
          <DialogTitle className="font-serif text-lg tracking-wide text-amber-300">
            {title}
          </DialogTitle>
          <DialogDescription className="text-stone-400 text-xs text-center">
            {hasPin ? description : "Nessun PIN Master configurato su questo dispositivo. Configura il tuo PIN per attivare la Modalità Master."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/40 border border-red-900/60 rounded-md p-2 animate-shake">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isSuccess && (
          <div className="flex items-center justify-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 rounded-md p-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Accesso Autorizzato</span>
          </div>
        )}

        {!hasPin ? (
          <div className="space-y-4 py-3 text-center">
            <div className="p-3.5 rounded-lg bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200/90 leading-relaxed">
              L&apos;applicazione si apre in <strong className="text-emerald-400">Modalità Giocatore</strong> per proteggere i tuoi contenuti. Per sbloccare la <strong className="text-amber-300">Modalità Master</strong>, imposta un PIN di sicurezza.
            </div>
            <Button
              type="button"
              onClick={handleOpenSetup}
              className="w-full bg-amber-600 hover:bg-amber-500 text-stone-950 font-serif font-bold text-xs uppercase tracking-wider gap-2 min-h-[44px] shadow-lg shadow-amber-950/40"
            >
              <KeyRound className="w-4 h-4" />
              Configura PIN e Attiva Master
            </Button>
          </div>
        ) : !usePassword ? (
          <div className="space-y-4 py-2">
            {/* Indicatori a 4 pallini */}
            <div className="flex justify-center gap-3 my-2">
              {[0, 1, 2, 3].map((idx) => {
                const isFilled = pin.length > idx;
                return (
                  <div
                    key={idx}
                    className={`w-4 h-4 rounded-full border transition-all duration-200 ${
                      isFilled
                        ? 'bg-amber-400 border-amber-300 shadow-[0_0_8px_#f59e0b]'
                        : 'border-stone-700 bg-stone-900'
                    }`}
                  />
                );
              })}
            </div>

            {/* Tastierino touch */}
            <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <Button
                  key={digit}
                  type="button"
                  variant="outline"
                  onClick={() => handleDigit(digit)}
                  className="h-12 text-lg font-serif font-bold bg-stone-900/80 border-stone-800 text-amber-200 hover:bg-amber-950/40 hover:border-amber-600/50 active:scale-95"
                >
                  {digit}
                </Button>
              ))}
              <Button
                type="button"
                variant="ghost"
                onClick={() => setUsePassword(true)}
                className="h-12 text-[10px] text-stone-400 hover:text-amber-300 p-0"
                title="Usa Password"
              >
                <Key className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDigit('0')}
                className="h-12 text-lg font-serif font-bold bg-stone-900/80 border-stone-800 text-amber-200 hover:bg-amber-950/40 hover:border-amber-600/50 active:scale-95"
              >
                0
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={handleDelete}
                className="h-12 text-stone-400 hover:text-amber-300 active:scale-95"
                aria-label="Cancella cifra"
              >
                <Delete className="w-5 h-5" />
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={submitPassword} className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-xs text-stone-400">Password di Emergenza del DM:</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Inserisci password..."
                className="bg-stone-900 border-stone-700 text-amber-100"
                autoFocus
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setUsePassword(false)}
                className="text-xs text-stone-400"
              >
                Torna al PIN
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs"
              >
                Conferma
              </Button>
            </div>
          </form>
        )}

        <DialogFooter className="sm:justify-between border-t border-stone-800/80 pt-3 mt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-stone-400 hover:text-stone-200 text-xs"
          >
            Annulla
          </Button>
          {hasPin && !usePassword && (
            <button
              type="button"
              onClick={() => setUsePassword(true)}
              className="text-[11px] text-amber-400/80 hover:text-amber-300 underline underline-offset-2"
            >
              Password di emergenza?
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

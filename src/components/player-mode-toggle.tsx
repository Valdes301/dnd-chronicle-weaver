'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Users, ShieldCheck, Lock, Crown, Shield, Swords } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  isPlayerMode,
  setPlayerMode,
  isPinConfigured,
  getBlockedViews,
} from '@/lib/pin-storage';
import { PinPromptDialog } from './pin-prompt-dialog';
import { useToast } from '@/hooks/use-toast';

interface PlayerModeToggleProps {
  className?: string;
  showBadge?: boolean;
  variant?: 'outline' | 'ghost' | 'default';
  iconOnly?: boolean;
}

export function PlayerModeToggle({ 
  className, 
  showBadge = true,
  variant = 'outline',
  iconOnly = false
}: PlayerModeToggleProps) {
  const [playerMode, setPlayerModeState] = useState<boolean>(true);
  const [isPromptOpen, setIsPromptOpen] = useState<boolean>(false);
  const [blockedCount, setBlockedCount] = useState<number>(0);
  const { toast } = useToast();

  const update = useCallback(() => {
    setPlayerModeState(isPlayerMode());
    setBlockedCount(getBlockedViews().length);
  }, []);

  useEffect(() => {
    update();

    const handlePlayerModeChange = (e: any) => {
      setPlayerModeState(Boolean(e.detail?.isPlayerMode));
    };
    const handleBlockedViewsChange = () => {
      setBlockedCount(getBlockedViews().length);
    };

    window.addEventListener('dnd-player-mode-changed', handlePlayerModeChange);
    window.addEventListener('dnd-blocked-views-changed', handleBlockedViewsChange);

    return () => {
      window.removeEventListener('dnd-player-mode-changed', handlePlayerModeChange);
      window.removeEventListener('dnd-blocked-views-changed', handleBlockedViewsChange);
    };
  }, [update]);

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (playerMode) {
      // Da Giocatore a Master: apri sempre il prompt del PIN (se configurato chiede il PIN, se non configurato invita a configurarlo)
      setIsPromptOpen(true);
    } else {
      // Da Master a Giocatore: attiva subito
      setPlayerMode(true);
      setPlayerModeState(true);
      toast({
        title: "Modalità Giocatore Attiva",
        description: `Le ${blockedCount} schede segrete sono ora protette. Puoi condividere lo schermo in sicurezza.`,
      });
    }
  };

  const exitPlayerMode = () => {
    setPlayerMode(false);
    setPlayerModeState(false);
    toast({
      title: "Modalità Dungeon Master",
      description: "Accesso completo ripristinato a tutte le schede e note private.",
    });
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant={variant === 'ghost' ? 'ghost' : 'outline'}
              size={(iconOnly || playerMode) ? 'icon' : (variant === 'ghost' ? 'icon' : 'sm')}
              onClick={handleToggleClick}
              className={
                variant === 'ghost'
                  ? `h-10 w-10 text-primary hover:bg-amber-500/10 rounded-md transition-all duration-200 active:scale-95 flex items-center justify-center ${
                      playerMode
                        ? 'text-emerald-400 hover:bg-emerald-500/15'
                        : 'text-amber-400 hover:bg-amber-500/10'
                    } ${className || ''}`
                  : `relative touch-manipulation min-h-[44px] sm:min-h-[40px] px-3 gap-2 border-stone-700 bg-stone-900/90 text-xs font-semibold transition-all duration-200 active:scale-95 ${
                      playerMode
                        ? 'border-emerald-500/60 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-950/60 shadow-[0_0_10px_rgba(16,185,129,0.15)] rounded-full w-10 h-10 p-0'
                        : 'hover:bg-stone-800 text-stone-300'
                    } ${className || ''}`
              }
              aria-label={playerMode ? "Modalità Giocatore attiva. Clicca per tornare al Master." : "Modalità DM attiva. Clicca per passare alla modalità Giocatore."}
            >
              {playerMode ? (
                <>
                  <Swords className={`${variant === 'ghost' ? 'w-6 h-6' : 'w-5 h-5'} text-emerald-400`} />
                  {showBadge && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
                  )}
                </>
              ) : (
                <>
                  <Crown className={`${variant === 'ghost' ? 'w-6 h-6' : 'w-4 h-4'} text-amber-400`} />
                  {!iconOnly && variant !== 'ghost' && <span className="font-serif hidden sm:inline">👑 Modalità DM</span>}
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-stone-900 border-stone-800 text-stone-200 text-xs max-w-[220px]">
            {playerMode ? (
              <p>Modalità Giocatore attiva. Clicca per inserire il PIN e riattivare la visuale completa del Master.</p>
            ) : (
              <p>Clicca per passare alla Modalità Giocatore (oscura {blockedCount} schede riservate prima di mostrare lo schermo).</p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Prompt PIN per sbloccare la modalità Master */}
      <PinPromptDialog
        open={isPromptOpen}
        onOpenChange={setIsPromptOpen}
        title="Ripristina Modalità Master"
        description="Inserisci il PIN del Dungeon Master per disattivare la Modalità Giocatore e sbloccare tutte le sezioni."
        onSuccess={exitPlayerMode}
      />
    </>
  );
}

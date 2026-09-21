'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Shield,
  Eye,
  EyeOff,
  Lock,
  RotateCcw,
  CheckCheck,
  XCircle,
  Users,
  Sparkles,
  BookOpen,
  Layers,
  Settings,
  AlertCircle
} from 'lucide-react';
import {
  NAV_SECTIONS,
  DEFAULT_BLOCKED_VIEWS,
  isPlayerMode,
  setPlayerMode,
  getBlockedViews,
  setBlockedViews,
  getBlockedBehavior,
  setBlockedBehavior,
  BlockedBehavior,
  isPinConfigured
} from '@/lib/pin-storage';

const CATEGORY_META = {
  master: {
    label: 'Master & Campagna',
    icon: Shield,
    color: 'text-amber-400',
    borderColor: 'border-amber-500/20',
    bgColor: 'bg-amber-500/5',
  },
  creativi: {
    label: 'Strumenti Creativi & AI',
    icon: Sparkles,
    color: 'text-purple-400',
    borderColor: 'border-purple-500/20',
    bgColor: 'bg-purple-500/5',
  },
  manuale: {
    label: 'Manuale & Regole',
    icon: BookOpen,
    color: 'text-blue-400',
    borderColor: 'border-blue-500/20',
    bgColor: 'bg-blue-500/5',
  },
  avanzate: {
    label: 'Avanzate & Carte',
    icon: Layers,
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/20',
    bgColor: 'bg-emerald-500/5',
  },
  sistema: {
    label: 'Sistema & Strumenti',
    icon: Settings,
    color: 'text-stone-400',
    borderColor: 'border-stone-500/20',
    bgColor: 'bg-stone-500/5',
  },
};

export function PlayerPermissionsMatrix() {
  const [playerMode, setPlayerModeState] = useState<boolean>(true);
  const [blockedViews, setBlockedViewsState] = useState<string[]>([]);
  const [behavior, setBehaviorState] = useState<BlockedBehavior>('hide');
  const [pinConfigured, setPinConfigured] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    setPlayerModeState(isPlayerMode());
    setBlockedViewsState(getBlockedViews());
    setBehaviorState(getBlockedBehavior());
    setPinConfigured(isPinConfigured());

    const handlePlayerModeChange = (e: any) => {
      setPlayerModeState(Boolean(e.detail?.isPlayerMode));
    };
    const handleBlockedViewsChange = (e: any) => {
      setBlockedViewsState(e.detail?.blockedViews || []);
    };
    const handleBehaviorChange = (e: any) => {
      setBehaviorState(e.detail?.behavior || 'hide');
    };
    const handlePinChange = () => {
      setPinConfigured(isPinConfigured());
    };

    window.addEventListener('dnd-player-mode-changed', handlePlayerModeChange);
    window.addEventListener('dnd-blocked-views-changed', handleBlockedViewsChange);
    window.addEventListener('dnd-blocked-behavior-changed', handleBehaviorChange);
    window.addEventListener('dnd-pin-config-changed', handlePinChange);

    return () => {
      window.removeEventListener('dnd-player-mode-changed', handlePlayerModeChange);
      window.removeEventListener('dnd-blocked-views-changed', handleBlockedViewsChange);
      window.removeEventListener('dnd-blocked-behavior-changed', handleBehaviorChange);
      window.removeEventListener('dnd-pin-config-changed', handlePinChange);
    };
  }, []);

  const handleTogglePlayerMode = (enabled: boolean) => {
    setPlayerMode(enabled);
    setPlayerModeState(enabled);
    toast({
      title: enabled ? "Modalità Giocatore Attivata" : "Modalità Dungeon Master Attivata",
      description: enabled
        ? `Le schede contrassegnate (${blockedViews.length}) sono ora protette per i giocatori.`
        : "Accesso completo ripristinato a tutte le schede e strumenti del DM.",
    });
  };

  const handleToggleSection = (id: string) => {
    const next = blockedViews.includes(id)
      ? blockedViews.filter(v => v !== id)
      : [...blockedViews, id];
    setBlockedViews(next);
    setBlockedViewsState(next);
  };

  const handleResetDefault = () => {
    setBlockedViews(DEFAULT_BLOCKED_VIEWS);
    setBlockedViewsState(DEFAULT_BLOCKED_VIEWS);
    toast({
      title: "Preset Consigliato DM Applicato",
      description: "Sono state protette le schede contenenti spoiler, trame, tesori, incontri, mostri e configurazione.",
    });
  };

  const handleSelectAll = () => {
    const allIds = NAV_SECTIONS.map(s => s.id);
    setBlockedViews(allIds);
    setBlockedViewsState(allIds);
  };

  const handleDeselectAll = () => {
    setBlockedViews([]);
    setBlockedViewsState([]);
  };

  const handleCategoryToggle = (category: keyof typeof CATEGORY_META) => {
    const categorySections = NAV_SECTIONS.filter(s => s.category === category);
    const categoryIds = categorySections.map(s => s.id);
    const allCategoryBlocked = categoryIds.every(id => blockedViews.includes(id));

    let next: string[];
    if (allCategoryBlocked) {
      next = blockedViews.filter(id => !categoryIds.includes(id));
    } else {
      next = Array.from(new Set([...blockedViews, ...categoryIds]));
    }
    setBlockedViews(next);
    setBlockedViewsState(next);
  };

  const handleBehaviorChange = (newBehavior: BlockedBehavior) => {
    setBehavior(newBehavior);
    setBehaviorState(newBehavior);
    toast({
      title: "Comportamento Aggiornato",
      description: newBehavior === 'hide'
        ? "Le schede protette spariranno completamente dal menu in Modalità Giocatore."
        : "Le schede protette mostreranno un lucchetto e richiederanno il PIN per l'apertura.",
    });
  };

  const setBehavior = (val: BlockedBehavior) => {
    setBlockedBehavior(val);
  };

  // Raggruppa le sezioni per categoria
  const sectionsByCategory = useMemo(() => {
    const grouped: Record<string, typeof NAV_SECTIONS> = {};
    Object.keys(CATEGORY_META).forEach(cat => {
      grouped[cat] = NAV_SECTIONS.filter(s => s.category === cat);
    });
    return grouped;
  }, []);

  return (
    <Card className="border-amber-500/30 bg-stone-900/60 shadow-xl overflow-hidden w-full max-w-full">
      <CardHeader className="border-b border-stone-800 bg-stone-950/50 p-3 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
              <CardTitle className="text-sm sm:text-base font-serif tracking-wide text-amber-200 uppercase leading-snug">
                Matrice Permessi per le Schede
              </CardTitle>
            </div>
            <CardDescription className="text-[11px] sm:text-xs text-stone-400 leading-relaxed">
              Scegli quali sezioni nascondere o proteggere con PIN quando mostri l&apos;app ai tuoi giocatori.
            </CardDescription>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 bg-stone-900 border border-stone-800 rounded-lg p-2 px-3 w-full sm:w-auto shrink-0">
            <div className="text-left sm:text-right">
              <div className="text-xs font-semibold text-stone-200">
                {playerMode ? "Modalità Giocatore" : "Modalità DM (Master)"}
              </div>
              <div className="text-[10px] text-stone-400">
                {playerMode ? "Restrizioni attive" : "Accesso completo"}
              </div>
            </div>
            <Switch
              checked={playerMode}
              onCheckedChange={handleTogglePlayerMode}
              className="data-[state=checked]:bg-emerald-600"
              aria-label="Attiva/Disattiva Modalità Giocatore"
            />
          </div>
        </div>

        {/* Barra di Stato e Contatore Schede */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-3 mt-1 border-t border-stone-800/80">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge
              variant="outline"
              className={`h-6 text-[10px] sm:text-[11px] px-2 gap-1.5 ${
                playerMode
                  ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300'
                  : 'border-amber-500/40 bg-amber-950/30 text-amber-300'
              }`}
            >
              {playerMode ? <Users className="w-3 h-3 shrink-0" /> : <Shield className="w-3 h-3 shrink-0" />}
              <span className="truncate">{playerMode ? "Vista Giocatori" : "Dungeon Master"}</span>
            </Badge>

            <Badge variant="secondary" className="h-6 text-[10px] sm:text-[11px] px-2 gap-1 bg-stone-800 text-stone-300">
              <Lock className="w-3 h-3 text-amber-400 shrink-0" />
              <span><strong className="text-amber-300">{blockedViews.length}</strong>/{NAV_SECTIONS.length} protette</span>
            </Badge>
          </div>

          <div className="grid grid-cols-3 sm:flex items-center gap-1 sm:gap-1.5 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetDefault}
              className="h-7 text-[10px] uppercase font-bold border-amber-500/30 text-amber-300 hover:bg-amber-950/30 gap-1 px-1.5 truncate justify-center"
            >
              <RotateCcw className="w-3 h-3 shrink-0" />
              <span className="truncate">Preset DM</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              className="h-7 text-[10px] uppercase font-bold text-stone-400 hover:text-stone-200 gap-1 px-1.5 truncate justify-center"
            >
              <CheckCheck className="w-3 h-3 shrink-0" />
              <span className="truncate">Tutte</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDeselectAll}
              className="h-7 text-[10px] uppercase font-bold text-stone-400 hover:text-stone-200 gap-1 px-1.5 truncate justify-center"
            >
              <XCircle className="w-3 h-3 shrink-0" />
              <span className="truncate">Nessuna</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3 sm:p-5 space-y-4 sm:space-y-6 pt-3 sm:pt-4">
        {/* Scelta del comportamento delle schede protette */}
        <div className="p-2.5 sm:p-3.5 rounded-lg bg-stone-950/40 border border-stone-800 space-y-2">
          <Label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            Comportamento per le Schede Protette:
          </Label>
          <RadioGroup
            value={behavior}
            onValueChange={(v) => handleBehaviorChange(v as BlockedBehavior)}
            className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3"
          >
            <div
              onClick={() => handleBehaviorChange('hide')}
              className={`flex items-start gap-2.5 p-2.5 sm:p-3 rounded-md border cursor-pointer transition-colors ${
                behavior === 'hide'
                  ? 'border-amber-500/50 bg-amber-950/20'
                  : 'border-stone-800 bg-stone-900/40 hover:bg-stone-900'
              }`}
            >
              <RadioGroupItem value="hide" id="behavior-hide" className="mt-0.5 shrink-0" />
              <div className="space-y-0.5 min-w-0">
                <Label htmlFor="behavior-hide" className="text-xs font-semibold text-stone-200 cursor-pointer flex items-center gap-1.5">
                  <EyeOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  Nascondi Completamente
                </Label>
                <p className="text-[10px] sm:text-[11px] text-stone-400 leading-tight">
                  Le schede contrassegnate non appaiono nel menu.
                </p>
              </div>
            </div>

            <div
              onClick={() => handleBehaviorChange('pin')}
              className={`flex items-start gap-2.5 p-2.5 sm:p-3 rounded-md border cursor-pointer transition-colors ${
                behavior === 'pin'
                  ? 'border-amber-500/50 bg-amber-950/20'
                  : 'border-stone-800 bg-stone-900/40 hover:bg-stone-900'
              }`}
            >
              <RadioGroupItem value="pin" id="behavior-pin" className="mt-0.5 shrink-0" />
              <div className="space-y-0.5 min-w-0">
                <Label htmlFor="behavior-pin" className="text-xs font-semibold text-stone-200 cursor-pointer flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  Mostra con Lucchetto e PIN
                </Label>
                <p className="text-[10px] sm:text-[11px] text-stone-400 leading-tight">
                  Le schede restano visibili ma richiedono il PIN.
                </p>
              </div>
            </div>
          </RadioGroup>
          {!pinConfigured && behavior === 'pin' && (
            <div className="flex items-center gap-2 text-[11px] text-amber-400/90 pt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Attenzione: Non hai ancora impostato un PIN. Configuralo sopra per proteggere le sezioni.</span>
            </div>
          )}
        </div>

        {/* Griglia delle Sezioni raggruppate per Categoria */}
        <div className="space-y-3 sm:space-y-4">
          {Object.entries(sectionsByCategory).map(([catKey, sections]) => {
            const meta = CATEGORY_META[catKey as keyof typeof CATEGORY_META];
            const Icon = meta.icon;
            const categoryIds = sections.map(s => s.id);
            const allCategoryBlocked = categoryIds.every(id => blockedViews.includes(id));

            return (
              <div key={catKey} className={`rounded-lg border ${meta.borderColor} ${meta.bgColor} p-2.5 sm:p-3.5 space-y-2.5`}>
                <div className="flex items-center justify-between gap-1.5 border-b border-stone-800/60 pb-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${meta.color} shrink-0`} />
                    <span className="font-serif text-[11px] sm:text-xs uppercase tracking-wider font-bold text-stone-200 truncate">
                      {meta.label}
                    </span>
                    <span className="text-[10px] text-stone-400 shrink-0">
                      ({sections.filter(s => blockedViews.includes(s.id)).length}/{sections.length})
                    </span>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCategoryToggle(catKey as keyof typeof CATEGORY_META)}
                    className="h-6 text-[9px] sm:text-[10px] px-1.5 uppercase tracking-wider text-stone-400 hover:text-stone-200 shrink-0"
                  >
                    {allCategoryBlocked ? "Permetti" : "Oscura"}
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {sections.map((sec) => {
                    const isBlocked = blockedViews.includes(sec.id);
                    return (
                      <div
                        key={sec.id}
                        onClick={() => handleToggleSection(sec.id)}
                        className={`flex items-start gap-2 p-2 sm:p-2.5 rounded-md border cursor-pointer transition-all min-w-0 ${
                          isBlocked
                            ? 'bg-amber-950/20 border-amber-600/40 shadow-sm'
                            : 'bg-stone-900/40 border-stone-800/80 hover:bg-stone-900 hover:border-stone-700'
                        }`}
                      >
                        <Checkbox
                          id={`perm-${sec.id}`}
                          checked={isBlocked}
                          onCheckedChange={() => handleToggleSection(sec.id)}
                          className="mt-0.5 shrink-0 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-500"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1.5">
                            <Label
                              htmlFor={`perm-${sec.id}`}
                              className="text-xs font-semibold text-stone-200 cursor-pointer truncate"
                            >
                              {sec.label}
                            </Label>
                            {isBlocked ? (
                              <Badge variant="outline" className="h-4 text-[9px] px-1 border-amber-500/40 text-amber-400 gap-0.5 shrink-0">
                                <Lock className="w-2.5 h-2.5" /> Oscurata
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="h-4 text-[9px] px-1 text-stone-500 border-stone-800 gap-0.5 shrink-0">
                                <Eye className="w-2.5 h-2.5" /> Visibile
                              </Badge>
                            )}
                          </div>
                          <p className="text-[10px] sm:text-[11px] text-stone-400 line-clamp-2 mt-0.5 leading-snug">
                            {sec.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

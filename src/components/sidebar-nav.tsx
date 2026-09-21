'use client';

import { useState, useEffect, memo } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  ScrollText,
  BrainCircuit,
  Shield,
  Sparkles,
  Skull,
  Wand,
  Map,
  LayoutGrid,
  Palette,
  Hammer,
  Beer,
  Library,
  Settings,
  MapPin,
  UserCircle,
  Sword,
  Mail,
  Store,
  Users,
  BookMarked,
  Lock,
  Compass,
  Trophy,
} from 'lucide-react';
import { Icons } from './icons';
import { cn } from "@/lib/utils";
import { useToast } from '@/hooks/use-toast';
import {
  isPinConfigured,
  isPlayerMode,
  setPlayerMode,
  getBlockedViews,
  getBlockedBehavior,
  BlockedBehavior,
} from '@/lib/pin-storage';
import { PinPromptDialog } from './pin-prompt-dialog';

type SidebarNavProps = {
  activeView: string;
  onViewChange: (view: string | null) => void;
  onNewCampaign?: () => void;
  onBackup?: () => void;
  onOpenPinConfig?: () => void;
};

const navItems = [
  { id: 'bacheca', label: 'Bacheca del Gruppo', icon: Shield },
  { id: 'storia', label: 'Storia & Cronache', icon: ScrollText },
  { id: 'quest-creator', label: 'Crea Nuova Quest', icon: Compass },
  { id: 'party-xp', label: 'Assegna PX Party (5e)', icon: Trophy },
  { id: 'lore', label: 'Lore & Ambientazione', icon: BookMarked },
  { id: 'personaggi', label: 'Personaggi Giocanti', icon: Users },
  { id: 'riepilogo-png', label: 'Anagrafe dei PNG', icon: UserCircle },
];

const creativeItems = [
  { id: 'architetto', label: 'Architetto di Mondi', icon: MapPin },
  { id: 'combattimenti', label: 'Arena del Destino', icon: Sword },
  { id: 'botteghe', label: 'Botteghe ed Empori', icon: Store },
  { id: 'anagrafe', label: 'Emporio dei Volti (PNG)', icon: UserCircle },
  { id: 'tesori', label: 'Generatore di Tesori', icon: Sparkles },
  { id: 'mappe', label: 'Mappe', icon: Map },
  { id: 'lettere', label: 'Ordini e Lettere', icon: Mail },
  { id: 'taverna', label: 'Taverna', icon: Beer },
].sort((a, b) => a.label.localeCompare(b.label));

const handbookItems = [
    { id: 'manuale-importa', label: 'Importazione Intelligente', icon: Library },
    { id: 'abilità', label: 'Abilità', icon: BrainCircuit },
    { id: 'equipaggiamento', label: 'Equipaggiamento', icon: Shield },
    { id: 'oggetti', label: 'Oggetti', icon: Sparkles },
    { id: 'bestiario', label: 'Bestiario', icon: Skull },
    { id: 'magie', label: 'Incantesimi', icon: Wand },
];

const supportItems = [
  { id: 'layout-sperimentale', label: 'Genera Carte Complete', icon: LayoutGrid },
  { id: 'crea-carte', label: 'Crea Carte (Multiplo)', icon: Hammer },
  { id: 'personalizza', label: 'Personalizza Sfondo', icon: Palette },
];

export const SidebarNav = memo(function SidebarNav({ activeView, onViewChange, onNewCampaign, onBackup, onOpenPinConfig }: SidebarNavProps) {
  const { isMobile, setOpenMobile, toggleSidebar } = useSidebar();
  const [isClient, setIsClient] = useState(false);
  const [hasPin, setHasPin] = useState<boolean>(false);
  const [playerMode, setPlayerModeState] = useState<boolean>(true);
  const [blockedViews, setBlockedViewsState] = useState<string[]>([]);
  const [blockedBehavior, setBlockedBehaviorState] = useState<BlockedBehavior>('hide');
  const [promptView, setPromptView] = useState<string | null>(null);
  const [isExitPlayerPromptOpen, setIsExitPlayerPromptOpen] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    setHasPin(isPinConfigured());
    setPlayerModeState(isPlayerMode());
    setBlockedViewsState(getBlockedViews());
    setBlockedBehaviorState(getBlockedBehavior());

    const handlePlayerModeChange = (e: any) => {
      setPlayerModeState(Boolean(e.detail?.isPlayerMode));
    };
    const handleBlockedViewsChange = (e: any) => {
      setBlockedViewsState(e.detail?.blockedViews || []);
    };
    const handleBehaviorChange = (e: any) => {
      setBlockedBehaviorState(e.detail?.behavior || 'hide');
    };
    const handlePinChange = () => {
      setHasPin(isPinConfigured());
    };

    window.addEventListener('dnd-player-mode-changed', handlePlayerModeChange);
    window.addEventListener('dnd-blocked-views-changed', handleBlockedViewsChange);
    window.addEventListener('dnd-blocked-behavior-changed', handleBehaviorChange);
    window.addEventListener('dnd-pin-changed', handlePinChange);

    return () => {
      window.removeEventListener('dnd-player-mode-changed', handlePlayerModeChange);
      window.removeEventListener('dnd-blocked-views-changed', handleBlockedViewsChange);
      window.removeEventListener('dnd-blocked-behavior-changed', handleBehaviorChange);
      window.removeEventListener('dnd-pin-changed', handlePinChange);
    };
  }, []);

  const handleViewChange = (view: string) => {
    if (view === 'bacheca') {
        onViewChange(null);
    } else {
        onViewChange(view);
    }
    
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleTogglePlayerMode = () => {
    if (playerMode) {
      setIsExitPlayerPromptOpen(true);
    } else {
      setPlayerMode(true);
      setPlayerModeState(true);
      toast({ title: "Modalità Giocatore Attiva", description: "Le schede protette sono state oscurate." });
    }
  };

  const renderMenuItem = (item: { id: string; label: string; icon: any }) => {
    const isBlocked = playerMode && blockedViews.includes(item.id);
    if (isBlocked && blockedBehavior === 'hide') {
      return null;
    }

    const handleClick = () => {
      if (isBlocked) {
        setPromptView(item.id);
      } else {
        handleViewChange(item.id);
      }
    };

    return (
      <SidebarMenuItem key={item.id}>
        <SidebarMenuButton
          onClick={handleClick}
          isActive={activeView === item.id}
          tooltip={isBlocked ? `${item.label} (🔒 Riservato al DM)` : item.label}
          className={cn(
            "transition-colors",
            isBlocked && "opacity-60 text-muted-foreground hover:opacity-100 hover:text-amber-300"
          )}
        >
          {isBlocked ? (
            <Lock className="size-4 shrink-0 text-amber-500" />
          ) : (
            <item.icon className="size-4 shrink-0" />
          )}
          <span className="truncate flex-1">{item.label}</span>
          {isBlocked && (
            <span className="text-[9px] uppercase font-mono px-1 py-0.2 rounded bg-amber-950/80 text-amber-400 border border-amber-600/40">
              🔒 DM
            </span>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  // Filtra la visibilità dei gruppi se tutti gli elementi sono nascosti
  const isItemVisible = (id: string) => {
    const isBlocked = playerMode && blockedViews.includes(id);
    return !(isBlocked && blockedBehavior === 'hide');
  };
  const hasVisibleNavItems = navItems.some(i => isItemVisible(i.id));
  const hasVisibleCreativeItems = creativeItems.some(i => isItemVisible(i.id));
  const hasVisibleHandbookItems = handbookItems.some(i => isItemVisible(i.id));
  const hasVisibleSupportItems = supportItems.some(i => isItemVisible(i.id));
  
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton 
                    onClick={() => toggleSidebar()}
                    tooltip="Contrai/Espandi Navigazione"
                >
                    <Icons.logo className="size-4 shrink-0" />
                    <span className="truncate font-headline font-bold text-lg">Tessitore</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
            {/* Tasto Modalità Giocatore rapido nella barra */}
            <SidebarMenuItem>
                <SidebarMenuButton
                    onClick={handleTogglePlayerMode}
                    tooltip={playerMode ? "Vista Giocatore Attiva (Clicca per sbloccare DM)" : "Passa a Modalità Giocatore"}
                    className={cn(
                      "text-xs font-serif transition-colors",
                      playerMode 
                        ? "bg-emerald-950/40 text-emerald-300 hover:bg-emerald-950/60 border border-emerald-600/40" 
                        : "hover:bg-stone-800 text-stone-300"
                    )}
                >
                    {playerMode ? <Users className="size-4 text-emerald-400 shrink-0" /> : <Shield className="size-4 text-amber-400 shrink-0" />}
                    <span className="truncate flex-1 font-semibold">{playerMode ? "Vista Giocatori" : "Modalità DM"}</span>
                    {playerMode && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />}
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {hasVisibleNavItems && (
          <SidebarGroup>
              <SidebarGroupLabel>Master</SidebarGroupLabel>
              <SidebarMenu>
                {navItems.map(renderMenuItem)}
              </SidebarMenu>
          </SidebarGroup>
        )}

        {hasVisibleCreativeItems && (
          <SidebarGroup>
              <SidebarGroupLabel>Strumenti Creativi</SidebarGroupLabel>
              <SidebarMenu>
                {creativeItems.map(renderMenuItem)}
              </SidebarMenu>
          </SidebarGroup>
        )}
        
        {hasVisibleHandbookItems && (
          <SidebarGroup>
              <SidebarGroupLabel>Manuale</SidebarGroupLabel>
              <SidebarMenu>
                {handbookItems.map(renderMenuItem)}
              </SidebarMenu>
          </SidebarGroup>
        )}

        {hasVisibleSupportItems && (
          <SidebarGroup>
              <SidebarGroupLabel>Avanzate</SidebarGroupLabel>
              <SidebarMenu>
                {supportItems.map(renderMenuItem)}
              </SidebarMenu>
          </SidebarGroup>
        )}

        <SidebarGroup>
            <SidebarGroupLabel>Sistema</SidebarGroupLabel>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton 
                        onClick={() => {
                          if (isPinConfigured() || (playerMode && (blockedViews.includes('sistema') || blockedViews.includes('impostazioni')))) {
                            setPromptView('sistema');
                          } else {
                            handleViewChange('sistema');
                          }
                        }}
                        isActive={activeView === 'sistema'} 
                        tooltip={isClient && hasPin ? "Sistema (🔒 Protetto da PIN)" : "Pannello Sistema"}
                        className="hover:text-amber-300 font-medium"
                    >
                      <Settings className="w-4 h-4 text-amber-400" />
                      <span>Sistema</span>
                      {isClient && hasPin && <Lock className="w-3.5 h-3.5 text-amber-500 ml-auto" />}
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />

      {/* Dialog per apertura scheda protetta da PIN */}
      {promptView && (
        <PinPromptDialog
          open={Boolean(promptView)}
          onOpenChange={(open) => !open && setPromptView(null)}
          title="Sezione Protetta dal Dungeon Master"
          description={`Inserisci il PIN per accedere alla scheda "${promptView === 'sistema' ? 'Sistema' : promptView}".`}
          onSuccess={() => {
            const target = promptView;
            setPromptView(null);
            handleViewChange(target);
          }}
        />
      )}

      {/* Dialog per sblocco Modalità Master */}
      <PinPromptDialog
        open={isExitPlayerPromptOpen}
        onOpenChange={setIsExitPlayerPromptOpen}
        title="Torna alla Modalità Dungeon Master"
        description="Inserisci il PIN del DM per disattivare la visuale giocatori."
        onSuccess={() => {
          setIsExitPlayerPromptOpen(false);
          setPlayerMode(false);
          setPlayerModeState(false);
          toast({ title: "Modalità DM Ripristinata", description: "Accesso completo sbloccato." });
        }}
      />
    </Sidebar>
  );
});

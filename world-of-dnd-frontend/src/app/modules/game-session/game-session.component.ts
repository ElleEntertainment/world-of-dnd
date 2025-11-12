/* --- AGGIUNTA SOLO LA LOGICA PER LE SKILL, SENZA TOCCARE ALTRO --- */
import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BagItem } from './bag/bag-modal.component';
import { Talent } from './talents/talents-modal.component';
import { GameSessionStorageService, LocalGameSessionData } from './game-session-storage.service';
import { GameSessionSharedService } from './game-session-shared.service';
import { SkillRow } from './skills/skills-modal.component';
import { Spell } from './spells/spells-modal.component';

interface PlayerInfo {
  name: string;
  character: string;
  alive: boolean;
}

@Component({
  selector: 'app-game-session',
  templateUrl: './game-session.component.html',
  styleUrls: ['./game-session.component.scss']
})
export class GameSessionComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  campaignId: string | null = null;
  backgroundUrl = '/img/bg/volcano_bg.jpg';

  showBag = false;
  showCoins = false;
  showSessionInfo = false;
  showSpells = false;
  showTalents = false;
  showCharacter = false;
  showCharTooltip = false;
  showEberronMap = false;
  showSkills = false;
  bagItems: BagItem[] = [
    { name: 'Pozione di cura', quantity: 3 },
    { name: 'Torcia', quantity: 2 }
  ];
  gold = 15;
  silver = 23;
  copper = 87;

  hpCurrent = 80;
  hpMax = 100;
  editingHpCurrent = false;
  editingHpMax = false;

  dndVersion = '3.5'; // di default

  // Mock dati sessione
  sessionPlayers: PlayerInfo[] = [
    { name: 'Luca', character: 'Tharion', alive: true },
    { name: 'Giulia', character: 'Morgana', alive: false },
    { name: 'Marco', character: 'Borin', alive: true }
  ];
  sessionMaster = 'Alessandro';
  sessionStartDate = '2024-10-01';

  // Dati caricati dal backend
  allSpells: Spell[] = [];
  allTalents: Talent[] = [];
  isLoading = false;
  loadError: string | null = null;

  spellBar: (Spell | null)[] = Array(10).fill(null);

  hoveredSpell: Spell | null = null;

  // Character modal state
  characterSheet: any = {};

  // Skills modal state
  skillsList: SkillRow[] = [];

  constructor(
    private route: ActivatedRoute,
    private storage: GameSessionStorageService,
    private sharedService: GameSessionSharedService
  ) {}

  ngOnInit() {
    this.campaignId = this.route.snapshot.paramMap.get('id');
    this.loadLocalData();
    this.loadGameData();
    
    // Subscribe to loading and error states
    this.sharedService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.isLoading = loading);
    
    this.sharedService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => this.loadError = error);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Carica skills, spells e talents dal backend
  loadGameData() {
    // Carica skills
    this.sharedService.loadSkillsFromServer()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (skills) => {
          if (this.skillsList.length === 0) {
            this.skillsList = skills;
          }
        },
        error: (err) => console.error('Errore caricamento skills:', err)
      });

    // Carica spells
    this.sharedService.loadSpellsFromServer()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (spells) => this.allSpells = spells,
        error: (err) => console.error('Errore caricamento spells:', err)
      });

    // Carica talents
    this.sharedService.loadTalentsFromServer()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (talents) => this.allTalents = talents,
        error: (err) => console.error('Errore caricamento talents:', err)
      });
  }

  // --- LocalStorage logic ---

  saveLocalData() {
    if (!this.campaignId) return;
    const data: LocalGameSessionData = {
      character: this.characterSheet,
      spellBar: this.spellBar,
      bagItems: this.bagItems,
      gold: this.gold,
      silver: this.silver,
      copper: this.copper,
      skillsList: this.skillsList
    };
    try {
      this.storage.save(this.campaignId, data);
    } catch (e) {
      console.error('Errore salvataggio localStorage:', e);
    }
  }

  loadLocalData() {
    if (!this.campaignId) return;
    try {
      const data = this.storage.load(this.campaignId);
      if (data) {
        if (data.character) this.characterSheet = data.character;
        if (data.spellBar) this.spellBar = data.spellBar;
        if (data.bagItems) this.bagItems = data.bagItems;
        if (typeof data.gold === 'number') this.gold = data.gold;
        if (typeof data.silver === 'number') this.silver = data.silver;
        if (typeof data.copper === 'number') this.copper = data.copper;
        if (Array.isArray(data.skillsList)) this.skillsList = data.skillsList;
      } else {
        // Nessun dato locale: lascia i valori di default
        // (non fare nulla)
      }
    } catch (e) {
      console.error('Errore caricamento localStorage:', e);
    }
  }

  clearLocalData() {
    if (!this.campaignId) return;
    try {
      this.storage.remove(this.campaignId);
    } catch (e) {
      console.error('Errore rimozione localStorage:', e);
    }
  }

  hasLocalData(): boolean {
    if (!this.campaignId) return false;
    try {
      return this.storage.hasLocal(this.campaignId);
    } catch (e) {
      console.error('Errore verifica localStorage:', e);
      return false;
    }
  }

  // Call this after every relevant change
  persistAll() {
    if (!this.campaignId) return;
    
    const data: LocalGameSessionData = {
      character: this.characterSheet,
      spellBar: this.spellBar,
      bagItems: this.bagItems,
      gold: this.gold,
      silver: this.silver,
      copper: this.copper,
      skillsList: this.skillsList
    };
    
    // persistAll salva localmente e avvia la sincronizzazione lato servizio condiviso
    this.sharedService.persistAll(this.campaignId, data);
  }

  // --- UI logic ---

  openBag() {
    this.showBag = true;
  }

  closeBag() {
    this.showBag = false;
    this.persistAll();
  }

  updateBag(items: BagItem[]) {
    this.bagItems = [...items];
    this.persistAll();
  }

  openCoins() {
    this.showCoins = true;
  }

  closeCoins() {
    this.showCoins = false;
    this.persistAll();
  }

  updateCoins({ gold, silver, copper }: { gold: number; silver: number; copper: number }) {
    this.gold = gold;
    this.silver = silver;
    this.copper = copper;
    this.persistAll();
  }

  setEditingHpCurrent(edit: boolean) {
    this.editingHpCurrent = edit;
  }
  setEditingHpMax(edit: boolean) {
    this.editingHpMax = edit;
  }
  onHpCurrentChange(event: any) {
    const val = parseInt(event.target.value, 10);
    if (!isNaN(val) && val >= 0 && val <= this.hpMax) {
      this.hpCurrent = val;
    }
    this.editingHpCurrent = false;
    this.persistAll();
  }
  onHpMaxChange(event: any) {
    const val = parseInt(event.target.value, 10);
    if (!isNaN(val) && val > 0) {
      this.hpMax = val;
      if (this.hpCurrent > this.hpMax) this.hpCurrent = this.hpMax;
    }
    this.editingHpMax = false;
    this.persistAll();
  }

  openSessionInfo() {
    this.showSessionInfo = true;
  }
  closeSessionInfo() {
    this.showSessionInfo = false;
  }

  openEberronMap() {
    this.showEberronMap = true;
  }
  closeEberronMap() {
    this.showEberronMap = false;
  }

  openSpells() {
    this.showSpells = true;
  }
  closeSpells() {
    this.showSpells = false;
    this.persistAll();
  }

  openTalents() {
    this.showTalents = true;
  }
  closeTalents() {
    this.showTalents = false;
    this.persistAll();
  }

  openCharacter() {
    this.showCharacter = true;
  }
  closeCharacter() {
    this.showCharacter = false;
    this.persistAll();
  }

  openSkills() {
    this.showSkills = true;
  }
  closeSkills() {
    this.showSkills = false;
    this.persistAll();
  }

  assignSpellToBar({ spell, slot }: { spell: Spell, slot: number }) {
    this.spellBar[slot] = spell;
    this.persistAll();
  }

  // Drag & drop handlers for spell bar (from spellbook modal)
  onDropOnBar(slot: number, event: any) {
    event.preventDefault();
    const spellId = event.dataTransfer?.getData('spellId');
    const spell = this.allSpells.find(a => a.id === spellId);
    if (spell) {
      this.spellBar[slot] = spell;
      this.persistAll();
    }
  }
  allowDrop(event: any) {
    event.preventDefault();
  }

  // --- Listen to online/offline events to trigger sync ---
  @HostListener('window:online')
  onOnline() {
    this.persistAll();
  }
}

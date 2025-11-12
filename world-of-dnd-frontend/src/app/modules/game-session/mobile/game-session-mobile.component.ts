import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BagItem } from '../bag/bag-modal.component';
import { Talent } from '../talents/talents-modal.component';
import { LocalGameSessionData } from '../game-session-storage.service';
import { GameSessionSharedService } from '../game-session-shared.service';
import { SkillRow } from '../skills/skills-modal.component';
import { Spell } from '../spells/spells-modal.component';

@Component({
  selector: 'app-game-session-mobile',
  templateUrl: './game-session-mobile.component.html',
  styleUrl: './game-session-mobile.component.scss'
})
export class GameSessionMobileComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  campaignId: string | null = null;

  showSection: 'character' | 'bag' | 'coins' | 'spells' | 'talents' | 'skills' = 'character';
  characterTab: 'dati' | 'caratteristiche' | 'note' = 'dati';

  bagItems: BagItem[] = [];
  gold = 0;
  silver = 0;
  copper = 0;

  hpCurrent = 0;
  hpMax = 0;

  dndVersion = '3.5';

  allSpells: Spell[] = [];
  allTalents: Talent[] = [];
  spellBar: (Spell | null)[] = Array(10).fill(null);
  isLoading = false;

  characterSheet: any = {};
  skillsList: SkillRow[] = [];

  constructor(
    private route: ActivatedRoute,
    private shared: GameSessionSharedService
  ) {}

  ngOnInit() {
    this.campaignId = this.route.snapshot.paramMap.get('id');
    this.loadLocalData();
    this.loadGameData();
    
    // Subscribe to loading state
    this.shared.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.isLoading = loading);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Carica skills, spells e talents dal backend
  loadGameData() {
    // Carica skills
    this.shared.loadSkillsFromServer()
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
    this.shared.loadSpellsFromServer()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (spells) => this.allSpells = spells,
        error: (err) => console.error('Errore caricamento spells:', err)
      });

    // Carica talents
    this.shared.loadTalentsFromServer()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (talents) => this.allTalents = talents,
        error: (err) => console.error('Errore caricamento talents:', err)
      });
  }

  addBagItem() {
    this.bagItems.push({ name: '', quantity: 1 });
    this.persistAll();
  }

  removeBagItem(index: number) {
    this.bagItems.splice(index, 1);
    this.persistAll();
  }

  loadLocalData() {
    if (!this.campaignId) return;
    const data = this.shared.loadLocalData(this.campaignId);
    if (data) {
      if (data.character) this.characterSheet = data.character;
      if (data.spellBar) this.spellBar = data.spellBar;
      if (data.bagItems) this.bagItems = data.bagItems;
      if (typeof data.gold === 'number') this.gold = data.gold;
      if (typeof data.silver === 'number') this.silver = data.silver;
      if (typeof data.copper === 'number') this.copper = data.copper;
      if (Array.isArray(data.skillsList)) this.skillsList = data.skillsList;
    }
  }

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
    this.shared.persistAll(this.campaignId, data);
    this.shared.syncToServer(this.campaignId, data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => console.log('Dati sincronizzati con successo'),
        error: (err) => console.error('Errore sincronizzazione:', err)
      });
  }

  @HostListener('window:online')
  onOnline() {
    this.persistAll();
  }
}

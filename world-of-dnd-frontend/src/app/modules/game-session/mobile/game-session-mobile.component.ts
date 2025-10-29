import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
export class GameSessionMobileComponent implements OnInit {
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

  allSpells: Spell[] = GameSessionSharedService.ALL_SPELLS;
  allTalents: Talent[] = GameSessionSharedService.ALL_TALENTS;
  spellBar: (Spell | null)[] = Array(10).fill(null);

  characterSheet: any = {};
  skillsList: SkillRow[] = GameSessionSharedService.DEFAULT_SKILLS.map(s => ({ ...s }));

  constructor(
    private route: ActivatedRoute,
    private shared: GameSessionSharedService
  ) {}

  ngOnInit() {
    this.campaignId = this.route.snapshot.paramMap.get('id');
    this.loadLocalData();
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
  }

  @HostListener('window:online')
  onOnline() {
    this.shared.stubSyncToServer();
  }
}

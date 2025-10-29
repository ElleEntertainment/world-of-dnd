import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';

interface CharacterClass {
  name: string;
  level: number;
}

interface CharacterStat {
  score: number;
  modifier: number;
  tempScore?: number;
  tempModifier?: number;
}

interface SavingThrow {
  base: number;
  tempModifier: number;
  conditionModifiers: string[];
}

interface AttackRow {
  attack: string;
  bonus: string;
  damage: string;
  crit: string;
  range: string;
  type: string;
  weight: string;
  notes: string;
}

interface ArmorRow {
  item: string;
  type?: string;
  caBonus: string;
  maxDex?: string;
  checkPenalty?: string;
  spellFail?: string;
  speed?: string;
  weight: string;
  special: string;
}

interface EquipmentRow {
  item: string;
  note: string;
}

@Component({
  selector: 'app-character-modal',
  templateUrl: './character-modal.component.html'
})
export class CharacterModalComponent implements OnInit, OnDestroy {
  @Input() character: any = {};
  @Output() close = new EventEmitter<void>();
  @Output() characterChange = new EventEmitter<any>();

  // Tabs: 'info', 'combat', 'stats', 'saves', 'attacks', 'armor', 'equipment', 'languages'
  tab: string = 'info';

  // Info
  characterName = '';
  playerName = '';
  classes: CharacterClass[] = [{ name: '', level: 1 }];
  race = '';
  alignment = '';
  deity = '';
  size = '';
  age = '';
  gender = '';
  height = '';
  weight = '';
  eyes = '';
  hair = '';
  skin = '';

  // Combat
  speed = '';
  dr = '';
  ca = '';
  caTouch = '';
  caFlat = '';
  initiative = '';

  // Stats
  stats: { [key: string]: CharacterStat } = {
    forza: { score: 10, modifier: 0, tempScore: 0, tempModifier: 0 },
    destrezza: { score: 10, modifier: 0, tempScore: 0, tempModifier: 0 },
    costituzione: { score: 10, modifier: 0, tempScore: 0, tempModifier: 0 },
    intelligenza: { score: 10, modifier: 0, tempScore: 0, tempModifier: 0 },
    saggezza: { score: 10, modifier: 0, tempScore: 0, tempModifier: 0 },
    carisma: { score: 10, modifier: 0, tempScore: 0, tempModifier: 0 }
  };

  // Saving Throws
  saves: { [key: string]: SavingThrow } = {
    tempra: { base: 0, tempModifier: 0, conditionModifiers: [] },
    riflessi: { base: 0, tempModifier: 0, conditionModifiers: [] },
    volonta: { base: 0, tempModifier: 0, conditionModifiers: [] }
  };

  // BAB, SR, Grapple
  bab = '';
  sr = '';
  grapple = '';

  // Attacks
  attacks: AttackRow[] = [];

  // Armor/Protection
  armors: ArmorRow[] = [];
  shields: ArmorRow[] = [];
  protections: ArmorRow[] = [];

  // Other equipment
  equipments: EquipmentRow[] = [];

  // Languages
  languages: string[] = [];

  // Tab switching
  setTab(tab: string) {
    this.tab = tab;
  }

  // Class management
  addClass() {
    this.classes.push({ name: '', level: 1 });
    this.emitChange();
  }
  removeClass(idx: number) {
    if (this.classes.length > 1) this.classes.splice(idx, 1);
    this.emitChange();
  }

  // Attacks management
  addAttack() {
    this.attacks.push({ attack: '', bonus: '', damage: '', crit: '', range: '', type: '', weight: '', notes: '' });
    this.emitChange();
  }
  removeAttack(idx: number) {
    this.attacks.splice(idx, 1);
    this.emitChange();
  }

  // Armor management
  addArmor() {
    this.armors.push({ item: '', type: '', caBonus: '', maxDex: '', checkPenalty: '', spellFail: '', speed: '', weight: '', special: '' });
    this.emitChange();
  }
  removeArmor(idx: number) {
    this.armors.splice(idx, 1);
    this.emitChange();
  }
  addShield() {
    this.shields.push({ item: '', caBonus: '', weight: '', checkPenalty: '', spellFail: '', special: '' });
    this.emitChange();
  }
  removeShield(idx: number) {
    this.shields.splice(idx, 1);
    this.emitChange();
  }
  addProtection() {
    this.protections.push({ item: '', caBonus: '', weight: '', special: '' });
    this.emitChange();
  }
  removeProtection(idx: number) {
    this.protections.splice(idx, 1);
    this.emitChange();
  }

  // Equipment management
  addEquipment() {
    this.equipments.push({ item: '', note: '' });
    this.emitChange();
  }
  removeEquipment(idx: number) {
    this.equipments.splice(idx, 1);
    this.emitChange();
  }

  // Languages management
  addLanguage() {
    this.languages.push('');
    this.emitChange();
  }
  removeLanguage(idx: number) {
    this.languages.splice(idx, 1);
    this.emitChange();
  }

  // Emit all data up to parent
  emitChange() {
    this.characterChange.emit(this.getCharacterData());
  }

  getCharacterData() {
    return {
      characterName: this.characterName,
      playerName: this.playerName,
      classes: this.classes,
      race: this.race,
      alignment: this.alignment,
      deity: this.deity,
      size: this.size,
      age: this.age,
      gender: this.gender,
      height: this.height,
      weight: this.weight,
      eyes: this.eyes,
      hair: this.hair,
      skin: this.skin,
      speed: this.speed,
      dr: this.dr,
      ca: this.ca,
      caTouch: this.caTouch,
      caFlat: this.caFlat,
      initiative: this.initiative,
      stats: this.stats,
      saves: this.saves,
      bab: this.bab,
      sr: this.sr,
      grapple: this.grapple,
      attacks: this.attacks,
      armors: this.armors,
      shields: this.shields,
      protections: this.protections,
      equipments: this.equipments,
      languages: this.languages
    };
  }

  ngOnInit() {
    if (this.character) {
      this.loadFromInput(this.character);
    }
  }

  ngOnDestroy() {
    this.emitChange();
  }

  loadFromInput(data: any) {
    if (!data) return;
    this.characterName = data.characterName || '';
    this.playerName = data.playerName || '';
    this.classes = data.classes || [{ name: '', level: 1 }];
    this.race = data.race || '';
    this.alignment = data.alignment || '';
    this.deity = data.deity || '';
    this.size = data.size || '';
    this.age = data.age || '';
    this.gender = data.gender || '';
    this.height = data.height || '';
    this.weight = data.weight || '';
    this.eyes = data.eyes || '';
    this.hair = data.hair || '';
    this.skin = data.skin || '';
    this.speed = data.speed || '';
    this.dr = data.dr || '';
    this.ca = data.ca || '';
    this.caTouch = data.caTouch || '';
    this.caFlat = data.caFlat || '';
    this.initiative = data.initiative || '';
    this.stats = data.stats || {
      forza: { score: 10, modifier: 0, tempScore: 0, tempModifier: 0 },
      destrezza: { score: 10, modifier: 0, tempScore: 0, tempModifier: 0 },
      costituzione: { score: 10, modifier: 0, tempScore: 0, tempModifier: 0 },
      intelligenza: { score: 10, modifier: 0, tempScore: 0, tempModifier: 0 },
      saggezza: { score: 10, modifier: 0, tempScore: 0, tempModifier: 0 },
      carisma: { score: 10, modifier: 0, tempScore: 0, tempModifier: 0 }
    };
    this.saves = data.saves || {
      tempra: { base: 0, tempModifier: 0, conditionModifiers: [] },
      riflessi: { base: 0, tempModifier: 0, conditionModifiers: [] },
      volonta: { base: 0, tempModifier: 0, conditionModifiers: [] }
    };
    this.bab = data.bab || '';
    this.sr = data.sr || '';
    this.grapple = data.grapple || '';
    this.attacks = data.attacks || [];
    this.armors = data.armors || [];
    this.shields = data.shields || [];
    this.protections = data.protections || [];
    this.equipments = data.equipments || [];
    this.languages = data.languages || [];
  }
}

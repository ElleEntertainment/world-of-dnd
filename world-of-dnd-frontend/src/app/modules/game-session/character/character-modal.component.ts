import { Component, EventEmitter, Input, Output } from '@angular/core';

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
export class CharacterModalComponent {
  @Input() character: any = {};
  @Output() close = new EventEmitter<void>();

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
  }
  removeClass(idx: number) {
    if (this.classes.length > 1) this.classes.splice(idx, 1);
  }

  // Attacks management
  addAttack() {
    this.attacks.push({ attack: '', bonus: '', damage: '', crit: '', range: '', type: '', weight: '', notes: '' });
  }
  removeAttack(idx: number) {
    this.attacks.splice(idx, 1);
  }

  // Armor management
  addArmor() {
    this.armors.push({ item: '', type: '', caBonus: '', maxDex: '', checkPenalty: '', spellFail: '', speed: '', weight: '', special: '' });
  }
  removeArmor(idx: number) {
    this.armors.splice(idx, 1);
  }
  addShield() {
    this.shields.push({ item: '', caBonus: '', weight: '', checkPenalty: '', spellFail: '', special: '' });
  }
  removeShield(idx: number) {
    this.shields.splice(idx, 1);
  }
  addProtection() {
    this.protections.push({ item: '', caBonus: '', weight: '', special: '' });
  }
  removeProtection(idx: number) {
    this.protections.splice(idx, 1);
  }

  // Equipment management
  addEquipment() {
    this.equipments.push({ item: '', note: '' });
  }
  removeEquipment(idx: number) {
    this.equipments.splice(idx, 1);
  }

  // Languages management
  addLanguage() {
    this.languages.push('');
  }
  removeLanguage(idx: number) {
    this.languages.splice(idx, 1);
  }
}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BagItem } from './bag/bag-modal.component';
import { Ability } from './abilities/abilities-modal.component';
import { Talent } from './talents/talents-modal.component';

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
export class GameSessionComponent implements OnInit {
  campaignId: string | null = null;
  backgroundUrl = '/img/bg/volcano_bg.jpg';

  showBag = false;
  showCoins = false;
  showSessionInfo = false;
  showAbilities = false;
  showTalents = false;
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

  // Abilità mock senza icone
  allAbilities: Ability[] = [
    { id: 'fireball', name: 'Palla di Fuoco', description: 'Lancia una palla di fuoco che infligge 8d6 danni da fuoco.', icon: '' },
    { id: 'heal', name: 'Cura Ferite', description: 'Cura 2d8+3 punti ferita a un bersaglio.', icon: '' },
    { id: 'ice', name: 'Dardo di Ghiaccio', description: 'Colpisce il nemico con un dardo gelido.', icon: '' },
    { id: 'shield', name: 'Scudo Magico', description: 'Aumenta la CA di +4 per 1 minuto.', icon: '' },
    { id: 'lightning', name: 'Fulmine', description: 'Infligge 4d8 danni da elettricità a una linea.', icon: '' },
    { id: 'stealth', name: 'Furtività', description: 'Diventi invisibile per 1 turno.', icon: '' },
    { id: 'bless', name: 'Benedizione', description: 'Dona +1 ai tiri per colpire e ai TS.', icon: '' },
    { id: 'curse', name: 'Maledizione', description: 'Riduce le caratteristiche del bersaglio.', icon: '' },
    { id: 'haste', name: 'Velocità', description: 'Raddoppia la velocità per 1 minuto.', icon: '' },
    { id: 'slow', name: 'Lentezza', description: 'Dimezza la velocità del bersaglio.', icon: '' },
    { id: 'fear', name: 'Terrore', description: 'Il bersaglio fugge per 2 turni.', icon: '' },
    { id: 'sleep', name: 'Sonno', description: 'Addormenta fino a 4 creature.', icon: '' },
    { id: 'poison', name: 'Veleno', description: 'Infligge danni nel tempo.', icon: '' },
    { id: 'cleanse', name: 'Purificazione', description: 'Rimuove effetti negativi.', icon: '' },
    { id: 'summon', name: 'Evoca Famiglio', description: 'Evoca un piccolo aiutante.', icon: '' },
    { id: 'teleport', name: 'Teletrasporto', description: 'Ti sposti istantaneamente.', icon: '' },
    // ...altre abilità per test paginazione
  ];

  // Talenti mock senza icone
  allTalents: Talent[] = [
    { id: 'power-attack', name: 'Attacco Poderoso', description: 'Puoi sacrificare precisione per infliggere più danni.', icon: '' },
    { id: 'cleave', name: 'Colpo a Catena', description: 'Se abbatti un nemico, puoi attaccarne subito un altro.', icon: '' },
    { id: 'dodge', name: 'Schivare', description: 'Ottieni un bonus alla CA contro un avversario scelto.', icon: '' },
    { id: 'toughness', name: 'Tempra', description: 'Ottieni punti ferita extra.', icon: '' },
    { id: 'weapon-focus', name: 'Specializzazione in Arma', description: 'Bonus ai tiri per colpire con un\'arma scelta.', icon: '' },
    { id: 'improved-initiative', name: 'Iniziativa Migliorata', description: 'Bonus +4 all\'iniziativa.', icon: '' },
    // ...altri talenti
  ];

  abilityBar: (Ability | null)[] = Array(10).fill(null);

  hoveredAbility: Ability | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.campaignId = this.route.snapshot.paramMap.get('id');
    // In futuro: recupera la versione dal backend
    // this.dndVersion = ...;
  }

  openBag() {
    this.showBag = true;
  }

  closeBag() {
    this.showBag = false;
  }

  updateBag(items: BagItem[]) {
    this.bagItems = [...items];
  }

  openCoins() {
    this.showCoins = true;
  }

  closeCoins() {
    this.showCoins = false;
  }

  updateCoins({ gold, silver, copper }: { gold: number; silver: number; copper: number }) {
    this.gold = gold;
    this.silver = silver;
    this.copper = copper;
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
  }
  onHpMaxChange(event: any) {
    const val = parseInt(event.target.value, 10);
    if (!isNaN(val) && val > 0) {
      this.hpMax = val;
      if (this.hpCurrent > this.hpMax) this.hpCurrent = this.hpMax;
    }
    this.editingHpMax = false;
  }

  openSessionInfo() {
    this.showSessionInfo = true;
  }
  closeSessionInfo() {
    this.showSessionInfo = false;
  }

  openAbilities() {
    this.showAbilities = true;
  }
  closeAbilities() {
    this.showAbilities = false;
  }

  openTalents() {
    this.showTalents = true;
  }
  closeTalents() {
    this.showTalents = false;
  }

  assignAbilityToBar({ ability, slot }: { ability: Ability, slot: number }) {
    this.abilityBar[slot] = ability;
  }

  // Drag & drop handlers for ability bar (from spellbook modal)
  onDropOnBar(slot: number, event: any) {
    event.preventDefault();
    const abilityId = event.dataTransfer?.getData('abilityId');
    const ability = this.allAbilities.find(a => a.id === abilityId);
    if (ability) {
      this.abilityBar[slot] = ability;
    }
  }
  allowDrop(event: any) {
    event.preventDefault();
  }
}

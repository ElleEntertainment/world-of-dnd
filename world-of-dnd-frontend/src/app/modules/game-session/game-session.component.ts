/* --- AGGIUNTA SOLO LA LOGICA PER LE SKILL, SENZA TOCCARE ALTRO --- */
import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BagItem } from './bag/bag-modal.component';
import { Talent } from './talents/talents-modal.component';
import { GameSessionStorageService, LocalGameSessionData } from './game-session-storage.service';
import { SkillRow } from './skills/skills-modal.component';
import { Spell } from './spells/spells-modal.component';

interface PlayerInfo {
  name: string;
  character: string;
  alive: boolean;
}

const DEFAULT_SKILLS: SkillRow[] = [
  { name: 'Acrobazia', keyAbility: 'DES', keyAbilityShort: 'destrezza', checked: false, checked2: false, ranks: 0, miscMod: 0, total: 0 },
  { name: 'Addestrare Animali', keyAbility: 'CAR', keyAbilityShort: 'carisma', checked: false, checked2: false, ranks: 0, miscMod: 0, total: 0 },
  { name: 'Artigianato ()', keyAbility: 'INT', keyAbilityShort: 'intelligenza', checked: false, checked2: false, ranks: 0, miscMod: 0, total: 0 },
  { name: 'Artigianato ()', keyAbility: 'INT', keyAbilityShort: 'intelligenza', checked: false, checked2: false, ranks: 0, miscMod: 0, total: 0 },
  { name: 'Artigianato ()', keyAbility: 'INT', keyAbilityShort: 'intelligenza', checked: false, checked2: false, ranks: 0, miscMod: 0, total: 0 },
  { name: 'Artista della Fuga', keyAbility: 'DES', keyAbilityShort: 'destrezza', checked: false, checked2: false, ranks: 0, miscMod: 0, total: 0 },
  { name: 'Ascoltare', keyAbility: 'SAG', keyAbilityShort: 'saggezza', checked: false, checked2: false, ranks: 0, miscMod: 0, total: 0 },
  { name: 'Camuffare', keyAbility: 'CAR', keyAbilityShort: 'carisma', checked: false, checked2: false, ranks: 0, miscMod: 0, total: 0 },
  { name: 'Cavalcare', keyAbility: 'DES', keyAbilityShort: 'destrezza', checked: false, checked2: false, ranks: 0, miscMod: 0, total: 0 },
  { name: 'Cercare', keyAbility: 'INT', keyAbilityShort: 'intelligenza', checked: false, checked2: false, ranks: 0, miscMod: 0, total: 0 },
  { name: 'Concentrazione', keyAbility: 'COS', keyAbilityShort: 'costituzione', checked: false, checked2: false, ranks: 0, miscMod: 0, total: 0 },
  { name: 'Conoscenze ()', keyAbility: 'INT', keyAbilityShort: 'intelligenza', checked: false, checked2: false, ranks: 0, miscMod: 0, total: 0 },
  { name: 'Conoscenze ()', keyAbility: 'INT', keyAbilityShort: 'intelligenza', checked: false, checked2: false, ranks: 0, miscMod: 0, total: 0 },
  { name: 'Conoscenze ()', keyAbility: 'INT', keyAbilityShort: 'intelligenza', checked: false, checked2: false, ranks: 0, miscMod: 0, total: 0 },
  { name: 'Conoscenze ()', keyAbility: 'INT', keyAbilityShort: 'intelligenza', checked: false, checked2: false, ranks: 0, miscMod: 0, total: 0 },
  { name: 'Conoscenze ()', keyAbility: 'INT', keyAbilityShort: 'intelligenza', checked: false, checked2: false, ranks: 0, miscMod: 0, total: 0 },
  { name: 'Decifrare Scritture', keyAbility: 'INT', keyAbilityShort: 'intelligenza', checked: false, checked2: false, ranks: 0, miscMod: 0, total: 0 },
  { name: 'Diplomazia', keyAbility: 'CAR', keyAbilityShort: 'carisma', checked: false, checked2: false, ranks: 0, miscMod: 0, total: 0 },
  { name: 'Disattivare Congegni', keyAbility: 'INT', keyAbilityShort: 'intelligenza', checked: false, checked2: false, ranks: 0, miscMod: 0, total: 0 },
  { name: 'Equilibrio', keyAbility: 'DES', keyAbilityShort: 'destrezza', checked: false, checked2: false, ranks: 0, miscMod: 0, total: 0 },
  { name: 'Falsificare', keyAbility: 'INT', keyAbilityShort: 'intelligenza', checked: false, checked2: false, ranks: 0, miscMod: 0, total: 0 },
  { name: 'Guarire', keyAbility: 'SAG', keyAbilityShort: 'saggezza', checked: false, checked2: false, ranks: 0, miscMod: 0, total: 0 },
  { name: 'Intimidire', keyAbility: 'CAR', keyAbilityShort: 'carisma', checked: false, checked2: false, ranks: 0, miscMod: 0, total: 0 },
  { name: 'Intrattenere ()', keyAbility: 'CAR', keyAbilityShort: 'carisma', checked: false, checked2: false, ranks: 0, miscMod: 0, total: 0 },
  { name: 'Intrattenere ()', keyAbility: 'CAR', keyAbilityShort: 'carisma', checked: false, checked2: false, ranks: 0, miscMod: 0, total: 0 },
  { name: 'Intrattenere ()', keyAbility: 'CAR', keyAbilityShort: 'carisma', checked: false, checked2: false, ranks: 0, miscMod: 0, total: 0 },
  { name: 'Muoversi Silenziosamente', keyAbility: 'DES', keyAbilityShort: 'destrezza', checked: false, checked2: false, ranks: 0, miscMod: 0, total: 0 },
  { name: 'Nascondersi', keyAbility: 'DES', keyAbilityShort: 'destrezza', checked: false, checked2: false, ranks: 0, miscMod: 0, total: 0 },
  { name: 'Nuotare', keyAbility: 'FOR', keyAbilityShort: 'forza', checked: false, checked2: false, ranks: 0, miscMod: 0, total: 0 },
  { name: 'Osservare', keyAbility: 'SAG', keyAbilityShort: 'saggezza', checked: false, checked2: false, ranks: 0, miscMod: 0, total: 0 },
  { name: 'Percepire Intenzioni', keyAbility: 'SAG', keyAbilityShort: 'saggezza', checked: false, checked2: false, ranks: 0, miscMod: 0, total: 0 },
  { name: 'Professione ()', keyAbility: 'SAG', keyAbilityShort: 'saggezza', checked: false, checked2: false, ranks: 0, miscMod: 0, total: 0 },
  { name: 'Professione ()', keyAbility: 'SAG', keyAbilityShort: 'saggezza', checked: false, checked2: false, ranks: 0, miscMod: 0, total: 0 },
  { name: 'Raccogliere Informazioni', keyAbility: 'CAR', keyAbilityShort: 'carisma', checked: false, checked2: false, ranks: 0, miscMod: 0, total: 0 },
  { name: 'Raggirare', keyAbility: 'CAR', keyAbilityShort: 'carisma', checked: false, checked2: false, ranks: 0, miscMod: 0, total: 0 },
  { name: 'Rapidità di Mano', keyAbility: 'DES', keyAbilityShort: 'destrezza', checked: false, checked2: false, ranks: 0, miscMod: 0, total: 0 },
  { name: 'Saltare', keyAbility: 'FOR', keyAbilityShort: 'forza', checked: false, checked2: false, ranks: 0, miscMod: 0, total: 0 },
  { name: 'Sapienza Magica', keyAbility: 'INT', keyAbilityShort: 'intelligenza', checked: false, checked2: false, ranks: 0, miscMod: 0, total: 0 },
  { name: 'Scalare', keyAbility: 'FOR', keyAbilityShort: 'forza', checked: false, checked2: false, ranks: 0, miscMod: 0, total: 0 },
  { name: 'Scassinare Serrature', keyAbility: 'DES', keyAbilityShort: 'destrezza', checked: false, checked2: false, ranks: 0, miscMod: 0, total: 0 },
  { name: 'Sopravvivenza', keyAbility: 'SAG', keyAbilityShort: 'saggezza', checked: false, checked2: false, ranks: 0, miscMod: 0, total: 0 },
  { name: 'Utilizzare Cordicelle', keyAbility: 'DES', keyAbilityShort: 'destrezza', checked: false, checked2: false, ranks: 0, miscMod: 0, total: 0 },
  { name: 'Utilizzare Oggetti Magici', keyAbility: 'CAR', keyAbilityShort: 'carisma', checked: false, checked2: false, ranks: 0, miscMod: 0, total: 0 },
  { name: 'Valutare', keyAbility: 'INT', keyAbilityShort: 'intelligenza', checked: false, checked2: false, ranks: 0, miscMod: 0, total: 0 }
];

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

  // Abilità mock senza icone
  allSpells: Spell[] = [
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

  spellBar: (Spell | null)[] = Array(10).fill(null);

  hoveredSpell: Spell | null = null;

  // Character modal state
  characterSheet: any = {};

  // Skills modal state
  skillsList: SkillRow[] = DEFAULT_SKILLS.map(s => ({ ...s }));

  constructor(
    private route: ActivatedRoute,
    private storage: GameSessionStorageService
  ) {}

  ngOnInit() {
    this.campaignId = this.route.snapshot.paramMap.get('id');
    this.loadLocalData();
    // In futuro: recupera la versione dal backend
    // this.dndVersion = ...;
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
    this.saveLocalData();
    this.stubSyncToServer();
  }

  // --- STUB: sync to server when online ---
  stubSyncToServer() {
    // Qui in futuro chiamerai le API per sincronizzare i dati
    // Se la sync va a buon fine:
    // this.clearLocalData();
    // Per ora è uno stub
    // console.log('Sync to server (stub)');
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
    this.stubSyncToServer();
  }
}

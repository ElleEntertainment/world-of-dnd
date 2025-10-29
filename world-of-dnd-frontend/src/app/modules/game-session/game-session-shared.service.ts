import { Injectable } from '@angular/core';
import { GameSessionStorageService, LocalGameSessionData } from './game-session-storage.service';
import { SkillRow } from './skills/skills-modal.component';
import { Spell } from './spells/spells-modal.component';
import { Talent } from './talents/talents-modal.component';

@Injectable({
  providedIn: 'root'
})
export class GameSessionSharedService {
  static readonly DEFAULT_SKILLS: SkillRow[] = [
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

  static readonly ALL_SPELLS: Spell[] = [
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
    { id: 'teleport', name: 'Teletrasporto', description: 'Ti sposti istantaneamente.', icon: '' }
    // ...altre abilità per test paginazione
  ];

  static readonly ALL_TALENTS: Talent[] = [
    { id: 'power-attack', name: 'Attacco Poderoso', description: 'Puoi sacrificare precisione per infliggere più danni.', icon: '' },
    { id: 'cleave', name: 'Colpo a Catena', description: 'Se abbatti un nemico, puoi attaccarne subito un altro.', icon: '' },
    { id: 'dodge', name: 'Schivare', description: 'Ottieni un bonus alla CA contro un avversario scelto.', icon: '' },
    { id: 'toughness', name: 'Tempra', description: 'Ottieni punti ferita extra.', icon: '' },
    { id: 'weapon-focus', name: 'Specializzazione in Arma', description: 'Bonus ai tiri per colpire con un\'arma scelta.', icon: '' },
    { id: 'improved-initiative', name: 'Iniziativa Migliorata', description: 'Bonus +4 all\'iniziativa.', icon: '' }
    // ...altri talenti
  ];

  constructor(private storage: GameSessionStorageService) {}

  saveLocalData(campaignId: string, data: LocalGameSessionData) {
    if (!campaignId) return;
    try {
      this.storage.save(campaignId, data);
    } catch (e) {
      console.error('Errore salvataggio localStorage:', e);
    }
  }

  loadLocalData(campaignId: string): LocalGameSessionData | null {
    if (!campaignId) return null;
    try {
      return this.storage.load(campaignId);
    } catch (e) {
      console.error('Errore caricamento localStorage:', e);
      return null;
    }
  }

  clearLocalData(campaignId: string) {
    if (!campaignId) return;
    try {
      this.storage.remove(campaignId);
    } catch (e) {
      console.error('Errore rimozione localStorage:', e);
    }
  }

  hasLocalData(campaignId: string): boolean {
    if (!campaignId) return false;
    try {
      return this.storage.hasLocal(campaignId);
    } catch (e) {
      console.error('Errore verifica localStorage:', e);
      return false;
    }
  }

  persistAll(campaignId: string, data: LocalGameSessionData) {
    this.saveLocalData(campaignId, data);
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
}

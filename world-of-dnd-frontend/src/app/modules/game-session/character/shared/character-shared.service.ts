import { Injectable } from '@angular/core';

export interface CharacterSheet {
  name?: string;
  class?: string;
  race?: string;
  level?: number;
  forza?: number;
  destrezza?: number;
  costituzione?: number;
  intelligenza?: number;
  saggezza?: number;
  carisma?: number;
  allineamento?: string;
  esperienza?: number;
  punti_ferita?: number;
  punti_ferita_max?: number;
  iniziativa?: number;
  velocita?: number;
  classe_armatura?: number;
  classe_armatura_temp?: number;
  ts_tempra?: number;
  ts_riflessi?: number;
  ts_volonta?: number;
  attacchi?: string;
  armi?: string;
  armature?: string;
  scudi?: string;
  equipaggiamento?: string;
  denaro?: string;
  note?: string;
  background?: string;
  eta?: number;
  sesso?: string;
  altezza?: string;
  peso?: string;
  occhi?: string;
  capelli?: string;
  pelle?: string;
  divinità?: string;
  // aggiungi qui altri campi che servono per la tua scheda
}

@Injectable({
  providedIn: 'root'
})
export class CharacterSharedService {
  // Qui puoi aggiungere metodi di logica condivisa per la scheda personaggio
}

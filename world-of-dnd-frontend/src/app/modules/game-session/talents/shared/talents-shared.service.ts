import { Injectable } from '@angular/core';

export interface Talent {
  id: string;
  name: string;
  description: string;
  icon: string;
}

@Injectable({
  providedIn: 'root'
})
export class TalentsSharedService {
  // Qui puoi aggiungere metodi di logica condivisa per i talenti
}

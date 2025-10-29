import { Injectable } from '@angular/core';

export interface Spell {
  id: string;
  name: string;
  description: string;
  icon: string;
}

@Injectable({
  providedIn: 'root'
})
export class SpellsSharedService {
  assignSpellToBar(spellBar: (Spell | null)[], spell: Spell, slot: number): (Spell | null)[] {
    return spellBar.map((s, i) => i === slot ? spell : s);
  }

  removeSpellFromBar(spellBar: (Spell | null)[], slot: number): (Spell | null)[] {
    return spellBar.map((s, i) => i === slot ? null : s);
  }
}

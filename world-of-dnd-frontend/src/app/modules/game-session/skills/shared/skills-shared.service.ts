import { Injectable } from '@angular/core';

export interface SkillRow {
  name: string;
  keyAbility: string;
  keyAbilityShort: string;
  checked: boolean;
  checked2: boolean;
  ranks: number;
  miscMod: number;
  total: number;
  descrizione?: string;
  addestrata?: boolean;
  penalitaArmatura?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SkillsSharedService {
  updateTotal(skill: SkillRow, abilityMod: number): SkillRow {
    return {
      ...skill,
      total: skill.ranks + skill.miscMod + abilityMod
    };
  }

  updateAllTotals(skills: SkillRow[], abilityMods: { [key: string]: number }): SkillRow[] {
    return skills.map(skill =>
      this.updateTotal(skill, abilityMods[skill.keyAbilityShort] || 0)
    );
  }
}

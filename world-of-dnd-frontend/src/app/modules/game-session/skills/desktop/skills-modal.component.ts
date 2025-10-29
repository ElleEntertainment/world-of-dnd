import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface SkillRow {
  name: string;
  keyAbility: string;
  keyAbilityShort: string;
  customName?: string;
  checked: boolean;
  checked2: boolean;
  ranks: number;
  miscMod: number;
  total: number;
}

@Component({
  selector: 'app-skills-modal',
  templateUrl: './skills-modal.component.html'
})
export class SkillsModalComponent {
  @Input() skills: SkillRow[] = [];
  @Input() characterStats: { [key: string]: { modifier: number } } = {};
  @Output() close = new EventEmitter<void>();
  @Output() skillsChange = new EventEmitter<SkillRow[]>();

  // For skills with parenthesis, allow custom name
  isCustomName(skill: SkillRow): boolean {
    return skill.name.includes('()');
  }

  getAbilityModifier(skill: SkillRow): number {
    if (!skill.keyAbilityShort) return 0;
    const stat = this.characterStats[skill.keyAbilityShort.toLowerCase()];
    return stat ? stat.modifier : 0;
  }

  updateTotal(skill: SkillRow) {
    skill.total = this.getAbilityModifier(skill) + (skill.ranks || 0) + (skill.miscMod || 0);
    this.skillsChange.emit(this.skills);
  }

  onRanksChange(skill: SkillRow, event: any) {
    skill.ranks = parseInt(event.target.value, 10) || 0;
    this.updateTotal(skill);
  }

  onMiscModChange(skill: SkillRow, event: any) {
    skill.miscMod = parseInt(event.target.value, 10) || 0;
    this.updateTotal(skill);
  }

  onCustomNameChange(skill: SkillRow, event: any) {
    skill.customName = event.target.value;
    this.skillsChange.emit(this.skills);
  }

  onCheckChange(skill: SkillRow) {
    this.skillsChange.emit(this.skills);
  }

  onCheck2Change(skill: SkillRow) {
    this.skillsChange.emit(this.skills);
  }
}

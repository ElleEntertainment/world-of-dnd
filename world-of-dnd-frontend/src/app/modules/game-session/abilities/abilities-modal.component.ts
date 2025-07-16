import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface Ability {
  id: string;
  name: string;
  description: string;
  icon: string;
  img?: string; // può essere svg, png, jpg, jpeg
}

@Component({
  selector: 'app-abilities-modal',
  templateUrl: './abilities-modal.component.html'
})
export class AbilitiesModalComponent {
  @Input() abilities: Ability[] = [];
  @Input() abilityBar: (Ability | null)[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() assignAbility = new EventEmitter<{ ability: Ability, slot: number }>();

  page = 0;
  abilitiesPerPage = 16;
  search = '';

  get filteredAbilities() {
    if (!this.search?.trim()) return this.abilities;
    const s = this.search.trim().toLowerCase();
    return this.abilities.filter(a =>
      a.name.toLowerCase().includes(s) ||
      a.description.toLowerCase().includes(s)
    );
  }

  get sortedAbilities() {
    return [...this.filteredAbilities].sort((a, b) => a.name.localeCompare(b.name));
  }

  get pagedAbilities() {
    const start = this.page * this.abilitiesPerPage;
    return this.sortedAbilities.slice(start, start + this.abilitiesPerPage);
  }

  get totalPages() {
    return Math.ceil(this.sortedAbilities.length / this.abilitiesPerPage);
  }

  prevPage() {
    if (this.page > 0) this.page--;
  }
  nextPage() {
    if (this.page < this.totalPages - 1) this.page++;
  }

  // Drag & drop
  onDragStart(event: DragEvent, ability: Ability) {
    event.dataTransfer?.setData('abilityId', ability.id);
  }

  onDropOnBar(slot: number, event: any) {
    event.preventDefault();
    const abilityId = event.dataTransfer?.getData('abilityId');
    const ability = this.abilities.find(a => a.id === abilityId);
    if (ability) {
      this.assignAbility.emit({ ability, slot });
    }
  }

  allowDrop(event: any) {
    event.preventDefault();
  }
}

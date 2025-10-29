import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface Spell {
  id: string;
  name: string;
  description: string;
  icon: string;
  img?: string; // può essere svg, png, jpg, jpeg
}

@Component({
  selector: 'app-spells-modal',
  templateUrl: './spells-modal.component.html'
})
export class SpellsModalComponent {
  @Input() spells: Spell[] = [];
  @Input() spellBar: (Spell | null)[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() assignSpell = new EventEmitter<{ spell: Spell, slot: number }>();

  page = 0;
  spellsPerPage = 16;
  search = '';

  get filteredSpells() {
    if (!this.search?.trim()) return this.spells;
    const s = this.search.trim().toLowerCase();
    return this.spells.filter(a =>
      a.name.toLowerCase().includes(s) ||
      a.description.toLowerCase().includes(s)
    );
  }

  get sortedSpells() {
    return [...this.filteredSpells].sort((a, b) => a.name.localeCompare(b.name));
  }

  get pagedSpells() {
    const start = this.page * this.spellsPerPage;
    return this.sortedSpells.slice(start, start + this.spellsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.sortedSpells.length / this.spellsPerPage);
  }

  prevPage() {
    if (this.page > 0) this.page--;
  }
  nextPage() {
    if (this.page < this.totalPages - 1) this.page++;
  }

  // Drag & drop
  onDragStart(event: DragEvent, spell: Spell) {
    event.dataTransfer?.setData('spellId', spell.id);
  }

  onDropOnBar(slot: number, event: any) {
    event.preventDefault();
    const spellId = event.dataTransfer?.getData('spellId');
    const spell = this.spells.find(a => a.id === spellId);
    if (spell) {
      this.assignSpell.emit({ spell, slot });
    }
  }

  allowDrop(event: any) {
    event.preventDefault();
  }
}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Talent {
  id: string;
  name: string;
  description: string;
  icon: string;
  img?: string;
}

@Component({
  selector: 'app-talents-modal',
  templateUrl: './talents-modal.component.html'
})
export class TalentsModalComponent {
  @Input() talents: Talent[] = [];
  @Output() close = new EventEmitter<void>();

  page = 0;
  talentsPerPage = 16;
  search = '';

  get filteredTalents() {
    if (!this.search?.trim()) return this.talents;
    const s = this.search.trim().toLowerCase();
    return this.talents.filter(t =>
      t.name.toLowerCase().includes(s) ||
      t.description.toLowerCase().includes(s)
    );
  }

  get sortedTalents() {
    return [...this.filteredTalents].sort((a, b) => a.name.localeCompare(b.name));
  }

  get pagedTalents() {
    const start = this.page * this.talentsPerPage;
    return this.sortedTalents.slice(start, start + this.talentsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.sortedTalents.length / this.talentsPerPage);
  }

  prevPage() {
    if (this.page > 0) this.page--;
  }
  nextPage() {
    if (this.page < this.totalPages - 1) this.page++;
  }
}

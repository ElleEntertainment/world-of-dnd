import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-coins-modal',
  templateUrl: './coins-modal.component.html'
})
export class CoinsModalComponent {
  @Input() gold = 0;
  @Input() silver = 0;
  @Input() copper = 0;
  @Output() close = new EventEmitter<void>();
  @Output() update = new EventEmitter<{ gold: number; silver: number; copper: number }>();

  addGold = 0;
  addSilver = 0;
  addCopper = 0;

  confirm() {
    // Calcolo automatico: 100 rame = 1 argento, 100 argento = 1 oro
    let totalCopper = this.gold * 10000 + this.silver * 100 + this.copper;
    totalCopper += this.addGold * 10000 + this.addSilver * 100 + this.addCopper;

    const newGold = Math.floor(totalCopper / 10000);
    const newSilver = Math.floor((totalCopper % 10000) / 100);
    const newCopper = totalCopper % 100;

    this.update.emit({ gold: newGold, silver: newSilver, copper: newCopper });
    this.close.emit();
    this.addGold = 0;
    this.addSilver = 0;
    this.addCopper = 0;
  }
}
